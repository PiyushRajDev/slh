# INTEGRATION.md

## Purpose
This document describes **how all components work together** to produce the final capability assessment.

---

## Complete Pipeline Flow
```
INPUT: GitHub Repository URL
  ↓
┌─────────────────────────────────────┐
│ 1. CLONE & EXTRACT METRICS          │
│    - Shallow clone (depth=1)        │
│    - Run static analysis            │
│    - Parse git history              │
│    - Output: Raw metrics (facts)    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. DERIVE STRUCTURAL SIGNALS        │
│    - Binary patterns from metrics   │
│    - Layer detection                │
│    - Scope indicators               │
│    - Output: Structural signals     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. EVALUATE PROFILE FITNESS         │
│    - Score against all profiles     │
│    - Keep profiles with fitness>0.5 │
│    - Output: Active profiles list   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 4. SCORE UNDER EACH PROFILE         │
│    (PARALLEL)                       │
│    - For each active profile:       │
│      * Apply profile weights        │
│      * Calculate dimensional scores │
│      * Output: Score per profile    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 5. ANTI-GAMING (CONTEXT-AWARE)      │
│    (PARALLEL)                       │
│    - For each active profile:       │
│      * Apply profile-specific rules │
│      * Detect patterns              │
│      * Output: Reliability per prof │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 6. BEST-VALID SELECTION             │
│    - Calculate defensible scores    │
│    - Select highest defensible      │
│    - Output: Chosen profile + score │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 7. CONFIDENCE CALCULATION           │
│    - Metric quality                 │
│    - Profile fitness                │
│    - Reliability                    │
│    - Data completeness              │
│    - Output: Confidence level       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 8. FINAL PRESENTATION               │
│    - Score range based on confidence│
│    - Band assignment                │
│    - Recommendations                │
│    - Output: Student-facing report  │
└──────────────┬──────────────────────┘
               ↓
OUTPUT: Capability Assessment Report
```

---

## Data Flow Example

### Input
```
Repository: https://github.com/student/flask-todo-api
Commit SHA: abc123...
```

### After Step 1: Metrics
```json
{
  "complexity_avg": 6.2,
  "file_count": 47,
  "test_file_count": 8,
  "commit_count": 38,
  "commit_span_days": 25,
  "has_backend": true,
  ...
}
```

### After Step 2: Structural Signals
```json
{
  "has_frontend": false,
  "has_backend": true,
  "has_database": true,
  "has_tests": true,
  "has_ci": true,
  "is_sustained": true
}
```

### After Step 3: Profile Fitness
```json
{
  "backend_api": 0.85,
  "production_web_app": 0.68,
  "academic_project": 0.35
}

Active: ["backend_api", "production_web_app"]
```

### After Step 4: Scoring
```json
{
  "backend_api": {
    "score": 82,
    "breakdown": {...}
  },
  "production_web_app": {
    "score": 74,
    "breakdown": {...}
  }
}
```

### After Step 5: Anti-Gaming
```json
{
  "backend_api": {
    "flags": [],
    "reliability": 0.91
  },
  "production_web_app": {
    "flags": [{"pattern": "missing_frontend", ...}],
    "reliability": 0.78
  }
}
```

### After Step 6: Selection
```json
{
  "selected": "backend_api",
  "score": 82,
  "defensible_score": 63.5
}
```

### After Step 7: Confidence
```json
{
  "overall_confidence": 0.87,
  "level": "high",
  "score_range_width": 5
}
```

### After Step 8: Final Output
```json
{
  "score_range": [79, 87],
  "band": "Very Good",
  "profile": "Backend API Service",
  "confidence": "high",
  "message": "High confidence in capability assessment"
}
```

---

## Parallel Processing Strategy

Steps 4 and 5 can run in parallel for each profile:
```
Profile A: Score (15s) + Anti-Gaming (2s) = 17s
Profile B: Score (15s) + Anti-Gaming (2s) = 17s

Sequential: 34s
Parallel: 17s

50% time savings
```

---

## Caching Strategy

