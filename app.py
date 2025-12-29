import os
import json
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, send_file
from werkzeug.security import safe_join
from werkzeug.exceptions import NotFound

app = Flask(__name__, static_folder="public")

# Configure static file serving
app.static_folder = 'public'
app.static_url_path = '/'

# Get port from environment or default to 5000
PORT = int(os.environ.get('PORT', 5000))

# ===================================
# CONFIGURATION
# ===================================
# These should match the config.js settings
QUIZ_DIRECTORY_NAME = 'list quizzes'
QUIZ_DIRECTORY_IN_ROOT = True  # True = root directory, False = public directory


def get_quiz_directory():
    """Get the quiz directory path based on configuration"""
    if QUIZ_DIRECTORY_IN_ROOT:
        # Quiz directory in project root
        return Path(__file__).parent / QUIZ_DIRECTORY_NAME
    else:
        # Quiz directory in public folder
        return Path(__file__).parent / 'public' / QUIZ_DIRECTORY_NAME


@app.route("/")
def index():
    # serve public/index.html
    return app.send_static_file("index.html")


# optional: serve any public file via /public/<path>
@app.route("/public/<path:filename>")
def public_files(filename):
    return send_from_directory(app.static_folder, filename)


@app.route('/api/list-quizzes')
def list_quizzes():
    """List quizzes endpoint - matches Node.js functionality exactly"""
    try:
        # Base quiz directory
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

        # Check if path exists and is directory - return error like Node.js
        if not current_path.exists() or not current_path.is_dir():
            print(f'Error reading directory: Path does not exist or is not directory: {current_path}')
            return 'Error reading directory', 500

        # Read directory contents
        entries = list(current_path.iterdir())

        # Separate folders and .txt files and sort alphabetically
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


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files from public directory"""
    # Skip quiz directory files - they're handled by serve_quiz_files
    if filename.startswith(QUIZ_DIRECTORY_NAME + '/'):
        return jsonify({'error': 'Use quiz endpoint'}), 404

    try:
        return send_from_directory('public', filename)
    except NotFound:
        return jsonify({'error': 'File not found'}), 404


if __name__ == "__main__":
    # Print configuration on startup
    quiz_dir = get_quiz_directory()
    print(f"Quiz directory: {quiz_dir}")
    print(f"Quiz directory exists: {quiz_dir.exists()}")

    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)