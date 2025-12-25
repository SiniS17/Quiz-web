// modules/app.js - Application Initialization with Logo Navigation
import { listQuizzes, goBackToFolder } from './ui/navigation.js';
import { getCurrentFolder } from './state.js';

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

  // Logo click handler - go back to folder
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      const currentFolder = getCurrentFolder();

      // Only show confirmation if we're in a quiz (folder is set)
      if (currentFolder !== undefined && currentFolder !== null) {
        // Check if there's an active quiz
        const quizContainer = document.getElementById('quiz-container');
        const hasActiveQuiz = quizContainer && quizContainer.innerHTML.trim() !== '';

        if (hasActiveQuiz) {
          goBackToFolder();
        } else {
          // No active quiz, just go to home
          listQuizzes('');
        }
      }
    });

    // Add visual feedback
    logo.style.cursor = 'pointer';
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