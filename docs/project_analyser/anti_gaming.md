# ANTI_GAMING.md

## Purpose
Anti-gaming detects **risk patterns** where metrics may be misleading.

It does NOT:
- Infer intent
- Accuse students
- Reduce scores directly
- Hide findings

---

## Philosophy

### Detection Without Judgment
We detect **patterns**, not motivations.

Good pattern language:
- ✅ "Fork with minimal divergence"
- ✅ "Commit concentration in short timeframe"
- ❌ "Student plagiarized"
- ❌ "Fake project"

### Transparency
All flags are visible to students.
All flags include evidence.
All flags explain impact.

### Context-Awareness
Flags are **profile-dependent**.

Pattern may be:
- Suspicious in one context
- Normal in another

---

## Detection Pipeline

Anti-gaming runs AFTER profile selection:
```
1. Profile determined (e.g., "academic_assignment")
2. Load profile-specific gaming rules
3. Check metrics against rules
4. Generate flags with context
5. Calculate reliability dampening
6. Output findings
```

---

## Gaming Pattern Catalog

### Pattern 1: Fork Minimal Divergence

**Detection:**
```
is_fork == true AND commit_count < 5
```

**Severity by Profile:**
- Production Web App: HIGH
- Academic Assignment: HIGH
- Research/ML: MEDIUM (forks are common)
- Library: MEDIUM

**Flag Output:**
```
{
  "pattern": "fork_minimal_divergence",
  "severity": "high",
  "confidence": 0.95,
  "description": "Forked repository with very few original commits",
  "evidence": {
    "is_fork": true,
    "commit_count": 3,
    "threshold": 5
  }
}
```

**Reliability Impact:** -30%

---

### Pattern 2: Commit Burst

**Detection:**
```
commit_count > 20 AND commit_span_days <= 2
```

**Severity by Profile:**
- Production Web App: HIGH
- Backend API: HIGH
- Academic Assignment: LOW (normal for submissions)
- Hackathon: IGNORE (expected pattern)

**Flag Output:**
```
{
  "pattern": "commit_burst",
  "severity": "high",
  "confidence": 0.90,
  "description": "All work completed in 1-2 days suggests rushed or bulk import",
  "evidence": {
    "commit_count": 47,
    "commit_span_days": 2,
    "expected_span": "> 7 days"
  }
}
```

**Reliability Impact:** -25%

---

### Pattern 3: Single Commit Dump

**Detection:**
```
commit_count == 1
```

**Severity by Profile:**
- ALL: HIGH (except rare edge cases)

**Flag Output:**
```
{
  "pattern": "single_commit",
  "severity": "high",
  "confidence": 1.0,
  "description": "Entire project in single commit",
  "evidence": {
    "commit_count": 1
  }
}
```

**Reliability Impact:** -40%

---

### Pattern 4: Repetitive Commit Messages

**Detection:**
```
unique_messages / total_messages < 0.25
```

**Severity by Profile:**
- Production Web App: MEDIUM
- Academic: LOW
- Research: LOW

**Flag Output:**
```
{
  "pattern": "repetitive_commits",
  "severity": "medium",
  "confidence": 0.80,
  "description": "Low commit message diversity",
  "evidence": {
    "unique_ratio": 0.18,
    "total_commits": 50,
    "example_messages": ["update", "fix", "change"]
  }
}
```

**Reliability Impact:** -15%

---

### Pattern 5: Generic Messages Only

**Detection:**
```
generic_pattern_ratio > 0.70
```

Where generic patterns = ["update", "fix", "change", "commit", "test"]

**Severity by Profile:**
- ALL: LOW

**Flag Output:**
```
{
  "pattern": "generic_messages",
  "severity": "low",
  "confidence": 0.70,
  "description": "Majority of commits have generic messages",
  "evidence": {
    "generic_ratio": 0.75
  }
}
```

**Reliability Impact:** -10%

---

### Pattern 6: File Explosion

**Detection:**
```
file_count > 200 AND max_folder_depth < 3 AND avg_loc_per_file < 20
```

**Severity by Profile:**
- Production Web App: MEDIUM
- Others: LOW

