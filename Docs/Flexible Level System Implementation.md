# Flexible Level System Implementation

## Overview
The quiz application now uses a **flexible level detection system** that automatically extracts and uses content found within parentheses `()` **at the end of the question line** as level/category identifiers.

## How It Works

### 1. End-of-Line Detection
The system **only checks the last parentheses at the end of each question** for level information:

✅ **Correct Examples:**
```
What is peacock (a bird name) favorite nest type (Level 2)
```
→ Level: "Level 2" (ignores the middle parentheses)

```
What is peacock (a bird name) favorite nest type (A, B)
```
→ Levels: "A" and "B"

```
What is the capital of France? (Basic)
```
→ Level: "Basic"

```
Define thermodynamics (Level 1)
```
→ Level: "Level 1"

❌ **No Level at End:**
```
What is peacock (a bird name) favorite nest type
```
→ Level: "No level" (automatically assigned)

```
Explain the process (as shown in diagram)
```
→ Level: "No level"

### 2. Multiple Levels Per Question
Questions can belong to multiple categories using comma or semicolon:
```
What is the primary function? (A, B)
```
This question will be tagged with both "A" and "B" levels.

```
Define acceleration (Basic; Physics)
```
This question gets both "Basic" and "Physics" levels.

### 3. Delimiter Support
The system splits by commas (`,`) or semicolons (`;`):
- `(A, B, C)` → 3 levels
- `(A; B; C)` → 3 levels
- `(Module 1, Module 2)` → 2 levels

### 4. Smart Exclusions
The system automatically:
- **Only reads the LAST set of parentheses** on the question line
- Excludes image references: `(IMG:diagram.png)` at the end is ignored
- Ignores parentheses in the middle of questions

### 5. Default Handling
If no parentheses are found at the end, the question is tagged as **"No level"**

## Display Features

### Level Checkbox Sorting
Levels are displayed in an intelligent order:
1. **Numeric levels first** (1, 2, 3...)
2. **Alphabetical levels** (A, B, C... or Advanced, Basic...)

### Compact Display
- Numeric levels: shown as "L1", "L2", etc.
- Text levels: shown as-is
- All levels show count: "L1 (15)", "Basic (10)"

## Example Use Cases

### Traditional Numbered Levels
```
Question 1 (Level 1)
Question 2 (Level 2)
```
**Result:** L1, L2 checkboxes

### Letter Categories
```
Question 1 (A)
Question 2 (B)
Question 3 (A, B)
```
**Result:** A, B checkboxes

### Named Categories
```
Question 1 (Basic)
Question 2 (Intermediate)
Question 3 (Advanced)
```
**Result:** Basic, Intermediate, Advanced checkboxes

### Questions with Parentheses in Content
```
What is a peacock (a bird) favorite nest? (Level 1)
Define momentum (mass × velocity) in physics (Advanced)
Explain the process (as shown) clearly (Module 2)
```
**Result:** Only the LAST parentheses matter:
- Level 1
- Advanced
- Module 2

### Questions Without End Labels
```
What is the capital of France?
Define thermodynamics (heat transfer)
```
**Result:** Both get "No level" category

### Chapter Organization
```
Question 1 (Chapter 1)
Question 2 (Chapter 2)
Question 3 (Chapter 1, Chapter 2)
```
**Result:** Chapter 1, Chapter 2 checkboxes

### Mixed Categories
```
Question 1 (Module A, Easy)
Question 2 (Module B, Hard)
```
**Result:** Module A, Module B, Easy, Hard checkboxes

## Benefits

✅ **End-of-Line Detection** - Only reads levels from the end of questions
✅ **Context-Aware** - Ignores parentheses used for explanations in the middle
✅ **Universal Compatibility** - Works with any quiz format
✅ **No Configuration Required** - Automatically detects categories
✅ **Multi-Category Support** - Questions can belong to multiple levels
✅ **Flexible Naming** - Use any naming convention
✅ **Smart Sorting** - Numbers before text, alphabetical within groups
✅ **Backward Compatible** - Still works with old (Level 1) format
✅ **Default Handling** - Questions without levels get "No level" tag

## Files Updated

1. **`parser.js`**
   - Flexible parentheses content extraction
   - Multiple level assignment per question
   - Smart level sorting

2. **`quiz-settings.js`**
   - Dynamic checkbox creation
   - Data attribute storage for level names
   - Proper CSS escaping for IDs

3. **`quiz-loader.js`**
   - Enhanced level info display
   - Formatted output for different level types

## Technical Implementation

### Level Storage
Levels are stored as strings in a key-value object:
```javascript
{
  "A": 5,
  "B": 8,
  "Advanced": 12
}
```

