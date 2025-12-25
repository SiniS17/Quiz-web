// modules/ui/navigation.js - Quiz List and Folder Navigation
import { fetchQuizList } from '../api.js';
import { showNotification } from './notifications.js';
import { showLoading, hideLoading, disableAllControlsDuringLoad, enableAllControlsAfterLoad } from './loading.js';
import { addFadeInAnimation } from '../utils.js';
import { clearLevelCounts, setLevelCounts } from '../state.js';
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

  showLoading();
  disableAllControlsDuringLoad();
  clearLevelCounts();

  updateQuizTitle('Aviation Quiz');
  clearQuizContainer();
  hideTopControls();
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
    initializeQuiz(filePath);
  };

  return quizBox;
}

/**
 * Initialize quiz from file
 */
function initializeQuiz(fileName) {
  showLoading();
  disableAllControlsDuringLoad();

  hideQuizSelection();
  showQuizSettings();

  loadQuiz(fileName);
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

// Make listQuizzes available globally for HTML onclick handlers
if (typeof window !== 'undefined') {
  window.listQuizzes = listQuizzes;
}

// Export for use in other modules
export { updateQuizTitle, clearQuizContainer };