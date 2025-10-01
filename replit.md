# Overview

This is a modern web-based quiz application built with Node.js and Express that serves educational quizzes for aviation maintenance training. The application provides an interactive quiz system covering various aviation topics including ATA chapters, aircraft maintenance modules, and engine-specific training materials. Users can browse through organized quiz categories, select specific quizzes, configure question counts, and take tests with immediate feedback and scoring.

## Recent Upgrades (September 2025)
The application has been significantly upgraded with modern web design principles, enhanced user experience, and improved functionality while maintaining the core educational purpose without adding personal features like accounts or progress saving.

### Latest Updates (October 2025):
- **Responsive Header Design**: Header now scales dynamically using clamp() for font sizes, preventing content blocking on mobile devices
- **CSS Variable Architecture**: Implemented --header-height CSS variable (70px desktop, 60px tablet, 56px mobile) for consistent spacing across all screen sizes
- **Floating Live Score Widget**: Live test scores now display in a persistent floating widget (independent of control panel), always visible during live test mode
- **Improved Quiz Layout**: Quiz container properly positioned below header with responsive margin across all breakpoints
- **Mobile Optimization**: Header text uses ellipsis overflow, compact padding on mobile, and all elements scale appropriately without blocking content
- **Responsive Sidebar**: Left sidebar properly positioned below header with responsive width scaling using clamp()
- **Adaptive Control Panel**: Quiz control panel now scales to fit content with responsive padding, margins, and typography using clamp()
- **Z-Index Stacking**: Fixed layering hierarchy (header: 100, live score: 999, final score: 1000, sidebar: 1100, panel overlay: 1150, control panel: 1200)

### Previous Updates (September 2025):
- **Backend Conversion**: Successfully converted from Node.js Express to Python Flask for better cross-platform compatibility
- **jQuery Integration**: Added jQuery CDN and enhanced user interactions with smooth animations and improved hover effects
- **External Portability**: Created requirements.txt and comprehensive README for local deployment outside Replit environment
- **Enhanced User Experience**: Implemented jQuery-powered smooth scrolling, enhanced notifications, and improved answer selection
- **Fixed Try Again Functionality**: Try again button now properly restarts quizzes with exact same settings (question count, difficulty levels, live test mode)
- **Enhanced Live Test Scoring**: Fixed real-time scoring with proper event handling and visual feedback
- **Unified Floating Controls**: Created consolidated control box with live test toggle and dynamic question count adjustment
- **Streamlined Setup**: Removed question count configuration from setup screen, defaulting to 20 questions
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
- **Design System**: CSS custom properties (variables) for consistent theming and responsive design with --header-height variable for layout consistency
- **Typography**: Google Fonts (Inter) for improved readability and modern appearance with responsive font scaling using clamp()
- **Icons**: Font Awesome integration for visual enhancement and better user experience
- **Question Format**: Multiple choice questions with correct answers marked by `@@` prefix
- **Enhanced Interactive Features**: 
  - Modern hierarchical quiz browsing with grid layout
  - jQuery-powered smooth animations and transitions throughout the interface
  - Enhanced hover effects and visual feedback
  - Loading states and progress indicators with fade animations
  - Configurable question count selection with validation
  - Enhanced live test mode with floating score widget that's always visible during tests
  - Real-time scoring and visual feedback in dedicated floating widget (z-index 999)
  - Question difficulty levels (Level 1-3) with improved filtering
  - Keyboard navigation support with smooth scrolling
  - Fully responsive mobile design with optimized header (56px mobile, 60px tablet, 70px desktop)
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
- **Responsive Layout**: Mobile-first design that works seamlessly across all devices with CSS variable-based header heights
- **Enhanced Navigation**: Improved breadcrumb navigation and clear visual hierarchy with alphabetically sorted content
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive button designs
- **Accessibility**: Improved contrast ratios, keyboard navigation, and screen reader support
- **Loading States**: Visual feedback during quiz loading and transitions
- **Error Handling**: User-friendly error messages with helpful guidance
- **Performance**: Optimized animations and efficient DOM manipulation
- **Fixed Positioning**: Header stays in place during both vertical and horizontal scrolling with proper content offset
- **Adaptive Spacing**: Viewport-based spacing (vh/vw units) with CSS variables reduces blank space and scales across screen sizes
- **Live Score Display**: Persistent floating widget during live test mode, positioned below header with responsive offsets

## Technical Enhancements
- **Modern CSS**: CSS Grid, Flexbox, and custom properties for robust layout system with --header-height variable architecture
- **Responsive Units**: Viewport-relative units (vh/vw) with clamp() constraints for optimal spacing and font scaling across devices
- **JavaScript Improvements**: Enhanced error handling, modular code structure, and better performance with floating widget management
- **Animation System**: Fade-in effects, smooth transitions, and loading animations for floating score widget
- **Code Organization**: Cleaner, more maintainable codebase with CSS variables and improved documentation
- **Browser Compatibility**: Enhanced cross-browser support and modern web standards
- **Position Strategy**: Fixed header with CSS variable-based offset system (70px/60px/56px) ensures content never overlaps
- **Sidebar Constraints**: Clamp-based width (desktop: 160px-220px, mobile: 280px-320px) with variable-based positioning prevents overflow and alignment issues
- **Control Panel Scaling**: Responsive padding, margins, and typography using clamp() to fit content across all screen sizes
- **Z-Index Stacking**: Layered UI components (header: 100, live score: 999, final score: 1000, sidebar: 1100, panel overlay: 1150, control panel: 1200) for proper visual hierarchy
