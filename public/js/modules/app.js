// public/js/modules/app.js - Updated with routing support

import { router, navigate } from './router.js';
import { listQuizzes } from './ui/navigation.js';
import { loadQuiz } from './quiz-loader.js';
import { setCurrentFolder } from './state.js';

/**
 * Initialize the quiz application with routing
 */
export function initializeApp() {
  setupRoutes();
  setupEventListeners();

  // Initialize router - this will handle the current URL
  router.init();

  console.log('✅ Quiz application initialized with routing');
}

/**
 * Setup application routes
 */
function setupRoutes() {
  // Home route - show all quizzes/folders
  router.on('/', () => {
    console.log('📍 Route: Home');
    listQuizzes('');
  });

  // Folder route - show quizzes in a folder
  // Path uses ~ as separator: /folder/basic~advanced
  router.on('/folder/:path', (params) => {
    const folderPath = params.path.replace(/~/g, '/');
    console.log('📍 Route: Folder ->', folderPath);
    setCurrentFolder(folderPath);
    listQuizzes(folderPath);
  });

  // Quiz route - load and display a quiz
  // Path uses ~ as separator: /quiz/basic~test.txt
  router.on('/quiz/:path', (params) => {
    const quizPath = params.path.replace(/~/g, '/');
    console.log('📍 Route: Quiz ->', quizPath);

    // Extract folder from quiz path
    const parts = quizPath.split('/');
    const folder = parts.slice(0, -1).join('/');
    setCurrentFolder(folder);

    loadQuiz(quizPath);
  });
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
      goHomeWithConfirmation();
    });
  }

  // Logo click handler - smart back navigation
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      handleLogoClick();
    });
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

/**
 * Handle logo click - smart back navigation
 */
function handleLogoClick() {
  const path = router.getPath();

  if (path.startsWith('/quiz/')) {
    // In a quiz - go back to folder
    const quizPath = path.replace('/quiz/', '').replace(/~/g, '/');
    const parts = quizPath.split('/');
    const folder = parts.slice(0, -1).join('/');

    if (folder) {
      navigate(`/folder/${folder.replace(/\//g, '~')}`);
    } else {
      navigate('/');
    }
  } else if (path.startsWith('/folder/')) {
    // In a folder - go to parent folder
    const folderPath = path.replace('/folder/', '');
    const parts = folderPath.split('~');
    const parent = parts.slice(0, -1).join('~');

    if (parent) {
      navigate(`/folder/${parent}`);
    } else {
      navigate('/');
    }
  }
  // Already at home - do nothing
}

/**
 * Go home with confirmation if quiz is active
 */
function goHomeWithConfirmation() {
  const path = router.getPath();
  const quizContainer = document.getElementById('quiz-container');
  const hasActiveQuiz = quizContainer && quizContainer.innerHTML.trim() !== '';

  if (hasActiveQuiz && path.startsWith('/quiz/')) {
    if (confirm('Return to home? Your current progress will be lost.')) {
      navigate('/');
    }
  } else {
    navigate('/');
  }
}

// Make navigate function globally available for inline handlers
if (typeof window !== 'undefined') {
  window.navigate = navigate;
  window.router = router;
}

export { navigate };