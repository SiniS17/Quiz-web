// modules/app.js - Application Initialization with Client-Side Routing
import { listQuizzes, goBackToFolder, goHomeWithConfirmation, initializeQuiz } from './ui/navigation.js';
import { getCurrentFolder } from './state.js';

/**
 * Handle routing based on URL hash
 * Routes:
 * - #/                      -> Home (List root quizzes)
 * - #/folder/path/to/dir    -> List quizzes in folder
 * - #/quiz/path/to/quiz.txt -> Start specific quiz
 */
function handleRoute() {
  const hash = window.location.hash;

  // Default route (Home)
  if (!hash || hash === '#/' || hash === '#') {
    listQuizzes('');
    return;
  }

  // Parse hash: #/type/path/parts...
  // Example: #/folder/Category%201
  const parts = hash.substring(2).split('/'); // Remove #/
  const type = parts[0];
  const encodedPath = parts.slice(1).join('/'); // Rejoin the rest
  // Important: decode the individual parts to form the valid path
  const path = parts.slice(1).map(p => decodeURIComponent(p)).join('/');

  console.log(`📍 Routing to: ${type} -> ${path}`);

  if (type === 'folder') {
    listQuizzes(path);
  }
  else if (type === 'quiz') {
    // Corrected Logic:
    // initializeQuiz expects the FIRST argument to be the full relative path
    // (e.g. "A320/ATA.txt") which matches 'path'.
    // It uses the second argument 'folder' for state tracking.

    const lastSlashIndex = path.lastIndexOf('/');
    let folder = '';

    if (lastSlashIndex !== -1) {
      folder = path.substring(0, lastSlashIndex);
    }

    // Pass 'path' as the filename because the app expects the full path string
    // for the API fetch to work correctly.
    initializeQuiz(path, folder);
  }
}

/**
 * Initialize the quiz application
 */
export function initializeApp() {
  // 1. Setup Router Listeners
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);

  // 2. Setup UI Event Listeners
  setupEventListeners();

  // 3. Trigger initial route if page is loaded with no hash
  if (!window.location.hash) {
    window.location.hash = '#/';
  } else {
    // If hash exists, load it directly
    handleRoute();
  }

  console.log('✅ Quiz application initialized with Router');
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  // Home button click handler
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const quizContainer = document.getElementById('quiz-container');
      const hasActiveQuiz = quizContainer && quizContainer.innerHTML.trim() !== '';

      if (hasActiveQuiz) {
        // Use the confirmation logic, but redirect via hash on success
        if (confirm('Return to Home? Your progress will be lost.')) {
           window.location.hash = '#/';
        }
      } else {
        window.location.hash = '#/';
      }
    });
  }

  // Logo click handler - Go up one level or home
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      const currentFolder = getCurrentFolder();

      // If inside a quiz or deep folder, go up
      if (currentFolder) {
        // If in a quiz (container not empty), prompt first
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer && quizContainer.innerHTML.trim() !== '') {
             if (confirm('Go back to folder? Progress will be lost.')) {
                 window.location.hash = `#/folder/${currentFolder.split('/').map(encodeURIComponent).join('/')}`;
             }
        } else {
             // Just navigating folders
             window.location.hash = '#/';
        }
      } else {
        window.location.hash = '#/';
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
