SLH Backend Setup (Quick Guide)
🧠 What This Project Does

API receives DSA profile fetch request

Job is added to BullMQ queue

Redis stores job state

Worker processes scraping in background

Data saved in PostgreSQL

Cooldown + dedupe prevent spam

Architecture:

API → BullMQ → Redis → Worker → PostgreSQL

📦 Tech Stack

Node.js (TypeScript)

PostgreSQL (Prisma)

Redis

BullMQ

Monorepo (apps + packages)

🚀 Local Setup
1️⃣ Install dependencies
npm install

2️⃣ Setup Environment Variables

Create:

apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/slh
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

3️⃣ Setup PostgreSQL

Start Postgres:

sudo service postgresql start


Create DB:

sudo -u postgres psql
CREATE DATABASE slh;
\q


Run migration:

cd packages/database
npx prisma migrate dev

4️⃣ Setup Redis

Install (if needed):

sudo apt install redis-server


Start Redis:

sudo service redis-server start


Test:

redis-cli ping


Should return PONG.

5️⃣ Start Application

Start API:

cd apps/api
npm run dev


Start Worker (separate terminal):

cd apps/worker
npm run dev