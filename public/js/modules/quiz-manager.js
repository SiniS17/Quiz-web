// modules/quiz-manager.js - Main Quiz Management Logic
import {
  getQuizState,
  saveQuizState,
  resetQuizSubmission,
  setAnsweredQuestions,
  updateQuizState,
  getGlobalSelectedCount,
  getSelectedFileName,
  setGlobalSelectedCount
} from './state.js';
import { parseQuestionWithImages, filterQuestionsByLevel, getSelectedLevels } from './parser.js';
import { shuffle, addFadeInAnimation } from './utils.js';
import { showNotification } from './ui/notifications.js';
import { showLoading, hideLoading, showLoadingScreen, hideLoadingScreen, disableAllControlsDuringLoad, enableAllControlsAfterLoad } from './ui/loading.js';
import { setupResultsContainer } from './ui/progress.js';
import { createQuestionElement } from './ui/quiz-display.js';
import { setupLiveTestInTopControls, applyLiveTestUIState, getLiveTestCheckbox, updateLiveScore, highlightLiveAnswers } from './live-test.js';
import { setupImageModal } from './ui/modal.js';
import { enableQuizControls } from './quiz-controls.js';

/**
 * Display questions in the quiz container
 * @param {Array} allQuestions - All available questions
 */
export function displayQuestions(allQuestions) {
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

  quizContainer.innerHTML = '';
  quizContainer.className = 'quiz-interface';

  const selectedLevels = getSelectedLevels();
  saveQuizState(allQuestions, selectedLevels);

  const quizState = getQuizState();
  const filteredQuestions = filterQuestionsByLevel(allQuestions, selectedLevels);

  // Preserve bank info during shuffle if it exists
  let shuffledFullOrder, shuffledBankInfo;
  if (quizState.bankInfo && quizState.bankInfo.length === allQuestions.length) {
    // Create array of {question, bank} pairs
    const paired = filteredQuestions.map(q => {
      const originalIndex = allQuestions.indexOf(q);
      return { question: q, bank: quizState.bankInfo[originalIndex] };
    });

    // Shuffle the pairs
    const shuffledPairs = shuffle(paired);

    // Separate back into questions and bank info
    shuffledFullOrder = shuffledPairs.map(p => p.question);
    shuffledBankInfo = shuffledPairs.map(p => p.bank);
  } else {
    shuffledFullOrder = shuffle(filteredQuestions);
    shuffledBankInfo = null;
  }

  updateQuizState({
    originalQuestionOrder: shuffledFullOrder,
    bankInfo: shuffledBankInfo
  });

  const globalSelectedCount = getGlobalSelectedCount();
  const selectedQuestions = shuffledFullOrder.slice(0, globalSelectedCount);

  // Update bankInfo to match selected questions only
  if (shuffledBankInfo) {
    updateQuizState({ bankInfo: shuffledBankInfo.slice(0, globalSelectedCount) });
  }

  if (selectedQuestions.length === 0) {
    quizContainer.innerHTML = '<div class="no-questions">No questions available for selected criteria.</div>';
    enableAllControlsAfterLoad();
    hideLoading();
    showNotification('No questions available for selected criteria', 'error');
    return;
  }

  showLoading();
  disableAllControlsDuringLoad();

  const questionElements = [];
  selectedQuestions.forEach((questionText, index) => {
    const questionElement = createQuestionElement(questionText, index);
    questionElements.push(questionElement);
  });

  questionElements.forEach(element => {
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
 * Display questions directly (for restarts)
 */
export function displayQuestionsDirectly(selectedQuestions, isLiveMode = false) {
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

  quizContainer.innerHTML = '';
  quizContainer.className = 'quiz-interface';

  showLoading();
  disableAllControlsDuringLoad();

  const questionElements = [];
  selectedQuestions.forEach((questionText, index) => {
    const questionElement = createQuestionElement(questionText, index);
    questionElements.push(questionElement);
  });

  questionElements.forEach(element => {
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
 * Restart the current quiz
 */
export function restartQuiz() {
  const quizState = getQuizState();

  if (!quizState.fileName) {
    showNotification('No saved quiz state found', 'error');
    return;
  }

  const isLiveMode = quizState.isLiveMode;
  const loadingMessage = isLiveMode ? 'Restarting Live Test' : 'Restarting Quiz';
  const loadingSubtitle = 'Please wait while questions are being reloaded...';
  showLoadingScreen(loadingMessage, loadingSubtitle);

  clearQuizContainer();
  setAnsweredQuestions([]);
  resetQuizSubmission();

  setTimeout(() => {
    try {
      startQuizWithState(quizState);
      hideLoadingScreen();
    } catch (error) {
      console.error('Error during quiz restart:', error);
      hideLoadingScreen();
      showNotification('Failed to restart quiz. Please try again.', 'error');
    }
  }, 300);
}

/**
 * Start quiz with saved state
 */
function startQuizWithState(state) {
  const filteredQuestions = filterQuestionsByLevel(state.allQuestions, state.selectedLevels);

  const shuffledFullOrder = shuffle(filteredQuestions);
  updateQuizState({ originalQuestionOrder: shuffledFullOrder });
  const selectedQuestions = shuffledFullOrder.slice(0, state.questionCount);

  if (selectedQuestions.length === 0) {
    showNotification('No questions available for selected criteria', 'error');
    return;
  }

  displayQuestionsDirectly(selectedQuestions, state.isLiveMode);
}

/**
 * Update quiz with new level selections
 */
export function updateQuizWithNewLevels() {
  const quizState = getQuizState();
  if (!quizState.allQuestions) return;

  if (quizState.hasSubmitted) {
    showNotification('Cannot change levels after submission', 'error');
    return;
  }

  const selectedLevels = getSelectedLevels();
  updateQuizState({ selectedLevels });

  const currentAnswers = saveCurrentAnswers();

  const filteredQuestions = filterQuestionsByLevel(quizState.allQuestions, selectedLevels);

  // Preserve bank info during shuffle if it exists
  let shuffledFullOrder, shuffledBankInfo;
  if (quizState.bankInfo && quizState.bankInfo.length > 0) {
    const paired = filteredQuestions.map(q => {
      const originalIndex = quizState.allQuestions.indexOf(q);
      return { question: q, bank: quizState.bankInfo[originalIndex] || 'Unknown' };
    });

    const shuffledPairs = shuffle(paired);
    shuffledFullOrder = shuffledPairs.map(p => p.question);
    shuffledBankInfo = shuffledPairs.map(p => p.bank);
  } else {
    shuffledFullOrder = shuffle(filteredQuestions);
    shuffledBankInfo = null;
  }

  const globalSelectedCount = getGlobalSelectedCount();
  const selectedQuestions = shuffledFullOrder.slice(0, globalSelectedCount);

  updateQuizState({
    originalQuestionOrder: shuffledFullOrder,
    bankInfo: shuffledBankInfo ? shuffledBankInfo.slice(0, globalSelectedCount) : null
  });

  if (selectedQuestions.length === 0) {
    showNotification('No questions available for selected levels', 'error');
    return;
  }

  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  showLoading();
  disableAllControlsDuringLoad();

  selectedQuestions.forEach((questionText, index) => {
    const questionElement = createQuestionElement(questionText, index);
    quizContainer.appendChild(questionElement);
    addFadeInAnimation(questionElement);

    restoreAnswer(questionElement, questionText, currentAnswers, index);
  });

  setupResultsContainer(selectedQuestions.length);

  const liveTestCheckbox = getLiveTestCheckbox();
  if (quizState.isLiveMode && liveTestCheckbox && liveTestCheckbox.checked) {
    updateLiveScore();
  }

  requestAnimationFrame(() => {
    enableAllControlsAfterLoad();
    hideLoading();
    showNotification(`Updated to ${selectedLevels.length} levels with ${selectedQuestions.length} questions`, 'success');
  });
}

/**
 * Change question count
 */
export function changeQuestionCount(newCount) {
  const quizState = getQuizState();

  if (!quizState.allQuestions) {
    showNotification('Cannot change question count - no quiz data available', 'error');
    return;
  }

  if (quizState.hasSubmitted) {
    showNotification('Cannot change question count after submission', 'error');
    return;
  }

  updateQuizState({ questionCount: newCount });
  setGlobalSelectedCount(newCount);

  const currentAnswers = saveCurrentAnswers();

  const filteredQuestions = filterQuestionsByLevel(quizState.allQuestions, quizState.selectedLevels);

  let selectedQuestions;
  if (quizState.originalQuestionOrder) {
    selectedQuestions = quizState.originalQuestionOrder
      .filter(q => filteredQuestions.includes(q))
      .slice(0, newCount);

    // Update bankInfo to match new count
    if (quizState.bankInfo) {
      updateQuizState({ bankInfo: quizState.bankInfo.slice(0, newCount) });
    }
  } else {
    const shuffledFullOrder = shuffle(filteredQuestions);
    updateQuizState({ originalQuestionOrder: shuffledFullOrder });
    selectedQuestions = shuffledFullOrder.slice(0, newCount);
  }

  if (selectedQuestions.length === 0) {
    showNotification('No questions available for selected criteria', 'error');
    return;
  }

  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  selectedQuestions.forEach((questionText, index) => {
    const questionElement = createQuestionElement(questionText, index);
    quizContainer.appendChild(questionElement);
    addFadeInAnimation(questionElement);

    restoreAnswer(questionElement, questionText, currentAnswers, index);
  });

  setupResultsContainer(selectedQuestions.length);

  showNotification(`Updated to ${newCount} questions`, 'success');
}

/**
 * Save current answers before refresh
 */
function saveCurrentAnswers() {
  const currentAnswers = {};
  document.querySelectorAll('.question').forEach((questionDiv) => {
    const checkedRadio = questionDiv.querySelector('input[type="radio"]:checked');
    if (checkedRadio) {
      const questionText = questionDiv.querySelector('h3').textContent;
      currentAnswers[questionText] = {
        value: checkedRadio.value,
        isCorrect: checkedRadio.dataset.correct === "true"
      };
    }
  });
  return currentAnswers;
}

/**
 * Restore answer after refresh
 */
function restoreAnswer(questionElement, questionText, currentAnswers, index) {
  const questionTitle = questionText.split('\n')[0];
  const cleanTitle = questionTitle.replace(/\[IMG:[^\]]+\]/g, '').trim();

  if (currentAnswers[cleanTitle]) {
    const radios = questionElement.querySelectorAll('input[type="radio"]');
    const matchingRadio = Array.from(radios).find(radio => radio.value === currentAnswers[cleanTitle].value);
    if (matchingRadio) {
      matchingRadio.checked = true;
      const answerDiv = matchingRadio.closest('.answer');
      if (answerDiv) answerDiv.classList.add('selected');

      const liveTestCheckbox = getLiveTestCheckbox();
      if (liveTestCheckbox && liveTestCheckbox.checked) {
        updateLiveScore();
        highlightLiveAnswers(questionElement);
      }
    }
  }
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
    setTimeout(() => {
      scoreDisplay.remove();
    }, 300);
  }
  resetQuizSubmission();
  enableQuizControls();
}