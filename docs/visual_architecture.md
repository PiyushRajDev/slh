# SLH SYSTEM ARCHITECTURE - SIMPLIFIED OVERVIEW

## HIGH-LEVEL SYSTEM DESIGN

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│   │    STUDENTS     │  │     ADMINS      │  │   RECRUITERS    │   │
│   │                 │  │                 │  │   (Future)      │   │
│   │  • View JRI     │  │  • Analytics    │  │  • Search       │   │
│   │  • Track        │  │  • Student List │  │  • Filter       │   │
│   │    Progress     │  │  • Reports      │  │  • Message      │   │
│   │  • Recommendations│ │  • Settings    │  │                 │   │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                      │
│              React Web App + Mobile Responsive                       │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ HTTPS/REST API
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                         BACKEND SERVICES                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌───────────────────────────────────────────────────────┐          │
│   │              API GATEWAY (Node.js/Express)            │          │
│   │  • Authentication (JWT)                               │          │
│   │  • Rate Limiting                                      │          │
│   │  • Request Routing                                    │          │
│   └───────────────────────┬───────────────────────────────┘          │
│                           │                                           │
│         ┌─────────────────┼─────────────────┐                        │
│         │                 │                 │                        │
│   ┌─────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐                 │
│   │   Data      │  │     JRI      │  │   Admin     │                │
│   │  Fetchers   │  │  Calculator  │  │  Services   │                │
│   └─────┬──────┘  └──────┬──────┘  └─────────────┘                 │
│         │                 │                                           │
│         └────────┬────────┘                                          │
│                  │                                                    │
│         ┌────────▼────────┐                                          │
│         │   Job Queue     │                                          │
│         │   (BullMQ)      │                                          │
│         │  Background     │                                          │
│         │   Workers       │                                          │
│         └────────┬────────┘                                          │
│                  │                                                    │
└──────────────────┼───────────────────────────────────────────────────┘
                   │
                   │
┌──────────────────▼───────────────────────────────────────────────────┐
│                      EXTERNAL DATA SOURCES                            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌──────────────┐   │
│   │  GitHub  │  │ LeetCode  │  │ CodeForces │  │  College     │   │
│   │   API    │  │  Scraper  │  │    API     │  │  Academic    │   │
│   │          │  │           │  │            │  │   Data       │   │
│   └────┬─────┘  └─────┬─────┘  └─────┬──────┘  └──────┬───────┘   │
│        │              │              │                │             │
│        └──────────────┴──────────────┴────────────────┘             │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                          DATA LAYER                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌──────────────────┐                  ┌──────────────────┐        │
│   │   PostgreSQL     │                  │      Redis       │        │
│   │                  │                  │                  │        │
│   │  • Students      │                  │  • Cache         │        │
│   │  • JRI Scores    │                  │  • Job Queue     │        │
│   │  • GitHub Data   │                  │  • Sessions      │        │
│   │  • DSA Profiles  │                  │  • Rate Limits   │        │
│   │  • Academic      │                  │                  │        │
│   │  • Placements    │                  │                  │        │
│   │                  │                  │                  │        │
│   └──────────────────┘                  └──────────────────┘        │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## DATA FLOW: Student JRI Calculation

