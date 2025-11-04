// modules/error-handler.js - Global Error Handling
import { hideLoadingScreen } from './ui/loading.js';
import { showNotification } from './ui/notifications.js';

/**
 * Setup global error handling
 */
export function setupGlobalErrorHandling() {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  console.log('✅ Global error handlers registered');
}

/**
 * Handle global JavaScript errors
 * @param {ErrorEvent} e - Error event
 */
function handleGlobalError(e) {
  console.error('Application error:', e.error);
  hideLoadingScreen();
  showNotification('An error occurred. Please refresh the page.', 'error');
}

/**
 * Handle unhandled promise rejections
 * @param {PromiseRejectionEvent} e - Promise rejection event
 */
function handleUnhandledRejection(e) {
  console.error('Unhandled promise rejection:', e.reason);
  hideLoadingScreen();
  showNotification('An error occurred. Please try again.', 'error');
}