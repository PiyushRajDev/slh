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

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js ≥ 20
- npm ≥ 9
- Git

### Install
```bash
npm install

Run apps (individually)
# API
cd apps/api && npm run dev

# Worker
cd apps/worker && npm run dev

# Frontend
cd apps/frontend && npm run dev

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



## 🏗️ Repository Structure (Monorepo)

