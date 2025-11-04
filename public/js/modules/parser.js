// modules/parser.js - Question Parsing Logic
import { clearLevelCounts, incrementLevelCount } from './state.js';

/**
 * Parse question text and extract image references
 * @param {string} questionText - Raw question text
 * @returns {Object} Parsed question with image info
 */
export function parseQuestionWithImages(questionText) {
  const imgPattern = /\[IMG:([^\]]+)\]/g;

  let hasImages = false;
  let images = [];

  let match;
  while ((match = imgPattern.exec(questionText)) !== null) {
    hasImages = true;
    images.push(match[1]);
  }

  return {
    hasImages,
    images,
    cleanText: questionText
  };
}

/**
 * Parse raw quiz text into structured questions
 * @param {string[]} lines - Lines of quiz text
 * @param {string} fileName - Quiz file name (determines format)
 * @returns {string[]} Array of question texts
 */
export function parseQuestions(lines, fileName) {
  const questions = [];
  let currentQuestion = [];
  let questionCount = 0;

  const hasABCD = fileName.includes('(ABCD)');
  const hasVariableAnswers = fileName.includes('(-)');

  clearLevelCounts();

  if (hasVariableAnswers) {
    parseVariableAnswerQuestions(lines, questions);
  } else {
    parseFixedAnswerQuestions(lines, questions, hasABCD);
  }

  return questions;
}

/**
 * Parse questions with variable number of answers
 * @param {string[]} lines - Quiz lines
 * @param {string[]} questions - Output array
 */
function parseVariableAnswerQuestions(lines, questions) {
  let currentQuestion = [];

  lines.forEach((line) => {
    if (line.trim() === '') {
      if (currentQuestion.length > 0) {
        const questionText = currentQuestion.join('\n');
        questions.push(questionText);
        extractAndCountLevel(questionText);
        currentQuestion = [];
      }
    } else {
      currentQuestion.push(line);
    }
  });

  if (currentQuestion.length > 0) {
    const questionText = currentQuestion.join('\n');
    questions.push(questionText);
    extractAndCountLevel(questionText);
  }
}

/**
 * Parse questions with fixed number of answers
 * @param {string[]} lines - Quiz lines
 * @param {string[]} questions - Output array
 * @param {boolean} hasABCD - Whether quiz has ABCD format
 */
function parseFixedAnswerQuestions(lines, questions, hasABCD) {
  const answersPerQuestion = hasABCD ? 5 : 4;
  let currentQuestion = [];

  lines.forEach((line, index) => {
    if ((index > 0 && index % answersPerQuestion === 0) || index === 0) {
      if (currentQuestion.length > 0) {
        const questionText = currentQuestion.join('\n');
        questions.push(questionText);
        extractAndCountLevel(questionText);
      }
      currentQuestion = [line];
    } else {
      currentQuestion.push(line);
    }
  });

  if (currentQuestion.length > 0) {
    const questionText = currentQuestion.join('\n');
    questions.push(questionText);
    extractAndCountLevel(questionText);
  }
}

/**
 * Extract level from question and increment count
 * @param {string} questionText - Question text
 */
function extractAndCountLevel(questionText) {
  const levelMatch = questionText.match(/\(\s*(level|Level)\s*(\d+)\)/);
  const level = levelMatch ? parseInt(levelMatch[2]) : 1;
  incrementLevelCount(level);
}

/**
 * Filter questions by selected levels
 * @param {string[]} questions - All questions
 * @param {number[]} selectedLevels - Selected level numbers
 * @returns {string[]} Filtered questions
 */
export function filterQuestionsByLevel(questions, selectedLevels) {
  if (selectedLevels.length === 0) return questions;

  return questions.filter(question => {
    const levelMatch = question.match(/\(\s*(level|Level)\s*(\d+)\)/);
    const level = levelMatch ? parseInt(levelMatch[2]) : 1;
    return selectedLevels.includes(level);
  });
}

/**
 * Get selected levels from checkboxes
 * @returns {number[]} Array of selected level numbers
 */
export function getSelectedLevels() {
  const checkboxes = document.querySelectorAll('#level-checkboxes input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => parseInt(cb.id.split('-')[1]));
}