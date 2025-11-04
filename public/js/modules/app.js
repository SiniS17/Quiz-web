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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const resultsContainer = document.getElementById('results-container');
      if (resultsContainer && resultsContainer.style.display === 'block') {
        resultsContainer.style.display = 'none';
      }
    }
  });
}