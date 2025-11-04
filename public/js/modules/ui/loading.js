// modules/ui/loading.js - Loading Screen Management

/**
 * Show loading screen
 * @param {string} message - Main loading message
 * @param {string} subtitle - Subtitle message
 */
export function showLoading(message = 'Loading...', subtitle = 'Please wait') {
  showLoadingScreen(message, subtitle);
}

/**
 * Hide loading screen
 */
export function hideLoading() {
  hideLoadingScreen();
}

/**
 * Show full loading overlay
 * @param {string} message - Main message
 * @param {string} subtitle - Subtitle message
 */
export function showLoadingScreen(message = 'Loading...', subtitle = 'Please wait...') {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = overlay.querySelector('.loading-text');
  const loadingSubtitle = overlay.querySelector('.loading-subtitle');

  if (loadingText) loadingText.textContent = message;
  if (loadingSubtitle) loadingSubtitle.textContent = subtitle;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide loading overlay
 */
export function hideLoadingScreen() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.remove('show');
  document.body.style.overflow = 'auto';
}

/**
 * Disable all controls during loading
 */
export function disableAllControlsDuringLoad() {
  const questionCountInput = document.getElementById('question-count');
  const liveTestCheckbox = document.getElementById('live-test-checkbox');
  const levelCheckboxes = document.querySelectorAll('#level-checkboxes input[type="checkbox"]');

  if (questionCountInput) questionCountInput.disabled = true;
  if (liveTestCheckbox) liveTestCheckbox.disabled = true;
  levelCheckboxes.forEach(checkbox => checkbox.disabled = true);

  const quizBoxes = document.querySelectorAll('.quiz-box, .folder-select');
  quizBoxes.forEach(box => {
    box.style.pointerEvents = 'none';
    box.style.opacity = '0.6';
  });
}

/**
 * Enable all controls after loading
 */
export function enableAllControlsAfterLoad() {
  const questionCountInput = document.getElementById('question-count');
  const liveTestCheckbox = document.getElementById('live-test-checkbox');
  const levelCheckboxes = document.querySelectorAll('#level-checkboxes input[type="checkbox"]');

  if (questionCountInput) questionCountInput.disabled = false;
  if (liveTestCheckbox) liveTestCheckbox.disabled = false;
  levelCheckboxes.forEach(checkbox => checkbox.disabled = false);

  const quizBoxes = document.querySelectorAll('.quiz-box, .folder-select');
  quizBoxes.forEach(box => {
    box.style.pointerEvents = 'auto';
    box.style.opacity = '1';
  });
}