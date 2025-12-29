// public/js/modules/router.js - Pure vanilla JS router (no build tools needed)

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.isNavigating = false;

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (!this.isNavigating) {
        this.handleRoute(window.location.pathname, e.state || {});
      }
    });

    // Intercept link clicks with data-link attribute
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute('href') || link.getAttribute('data-route');
        if (path) this.navigate(path);
      }
    });
  }

  /**
   * Register a route handler
   */
  on(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  /**
   * Navigate to a path
   */
  navigate(path, data = {}) {
    if (this.currentRoute === path) return;

    this.isNavigating = true;
    window.history.pushState(data, '', path);
    this.handleRoute(path, data);
    this.isNavigating = false;
  }

  /**
   * Handle route matching
   */
  handleRoute(path, data = {}) {
    this.currentRoute = path;

    // Try exact match first
    if (this.routes[path]) {
      this.routes[path]({}, data);
      return;
    }

    // Try pattern matching
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const params = this.matchPattern(pattern, path);
      if (params) {
        handler(params, data);
        return;
      }
    }

    // No match - redirect to home
    console.warn('No route matched:', path);
    if (path !== '/') {
      this.navigate('/');
    }
  }

  /**
   * Match URL pattern against path
   */
  matchPattern(pattern, path) {
    // Convert pattern to regex
    const paramNames = [];
    const regexPattern = pattern
      .replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (!match) return null;

    const params = {};
    paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });

    return params;
  }

  /**
   * Initialize router
   */
  init() {
    this.handleRoute(window.location.pathname);
    return this;
  }

  /**
   * Get current path
   */
  getPath() {
    return window.location.pathname;
  }

  /**
   * Get query parameters
   */
  getQuery() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  }
}

// Create singleton instance
export const router = new Router();

// Export helper function
export function navigate(path, data = {}) {
  router.navigate(path, data);
}

export default router;