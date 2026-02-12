# SkillProof -- Scalable LeetCode Data Extraction & Unified Metrics Architecture

## 1. Overview

This document defines the scalable, production-ready architecture for
extracting, normalizing, storing, and scoring LeetCode data using
Puppeteer and BullMQ.

The system is designed for: - MVP scale (50 students) - Controlled
concurrency - Rate limit safety - Reusable browser pooling - Structured
normalization - Unified metric scoring engine

------------------------------------------------------------------------

# 2. High-Level Architecture

User → API Endpoint (/scrape)\
→ Add Job to BullMQ Queue\
→ Worker picks job\
→ Single Browser Instance (Reusable)\
→ Controlled Page Concurrency (Max 3 pages)\
→ Scrape Profile + Submissions + Contest\
→ Normalize Data\
→ Save to DB\
→ Generate Unified Metrics\
→ Scoring Engine

------------------------------------------------------------------------

# 3. Queue Layer (BullMQ)

## Purpose

-   Prevent rate limit issues
-   Handle concurrency safely
-   Process jobs sequentially or with controlled parallelism

## Configuration

-   Max Concurrency: 3
-   Rate Limit: Configurable per minute
-   Retry Logic: 2--3 retries with backoff
-   Failure Handling: Dead-letter queue for inspection

## Why Queue is Mandatory

Without queue: - Multiple users trigger scraping simultaneously -
LeetCode blocks IP - Browser crashes due to memory pressure

With queue: - Controlled processing - Predictable load - Stable
performance

------------------------------------------------------------------------

# 4. Puppeteer Layer

## Design Strategy

Single controlled browser instance\
Multiple reusable pages\
Sequential scraping inside a job\
Limited concurrency across jobs

### Browser Strategy

-   Launch 1 browser
-   Create max 3 pages
-   Reuse pages
-   Close pages after job
-   Do not relaunch browser for every job

## Scraping Flow Per User

1.  Open Profile Summary Page
2.  Extract:
    -   Easy solved
    -   Medium solved
    -   Hard solved
    -   Total solved
    -   Contest rating
    -   Global ranking
3.  Open Submission History Page Extract:
    -   Problem slug
    -   Timestamp
    -   Verdict (Accepted/Wrong/TLE)
    -   Language
    -   Submission time
4.  Open Contest History Page Extract:
    -   Participation count
    -   Rating history
5.  Extract Problem Metadata
    -   Difficulty
    -   Tags
    -   Cache tags locally

------------------------------------------------------------------------

# 5. Data Normalization Layer

## Raw Data → Structured Schema

### Example Normalized Object

{ easy_count, medium_count, hard_count, total_problems_solved,
total_submissions, submissions: \[ { problem_slug, timestamp, verdict,
difficulty, tags } \], contest_data: {...} }

## Why Normalization Matters

-   Raw scraped HTML is inconsistent
-   Future platform adapters (Codeforces) require unified schema
-   Scoring engine expects strict structure

------------------------------------------------------------------------

# 6. Database Schema

## LeetCode User Table

-   leetcode_raw_html
-   leetcode_raw_json
-   normalized_submissions
-   last_fetched_at
-   fetch_status

## Submissions Table (Optional)

-   user_id
-   problem_slug
-   difficulty
-   verdict
-   timestamp
-   tags

## Indexing Strategy

-   Index on problem_slug
-   Index on timestamp
-   Index on user_id

------------------------------------------------------------------------

# 7. Unified Metrics Layer

Purpose: Combine LeetCode + Codeforces into platform-independent metrics

## Unified Metrics Interface

easy_count: number\
medium_count: number\
hard_count: number\
total_problems_solved: number\
total_submissions: number

contest_participation_count: number\
current_rating: number \| null\
max_rating: number \| null\
rating_growth_slope: number\
ranking_trend: number

topic_coverage_map:\
arrays\
hashing\
sliding_window\
trees\
graphs\
dp\
greedy

topic_depth_score: number\
wrong_submission_ratio: number\
avg_attempts_per_problem: number\
solve_velocity: number\
difficulty_velocity: number\
question_revisit_score: number\
burst_activity_flag: boolean\
random_topic_submission_flag: boolean\
improbable_growth_flag: boolean

------------------------------------------------------------------------

# 8. Platform Adapter Design

## Why Adapter Pattern?

LeetCode and Codeforces have different: - Difficulty scales - Rating
systems - Contest structures

Adapters convert platform-specific metrics → unified format

Example:

Codeforces Rating Bucket: \<1200 → Easy\
1200--1600 → Medium\
1600+ → Hard

Mapped to unified difficulty system

------------------------------------------------------------------------

# 9. Scoring Engine

## Inputs

Unified Metrics Object

## Outputs

-   Skill Score
-   Consistency Score
-   Depth Score
-   Growth Score
-   Final Composite Score

## Anti-Gaming Signals

-   Burst activity detection
-   Random topic jumping
-   Improbable rating growth

------------------------------------------------------------------------

# 10. Scalability Strategy

## Phase 1 (MVP -- 50 users)

-   Single server
-   Single browser instance
-   BullMQ queue
-   Manual monitoring

## Phase 2 (500 users)

-   Multiple workers
-   Redis-backed distributed queue
-   Horizontal scaling
-   Auto-restart browser pool

## Phase 3 (5000+ users)

-   Distributed scraping nodes
-   Proxy rotation
-   Browser cluster pool
-   Monitoring dashboards
-   Alerting system

------------------------------------------------------------------------

# 11. Failure Handling

## Possible Failures

-   DOM structure change
-   Rate limit block
-   Browser crash
-   Partial scrape

## Recovery Strategy

-   Retry with exponential backoff
-   HTML snapshot logging
-   Validation layer before DB write
-   Health check monitoring

------------------------------------------------------------------------

# 12. Security Considerations

-   Never store user passwords
-   Use read-only scraping
-   Sanitize stored HTML
-   Rate-limit API endpoint

------------------------------------------------------------------------

# 13. Performance Optimization

-   Cache problem tags
-   Avoid re-fetching solved problems
-   Store incremental submissions
-   Batch DB writes
-   Reuse browser pages

------------------------------------------------------------------------

# 14. Monitoring & Observability

Track:

-   Queue wait time
-   Job processing time
-   Browser memory usage
-   Scrape failure rate
-   Average scrape duration

------------------------------------------------------------------------

# 15. Final Architecture Principles

1.  Controlled concurrency over raw speed\
2.  Normalize early\
3.  Score only structured data\
4.  Separate scraping from scoring\
5.  Make platform adapters pluggable\
6.  Detect gaming behavior early

------------------------------------------------------------------------

# Conclusion

This architecture is:

-   Scalable
-   Modular
-   Rate-limit safe
-   Platform extensible
-   Production-ready
-   Designed for accurate skill scoring

It supports structured growth from MVP to large-scale distributed
system.
