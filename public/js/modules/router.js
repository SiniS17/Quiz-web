import { listQuizzes, initializeQuiz } from './ui/navigation.js';
import { getCurrentFolder } from './state.js';

/**
 * Handle routing based on URL hash
 */
export function handleRoute() {
  const hash = window.location.hash;

  // Default route (Home)
  if (!hash || hash === '#/') {
    listQuizzes('');
    return;
  }

  // Parse hash: #/type/path
  // Example: #/folder/Category%201  or  #/quiz/Category%201/quiz1.txt
  const parts = hash.substring(2).split('/'); // Remove #/
  const type = parts[0];
  const path = parts.slice(1).map(decodeURIComponent).join('/');

  console.log(`📍 Navigating to: ${type} -> ${path}`);

  if (type === 'folder') {
    listQuizzes(path);
  } else if (type === 'quiz') {
    // Split path into folder and filename for initializeQuiz
    // Assuming path is "folder/subfolder/file.txt"
    const lastSlashIndex = path.lastIndexOf('/');
    let folder = '';
    let file = path;

    if (lastSlashIndex !== -1) {
      folder = path.substring(0, lastSlashIndex);
      file = path.substring(lastSlashIndex + 1);
    }

    initializeQuiz(file, folder);
  }
}

/**
 * Initialize the router
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);
}

/**
 * Navigate to a specific path programmatically
 */
export function navigateTo(type, path) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  window.location.hash = `#/${type}/${encodedPath}`;
}
