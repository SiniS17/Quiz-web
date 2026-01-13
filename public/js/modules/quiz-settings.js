// modules/quiz-settings.js - Quiz Settings with Fixed Level Counting
import {
  getLevelCounts,
  getGlobalSelectedCount,
  setGlobalSelectedCount,
  setPendingQuestionCount,
  getPendingQuestionCount,
  getQuizState
} from './state.js';
import { sortLevelsForDisplay, getSelectedLevels, getQuestionLevels } from './parser.js';
import { showNotification } from './ui/notifications.js';
import { showLoadingScreen, hideLoadingScreen } from './ui/loading.js';
import { updateQuizWithNewLevels, changeQuestionCount } from './quiz-manager.js';

/**
 * Create level selection checkboxes with Select All/Deselect All buttons
 */
export function createTopLevelCheckboxes() {
  const checkboxContainer = document.getElementById('level-checkboxes');
  if (!checkboxContainer) return;

  checkboxContainer.innerHTML = '';
  const levelCounts = getLevelCounts();

  // Sort levels for better display
  const sortedLevels = sortLevelsForDisplay(levelCounts);

  // Create Select All / Deselect All button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'level-button-container';
  buttonContainer.style.cssText = `
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  `;

  const selectAllBtn = document.createElement('button');
  selectAllBtn.className = 'level-action-btn';
  selectAllBtn.innerHTML = '<i class="fas fa-check-double"></i> Select All';
  selectAllBtn.style.cssText = `
    flex: 1;
    padding: 0.5rem 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  `;

  const deselectAllBtn = document.createElement('button');
  deselectAllBtn.className = 'level-action-btn';
  deselectAllBtn.innerHTML = '<i class="fas fa-times"></i> Deselect All';
  deselectAllBtn.style.cssText = `
    flex: 1;
    padding: 0.5rem 0.75rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  `;

  // Select All handler
  selectAllBtn.onclick = () => {
    const allCheckboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
    let anyChanged = false;
    allCheckboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        checkbox.checked = true;
        anyChanged = true;
      }
    });

    if (anyChanged) {
      const quizState = getQuizState();
      if (quizState.allQuestions && quizState.allQuestions.length > 0) {
        updateQuizWithNewLevels();
        updateMaxQuestionsDisplay();
      }
    }
  };

  // Deselect All handler
  deselectAllBtn.onclick = () => {
    const allCheckboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
    let anyChanged = false;
    allCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        checkbox.checked = false;
        anyChanged = true;
      }
    });

    if (anyChanged) {
      const quizState = getQuizState();
      if (quizState.allQuestions && quizState.allQuestions.length > 0) {
        updateQuizWithNewLevels();
        updateMaxQuestionsDisplay();
      }
    }
  };

  // Add hover effects
  selectAllBtn.onmouseenter = () => {
    selectAllBtn.style.background = 'var(--primary-dark)';
    selectAllBtn.style.transform = 'translateY(-1px)';
  };
  selectAllBtn.onmouseleave = () => {
    selectAllBtn.style.background = 'var(--primary-color)';
    selectAllBtn.style.transform = 'translateY(0)';
  };

  deselectAllBtn.onmouseenter = () => {
    deselectAllBtn.style.background = 'var(--bg-secondary)';
    deselectAllBtn.style.borderColor = 'var(--primary-color)';
    deselectAllBtn.style.color = 'var(--primary-color)';
    deselectAllBtn.style.transform = 'translateY(-1px)';
  };
  deselectAllBtn.onmouseleave = () => {
    deselectAllBtn.style.background = 'var(--bg-primary)';
    deselectAllBtn.style.borderColor = 'var(--border-color)';
    deselectAllBtn.style.color = 'var(--text-primary)';
    deselectAllBtn.style.transform = 'translateY(0)';
  };

  buttonContainer.appendChild(selectAllBtn);
  buttonContainer.appendChild(deselectAllBtn);
  checkboxContainer.appendChild(buttonContainer);

  // Create level checkboxes
  const checkboxGrid = document.createElement('div');
  checkboxGrid.style.cssText = `
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  `;

  sortedLevels.forEach(([level, count]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `level-${CSS.escape(level)}`;
    checkbox.dataset.level = level;
    checkbox.checked = true;

    const label = document.createElement('label');
    label.htmlFor = `level-${CSS.escape(level)}`;

    // Format label text
    const isNumber = !isNaN(parseInt(level)) && String(parseInt(level)) === level;
    const labelText = isNumber ? `L${level}` : level;
    label.textContent = `${labelText} (${count})`;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    checkboxGrid.appendChild(wrapper);

    checkbox.addEventListener('change', () => {
      const quizState = getQuizState();
      if (quizState.allQuestions && quizState.allQuestions.length > 0) {
        updateQuizWithNewLevels();
        updateMaxQuestionsDisplay();
      }
    });
  });

  checkboxContainer.appendChild(checkboxGrid);
}

/**
 * Calculate actual max questions based on selected levels
 * This counts each question only once, even if it has multiple matching levels
 */
