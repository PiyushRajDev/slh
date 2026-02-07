# CONFIDENCE.md

## Purpose
Confidence indicates **how reliable the capability measurement is**.

Confidence answers:
> "How much evidence supports this assessment?"

Confidence does NOT:
- Change the score
- Penalize students
- Hide uncertainty
- Modify metrics

---

## Philosophy

### Honesty About Limitations
Some projects have clear signals.
Some projects have ambiguous or limited data.
Confidence makes this transparent.

### Confidence ≠ Capability
A student can demonstrate:
- High capability with low confidence (limited data)
- Low capability with high confidence (clear evidence)

These are orthogonal dimensions.

### Confidence Affects Presentation
- High confidence → Narrow score range
- Low confidence → Wide score range + caveat
- Never hides the score

---

## Confidence Factors

Confidence is calculated from 4 inputs:

### Factor 1: Metric Quality (0-1)
How complete and reliable are the measurements?
```
For each metric:
  - Successfully extracted: confidence = 0.9
  - Estimated/approximated: confidence = 0.7
  - Failed/missing: confidence = 0.0

metric_quality = average(all_metric_confidences)
```

**Examples:**
```
Complexity measurement:
  - AST parsed successfully: 0.95
  - Very small project (<5 functions): 0.6
  - Parse failed: 0.0

Test coverage:
  - Tests executed, coverage measured: 0.95
  - Static analysis (estimated): 0.70
  - No tests found: 0.50 (confident it's zero)

Git metrics:
  - 50+ commits: 0.95
  - 10-50 commits: 0.85
  - <10 commits: 0.60
  - Single commit: 0.40
```

---

### Factor 2: Profile Fitness (0-1)
How well does the project match the selected profile?
```
fitness = (from profile matching step)

High fitness (>= 0.80): confidence boost
Medium fitness (0.60-0.79): neutral
Low fitness (< 0.60): confidence penalty
```

**Example:**
```
Project scored as "Backend API"
Profile fitness: 0.92

This gives high confidence that we're evaluating 
the project under the right lens.
```

---

### Factor 3: Anti-Gaming Reliability (0-1)
How trustworthy is the effort/ownership signal?
```
reliability = (from anti-gaming step)

High reliability (>= 0.85): confidence boost
Medium reliability (0.65-0.84): neutral  
Low reliability (< 0.65): confidence penalty
```

**Example:**
```
Project flagged for:
  - Commit burst (medium severity)
  - Fork with limited divergence (high severity)

Reliability: 0.58

This lowers confidence that the metrics 
represent authentic student work.
```

---

### Factor 4: Data Completeness (0-1)
How much evidence do we have?
```
Indicators of completeness:
  - Commit count >= 20: +0.1
  - Test files present: +0.1
  - CI configured: +0.05
  - Documentation present: +0.05
  - Multiple languages: +0.05
  - Sustained timeline (>30 days): +0.1

Base completeness = 0.5
Max completeness = 1.0
```

**Example:**
```
Project has:
  - 47 commits ✓
  - 12 test files ✓
  - CI ✓
  - README ✓
  - 42 day timeline ✓

Completeness: 0.90
```

---

## Overall Confidence Calculation
```
overall_confidence = (
  metric_quality * 0.35 +
  profile_fitness * 0.25 +
  reliability * 0.25 +
  data_completeness * 0.15
)

# Weights:
# - Metric quality (35%): Most important
# - Profile fitness (25%): Right interpretation?
# - Reliability (25%): Authentic work?
# - Completeness (15%): Enough data?
```

---

## Confidence Levels
```
>= 0.85: HIGH
  - "High confidence in capability assessment"
  - Narrow score range (±3-5 points)
  - No caveats needed

0.70-0.84: MEDIUM
  - "Moderate confidence - some limitations in measurement"
  - Medium score range (±6-10 points)
  - Minor caveats listed

< 0.70: LOW
  - "Limited confidence - significant measurement constraints"
  - Wide score range (±11-15 points)
  - Recommend manual review
```

---

## Caveat Generation

Based on confidence factors, generate specific caveats:

### Low Metric Quality Caveats
```
If complexity measurement failed:
  "Code complexity could not be measured accurately"

If test coverage estimated (not measured):
  "Test coverage estimated from static analysis, not measured"

If very small project (<10 commits):
  "Limited commit history - git metrics less meaningful"
```

### Low Profile Fitness Caveats
```
If fitness < 0.70:
  "Project has mixed characteristics - may fit multiple categories"

If multiple profiles had similar fitness:
  "Project could be interpreted as [Profile A] or [Profile B]"
```

### Low Reliability Caveats
```
If commit burst detected:
  "Concentrated development timeline may affect git discipline metrics"

If fork with limited divergence:
  "Forked repository with limited original contributions"

If low ownership:
  "Limited individual contribution in collaborative project"
```

### Low Completeness Caveats
```
If commit_count < 10:
  "Limited development history available"

If no tests:
  "No automated tests detected - testing rigor cannot be assessed"

If very minimal project:
  "Small project scope - some metrics less applicable"
```

---

## Effect on Score Presentation

### High Confidence Example
```
Score: 78
Confidence: 0.89 (HIGH)

Display:
  76-80 (Very Good)
  
Message:
  "High confidence in capability assessment"
  
Caveats: []
```

### Medium Confidence Example
```
Score: 78  
Confidence: 0.76 (MEDIUM)

Display:
  72-84 (Good to Very Good)
  
Message:
  "Moderate confidence - some limitations in measurement"
  
Caveats:
  - "Test coverage estimated from static analysis"
  - "Limited project scope (small codebase)"
```

### Low Confidence Example
```
Score: 78
Confidence: 0.62 (LOW)

Display:
  67-89 (Good to Very Good)
  
Message:
  "Limited confidence - results should be supplemented with manual review"
  
Caveats:
  - "Forked repository with limited original contributions"
  - "Concentrated development timeline (3 days)"
  - "Very limited commit history"
  
Recommendation:
  "Manual code review recommended to verify capability"
```

---

## Metric-Specific Confidence

Each metric can have its own confidence score:
```json
{
  "metric_confidences": {
    "complexity": {
      "value": 5.2,
      "confidence": 0.95,
      "method": "AST analysis",
      "caveats": []
    },
    "test_coverage": {
      "value": 42,
      "confidence": 0.70,
      "method": "static_estimation",
      "caveats": ["Not measured - estimated from test file analysis"]
    },
    "commit_spread": {
      "value": 0.35,
      "confidence": 0.85,
      "method": "git_history",
      "caveats": []
    }
  }
}
```

---

## Output Format
```json
{
  "confidence": {
    "overall": 0.82,
    "level": "medium",
    "description": "Moderate confidence - some limitations in measurement",
    
    "factors": {
      "metric_quality": 0.88,
      "profile_fitness": 0.85,
      "reliability": 0.72,
      "data_completeness": 0.80
    },
    
    "score_range_width": 8,
    "score_range_reasoning": "Medium confidence → ±8 point range",
    
    "caveats": [
      "Test coverage estimated from static analysis",
      "Concentrated development timeline"
    ],
    
    "recommendation": "Results provide good indication but consider context"
  }
}
```

---

## Rules

- Confidence is calculated after scoring
- Confidence never modifies the score
- Confidence affects display range only
- Confidence is always shown to students
- Low confidence triggers review recommendation
- Confidence factors are weighted and documented