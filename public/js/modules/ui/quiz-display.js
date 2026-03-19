// modules/ui/quiz-display.js - Quiz Question Display with Validation
import CONFIG from '../../config.js';
import { parseQuestionWithImages } from '../parser.js';
import { shuffle, addFadeInAnimation } from '../utils.js';
import { getAnsweredQuestions, setAnsweredQuestions } from '../state.js';
import { updateProgressIndicator } from './progress.js';
import { getLiveTestCheckbox, updateLiveScore, highlightLiveAnswers } from '../live-test.js';
import { getQuizState } from '../state.js';

/**
 * Validate if a question block has correct line count.
 * Returns { valid, violationType, reason, lineCount }
 *
 * violationType:
 *   'line_count'   → wrong number of lines          (red)
 *   'answer_count' → wrong number of @@ answers     (violet)
 *   null           → valid
 */
function validateQuestionBlock(questionText) {
  const lines = questionText.split('\n').filter(line => line.trim() !== '');
  const lineCount = lines.length;

  const { MIN_CONSECUTIVE_LINES, MAX_CONSECUTIVE_LINES } = CONFIG;

  // ── STEP 1: line count (red) ─────────────────────────────────────────────
  if (lineCount < MIN_CONSECUTIVE_LINES) {
    return {
      valid: false,
      violationType: 'line_count',
      reason: `Too few lines (${lineCount} < ${MIN_CONSECUTIVE_LINES})`,
      lineCount
    };
  }
  if (lineCount > MAX_CONSECUTIVE_LINES) {
    return {
      valid: false,
      violationType: 'line_count',
      reason: `Too many lines (${lineCount} > ${MAX_CONSECUTIVE_LINES})`,
      lineCount
    };
  }

  // ── STEP 2: correct-answer count (violet) ────────────────────────────────
  // Answer lines are everything after the first line (the question title)
  const answerLines = lines.slice(1);
  const correctCount = answerLines.filter(l => l.trimStart().startsWith('@@')).length;

  if (correctCount !== 1) {
    return {
      valid: false,
      violationType: 'answer_count',
      reason: correctCount === 0
        ? 'No correct answer marked (@@)'
        : `${correctCount} correct answers marked (@@) — must be exactly 1`,
      lineCount
    };
  }

  return { valid: true, violationType: null, lineCount };
}

/**
 * Create question element with answers.
 * Line-count errors  → .question-invalid        (red stripes, blocked)
 * Answer-count errors → .question-invalid-violet (violet stripes, blocked)
 */
export function createQuestionElement(questionText, index) {
  const validation = validateQuestionBlock(questionText);

  const lines = questionText.split('\n');
  const questionTitle = lines[0];
  const answers = lines.slice(1);

  // Parse images from question title
  const imageInfo = parseQuestionWithImages(questionTitle);

  // Remove [IMG:...] tags from displayed text
  const cleanTitle = questionTitle.replace(/\[IMG:[^\]]+\]/g, '').trim();

  const shuffledAnswers = shuffle([...answers]);

  const questionDiv = document.createElement('div');
  questionDiv.className = 'question';
  questionDiv.id = `question-${index}`;

  // Apply invalid class based on violation type
  if (!validation.valid) {
    if (validation.violationType === 'answer_count') {
      questionDiv.classList.add('question-invalid-violet');
    } else {
      questionDiv.classList.add('question-invalid');
    }
    questionDiv.setAttribute('data-invalid-reason', validation.reason);
    questionDiv.setAttribute('data-violation-type', validation.violationType);
  }

  const questionHeader = document.createElement('div');
  questionHeader.className = 'question-header';

  // Get bank name if available (for multi-quiz mode)
  const quizState = getQuizState();
  const bankName = (quizState.bankInfo && quizState.bankInfo[index]) ? quizState.bankInfo[index] : null;

  // Determine badge label
  let badgeLabel;
  if (!validation.valid) {
    badgeLabel = validation.violationType === 'answer_count'
      ? `⚠️ Answer Error — Question ${index + 1}`
      : `⚠️ Invalid Question ${index + 1}`;
  } else {
    badgeLabel = `Question ${index + 1}`;
  }

  let headerHTML = `
    <span class="question-number">
      ${badgeLabel}
      ${bankName ? `<span class="bank-label">${bankName}</span>` : ''}
    </span>
    <h3>${cleanTitle.replace(/\\n/g, '<br>')}</h3>
  `;

  // Validation error banner
  if (!validation.valid) {
    const bannerClass = validation.violationType === 'answer_count'
      ? 'validation-error validation-error-violet'
      : 'validation-error';

    headerHTML += `
      <div class="${bannerClass}">
        <i class="fas fa-exclamation-triangle"></i>
        <strong>Validation Error:</strong> ${validation.reason}
      </div>
    `;
  }

  // Images
  if (imageInfo.hasImages) {
    headerHTML += '<div class="question-images">';
    imageInfo.images.forEach(imgFilename => {
      headerHTML += `
        <div class="question-image-container">
          <img src="images/${imgFilename}"
               alt="Question image"
               class="question-image"
               onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Image not found';">
        </div>
      `;
    });
    headerHTML += '</div>';
  }

  questionHeader.innerHTML = headerHTML;
  questionDiv.appendChild(questionHeader);

  const answersContainer = document.createElement('div');
  answersContainer.className = 'answers-container';

  shuffledAnswers.forEach((answer, answerIndex) => {
    const answerElement = createAnswerElement(answer, answerIndex, index, !validation.valid);
    answersContainer.appendChild(answerElement);
  });

  questionDiv.appendChild(answersContainer);

  // Overlay badge — colour matches violation type
  if (!validation.valid) {
    const overlay = document.createElement('div');
    overlay.className = 'question-invalid-overlay';

    const overlayClass = validation.violationType === 'answer_count'
      ? 'invalid-message invalid-message-violet'
      : 'invalid-message';

    const overlayIcon  = validation.violationType === 'answer_count' ? 'fa-ban' : 'fa-ban';
    const overlayText  = validation.violationType === 'answer_count'
      ? 'Answer Error — Cannot Submit'
      : 'Invalid Format — Cannot Answer';

    overlay.innerHTML = `
      <div class="${overlayClass}">
        <i class="fas ${overlayIcon}"></i>
        <span>${overlayText}</span>
      </div>
    `;
    questionDiv.appendChild(overlay);
  }

  return questionDiv;
}

