# metrics.md
SkillProof – Coding Profile Assessment Metrics (Final v1)



1. volume metrics (context only)
- **total_problems_solved**  
- **total_submissions**

used only as baseline context, never as primary scoring signals


2. difficulty quality metrics (high weight)
- **easy_count**  
- **medium_count**  
- **hard_count**  
- **difficulty_distribution_ratio**

focus is on medium + hard dominance, not raw totals


3. consistency & discipline metrics (very high weight)
- **daily_activity_consistency**  
- **streak_stability_score** (stable streaks, not max streak)  
- **contest_gap_days** (days between contests)  
- **inactive_gap_days**

filters binge-solving and last-minute preparation patterns

4. contest seriousness metrics
- **contest_participation_count**  
- **current_rating**  
- **max_rating**  
- **rating_growth_slope**  
- **ranking_trend**

measures seriousness under time pressure and competitive growth


5. topic coverage & dsa depth metrics
- **topic_coverage_map**  
  (arrays, hashing, sliding window, trees, graphs, dp, greedy)
- **topic_depth_score**

ensures interview-relevant breadth and depth, not random solving

6. fraud & dummy account detection metrics
- **burst_activity_flag**  
- **random_topic_submission_flag**  
- **improbable_growth_flag**

detects fake, borrowed, or copy-paste driven profiles


7. submission quality metrics
- **wrong_submission_ratio**  
- **healthy_error_range_flag**

zero or near-zero wrong submissions is treated as suspicious



8. learning velocity metrics
- **solve_velocity**  
  (change in total solved / days between fetches)
- **difficulty_velocity**  
  (change in medium + hard over time)

captures learning speed instead of raw activity


9. average attempts per problem (added)
*avg_attempts_per_problem**

interprets problem-solving behavior:
- very low attempts → suspicious
- moderate attempts → healthy learning
- extremely high attempts → struggling but genuine


10. question revisit & revision depth metric (added)
- **question_revisit_score**

computed when:
- same problem has multiple submissions
- submissions span multiple dates
- improvement from wrong → accepted

indicates revision, concept reinforcement, and serious learning

---