function calculateActualMaxQuestions(allQuestions, selectedLevels) {
  if (selectedLevels.length === 0) return 0;

  let count = 0;
  allQuestions.forEach(question => {
    const questionLevels = getQuestionLevels(question);

    // Check if this question has ANY of the selected levels
    const hasMatchingLevel = questionLevels.some(level => selectedLevels.includes(level));

    if (hasMatchingLevel) {
      count++;
    }
  });

  return count;
}

/**
 * Update max questions display based on selected levels
 */
function updateMaxQuestionsDisplay() {
  const quizState = getQuizState();
  if (!quizState.allQuestions) return;

  const selectedLevels = getSelectedLevels();
  const levelCounts = getLevelCounts();

  // Calculate actual max questions (counting each question only once)
  const maxQuestions = calculateActualMaxQuestions(quizState.allQuestions, selectedLevels);

  // Update the question count input max attribute
  const questionCountInput = document.getElementById('question-count');
  if (questionCountInput) {
    questionCountInput.max = maxQuestions;

    // If current value exceeds new max, clamp it
    const currentValue = parseInt(questionCountInput.value);
    if (currentValue > maxQuestions) {
      questionCountInput.value = maxQuestions;
      setGlobalSelectedCount(maxQuestions);
      setPendingQuestionCount(maxQuestions);
    }
  }

  // Update the info display
  const maxQuestionsInfo = document.getElementById('max-questions-info');
  if (maxQuestionsInfo) {
    const sortedLevels = sortLevelsForDisplay(levelCounts)
      .filter(([level]) => selectedLevels.includes(level));

    let levelInfo = sortedLevels
      .map(([level, count]) => {
        const isNumber = !isNaN(parseInt(level)) && String(parseInt(level)) === level;
        const displayName = isNumber ? `Level ${level}` : level;
        return `${displayName}: ${count}`;
      })
      .join(', ');

    maxQuestionsInfo.innerHTML = `
      <strong>Total questions: ${maxQuestions}</strong><br>
      <small>${levelInfo || 'No levels selected'}</small>
      <br>
      <small style="color: var(--text-muted); font-size: 0.75rem;">* Questions with multiple levels counted once</small>
    `;
  }
}

/**
 * Setup question count input
 */
export function setupTopQuestionCountInput(questions) {
  const questionCountInput = document.getElementById('question-count');
  if (!questionCountInput) return;

  const maxQuestions = questions.length;
  const selectedCount = Math.min(20, maxQuestions);

  setGlobalSelectedCount(selectedCount);
  setPendingQuestionCount(selectedCount);

  questionCountInput.value = selectedCount;
  questionCountInput.max = maxQuestions;

  // Remove old event listeners
  questionCountInput.removeEventListener('input', questionCountInput._inputHandler);
  questionCountInput.removeEventListener('keypress', questionCountInput._keypressHandler);

  // Create new handlers
  questionCountInput._inputHandler = (e) => {
    handleQuestionCountInput(e, maxQuestions);
  };

  questionCountInput._keypressHandler = (e) => {
    handleQuestionCountKeypress(e, maxQuestions);
  };

  questionCountInput.addEventListener('input', questionCountInput._inputHandler);
  questionCountInput.addEventListener('keypress', questionCountInput._keypressHandler);
}

/**
 * Handle question count input changes
 */
function handleQuestionCountInput(e, maxQuestions) {
  const quizState = getQuizState();
  const selectedLevels = getSelectedLevels();

  // Calculate actual max based on selected levels
  const actualMax = quizState.allQuestions
    ? calculateActualMaxQuestions(quizState.allQuestions, selectedLevels)
    : maxQuestions;

  let value = parseInt(e.target.value);
  if (value > 0) {
    if (value > actualMax) {
      value = actualMax;
      e.target.value = value;
    }
    setPendingQuestionCount(value);

    // Always show the orange border when Enter is needed
    e.target.style.borderColor = '#f59e0b';
    e.target.title = 'Press Enter to apply the new question count';
  }
}

/**
 * Handle question count keypress (Enter to apply)
 */
function handleQuestionCountKeypress(e, maxQuestions) {
  if (e.key === 'Enter') {
    e.preventDefault();

    const quizState = getQuizState();
    const selectedLevels = getSelectedLevels();

    // Calculate actual max based on selected levels
    const actualMax = quizState.allQuestions
      ? calculateActualMaxQuestions(quizState.allQuestions, selectedLevels)
      : maxQuestions;

    let value = parseInt(e.target.value);
    if (value > 0) {
      if (value > actualMax) {
        value = actualMax;
        e.target.value = value;
      }

      // Always apply the change when Enter is pressed
      applyQuestionCountChange(value, actualMax);

      // Reset border color after applying
      e.target.style.borderColor = '';
      e.target.title = '';
    }
  }
}

/**
 * Apply question count change
 */
function applyQuestionCountChange(newCount, maxQuestions) {
  const quizState = getQuizState();

  if (!quizState.allQuestions || quizState.allQuestions.length === 0) {
    return;
  }

  if (quizState.hasSubmitted) {
    showNotification('Cannot change question count after submission', 'error');
    return;
  }

  showLoadingScreen('Updating Question Count', `Loading ${newCount} questions...`);

  setTimeout(() => {
    setGlobalSelectedCount(newCount);
    setPendingQuestionCount(newCount);
    changeQuestionCount(newCount);
    hideLoadingScreen();
  }, 300);
}