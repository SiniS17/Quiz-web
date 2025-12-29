"""
config.py - Centralized Application Configuration (Python)
This file contains all configurable variables for the quiz application.
Should match the settings in public/js/config.js
"""

# ===================================
# QUIZ DIRECTORY CONFIGURATION
# ===================================

# Name of the quiz directory (relative to project root or public folder)
QUIZ_DIRECTORY_NAME = 'Bank'

# Whether quiz directory is in root (True) or public folder (False)
# True = root directory (e.g., /list quizzes)
# False = public directory (e.g., /public/list quizzes)
QUIZ_DIRECTORY_IN_ROOT = True

# ===================================
# LINE VALIDATION CONFIGURATION
# ===================================

# Maximum consecutive non-empty lines allowed in a quiz file
MAX_CONSECUTIVE_LINES = 5

# Minimum consecutive non-empty lines required in a quiz file
MIN_CONSECUTIVE_LINES = 3

# ===================================
# SERVER CONFIGURATION
# ===================================

# Default port for Flask server
DEFAULT_PORT = 5000

# Debug mode
DEBUG_MODE = True

# Host address
HOST_ADDRESS = "0.0.0.0"

# ===================================
# API CONFIGURATION
# ===================================

# API endpoint prefix (if needed in future)
API_PREFIX = '/api'

# ===================================
# FILE VALIDATION
# ===================================

# Valid quiz file extensions
VALID_FILE_EXTENSIONS = ['.txt']


# ===================================
# HELPER FUNCTIONS
# ===================================

def get_quiz_directory_path(base_path):
    """
    Get the full path to the quiz directory

    Args:
        base_path: Base path of the application (usually __file__ parent)

    Returns:
        Path object pointing to quiz directory
    """
    from pathlib import Path

    base = Path(base_path).parent if base_path.endswith('.py') else Path(base_path)

    if QUIZ_DIRECTORY_IN_ROOT:
        return base / QUIZ_DIRECTORY_NAME
    else:
        return base / 'public' / QUIZ_DIRECTORY_NAME