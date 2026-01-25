// modules/ui/navigation.js - Quiz List and Folder Navigation
import CONFIG, { getQuizFilePath } from '../../config.js';
import { fetchQuizList, fetchQuizContent } from '../api.js';
import { showNotification } from './notifications.js';
import { showLoading, hideLoading, disableAllControlsDuringLoad, enableAllControlsAfterLoad } from './loading.js';
import { addFadeInAnimation } from '../utils.js';
import { clearLevelCounts, setLevelCounts, setCurrentFolder, getCurrentFolder, setSelectedFileName, updateQuizState, getLevelCounts } from '../state.js';
import { loadQuiz } from '../quiz-loader.js';
import { parseQuestions, recountLevelsForQuestions } from '../parser.js';
import { showTopControls } from './controls.js';
import { createTopLevelCheckboxes, setupTopQuestionCountInput } from '../quiz-settings.js';
import { displayQuestions } from '../quiz-manager.js';

// Track current folder path
let currentFolderPath = '';
let selectedQuizzes = new Set();
let currentRequestId = 0;

/**
 * Check if a quiz file has valid consecutive line count
 */
async function validateConsecutiveLines(filePath) {
  try {
    const response = await fetch(getQuizFilePath(filePath));
    if (!response.ok) {
      return { valid: true, min: 0, max: 0, reason: 'Could not read file' };
    }

    const text = await response.text();
    const lines = text.split('\n');

    let consecutiveCount = 0;
    let maxConsecutive = 0;
    let minConsecutive = Infinity;
    let groupCount = 0;

    for (const line of lines) {
      if (line.trim() !== '') {
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        if (consecutiveCount > 0) {
          minConsecutive = Math.min(minConsecutive, consecutiveCount);
          groupCount++;
        }
        consecutiveCount = 0;
      }
    }

    if (consecutiveCount > 0) {
      minConsecutive = Math.min(minConsecutive, consecutiveCount);
      groupCount++;
    }

    if (groupCount === 0 || minConsecutive === Infinity) {
      minConsecutive = 0;
    }

    const { MAX_CONSECUTIVE_LINES, MIN_CONSECUTIVE_LINES } = CONFIG;

    let valid = true;
    let reason = '';

    if (maxConsecutive > MAX_CONSECUTIVE_LINES) {
      valid = false;
      reason = `Too many consecutive lines (${maxConsecutive} > ${MAX_CONSECUTIVE_LINES})`;
    } else if (minConsecutive < MIN_CONSECUTIVE_LINES && minConsecutive > 0) {
      valid = false;
      reason = `Too few consecutive lines (${minConsecutive} < ${MIN_CONSECUTIVE_LINES})`;
    }

    return { valid, min: minConsecutive, max: maxConsecutive, reason };
  } catch (error) {
    console.error('Error validating line count:', error);
    return { valid: true, min: 0, max: 0, reason: 'Validation error' };
  }
}

/**
 * Check if a folder contains any invalid quizzes
 */
async function folderHasInvalidQuizzes(folderPath) {
  try {
    const data = await fetchQuizList(folderPath);

    const fileChecks = await Promise.all(
      data.files.map(file => {
        const filePath = folderPath ? `${folderPath}/${file}` : file;
        return validateConsecutiveLines(filePath);
      })
    );

    if (fileChecks.some(result => !result.valid)) {
      return true;
    }

    const folderChecks = await Promise.all(
      data.folders.map(folder => {
        const fullPath = folderPath ? `${folderPath}/${folder}` : folder;
        return folderHasInvalidQuizzes(fullPath);
      })
    );

    return folderChecks.some(hasInvalid => hasInvalid);
  } catch (error) {
    console.error('Error checking folder:', error);
    return false;
  }
}

/**
 * List available quizzes and folders
 */
export function listQuizzes(folder = '') {
    if (folder && folder.target) {
        folder = '';
    }

    // 1. Increment the ID for this new request
    const requestId = ++currentRequestId;

    currentFolderPath = folder;
    setCurrentFolder(folder);
    selectedQuizzes.clear();
    showLoading();
    disableAllControlsDuringLoad();
    clearLevelCounts();
    updateQuizTitle('Aviation Quiz');
    clearQuizContainer();
    closeAllOpenMenus();
    hideTopControls();
    hideQuizControls();
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
        .then(data => {
            // 2. Only render if this is still the latest request
            if (requestId === currentRequestId) {
                renderQuizList(data, quizGrid, folder);
            }
        })
        .catch(error => {
            // 3. Only handle error if this is the latest request
            if (requestId === currentRequestId) {
                handleQuizListError(error, quizGrid);
            }
        });
}


