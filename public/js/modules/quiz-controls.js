// modules/quiz-controls.js - Quiz Control State Management

/**
 * Disable all quiz controls
 */
export function disableQuizControls() {
  const questionCountInput = document.getElementById('question-count');
  const liveTestCheckbox = document.getElementById('live-test-checkbox');
  const levelCheckboxes = document.querySelectorAll('#level-checkboxes input[type="checkbox"]');

  if (questionCountInput) questionCountInput.disabled = true;
  if (liveTestCheckbox) liveTestCheckbox.disabled = true;
  levelCheckboxes.forEach(checkbox => checkbox.disabled = true);
}

/**
 * Enable all quiz controls
 */
export function enableQuizControls() {
  const questionCountInput = document.getElementById('question-count');
  const liveTestCheckbox = document.getElementById('live-test-checkbox');
  const levelCheckboxes = document.querySelectorAll('#level-checkboxes input[type="checkbox"]');

  if (questionCountInput) questionCountInput.disabled = false;
  if (liveTestCheckbox) liveTestCheckbox.disabled = false;
  levelCheckboxes.forEach(checkbox => checkbox.disabled = false);

  const allAnswers = document.querySelectorAll('.answer');
  allAnswers.forEach(answer => {
    answer.style.cursor = 'pointer';
    answer.style.opacity = '1';
    answer.style.pointerEvents = 'auto';
  });
}