// modules/scoring.js - Score Calculation and Display
import { getGrade, getScoreMessage } from './utils.js';
import { updateQuizState } from './state.js';
import { showNotification } from './ui/notifications.js';
import { hideSubmitButton } from './ui/progress.js';
import { disableAllAnswers } from './ui/quiz-display.js';
import { disableQuizControls } from './quiz-controls.js';

/**
 * Calculate and display quiz score
 */
export function calculateScore() {
  const questions = document.querySelectorAll('.question');
  let score = 0;
  let totalAnswered = 0;

  questions.forEach((questionDiv, index) => {
    const result = processQuestionForScoring(questionDiv, index);
    if (result.answered) {
      totalAnswered++;
      if (result.correct) {
        score++;
      }
    }
  });

  updateQuizState({ hasSubmitted: true });
  disableQuizControls();
  displayFinalScore(score, questions.length, totalAnswered);
  hideSubmitButton();
  disableAllAnswers();
  showNotification(`Quiz completed! Score: ${score}/${questions.length}`, 'success');
}

/**
 * Process a single question for scoring
 * @returns {Object} Result with answered and correct flags
 */
function processQuestionForScoring(questionDiv, index) {
  const radios = questionDiv.querySelectorAll('input[type="radio"]');
  const correctAnswer = Array.from(radios).find(radio => radio.dataset.correct === "true");
  const userAnswer = Array.from(radios).find(radio => radio.checked);
  const roundBox = document.querySelector(`#results-container .round-box[data-question-index="${index}"]`);
  const questionHeader = questionDiv.querySelector('h3');

  // Clear previous styling
  radios.forEach(radio => {
    const answerDiv = radio.closest('.answer');
    answerDiv.classList.remove('correct', 'incorrect');
  });

  const existingIndicator = questionHeader.querySelector('.result-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  let result = { answered: false, correct: false };

  if (userAnswer) {
    result.answered = true;
    result.correct = (userAnswer === correctAnswer);

    if (result.correct) {
      markQuestionCorrect(userAnswer, roundBox, questionHeader);
    } else {
      markQuestionIncorrect(userAnswer, correctAnswer, roundBox, questionHeader);
    }
  } else {
    markQuestionUnanswered(correctAnswer, roundBox, questionHeader);
  }

  return result;
}

/**
 * Mark question as correct
 */
function markQuestionCorrect(userAnswer, roundBox, questionHeader) {
  roundBox.classList.remove('unanswered', 'answered', 'incorrect');
  roundBox.classList.add('correct');
  userAnswer.closest('.answer').classList.add('correct');

  const checkmark = document.createElement('i');
  checkmark.className = 'fas fa-check-circle result-indicator correct-indicator';
  checkmark.style.cssText = 'color: var(--success-color); margin-left: 10px; font-size: 1.1em;';
  questionHeader.appendChild(checkmark);
}

/**
 * Mark question as incorrect
 */
function markQuestionIncorrect(userAnswer, correctAnswer, roundBox, questionHeader) {
  roundBox.classList.remove('unanswered', 'answered', 'correct');
  roundBox.classList.add('incorrect');
  userAnswer.closest('.answer').classList.add('incorrect');

  const cross = document.createElement('i');
  cross.className = 'fas fa-times-circle result-indicator incorrect-indicator';
  cross.style.cssText = 'color: var(--error-color); margin-left: 10px; font-size: 1.1em;';
  questionHeader.appendChild(cross);

  if (correctAnswer) {
    correctAnswer.closest('.answer').classList.add('correct');
  }
}

/**
 * Mark question as unanswered
 */
function markQuestionUnanswered(correctAnswer, roundBox, questionHeader) {
  roundBox.classList.remove('answered', 'correct', 'incorrect');
  roundBox.classList.add('unanswered');

  const cross = document.createElement('i');
  cross.className = 'fas fa-minus-circle result-indicator unanswered-indicator';
  cross.style.cssText = 'color: var(--text-muted); margin-left: 10px; font-size: 1.1em;';
  questionHeader.appendChild(cross);

  if (correctAnswer) {
    correctAnswer.closest('.answer').classList.add('correct');
  }
}

/**
 * Display final score in floating box
 */
function displayFinalScore(score, total, answered) {
  const existingScore = document.getElementById('floating-score-display');
  if (existingScore) {
    existingScore.remove();
  }

  const scoreDisplay = document.createElement('div');
  scoreDisplay.id = 'floating-score-display';
  scoreDisplay.className = 'floating-score-box';

  const percentage = (score / total * 100).toFixed(1);
  const grade = getGrade(percentage);

  scoreDisplay.innerHTML = `
    <div class="score-header">
      <i class="fas fa-trophy"></i>
      <h3>Quiz Complete!</h3>
      <button class="close-score-btn" onclick="window.closeScoreDisplay()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="score-main">
      <div class="score-value">${score}/${total}</div>
      <div class="score-percentage">${percentage}%</div>
      <div class="grade grade-${grade.toLowerCase().replace('+', 'plus')}">${grade}</div>
    </div>
    <div class="score-details">
      <div class="score-stat">
        <span class="stat-label">Answered:</span>
        <span class="stat-value">${answered}/${total}</span>
      </div>
      <div class="score-stat">
        <span class="stat-label">Correct:</span>
        <span class="stat-value">${score}/${answered || total}</span>
      </div>
    </div>
    <div class="score-message">
      ${getScoreMessage(percentage)}
    </div>
  `;

  document.body.appendChild(scoreDisplay);

  setTimeout(() => {
    scoreDisplay.classList.add('show');
  }, 100);
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
}

// Make closeScoreDisplay available globally for inline onclick
window.closeScoreDisplay = closeScoreDisplay;