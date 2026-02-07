# SCORING.md

## Purpose
Scoring estimates **engineering capability demonstrated by a project under a specific profile**.

Scoring answers:
> "Given this profile interpretation, how strong is the demonstrated capability?"

Scoring does NOT:
- Pick the profile
- Apply cross-profile penalties
- Modify scores based on gaming flags (that's reliability's job)
- Make final selections

---

## Core Principles

### Principle 1: Profile-Conditional Scoring
Every score is computed **assuming a specific profile**.

There is no "universal score" - only:
- Score(project | production_web_app)
- Score(project | backend_api)
- Score(project | ml_pipeline)

### Principle 2: Dimensional Scoring
Scores are built from 5 dimensions:
1. Code Quality (0-25 points)
2. Architecture (0-20 points)
3. Testing (0-25 points)
4. Git Discipline (0-20 points)
5. DevOps (0-10 points)

Weights vary by profile.

### Principle 3: Normalization Within Profile
Expectations are profile-specific:
- 10 files is "small" for web app, "normal" for CLI
- Complexity 15 is "high" for frontend, "normal" for ML

### Principle 4: Additive Scoring
Start at 0, add points for evidence.
Never penalize for missing optional features.

---

## Dimension Scoring Formulas

### Dimension 1: Code Quality (Max 25 pts)

**Components:**
1. **Complexity Score** (0-10 pts)
2. **Long Code Score** (0-5 pts)
3. **Duplication Score** (0-5 pts)
4. **Lint Quality Score** (0-5 pts)

#### 1. Complexity Score

Profile-specific thresholds:
```
Frontend / CLI / Library:
  avg < 5: 10 pts
  avg < 10: 6 pts
  avg < 15: 3 pts
  avg >= 15: 0 pts

Backend / Web App:
  avg < 7: 10 pts
  avg < 12: 6 pts
  avg < 18: 3 pts
  avg >= 18: 0 pts

ML / Research:
  avg < 10: 10 pts
  avg < 20: 6 pts
  avg < 30: 3 pts
  avg >= 30: 0 pts
```

#### 2. Long Code Score
```
long_functions + long_files * 2 = penalty

penalty <= 2: 5 pts
penalty <= 5: 3 pts
penalty > 5: 0 pts
```

#### 3. Duplication Score
```
duplication < 5%: 5 pts
duplication < 10%: 3 pts
duplication < 20%: 1 pt
duplication >= 20%: 0 pts

Exception for profiles allowing duplication (games, UI-heavy):
  duplication < 15%: 5 pts
  duplication < 25%: 3 pts
```

#### 4. Lint Quality Score
```
critical_violations == 0: 5 pts
critical_violations <= 5: 3 pts
critical_violations <= 15: 1 pt
critical_violations > 15: 0 pts
```

---

### Dimension 2: Architecture (Max 20 pts)

**Components:**
1. **Structure Score** (0-8 pts)
2. **Circular Dependency Score** (0-7 pts)
3. **Coupling Score** (0-5 pts)

#### 1. Structure Score

Check for profile-expected directories:
```
matched_dirs = 0
for expected_dir in profile.expected_structure:
  if dir exists:
    matched_dirs += 1

score = (matched_dirs / total_expected) * 8
```

#### 2. Circular Dependency Score
```
circular_deps == 0: 7 pts
circular_deps <= 2: 4 pts
circular_deps > 2: 0 pts
```

#### 3. Coupling Score
```
avg_fan_out < 5: 5 pts
avg_fan_out < 10: 3 pts
avg_fan_out >= 10: 1 pt
```

---

### Dimension 3: Testing (Max 25 pts)

**Components:**
1. **Test Rigor Score** (0-15 pts)
2. **CI Test Integration** (0-5 pts)
3. **Test Count/Quality** (0-5 pts)

#### 1. Test Rigor Score (Static Analysis)
```
base_score = 0

if test_file_count > 0:
  base_score += 5

test_to_code_ratio:
  > 0.30: +8 pts
  > 0.15: +5 pts
  > 0.05: +2 pts

assertion_count:
  > 50: +7 pts
  > 20: +4 pts
  > 5: +2 pts

has_coverage_config: +3 pts

total = min(base_score, 15)
```

Profile adjustments:
- Library: Multiply by 1.2 (cap at 15)
- Academic: Multiply by 0.8
- ML: Alternative - check for data validation tests