### Checkbox Generation
Each checkbox stores the actual level name:
```html
<input type="checkbox" 
       id="level-A" 
       data-level="A" 
       checked>
<label for="level-A">A (5)</label>
```

### Filtering
Questions are matched against selected levels using string comparison:
```javascript
selectedLevels = ["A", "Advanced"]
// Question with (A) → included
// Question with (B) → excluded
// Question with (A, B) → included (has "A")
```

## Usage Tips

1. **Place Levels at the End**: Always put level indicators at the very end of the question
   - ✅ `What is X? (Level 1)`
   - ❌ `What (Level 1) is X?`

2. **Use Parentheses Freely in Content**: Parentheses in the middle are ignored
   - ✅ `Define momentum (mass × velocity) in detail (Physics)`
   - Result: Only "Physics" is used as the level

3. **Multiple Categories**: Use commas or semicolons for multiple levels
   - `Question text (A, B, C)`
   - `Question text (Basic; Chapter 1)`

4. **Consistent Naming**: Use consistent category names throughout your quiz

5. **Descriptive Names**: Use meaningful names like "Basic" instead of just "1"

6. **No Level Tag**: Questions without end labels will show under "No level"

## Migration from Old System

**Old Format:**
```
Question text (Level 1)
```

**Still Works! No Changes Needed.**

**New Formats (also work):**
```
Question text (A)
Question text (Basic, Core)
Question text (Module 1; Chapter 2)
```

**Questions with Parentheses:**
```
Old: What is a bird (animal) type? → Uncategorized
New: What is a bird (animal) type? → No level
New: What is a bird (animal) type? (Level 1) → Level 1
```

**Key Difference:** Only the LAST parentheses on the line determines the level!

# Level Detection - Visual Examples

## ✅ Correct Detection (End of Line Only)

### Example 1: Parentheses in Content
```
Question: What is peacock (a bird name) favorite nest type (Level 2)
```
- **Ignores:** `(a bird name)` - in the middle
- **Uses:** `(Level 2)` - at the end
- **Result:** Level = "Level 2"

---

### Example 2: Multiple Levels
```
Question: What is peacock (a bird name) favorite nest type (Level 2, Level 3)
```
- **Ignores:** `(a bird name)`
- **Uses:** `(Level 2, Level 3)`
- **Result:** Levels = "Level 2" AND "Level 3"

---

### Example 3: Complex Content with Multiple Parentheses
```
Question: Define momentum (mass × velocity) in physics (from Newton's laws) (Advanced)
```
- **Ignores:** `(mass × velocity)` and `(from Newton's laws)`
- **Uses:** `(Advanced)`
- **Result:** Level = "Advanced"

---

### Example 4: No Level Indicator
```
Question: What is peacock (a bird name) favorite nest type
```
- **Ignores:** `(a bird name)` - not at the end
- **No level at end**
- **Result:** Level = "No level"

---

### Example 5: Semicolon Separator
```
Question: Explain thermodynamics (A; B; C)
```
- **Uses:** `(A; B; C)` at the end
- **Splits by semicolon**
- **Result:** Levels = "A", "B", AND "C"

---

## 📋 More Examples

| Question Text | Detected Level(s) |
|---------------|-------------------|
| `What is X? (Level 1)` | Level 1 |
| `What is X?` | No level |
| `Define Y (definition) (Module 2)` | Module 2 |
| `What is Z (A, B)` | A, B |
| `Explain W (info) (Basic; Core)` | Basic, Core |
| `Question (context)` | No level |
| `Question (context) (1)` | 1 |
| `Question (a) (b) (c) (Final)` | Final |

---

## 🎯 Key Rules

1. **Only the LAST parentheses matter**
2. **Everything before the last parentheses is ignored for level detection**
3. **Split by comma (`,`) or semicolon (`;`) for multiple levels**
4. **No parentheses at the end = "No level" category**
5. **Image references `(IMG:...)` at the end are ignored**

---

## 🔧 Quiz File Format

### Sample Quiz with Mixed Formats:
```
What is the capital of France? (Basic)
@@Paris
London
Berlin
Rome

Define momentum (mass × velocity) clearly (Physics, Advanced)
@@The product of mass and velocity
The sum of forces
The rate of change
The energy state

What is a peacock (a colorful bird) known for
@@Its beautiful tail feathers
Its speed
Its size
Its diet

Explain gravity (Level 1)
@@Force of attraction
Type of energy
Form of matter
State of motion
```

### Results:
- **Categories detected:** Basic, Physics, Advanced, No level, Level 1
- Question 1 → Basic
- Question 2 → Physics AND Advanced
- Question 3 → No level
- Question 4 → Level 1