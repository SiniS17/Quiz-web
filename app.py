import os
import json
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, send_file
from werkzeug.security import safe_join
from werkzeug.exceptions import NotFound

# Import from config file
from config import (
    QUIZ_DIRECTORY_NAME,
    QUIZ_DIRECTORY_IN_ROOT,
    DEFAULT_PORT,
    DEBUG_MODE,
    HOST_ADDRESS,
    get_quiz_directory_path
)

app = Flask(__name__, static_folder="public")

# Configure static file serving
app.static_folder = 'public'
app.static_url_path = '/'

# Get port from environment or use config default
PORT = int(os.environ.get('PORT', DEFAULT_PORT))


def get_quiz_directory():
    """Get the quiz directory path based on configuration"""
    return get_quiz_directory_path(__file__)


# ===================================
# SPA ROUTING - All routes serve the same HTML
# ===================================
@app.route("/")
@app.route("/folder/<path:folder_path>")
@app.route("/quiz/<path:quiz_path>")
def index(folder_path=None, quiz_path=None):
    """
    Serve the single-page application for all routes.
    Client-side JS will read window.location.pathname to determine what to display.
    """
    return app.send_static_file("index.html")


# ===================================
# API ENDPOINTS
# ===================================
@app.route('/api/list-quizzes')
def list_quizzes():
    """List quizzes endpoint - matches original functionality"""
    try:
        quiz_directory = get_quiz_directory()
        folder = request.args.get('folder', '')

        # Safely join paths to prevent directory traversal
        if folder:
            current_path = safe_join(str(quiz_directory), folder)
            if current_path is None:
                print('Error reading directory: Invalid folder path')
                return 'Error reading directory', 500
            current_path = Path(current_path)
        else:
            current_path = quiz_directory

        # Check if path exists and is directory
        if not current_path.exists() or not current_path.is_dir():
            print(f'Error reading directory: Path does not exist: {current_path}')
            return 'Error reading directory', 500

        # Read directory contents
        entries = list(current_path.iterdir())

        # Separate folders and .txt files
        folders = []
        files = []

        for entry in entries:
            if entry.is_dir():
                folders.append(entry.name)
            elif entry.is_file() and entry.name.endswith('.txt'):
                files.append(entry.name)

        # Sort both lists alphabetically (case-insensitive)
        folders.sort(key=str.lower)
        files.sort(key=str.lower)

        result = {
            'folders': folders,
            'files': files
        }

        return jsonify(result)

    except Exception as e:
        print(f'Error reading directory: {e}')
        return 'Error reading directory', 500


@app.route(f'/{QUIZ_DIRECTORY_NAME}/<path:filename>')
def serve_quiz_files(filename):
    """Serve quiz files from the configured quiz directory"""
    try:
        quiz_directory = get_quiz_directory()
        return send_from_directory(str(quiz_directory), filename)
    except NotFound:
        return jsonify({'error': 'File not found'}), 404


# ===================================
# STATIC FILES
# ===================================
@app.route('/public/<path:filename>')
def public_files(filename):
    """Serve public static files"""
    return send_from_directory(app.static_folder, filename)


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files from public directory"""
    # Skip quiz directory files - they're handled by serve_quiz_files
    if filename.startswith(QUIZ_DIRECTORY_NAME + '/'):
        return jsonify({'error': 'Use quiz endpoint'}), 404

    # If no file extension, might be a SPA route - serve index.html
    if '.' not in filename:
        return index()

    try:
        return send_from_directory('public', filename)
    except NotFound:
        # If file not found and no extension, treat as SPA route
        if '.' not in filename:
            return index()
        return jsonify({'error': 'File not found'}), 404


if __name__ == "__main__":
    # Print configuration on startup
    quiz_dir = get_quiz_directory()
    print("=" * 60)
    print("🚀 AVIATION QUIZ APP - SERVER STARTING")
    print("=" * 60)
    print(f"📁 Quiz directory: {quiz_dir}")
    print(f"✅ Directory exists: {quiz_dir.exists()}")
    print(f"🌐 Server: http://{HOST_ADDRESS}:{PORT}")
    print(f"🔧 Debug mode: {DEBUG_MODE}")
    print(f"📍 SPA Routing: Enabled")
    print("=" * 60)
    print("\n💡 All routes (/, /folder/*, /quiz/*) serve the same HTML")
    print("   Client-side JavaScript handles navigation\n")

    app.run(host=HOST_ADDRESS, port=PORT, debug=DEBUG_MODE)