/**
 * Close all open menus and overlays
 */
function closeAllOpenMenus() {
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');

  if (controlPanel) {
    controlPanel.classList.remove('open');
    controlPanel.setAttribute('aria-hidden', 'true');
  }

  if (panelOverlay) {
    panelOverlay.classList.remove('visible');
  }

  const leftSidebar = document.getElementById('left-sidebar');
  if (leftSidebar) {
    leftSidebar.style.display = 'none';
    leftSidebar.classList.remove('mobile-visible');
  }

  const scoreDisplay = document.getElementById('floating-score-display');
  if (scoreDisplay) {
    scoreDisplay.classList.remove('show');
    setTimeout(() => {
      if (scoreDisplay.parentNode) {
        scoreDisplay.remove();
      }
    }, 300);
  }

  const liveScore = document.getElementById('floating-live-score');
  if (liveScore) {
    liveScore.classList.remove('show');
    setTimeout(() => {
      if (liveScore.parentNode) {
        liveScore.remove();
      }
    }, 300);
  }

  const imageModal = document.getElementById('image-modal');
  if (imageModal) {
    imageModal.classList.remove('show');
  }

  document.body.style.overflow = 'auto';
}

/**
 * Create back button for folder navigation
 */
function createBackButton(folder) {
  const backButton = document.createElement('div');
  backButton.className = 'quiz-box back-button';
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Categories';

  backButton.onclick = () => {
    const parentFolder = folder.split('/').slice(0, -1).join('/');
    if (!parentFolder) {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/folder/${parentFolder.split('/').map(encodeURIComponent).join('/')}`;
    }
  };

  return backButton;
}

/**
 * Render quiz list in grid
 */
async function renderQuizList(data, quizGrid, folder) {
  if (data.folders.length === 0 && data.files.length === 0) {
    quizGrid.innerHTML = '<div class="no-content">No quizzes or folders found.</div>';
    enableAllControlsAfterLoad();
    hideLoading();
    return;
  }

  data.folders.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  data.files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  // Check if current folder has files (enable multi-select only if there are files)
  const hasFiles = data.files.length > 0;

  // Validate folders and files in parallel
  const folderChecks = await Promise.all(
    data.folders.map(async (folderName) => {
      const fullPath = folder ? `${folder}/${folderName}` : folderName;
      const hasInvalid = await folderHasInvalidQuizzes(fullPath);
      return { folderName, hasInvalid };
    })
  );

  const fileChecks = await Promise.all(
    data.files.map(async (file) => {
      const filePath = folder ? `${folder}/${file}` : file;
      const validation = await validateConsecutiveLines(filePath);
      return { file, validation };
    })
  );

  // Render folders (exclude subfolders from multi-select)
  folderChecks.forEach(({ folderName, hasInvalid }) => {
    const folderBox = createFolderBox(folderName, folder, hasInvalid);
    quizGrid.appendChild(folderBox);
    addFadeInAnimation(folderBox);
  });

  // Render files with checkboxes if in a folder with files
  fileChecks.forEach(({ file, validation }) => {
    const quizBox = createQuizBox(file, folder, validation, hasFiles);
    quizGrid.appendChild(quizBox);
    addFadeInAnimation(quizBox);
  });

  // Add "Start Multi-Quiz" button if files are present
  if (hasFiles) {
    createMultiQuizButton(quizGrid, folder);
  }

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
function createFolderBox(folderName, currentFolder, hasInvalid = false) {
  const folderBox = document.createElement('div');
  folderBox.className = 'quiz-box folder-select' + (hasInvalid ? ' quiz-flagged' : '');

  const warningIcon = hasInvalid ? '<i class="fas fa-exclamation-triangle excess-warning"></i>' : '';

  folderBox.innerHTML = `
    <i class="fas fa-folder"></i>
    <h3>${folderName}</h3>
    <p>Browse quiz categories</p>
    ${warningIcon}
  `;

  folderBox.onclick = () => {
    const fullPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    window.location.hash = `#/folder/${fullPath.split('/').map(encodeURIComponent).join('/')}`;
  };

  return folderBox;
}

/**
 * Create quiz box element with optional checkbox
 */
function createQuizBox(file, folder, validation, showCheckbox = false) {
  const quizBox = document.createElement('div');
  const isInvalid = !validation.valid;
  const filePath = folder ? `${folder}/${file}` : file;

  quizBox.className = 'quiz-box' + (isInvalid ? ' quiz-flagged' : '');
  quizBox.style.position = 'relative';

  let warningIcon = '';
  let warningTitle = '';

  if (isInvalid) {
    warningTitle = validation.reason;
    warningIcon = `<i class="fas fa-exclamation-triangle excess-warning" title="${warningTitle}"></i>`;
  }

  // Add checkbox if multi-select is enabled
  let checkboxHTML = '';
  if (showCheckbox) {
    checkboxHTML = `
      <input type="checkbox"
             class="quiz-checkbox"
             data-file-path="${filePath}"
             style="
               position: absolute;
               top: 1rem;
               right: 1rem;
               width: 24px;
               height: 24px;
               cursor: pointer;
               z-index: 10;
               accent-color: #10b981;
               transform: scale(1.3);
               filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
             "
             onclick="event.stopPropagation();">
    `;
  }

  quizBox.innerHTML = `
    ${checkboxHTML}
    <i class="fas fa-file-text"></i>
    <h3>${file.replace('.txt', '').replace(' (-)', '')}</h3>
    <p>Click to start quiz</p>
    ${warningIcon}
  `;

  if (isInvalid) {
    quizBox.title = warningTitle;
  }

  // Handle checkbox change
  if (showCheckbox) {
    const checkbox = quizBox.querySelector('.quiz-checkbox');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        selectedQuizzes.add(filePath);
        quizBox.classList.add('quiz-selected');
      } else {
        selectedQuizzes.delete(filePath);
        quizBox.classList.remove('quiz-selected');
      }
      updateMultiQuizButton();
    });

    // Handle box click in multi-select mode
    quizBox.onclick = (e) => {
      // If clicking the checkbox itself, let it handle naturally
      if (e.target.classList.contains('quiz-checkbox')) {
        return;
      }

      // If ANY quiz is selected, prevent single quiz start
      if (selectedQuizzes.size > 0) {
        e.preventDefault();
        e.stopPropagation();
        showNotification('Use checkboxes to select quizzes, then click "Start Combined Quiz"', 'info');
        return;
      }

      // No quizzes selected - allow normal single quiz start
      // Use URL routing
      const fullPath = folder ? `${folder}/${file}` : file;
      window.location.hash = `#/quiz/${fullPath.split('/').map(encodeURIComponent).join('/')}`;
    };
  } else {
    // No checkbox mode - normal single quiz start
    quizBox.onclick = (e) => {
      const fullPath = folder ? `${folder}/${file}` : file;
      window.location.hash = `#/quiz/${fullPath.split('/').map(encodeURIComponent).join('/')}`;
    };
  }

  return quizBox;
}

