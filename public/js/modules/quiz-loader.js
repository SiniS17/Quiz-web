// modules/quiz-loader.js - Quiz Content Loading with Flexible Level Display
import { fetchQuizContent } from './api.js';
import { parseQuestions, sortLevelsForDisplay } from './parser.js';
import { setSelectedFileName, getLevelCounts } from './state.js';
import { updateQuizTitle } from './ui/navigation.js';
import { showNotification } from './ui/notifications.js';
import { enableAllControlsAfterLoad, hideLoading } from './ui/loading.js';
import { showTopControls } from './ui/controls.js';
import { createTopLevelCheckboxes, setupTopQuestionCountInput } from './quiz-settings.js';
import { displayQuestions } from './quiz-manager.js';

/**
 * Load quiz from file
 * @param {string} fileName - Quiz file name
 */
export function loadQuiz(fileName) {
  setSelectedFileName(fileName);
  updateQuizTitle(fileName.replace('.txt', '').replace(' (-)', ''));
  clearQuizContainer();

  fetchQuizContent(fileName)
    .then(text => {
      processQuizDataAndStart(text, fileName);
      showNotification('Quiz loaded successfully!', 'success');
    })
    .catch(error => {
      enableAllControlsAfterLoad();
      hideLoading();
      console.error('Error loading quiz:', error);
      showNotification('Error loading quiz. Please try again.', 'error');
    });
}

/**
 * Process quiz data and start quiz
 * @param {string} text - Raw quiz text
 * @param {string} fileName - File name
 */
function processQuizDataAndStart(text, fileName) {
  clearLevelCheckboxes();

  const hasVariableAnswers = fileName.includes('(-)');
  const lines = hasVariableAnswers
    ? text.split('\n')
    : text.split('\n').filter(line => line.trim() !== '');

  const questions = parseQuestions(lines, fileName);

  showTopControls();
  updateQuizInfo(questions.length);
  createTopLevelCheckboxes();
  setupTopQuestionCountInput(questions);

  hideQuizList();
  displayQuestions(questions);
}

/**
 * Update quiz info display with flexible level information
 * @param {number} questionCount - Total questions
 */
function updateQuizInfo(questionCount) {
  const maxQuestionsInfo = document.getElementById('max-questions-info');
  if (maxQuestionsInfo) {
    const levelCounts = getLevelCounts();
    const sortedLevels = sortLevelsForDisplay(levelCounts);

    let levelInfo = sortedLevels
      .map(([level, count]) => {
        // Format display: if it's a number, show as "Level X"
        const isNumber = !isNaN(parseInt(level)) && String(parseInt(level)) === level;
        const displayName = isNumber ? `Level ${level}` : level;
        return `${displayName}: ${count}`;
      })
      .join(', ');

    maxQuestionsInfo.innerHTML = `
      <strong>Total questions: ${questionCount}</strong><br>
      <small>${levelInfo}</small>
    `;
  }
}

/**
 * Clear quiz container
 */
function clearQuizContainer() {
  const container = document.getElementById('quiz-container');
  if (container) {
    container.innerHTML = '';
    container.className = '';
  }
}

/**
 * Hide quiz list
 */
function hideQuizList() {
  const quizListContainer = document.getElementById('quiz-list-container');
  if (quizListContainer) {
    quizListContainer.style.display = 'none';
  }
}

/**
 * Clear level checkboxes
 */
function clearLevelCheckboxes() {
  const container = document.getElementById('level-checkboxes');
  if (container) {
    container.innerHTML = '';
  }
}