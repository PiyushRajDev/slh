# DSA Engine –  Scoring Model (MVP v1.0)

Component: SLH – DSA Module  
Feeds: 40% weight into JRI  
Goal: Reliable, anti-gaming, globally calibrated scoring (0–100)

---

# 1. Design Philosophy

The DSA score measures:

1. Technical problem-solving strength
2. Consistency & discipline
3. Competitive seriousness
4. Learning maturity

Volume alone does not influence scoring.

Score must:
- Be hard to inflate
- Reward difficulty dominance
- Reward structured growth
- Penalize suspicious patterns
- Remain explainable

---

# 2. Score Structure

RawDSA =
 0.30 × TechnicalStrength
+0.25 × Consistency
+0.20 × Competitive
+0.25 × LearningIntelligence

FinalDSA = RawDSA × FraudMultiplier

Score Range: 0–100

---

# 3. Technical Strength (30%)

## Inputs
- hard_count
- medium_count
- difficulty_distribution_ratio
- topic_coverage_map
- topic_depth_score

---

## 3.1 Hard Problem Score (Nonlinear)

hard_score = 100 × (1 - e^(-hard_count / 25))

Properties:
- Fast early growth
- Diminishing returns
- Caps near 100

---

## 3.2 Medium Problem Score

medium_score = 100 × (1 - e^(-medium_count / 60))

---

## 3.3 Topic Coverage Score

coverage_score =
(covered_core_topics / 7) × 100

Core topics:
arrays, hashing, sliding_window, trees, graphs, dp, greedy

If DP or Graph missing:
coverage_score capped at 75.

---

## 3.4 Difficulty Balance Adjustment

If easy_ratio > 60%:
TechnicalStrength ×= 0.90

If hard_ratio < 5%:
TechnicalStrength ×= 0.85

---

## 3.5 Final Technical Formula

TechnicalStrength =
 0.40 × hard_score
+0.25 × medium_score
+0.20 × topic_depth_score
+0.15 × coverage_score

---

# 4. Consistency & Discipline (25%)

## Inputs
- daily_activity_consistency (0–1)
- streak_stability_score (0–100)
- contest_gap_days
- inactive_gap_days

---

## 4.1 Base Scores

consistency_score = daily_activity_consistency × 100

contest_gap_penalty =
100 - min(contest_gap_days × 2, 40)

inactive_gap_penalty =
100 - min(inactive_gap_days × 2, 50)

---

## 4.2 Final Consistency Formula

Consistency =
 0.40 × consistency_score
+0.30 × streak_stability_score
+0.15 × contest_gap_penalty
+0.15 × inactive_gap_penalty

If burst_activity_flag = true:
Consistency ×= 0.85

---

# 5. Competitive Seriousness (20%)

## Inputs
- contest_participation_count
- current_rating
- max_rating
- rating_growth_slope
- ranking_trend

---

## 5.1 Rating Score

rating_score =
min((current_rating / 2400) × 100, 100)

2400 represents elite benchmark.

---

## 5.2 Contest Participation Score

contest_score =
min(contest_participation_count × 5, 100)

Full credit at 20 contests.

---

## 5.3 Growth Score

growth_score =
clamp(rating_growth_slope × 10, 0, 100)

---

## 5.4 Competitive Formula

If contest_participation_count = 0:
Competitive = 0

Else:

Competitive =
 0.40 × rating_score
+0.20 × contest_score
+0.20 × growth_score
+0.20 × ranking_trend_score

---

# 6. Learning Intelligence (25%)

## Inputs
- wrong_submission_ratio
- avg_attempts_per_problem
- question_revisit_score
- solve_velocity
- difficulty_velocity

---

## 6.1 Attempts Score

If 1.5 ≤ avg_attempts ≤ 4:
attempt_score = 100

If avg_attempts < 1.2:
attempt_score = 40

If avg_attempts > 10:
attempt_score = 60

Else:
attempt_score = 80

---

## 6.2 Error Health Score

error_score =
100 - abs(wrong_submission_ratio - 25) × 2

Clamp between 0–100.

Optimal zone ≈ 10–40%.

---

## 6.3 Velocity Scores

velocity_score =
min(solve_velocity × 10, 100)

difficulty_velocity_score =
min(difficulty_velocity × 15, 100)

---

## 6.4 Final Learning Formula

LearningIntelligence =
 0.30 × attempt_score
+0.25 × question_revisit_score
+0.20 × velocity_score
+0.15 × difficulty_velocity_score
+0.10 × error_score

---

# 7. Final Score

RawDSA =
 0.30 × TechnicalStrength
+0.25 × Consistency
+0.20 × Competitive
+0.25 × LearningIntelligence

FinalDSA =
clamp(RawDSA × FraudMultiplier, 0, 100)

---

# 8. Output Format

{
  total: number,
  technical: number,
  consistency: number,
  competitive: number,
  learning: number,
  fraudMultiplier: number,
  algorithmVersion: "1.0"
}

---

# 9. Version

MVP v1.0
Designed for stability, explainability, and anti-gaming.
