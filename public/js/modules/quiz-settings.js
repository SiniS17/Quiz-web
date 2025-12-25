// modules/quiz-settings.js - Quiz Settings Management with Flexible Levels
import {
  getLevelCounts,
  getGlobalSelectedCount,
  setGlobalSelectedCount,
  setPendingQuestionCount,
  getPendingQuestionCount,
  getQuizState
} from './state.js';
import { sortLevelsForDisplay } from './parser.js';
import { showNotification } from './ui/notifications.js';
import { showLoadingScreen, hideLoadingScreen } from './ui/loading.js';
import { updateQuizWithNewLevels, changeQuestionCount } from './quiz-manager.js';

/**
 * Create level selection checkboxes with flexible level names
 */
export function createTopLevelCheckboxes() {
  const checkboxContainer = document.getElementById('level-checkboxes');
  if (!checkboxContainer) return;

  checkboxContainer.innerHTML = '';
  const levelCounts = getLevelCounts();

  // Sort levels for better display
  const sortedLevels = sortLevelsForDisplay(levelCounts);

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

    // Format label text: if it's just a number, prefix with "Level"
    const isNumber = !isNaN(parseInt(level)) && String(parseInt(level)) === level;
    const labelText = isNumber ? `L${level}` : level;
    label.textContent = `${labelText} (${count})`;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    checkboxContainer.appendChild(wrapper);

    checkbox.addEventListener('change', () => {
      const quizState = getQuizState();
      if (quizState.allQuestions && quizState.allQuestions.length > 0) {
        updateQuizWithNewLevels();
      }
    });
  });
}

/**
 * Setup question count input
 * @param {Array} questions - All questions
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

  questionCountInput.removeEventListener('input', questionCountInput._inputHandler);
  questionCountInput.removeEventListener('keypress', questionCountInput._keypressHandler);

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
  let value = parseInt(e.target.value);
  if (value > 0) {
    if (value > maxQuestions) {
      value = maxQuestions;
      e.target.value = value;
    }
    setPendingQuestionCount(value);
    const currentCount = getGlobalSelectedCount();
    if (value !== currentCount) {
      e.target.style.borderColor = '#f59e0b';
      e.target.title = 'Press Enter to apply the new question count';
    } else {
      e.target.style.borderColor = '';
      e.target.title = '';
    }
  }
}

/**
 * Handle question count keypress (Enter to apply)
 */
function handleQuestionCountKeypress(e, maxQuestions) {
  if (e.key === 'Enter') {
    e.preventDefault();
    let value = parseInt(e.target.value);
    if (value > 0) {
      if (value > maxQuestions) {
        value = maxQuestions;
        e.target.value = value;
      }
      const currentCount = getGlobalSelectedCount();
      if (value !== currentCount) {
        applyQuestionCountChange(value, maxQuestions);
        e.target.style.borderColor = '';
        e.target.title = '';
      }
    }
  }
}

/**
 * Apply question count change
 * @param {number} newCount - New question count
 * @param {number} maxQuestions - Maximum available questions
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