/**
 * Create multi-quiz start button
 */
function createMultiQuizButton(quizGrid, folder) {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'multi-quiz-button-container';
  buttonContainer.style.cssText = `
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  `;

  const startButton = document.createElement('button');
  startButton.id = 'start-multi-quiz-btn';
  startButton.className = 'primary-btn';
  startButton.innerHTML = '<i class="fas fa-play"></i> Start Combined Quiz (0 selected)';
  startButton.disabled = true;
  startButton.style.cssText = `
    padding: 1rem 2rem;
    font-size: 1rem;
    opacity: 0.5;
    cursor: not-allowed;
    transition: all 0.3s ease;
  `;

  startButton.onclick = () => {
    if (selectedQuizzes.size > 0) {
      startMultiQuiz(Array.from(selectedQuizzes), folder);
    }
  };

  buttonContainer.appendChild(startButton);
  quizGrid.appendChild(buttonContainer);
}

/**
 * Update multi-quiz button state
 */
function updateMultiQuizButton() {
  const button = document.getElementById('start-multi-quiz-btn');
  if (!button) return;

  const count = selectedQuizzes.size;
  button.innerHTML = `<i class="fas fa-play"></i> Start Combined Quiz (${count} selected)`;

  if (count > 0) {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
  } else {
    button.disabled = true;
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
  }
}

/**
 * Start multi-quiz with combined questions
 */