### Level 1: Metrics Cache
```
Key: repo_owner:repo_name:commit_sha
TTL: Infinite (immutable)
Hit rate: ~40% (re-submissions)
```

### Level 2: Profile Scores Cache
```
Key: metrics_hash:profile_name
TTL: 24 hours
Hit rate: ~60% (same metrics, multiple profiles)
```

### Level 3: Final Results Cache
```
Key: repo_owner:repo_name:commit_sha:version
TTL: 7 days
Hit rate: ~70% (viewing results)
```

---

## Error Handling

### Metric Extraction Failure
```
If metric extraction fails:
  - Log error
  - Mark metric as null
  - Continue with available metrics
  - Lower confidence accordingly
```

### Profile Selection Failure
```
If no profiles have fitness > 0.5:
  - Use generic fallback profile
  - Apply conservative scoring
  - Confidence = LOW
  - Flag for manual review
```

### Scoring Failure
```
If scoring throws error:
  - Log full context
  - Return partial score if possible
  - Mark as failed
  - Notify admin
```

---

## Validation Gates

### Gate 1: Repository Access
```
Can we clone the repository?
  YES → Continue
  NO → Error: "Repository not found or not accessible"
```

### Gate 2: Metrics Completeness
```
Were critical metrics extracted?
  YES (>80%) → Continue
  PARTIAL (50-80%) → Continue with LOW confidence
  NO (<50%) → Error: "Unable to analyze repository"
```

### Gate 3: Profile Match
```
Did any profile match?
  YES → Continue
  NO → Use fallback + flag for review
```

---

## Output Versioning

Every analysis includes version metadata:
```json
{
  "analysis_version": "1.0.0",
  "metric_definitions_version": "1.0.0",
  "profile_definitions_version": "1.0.0",
  "scoring_algorithm_version": "1.0.0",
  "timestamp": "2025-02-08T10:30:00Z"
}
```

Why?
- Allows recomputation with new algorithms
- Enables comparison across versions
- Supports academic research
- Legal compliance

---

## Student-Facing Report Structure
```
┌─────────────────────────────────────┐
│ YOUR CAPABILITY ASSESSMENT          │
│                                     │
│ Score: 79-84 (Very Good)           │
│ Profile: Backend API Service       │
│ Confidence: High                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ STRENGTHS                           │
│ ✓ Well-structured API design       │
│ ✓ Comprehensive testing             │
│ ✓ Consistent development effort    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ GROWTH AREAS                        │
│ • Code complexity could be reduced  │
│ • Consider adding CI/CD pipeline    │
│ • Database query optimization       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ DETAILED BREAKDOWN                  │
│ Code Quality:     19/25 ████████░   │
│ Architecture:     16/20 ████████░   │
│ Testing:          21/25 ████████░   │
│ Git Discipline:   18/20 █████████   │
│ DevOps:            6/10 ██████░░░   │
└─────────────────────────────────────┘

[View Full Technical Report]
[Download PDF]
```

---

## Professor-Facing Analytics

Professors see aggregated data:
```
Class Analytics

Average Score: 73.2
Score Distribution:
  Outstanding (90-100): 8%
  Very Good (75-89):   42%
  Good (60-74):        35%
  Satisfactory (45-59): 12%
  Needs Work (<45):     3%

Common Strengths:
  • Testing practices improving
  • Git workflow adoption up 23%

Common Growth Areas:
  • Code complexity management
  • CI/CD adoption still low (28%)

[Export Class Report]
```

---

## Performance Targets
```
Metric Extraction:        15-25s
Profile Evaluation:        1-2s
Scoring (all profiles):    5-8s
Anti-Gaming:               1-2s
Selection + Confidence:    1s
Report Generation:         1s

TOTAL:                    25-40s per project

For 500 students (20 workers):
  Total processing time: ~18 minutes
```

---

## Rules

- Pipeline is deterministic (same input → same output)
- Each step is independently testable
- Errors are logged with full context
- All decisions are explainable
- Student privacy is maintained
- Results are versioned and reproducible