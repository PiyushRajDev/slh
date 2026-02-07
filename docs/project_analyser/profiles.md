# PROFILES.md

## Purpose
Profiles are **evaluation lenses** that define expectations for different types of work.

Profiles answer:
> "If this were a [X], what would be expected, optional, and irrelevant?"

Profiles are NOT:
- Categories (students don't choose them)
- Fixed classifications
- Mutually exclusive
- The final answer

---

## Core Philosophy

### Profiles are Hypotheses
Each profile represents a **way to interpret** the project.
Multiple profiles can be active simultaneously.
The best-fitting profile wins.

### Profiles Enable Fairness
By defining different expectations for different work types:
- CLI tools aren't penalized for no frontend
- Academic projects aren't penalized for short timelines
- ML projects aren't penalized for high complexity

### Profiles Mirror Professor Thinking
Professors subconsciously ask:
> "What's the most charitable valid way to evaluate this?"

Profiles formalize that process.

---

## Profile Structure

Each profile defines:
```yaml
Profile Name:
  display_name: "Human-readable name"
  description: "What this represents"
  
  expected_signals:
    - signal_name: weight
    # Must have these
    
  valued_signals:
    - signal_name: weight
    # Nice to have
    
  irrelevant_signals:
    - signal_name
    # Doesn't matter for this type
    
  scoring_weights:
    code_quality: X%
    architecture: Y%
    testing: Z%
    # How to weight dimensions
    
  anti_gaming_rules:
    - rule_name: severity
    # Context-specific gaming detection
    
  typical_ranges:
    file_count: [min, max]
    total_loc: [min, max]
    commit_span_days: [min, max]
```

---

## V1 Profiles (6 Core)

### Profile 1: Production Web Application

**Display:** "Full-Stack Web Application"

**Description:** CRUD application with frontend, backend, database, and deployment

**Expected Signals:**
- has_frontend (weight: 25)
- has_backend (weight: 25)
- has_database (weight: 20)
- has_tests (weight: 15)
- has_ci (weight: 10)
- has_deployment_config (weight: 5)

**Valued Signals:**
- has_linting (weight: 5)
- has_branch_workflow (weight: 5)
- has_documentation (weight: 5)

**Irrelevant Signals:**
- has_notebooks
- is_short_timeline (can be rapid prototypes)

**Scoring Weights:**
- Code Quality: 25%
- Architecture: 20%
- Testing: 25%
- Git Discipline: 20%
- DevOps: 10%

**Anti-Gaming Rules:**
- commit_burst: high severity
- fork_minimal_divergence: high severity
- dependency_inflation: medium severity

**Typical Ranges:**
- file_count: [50, 500]
- total_loc: [2000, 50000]
- commit_span_days: [14, 180]

**Fitness Threshold:** 0.60

---

### Profile 2: Backend API Service

**Display:** "Backend API Service"

**Description:** REST/GraphQL API without frontend

**Expected Signals:**
- has_backend (weight: 40)
- has_database (weight: 25)
- has_tests (weight: 20)
- has_deployment_config (weight: 15)

**Valued Signals:**
- has_ci (weight: 10)
- has_documentation (weight: 5)

**Irrelevant Signals:**
- has_frontend (expected to be false)
- has_assets

**Scoring Weights:**
- Code Quality: 30%
- Architecture: 25%
- Testing: 25%
- Git Discipline: 15%
- DevOps: 5%

**Anti-Gaming Rules:**
- commit_burst: medium severity
- single_commit: high severity

**Typical Ranges:**
- file_count: [20, 200]
- total_loc: [1000, 20000]
- commit_span_days: [7, 90]

**Fitness Threshold:** 0.65

---

### Profile 3: ML Pipeline / Research Project

**Display:** "Machine Learning Pipeline"

**Description:** Model training, evaluation, or data processing

**Expected Signals:**
- has_ml_components (weight: 50)
- has_tests (weight: 15)
- has_documentation (weight: 15)

**Valued Signals:**
- has_notebooks (weight: 20)
- has_backend (weight: 10) # for serving
- has_deployment_config (weight: 10)

**Irrelevant Signals:**
- has_frontend
- has_branch_workflow (research is often solo)
- is_short_timeline (experiments can be quick)

**Scoring Weights:**
- Code Quality: 20% # Lower - complex is normal
- Architecture: 20%
- Testing: 20% # Data validation counts
- Git Discipline: 25%
- DevOps: 15%

**Anti-Gaming Rules:**
- commit_burst: low severity (experiments are bursty)
- high_complexity: ignored (ML code is complex)

**Typical Ranges:**
- file_count: [10, 100]
- total_loc: [500, 15000]
- commit_span_days: [3, 60]

**Fitness Threshold:** 0.55

---

### Profile 4: CLI Tool / Utility

**Display:** "Command-Line Tool"

**Description:** Terminal utility or automation script

**Expected Signals:**
- is_minimal (weight: 20)
- has_tests (weight: 30)
- has_documentation (weight: 25)

**Valued Signals:**
- has_ci (weight: 15)
- has_linting (weight: 10)

**Irrelevant Signals:**
- has_frontend
- has_backend
- has_database
- has_deployment_config (different deploy model)

**Scoring Weights:**
- Code Quality: 35%
- Architecture: 15% # Can be simple
- Testing: 30%
- Git Discipline: 20%
- DevOps: 0% # N/A for CLIs

**Anti-Gaming Rules:**
- commit_burst: medium severity
- minimal_project: low severity (CLIs are small)

**Typical Ranges:**
- file_count: [5, 50]
- total_loc: [200, 5000]
- commit_span_days: [3, 60]

**Fitness Threshold:** 0.60

---

### Profile 5: Library / Package

**Display:** "Reusable Library/Package"

**Description:** Library for use by other projects

**Expected Signals:**
- has_tests (weight: 40)
- has_documentation (weight: 30)
- is_minimal (weight: 10)

**Valued Signals:**
- has_ci (weight: 15)
- has_linting (weight: 10)

**Irrelevant Signals:**
- has_frontend
- has_backend (apps)
- has_deployment_config (libraries don't deploy)

**Scoring Weights:**
- Code Quality: 35%
- Architecture: 20%
- Testing: 35% # Critical for libraries
- Git Discipline: 10%
- DevOps: 0%

**Anti-Gaming Rules:**
- low_test_coverage: high severity (libraries need tests)
- poor_documentation: high severity

**Typical Ranges:**
- file_count: [5, 100]
- total_loc: [300, 10000]
- commit_span_days: [7, 120]

**Fitness Threshold:** 0.65

---

### Profile 6: Academic Assignment

**Display:** "Academic Project"

**Description:** Course assignment or educational exercise

**Expected Signals:**
- is_short_timeline (weight: 25)
- has_documentation (weight: 25)

**Valued Signals:**
- has_tests (weight: 20)
- is_minimal (weight: 15)

**Irrelevant Signals:**
- has_ci (not expected for assignments)
- has_deployment_config
- has_branch_workflow (solo work)
- is_sustained (assignments are short)

**Scoring Weights:**
- Code Quality: 30%
- Architecture: 20%
- Testing: 15% # Lower expectations
- Git Discipline: 15% # Lower weight
- DevOps: 0%

**Anti-Gaming Rules:**
- commit_burst: low severity (normal for assignments)
- single_commit: medium severity
- fork_minimal_divergence: high severity

**Typical Ranges:**
- file_count: [5, 50]
- total_loc: [200, 5000]
- commit_span_days: [1, 30]

**Fitness Threshold:** 0.50 # Easier to match

---

## Fitness Calculation

For each profile:
```
fitness = Σ(signal_present × signal_weight) / Σ(all_expected_weights)

If fitness >= threshold:
  profile is "active" (candidate for scoring)
Else:
  profile is "rejected"
```

**Example:**
```
Profile: Production Web App
Expected:
  has_frontend (25) ✓
  has_backend (25) ✓
  has_database (20) ✗
  has_tests (15) ✓
  has_ci (10) ✓
  has_deployment (5) ✓

Score: 25+25+15+10+5 = 80
Total: 100
Fitness: 0.80 → ACTIVE
```

---

## Profile Selection Rules

1. **Calculate fitness for all profiles**
2. **Keep profiles with fitness >= threshold**
3. **If multiple profiles active:**
   - Score project under each
   - Apply profile-specific anti-gaming
   - Select highest defensible score
4. **If no profiles active:**
   - Flag for manual review
   - Use generic fallback profile

---

## Extension Strategy

New profiles can be added without changing existing ones:
- Mobile Application
- Web3 DApp
- Game Project
- Infrastructure Tool
- Data Pipeline

Each follows same structure.

---

## Output Format
```json
{
  "profile_fitness": {
    "production_web_app": {
      "fitness": 0.80,
      "status": "active",
      "matched_signals": ["has_frontend", "has_backend", ...],
      "missing_signals": ["has_database"]
    },
    "backend_api": {
      "fitness": 0.70,
      "status": "active",
      "matched_signals": [...]
    },
    "ml_pipeline": {
      "fitness": 0.25,
      "status": "rejected",
      "reason": "No ML components detected"
    }
  },
  "active_profiles": ["production_web_app", "backend_api"],
  "recommended_primary": "production_web_app"
}
```