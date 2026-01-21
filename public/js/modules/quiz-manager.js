// modules/quiz-manager.js - Main Quiz Management Logic (FIXED BANK HANDLING)

import {
  getQuizState,
  saveQuizState,
  resetQuizSubmission,
  setAnsweredQuestions,
  updateQuizState,
  getGlobalSelectedCount,
  setGlobalSelectedCount
} from './state.js';

import {
  parseQuestionWithImages,
  filterQuestionsByLevel,
  getSelectedLevels
} from './parser.js';

import { shuffle, addFadeInAnimation } from './utils.js';
import { showNotification } from './ui/notifications.js';
import {
  showLoading,
  hideLoading,
  showLoadingScreen,
  hideLoadingScreen,
  disableAllControlsDuringLoad,
  enableAllControlsAfterLoad
} from './ui/loading.js';

import { setupResultsContainer } from './ui/progress.js';
import { createQuestionElement } from './ui/quiz-display.js';
import {
  setupLiveTestInTopControls,
  applyLiveTestUIState,
  getLiveTestCheckbox,
  updateLiveScore,
  highlightLiveAnswers
} from './live-test.js';

import { setupImageModal } from './ui/modal.js';
import { enableQuizControls } from './quiz-controls.js';

/**
 * Normalize questions into objects:
 * - Single bank: { text }
 * - Multi bank:  { text, bank }
 */
function normalizeQuestions(allQuestions) {
  return allQuestions.map(q =>
    typeof q === 'string' ? { text: q } : q
  );
}

/**
 * Display questions in the quiz container
 */
export function displayQuestions(allQuestions) {
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

  quizContainer.innerHTML = '';
  quizContainer.className = 'quiz-interface';

  const selectedLevels = getSelectedLevels();

  const normalized = normalizeQuestions(allQuestions);
  saveQuizState(normalized, selectedLevels);

  const filtered = normalized.filter(q =>
    filterQuestionsByLevel([q.text], selectedLevels).length > 0
  );

  if (filtered.length === 0) {
    quizContainer.innerHTML =
      '<div class="no-questions">No questions available for selected criteria.</div>';
    enableAllControlsAfterLoad();
    hideLoading();
    showNotification('No questions available for selected criteria', 'error');
    return;
  }

  const shuffled = shuffle(filtered);

  updateQuizState({
    originalQuestionOrder: shuffled,
    bankInfo: shuffled.map(q => q.bank || null)
  });

  const selectedCount = getGlobalSelectedCount();
  const selectedQuestions = shuffled.slice(0, selectedCount);

  updateQuizState({
    bankInfo: selectedQuestions.map(q => q.bank || null)
  });

  showLoading();
  disableAllControlsDuringLoad();

  selectedQuestions.forEach((q, index) => {
    const element = createQuestionElement(q.text, index, q.bank);
    quizContainer.appendChild(element);
    addFadeInAnimation(element);
  });

  setupResultsContainer(selectedQuestions.length);
  setupLiveTestInTopControls();
  setupImageModal();

  requestAnimationFrame(() => {
    enableAllControlsAfterLoad();
    hideLoading();
  });
}

/**
 * Display questions directly (restart)
 */
export function displayQuestionsDirectly(selectedQuestions, isLiveMode = false) {
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

  quizContainer.innerHTML = '';
  quizContainer.className = 'quiz-interface';

  showLoading();
  disableAllControlsDuringLoad();

  selectedQuestions.forEach((q, index) => {
    const question = typeof q === 'string' ? { text: q } : q;
    const element = createQuestionElement(question.text, index, question.bank);
    quizContainer.appendChild(element);
    addFadeInAnimation(element);
  });

  setupResultsContainer(selectedQuestions.length);
  setupLiveTestInTopControls();
  setupImageModal();

  const liveTestCheckbox = getLiveTestCheckbox();
  if (liveTestCheckbox) {
    liveTestCheckbox.checked = isLiveMode;
    applyLiveTestUIState(isLiveMode);
  }

  requestAnimationFrame(() => {
    enableAllControlsAfterLoad();
    hideLoading();
    hideLoadingScreen();
  });
}

/**
 * Restart quiz
 */
export function restartQuiz() {
  const quizState = getQuizState();
  if (!quizState.fileName) {
    showNotification('No saved quiz state found', 'error');
    return;
  }

  showLoadingScreen(
    quizState.isLiveMode ? 'Restarting Live Test' : 'Restarting Quiz',
    'Please wait while questions are being reloaded...'
  );

  clearQuizContainer();
  setAnsweredQuestions([]);
  resetQuizSubmission();

  setTimeout(() => {
    startQuizWithState(quizState);
    hideLoadingScreen();
  }, 300);
}

function startQuizWithState(state) {
  const filtered = state.allQuestions.filter(q =>
    filterQuestionsByLevel([q.text], state.selectedLevels).length > 0
  );

  const shuffled = shuffle(filtered);
  updateQuizState({ originalQuestionOrder: shuffled });

  const selected = shuffled.slice(0, state.questionCount);
  if (selected.length === 0) {
    showNotification('No questions available', 'error');
    return;
  }

  displayQuestionsDirectly(selected, state.isLiveMode);
}

/**
 * Update quiz when levels change
 */
export function updateQuizWithNewLevels() {
  const quizState = getQuizState();
  if (!quizState.allQuestions || quizState.hasSubmitted) return;

  const selectedLevels = getSelectedLevels();
  updateQuizState({ selectedLevels });

  const filtered = quizState.allQuestions.filter(q =>
    filterQuestionsByLevel([q.text], selectedLevels).length > 0
  );

  const shuffled = shuffle(filtered);
  const selectedCount = getGlobalSelectedCount();
  const selected = shuffled.slice(0, selectedCount);

  updateQuizState({
    originalQuestionOrder: shuffled,
    bankInfo: selected.map(q => q.bank || null)
  });

  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  showLoading();
  disableAllControlsDuringLoad();

  selected.forEach((q, index) => {
    const element = createQuestionElement(q.text, index, q.bank);
    quizContainer.appendChild(element);
    addFadeInAnimation(element);
  });

  setupResultsContainer(selected.length);

  requestAnimationFrame(() => {
    enableAllControlsAfterLoad();
    hideLoading();
    showNotification('Quiz updated', 'success');
  });
}

/**
 * Change question count
 */
export function changeQuestionCount(newCount) {
  const quizState = getQuizState();
  if (!quizState.allQuestions || quizState.hasSubmitted) return;

  updateQuizState({ questionCount: newCount });
  setGlobalSelectedCount(newCount);

  const selected = quizState.originalQuestionOrder.slice(0, newCount);

  updateQuizState({
    bankInfo: selected.map(q => q.bank || null)
  });

  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  selected.forEach((q, index) => {
    const element = createQuestionElement(q.text, index, q.bank);
    quizContainer.appendChild(element);
    addFadeInAnimation(element);
  });

  setupResultsContainer(selected.length);
}

/**
 * Clear quiz container
 */
function clearQuizContainer() {
  const container = document.getElementById('quiz-container');
  if (container) {
    container.innerHTML = '';
    container.className = '';
  }
}

/**
 * Close score display
 */
export function closeScoreDisplay() {
  const scoreDisplay = document.getElementById('floating-score-display');
  if (scoreDisplay) {
    scoreDisplay.classList.remove('show');
    setTimeout(() => scoreDisplay.remove(), 300);
  }
  resetQuizSubmission();
  enableQuizControls();
}
