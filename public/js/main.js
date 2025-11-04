// main.js - Application Entry Point
import { initializeApp } from './modules/app.js';
import { initializeJQueryEnhancements } from './modules/jquery-enhancements.js';
import { initFloatingControls } from './modules/ui/controls.js';
import { setupGlobalErrorHandling } from './modules/error-handler.js';

// Initialize application when DOM is ready
$(document).ready(function() {
  setupGlobalErrorHandling();
  initializeApp();
  initializeJQueryEnhancements();
  initFloatingControls();

  console.log('✅ Quiz application initialized');
});