// modules/live-test.js - Live Test Functionality
import { getQuizState, updateQuizState } from './state.js';
import { showNotification } from './ui/notifications.js';
import { showLoadingScreen, hideLoadingScreen } from './ui/loading.js';

let liveTestCheckbox = null;
let liveTestHandler = null;

/**
 * Get live test checkbox element
 * @returns {HTMLElement|null}
 */
export function getLiveTestCheckbox() {
  return liveTestCheckbox;
}

/**
 * Setup live test checkbox and handlers
 */
export function setupLiveTestInTopControls() {
  liveTestCheckbox = document.getElementById('live-test-checkbox');
  if (!liveTestCheckbox) return;

  if (liveTestHandler) {
    liveTestCheckbox.removeEventListener('change', liveTestHandler);
  }

  liveTestHandler = handleLiveTestToggle;
  liveTestCheckbox.addEventListener('change', liveTestHandler);

  const quizState = getQuizState();
  if (quizState.isLiveMode) {
    liveTestCheckbox.checked = true;
    applyLiveTestUIState(true);
  }

  console.log('✅ Live test event handler properly attached');
}

/**
 * Handle live test checkbox toggle
 */
function handleLiveTestToggle() {
  const isLiveMode = liveTestCheckbox.checked;
  const quizState = getQuizState();
  const previousLiveMode = quizState.isLiveMode;

  if (quizState.fileName) {
    updateQuizState({ isLiveMode });
  }

  if (quizState.fileName && previousLiveMode !== isLiveMode) {
    try {
      if (isLiveMode) {
        showNotification('Live test mode enabled - restarting quiz with live feedback!', 'info');
        showLoadingScreen('Enabling Live Test', 'Please wait while the quiz is being prepared...');
      } else {
        showNotification('Live test mode disabled - restarting quiz', 'info');
        showLoadingScreen('Restarting Quiz', 'Please wait while questions are being loaded...');
      }

      setTimeout(() => {
        try {
          import('./quiz-manager.js').then(module => module.restartQuiz());
        } catch (error) {
          console.error('Error during quiz restart:', error);
          hideLoadingScreen();
          showNotification('Failed to restart quiz. Please try again.', 'error');
        }
      }, 500);
    } catch (error) {
      console.error('Error in live test toggle:', error);
      hideLoadingScreen();
      showNotification('An error occurred. Please try again.', 'error');
    }
  } else {
    applyLiveTestUIState(isLiveMode);
  }
}

/**
 * Apply live test UI state
 * @param {boolean} isLiveMode - Whether live mode is enabled
 */
export function applyLiveTestUIState(isLiveMode) {
  if (isLiveMode) {
    setupLiveTestListeners();
    updateLiveScore();
  } else {
    removeLiveTestEffects();
    hideLiveScore();
  }
}

/**
 * Setup listeners for live test
 */
function setupLiveTestListeners() {
  if (liveTestCheckbox && liveTestCheckbox.checked) {
    updateLiveScore();
    const questions = document.querySelectorAll('.question');
    questions.forEach(questionDiv => {
      const checkedRadio = questionDiv.querySelector('input[type="radio"]:checked');
      if (checkedRadio) {
        highlightLiveAnswers(questionDiv);
      }
    });
  }
}

/**
 * Highlight correct/incorrect answers in live mode
 * @param {HTMLElement} questionDiv - Question element
 */
export function highlightLiveAnswers(questionDiv) {
  const radios = questionDiv.querySelectorAll('input[type="radio"]');
  const correctAnswer = Array.from(radios).find(radio => radio.dataset.correct === "true");
  const userAnswer = Array.from(radios).find(radio => radio.checked);

  radios.forEach(radio => {
    const answerDiv = radio.closest('.answer');
    answerDiv.classList.remove('correct', 'incorrect');

    if (radio === correctAnswer) {
      answerDiv.classList.add('correct');
    } else if (radio === userAnswer && radio !== correctAnswer) {
      answerDiv.classList.add('incorrect');
    }
  });
}

/**
 * Update live score display
 */
export function updateLiveScore() {
  if (!liveTestCheckbox || !liveTestCheckbox.checked) return;

  const questions = document.querySelectorAll('.question');
  let correct = 0;
  let answered = 0;

  questions.forEach(questionDiv => {
    const radios = questionDiv.querySelectorAll('input[type="radio"]');
    const correctAnswer = Array.from(radios).find(radio => radio.dataset.correct === "true");
    const userAnswer = Array.from(radios).find(radio => radio.checked);

    if (userAnswer) {
      answered++;
      if (userAnswer === correctAnswer) {
        correct++;
      }
    }
  });

  showLiveScore(correct, answered);
}

/**
 * Show live score floating indicator
 */
function showLiveScore(correct, answered) {
  let floatingScore = document.getElementById('floating-live-score');

  if (!floatingScore) {
    floatingScore = document.createElement('div');
    floatingScore.id = 'floating-live-score';
    floatingScore.className = 'floating-live-score';
    document.body.appendChild(floatingScore);
  }

  const percentage = answered === 0 ? 0 : (correct / answered * 100).toFixed(1);
  floatingScore.innerHTML = `
    <div class="score-text">
      <i class="fas fa-chart-line score-icon"></i>
      <span>${percentage}% (${correct}/${answered})</span>
    </div>
  `;

  setTimeout(() => {
    floatingScore.classList.add('show');
  }, 100);
}

/**
 * Hide live score display
 */
function hideLiveScore() {
  const floatingScore = document.getElementById('floating-live-score');
  if (floatingScore) {
    floatingScore.classList.remove('show');
    setTimeout(() => {
      floatingScore.remove();
    }, 300);
  }
}

/**
 * Remove live test visual effects
 */
function removeLiveTestEffects() {
  const answers = document.querySelectorAll('.answer');
  answers.forEach(answer => {
    answer.classList.remove('correct', 'incorrect');
  });
}