async function startMultiQuiz(filePaths, folder) {
  showLoading('Loading Combined Quiz', 'Combining questions from multiple quizzes...');
  disableAllControlsDuringLoad();

  try {
    let allQuestions = [];
    let questionsWithBanks = [];

    // Fetch and parse all selected quizzes with bank tracking
    for (const filePath of filePaths) {
      const text = await fetchQuizContent(filePath);
      const lines = text.split('\n');
      const questions = parseQuestions(lines);

      // Extract bank name from file path (keep it short for display)
      const bankName = filePath.split('/').pop().replace('.txt', '').substring(0, 15);

      // Tag each question with its bank name
      questions.forEach(q => {
        questionsWithBanks.push({ text: q, bank: bankName });
      });
    }

    allQuestions = questionsWithBanks;

    if (allQuestions.length === 0) {
      showNotification('No questions found in selected quizzes', 'error');
      enableAllControlsAfterLoad();
      hideLoading();
      return;
    }

    // Recount levels for the COMBINED question array
    recountLevelsForQuestions(allQuestions);

    // Set a combined filename for state tracking
    setSelectedFileName(`Combined (${filePaths.length} quizzes)`);
    setCurrentFolder(folder || '');

    // Store bank info in quiz state
    updateQuizState({ bankInfo: questionsWithBanks.map(q => q.bank) });

    // Update title
    updateQuizTitle(`Combined Quiz (${filePaths.length} banks)`);

    // Hide quiz selection and show controls
    hideQuizSelection();
    showTopControls();

    // Update quiz info
    updateQuizInfo(allQuestions.length);

    // Create level checkboxes and question count input
    createTopLevelCheckboxes();
    setupTopQuestionCountInput(allQuestions);

    // Display questions
    displayQuestions(allQuestions);

    showNotification(`Combined ${allQuestions.length} questions from ${filePaths.length} quizzes!`, 'success');
  } catch (error) {
    console.error('Error loading combined quiz:', error);
    showNotification('Error loading combined quiz. Please try again.', 'error');
    enableAllControlsAfterLoad();
    hideLoading();
  }
}

/**
 * Update quiz info display
 */
function updateQuizInfo(questionCount) {
  const maxQuestionsInfo = document.getElementById('max-questions-info');
  if (maxQuestionsInfo) {
    maxQuestionsInfo.innerHTML = `
      <strong>Total questions: ${questionCount}</strong>
    `;
  }
}

/**
 * Initialize quiz from file
 */
function initializeQuiz(fileName, folder) {
  showLoading();
  disableAllControlsDuringLoad();

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

  showConfirmDialog(
    'Return to Folder?',
    `Are you sure you want to go back to the quiz selection? Your current progress will be lost.`,
    () => {
      // Replaced listQuizzes with hash navigation
      if (!folder) {
        window.location.hash = '#/';
      } else {
        window.location.hash = `#/folder/${folder.split('/').map(encodeURIComponent).join('/')}`;
      }
    }
  );
}

/**
 * Go home with confirmation
 */
export function goHomeWithConfirmation() {
  const quizContainer = document.getElementById('quiz-container');
  const hasActiveQuiz = quizContainer && quizContainer.innerHTML.trim() !== '';

  if (hasActiveQuiz) {
    showConfirmDialog(
      'Return to Home?',
      `Are you sure you want to return to the main menu? Your current progress will be lost.`,
      () => {
        window.location.hash = '#/';
      }
    );
  } else {
    window.location.hash = '#/';
  }
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(title, message, onConfirm) {
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

  const cancelBtn = modal.querySelector('.cancel-btn');
  const confirmBtn = modal.querySelector('.confirm-btn');

  cancelBtn.onmouseover = () => cancelBtn.style.background = 'var(--bg-secondary)';
  cancelBtn.onmouseout = () => cancelBtn.style.background = 'white';
  confirmBtn.onmouseover = () => confirmBtn.style.background = 'var(--primary-dark)';
  confirmBtn.onmouseout = () => confirmBtn.style.background = 'var(--primary-color)';

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

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      cancelBtn.click();
    }
  };

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

  if (controlFab) {
    controlFab.classList.remove('active');
    controlFab.style.display = 'none';
  }
  if (sidebarFab) {
    sidebarFab.classList.remove('active');
    sidebarFab.style.display = 'none';
  }
  if (leftSidebar) {
    leftSidebar.style.display = 'none';
    leftSidebar.classList.remove('mobile-visible');
  }
  if (mainContent) mainContent.classList.remove('with-sidebar');
  if (quizInterface) quizInterface.classList.remove('with-controls');
}

function hideQuizControls() {
  const controlPanel = document.getElementById('control-panel');
  const panelOverlay = document.getElementById('panel-overlay');

  if (controlPanel) {
    controlPanel.classList.remove('open');
    controlPanel.setAttribute('aria-hidden', 'true');
  }

  if (panelOverlay) {
    panelOverlay.classList.remove('visible');
  }

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
export { updateQuizTitle, clearQuizContainer, initializeQuiz };
