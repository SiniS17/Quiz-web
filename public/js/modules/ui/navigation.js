// modules/ui/navigation.js - Quiz List and Folder Navigation with Back Support
import { fetchQuizList } from '../api.js';
import { showNotification } from './notifications.js';
import { showLoading, hideLoading, disableAllControlsDuringLoad, enableAllControlsAfterLoad } from './loading.js';
import { addFadeInAnimation } from '../utils.js';
import { clearLevelCounts, setLevelCounts, setCurrentFolder, getCurrentFolder } from '../state.js';
import { loadQuiz } from '../quiz-loader.js';

// Track current folder path
let currentFolderPath = '';

/**
 * List available quizzes and folders
 * @param {string} folder - Current folder path
 */
export function listQuizzes(folder = '') {
  if (folder && folder.target) {
    folder = '';
  }

  // Update current folder path
  currentFolderPath = folder;
  setCurrentFolder(folder);

  showLoading();
  disableAllControlsDuringLoad();
  clearLevelCounts();

  updateQuizTitle('Aviation Quiz');
  clearQuizContainer();
  hideTopControls();
  hideQuizControls(); // Hide quiz controls on home screen
  showQuizSelection();

  const quizGrid = document.getElementById('quiz-grid');
  if (!quizGrid) {
    console.error('Quiz grid container not found');
    enableAllControlsAfterLoad();
    hideLoading();
    return;
  }

  quizGrid.innerHTML = '';

  if (folder) {
    const backButton = createBackButton(folder);
    quizGrid.appendChild(backButton);
    addFadeInAnimation(backButton);
  }

  fetchQuizList(folder)
    .then(data => renderQuizList(data, quizGrid, folder))
    .catch(error => handleQuizListError(error, quizGrid));
}

/**
 * Create back button for folder navigation
 */
function createBackButton(folder) {
  const backButton = document.createElement('div');
  backButton.className = 'quiz-box back-button';
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Categories';

  // Navigate to parent folder
  backButton.onclick = () => {
    const parentFolder = folder.split('/').slice(0, -1).join('/');
    listQuizzes(parentFolder);
  };

  return backButton;
}

/**
 * Render quiz list in grid
 */
function renderQuizList(data, quizGrid, folder) {
  if (data.folders.length === 0 && data.files.length === 0) {
    quizGrid.innerHTML = '<div class="no-content">No quizzes or folders found.</div>';
    enableAllControlsAfterLoad();
    hideLoading();
    return;
  }

  data.folders.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  data.files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  data.folders.forEach((folderName) => {
    const folderBox = createFolderBox(folderName, folder);
    quizGrid.appendChild(folderBox);
    addFadeInAnimation(folderBox);
  });

  data.files.forEach((file) => {
    const quizBox = createQuizBox(file, folder);
    quizGrid.appendChild(quizBox);
    addFadeInAnimation(quizBox);
  });

  enableAllControlsAfterLoad();
  hideLoading();
}

/**
 * Handle quiz list loading error
 */
function handleQuizListError(error, quizGrid) {
  enableAllControlsAfterLoad();
  hideLoading();
  console.error('Error fetching quiz list:', error);
  showNotification('Error loading quizzes. Please try again.', 'error');
  quizGrid.innerHTML = '<div class="error-message">Error loading quizzes. Please refresh the page.</div>';
}

/**
 * Create folder box element
 */
function createFolderBox(folderName, currentFolder) {
  const folderBox = document.createElement('div');
  folderBox.className = 'quiz-box folder-select';
  folderBox.innerHTML = `
    <i class="fas fa-folder"></i>
    <h3>${folderName}</h3>
    <p>Browse quiz categories</p>
  `;

  folderBox.onclick = () => {
    // Build the full path to the nested folder
    const fullPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;

    showLoading('Opening Folder', `Loading quizzes from ${folderName}...`);
    setTimeout(() => {
      listQuizzes(fullPath);
    }, 100);
  };

  return folderBox;
}

/**
 * Create quiz box element
 */
function createQuizBox(file, folder) {
  const quizBox = document.createElement('div');
  quizBox.className = 'quiz-box';
  quizBox.innerHTML = `
    <i class="fas fa-file-text"></i>
    <h3>${file.replace('.txt', '').replace(' (-)', '')}</h3>
    <p>Click to start quiz</p>
  `;

  quizBox.onclick = () => {
    const filePath = folder ? `${folder}/${file}` : file;
    initializeQuiz(filePath, folder);
  };

  return quizBox;
}

