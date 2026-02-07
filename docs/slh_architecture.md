# STUDENT LEARNING HUB (SLH) - TECHNICAL ARCHITECTURE
## Comprehensive System Design for Scalable Student Skill Assessment Platform

---

## TABLE OF CONTENTS

1. [High-Level Architecture Overview](#high-level-architecture-overview)
2. [System Components](#system-components)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Data Collection Pipeline](#data-collection-pipeline)
7. [JRI Calculation Engine](#jri-calculation-engine)
8. [Security & Authentication](#security--authentication)
9. [Deployment Architecture](#deployment-architecture)
10. [Scaling Strategy](#scaling-strategy)
11. [Development Phases](#development-phases)

---

## 1. HIGH-LEVEL ARCHITECTURE OVERVIEW

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Student    │  │    Admin     │  │  Recruiter   │         │
│  │  Dashboard   │  │  Dashboard   │  │   Portal     │         │
│  │  (React)     │  │  (React)     │  │  (React)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API GATEWAY   │
                    │  (Express.js)   │
                    │  Rate Limiting  │
                    │  Authentication │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼─────────┐ ┌─────▼──────┐ ┌────────▼────────┐
│  Auth Service     │ │ Data Fetch │ │  JRI Calculator │
│  (JWT/OAuth)      │ │  Services  │ │    Service      │
└───────────────────┘ └─────┬──────┘ └────────┬────────┘
                            │                  │
                ┌───────────┼──────────────────┘
                │           │
        ┌───────▼───────┐   │
        │  Job Queue    │   │
        │  (BullMQ)     │   │
        │  Background   │   │
        │  Workers      │   │
        └───────┬───────┘   │
                │           │
    ┌───────────┼───────────┼──────────────┐
    │           │           │              │
┌───▼────┐ ┌───▼────┐ ┌────▼─────┐ ┌─────▼──────┐
│ GitHub │ │LeetCode│ │CodeForces│ │  College   │
│  API   │ │Scraper │ │  Scraper │ │  Academic  │
└───┬────┘ └───┬────┘ └────┬─────┘ └─────┬──────┘
    │          │            │             │
    └──────────┴────────────┴─────────────┘
                     │
              ┌──────▼──────┐
              │   Cache     │
              │   (Redis)   │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  Database   │
              │ (PostgreSQL)│
              └─────────────┘
```

### Architecture Principles

1. **Microservices-Ready**: Modular design that can split into microservices as scale increases
2. **API-First**: All functionality exposed via REST APIs
3. **Queue-Based Processing**: Background jobs for all external API calls
4. **Cache-Heavy**: Aggressive caching to reduce API costs and latency
5. **Stateless Services**: All application state in DB/Redis for horizontal scaling
6. **Security-First**: Authentication, authorization, encryption at every layer

---

## 2. SYSTEM COMPONENTS

### 2.1 Frontend Applications

#### A. Student Dashboard (React + TypeScript)
**Purpose**: Student-facing portal for viewing JRI and improvement tracking

**Features**:
- JRI score display with visual breakdown
- Historical JRI trend chart
- GitHub projects listing with individual scores
- DSA progress tracking
- Learning recommendations
- Profile management

**Tech Stack**:
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- React Query for data fetching
- React Router for navigation

**Key Pages**:
```
/dashboard          - Main JRI overview
/projects           - GitHub projects analysis
/dsa                - Competitive programming stats
/improvement        - Personalized recommendations
/profile            - Account settings
```

#### B. Admin Dashboard (React + TypeScript)
**Purpose**: College placement officers manage and analyze student data

**Features**:
- Student list with filtering/sorting by JRI
- Department-wise performance analytics
- Bulk operations (recalculate JRI, export CSV)
- Individual student drill-down
- Placement correlation reports
- System health monitoring

**Key Pages**:
```
/students           - Student list and filters
/analytics          - Department/batch analytics
/placements         - Placement tracking and correlation
/reports            - Generate and download reports
/settings           - College configuration
```

#### C. Recruiter Portal (React + TypeScript) [FUTURE]
**Purpose**: Recruiters browse verified student profiles

**Features**:
- Advanced student search (JRI, skills, location)
- Saved searches and candidate pipelines
- Direct messaging students
- Interview scheduling
- Placement tracking

---

### 2.2 Backend Services

#### A. API Gateway (Node.js + Express)
**Purpose**: Single entry point for all client requests

**Responsibilities**:
- Request routing
- Rate limiting (express-rate-limit)
- JWT token validation
- Request/response logging
- CORS handling
- API versioning (v1, v2, etc.)

**Structure**:
```javascript
// server.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/students', require('./routes/students'));
app.use('/api/v1/jri', require('./routes/jri'));
app.use('/api/v1/github', require('./routes/github'));
app.use('/api/v1/dsa', require('./routes/dsa'));
app.use('/api/v1/admin', require('./routes/admin'));

// Error handling
app.use(errorHandler);
```

#### B. Authentication Service
**Purpose**: User authentication and authorization

**Implementation**:
- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Password hashing (bcrypt)

**User Roles**:
```typescript
enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  RECRUITER = 'recruiter' // future
}
```

**JWT Payload**:
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  collegeId: string;
  iat: number;
  exp: number;
}
```

#### C. Data Fetcher Services
**Purpose**: Collect data from external sources

**Services**:

1. **GitHub Service**
   - Fetch user repositories
   - Analyze code metrics
   - Track commit history
   - Detect tech stacks

2. **LeetCode Scraper**
   - Scrape user profile (no official API)
   - Extract problem counts (Easy/Medium/Hard)
   - Get contest ratings
   - Handle rate limits

3. **CodeForces Service**
   - Use official API
   - Fetch problem submissions
   - Get contest ratings
   - Calculate consistency

4. **HackerRank Service** (if available)
   - Fetch certifications
   - Get problem-solving stats

5. **Academic Data Service**
   - CSV import handler
   - API integration (if college provides)
   - Data validation

#### D. JRI Calculator Service
**Purpose**: Compute Job Readiness Index

**Components**:
- Component scorers (GitHub, DSA, Academic, Hackathon)
- Normalization algorithms
- Weighted aggregation
- Historical tracking
- Percentile calculation

**Algorithm** (detailed in section 7)

#### E. Background Job Workers
**Purpose**: Process long-running tasks asynchronously

**Jobs**:
- Fetch GitHub data for student
- Scrape LeetCode/CodeForces
- Recalculate JRI
- Send notification emails
- Generate reports
- Cleanup old cache

**Queue System**: BullMQ (Redis-backed)

---

### 2.3 Data Layer

#### A. PostgreSQL Database
**Purpose**: Primary data store

**Why PostgreSQL?**
- ACID compliance
- Complex queries (joins, aggregations)
- JSON support for flexible data
- Strong typing
- Excellent Node.js support (Prisma ORM)

#### B. Redis Cache
**Purpose**: High-speed caching and job queue

**Use Cases**:
- Cache API responses (GitHub, LeetCode data)
- Session storage
- Rate limiting counters
- Job queue (BullMQ)
- Real-time leaderboards

**Cache Strategy**:
```
GitHub Data: TTL 7 days
LeetCode Data: TTL 24 hours
CodeForces Data: TTL 24 hours
JRI Scores: TTL 1 hour (recalculated on demand)
```

---

## 3. TECHNOLOGY STACK

### 3.1 Frontend

| Technology | Purpose | Why |
|------------|---------|-----|
| **React 18** | UI framework | Component-based, huge ecosystem, TypeScript support |
| **TypeScript** | Type safety | Catch bugs early, better IDE support |
| **Tailwind CSS** | Styling | Rapid UI development, consistent design |
| **Vite** | Build tool | Fast dev server, optimized production builds |
| **React Query** | Data fetching | Caching, refetching, optimistic updates |
| **Recharts** | Charts | Simple, React-native charts library |
| **React Hook Form** | Forms | Performant form handling |
| **Zustand** | State management | Simple, lightweight state management |

### 3.2 Backend

| Technology | Purpose | Why |
|------------|---------|-----|
| **Node.js 20** | Runtime | JavaScript everywhere, huge ecosystem |
| **Express.js** | Web framework | Minimal, flexible, well-documented |
| **TypeScript** | Type safety | Same language as frontend, type safety |
| **Prisma** | ORM | Type-safe DB queries, migrations, great DX |
| **BullMQ** | Job queue | Reliable, Redis-backed, great monitoring |
| **Joi/Zod** | Validation | Schema validation for APIs |
| **JWT** | Auth | Stateless authentication |
| **Bcrypt** | Password hashing | Industry standard |
| **Winston** | Logging | Structured logging, multiple transports |

### 3.3 External Services

| Service | Purpose | Cost |
|---------|---------|------|
| **GitHub API** | Fetch repos, commits | Free tier: 5000 req/hr, Paid: ₹5K/mo for more |
| **Puppeteer** | LeetCode scraping | Free (self-hosted) |
| **Axios** | HTTP client | Free |
| **Nodemailer** | Email notifications | Free with SMTP |

### 3.4 Infrastructure

| Technology | Purpose | Cost (Pilot) | Cost (Production) |
|------------|---------|--------------|-------------------|
| **DigitalOcean** | Cloud hosting | ₹10K/mo | ₹40K/mo |
| **PostgreSQL** | Database | Managed: ₹8K/mo | ₹20K/mo |
| **Redis** | Cache/Queue | Managed: ₹3K/mo | ₹8K/mo |
| **CloudFlare** | CDN | Free tier | ₹3K/mo |
| **Sentry** | Error tracking | Free tier | ₹4K/mo |
| **Datadog/New Relic** | Monitoring | Free tier (pilot) | ₹10K/mo |

### 3.5 DevOps

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **GitHub Actions** | CI/CD |
| **Nginx** | Reverse proxy |
| **Let's Encrypt** | SSL certificates |
| **PM2** | Process management |

---

## 4. DATABASE SCHEMA

### 4.1 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   Colleges  │────┬───▶│   Students   │
└─────────────┘    │    └──────┬───────┘
                   │           │
                   │           │
                   │    ┌──────▼────────────┐
                   │    │ GitHub Profiles   │
                   │    └───────────────────┘
                   │    
                   │    ┌───────────────────┐
                   │    │  DSA Profiles     │
                   │    └───────────────────┘
                   │    
                   │    ┌───────────────────┐
                   │    │ Academic Records  │
                   │    └───────────────────┘
                   │    
                   │    ┌───────────────────┐
                   │    │ JRI Calculations  │
                   │    └───────────────────┘
                   │
                   │    ┌───────────────────┐
                   └───▶│      Users        │
                        └───────────────────┘
```

### 4.2 Schema Definition (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(STUDENT)
  isActive      Boolean   @default(true)
  
  collegeId     String?
  college       College?  @relation(fields: [collegeId], references: [id])
  
  student       Student?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  @@index([email])
  @@index([collegeId])
}

enum Role {
  STUDENT
  ADMIN
  SUPER_ADMIN
  RECRUITER
}

// ============================================
// COLLEGES
// ============================================

model College {
  id              String    @id @default(cuid())
  name            String
  shortName       String    @unique
  domain          String?
  
  location        String?
  website         String?
  
  // Settings
  settings        Json?     // JRI weights, feature flags, etc.
  
  students        Student[]
  users           User[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([shortName])
}

// ============================================
// STUDENTS
// ============================================

model Student {
  id              String    @id @default(cuid())
  
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  collegeId       String
  college         College   @relation(fields: [collegeId], references: [id])
  
  // Personal Info
  firstName       String
  lastName        String
  rollNumber      String
  email           String    @unique
  phone           String?
  
  // Academic Info
  department      String    // CSE, IT, ECE, etc.
  semester        Int       // 1-8
  batch           String    // 2022, 2023, etc.
  section         String?   // A, B, C, etc.
  
  // Placement Info
  isPlaced        Boolean   @default(false)
  placementYear   Int?
  packageOffered  Float?    // in lakhs
  companyName     String?
  
  // Relationships
  githubProfile   GitHubProfile?
  dsaProfiles     DSAProfile[]
  academicRecords AcademicRecord[]
  hackathons      Hackathon[]
  jriCalculations JRICalculation[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([collegeId, rollNumber])
  @@index([email])
  @@index([collegeId])
  @@index([batch])
  @@index([department])
}

// ============================================
// GITHUB DATA
// ============================================

model GitHubProfile {
  id              String    @id @default(cuid())
  
  studentId       String    @unique
  student         Student   @relation(fields: [studentId], references: [id])
  
  username        String    @unique
  profileUrl      String
  
  // Aggregated Stats
  totalRepos      Int       @default(0)
  totalCommits    Int       @default(0)
  totalStars      Int       @default(0)
  totalForks      Int       @default(0)
  
  // Calculated Metrics
  languagesUsed   Json      // { "JavaScript": 45%, "Python": 30%, ... }
  frameworks      Json      // ["React", "Express", "Django"]
  
  // Raw Data
  repositories    Json      // Array of repo objects
  
  // Metadata
  lastFetchedAt   DateTime?
  fetchStatus     FetchStatus @default(PENDING)
  errorMessage    String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([studentId])
  @@index([username])
}

enum FetchStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  FAILED
}

// ============================================
// DSA DATA
// ============================================

model DSAProfile {
  id              String    @id @default(cuid())
  
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id])
  
  platform        DSAPlatform
  username        String
  profileUrl      String
  
  // Problem Stats
  totalSolved     Int       @default(0)
  easySolved      Int       @default(0)
  mediumSolved    Int       @default(0)
  hardSolved      Int       @default(0)
  
  // Rating/Rank
  rating          Int?
  rank            Int?
  contestsParticipated Int  @default(0)
  
  // Raw Data
  submissions     Json?     // Recent submissions
  
  // Metadata
  lastFetchedAt   DateTime?
  fetchStatus     FetchStatus @default(PENDING)
  errorMessage    String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([studentId, platform])
  @@index([studentId])
  @@index([platform])
}

enum DSAPlatform {
  LEETCODE
  CODEFORCES
  HACKERRANK
  CODECHEF
  GEEKSFORGEEKS
}

// ============================================
// ACADEMIC DATA
// ============================================

model AcademicRecord {
  id              String    @id @default(cuid())
  
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id])
  
  semester        Int
  cgpa            Float
  sgpa            Float?
  
  // Subject-wise marks (optional detailed view)
  subjects        Json?     // [{ name, marks, grade, credits }]
  
  // Relevant courses for tech students
  programmingCourses Json?  // DSA, OOP, DBMS, etc.
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([studentId, semester])
  @@index([studentId])
}

// ============================================
// HACKATHONS & COMPETITIONS
// ============================================

model Hackathon {
  id              String    @id @default(cuid())
  
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id])
  
  name            String
  organizer       String?
  type            HackathonType
  
  participationDate DateTime
  rank            Int?
  prize           String?   // "Winner", "Runner Up", "Participation"
  
  projectName     String?
  projectUrl      String?   // GitHub/deployed link
  techStack       Json?     // ["React", "Node.js"]
  
  certificate     String?   // URL to certificate image
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([studentId])
}

enum HackathonType {
  HACKATHON
  CODING_COMPETITION
  IDEATHON
  CTF
  DATATHON
  OTHER
}

// ============================================
// JRI CALCULATIONS
// ============================================

model JRICalculation {
  id              String    @id @default(cuid())
  
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id])
  
  // Overall JRI
  jriScore        Float     // 0-100
  
  // Component Scores (0-100 each)
  githubScore     Float     @default(0)
  dsaScore        Float     @default(0)
  academicScore   Float     @default(0)
  hackathonScore  Float     @default(0)
  
  // Raw metrics (for debugging/analysis)
  rawScores       Json      // Detailed breakdown
  
  // Weights used for this calculation
  weights         Json      // { github: 0.3, dsa: 0.4, academic: 0.2, hackathon: 0.1 }
  
  // Version tracking
  algorithmVersion String   @default("1.0")
  
  // Metadata
  calculatedAt    DateTime  @default(now())
  
  @@index([studentId])
  @@index([jriScore])
  @@index([calculatedAt])
}

// ============================================
// PLACEMENT TRACKING
// ============================================

model PlacementRecord {
  id              String    @id @default(cuid())
  
  studentId       String
  
  companyName     String
  jobRole         String?
  
  // Rounds tracking
  appliedDate     DateTime?
  resumeShortlisted Boolean @default(false)
  aptitudeCleared   Boolean @default(false)
  technical1Cleared Boolean @default(false)
  technical2Cleared Boolean @default(false)
  hrCleared         Boolean @default(false)
  
  // Outcome
  isSelected      Boolean   @default(false)
  offerPackage    Float?    // in lakhs
  offerDate       DateTime?
  
  // JRI at time of application
  jriAtApplication Float?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([studentId])
  @@index([companyName])
  @@index([isSelected])
}

// ============================================
// JOBS QUEUE (for tracking background jobs)
// ============================================

model Job {
  id              String    @id @default(cuid())
  
  type            JobType
  studentId       String?
  
  status          JobStatus @default(PENDING)
  attempts        Int       @default(0)
  maxAttempts     Int       @default(3)
  
  payload         Json?
  result          Json?
  error           String?
  
  scheduledFor    DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([type])
  @@index([status])
  @@index([studentId])
}

enum JobType {
  FETCH_GITHUB
  FETCH_LEETCODE
  FETCH_CODEFORCES
  CALCULATE_JRI
  SEND_EMAIL
  GENERATE_REPORT
}

enum JobStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}
```

### 4.3 Key Design Decisions

**1. Normalized Structure**
- Separate tables for different data sources
- Easier to update individual components
- Better query performance

**2. JSON Fields for Flexibility**
- GitHub repositories stored as JSON (dynamic structure)
- Settings and raw scores as JSON (easy to extend)

**3. Metadata Tracking**
- `lastFetchedAt` and `fetchStatus` on external data
- Helps with cache invalidation and error handling

**4. Version Tracking**
- `algorithmVersion` on JRI calculations
- Can compare different versions of scoring

**5. Indexing Strategy**
- Index on frequently queried fields
- Composite indexes where needed
- Balance between read performance and write overhead

---

## 5. API DESIGN

### 5.1 API Structure

**Base URL**: `https://api.slh.com/v1`

**Authentication**: JWT Bearer token in header
```
Authorization: Bearer <token>
```

### 5.2 Core Endpoints

#### Authentication Endpoints

```
POST   /auth/register              - Register new user (student)
POST   /auth/login                 - Login and get JWT
POST   /auth/refresh               - Refresh access token
POST   /auth/logout                - Invalidate refresh token
POST   /auth/forgot-password       - Request password reset
POST   /auth/reset-password        - Reset password with token
GET    /auth/me                    - Get current user info
```

#### Student Endpoints

```
GET    /students                   - List all students (Admin only)
GET    /students/:id               - Get student by ID
PUT    /students/:id               - Update student profile
GET    /students/:id/jri           - Get latest JRI score
GET    /students/:id/jri/history   - Get JRI history
POST   /students/:id/refresh-data  - Trigger data refresh (queued)

GET    /students/me                - Get current student's profile
PUT    /students/me                - Update own profile
GET    /students/me/jri            - Get own JRI
POST   /students/me/connect-github - Connect GitHub account
POST   /students/me/connect-leetcode - Connect LeetCode account
```

#### GitHub Endpoints

```
GET    /github/:studentId          - Get GitHub profile data
POST   /github/:studentId/fetch    - Trigger GitHub data fetch
GET    /github/:studentId/repos    - Get analyzed repositories
GET    /github/:studentId/languages - Get language breakdown
```

#### DSA Endpoints

```
GET    /dsa/:studentId             - Get all DSA profiles
GET    /dsa/:studentId/:platform   - Get specific platform data
POST   /dsa/:studentId/:platform/fetch - Trigger data fetch
```

#### JRI Endpoints

```
GET    /jri/:studentId             - Get latest JRI
GET    /jri/:studentId/history     - Get JRI over time
POST   /jri/:studentId/calculate   - Trigger JRI recalculation
GET    /jri/:studentId/breakdown   - Detailed component scores
```

#### Admin Endpoints

```
GET    /admin/students             - List students with filters
GET    /admin/analytics/department - Department-wise stats
GET    /admin/analytics/batch      - Batch-wise stats
GET    /admin/leaderboard          - JRI leaderboard
POST   /admin/bulk-refresh         - Trigger bulk data refresh
GET    /admin/reports/placement    - Placement correlation report
POST   /admin/import/academic      - Import academic data CSV
GET    /admin/system/health        - System health check
```

#### Placement Endpoints

```
POST   /placements                 - Record placement event
GET    /placements/:studentId      - Get placement history
PUT    /placements/:id             - Update placement record
GET    /placements/analytics       - Placement vs JRI correlation
```

### 5.3 Request/Response Examples

#### POST /auth/login
**Request**:
```json
{
  "email": "student@cumail.in",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "student@cumail.in",
      "role": "STUDENT"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

#### GET /students/me/jri
**Response**:
```json
{
  "success": true,
  "data": {
    "jriScore": 78.5,
    "components": {
      "github": {
        "score": 82,
        "weight": 0.3,
        "contribution": 24.6
      },
      "dsa": {
        "score": 75,
        "weight": 0.4,
        "contribution": 30.0
      },
      "academic": {
        "score": 85,
        "weight": 0.2,
        "contribution": 17.0
      },
      "hackathon": {
        "score": 70,
        "weight": 0.1,
        "contribution": 7.0
      }
    },
    "percentile": 82,
    "rank": 45,
    "totalStudents": 500,
    "calculatedAt": "2026-02-08T10:30:00Z",
    "lastUpdated": "2026-02-08T10:30:00Z"
  }
}
```

#### GET /admin/students?department=CSE&jri_min=70&sort=jri&order=desc
**Response**:
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "std_xyz789",
        "name": "Rahul Sharma",
        "rollNumber": "20CSE001",
        "department": "CSE",
        "semester": 8,
        "jriScore": 85.5,
        "githubUsername": "rahul-dev",
        "isPlaced": false,
        "lastUpdated": "2026-02-07T15:20:00Z"
      },
      // ... more students
    ],
    "pagination": {
      "total": 127,
      "page": 1,
      "perPage": 20,
      "totalPages": 7
    },
    "filters": {
      "department": "CSE",
      "jri_min": 70
    }
  }
}
```

### 5.4 Error Handling

**Standard Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

**Error Codes**:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### 5.5 Rate Limiting

**Limits**:
- General API: 100 requests / 15 min per IP
- Data fetch triggers: 10 requests / hour per student
- Admin bulk operations: 5 requests / hour

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1644331200
```

---

## 6. DATA COLLECTION PIPELINE

### 6.1 Data Flow Architecture

```
User Action (Connect GitHub)
    │
    ▼
API: POST /students/me/connect-github
    │
    ▼
Validate GitHub username
    │
    ▼
Create Job in Queue
    │
    ▼
Return "Processing..." to user
    │
    ▼
Background Worker picks up job
    │
    ▼
Fetch from GitHub API
    │
    ├─ Success ─┐
    │           ▼
    │      Store in DB + Cache
    │           │
    │           ▼
    │      Trigger JRI Recalculation
    │           │
    │           ▼
    │      Update Student Dashboard
    │
    └─ Failure ─┐
                ▼
           Log Error + Retry (max 3 attempts)
                │
                ▼
           Notify user if all retries fail
```

### 6.2 GitHub Data Collector

**Implementation**:
```typescript
// services/github/GithubCollector.ts

import { Octokit } from '@octokit/rest';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export class GitHubCollector {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      throttle: {
        onRateLimit: (retryAfter) => {
          console.warn(`Rate limit hit. Retry after ${retryAfter}s`);
          return true; // Retry
        },
        onSecondaryRateLimit: () => {
          console.warn('Secondary rate limit hit');
          return true;
        }
      }
    });
  }

  async fetchUserData(username: string) {
    try {
      // Check cache first
      const cached = await redis.get(`github:${username}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch user profile
      const { data: user } = await this.octokit.users.getByUsername({
        username
      });

      // Fetch all repositories
      const { data: repos } = await this.octokit.repos.listForUser({
        username,
        type: 'owner',
        sort: 'updated',
        per_page: 100
      });

      // Analyze each repository
      const analyzedRepos = await Promise.all(
        repos.map(repo => this.analyzeRepository(username, repo.name))
      );

      const result = {
        user,
        repositories: analyzedRepos,
        stats: this.calculateStats(analyzedRepos)
      };

      // Cache for 7 days
      await redis.setex(
        `github:${username}`,
        7 * 24 * 60 * 60,
        JSON.stringify(result)
      );

      return result;
    } catch (error) {
      console.error('GitHub fetch error:', error);
      throw error;
    }
  }

  private async analyzeRepository(username: string, repoName: string) {
    // Fetch languages
    const { data: languages } = await this.octokit.repos.listLanguages({
      owner: username,
      repo: repoName
    });

    // Fetch commits (sample last 100)
    const { data: commits } = await this.octokit.repos.listCommits({
      owner: username,
      repo: repoName,
      per_page: 100
    });

    // Detect frameworks/libraries
    const frameworks = await this.detectFrameworks(username, repoName);

    // Calculate metrics
    const totalBytes = Object.values(languages).reduce((a: number, b: number) => a + b, 0);
    const languagePercentages = Object.entries(languages).reduce((acc, [lang, bytes]) => {
      acc[lang] = ((bytes as number) / totalBytes) * 100;
      return acc;
    }, {} as Record<string, number>);

    return {
      name: repoName,
      languages: languagePercentages,
      frameworks,
      commitCount: commits.length,
      lastCommit: commits[0]?.commit.author.date
    };
  }

  private async detectFrameworks(username: string, repoName: string) {
    const frameworks: string[] = [];

    try {
      // Check for package.json (Node.js)
      const { data: packageJson } = await this.octokit.repos.getContent({
        owner: username,
        repo: repoName,
        path: 'package.json'
      });

      if ('content' in packageJson) {
        const content = Buffer.from(packageJson.content, 'base64').toString();
        const pkg = JSON.parse(content);
        
        if (pkg.dependencies?.react) frameworks.push('React');
        if (pkg.dependencies?.express) frameworks.push('Express');
        if (pkg.dependencies?.['next']) frameworks.push('Next.js');
        // ... more framework detection
      }
    } catch (error) {
      // File doesn't exist, skip
    }

    // Check for requirements.txt (Python)
    // Check for pom.xml (Java)
    // etc.

    return frameworks;
  }

  private calculateStats(repos: any[]) {
    const totalCommits = repos.reduce((sum, repo) => sum + repo.commitCount, 0);
    
    const allLanguages = repos.reduce((acc, repo) => {
      Object.entries(repo.languages).forEach(([lang, percent]) => {
        acc[lang] = (acc[lang] || 0) + (percent as number);
      });
      return acc;
    }, {} as Record<string, number>);

    const allFrameworks = [...new Set(repos.flatMap(r => r.frameworks))];

    return {
      totalRepos: repos.length,
      totalCommits,
      languages: allLanguages,
      frameworks: allFrameworks
    };
  }
}
```

### 6.3 LeetCode Scraper (Puppeteer)

**Implementation**:
```typescript
// services/dsa/LeetCodeScraper.ts

import puppeteer from 'puppeteer';
import { redis } from '../lib/redis';

export class LeetCodeScraper {
  async scrapeProfile(username: string) {
    // Check cache
    const cached = await redis.get(`leetcode:${username}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Navigate to profile
      await page.goto(`https://leetcode.com/${username}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for profile data to load
      await page.waitForSelector('.profile-detail', { timeout: 10000 });

      // Extract data
      const data = await page.evaluate(() => {
        const getText = (selector: string) => 
          document.querySelector(selector)?.textContent?.trim() || '';

        return {
          totalSolved: parseInt(getText('.total-solved-count')) || 0,
          easySolved: parseInt(getText('.easy-solved-count')) || 0,
          mediumSolved: parseInt(getText('.medium-solved-count')) || 0,
          hardSolved: parseInt(getText('.hard-solved-count')) || 0,
          ranking: parseInt(getText('.ranking')) || null,
          contestRating: parseInt(getText('.contest-rating')) || null
        };
      });

      // Cache for 24 hours
      await redis.setex(
        `leetcode:${username}`,
        24 * 60 * 60,
        JSON.stringify(data)
      );

      return data;
    } catch (error) {
      console.error('LeetCode scrape error:', error);
      throw new Error('Failed to scrape LeetCode profile');
    } finally {
      await browser.close();
    }
  }
}
```

### 6.4 CodeForces API Client

**Implementation**:
```typescript
// services/dsa/CodeForcesClient.ts

import axios from 'axios';
import { redis } from '../lib/redis';

export class CodeForcesClient {
  private baseUrl = 'https://codeforces.com/api';

  async getUserInfo(username: string) {
    const cached = await redis.get(`codeforces:${username}`);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // Get user info
      const userResponse = await axios.get(`${this.baseUrl}/user.info`, {
        params: { handles: username }
      });

      if (userResponse.data.status !== 'OK') {
        throw new Error('User not found');
      }

      const user = userResponse.data.result[0];

      // Get user submissions
      const submissionsResponse = await axios.get(`${this.baseUrl}/user.status`, {
        params: { handle: username, from: 1, count: 1000 }
      });

      const submissions = submissionsResponse.data.result;
      
      // Calculate stats
      const acceptedSubmissions = submissions.filter(
        (s: any) => s.verdict === 'OK'
      );

      const problemsSolved = new Set(
        acceptedSubmissions.map((s: any) => `${s.problem.contestId}-${s.problem.index}`)
      ).size;

      const difficultyCount = acceptedSubmissions.reduce((acc: any, s: any) => {
        const rating = s.problem.rating || 0;
        if (rating < 1200) acc.easy++;
        else if (rating < 1800) acc.medium++;
        else acc.hard++;
        return acc;
      }, { easy: 0, medium: 0, hard: 0 });

      const data = {
        rating: user.rating || null,
        maxRating: user.maxRating || null,
        rank: user.rank || null,
        totalSolved: problemsSolved,
        ...difficultyCount,
        contestsParticipated: user.contests || 0
      };

      // Cache for 24 hours
      await redis.setex(
        `codeforces:${username}`,
        24 * 60 * 60,
        JSON.stringify(data)
      );

      return data;
    } catch (error) {
      console.error('CodeForces API error:', error);
      throw error;
    }
  }
}
```

### 6.5 Background Job Queue

**Implementation with BullMQ**:
```typescript
// queues/dataFetchQueue.ts

import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis';
import { GitHubCollector } from '../services/github/GithubCollector';
import { LeetCodeScraper } from '../services/dsa/LeetCodeScraper';
import { CodeForcesClient } from '../services/dsa/CodeForcesClient';
import { prisma } from '../lib/prisma';

// Create queue
export const dataFetchQueue = new Queue('data-fetch', {
  connection: redis
});

// Create worker
const worker = new Worker('data-fetch', async (job) => {
  const { type, studentId, username } = job.data;

  console.log(`Processing ${type} job for student ${studentId}`);

  try {
    switch (type) {
      case 'FETCH_GITHUB':
        const githubCollector = new GitHubCollector();
        const githubData = await githubCollector.fetchUserData(username);
        
        // Save to database
        await prisma.gitHubProfile.upsert({
          where: { studentId },
          update: {
            repositories: githubData.repositories,
            languagesUsed: githubData.stats.languages,
            frameworks: githubData.stats.frameworks,
            totalCommits: githubData.stats.totalCommits,
            lastFetchedAt: new Date(),
            fetchStatus: 'SUCCESS'
          },
          create: {
            studentId,
            username,
            profileUrl: `https://github.com/${username}`,
            repositories: githubData.repositories,
            languagesUsed: githubData.stats.languages,
            frameworks: githubData.stats.frameworks,
            totalCommits: githubData.stats.totalCommits,
            fetchStatus: 'SUCCESS'
          }
        });

        // Trigger JRI recalculation
        await dataFetchQueue.add('CALCULATE_JRI', { studentId });
        break;

      case 'FETCH_LEETCODE':
        const leetcodeScraper = new LeetCodeScraper();
        const leetcodeData = await leetcodeScraper.scrapeProfile(username);
        
        await prisma.dSAProfile.upsert({
          where: { studentId_platform: { studentId, platform: 'LEETCODE' } },
          update: {
            totalSolved: leetcodeData.totalSolved,
            easySolved: leetcodeData.easySolved,
            mediumSolved: leetcodeData.mediumSolved,
            hardSolved: leetcodeData.hardSolved,
            rating: leetcodeData.contestRating,
            lastFetchedAt: new Date(),
            fetchStatus: 'SUCCESS'
          },
          create: {
            studentId,
            platform: 'LEETCODE',
            username,
            profileUrl: `https://leetcode.com/${username}`,
            totalSolved: leetcodeData.totalSolved,
            easySolved: leetcodeData.easySolved,
            mediumSolved: leetcodeData.mediumSolved,
            hardSolved: leetcodeData.hardSolved,
            rating: leetcodeData.contestRating,
            fetchStatus: 'SUCCESS'
          }
        });

        await dataFetchQueue.add('CALCULATE_JRI', { studentId });
        break;

      case 'FETCH_CODEFORCES':
        const codeforcesClient = new CodeForcesClient();
        const codeforcesData = await codeforcesClient.getUserInfo(username);
        
        await prisma.dSAProfile.upsert({
          where: { studentId_platform: { studentId, platform: 'CODEFORCES' } },
          update: {
            totalSolved: codeforcesData.totalSolved,
            easySolved: codeforcesData.easy,
            mediumSolved: codeforcesData.medium,
            hardSolved: codeforcesData.hard,
            rating: codeforcesData.rating,
            rank: codeforcesData.rank,
            contestsParticipated: codeforcesData.contestsParticipated,
            lastFetchedAt: new Date(),
            fetchStatus: 'SUCCESS'
          },
          create: {
            studentId,
            platform: 'CODEFORCES',
            username,
            profileUrl: `https://codeforces.com/profile/${username}`,
            totalSolved: codeforcesData.totalSolved,
            easySolved: codeforcesData.easy,
            mediumSolved: codeforcesData.medium,
            hardSolved: codeforcesData.hard,
            rating: codeforcesData.rating,
            contestsParticipated: codeforcesData.contestsParticipated,
            fetchStatus: 'SUCCESS'
          }
        });

        await dataFetchQueue.add('CALCULATE_JRI', { studentId });
        break;

      case 'CALCULATE_JRI':
        // Import JRI calculator (defined in next section)
        const { JRICalculator } = await import('../services/jri/JRICalculator');
        const calculator = new JRICalculator();
        await calculator.calculateForStudent(studentId);
        break;
    }

    return { success: true };
  } catch (error) {
    console.error(`Job failed:`, error);
    throw error; // Will trigger retry
  }
}, {
  connection: redis,
  concurrency: 5, // Process 5 jobs concurrently
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000 // per second
  }
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
```

---

## 7. JRI CALCULATION ENGINE

### 7.1 JRI Algorithm Overview

**Formula**:
```
JRI = (W_github × S_github) + (W_dsa × S_dsa) + (W_academic × S_academic) + (W_hackathon × S_hackathon)

Where:
- W_* = Weight for each component (configurable, sum = 1.0)
- S_* = Normalized score for each component (0-100)
```

**Default Weights**:
```json
{
  "github": 0.30,    // 30% - Real-world projects
  "dsa": 0.40,       // 40% - Problem-solving ability
  "academic": 0.20,  // 20% - Academic foundation
  "hackathon": 0.10  // 10% - Extracurricular achievements
}
```

### 7.2 Component Scoring Algorithms

#### A. GitHub Score (0-100)

**Metrics**:
1. **Repository Quality Score** (40 points)
   - Number of repos (0-10 pts): `min(totalRepos / 2, 10)`
   - Average commits per repo (0-10 pts): `min(avgCommits / 10, 10)`
   - Language diversity (0-10 pts): `min(uniqueLanguages × 2, 10)`
   - Framework usage (0-10 pts): `min(uniqueFrameworks × 2, 10)`

2. **Code Activity Score** (30 points)
   - Total commits (0-15 pts): `min(totalCommits / 50, 15)`
   - Recent activity (0-15 pts): Based on commits in last 6 months

3. **Project Complexity Score** (30 points)
   - Multi-file projects (0-10 pts): Projects with >10 files
   - Full-stack projects (0-10 pts): Presence of both frontend & backend
   - Deployed projects (0-10 pts): Projects with live URLs

**Implementation**:
```typescript
// services/jri/scorers/GitHubScorer.ts

export class GitHubScorer {
  calculateScore(githubProfile: GitHubProfile): number {
    const repos = githubProfile.repositories as any[];
    
    // Repository Quality (40 points)
    const repoCount = Math.min(repos.length / 2, 10);
    const avgCommits = repos.reduce((sum, r) => sum + r.commitCount, 0) / repos.length;
    const commitsScore = Math.min(avgCommits / 10, 10);
    const languageCount = Object.keys(githubProfile.languagesUsed).length;
    const languageScore = Math.min(languageCount * 2, 10);
    const frameworkCount = (githubProfile.frameworks as string[]).length;
    const frameworkScore = Math.min(frameworkCount * 2, 10);
    
    const qualityScore = repoCount + commitsScore + languageScore + frameworkScore;

    // Code Activity (30 points)
    const totalCommits = githubProfile.totalCommits;
    const activityScore = Math.min(totalCommits / 50, 15);
    
    // Recent activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentRepos = repos.filter(r => 
      new Date(r.lastCommit) > sixMonthsAgo
    );
    const recentScore = Math.min((recentRepos.length / repos.length) * 15, 15);
    
    const totalActivityScore = activityScore + recentScore;

    // Project Complexity (30 points)
    const complexProjects = repos.filter(r => r.commitCount > 10).length;
    const complexityScore = Math.min(complexProjects * 2, 10);
    
    const fullStackProjects = repos.filter(r => 
      r.frameworks.some((f: string) => 
        ['React', 'Vue', 'Angular'].includes(f)
      ) &&
      r.frameworks.some((f: string) => 
        ['Express', 'Django', 'Flask', 'Spring'].includes(f)
      )
    ).length;
    const fullStackScore = Math.min(fullStackProjects * 5, 10);
    
    // For now, assume 0 deployed projects (would need additional data)
    const deployedScore = 0;
    
    const totalComplexityScore = complexityScore + fullStackScore + deployedScore;

    return qualityScore + totalActivityScore + totalComplexityScore;
  }
}
```

#### B. DSA Score (0-100)

**Metrics**:
1. **Problem Count Score** (40 points)
   - Total solved (0-20 pts): `min(totalSolved / 25, 20)`
   - Hard problems (0-20 pts): `min(hardSolved × 2, 20)`

2. **Platform Presence** (30 points)
   - Number of platforms (0-15 pts): `activePlatforms × 5`
   - Consistency (0-15 pts): All platforms > 50 problems

3. **Rating/Rank** (30 points)
   - LeetCode rating (0-15 pts): `(rating / 3000) × 15`
   - CodeForces rating (0-15 pts): `(rating / 3000) × 15`

**Implementation**:
```typescript
// services/jri/scorers/DSAScorer.ts

export class DSAScorer {
  calculateScore(dsaProfiles: DSAProfile[]): number {
    if (dsaProfiles.length === 0) return 0;

    // Problem Count Score (40 points)
    const totalSolved = dsaProfiles.reduce((sum, p) => sum + p.totalSolved, 0);
    const problemCountScore = Math.min(totalSolved / 25, 20);
    
    const totalHard = dsaProfiles.reduce((sum, p) => sum + p.hardSolved, 0);
    const hardProblemsScore = Math.min(totalHard * 2, 20);
    
    const totalProblemScore = problemCountScore + hardProblemsScore;

    // Platform Presence (30 points)
    const activePlatforms = dsaProfiles.length;
    const platformScore = Math.min(activePlatforms * 5, 15);
    
    const consistentPlatforms = dsaProfiles.filter(p => p.totalSolved > 50).length;
    const consistencyScore = Math.min(consistentPlatforms * 5, 15);
    
    const totalPresenceScore = platformScore + consistencyScore;

    // Rating/Rank (30 points)
    const leetcodeProfile = dsaProfiles.find(p => p.platform === 'LEETCODE');
    const leetcodeRating = leetcodeProfile?.rating || 0;
    const leetcodeScore = Math.min((leetcodeRating / 3000) * 15, 15);
    
    const codeforcesProfile = dsaProfiles.find(p => p.platform === 'CODEFORCES');
    const codeforcesRating = codeforcesProfile?.rating || 0;
    const codeforcesScore = Math.min((codeforcesRating / 3000) * 15, 15);
    
    const totalRatingScore = leetcodeScore + codeforcesScore;

    return totalProblemScore + totalPresenceScore + totalRatingScore;
  }
}
```

#### C. Academic Score (0-100)

**Metrics**:
1. **CGPA Score** (70 points)
   - Direct mapping: `(CGPA / 10) × 70`

2. **Relevant Coursework** (30 points)
   - Core CS courses taken (0-15 pts)
   - Advanced courses (0-15 pts)

**Implementation**:
```typescript
// services/jri/scorers/AcademicScorer.ts

export class AcademicScorer {
  calculateScore(academicRecords: AcademicRecord[]): number {
    if (academicRecords.length === 0) return 0;

    // Get latest CGPA
    const latestRecord = academicRecords.sort((a, b) => b.semester - a.semester)[0];
    const cgpa = latestRecord.cgpa;
    
    // CGPA Score (70 points)
    const cgpaScore = (cgpa / 10) * 70;

    // Relevant Coursework (30 points)
    // For now, simplified - would need actual course data
    const courseScore = 15; // Placeholder
    
    const totalCourseScore = courseScore + 15; // Assuming some advanced courses

    return cgpaScore + totalCourseScore;
  }
}
```

#### D. Hackathon Score (0-100)

**Metrics**:
1. **Participation Count** (40 points)
   - Number of hackathons (0-40 pts): `min(count × 10, 40)`

2. **Achievement Level** (40 points)
   - Winners (40 pts each)
   - Runner-ups (25 pts each)
   - Participation (10 pts each)
   - Max 40 points total

3. **Recency Bonus** (20 points)
   - Events in last 12 months (0-20 pts)

**Implementation**:
```typescript
// services/jri/scorers/HackathonScorer.ts

export class HackathonScorer {
  calculateScore(hackathons: Hackathon[]): number {
    if (hackathons.length === 0) return 0;

    // Participation Count (40 points)
    const participationScore = Math.min(hackathons.length * 10, 40);

    // Achievement Level (40 points)
    let achievementScore = 0;
    for (const h of hackathons) {
      if (h.prize?.toLowerCase().includes('winner')) {
        achievementScore += 40;
      } else if (h.prize?.toLowerCase().includes('runner')) {
        achievementScore += 25;
      } else {
        achievementScore += 10;
      }
    }
    achievementScore = Math.min(achievementScore, 40);

    // Recency Bonus (20 points)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const recentHackathons = hackathons.filter(h => 
      new Date(h.participationDate) > oneYearAgo
    );
    const recencyScore = Math.min((recentHackathons.length / hackathons.length) * 20, 20);

    return participationScore + achievementScore + recencyScore;
  }
}
```

### 7.3 Complete JRI Calculator

```typescript
// services/jri/JRICalculator.ts