```
1. STUDENT CONNECTS GITHUB ACCOUNT
   │
   ├─> Student enters GitHub username in dashboard
   │
   ├─> API validates username
   │
   └─> Creates "Fetch GitHub" job in queue
       │
       ▼

2. BACKGROUND WORKER PROCESSES JOB
   │
   ├─> Worker picks up job from queue
   │
   ├─> Calls GitHub API
   │   ├─> Fetches repositories
   │   ├─> Analyzes languages
   │   ├─> Counts commits
   │   └─> Detects frameworks
   │
   ├─> Stores data in PostgreSQL
   │
   ├─> Caches data in Redis (7 days)
   │
   └─> Triggers "Calculate JRI" job
       │
       ▼

3. JRI CALCULATION
   │
   ├─> Fetches all student data:
   │   ├─> GitHub profile
   │   ├─> DSA profiles (LeetCode, CodeForces)
   │   ├─> Academic records
   │   └─> Hackathon participation
   │
   ├─> Calculates component scores:
   │   ├─> GitHub Score (0-100)
   │   ├─> DSA Score (0-100)
   │   ├─> Academic Score (0-100)
   │   └─> Hackathon Score (0-100)
   │
   ├─> Applies weights (configurable per college):
   │   ├─> GitHub: 30%
   │   ├─> DSA: 40%
   │   ├─> Academic: 20%
   │   └─> Hackathon: 10%
   │
   ├─> Final JRI = Weighted Average
   │
   ├─> Saves to database with version tracking
   │
   └─> Updates student dashboard
       │
       ▼

4. STUDENT SEES UPDATED JRI
   │
   ├─> Dashboard shows new JRI score
   │
   ├─> Breakdown by component
   │
   ├─> Historical trend
   │
   └─> Recommendations for improvement
```

## TECHNOLOGY STACK OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript                                      │
│  Tailwind CSS for styling                                   │
│  Recharts for visualizations                                │
│  React Query for data fetching                              │
│  Vite for build tooling                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                            │
├─────────────────────────────────────────────────────────────┤
│  Node.js 20 + Express.js                                    │
│  TypeScript for type safety                                 │
│  Prisma ORM for database                                    │
│  BullMQ for job queue                                       │
│  JWT for authentication                                     │
│  Winston for logging                                        │
│  Joi/Zod for validation                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        DATA STORES                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 15 - Primary database                           │
│  Redis 7 - Caching + Job queue                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                       │
├─────────────────────────────────────────────────────────────┤
│  GitHub API - Repository data                               │
│  Puppeteer - LeetCode scraping                              │
│  CodeForces API - Problem-solving data                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                         │
├─────────────────────────────────────────────────────────────┤
│  DigitalOcean - Cloud hosting                               │
│  CloudFlare - CDN + DDoS protection                         │
│  Docker - Containerization                                  │
│  GitHub Actions - CI/CD                                     │
│  Let's Encrypt - SSL certificates                           │
│  Sentry - Error tracking                                    │
└─────────────────────────────────────────────────────────────┘
```

## DEPLOYMENT ARCHITECTURE (PRODUCTION)

```
                      ┌─────────────┐
                      │ CloudFlare  │
                      │  CDN + SSL  │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │Load Balancer│
                      └──────┬──────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐          ┌────▼────┐         ┌────▼────┐
   │ API     │          │ API     │         │ API     │
   │ Server  │          │ Server  │         │ Server  │
   │ (Node)  │          │ (Node)  │         │ (Node)  │
   └─────────┘          └─────────┘         └─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐          ┌────▼────┐              │
   │ Worker  │          │ Worker  │              │
   │ (Node)  │          │ (Node)  │              │
   └─────────┘          └─────────┘              │
                             │                    │
        ┌────────────────────┴────────────────────┘
        │                                    │
   ┌────▼──────┐                      ┌─────▼─────┐
   │PostgreSQL │                      │   Redis   │
   │ Managed   │                      │  Managed  │
   │    DB     │                      │   Cache   │
   └───────────┘                      └───────────┘
```

## SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AUTHENTICATION                                          │
│     • JWT tokens (15 min access, 7 day refresh)            │
│     • Bcrypt password hashing                               │
│     • Role-based access control (RBAC)                      │
│                                                             │
│  2. NETWORK SECURITY                                        │
│     • HTTPS only (Let's Encrypt SSL)                        │
│     • CloudFlare DDoS protection                            │
│     • Rate limiting (100 req/15min per IP)                  │
│     • CORS whitelisting                                     │
│                                                             │
│  3. DATA SECURITY                                           │
│     • Encrypted database connections                        │
│     • Input validation (Joi/Zod)                            │
│     • SQL injection prevention (Prisma ORM)                 │
│     • XSS protection (React auto-escaping)                  │
│                                                             │
│  4. PRIVACY                                                 │
│     • Only PUBLIC data from GitHub/LeetCode                 │
│     • Student consent required                              │
│     • Academic data encrypted                               │
│     • GDPR compliant                                        │
│                                                             │
│  5. MONITORING                                              │
│     • Sentry for error tracking                             │
│     • Winston for logging                                   │
│     • Audit logs for admin actions                          │
│     • Real-time security alerts                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## SCALING ROADMAP

```
PHASE 1: PILOT (500 STUDENTS)
├─ Infrastructure: ₹20K/month
├─ 1 API server
├─ 1 Worker
├─ Managed DB + Redis
└─ Response time: <200ms

