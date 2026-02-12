# DSA Engine – Anti-Gaming Architecture (MVP v1.0)

Purpose:
Prevent manipulation, copy-paste inflation, and artificial score boosting.

The system uses layered behavioral detection.

---

# 1. Defense Model Overview

Anti-gaming operates across five independent layers:

1. Activity Pattern Control
2. Submission Behavior Control
3. Growth Pattern Control
4. Structural Consistency Control
5. Cross-Signal Validation

Fraud signals reduce score via multiplier.

---

# 2. Activity Pattern Control

## 2.1 Daily Contribution Cap

Maximum counted solved per day = 10.

Any additional solves beyond 10:
Do not contribute to scoring.

Prevents binge inflation.

---

## 2.2 Burst Activity Detection

If:

solves_today > (mean_daily_solves + 3 × std_dev)

Set:
burst_activity_flag = true

Impact:
Consistency × 0.85
Fraud score incremented.

---

## 2.3 Rapid Submission Detection

If multiple hard problems solved with <30 seconds gap repeatedly:
Flag suspicious.

---

# 3. Submission Behavior Control

## 3.1 Suspicious Perfection Detection

If:

wrong_submission_ratio < 3%
AND avg_attempts_per_problem < 1.2
AND hard_count > threshold

Flag suspicious_perfection.

Reason:
Real learners make mistakes.

---

## 3.2 No Revision Pattern

If:

question_revisit_score = 0
AND total_solved > 100

Flag.

Serious learners revisit problems.

---

# 4. Growth Pattern Control

## 4.1 Improbable Growth Detection

If:

difficulty_velocity >
(mean_velocity + 3 × std_velocity)

Set:
improbable_growth_flag = true

Prevents sudden artificial spikes.

---

# 5. Structural Topic Validation

## 5.1 Random Topic Submission Flag

If high entropy topic switching within short time window:
random_topic_submission_flag = true

Natural learning follows structured progression.

---

# 6. Cross-Signal Validation

If:

hard_count high
AND contest_participation_count low
AND rating low

Flag competitive_inconsistency.

Real strong solvers compete.

---

# 7. Fraud Severity Model

fraud_score =
burst_flag
+ random_topic_flag
+ improbable_growth_flag
+ suspicious_perfection_flag
+ competitive_inconsistency_flag

---

# 8. Fraud Multiplier

| Fraud Score | Multiplier |
|------------|------------|
| 0 | 1.0 |
| 1 | 0.9 |
| 2 | 0.75 |
| 3 | 0.6 |
| 4+ | 0.4 |

FinalDSA = RawDSA × FraudMultiplier

---

# 9. Stability Mechanism

Use rolling smoothing:

FinalScore =
0.7 × current_score
+0.3 × previous_score

Prevents short-term manipulation.

---

# 10. Design Philosophy

- No single metric determines score.
- Multi-dimensional signals required.
- Cheating must require bypassing all layers.
- Cheating cost > benefit.

---

# 11. Known Limitations

- Platform API reliability
- False positives possible in rare edge cases

Mitigation:
Manual review for extreme fraud cases.

---

# 12. Version

Anti-Gaming Model v1.0
Built for MVP reliability.
Upgradeable to anomaly-detection ML in future.
