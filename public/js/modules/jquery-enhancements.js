// modules/jquery-enhancements.js - jQuery Enhancements
import { showLoadingScreen, hideLoadingScreen } from './ui/loading.js';
import { getLiveTestCheckbox, updateLiveScore, highlightLiveAnswers } from './live-test.js';
import { getAnsweredQuestions, setAnsweredQuestions } from './state.js';
import { updateProgressIndicator } from './ui/progress.js';

/**
 * Initialize jQuery-specific enhancements
 */
export function initializeJQueryEnhancements() {
  if (!window.jQuery) {
    console.log('⚠️ jQuery not available, skipping jQuery enhancements');
    return;
  }

  setupHoverEffects();
  setupSmoothScrolling();
  setupAjaxIndicators();
  setupAnswerSelection();
  setupSidebarToggle();

  console.log('✅ jQuery enhancements initialized');
}

/**
 * Setup hover effects for quiz boxes
 */
function setupHoverEffects() {
  $(document).on('mouseenter', '.quiz-box', function() {
    $(this).addClass('hovered');
  });

  $(document).on('mouseleave', '.quiz-box', function() {
    $(this).removeClass('hovered');
  });
}

/**
 * Setup smooth scrolling for sidebar links
 */
function setupSmoothScrolling() {
  $(document).on('click', '.sidebar-question-link', function(e) {
    e.preventDefault();
    const targetId = $(this).attr('href');
    $('html, body').animate({
      scrollTop: $(targetId).offset().top - 100
    }, 500);
  });
}

/**
 * Setup AJAX loading indicators
 */
function setupAjaxIndicators() {
  $(document).on('ajaxStart', function() {
    showLoadingScreen('Loading...', 'Please wait while data is being fetched...');
  });

  $(document).on('ajaxComplete', function() {
    hideLoadingScreen();
  });
}

/**
 * Setup answer selection handling
 */
function setupAnswerSelection() {
  $(document).on('click', '.answer', function() {
    const $this = $(this);
    const $question = $this.closest('.question');
    const $radio = $this.find('input[type="radio"]');

    $question.find('.answer.selected').removeClass('selected');
    $this.addClass('selected');
    $radio.prop('checked', true);

    const questionIndex = parseInt($question.attr('id').replace('question-', ''));
    if (!isNaN(questionIndex)) {
      updateAnswerStatus(questionIndex);

      const liveTestCheckbox = getLiveTestCheckbox();
      if (liveTestCheckbox && liveTestCheckbox.checked) {
        updateLiveScore();
        highlightLiveAnswers($question[0]);
      }
    }
  });
}

/**
 * Setup sidebar toggle
 */
function setupSidebarToggle() {
  $(document).on('click', '.sidebar-toggle', function() {
    $('#left-sidebar').toggleClass('expanded').slideToggle(300);
  });
}

/**
 * Update answer status
 */
function updateAnswerStatus(questionIndex) {
  const answeredQuestions = getAnsweredQuestions();
  answeredQuestions[questionIndex] = true;
  setAnsweredQuestions(answeredQuestions);
  updateProgressIndicator(questionIndex);
}