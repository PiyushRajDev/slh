# SkillLighthouse (SLH)

**SkillLighthouse (SLH)** is an evidence-based engineering evaluation platform that measures *real developer capability* using verifiable signals such as code quality, project architecture, problem-solving, and academic context.

SLH is designed for **students, colleges, and recruiters** who want outcomes based on **proof of work**, not resumes or self-reported claims.

---

## 🎯 Core Goals

- Replace subjective project evaluation with **deterministic, explainable analysis**
- Help colleges run **scalable, consistent audits** of student projects
- Give students **actionable feedback** tied to real engineering expectations
- Create a **credible signal** for hiring that correlates with placement outcomes

---

## 🧠 What SLH Actually Does

### 1. Project Analyzer (Core)
- Clones student repositories
- Extracts **raw code metrics** (complexity, structure, testing, git discipline)
- Evaluates projects under **multiple valid interpretations**
- Selects the *most defensible* evaluation (mirrors professor judgment)
- Outputs **score bands + explanations**, not black-box numbers

### 2. JRI (Job Readiness Index)
- Combines:
  - Project capability
  - DSA / problem-solving data
  - Academic context
- Produces a **college-configurable readiness score**
- Fully versioned and auditable

### 3. Async, Scalable Architecture
- All heavy analysis runs in background workers
- API servers remain stateless and fast
- Designed to scale from **500 → 500,000 students**

---
## 🏗️ Repository Structure (Monorepo)

slh/
├── apps/
│ ├── api/ # REST API (Express + TypeScript)
│ ├── worker/ # Background workers (BullMQ)
│ └── frontend/ # Web app (React + TypeScript)
│
├── packages/
│ ├── project-analyzer/ # Code analysis + evaluation engine
│ ├── jri-engine/ # Job Readiness Index logic
│ └── shared/ # Shared types & utilities
│
├── infra/ # Docker, deployment, monitoring
├── docs/ # Architecture & system documentation
└── README.md


---

## 🧩 Design Principles

- **Deterministic over probabilistic**  
  No AI in scoring. Same input → same output.

- **Late interpretation binding**  
  Projects are evaluated under multiple valid lenses before selecting the best fit.

- **Explainability first**  
  Every score can be justified in human language.

- **Separation of concerns**  
  Evaluation logic is isolated from APIs, jobs, and infrastructure.

- **Production realism**  
  Built for real college pilots, not demo metrics.

---

# SLH Project Setup Guide

Welcome to the **SLH** mono-repository! This guide will help you set up the development environment, configure the necessary environment variables, and run the backend API, the frontend web application, and the core project analyzer.

## 1. Prerequisites

Before you start, make sure you have the following installed on your local machine:
- **Node.js** (v20 or higher recommended, the project uses v22.x)
- **PostgreSQL** (Running locally or via Docker)
- **Redis** (Running locally or via Docker)
- **Git**

## 2. Installation

This project is a monorepo containing multiple apps and packages. Install all dependencies from the root directory:

```bash
# Clone the repository
git clone https://github.com/PiyushRajDev/slh.git
cd slh

# Install dependencies for all workspaces
npm install
```

## 3. Environment Variables Configuration

You need to set up environment variables for the backend API to connect to the database, Redis, and authenticate with GitHub.

Create a `.env` file inside the `apps/api/` directory:

```bash
touch apps/api/.env
```

Add the following configuration to `apps/api/.env` and replace the placeholder values with your own secret keys:

```env
# GitHub OAuth Config (Used for user login & authentication)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Security Secrets (Must be 32-character random strings)
GITHUB_STATE_SECRET=your_random_32_character_string_here
GITHUB_TOKEN_ENCRYPTION_KEY=your_random_32_character_string_here
ACCESS_TOKEN_SECRET=your_random_32_character_string_here
REFRESH_TOKEN_SECRET=your_random_32_character_string_here

# Frontend Application URL
FRONTEND_URL=http://localhost:3001

# Database & Cache Connection Strings
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/slh_dev
REDIS_HOST=localhost
REDIS_PORT=6379

# GitHub Personal Access Token (Crucial for the Project Analyzer!)
# This is required to fetch repository data without hitting the 60 req/hr rate limit.
GITHUB_TOKEN=ghp_your_personal_access_token_here
```

## 4. Database Setup

The backend utilizes **Prisma** as its ORM. You need to push the schema to your newly created local PostgreSQL database.

```bash
cd apps/api

# Sync the Prisma schema with the database
npx prisma db push

# Generate the Prisma Client
npx prisma generate
```

## 5. Running the Applications

Since this is a monorepo, you can run the services in separate terminal windows.

### Start the Backend API
The API runs on Express and powers the core authentication and job queueing.

```bash
cd apps/api
npm run dev
```

### Start the Frontend Web App
The frontend is a React application powered by Vite.

```bash
cd apps/frontend
npm run dev
```

### Using the Project Analyzer CLI
The core intelligence of the platform lives in `packages/project-analyzer`. You can test analyzing real-world repositories directly from the command line using the local run script:

```bash
cd packages/project-analyzer

# Run the test-urls script passing the backend .env file to load the GITHUB_TOKEN
npx tsx --env-file=../../apps/api/.env test-urls.ts
```

This script will analyze a list of popular repositories (or any URLs you add to `test-urls.ts`) and output their detected profiles, confidence scores, and anti-gaming flags.

## 6. Troubleshooting

- **Redis Connection Errors:** Ensure your local Redis server is actually running (`redis-cli ping` should return `PONG`).
- **GitHub Rate Limits (`401` or `403` Errors in Analyzer):** Verify that your `GITHUB_TOKEN` in `apps/api/.env` is valid and hasn't expired.
- **Clone Timeouts:** Monolithic respositories might take longer than 120s to clone depending on your internet connection.

🧪 Project Analyzer Specs

The analyzer is driven by explicit, versioned specs:

METRICS.md – what is measured (facts only)

PROFILES.md – evaluation lenses (rubrics)

SCORING.md – scoring logic per profile

INTEGRATION.md – pipeline contract

These specs are treated as code contracts.

🛡️ Security & Ethics

Only public data is analyzed

Student consent is mandatory

No hidden penalties or opaque scoring

Anti-gaming signals affect confidence, not scores

Designed to assist human evaluators, not replace them

🗺️ Roadmap (High Level)

✅ Project Analyzer v1 (college pilot)

⏳ Recruiter search & filtering

⏳ Multi-repo portfolio evaluation

⏳ Longitudinal skill growth tracking

⏳ Open benchmarks for engineering education

🤝 Contributing

This project is currently under active development.

Issues and discussions are welcome

Architectural changes require design discussion

Evaluation logic changes must update specs




