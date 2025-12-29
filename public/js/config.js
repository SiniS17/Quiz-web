// config.js - Centralized Application Configuration
// This file contains all configurable static variables for the quiz application
// Modify these values to customize the application behavior without touching module code

export const CONFIG = {
  // ===================================
  // QUIZ DIRECTORY CONFIGURATION
  // ===================================

  /**
   * Name of the quiz directory (relative to project root or public folder)
   * Change this to use a different folder name
   */
  QUIZ_DIRECTORY_NAME: 'list quizzes',

  /**
   * Whether quiz directory is in root (true) or public folder (false)
   * true = root directory (e.g., /list quizzes)
   * false = public directory (e.g., /public/list quizzes)
   */
  QUIZ_DIRECTORY_IN_ROOT: true,


  // ===================================
  // LINE VALIDATION CONFIGURATION
  // ===================================

  /**
   * Maximum consecutive non-empty lines allowed in a quiz file
   * Files exceeding this will be flagged with a warning icon
   */
  MAX_CONSECUTIVE_LINES: 5,

  /**
   * Minimum consecutive non-empty lines required in a quiz file
   * Files with fewer than this will be flagged with a warning icon
   */
  MIN_CONSECUTIVE_LINES: 3,


  // ===================================
  // DEFAULT QUIZ SETTINGS
  // ===================================

  /**
   * Default number of questions to display
   */
  DEFAULT_QUESTION_COUNT: 20,

  /**
   * Whether live test mode is enabled by default
   */
  DEFAULT_LIVE_TEST_MODE: false,


  // ===================================
  // UI CONFIGURATION
  // ===================================

  /**
   * Default loading screen messages
   */
  LOADING_MESSAGES: {
    DEFAULT: 'Loading...',
    QUIZ_LOAD: 'Preparing Live Test',
    FOLDER_OPEN: 'Opening Folder',
    RESTART: 'Restarting Quiz',
    LIVE_TEST_ENABLE: 'Enabling Live Test',
    LEVEL_UPDATE: 'Updating Question Count'
  },

  /**
   * Default loading screen subtitles
   */
  LOADING_SUBTITLES: {
    DEFAULT: 'Please wait...',
    QUIZ_LOAD: 'Please wait while questions are being loaded...',
    FOLDER_OPEN: 'Loading quizzes...',
    RESTART: 'Please wait while questions are being reloaded...',
    LIVE_TEST_ENABLE: 'Please wait while the quiz is being prepared...'
  },

  /**
   * Notification display duration (milliseconds)
   */
  NOTIFICATION_DURATION: 3000,

  /**
   * Animation duration for UI transitions (milliseconds)
   */
  ANIMATION_DURATION: 300,


  // ===================================
  // GRADE THRESHOLDS
  // ===================================

  /**
   * Grade percentage thresholds
   */
  GRADE_THRESHOLDS: {
    A_PLUS: 90,
    A: 80,
    B: 70,
    C: 60,
    // Below C is F
  },


  // ===================================
  // IMAGE CONFIGURATION
  // ===================================

  /**
   * Image directory relative to public folder
   */
  IMAGE_DIRECTORY: 'images',

  /**
   * Placeholder image filename
   */
  IMAGE_PLACEHOLDER: 'placeholder.png',

  /**
   * Maximum image display height (CSS value)
   */
  MAX_IMAGE_HEIGHT: '400px',


  // ===================================
  // LEVEL CONFIGURATION
  // ===================================

  /**
   * Label for questions without explicit levels
   */
  NO_LEVEL_LABEL: 'No level',

  /**
   * Prefix for numeric level display
   */
  LEVEL_PREFIX: 'Level',

  /**
   * Short level prefix for compact display
   */
  LEVEL_SHORT_PREFIX: 'L',


  // ===================================
  // SCORE MESSAGES
  // ===================================

  /**
   * Encouraging messages based on score percentage
   */
  SCORE_MESSAGES: {
    90: "Excellent work! Outstanding performance! 🎉",
    80: "Great job! You have a solid understanding! 👍",
    70: "Good work! Keep practicing to improve! 👏",
    60: "Not bad! Review the topics and try again! 📚",
    0: "Keep studying and you'll improve! Don't give up! 💪"
  },


  // ===================================
  // API ENDPOINTS
  // ===================================

  /**
   * API endpoint for listing quizzes
   */
  API_LIST_QUIZZES: '/api/list-quizzes',


  // ===================================
  // RESPONSIVE BREAKPOINTS
  // ===================================

  /**
   * Screen width breakpoints for responsive design (pixels)
   */
  BREAKPOINTS: {
    MOBILE_SMALL: 480,
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440
  },


  // ===================================
  // FILE VALIDATION
  // ===================================

  /**
   * Valid quiz file extensions
   */
  VALID_FILE_EXTENSIONS: ['.txt'],

  /**
   * File naming patterns to recognize
   */
  FILE_PATTERNS: {
    ABCD_FORMAT: '(ABCD)',
    VARIABLE_ANSWERS: '(-)'
  }
};

/**
 * Helper function to get quiz directory path
 * @returns {string} Full path to quiz directory
 */
export function getQuizDirectoryPath() {
  if (CONFIG.QUIZ_DIRECTORY_IN_ROOT) {
    return `./${CONFIG.QUIZ_DIRECTORY_NAME}`;
  } else {
    return `./public/${CONFIG.QUIZ_DIRECTORY_NAME}`;
  }
}

/**
 * Helper function to get quiz file path
 * @param {string} filePath - Relative file path
 * @returns {string} Full path to quiz file
 */
export function getQuizFilePath(filePath) {
  const basePath = CONFIG.QUIZ_DIRECTORY_IN_ROOT
    ? `./${CONFIG.QUIZ_DIRECTORY_NAME}`
    : `./${CONFIG.QUIZ_DIRECTORY_NAME}`;

  return `${basePath}/${filePath}`;
}

/**
 * Helper function to get score message based on percentage
 * @param {number} percentage - Score percentage
 * @returns {string} Appropriate message
 */
export function getScoreMessage(percentage) {
  const thresholds = [90, 80, 70, 60, 0];
  for (const threshold of thresholds) {
    if (percentage >= threshold) {
      return CONFIG.SCORE_MESSAGES[threshold];
    }
  }
  return CONFIG.SCORE_MESSAGES[0];
}

/**
 * Helper function to get grade based on percentage
 * @param {number} percentage - Score percentage
 * @returns {string} Grade letter
 */
export function getGrade(percentage) {
  const { A_PLUS, A, B, C } = CONFIG.GRADE_THRESHOLDS;

  if (percentage >= A_PLUS) return 'A+';
  if (percentage >= A) return 'A';
  if (percentage >= B) return 'B';
  if (percentage >= C) return 'C';
  return 'F';
}

// Make config available globally for debugging
if (typeof window !== 'undefined') {
  window.APP_CONFIG = CONFIG;
}

export default CONFIG;