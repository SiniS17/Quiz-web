// modules/ui/controls.js - Floating Panel Controls Management with Visibility

/**
 * Initialize floating control panels
 */
export function initFloatingControls() {
  const controlFab = document.getElementById('control-fab');
  const sidebarFab = document.getElementById('sidebar-fab');
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');
  const closePanel = document.getElementById('close-panel');
  const leftSidebar = document.getElementById('left-sidebar');

  if (controlFab && controlPanel && panelOverlay) {
    setupControlPanelHandlers(controlFab, controlPanel, panelOverlay, closePanel, leftSidebar);
  }

  if (sidebarFab && leftSidebar) {
    setupSidebarHandlers(sidebarFab, leftSidebar, panelOverlay);
  }

  setupEscapeKeyHandler(controlPanel, leftSidebar);
  setupClickOutsideHandler();
  setupResizeHandler();
}

/**
 * Setup control panel event handlers
 */
function setupControlPanelHandlers(controlFab, controlPanel, panelOverlay, closePanel, leftSidebar) {
  controlFab.addEventListener('click', () => {
    const isOpen = controlPanel.classList.contains('open');
    if (isOpen) {
      closeControlPanel();
    } else {
      openControlPanel();
    }
  });

  closePanel.addEventListener('click', closeControlPanel);

  panelOverlay.addEventListener('click', () => {
    if (controlPanel.classList.contains('open')) {
      closeControlPanel();
    }
    if (leftSidebar && leftSidebar.classList.contains('mobile-visible')) {
      closeMobileSidebar();
    }
  });
}

/**
 * Setup sidebar event handlers (mobile only)
 */
function setupSidebarHandlers(sidebarFab, leftSidebar, panelOverlay) {
  sidebarFab.addEventListener('click', () => {
    const isVisible = leftSidebar.classList.contains('mobile-visible');
    if (isVisible) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });
}

/**
 * Setup escape key handler for closing panels
 */
function setupEscapeKeyHandler(controlPanel, leftSidebar) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (controlPanel && controlPanel.classList.contains('open')) {
        closeControlPanel();
      }
      if (leftSidebar && leftSidebar.classList.contains('mobile-visible')) {
        closeMobileSidebar();
      }
    }
  });
}

/**
 * Setup click outside to close mobile sidebar
 */
function setupClickOutsideHandler() {
  const panelOverlay = document.getElementById('panel-overlay');
  if (panelOverlay) {
    panelOverlay.addEventListener('click', () => {
      const controlPanel = document.getElementById('control-panel');
      const leftSidebar = document.getElementById('left-sidebar');

      if (controlPanel && controlPanel.classList.contains('open')) {
        closeControlPanel();
      }
      if (leftSidebar && leftSidebar.classList.contains('mobile-visible')) {
        closeMobileSidebar();
      }
    });
  }
}

/**
 * Setup resize handler to adjust sidebar visibility
 */
function setupResizeHandler() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const leftSidebar = document.getElementById('left-sidebar');
      const sidebarFab = document.getElementById('sidebar-fab');
      const mainContent = document.querySelector('.main-content');
      const isMobile = window.innerWidth <= 768;

      // Only adjust if quiz is active
      if (leftSidebar && mainContent && mainContent.classList.contains('with-sidebar')) {
        if (isMobile) {
          // Switch to mobile mode
          leftSidebar.classList.remove('mobile-visible');
          leftSidebar.style.display = 'none';
          if (sidebarFab) {
            sidebarFab.style.display = 'flex';
          }
        } else {
          // Switch to desktop mode
          leftSidebar.classList.remove('mobile-visible');
          leftSidebar.style.display = 'block';
          if (sidebarFab) {
            sidebarFab.style.display = 'none';
          }
        }
      }
    }, 250);
  });
}

/**
 * Open control panel
 */
