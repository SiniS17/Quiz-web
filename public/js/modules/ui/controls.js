// modules/ui/controls.js - Floating Panel Controls Management

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
 * Setup sidebar event handlers
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
      if (controlPanel.classList.contains('open')) {
        closeControlPanel();
      }
      if (leftSidebar.classList.contains('mobile-visible')) {
        closeMobileSidebar();
      }
    }
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
 * Show top controls (sidebar, settings)
 */
export function showTopControls() {
  const leftSidebar = document.getElementById('left-sidebar');
  const mainContent = document.querySelector('.main-content');
  const quizInterface = document.querySelector('.quiz-interface');
  const controlFab = document.getElementById('control-fab');
  const sidebarFab = document.getElementById('sidebar-fab');

  if (controlFab) controlFab.classList.add('active');
  if (sidebarFab) sidebarFab.classList.add('active');
  if (leftSidebar) leftSidebar.style.display = 'block';
  if (mainContent) mainContent.classList.add('with-sidebar');
  if (quizInterface) quizInterface.classList.add('with-controls');
}

/**
 * Hide top controls
 */
export function hideTopControls() {
  const leftSidebar = document.getElementById('left-sidebar');
  const mainContent = document.querySelector('.main-content');
  const quizInterface = document.querySelector('.quiz-interface');
  const controlFab = document.getElementById('control-fab');
  const sidebarFab = document.getElementById('sidebar-fab');

  if (controlFab) controlFab.classList.remove('active');
  if (sidebarFab) sidebarFab.classList.remove('active');
  if (leftSidebar) leftSidebar.style.display = 'none';
  if (mainContent) mainContent.classList.remove('with-sidebar');
  if (quizInterface) quizInterface.classList.remove('with-controls');
}