import { prisma } from '../../lib/prisma';
import { GitHubScorer } from './scorers/GitHubScorer';
import { DSAScorer } from './scorers/DSAScorer';
import { AcademicScorer } from './scorers/AcademicScorer';
import { HackathonScorer } from './scorers/HackathonScorer';

export class JRICalculator {
  private githubScorer = new GitHubScorer();
  private dsaScorer = new DSAScorer();
  private academicScorer = new AcademicScorer();
  private hackathonScorer = new HackathonScorer();

  async calculateForStudent(studentId: string) {
    // Fetch all data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        githubProfile: true,
        dsaProfiles: true,
        academicRecords: true,
        hackathons: true,
        college: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get weights (from college settings or use defaults)
    const weights = (student.college.settings as any)?.jriWeights || {
      github: 0.30,
      dsa: 0.40,
      academic: 0.20,
      hackathon: 0.10
    };

    // Calculate component scores
    const githubScore = student.githubProfile 
      ? this.githubScorer.calculateScore(student.githubProfile)
      : 0;

    const dsaScore = this.dsaScorer.calculateScore(student.dsaProfiles);

    const academicScore = this.academicScorer.calculateScore(student.academicRecords);

    const hackathonScore = this.hackathonScorer.calculateScore(student.hackathons);

    // Calculate weighted JRI
    const jriScore = 
      (weights.github * githubScore) +
      (weights.dsa * dsaScore) +
      (weights.academic * academicScore) +
      (weights.hackathon * hackathonScore);

    // Save calculation
    await prisma.jRICalculation.create({
      data: {
        studentId,
        jriScore: Math.round(jriScore * 10) / 10, // Round to 1 decimal
        githubScore: Math.round(githubScore),
        dsaScore: Math.round(dsaScore),
        academicScore: Math.round(academicScore),
        hackathonScore: Math.round(hackathonScore),
        weights,
        rawScores: {
          github: {
            qualityScore: 0, // Would need to expose from scorer
            activityScore: 0,
            complexityScore: 0
          },
          // ... other raw scores
        },
        algorithmVersion: '1.0'
      }
    });

    return {
      jriScore,
      components: {
        github: githubScore,
        dsa: dsaScore,
        academic: academicScore,
        hackathon: hackathonScore
      },
      weights
    };
  }

