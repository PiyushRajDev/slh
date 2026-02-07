# METRICS.md

## Purpose
Metrics are **pure facts** extracted from repository analysis.

Metrics answer:
> "What objectively exists in this codebase?"

Metrics do NOT:
- Interpret quality
- Infer intent
- Apply thresholds
- Make judgments
- Assume context

---

## Extraction Philosophy

### Input Sources (Ordered by Trust)
1. Git history (commits, branches, timeline)
2. File tree structure (directories, file count, depth)
3. Static code analysis (AST parsing, complexity)
4. Dependency manifests (package.json, requirements.txt)
5. Configuration files (CI, linting, build)

### Never Used as Metrics
- Student claims or descriptions
- README marketing language
- Deployment URLs (checked for existence only)
- Star/fork counts (capped, low weight)

---

## Metric Categories

### Group A: Code Quality (Static Analysis)
**Purpose:** Measure code maintainability

1. **complexity_avg** (float)
   - Cyclomatic complexity average across functions
   - Tool: radon (Python), escomplex (JS), lizard (multi-lang)
   
2. **complexity_max** (int)
   - Highest complexity in any single function
   
3. **long_functions_count** (int)
   - Functions exceeding 50 lines
   
4. **long_files_count** (int)
   - Files exceeding 500 lines
   
5. **duplication_percent** (float)
   - Code duplication percentage
   - Tool: jscpd
   
6. **lint_violations_count** (int)
   - Critical lint errors only
   - Tool: pylint, eslint (defensive execution)

---

### Group B: Architecture (Structure Analysis)

7. **folder_structure** (dict)
   - Directories present: src/, tests/, docs/, etc.
   - Depth: maximum nesting level
   
8. **circular_dependencies_count** (int)
   - Import cycles detected
   - Tool: madge (JS), pydeps (Python)
   
9. **coupling_score** (float)
   - Average fan-out (imports per module)
   - Calculated from import graph

---

### Group C: Testing (Static + Optional Execution)

10. **test_file_count** (int)
    - Files matching test patterns
    
11. **test_loc** (int)
    - Lines of code in test files
    
12. **assertion_count** (int)
    - Assert/expect/should statements (static count)
    
13. **test_to_code_ratio** (float)
    - test_loc / source_loc
    
14. **coverage_config_present** (bool)
    - .coveragerc, jest.config.js, etc.
    
15. **ci_runs_tests** (bool)
    - CI config contains test execution

---

### Group D: Git Discipline (History Analysis)

16. **commit_count** (int)
    - Total commits
    
17. **commit_span_days** (int)
    - Days between first and last commit
    
18. **active_days_count** (int)
    - Unique days with commits
    
19. **commit_spread_ratio** (float)
    - active_days / total_span_days
    
20. **avg_commit_size** (int)
    - Average lines changed per commit
    
21. **commit_message_avg_length** (int)
    - Average characters in commit messages
    
22. **conventional_commit_ratio** (float)
    - Ratio following conventional format
    
23. **branch_count** (int)
    - Total branches
    
24. **feature_branch_count** (int)
    - Non-main branches

---

### Group E: DevOps (Configuration Detection)

25. **ci_config_present** (bool)
    - .github/workflows/, .gitlab-ci.yml, etc.
    
26. **ci_config_quality** (int)
    - 0-5 score based on stages (build, test, deploy)
    
27. **deploy_config_present** (bool)
    - Dockerfile, docker-compose, etc.
    
28. **deploy_config_types** (list)
    - Which deploy configs exist

---

### Group F: Project Metadata

29. **file_count** (int)
30. **folder_count** (int)
31. **total_loc** (int)
32. **source_loc** (int) - excluding tests, configs
33. **languages** (dict) - {language: loc}
34. **primary_language** (str)
35. **dependency_count** (int)
36. **dependencies** (list) - names only
37. **is_fork** (bool)
38. **contributor_count** (int)
39. **top_contributor_percent** (float)

---

## Extraction Rules

### Immutability
- Metrics are extracted once per commit SHA
- Cached indefinitely
- Never recomputed for same SHA

### Error Handling
- If metric extraction fails → null value
- Never estimate or approximate
- Log failure reason

### Language Support
- Primary: Python, JavaScript, TypeScript
- Secondary: Java, Go, Rust
- Fallback: lizard for basic complexity

### Safety Constraints
- No code execution (except defensive linting)
- Timeout all operations (10s max per metric)
- Sandbox all external tools

---

## Output Format
```json
{
  "metrics": {
    "code_quality": {
      "complexity_avg": 5.2,
      "complexity_max": 12,
      "long_functions_count": 3,
      "duplication_percent": 8.5,
      "lint_violations_count": 7
    },
    "architecture": {
      "folder_structure": ["src", "tests", "docs"],
      "circular_dependencies_count": 0,
      "coupling_score": 4.3
    },
    "testing": {
      "test_file_count": 12,
      "test_to_code_ratio": 0.42,
      "ci_runs_tests": true
    },
    "git": {
      "commit_count": 47,
      "commit_span_days": 38,
      "commit_spread_ratio": 0.61
    },
    "devops": {
      "ci_config_present": true,
      "deploy_config_present": true
    },
    "metadata": {
      "file_count": 89,
      "total_loc": 4521,
      "primary_language": "Python"
    }
  },
  "extraction_timestamp": "2025-02-08T10:30:00Z",
  "extraction_version": "1.0.0",
  "commit_sha": "abc123..."
}
```

---

## Versioning

Metric definitions may evolve. Each extraction records version.

Changes require:
- New version number
- Migration path for cached data
- Validation against test set