// modules/state.js - Centralized State Management with Folder Tracking
import CONFIG from '../config.js';
export let selectedFileName = '';
export let globalSelectedCount = 20;
export let pendingQuestionCount = 20;
export let levelCounts = {};
export let answeredQuestions = [];
export let currentFolder = ''; // Track current folder path

// Current quiz state for try again functionality
// Current quiz state for try again functionality
export const quizState = {
  fileName: '',
  questionCount: 20,
  selectedLevels: [],
  isLiveMode: CONFIG.DEFAULT_LIVE_TEST_MODE, // Use config default
  allQuestions: [],
  hasSubmitted: false,
  originalQuestionOrder: null
};

// State setters
export function setSelectedFileName(fileName) {
  selectedFileName = fileName;
}

export function setGlobalSelectedCount(count) {
  globalSelectedCount = count;
}

export function setPendingQuestionCount(count) {
  pendingQuestionCount = count;
}

export function setLevelCounts(counts) {
  levelCounts = counts;
}

export function setAnsweredQuestions(questions) {
  answeredQuestions = questions;
}

export function setCurrentFolder(folder) {
  currentFolder = folder;
}

// State getters
export function getSelectedFileName() {
  return selectedFileName;
}

export function getGlobalSelectedCount() {
  return globalSelectedCount;
}

export function getPendingQuestionCount() {
  return pendingQuestionCount;
}

export function getLevelCounts() {
  return levelCounts;
}

export function getAnsweredQuestions() {
  return answeredQuestions;
}

export function getCurrentFolder() {
  return currentFolder;
}

export function getQuizState() {
  return quizState;
}

// Quiz state operations
export function saveQuizState(allQuestions, selectedLevels) {
  quizState.fileName = selectedFileName;
  quizState.questionCount = globalSelectedCount;
  quizState.selectedLevels = [...selectedLevels];
  // Only set isLiveMode if it hasn't been set yet (use config default)
  if (quizState.isLiveMode === undefined) {
    quizState.isLiveMode = CONFIG.DEFAULT_LIVE_TEST_MODE;
  }
  quizState.allQuestions = [...allQuestions];
}

export function updateQuizState(updates) {
  Object.assign(quizState, updates);
}

export function resetQuizSubmission() {
  quizState.hasSubmitted = false;
  answeredQuestions = [];
}

export function clearLevelCounts() {
  levelCounts = {};
}

export function incrementLevelCount(level) {
  levelCounts[level] = (levelCounts[level] || 0) + 1;
}