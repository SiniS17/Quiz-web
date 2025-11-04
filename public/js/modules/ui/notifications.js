// modules/ui/notifications.js - Notification System

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type (info, success, error)
 */
export function showNotification(message, type = 'info') {
  if (window.jQuery) {
    showJQueryNotification(message, type);
  } else {
    showVanillaNotification(message, type);
  }
}

/**
 * Show notification using jQuery
 */
function showJQueryNotification(message, type) {
  const $notification = $('<div>')
    .addClass(`notification ${type}`)
    .css({
      position: 'fixed',
      top: '20px',
      right: '-300px',
      padding: '1rem 1.5rem',
      background: getNotificationColor(type),
      color: 'white',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      minWidth: '250px'
    })
    .text(message)
    .appendTo('body')
    .animate({ right: '20px' }, 300);

  setTimeout(() => {
    $notification.animate({ right: '-300px' }, 300, function() {
      $(this).remove();
    });
  }, 3000);
}

/**
 * Show notification using vanilla JS
 */
function showVanillaNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${getNotificationColor(type)};
    color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Get notification color based on type
 */
function getNotificationColor(type) {
  switch(type) {
    case 'error': return 'var(--error-color)';
    case 'success': return 'var(--success-color)';
    default: return 'var(--primary-color)';
  }
}