PHASE 2: EARLY GROWTH (5,000 STUDENTS)
├─ Infrastructure: ₹50K/month
├─ 3 API servers
├─ 2 Workers
├─ Scaled DB + Redis
└─ Response time: <300ms

PHASE 3: EXPANSION (50,000 STUDENTS)
├─ Infrastructure: ₹3.5L/month
├─ 5 API servers
├─ 3 Workers
├─ Master-Replica DB setup
├─ Advanced caching
└─ Response time: <500ms

PHASE 4: SCALE (500,000 STUDENTS)
├─ Infrastructure: ₹20L/month
├─ 10+ API servers
├─ 5+ Workers
├─ Sharded database
├─ CDN for static assets
├─ Multi-region deployment
└─ Response time: <500ms
```

## KEY ARCHITECTURAL DECISIONS

```
┌─────────────────────────────────────────────────────────────┐
│                   DESIGN PRINCIPLES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ API-FIRST                                                │
│    → All functionality exposed via REST APIs                │
│    → Frontend is just a client                              │
│    → Easy to add mobile app later                           │
│                                                             │
│  ✓ STATELESS SERVICES                                       │
│    → No session state in API servers                        │
│    → Easy horizontal scaling                                │
│    → Load balancer can route anywhere                       │
│                                                             │
│  ✓ QUEUE-BASED PROCESSING                                   │
│    → All external API calls are async                       │
│    → Prevents blocking user requests                        │
│    → Automatic retries on failure                           │
│                                                             │
│  ✓ AGGRESSIVE CACHING                                       │
│    → Redis cache for API responses                          │
│    → GitHub data cached 7 days                              │
│    → Reduces API costs significantly                        │
│                                                             │
│  ✓ MODULAR ARCHITECTURE                                     │
│    → Can split into microservices later                     │
│    → Each service has clear responsibility                  │
│    → Easy to maintain and test                              │
│                                                             │
│  ✓ OBSERVABILITY                                            │
│    → Comprehensive logging                                  │
│    → Error tracking from day 1                              │
│    → Performance monitoring                                 │
│    → Can't fix what you can't see                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## DEVELOPMENT TIMELINE

```
WEEK 1-2: FOUNDATION
├─ Set up project structure
├─ Database schema (Prisma)
├─ Authentication system
├─ Basic API endpoints
└─ Development environment (Docker)

WEEK 3: DATA COLLECTION
├─ GitHub data collector
├─ LeetCode scraper
├─ CodeForces client
└─ Job queue system (BullMQ)

WEEK 4: JRI ENGINE
├─ Component scorers
├─ JRI calculation algorithm
├─ Academic data import
└─ Testing with sample data

WEEK 5: FRONTEND
├─ Student dashboard
├─ Admin dashboard
├─ Authentication UI
└─ Data visualization

WEEK 6: DEPLOYMENT
├─ Production setup (DigitalOcean)
├─ SSL certificates
├─ CI/CD pipeline
├─ Monitoring setup
└─ Load testing

WEEK 7-8: POLISH & PILOT
├─ Bug fixes
├─ Performance optimization
├─ Documentation
└─ Student onboarding ready
```

---

**READY FOR PILOT LAUNCH AFTER 8 WEEKS**

Infrastructure Cost: ₹20K/month for 500 students
Development Time: 6-8 weeks
Team Required: 2 developers (you + co-founder)
Success Metrics: 99% uptime, <500ms response time, successful JRI for 500 students