// modules/app.js - Application Initialization
import { listQuizzes } from './ui/navigation.js';

/**
 * Initialize the quiz application
 */
export function initializeApp() {
  listQuizzes();
  setupEventListeners();
  console.log('✅ Quiz application core initialized');
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  // Home button click handler
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      listQuizzes('');
    });
  }

  // Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const resultsContainer = document.getElementById('results-container');
      if (resultsContainer && resultsContainer.style.display === 'block') {
        resultsContainer.style.display = 'none';
      }
    }
  });
}