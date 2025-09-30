# Overview

This is a modern web-based quiz application built with Node.js and Express that serves educational quizzes for aviation maintenance training. The application provides an interactive quiz system covering various aviation topics including ATA chapters, aircraft maintenance modules, and engine-specific training materials. Users can browse through organized quiz categories, select specific quizzes, configure question counts, and take tests with immediate feedback and scoring.

## Recent Upgrades (September 2025)
The application has been significantly upgraded with modern web design principles, enhanced user experience, and improved functionality while maintaining the core educational purpose without adding personal features like accounts or progress saving.

### Latest Updates (September 2025):
- **Backend Conversion**: Successfully converted from Node.js Express to Python Flask for better cross-platform compatibility
- **jQuery Integration**: Added jQuery CDN and enhanced user interactions with smooth animations and improved hover effects
- **External Portability**: Created requirements.txt and comprehensive README for local deployment outside Replit environment
- **Enhanced User Experience**: Implemented jQuery-powered smooth scrolling, enhanced notifications, and improved answer selection
- **Fixed Try Again Functionality**: Try again button now properly restarts quizzes with exact same settings (question count, difficulty levels, live test mode)
- **Enhanced Live Test Scoring**: Fixed real-time scoring with proper event handling and visual feedback
- **Unified Floating Controls**: Created consolidated control box with live test toggle and dynamic question count adjustment
- **Streamlined Setup**: Removed question count configuration from setup screen, defaulting to 20 questions
- **Smart UI Positioning**: Live score appears below live test checkbox, question controls auto-adjust to prevent overlap
- **Alphabetical Sorting**: Quiz folders and files now display in alphabetical order (case-insensitive) for easier navigation
- **Fixed Header Positioning**: Top bar with quiz name and home button now stays fixed and doesn't move with horizontal scrolling
- **Responsive Spacing**: Replaced fixed pixel spacing with viewport-relative units (vh/vw) to reduce blank space and improve responsiveness across all screen sizes

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Framework**: Flask server running on Python 3 for better cross-platform compatibility
- **File System Based**: Quiz content stored as plain text files in organized directory structure
- **Static File Serving**: Public directory serves all frontend assets (HTML, CSS, JavaScript)
- **API Endpoint**: Single `/api/list-quizzes` endpoint for directory browsing and file listing with alphabetical sorting
- **Port Configuration**: Configurable port via environment variable with fallback to 5000 (Replit-optimized)
- **External Dependencies**: Flask and Werkzeug specified in requirements.txt for local deployment
- **Sorting Logic**: Folders and files are sorted alphabetically (case-insensitive) for consistent display

## Frontend Architecture
- **Modern Web Application**: Enhanced HTML/CSS/JavaScript with modern design patterns
- **jQuery Integration**: jQuery 3.7.1 CDN for enhanced animations and user interactions
- **Design System**: CSS custom properties (variables) for consistent theming and responsive design
- **Typography**: Google Fonts (Inter) for improved readability and modern appearance
- **Icons**: Font Awesome integration for visual enhancement and better user experience
- **Question Format**: Multiple choice questions with correct answers marked by `@@` prefix
- **Enhanced Interactive Features**: 
  - Modern hierarchical quiz browsing with grid layout
  - jQuery-powered smooth animations and transitions throughout the interface
  - Enhanced hover effects and visual feedback
  - Loading states and progress indicators with fade animations
  - Configurable question count selection with validation
  - Enhanced live test mode with real-time scoring
  - Real-time scoring and visual feedback
  - Question difficulty levels (Level 1-3) with improved filtering
  - Keyboard navigation support with smooth scrolling
  - Mobile-responsive design for all device types
  - Enhanced toast notifications with slide animations
  - Improved error handling and user guidance
- **State Management**: Optimized JavaScript with jQuery enhancements, better error handling and performance

## Data Storage
- **File-Based Storage**: Quiz content stored as structured text files (.txt format)
- **Directory Organization**: Hierarchical folder structure for quiz categorization
- **Question Format**: Standardized format with question text, options, and answer markers
- **Content Categories**: 
  - ATA chapters (aviation technical standards)
  - Training modules (mathematics, physics, electronics, etc.)
  - Engine-specific content (CFM56, PW1100G, V2500)
  - CAAV certification materials

## Quiz Content Structure
- **Question Levels**: Questions categorized by difficulty (Level 1, 2, 3)
- **Answer Format**: Multiple choice with `@@` marking correct answers
- **Content Scope**: Aviation maintenance, electrical systems, human factors, aerodynamics, and regulatory compliance
- **File Naming**: Descriptive names indicating content type and coverage

## External Dependencies
- **Runtime**: Node.js with Express framework
- **File System**: Node.js built-in `fs` and `path` modules for file operations
- **Static Assets**: Enhanced CSS and JavaScript files with modern features
- **Typography**: Google Fonts (Inter font family) for improved visual design
- **Icons**: Font Awesome 6.4.0 for comprehensive icon library
- **No Database**: File system serves as data persistence layer
- **No Authentication**: Open access quiz system (maintained as per requirements)
- **No External APIs**: Fully self-contained application (except for fonts and icons CDN)

## UI/UX Improvements
- **Modern Design Language**: Clean, professional interface with aviation-themed branding
- **Color Scheme**: Cohesive blue gradient background with professional color palette
- **Responsive Layout**: Mobile-first design that works seamlessly across all devices with viewport-relative spacing
- **Enhanced Navigation**: Improved breadcrumb navigation and clear visual hierarchy with alphabetically sorted content
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive button designs
- **Accessibility**: Improved contrast ratios, keyboard navigation, and screen reader support
- **Loading States**: Visual feedback during quiz loading and transitions
- **Error Handling**: User-friendly error messages with helpful guidance
- **Performance**: Optimized animations and efficient DOM manipulation
- **Fixed Positioning**: Header stays in place during both vertical and horizontal scrolling
- **Adaptive Spacing**: Viewport-based spacing (vh/vw units) reduces blank space and scales across screen sizes

## Technical Enhancements
- **Modern CSS**: CSS Grid, Flexbox, and custom properties for robust layout system
- **Responsive Units**: Viewport-relative units (vh/vw) with clamp() constraints for optimal spacing across devices
- **JavaScript Improvements**: Enhanced error handling, modular code structure, and better performance
- **Animation System**: Fade-in effects, smooth transitions, and loading animations
- **Code Organization**: Cleaner, more maintainable codebase with improved documentation
- **Browser Compatibility**: Enhanced cross-browser support and modern web standards
- **Position Strategy**: Fixed header positioning prevents unwanted scrolling while maintaining responsive behavior
- **Sidebar Constraints**: Clamp-based width (160px-220px range) prevents overflow and oversizing issues