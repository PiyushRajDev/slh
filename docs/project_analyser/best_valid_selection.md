# BEST_VALID_SELECTION.md

## Purpose
Best-valid selection chooses **the highest defensible score** across all valid profile interpretations.

This answers:
> "What's the most charitable valid way to evaluate this project?"

This does NOT:
- Pick profiles arbitrarily
- Average across profiles
- Hide alternatives
- Ignore evidence

---

## Philosophy

### The Professor Simulation

Professors don't rigidly categorize projects.
They subconsciously ask:

> "Given what this student built, what's the **strongest fair case** I can make for their capability?"

This system formalizes that charitable interpretation.

### Multiple Lenses, Single Answer

Process:
1. Try multiple interpretation lenses (profiles)
2. Score under each valid lens
3. Apply context-aware anti-gaming to each
4. Pick the interpretation with highest **defensible** score
5. Present that one answer

Students see one score.
System evaluated multiple possibilities.

---

## The Selection Algorithm

### Step 1: Collect Candidate Scores

Input from previous steps:
```
active_profiles = [
  {
    "profile": "production_web_app",
    "fitness": 0.82,
    "score": 76,
    "reliability": 0.88
  },
  {
    "profile": "backend_api", 
    "fitness": 0.78,
    "score": 81,
    "reliability": 0.85
  },
  {
    "profile": "academic_project",
    "fitness": 0.45,
    "score": 68,
    "reliability": 0.92
  }
]
```

### Step 2: Filter by Fitness Threshold
```
valid_candidates = [
  profile for profile in active_profiles
  if profile.fitness >= MINIMUM_FITNESS_THRESHOLD
]

MINIMUM_FITNESS_THRESHOLD = 0.50
```

**Example:**
```
After filtering:
  - production_web_app: 0.82 ✓
  - backend_api: 0.78 ✓
  - academic_project: 0.45 ✗ (rejected)
```

### Step 3: Calculate Defensible Score

For each valid candidate:
```
defensible_score = score * fitness * reliability

This represents:
  "How high can we score this project while 
   remaining honest about fit and authenticity?"
```

**Example:**
```
production_web_app:
  76 * 0.82 * 0.88 = 54.9

backend_api:
  81 * 0.78 * 0.85 = 53.6
```

### Step 4: Select Winner
```
selected_profile = argmax(defensible_score)
```

**Example:**
```
Winner: production_web_app
  - Highest defensible score (54.9)
  - Even though raw score was lower
```

### Step 5: Record Runner-Up (Optional)

If top two are very close:
```
if second_best_defensible >= 0.95 * best_defensible:
  flag_as_ambiguous = true
  record_runner_up = second_best_profile
```

---

## Example Scenarios

### Scenario 1: Clear Winner
```
Candidates:
  A: score=85, fitness=0.90, reliability=0.92
     defensible = 70.4
     
  B: score=72, fitness=0.65, reliability=0.88
     defensible = 41.2

Selection: Profile A
Ambiguity: No
```

### Scenario 2: Lower Score Wins Due to Fit
```
Candidates:
  A: score=88, fitness=0.60, reliability=0.70
     defensible = 36.9
     
  B: score=79, fitness=0.88, reliability=0.90
     defensible = 62.6

Selection: Profile B
Reason: Better fit and reliability outweigh raw score
Ambiguity: No
```

### Scenario 3: Ambiguous Case
```
Candidates:
  A: score=82, fitness=0.85, reliability=0.88
     defensible = 61.3
     
  B: score=79, fitness=0.90, reliability=0.87
     defensible = 61.8

Selection: Profile B
Difference: 0.8% (very close)
Ambiguity: YES
Runner-up: Profile A

Note: "Project shows characteristics of both [A] and [B]"
```

### Scenario 4: Low Reliability Overrides High Score
```
Candidates:
  A: score=91, fitness=0.82, reliability=0.45
     defensible = 33.6
     (flagged: fork with minimal divergence)
     
  B: score=74, fitness=0.78, reliability=0.92
     defensible = 53.1

Selection: Profile B
Reason: Profile A has too many gaming flags
```

---

## Edge Cases

### Case 1: No Valid Profiles
```
If all profiles have fitness < 0.50:
  - Use fallback generic profile
  - Apply conservative scoring
  - Flag: "Project does not match standard patterns"
  - Recommend: Manual review
```

### Case 2: Single Valid Profile
```
If only one profile has fitness >= 0.50:
  - Select it automatically
  - No comparison needed
  - Still apply anti-gaming and confidence
```

### Case 3: Tie in Defensible Scores
```
If two profiles have identical defensible scores:
  - Select the one with higher raw score
  - If still tied, select higher fitness
  - If still tied, select higher reliability
  - Document as ambiguous
```

---

## Selection Metadata

Record the decision process:
```json
{
  "selection": {
    "chosen_profile": "backend_api",
    "chosen_score": 81,
    "chosen_defensible": 62.5,
    
    "reason": "highest_defensible_score",
    
    "alternatives_considered": [
      {
        "profile": "production_web_app",
        "score": 76,
        "defensible": 54.9,
        "rejected_reason": "lower_defensible_score"
      }
    ],
    
    "is_ambiguous": false,
    "runner_up": null,
    
    "selection_confidence": 0.85
  }
}
```

---

## Selection Transparency

### What Students See
```
Your Score: 79-83 (Very Good)
Evaluated As: Backend API Service

This project was evaluated as a backend API based on:
  ✓ API framework detected (Flask)
  ✓ Database models present
  ✓ REST endpoints implemented
  ✓ Deployment configuration
```

### What Students Don't See (Internal)
```
Considered interpretations:
  - Backend API: score=81, defensible=62.5 ← SELECTED
  - Production Web App: score=76, defensible=54.9
  - Academic Project: fitness too low (0.45)
```

**Why hide alternatives?**
- Reduces confusion
- Focuses on chosen interpretation
- Avoids "score shopping" complaints

**When to show alternatives?**
- If student contests the evaluation
- If ambiguous case (close runner-up)
- In detailed breakdown view

---

## Impact on Leaderboard

### Primary Sort: Score
Use the selected profile's score

### Secondary Sort: Defensible Score
When scores are tied, use defensible score

**Example:**
```
Student A: score=78, defensible=67.1
Student B: score=78, defensible=62.4

Rank: A > B
```

### Tertiary Sort: Reliability
If defensible scores also tied

---

## Output Format
```json
{
  "best_valid_selection": {
    "selected": {
      "profile": "backend_api",
      "profile_display": "Backend API Service",
      "score": 81,
      "fitness": 0.78,
      "reliability": 0.85,
      "defensible_score": 53.6
    },
    
    "alternatives": [
      {
        "profile": "production_web_app",
        "score": 76,
        "defensible_score": 54.9,
        "not_selected_reason": "lower_defensible_score"
      }
    ],
    
    "metadata": {
      "is_ambiguous": false,
      "selection_confidence": 0.85,
      "alternatives_count": 1
    }
  }
}
```

---

## Rules

- Selection happens after all profiles are scored
- Selection considers fitness, score, and reliability
- Highest defensible score wins
- Ties are broken deterministically
- Selection is always explainable
- Students see chosen interpretation only (by default)