#### 2. CI Test Integration
```
ci_runs_tests == true: 5 pts
ci_config_present but no tests: 2 pts
no ci: 0 pts
```

#### 3. Test Count/Quality
```
test_file_count >= 10 AND assertion_count >= 50: 5 pts
test_file_count >= 5 AND assertion_count >= 20: 3 pts
test_file_count >= 1: 1 pt
```

---

### Dimension 4: Git Discipline (Max 20 pts)

**Components:**
1. **Commit Atomicity** (0-6 pts)
2. **Commit Spread** (0-6 pts)
3. **Message Quality** (0-4 pts)
4. **Branch Workflow** (0-4 pts)

#### 1. Commit Atomicity
```
50 <= avg_commit_size <= 200: 6 pts
20 <= avg_commit_size <= 300: 4 pts
otherwise: 1 pt
```

#### 2. Commit Spread
```
spread_ratio >= 0.30: 6 pts
spread_ratio >= 0.15: 4 pts
spread_ratio < 0.15: 1 pt
```

Profile adjustments:
- Academic: Lower thresholds (>= 0.20: 6pts, >= 0.10: 4pts)
- Hackathon: Ignore (give neutral 3pts)

#### 3. Message Quality
```
avg_length >= 30 AND conventional_ratio >= 0.5: 4 pts
avg_length >= 20: 2 pts
avg_length < 20: 0 pts
```

#### 4. Branch Workflow
```
feature_branch_count >= 2 AND main_ratio < 0.7: 4 pts
feature_branch_count >= 1: 2 pts
all on main: 0 pts
```

Profile adjustments:
- Academic: Reduce weight (max 2 pts)
- Solo projects: Reduce weight

---

### Dimension 5: DevOps (Max 10 pts)

**Components:**
1. **CI Presence/Quality** (0-6 pts)
2. **Deployment Config** (0-4 pts)

#### 1. CI Presence/Quality
```
ci_present AND ci_quality_score >= 4: 6 pts
ci_present AND ci_quality_score >= 2: 4 pts
ci_present: 2 pts
no ci: 0 pts
```

#### 2. Deployment Config
```
Count deploy configs (Dockerfile, k8s, etc.)

>= 2 configs: 4 pts
1 config: 2 pts
0 configs: 0 pts
```

Profile adjustments:
- Library/CLI: Replace with package config check
- Academic: Often 0 pts (irrelevant)

---

## Total Score Calculation
```
raw_score = (
  code_quality_score * profile.weights.code_quality +
  architecture_score * profile.weights.architecture +
  testing_score * profile.weights.testing +
  git_score * profile.weights.git +
  devops_score * profile.weights.devops
)

# Note: Weights are decimals that sum to 1.0
# Example: 0.25 + 0.20 + 0.25 + 0.20 + 0.10 = 1.00

final_score = round(raw_score)
```

---

## Score Banding

Scores map to bands for communication:
```
90-100: Outstanding
75-89:  Very Good
60-74:  Good
45-59:  Satisfactory
0-44:   Needs Improvement
```

Bands are used in professor agreement metrics.

---

## Output Format
```json
{
  "profile": "production_web_app",
  "score": {
    "raw": 78,
    "band": "Very Good",
    "breakdown": {
      "code_quality": {
        "score": 19,
        "max": 25,
        "details": {
          "complexity": 8,
          "long_code": 5,
          "duplication": 3,
          "lint": 3
        }
      },
      "architecture": {
        "score": 16,
        "max": 20
      },
      "testing": {
        "score": 18,
        "max": 25
      },
      "git": {
        "score": 17,
        "max": 20
      },
      "devops": {
        "score": 8,
        "max": 10
      }
    },
    "weights_applied": {
      "code_quality": 0.25,
      "architecture": 0.20,
      "testing": 0.25,
      "git": 0.20,
      "devops": 0.10
    }
  }
}
```

---

## Multi-Profile Scoring

When multiple profiles are active:
```
For each active profile:
  1. Calculate score using profile's weights
  2. Record: score_under_profile[profile] = score

Do NOT average or combine yet.
That happens in BEST-VALID selection.
```

---

## Rules

- Scores are deterministic (same inputs → same outputs)
- Scores are profile-specific (never mix profiles)
- Scores are additive (never subtract for missing features)
- Scores are normalized within profile expectations
- Scores ignore gaming flags (reliability handles that separately)