/**
 * Initialize quiz from file
 */
function initializeQuiz(fileName, folder) {
  showLoading();
  disableAllControlsDuringLoad();

  // Store the folder path for back navigation
  setCurrentFolder(folder || '');

  hideQuizSelection();
  showQuizSettings();

  loadQuiz(fileName);
}

/**
 * Go back to current folder
 */
export function goBackToFolder() {
  const folder = getCurrentFolder();

  // Show confirmation dialog
  showConfirmDialog(
    'Return to Folder?',
    `Are you sure you want to go back to the quiz selection? Your current progress will be lost.`,
    () => {
      // User confirmed
      listQuizzes(folder);
    }
  );
}

/**
 * Go home with confirmation
 */
export function goHomeWithConfirmation() {
  // Check if there's an active quiz
  const quizContainer = document.getElementById('quiz-container');
  const hasActiveQuiz = quizContainer && quizContainer.innerHTML.trim() !== '';

  if (hasActiveQuiz) {
    // Show confirmation dialog
    showConfirmDialog(
      'Return to Home?',
      `Are you sure you want to return to the main menu? Your current progress will be lost.`,
      () => {
        // User confirmed
        listQuizzes('');
      }
    );
  } else {
    // No active quiz, just go home
    listQuizzes('');
  }
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(title, message, onConfirm) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>
        ${title}
      </h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">
        ${message}
      </p>
    </div>
    <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
      <button class="cancel-btn" style="
        padding: 0.75rem 1.5rem;
        border: 1px solid var(--border-color);
        background: white;
        color: var(--text-primary);
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Cancel</button>
      <button class="confirm-btn" style="
        padding: 0.75rem 1.5rem;
        border: none;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Go Back</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add hover effects
  const cancelBtn = modal.querySelector('.cancel-btn');
  const confirmBtn = modal.querySelector('.confirm-btn');

  cancelBtn.onmouseover = () => cancelBtn.style.background = 'var(--bg-secondary)';
  cancelBtn.onmouseout = () => cancelBtn.style.background = 'white';
  confirmBtn.onmouseover = () => confirmBtn.style.background = 'var(--primary-dark)';
  confirmBtn.onmouseout = () => confirmBtn.style.background = 'var(--primary-color)';

  // Handle buttons
  cancelBtn.onclick = () => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => overlay.remove(), 200);
  };

  confirmBtn.onclick = () => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => {
      overlay.remove();
      onConfirm();
    }, 200);
  };

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      cancelBtn.click();
    }
  };

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      cancelBtn.click();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// UI helper functions
function updateQuizTitle(title) {
  const titleElement = document.getElementById('quiz-title');
  if (titleElement) {
    titleElement.textContent = title;
  }
}

function clearQuizContainer() {
  const container = document.getElementById('quiz-container');
  if (container) {
    container.innerHTML = '';
    container.className = '';
  }
}

function hideTopControls() {
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

function hideQuizControls() {
  // Hide floating control panel
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');

  if (controlPanel) {
    controlPanel.classList.remove('open');
    controlPanel.setAttribute('aria-hidden', 'true');
  }

  if (panelOverlay) {
    panelOverlay.classList.remove('visible');
  }

  // Hide FAB buttons
  const controlFab = document.getElementById('control-fab');
  const sidebarFab = document.getElementById('sidebar-fab');

  if (controlFab) {
    controlFab.classList.remove('active');
    controlFab.style.display = 'none';
  }

  if (sidebarFab) {
    sidebarFab.classList.remove('active');
    sidebarFab.style.display = 'none';
  }

  // Restore body overflow
  document.body.style.overflow = 'auto';
}

function showQuizSelection() {
  const selection = document.getElementById('quiz-list-container');
  if (selection) {
    selection.style.display = 'block';
    addFadeInAnimation(selection);
  }
}

function hideQuizSelection() {
  const selection = document.getElementById('quiz-list-container');
  if (selection) {
    selection.style.display = 'none';
  }
}

function showQuizSettings() {
  const settings = document.getElementById('quiz-settings');
  if (settings) {
    settings.style.display = 'block';
    addFadeInAnimation(settings);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.listQuizzes = listQuizzes;
  window.goBackToFolder = goBackToFolder;
  window.goHomeWithConfirmation = goHomeWithConfirmation;
}

// Export for use in other modules
export { updateQuizTitle, clearQuizContainer };