  async calculateForBatch(collegeId: string, batch: string) {
    const students = await prisma.student.findMany({
      where: { collegeId, batch },
      select: { id: true }
    });

    const results = await Promise.all(
      students.map(s => this.calculateForStudent(s.id))
    );

    return results;
  }
}
```

---

## 8. SECURITY & AUTHENTICATION

### 8.1 Authentication Flow

**JWT-Based Authentication**:

```
1. User Registration/Login
   ↓
2. Server validates credentials
   ↓
3. Server generates:
   - Access Token (15 min expiry)
   - Refresh Token (7 days expiry)
   ↓
4. Tokens sent to client
   ↓
5. Client stores tokens (httpOnly cookies or localStorage)
   ↓
6. Client includes Access Token in requests
   ↓
7. When Access Token expires:
   - Client sends Refresh Token
   - Server issues new Access Token
   ↓
8. Logout:
   - Invalidate Refresh Token in DB
```

**Implementation**:
```typescript
// services/auth/AuthService.ts

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';

export class AuthService {
  private ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
  private REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    collegeId: string;
    department: string;
    semester: number;
    batch: string;
  }) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user and student
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'STUDENT',
        collegeId: data.collegeId,
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            rollNumber: data.rollNumber,
            email: data.email,
            collegeId: data.collegeId,
            department: data.department,
            semester: data.semester,
            batch: data.batch
          }
        }
      },
      include: { student: true }
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId
    };

    const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d'
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student
      }
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as any;

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { student: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
```

### 8.2 Authorization Middleware

```typescript
// middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    collegeId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage in routes:
// router.get('/admin/students', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), getStudents);
```

### 8.3 Security Best Practices

**1. Environment Variables**:
```bash
# .env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
ACCESS_TOKEN_SECRET="random-256-bit-secret"
REFRESH_TOKEN_SECRET="different-random-256-bit-secret"
GITHUB_TOKEN="ghp_..."
```

**2. Helmet.js for HTTP Headers**:
```typescript
import helmet from 'helmet';
app.use(helmet());
```

**3. CORS Configuration**:
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

**4. Input Validation**:
```typescript
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

// In route handler:
const { error, value } = loginSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

**5. SQL Injection Prevention**:
- Use Prisma ORM (parameterized queries automatically)
- Never use raw SQL with user input

**6. XSS Prevention**:
- Sanitize all user inputs
- Use Content Security Policy headers
- React automatically escapes JSX

**7. Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/auth/login', loginLimiter, loginHandler);
```

---

## 9. DEPLOYMENT ARCHITECTURE

### 9.1 Development Environment (Docker Compose)

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: slh
      POSTGRES_PASSWORD: slh_dev_password
      POSTGRES_DB: slh_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://slh:slh_dev_password@postgres:5432/slh_dev
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    command: npm run dev

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      - DATABASE_URL=postgresql://slh:slh_dev_password@postgres:5432/slh_dev
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    command: npm run worker

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

### 9.2 Production Deployment (DigitalOcean)

**Architecture**:
```
                    Internet
                       │
                       ▼
            ┌──────────────────┐
            │   CloudFlare     │  (CDN + DDoS protection)
            │   DNS + SSL      │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │   Load Balancer  │  (DigitalOcean)
            └────────┬─────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌──────┐    ┌──────┐    ┌──────┐
    │ API  │    │ API  │    │ API  │  (3x Droplets)
    │ Node │    │ Node │    │ Node │  (2 vCPU, 4GB RAM each)
    └──┬───┘    └──┬───┘    └──┬───┘
       │           │           │
       └───────────┼───────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
  ┌─────────┐            ┌─────────┐
  │ Worker  │            │ Worker  │  (2x Droplets)
  │ Node    │            │ Node    │  (2 vCPU, 4GB RAM each)
  └────┬────┘            └────┬────┘
       │                       │
       └───────────┬───────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
  ┌──────────┐          ┌─────────┐
  │PostgreSQL│          │  Redis  │
  │Managed DB│          │Managed  │
  │(4GB RAM) │          │(2GB RAM)│
  └──────────┘          └─────────┘
```

**Droplet Specifications (Pilot - 500 students)**:
- **API Servers**: 3x $24/month droplets (2 vCPU, 4GB RAM)
- **Workers**: 2x $24/month droplets (2 vCPU, 4GB RAM)
- **Managed PostgreSQL**: $60/month (4GB RAM, 2 vCPU)
- **Managed Redis**: $35/month (2GB RAM)
- **Load Balancer**: $12/month
- **Total Infrastructure**: ~$200/month

**For Production (5000 students)**:
- Scale API servers to 5x
- Scale workers to 3x
- Upgrade DB to 8GB RAM
- **Total**: ~$500/month

### 9.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t slh-api:latest ./backend
          docker build -t slh-frontend:latest ./frontend
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push slh-api:latest
          docker push slh-frontend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to DigitalOcean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /var/www/slh
            docker-compose pull
            docker-compose up -d
            docker-compose exec api npm run migrate
```

### 9.4 Monitoring & Logging

**1. Error Tracking (Sentry)**:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Capture errors
Sentry.captureException(error);
```

**2. Application Logging (Winston)**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage:
logger.info('User logged in', { userId: user.id });
logger.error('GitHub API error', { error: err.message });
```

**3. Performance Monitoring (Datadog/New Relic)**:
- Track API response times
- Monitor database query performance
- Track queue processing times
- Monitor memory/CPU usage

---

## 10. SCALING STRATEGY

### 10.1 Horizontal Scaling

**API Servers**:
- Stateless design allows easy horizontal scaling
- Add more droplets behind load balancer
- Use PM2 cluster mode for multi-core utilization

**Workers**:
- Add more worker instances as job volume increases
- BullMQ automatically distributes jobs across workers

**Database**:
- Read replicas for heavy read operations
- Connection pooling (PgBouncer)
- Query optimization with indexes

### 10.2 Caching Strategy

**Redis Layers**:
```
Layer 1: API Response Cache (1 hour TTL)
- GET /students/:id → Cache full response
- GET /students/:id/jri → Cache JRI object

Layer 2: External Data Cache (7-24 hour TTL)
- GitHub data → 7 days
- LeetCode data → 24 hours
- CodeForces data → 24 hours

Layer 3: Computed Data Cache (1 hour TTL)
- Leaderboards
- Department analytics
- Aggregated stats
```

### 10.3 Database Optimization

**Indexing Strategy**:
```sql
-- Already defined in Prisma schema via @@index
-- Most important indexes:
CREATE INDEX idx_students_college_batch ON students(college_id, batch);
CREATE INDEX idx_jri_calculations_score ON jri_calculations(jri_score DESC);
CREATE INDEX idx_students_department ON students(department);
```

**Query Optimization**:
- Use `select` to fetch only needed fields
- Use `include` judiciously (avoid N+1 queries)
- Implement pagination for large lists
- Use database aggregations instead of fetching all data

### 10.4 Cost Optimization

**At Different Scales**:

| Students | Infrastructure Cost | Revenue (₹500/student) | Profit Margin |
|----------|---------------------|------------------------|---------------|
| 500      | ₹20K/month          | ₹2.5L/year (₹20K/month)| ~50% |
| 5,000    | ₹50K/month          | ₹25L/year (₹2L/month)  | 75% |
| 50,000   | ₹3.5L/month         | ₹2.5Cr/year (₹20L/month) | 82% |
| 500,000  | ₹20L/month          | ₹25Cr/year (₹2Cr/month)  | 90% |

**As you scale, infrastructure costs decrease as % of revenue due to:**
- Better cache hit rates
- Bulk API pricing
- Database efficiency improvements
- Shared infrastructure across colleges

---

## 11. DEVELOPMENT PHASES

### Phase 1: MVP (Weeks 1-4) - Pilot Ready

**Week 1-2: Core Backend**
- [ ] Database schema setup (Prisma)
- [ ] Authentication system (JWT)
- [ ] Basic API endpoints
- [ ] GitHub data collector
- [ ] Job queue setup (BullMQ)

**Week 3: Data & JRI**
- [ ] LeetCode scraper
- [ ] CodeForces client
- [ ] JRI calculator implementation
- [ ] Academic data CSV import

**Week 4: Frontend & Deployment**
- [ ] Student dashboard (basic)
- [ ] Admin dashboard (list + filters)
- [ ] Deployment to DigitalOcean
- [ ] SSL setup
- [ ] Testing with sample data

**Deliverable**: Working platform for 500 students

---

### Phase 2: Pilot Execution (Months 2-3)

**Month 2: Data Collection**
- [ ] Onboard 500 CU students
- [ ] Monitor data fetch jobs
- [ ] Fix bugs and edge cases
- [ ] Optimize performance

**Month 3: Placement Tracking**
- [ ] Track placement outcomes
- [ ] Correlation analysis
- [ ] Generate reports
- [ ] Present findings to CU

---

### Phase 3: Scale Preparation (Months 4-6)

**Feature Enhancements**:
- [ ] Improved JRI algorithm (based on pilot learnings)
- [ ] Better visualizations
- [ ] Learning recommendations engine
- [ ] Notification system
- [ ] Mobile responsive improvements

**Scaling Improvements**:
- [ ] Database optimization
- [ ] Caching improvements
- [ ] Load testing (simulate 5K users)
- [ ] Monitoring dashboards

---

### Phase 4: Multi-College (Months 7-12)

**Platform Features**:
- [ ] Multi-tenancy support
- [ ] College-specific branding
- [ ] Custom JRI weights per college
- [ ] Bulk import tools
- [ ] Advanced reporting

**Recruiter Portal**:
- [ ] Student search and filtering
- [ ] Messaging system
- [ ] Placement tracking
- [ ] Recruiter analytics

---

## CONCLUSION

This architecture is designed to:
✅ Scale from 500 to 500,000+ students
✅ Handle 100+ concurrent requests
✅ Process thousands of background jobs daily
✅ Maintain <500ms API response times
✅ Keep infrastructure costs at 5-10% of revenue

**Next Steps**:
1. Review and approve this architecture
2. Set up development environment
3. Start Phase 1 implementation
4. Weekly progress reviews

**Key Success Factors**:
- Start simple, scale gradually
- Monitor everything from day 1
- Optimize based on real data, not assumptions
- Security and reliability over features
- User feedback drives development

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Authors**: SLH Technical Team