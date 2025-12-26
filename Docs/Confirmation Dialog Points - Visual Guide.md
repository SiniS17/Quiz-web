# Confirmation Dialog Points - Visual Guide

## 🎯 All Confirmation Trigger Points

```
┌─────────────────────────────────────────────────────────┐
│  [✈️ Quiz Title] ← CLICK HERE (Logo)    [🏠 Home] ← CLICK HERE   │
│  Shows: "Back to folder"                Shows: "Return to Home"  │
└─────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────────────────────────┐
│              │  │                                  │
│  Progress    │  │  Question 1                      │
│  Tracking    │  │  What is...                      │
│              │  │  ○ Answer A                      │
│  [Submit]    │  │  ○ Answer B                      │
│  [Try Again] │  │                                  │
│  [🏠 Home]   │  │  Question 2                      │
│     ↑        │  │  Define...                       │
│  CLICK HERE  │  │  ○ Answer A                      │
│              │  │  ○ Answer B                      │
└──────────────┘  └──────────────────────────────────┘
```

## 📍 Three Confirmation Points

### 1️⃣ Logo Click (Top Left)
**Location:** Header - Quiz title with airplane icon
**Action:** Returns to the folder you came from
**Dialog Message:** 
```
⚠️ Return to Folder?
Are you sure you want to go back to the quiz selection? 
Your current progress will be lost.

[Cancel]  [Go Back]
```

---

### 2️⃣ Header Home Button (Top Right)
**Location:** Header - "Home" button
**Action:** Returns to main menu (all categories)
**Dialog Message:**
```
⚠️ Return to Home?
Are you sure you want to return to the main menu? 
Your current progress will be lost.

[Cancel]  [Go Back]
```

---

### 3️⃣ Sidebar Home Button (Left Panel)
**Location:** Sidebar results panel - "Home" button
**Action:** Returns to main menu (all categories)
**Dialog Message:**
```
⚠️ Return to Home?
Are you sure you want to return to the main menu? 
Your current progress will be lost.

[Cancel]  [Go Back]
```

## 🎨 Confirmation Dialog Appearance

```
╔═══════════════════════════════════════════╗
║  ⚠️ Return to Home?                       ║
║  ───────────────────────────────────────  ║
║  Are you sure you want to return to the   ║
║  main menu? Your current progress will    ║
║  be lost.                                 ║
║                                           ║
║              [ Cancel ]  [ Go Back ]      ║
╚═══════════════════════════════════════════╝
```

**Features:**
- ⚠️ Warning icon in yellow/orange
- Blur background overlay
- Smooth fade-in animation
- Modal slides up from below
- Click outside to cancel
- Press Escape to cancel

## 🔀 Navigation Flow Chart

```
User in Quiz
    │
    ├─ Click Logo ────────────┐
    │                         ▼
    ├─ Click Home (Header) ──┤ Confirmation Dialog
    │                         │
    ├─ Click Home (Sidebar) ─┘ • Warning icon
    │                           • Message
    ▼                           • Two buttons
    
Confirmation Dialog
    │
    ├─ Click Cancel ──────► Stay in Quiz
    ├─ Press Escape ──────► Stay in Quiz  
    ├─ Click Outside ─────► Stay in Quiz
    │
    ├─ Click "Go Back" (Logo) ──► Return to Folder
    └─ Click "Go Back" (Home) ──► Go to Main Menu
```

## ⚡ Smart Detection

### Shows Confirmation When:
✅ Quiz is loaded with questions
✅ User has answered some questions
✅ User hasn't submitted yet

### Skips Confirmation When:
❌ Just browsing folders (no quiz loaded)
❌ No questions displayed yet
❌ Empty quiz container

## 🎭 User Experience

### Scenario 1: Accidental Click
```
1. User taking quiz
2. Accidentally hovers over logo
3. Sees "← Back to folder" hint
4. Accidentally clicks
5. 🛡️ Confirmation appears!
6. User clicks "Cancel"
7. ✅ Stays in quiz, no progress lost
```

### Scenario 2: Intentional Navigation
```
1. User wants to switch quizzes
2. Clicks logo to return to folder
3. Confirms "Go Back"
4. Returns to folder selection
5. Selects different quiz
6. ✅ Quick and efficient!
```

### Scenario 3: Go to Main Menu
```
1. User wants to change category
2. Clicks Home button
3. Confirms "Go Back"
4. Goes to main menu
5. Navigates to different folder
6. ✅ Easy navigation!
```

## 🔑 Key Benefits

✅ **Prevents Data Loss** - All unsaved progress protected
✅ **Consistent UX** - Same confirmation for all exits
✅ **Multiple Escape Routes** - Cancel, Escape, or click outside
✅ **Visual Feedback** - Clear warning icon and message
✅ **Smart Detection** - Only asks when necessary
✅ **Smooth Animations** - Professional feel
✅ **Keyboard Support** - Escape key works

## 🎯 Implementation Details

### CSS Classes:
- `.confirm-overlay` - Background blur
- `.confirm-modal` - White dialog box
- `.cancel-btn` - Gray cancel button
- `.confirm-btn` - Blue confirm button

### JavaScript Functions:
- `goBackToFolder()` - Logo click handler
- `goHomeWithConfirmation()` - Home button handler
- `showConfirmDialog()` - Shows modal

### Animations:
- `fadeIn` - Overlay appearance (0.2s)
- `fadeOut` - Overlay disappearance (0.2s)
- `slideUp` - Modal entrance (0.3s)