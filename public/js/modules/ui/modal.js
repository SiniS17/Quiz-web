// modules/ui/modal.js - Image Modal Management

/**
 * Setup image modal for viewing full-size images
 */
export function setupImageModal() {
  if (!document.getElementById('image-modal')) {
    createImageModal();
  }

  setupModalClickHandlers();
}

/**
 * Create modal DOM structure
 */
function createImageModal() {
  const modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.className = 'image-modal';
  modal.innerHTML = `
    <span class="image-modal-close">&times;</span>
    <img src="" alt="Full size image">
  `;
  document.body.appendChild(modal);

  // Close on modal background or X button click
  modal.addEventListener('click', function(e) {
    if (e.target === modal || e.target.className === 'image-modal-close') {
      modal.classList.remove('show');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  });
}

/**
 * Setup click handlers for question images
 */
function setupModalClickHandlers() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('question-image')) {
      const modal = document.getElementById('image-modal');
      const modalImg = modal.querySelector('img');
      modal.classList.add('show');
      modalImg.src = e.target.src;
    }
  });
}