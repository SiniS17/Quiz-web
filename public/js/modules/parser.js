// modules/parser.js - Question Parsing Logic with Multi-Quiz Level Recounting
import { clearLevelCounts, incrementLevelCount } from './state.js';
import { getLevelCounts } from './state.js';


function normalizeLevel(level) {
  const lower = level.toLowerCase();

  // Standard numbered levels
  const match = lower.match(/^level\s*(\d+)$/);
  if (match) {
    return `Level ${match[1]}`;
  }

  // Known text levels
  if (lower === 'no level') return 'No level';
  if (lower === 'not clear') return 'Not clear';

  // Fallback: capitalize first letter only
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}


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
 * All quizzes now use blank line separation
 * @param {string[]} lines - Lines of quiz text
 * @returns {string[]} Array of question texts
 */
export function parseQuestions(lines) {
  const questions = [];
  let currentQuestion = [];

  clearLevelCounts();

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

  // Don't forget the last question if file doesn't end with blank line
  if (currentQuestion.length > 0) {
    const questionText = currentQuestion.join('\n');
    questions.push(questionText);
    extractAndCountLevel(questionText);
  }

  return questions;
}

/**
 * Extract levels from question and increment counts
 * Only checks the END of the first line for level indicators
 * @param {string} questionText - Question text
 */
function extractAndCountLevel(questionText) {
  // Get the first line (the question title)
  const firstLine = questionText.split('\n')[0].trim();

  // Pattern to match parentheses at the END of the line
  // This ensures we only capture the last set of parentheses
  const endPattern = /\(([^)]+)\)\s*$/;
  const match = endPattern.exec(firstLine);

  let foundLevels = new Set();

  if (match) {
    const content = match[1].trim();

    // Skip if it contains "IMG:" (image reference)
    if (!content.includes('IMG:')) {
      // Split by comma or semicolon
      const parts = content.split(/[,;]/).map(part => part.trim());

      parts.forEach(part => {
        if (part) {
          foundLevels.add(normalizeLevel(part));
        }
      });
    }
  }

  // If no levels found at the end, use "No level"
  if (foundLevels.size === 0) {
    foundLevels.add('No level');
  }

  // Increment count for each unique level
  foundLevels.forEach(level => {
    incrementLevelCount(level);
  });
}

/**
 * Get levels from a single question
 * Only checks the END of the first line
 * @param {string} questionText - Question text
 * @returns {string[]} Array of level names
 */
export function getQuestionLevels(questionText) {
  // Get the first line (the question title)
  const firstLine = questionText.split('\n')[0].trim();

  // Pattern to match parentheses at the END of the line
  const endPattern = /\(([^)]+)\)\s*$/;
  const match = endPattern.exec(firstLine);

  let levels = [];

  if (match) {
    const content = match[1].trim();

    // Skip if it contains "IMG:"
    if (!content.includes('IMG:')) {
      // Split by comma or semicolon
      const parts = content.split(/[,;]/).map(part => part.trim());

      parts.forEach(part => {
        if (part && !levels.includes(part)) {
          levels.push(normalizeLevel(part));
        }
      });
    }
  }

  // If no levels found at the end, return "No level"
  if (levels.length === 0) {
    levels.push('No level');
  }

  return levels;
}

/**
 * Recount levels for an array of questions (for multi-quiz mode)
 * This treats the combined questions as one unified bank
 * PHASE 1 FIX: This is the key function for fixing multi-quiz level counting
 * @param {string[]} questions - Array of all combined questions
 */
export function recountLevelsForQuestions(questions) {
  // Clear all existing level counts
  clearLevelCounts();

  console.log('🔄 Recounting levels for combined quiz...');
  console.log(`📊 Total questions to process: ${questions.length}`);

  // Iterate through each question and count its levels
  questions.forEach(question => {
    const levels = getQuestionLevels(question);
    levels.forEach(level => {
      incrementLevelCount(level);
    });
  });

  // Log the results for verification
  const finalCounts = getLevelCounts();
  console.log('✅ Final level counts:', finalCounts);
  console.log('📈 Total unique levels:', Object.keys(finalCounts).length);
  console.log('💡 Each count = number of questions that HAVE that level');
}

/**
 * Filter questions by selected levels
 * @param {string[]} questions - All questions
 * @param {string[]} selectedLevels - Selected level names
 * @returns {string[]} Filtered questions
 */
export function filterQuestionsByLevel(questions, selectedLevels) {
  if (selectedLevels.length === 0) return questions;

  return questions.filter(question => {
    const questionLevels = getQuestionLevels(question);

    // Check if any of the question's levels match the selected levels
    return questionLevels.some(level => selectedLevels.includes(level));
  });
}

/**
 * Get selected levels from checkboxes
 * @returns {string[]} Array of selected level names
 */
export function getSelectedLevels() {
  const checkboxes = document.querySelectorAll('#level-checkboxes input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.dataset.level);
}

/**
 * Sort levels for display (numbers first, then alphabetically)
 * @param {Object} levelCounts - Object with level names as keys
 * @returns {Array} Sorted array of [level, count] pairs
 */
export function sortLevelsForDisplay(levelCounts) {
  const entries = Object.entries(levelCounts);

  return entries.sort((a, b) => {
    const [levelA] = a;
    const [levelB] = b;

    // Check if both are numbers
    const numA = parseInt(levelA);
    const numB = parseInt(levelB);

    const isNumA = !isNaN(numA) && String(numA) === levelA;
    const isNumB = !isNaN(numB) && String(numB) === levelB;

    // If both are numbers, sort numerically
    if (isNumA && isNumB) {
      return numA - numB;
    }

    // Numbers come before text
    if (isNumA && !isNumB) return -1;
    if (!isNumA && isNumB) return 1;

    // Otherwise sort alphabetically (case-insensitive)
    return levelA.toLowerCase().localeCompare(levelB.toLowerCase());
  });
}