export function openControlPanel() {
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');
  const controlFab = document.getElementById('control-fab');

  controlPanel.classList.add('open');
  controlPanel.setAttribute('aria-hidden', 'false');
  panelOverlay.classList.add('visible');
  controlFab.setAttribute('aria-expanded', 'true');

  document.body.style.overflow = 'hidden';

  const firstInput = controlPanel.querySelector('input, button');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

/**
 * Close control panel
 */
export function closeControlPanel() {
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');
  const controlFab = document.getElementById('control-fab');

  controlPanel.classList.remove('open');
  controlPanel.setAttribute('aria-hidden', 'true');
  panelOverlay.classList.remove('visible');
  controlFab.setAttribute('aria-expanded', 'false');

  document.body.style.overflow = 'auto';
  controlFab.focus();
}

/**
 * Open mobile sidebar
 */
export function openMobileSidebar() {
  const leftSidebar = document.getElementById('left-sidebar');
  const panelOverlay = document.getElementById('panel-overlay');
  const sidebarFab = document.getElementById('sidebar-fab');

  leftSidebar.classList.add('mobile-visible');
  leftSidebar.style.display = 'block';
  panelOverlay.classList.add('visible');
  sidebarFab.setAttribute('aria-expanded', 'true');

  document.body.style.overflow = 'hidden';
}

/**
 * Close mobile sidebar
 */
export function closeMobileSidebar() {
  const leftSidebar = document.getElementById('left-sidebar');
  const panelOverlay = document.getElementById('panel-overlay');
  const sidebarFab = document.getElementById('sidebar-fab');

  leftSidebar.classList.remove('mobile-visible');
  panelOverlay.classList.remove('visible');
  sidebarFab.setAttribute('aria-expanded', 'false');

  document.body.style.overflow = 'auto';
  sidebarFab.focus();
}

/**
 * Show top controls (sidebar, settings) when quiz is active
 */
export function showTopControls() {
  const leftSidebar = document.getElementById('left-sidebar');
  const mainContent = document.querySelector('.main-content');
  const quizInterface = document.querySelector('.quiz-interface');
  const controlFab = document.getElementById('control-fab');
  const sidebarFab = document.getElementById('sidebar-fab');

  // Always show control FAB
  if (controlFab) {
    controlFab.classList.add('active');
    controlFab.style.display = 'flex';
  }

  // Check if mobile view
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: Show sidebar FAB, keep sidebar hidden until FAB clicked
    if (sidebarFab) {
      sidebarFab.classList.add('active');
      sidebarFab.style.display = 'flex';
    }
    if (leftSidebar) {
      leftSidebar.style.display = 'none'; // Hidden by default on mobile
    }
  } else {
    // Desktop: Show sidebar permanently, hide sidebar FAB
    if (leftSidebar) {
      leftSidebar.style.display = 'block';
    }
    if (sidebarFab) {
      sidebarFab.classList.remove('active');
      sidebarFab.style.display = 'none'; // Hide FAB on desktop
    }
    if (mainContent) {
      mainContent.classList.add('with-sidebar');
    }
  }

  if (quizInterface) quizInterface.classList.add('with-controls');
}

/**
 * Hide top controls when returning to home
 */
export function hideTopControls() {
  const leftSidebar = document.getElementById('left-sidebar');
  const mainContent = document.querySelector('.main-content');
  const quizInterface = document.querySelector('.quiz-interface');
  const controlFab = document.getElementById('control-fab');
  const sidebarFab = document.getElementById('sidebar-fab');
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');

  // Hide and deactivate FAB buttons
  if (controlFab) {
    controlFab.classList.remove('active');
    controlFab.style.display = 'none';
  }

  if (sidebarFab) {
    sidebarFab.classList.remove('active');
    sidebarFab.style.display = 'none';
  }

  // Close any open panels
  if (controlPanel) {
    controlPanel.classList.remove('open');
    controlPanel.setAttribute('aria-hidden', 'true');
  }

  if (panelOverlay) {
    panelOverlay.classList.remove('visible');
  }

  // Hide sidebar
  if (leftSidebar) {
    leftSidebar.style.display = 'none';
    leftSidebar.classList.remove('mobile-visible');
  }

  if (mainContent) mainContent.classList.remove('with-sidebar');
  if (quizInterface) quizInterface.classList.remove('with-controls');

  // Restore body overflow
  document.body.style.overflow = 'auto';
}