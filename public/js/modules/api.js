// modules/api.js - API and Data Fetching Operations
import CONFIG, { getQuizFilePath } from '../config.js';

/**
 * Fetch list of available quizzes and folders
 * @param {string} folder - Optional folder path
 * @returns {Promise<{folders: string[], files: string[]}>}
 */
export async function fetchQuizList(folder = '') {
  const url = CONFIG.API_LIST_QUIZZES + (folder ? `?folder=${encodeURIComponent(folder)}` : '');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch quiz content from file
 * @param {string} fileName - Name of the quiz file (can include folder path)
 * @returns {Promise<string>} Quiz content as text
 */
export async function fetchQuizContent(fileName) {
  const response = await fetch(getQuizFilePath(fileName));

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}