/**
 * Create answer element
 */
function createAnswerElement(answerText, answerIndex, questionIndex, isDisabled = false) {
  const isCorrect = answerText.startsWith('@@');
  const cleanText = isCorrect ? answerText.slice(2) : answerText;
  const answerLabel = String.fromCharCode(65 + answerIndex);

  const answerDiv = document.createElement('div');
  answerDiv.className = 'answer';
  answerDiv.style.cursor = isDisabled ? 'not-allowed' : 'pointer';

  if (isDisabled) {
    answerDiv.classList.add('answer-disabled');
  }

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = `question${questionIndex}`;
  input.value = cleanText;
  input.id = `q${questionIndex}a${answerIndex}`;
  input.disabled = isDisabled;

  if (isCorrect) {
    input.dataset.correct = "true";
  }

  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.innerHTML = `<span class="answer-label">${answerLabel}</span>${cleanText.replace(/\\n/g, '<br>')}`;

  if (!isDisabled) {
    input.addEventListener('change', () => {
      handleAnswerChange(input, answerDiv, questionIndex);
    });

    answerDiv.addEventListener('click', (e) => {
      handleAnswerClick(e, input, label, answerDiv, questionIndex);
    });
  }

  answerDiv.appendChild(input);
  answerDiv.appendChild(label);
  return answerDiv;
}

/**
 * Handle answer change event
 */
function handleAnswerChange(input, answerDiv, questionIndex) {
  const questionDiv = input.closest('.question');
  const allAnswers = questionDiv.querySelectorAll('.answer');
  allAnswers.forEach(answer => answer.classList.remove('selected'));

  if (input.checked) {
    answerDiv.classList.add('selected');
  }

  updateAnswerStatus(questionIndex);

  const liveTestCheckbox = getLiveTestCheckbox();
  if (liveTestCheckbox && liveTestCheckbox.checked) {
    updateLiveScore();
    highlightLiveAnswers(input.closest('.question'));
  }
}

/**
 * Handle answer div click event
 */
function handleAnswerClick(e, input, label, answerDiv, questionIndex) {
  if (e.target === input) return;
  if (e.target === label || e.target.closest('label') === label) return;

  if (input.checked) {
    input.checked = false;
    answerDiv.classList.remove('selected');
    updateAnswerStatus(questionIndex);

    const liveTestCheckbox = getLiveTestCheckbox();
    if (liveTestCheckbox && liveTestCheckbox.checked) {
      updateLiveScore();
      highlightLiveAnswers(input.closest('.question'));
    }
  } else {
    const questionDiv = answerDiv.closest('.question');
    const allAnswers = questionDiv.querySelectorAll('.answer');
    allAnswers.forEach(answer => answer.classList.remove('selected'));

    input.checked = true;
    answerDiv.classList.add('selected');

    updateAnswerStatus(questionIndex);

    const liveTestCheckbox = getLiveTestCheckbox();
    if (liveTestCheckbox && liveTestCheckbox.checked) {
      updateLiveScore();
      highlightLiveAnswers(questionDiv);
    }
  }
}

/**
 * Update answer status for a question
 */
function updateAnswerStatus(questionIndex) {
  const answeredQuestions = getAnsweredQuestions();
  answeredQuestions[questionIndex] = true;
  setAnsweredQuestions(answeredQuestions);
  updateProgressIndicator(questionIndex);
}

/**
 * Disable all answers (after submission)
 */
export function disableAllAnswers() {
  const allAnswers = document.querySelectorAll('.answer');
  const allRadios  = document.querySelectorAll('.answer input[type="radio"]');

  allRadios.forEach(radio => { radio.disabled = true; });
  allAnswers.forEach(answer => {
    answer.style.cursor        = 'not-allowed';
    answer.style.opacity       = '0.7';
    answer.style.pointerEvents = 'none';
  });
}

/**
 * Enable all answers
 */
export function enableAllAnswers() {
  const allAnswers = document.querySelectorAll('.answer:not(.answer-disabled)');
  allAnswers.forEach(answer => {
    answer.style.cursor        = 'pointer';
    answer.style.opacity       = '1';
    answer.style.pointerEvents = 'auto';
  });
}