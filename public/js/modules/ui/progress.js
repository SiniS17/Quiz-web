// modules/ui/progress.js - Question Progress Tracking with Invalid Question Support
import { scrollToQuestion } from '../utils.js';
import { getLiveTestCheckbox } from '../live-test.js';
import { setAnsweredQuestions } from '../state.js';

/**
 * Setup results container with progress boxes
 * @param {number} questionCount - Number of questions
 */
export function setupResultsContainer(questionCount) {
  const resultsContainer = document.getElementById('results-container');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = '';
  resultsContainer.className = 'results-panel';
  setAnsweredQuestions(new Array(questionCount).fill(false));

  const header = document.createElement('h3');
  header.innerHTML = '<i class="fas fa-clipboard-list"></i> Question Progress';
  resultsContainer.appendChild(header);

  for (let i = 0; i < questionCount; i++) {
    const roundBox = document.createElement('div');
    roundBox.className = 'round-box unanswered';
    roundBox.textContent = i + 1;
    roundBox.setAttribute('data-question-index', i);
    roundBox.onclick = () => scrollToQuestion(i);
    resultsContainer.appendChild(roundBox);

    // Mark as invalid if question is invalid (check after render)
    setTimeout(() => {
      const questionDiv = document.querySelector(`#question-${i}`);
      if (questionDiv && questionDiv.classList.contains('question-invalid')) {
        roundBox.classList.remove('unanswered');
        roundBox.classList.add('invalid');
        roundBox.title = 'Invalid question - cannot be answered';
      }
    }, 100);
  }

  createResultsButtons(resultsContainer);
}

/**
 * Create results action buttons with confirmation
 */
function createResultsButtons(container) {
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'results-buttons';
  buttonsContainer.style.cssText = `
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  `;

  const submitBtn = document.createElement('button');
  submitBtn.className = 'primary-btn';
  submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
  submitBtn.onclick = () => {
    // Import dynamically to avoid circular dependency
    import('../scoring.js').then(module => module.calculateScore());
  };

  const tryAgainBtn = document.createElement('button');
  tryAgainBtn.className = 'secondary-btn';
  tryAgainBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
  tryAgainBtn.onclick = () => {
    import('../quiz-manager.js').then(module => {
      module.closeScoreDisplay();
      resetProgressBoxes();
      module.restartQuiz();
    });
  };

  const homeBtn = document.createElement('button');
  homeBtn.className = 'secondary-btn';
  homeBtn.innerHTML = '<i class="fas fa-home"></i> Home';
  homeBtn.onclick = () => {
    // Use the new confirmation function
    if (window.goHomeWithConfirmation) {
      window.goHomeWithConfirmation();
    } else {
      // Fallback
      import('./navigation.js').then(module => module.listQuizzes());
    }
  };

  buttonsContainer.appendChild(submitBtn);
  buttonsContainer.appendChild(tryAgainBtn);
  buttonsContainer.appendChild(homeBtn);
  container.appendChild(buttonsContainer);
}

/**
 * Update progress indicator for a question
 * @param {number} questionIndex - Question index
 */
export function updateProgressIndicator(questionIndex) {
  const roundBox = document.querySelector(`#results-container .round-box[data-question-index="${questionIndex}"]`);

  if (!roundBox) {
    console.log('❌ Progress box not found for question:', questionIndex);
    return;
  }

  // Check if question is invalid
  const questionDiv = document.querySelector(`#question-${questionIndex}`);
  if (questionDiv && questionDiv.classList.contains('question-invalid')) {
    roundBox.classList.remove('unanswered', 'answered', 'correct', 'incorrect');
    roundBox.classList.add('invalid');
    roundBox.title = 'Invalid question - cannot be answered';
    return;
  }

  roundBox.classList.remove('unanswered', 'answered', 'correct', 'incorrect', 'invalid');

  const liveTestCheckbox = getLiveTestCheckbox();
  if (liveTestCheckbox && liveTestCheckbox.checked) {
    updateProgressForLiveTest(questionIndex, roundBox);
  } else {
    roundBox.classList.add('answered');
  }
}

/**
 * Update progress indicator for live test mode
 */
function updateProgressForLiveTest(questionIndex, roundBox) {
  const questionDiv = document.querySelector(`#question-${questionIndex}`);

  if (questionDiv) {
    const radios = questionDiv.querySelectorAll('input[type="radio"]');
    const correctAnswer = Array.from(radios).find(radio => radio.dataset.correct === "true");
    const userAnswer = Array.from(radios).find(radio => radio.checked);

    if (userAnswer) {
      if (userAnswer === correctAnswer) {
        roundBox.classList.add('correct');
      } else {
        roundBox.classList.add('incorrect');
      }
    } else {
      roundBox.classList.add('unanswered');
    }
  }
}

/**
 * Reset all progress boxes to unanswered state
 */
export function resetProgressBoxes() {
  const roundBoxes = document.querySelectorAll('#results-container .round-box');
  roundBoxes.forEach((box, index) => {
    // Check if question is invalid
    const questionDiv = document.querySelector(`#question-${index}`);
    if (questionDiv && questionDiv.classList.contains('question-invalid')) {
      box.className = 'round-box invalid';
      box.title = 'Invalid question - cannot be answered';
    } else {
      box.className = 'round-box unanswered';
    }
  });
}

/**
 * Hide submit button (after submission)
 */
export function hideSubmitButton() {
  const submitBtn = document.querySelector('#results-container .primary-btn');
  if (submitBtn && submitBtn.textContent.includes('Submit')) {
    submitBtn.style.display = 'none';
  }
}