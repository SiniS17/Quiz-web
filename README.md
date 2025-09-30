# Aviation Quiz Application

A Python Flask-based quiz application for aviation maintenance training.

## Running Locally (Outside Replit)

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup Instructions

1. **Download/Extract the project files** to your computer

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your web browser** and go to:
   ```
   http://localhost:5000
   ```

### Project Structure
```
├── app.py              # Python Flask server
├── requirements.txt    # Python dependencies
├── public/            # Frontend files
│   ├── index.html     # Main quiz interface
│   ├── script.js      # JavaScript/jQuery logic
│   ├── styles.css     # Styling
│   └── list quizzes/  # Quiz content files
```

### Features
- Interactive quiz system with multiple choice questions
- Category browsing and folder navigation
- Live scoring and immediate feedback
- Level-based question filtering
- Modern responsive design
- Sidebar navigation with progress tracking

### Customizing Quiz Content
- Add new quiz files (.txt format) to the `public/list quizzes/` directory
- Create folders to organize quizzes by category
- Follow the existing question format for new quizzes

### Deployment Options
This Flask application can be deployed to various platforms:
- Heroku
- PythonAnywhere
- DigitalOcean
- AWS
- Any hosting service that supports Python Flask applications