**Flag Output:**
```
{
  "pattern": "file_explosion",
  "severity": "medium",
  "confidence": 0.75,
  "description": "Unusually high file count with shallow structure",
  "evidence": {
    "file_count": 347,
    "avg_loc_per_file": 12,
    "folder_depth": 2
  }
}
```

**Reliability Impact:** -20%

---

### Pattern 7: Dependency Inflation

**Detection:**
```
dependency_count > 30 AND (file_count < 20 OR total_loc < 1000)
```

**Severity by Profile:**
- CLI/Library: MEDIUM
- Web App: LOW (deps are normal)

**Flag Output:**
```
{
  "pattern": "dependency_inflation",
  "severity": "medium",
  "confidence": 0.80,
  "description": "Unusually high dependency count for project size",
  "evidence": {
    "dependency_count": 47,
    "file_count": 12,
    "total_loc": 650
  }
}
```

**Reliability Impact:** -18%

---

### Pattern 8: Boilerplate Heavy

**Detection:**
```
generated_file_ratio > 0.80
```

**Severity by Profile:**
- ALL: MEDIUM

**Flag Output:**
```
{
  "pattern": "boilerplate_heavy",
  "severity": "medium",
  "confidence": 0.70,
  "description": "High proportion of generated/boilerplate files",
  "evidence": {
    "generated_ratio": 0.85
  }
}
```

**Reliability Impact:** -22%

---

### Pattern 9: Low Ownership

**Detection:**
```
contributor_count > 1 AND top_contributor_percent < 30
```

**Severity by Profile:**
- ALL: MEDIUM

**Flag Output:**
```
{
  "pattern": "low_ownership",
  "severity": "medium",
  "confidence": 0.75,
  "description": "Low contribution percentage suggests limited individual ownership",
  "evidence": {
    "top_contributor_percent": 22,
    "contributor_count": 4
  }
}
```

**Reliability Impact:** -20%

---

### Pattern 10: Minimal Project

**Detection:**
```
file_count < 10 AND total_loc < 500 AND dependency_count < 3
```

**Severity by Profile:**
- Production Web App: MEDIUM
- CLI: LOW (can be minimal)
- Academic: LOW

**Flag Output:**
```
{
  "pattern": "minimal_project",
  "severity": "low",
  "confidence": 0.60,
  "description": "Very minimal project scope",
  "evidence": {
    "file_count": 7,
    "total_loc": 380
  }
}
```

**Reliability Impact:** -12%

---

## Reliability Calculation
```
reliability = 1.0  # Start at perfect

for each flag:
  severity_weight = {
    "low": 0.05,
    "medium": 0.15,
    "high": 0.30
  }
  
  dampening = severity_weight[flag.severity] * flag.confidence
  reliability *= (1 - dampening)

# Boost for positive signals
if commit_span_days > 30 AND commit_count > 20:
  reliability = min(1.0, reliability * 1.1)

if test_file_count > 10:
  reliability = min(1.0, reliability * 1.05)

# Clamp
reliability = max(0.0, min(1.0, reliability))
```

---

## Reliability Levels
```
reliability >= 0.85: HIGH
reliability >= 0.65: MEDIUM
reliability < 0.65:  LOW
```

---

## Output Format
```json
{
  "anti_gaming": {
    "flags": [
      {
        "pattern": "commit_burst",
        "severity": "high",
        "confidence": 0.90,
        "description": "...",
        "evidence": {...}
      }
    ],
    "flag_count": 1,
    "reliability_score": 0.72,
    "reliability_level": "medium",
    "should_flag_for_review": false,
    "profile_context": "production_web_app"
  }
}
```

---

## Effect on Final Score

Anti-gaming does NOT change the score.

It changes the RELIABILITY, which:
- Widens score range for display
- Affects leaderboard secondary sort
- Triggers review if severe

**Example:**
```
Raw score: 78

High reliability (0.92):
  Display: 76-80 (Very Good)

Medium reliability (0.72):
  Display: 71-85 (Good to Very Good)

Low reliability (0.48):
  Display: 63-93 (Good to Outstanding)
  Note: "Manual review recommended"
```

---

## Rules

- Flags are profile-dependent
- Flags are always visible
- Flags never reduce scores
- Flags affect reliability only
- Multiple flags compound