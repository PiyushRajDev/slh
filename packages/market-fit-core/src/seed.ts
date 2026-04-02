import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../../database/src/generated/client";
import { stableHash } from "./utils";

type CapabilitySeed = {
    slug: string;
    name: string;
    category: string;
    description: string;
    keywords: string[];
    recommendation: string;
    projectSuggestion: string;
};

type SignalMappingSeed = {
    sourceType: "PROJECT_PROFILE" | "PROJECT_SIGNAL" | "PROJECT_DIMENSION" | "PROJECT_TERM" | "GITHUB_TERM" | "DSA_PROFILE" | "JRI_PROFILE";
    matcherType: "EXACT" | "CONTAINS" | "BOOLEAN_TRUE" | "THRESHOLD";
    matcherKey: string;
    matcherValue?: string;
    targetCapabilitySlug: string;
    baseScore: number;
    scoreMultiplier?: number;
    confidence: number;
    minThreshold?: number;
    profileIds?: string[];
    evidenceTemplate?: string;
};

type DevFixture = {
    role: string;
    seniority: string;
    listings: Array<{
        source: string;
        externalId: string;
        sourceUrl: string;
        companyName: string;
        title: string;
        location: string;
        employmentType: string;
        workMode: string;
        description: string;
    }>;
};

const CAPABILITY_SEED_DATA: CapabilitySeed[] = [
    {
        slug: "typescript",
        name: "TypeScript",
        category: "language",
        description: "Typed JavaScript used for maintainable backend and frontend systems.",
        keywords: ["typescript", "ts-node", "tsx", "tsc"],
        recommendation: "Build and ship production code in TypeScript instead of relying on tutorials or toy snippets.",
        projectSuggestion: "Create a TypeScript API service with typed DTOs, validation, and service-layer abstractions."
    },
    {
        slug: "javascript",
        name: "JavaScript",
        category: "language",
        description: "Core JavaScript development capability.",
        keywords: ["javascript", "node.js", "nodejs", "ecmascript"],
        recommendation: "Show stronger JavaScript fundamentals through modular code, async control flow, and clean APIs.",
        projectSuggestion: "Build a Node-based automation or API project with clean module boundaries."
    },
    {
        slug: "python",
        name: "Python",
        category: "language",
        description: "Python for services, scripts, or data pipelines.",
        keywords: ["python", "fastapi", "flask", "django"],
        recommendation: "Demonstrate Python beyond notebooks with testable modules and production-style service code.",
        projectSuggestion: "Ship a Python API or ETL workflow with tests, linting, and environment-based config."
    },
    {
        slug: "java",
        name: "Java",
        category: "language",
        description: "Java backend engineering capability.",
        keywords: ["java", "spring boot", "spring", "hibernate"],
        recommendation: "Strengthen Java backend evidence with layered architecture and real persistence workflows.",
        projectSuggestion: "Create a Spring Boot service with security, persistence, and integration tests."
    },
    {
        slug: "node-js",
        name: "Node.js",
        category: "runtime",
        description: "Node.js backend runtime proficiency.",
        keywords: ["node.js", "nodejs", "node ", "express", "fastify", "nestjs"],
        recommendation: "Show deeper Node.js production readiness through worker patterns, retries, and observability.",
        projectSuggestion: "Build a queue-backed Node service that processes long-running background jobs."
    },
    {
        slug: "express",
        name: "Express",
        category: "framework",
        description: "Express-based API development.",
        keywords: ["express", "express.js"],
        recommendation: "Strengthen Express work with controllers, services, middleware, and request validation.",
        projectSuggestion: "Design an Express API with auth, rate limiting, validation, and background processing."
    },
    {
        slug: "nestjs",
        name: "NestJS",
        category: "framework",
        description: "NestJS service architecture.",
        keywords: ["nestjs", "@nestjs/core", "@nestjs/common"],
        recommendation: "Demonstrate modular NestJS patterns with providers, guards, and persistence integration.",
        projectSuggestion: "Build a NestJS microservice with queues, caching, and structured DTO validation."
    },
    {
        slug: "rest-api",
        name: "REST APIs",
        category: "backend",
        description: "Designing and implementing API endpoints with clear contracts.",
        keywords: ["rest", "restful", "api endpoint", "crud api", "http api"],
        recommendation: "Focus on endpoint design, request validation, status semantics, and contract consistency.",
        projectSuggestion: "Ship a documented REST API with pagination, filtering, and strong error contracts."
    },
    {
        slug: "authentication",
        name: "Authentication",
        category: "backend",
        description: "Authentication and authorization workflows.",
        keywords: ["jwt", "oauth", "authentication", "authorization", "rbac", "session"],
        recommendation: "Add stronger auth flows with token lifecycle handling, RBAC, and secure middleware.",
        projectSuggestion: "Implement JWT plus refresh token auth with role-based route protection."
    },
    {
        slug: "sql",
        name: "SQL",
        category: "data",
        description: "Relational data modeling and querying.",
        keywords: ["sql", "postgresql", "mysql", "query optimization", "joins"],
        recommendation: "Show deeper SQL fluency with normalized schemas, indexes, and query reasoning.",
        projectSuggestion: "Design a relational schema with reporting queries and performance-minded indexes."
    },
    {
        slug: "postgresql",
        name: "PostgreSQL",
        category: "data",
        description: "PostgreSQL-backed application development.",
        keywords: ["postgresql", "postgres", "pg"],
        recommendation: "Demonstrate production PostgreSQL usage with migrations, indexes, and relational integrity.",
        projectSuggestion: "Build a PostgreSQL-backed service with Prisma migrations and reporting endpoints."
    },
    {
        slug: "mongodb",
        name: "MongoDB",
        category: "data",
        description: "Document database usage for application data.",
        keywords: ["mongodb", "mongoose", "mongo"],
        recommendation: "Use MongoDB where it fits and pair it with clean schema discipline and aggregation usage.",
        projectSuggestion: "Create a content or event-tracking backend that uses MongoDB plus validation layers."
    },
    {
        slug: "redis",
        name: "Redis",
        category: "infrastructure",
        description: "Caching, locks, or queue coordination with Redis.",
        keywords: ["redis", "cache", "in-memory store"],
        recommendation: "Add Redis-backed caching or coordination where latency and deduplication matter.",
        projectSuggestion: "Implement a Redis cache or distributed lock around an expensive API workflow."
    },
    {
        slug: "prisma",
        name: "Prisma",
        category: "data",
        description: "Prisma ORM and schema-driven persistence.",
        keywords: ["prisma", "schema.prisma", "@prisma/client"],
        recommendation: "Use Prisma deliberately with schema normalization, constraints, and transactional updates.",
        projectSuggestion: "Model a moderately complex domain in Prisma with relation tables and migration history."
    },
    {
        slug: "microservices",
        name: "Microservices",
        category: "architecture",
        description: "Service decomposition and bounded-context thinking.",
        keywords: ["microservices", "service-oriented", "distributed system", "bounded context"],
        recommendation: "Show decomposition discipline rather than just multiple services living in one repo.",
        projectSuggestion: "Split a workflow into API and worker services with clear contracts and ownership."
    },
    {
        slug: "async-processing",
        name: "Async Processing",
        category: "architecture",
        description: "Background work, eventual completion, and queue-driven design.",
        keywords: ["async", "background jobs", "worker", "queue", "bullmq"],
        recommendation: "Move expensive work out of the request cycle and expose robust job status handling.",
        projectSuggestion: "Implement a queued analysis pipeline with status polling and retry-safe workers."
    },
    {
        slug: "message-queues",
        name: "Message Queues",
        category: "architecture",
        description: "Queue-backed workload orchestration.",
        keywords: ["bullmq", "queue", "rabbitmq", "sqs", "kafka"],
        recommendation: "Demonstrate idempotent job processing, retries, and deduplication around queue workloads.",
        projectSuggestion: "Build a queue-driven ingestion pipeline with dead-letter handling and idempotency."
    },
    {
        slug: "testing",
        name: "Testing",
        category: "quality",
        description: "Automated verification and regression safety.",
        keywords: ["test", "testing", "unit test", "integration test", "jest", "vitest", "pytest"],
        recommendation: "Raise confidence with meaningful unit and integration tests on core flows.",
        projectSuggestion: "Add a test suite that covers business logic, edge cases, and API contracts."
    },
    {
        slug: "ci-cd",
        name: "CI/CD",
        category: "quality",
        description: "Automated validation and delivery workflows.",
        keywords: ["github actions", "ci/cd", "continuous integration", "pipeline", "workflow"],
        recommendation: "Automate test and build checks so quality signals are visible before merge or deploy.",
        projectSuggestion: "Add a GitHub Actions pipeline that lint-checks, tests, and builds the project."
    },
    {
        slug: "docker",
        name: "Docker",
        category: "infrastructure",
        description: "Containerized application packaging.",
        keywords: ["docker", "dockerfile", "docker-compose"],
        recommendation: "Package your application for repeatable local and deployment environments.",
        projectSuggestion: "Containerize an API plus database stack with environment-based configuration."
    },
    {
        slug: "cloud-deployment",
        name: "Cloud Deployment",
        category: "infrastructure",
        description: "Deploying systems to managed cloud infrastructure.",
        keywords: ["aws", "gcp", "azure", "vercel", "railway", "render", "deployment"],
        recommendation: "Move beyond localhost by shipping and monitoring at least one live service.",
        projectSuggestion: "Deploy a full backend workflow with environment management and health endpoints."
    },
    {
        slug: "system-design",
        name: "System Design",
        category: "architecture",
        description: "Ability to reason about scalable service boundaries and data flow.",
        keywords: ["system design", "architecture", "scalability", "throughput", "latency"],
        recommendation: "Translate architecture ideas into actual modules, queues, caches, and persistence decisions.",
        projectSuggestion: "Document and implement a high-throughput service with explicit scaling tradeoffs."
    },
    {
        slug: "observability",
        name: "Observability",
        category: "quality",
        description: "Logging, monitoring, and production diagnostics.",
        keywords: ["logging", "monitoring", "sentry", "metrics", "telemetry", "observability"],
        recommendation: "Add structured logs and failure visibility so operational issues are diagnosable.",
        projectSuggestion: "Introduce structured logging and error monitoring around an async workflow."
    },
    {
        slug: "security",
        name: "Security",
        category: "quality",
        description: "Application security basics for APIs and services.",
        keywords: ["security", "xss", "sql injection", "rate limiting", "encryption", "csrf"],
        recommendation: "Show secure defaults in auth flows, validation, secret handling, and request throttling.",
        projectSuggestion: "Harden an API with validation, rate limiting, RBAC, and secret rotation support."
    },
    {
        slug: "git",
        name: "Git Discipline",
        category: "quality",
        description: "Healthy commit history and collaboration habits.",
        keywords: ["git", "github", "commit history", "pull request"],
        recommendation: "Use smaller atomic commits and consistent project evolution to make your work easier to trust.",
        projectSuggestion: "Maintain a project with visible iterative milestones and descriptive commit history."
    },
    {
        slug: "documentation",
        name: "Documentation",
        category: "quality",
        description: "Readable project and system documentation.",
        keywords: ["documentation", "readme", "api docs", "architecture docs"],
        recommendation: "Document decisions, setup, and API expectations so others can onboard quickly.",
        projectSuggestion: "Write a concise README plus an architecture note for a production-style backend."
    },
    {
        slug: "problem-solving",
        name: "Problem Solving",
        category: "problem-solving",
        description: "Structured algorithmic problem solving and debugging ability.",
        keywords: ["problem solving", "algorithms", "data structures", "leetcode", "codeforces"],
        recommendation: "Build stronger evidence through consistent DSA practice and difficult problem coverage.",
        projectSuggestion: "Maintain a verified coding-profile streak alongside a practical systems project."
    },
    {
        slug: "backend-architecture",
        name: "Backend Architecture",
        category: "architecture",
        description: "Layered service design, modularity, and maintainability.",
        keywords: ["service layer", "controller", "repository", "architecture", "modular design"],
        recommendation: "Show better boundaries between transport, business logic, persistence, and worker concerns.",
        projectSuggestion: "Refactor or build a backend with separate routes, controllers, services, and queue handlers."
    },
    {
        slug: "performance-optimization",
        name: "Performance Optimization",
        category: "quality",
        description: "Latency, throughput, and recomputation avoidance.",
        keywords: ["performance", "optimization", "caching", "batching", "indexing", "deduplication"],
        recommendation: "Prove performance thinking through caching, batching, and measured query improvements.",
        projectSuggestion: "Optimize a report-generation workflow with cached intermediate results and indexed queries."
    }
];

const SIGNAL_MAPPING_SEED_DATA: SignalMappingSeed[] = [
    { sourceType: "PROJECT_PROFILE", matcherType: "EXACT", matcherKey: "backend_api", targetCapabilitySlug: "backend-architecture", baseScore: 0.68, scoreMultiplier: 0.2, confidence: 0.82 },
    { sourceType: "PROJECT_PROFILE", matcherType: "EXACT", matcherKey: "production_web_app", targetCapabilitySlug: "backend-architecture", baseScore: 0.68, scoreMultiplier: 0.2, confidence: 0.82 },
    { sourceType: "PROJECT_PROFILE", matcherType: "EXACT", matcherKey: "backend_api", targetCapabilitySlug: "rest-api", baseScore: 0.62, scoreMultiplier: 0.25, confidence: 0.78 },
    { sourceType: "PROJECT_PROFILE", matcherType: "EXACT", matcherKey: "production_web_app", targetCapabilitySlug: "rest-api", baseScore: 0.62, scoreMultiplier: 0.25, confidence: 0.78 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_database", targetCapabilitySlug: "sql", baseScore: 0.58, scoreMultiplier: 0.2, confidence: 0.75 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_tests", targetCapabilitySlug: "testing", baseScore: 0.55, scoreMultiplier: 0.2, confidence: 0.8 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_ci", targetCapabilitySlug: "ci-cd", baseScore: 0.52, scoreMultiplier: 0.2, confidence: 0.78 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_docker", targetCapabilitySlug: "docker", baseScore: 0.56, scoreMultiplier: 0.18, confidence: 0.76 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_deployment_config", targetCapabilitySlug: "cloud-deployment", baseScore: 0.52, scoreMultiplier: 0.18, confidence: 0.7 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_git_history", targetCapabilitySlug: "git", baseScore: 0.5, scoreMultiplier: 0.2, confidence: 0.72 },
    { sourceType: "PROJECT_SIGNAL", matcherType: "BOOLEAN_TRUE", matcherKey: "has_documentation", targetCapabilitySlug: "documentation", baseScore: 0.5, scoreMultiplier: 0.15, confidence: 0.68 },
    { sourceType: "PROJECT_DIMENSION", matcherType: "THRESHOLD", matcherKey: "architecture", targetCapabilitySlug: "system-design", baseScore: 0, scoreMultiplier: 1, confidence: 0.7, minThreshold: 0.01 },
    { sourceType: "PROJECT_DIMENSION", matcherType: "THRESHOLD", matcherKey: "architecture", targetCapabilitySlug: "backend-architecture", baseScore: 0, scoreMultiplier: 1, confidence: 0.8, minThreshold: 0.01 },
    { sourceType: "PROJECT_DIMENSION", matcherType: "THRESHOLD", matcherKey: "testing", targetCapabilitySlug: "testing", baseScore: 0, scoreMultiplier: 1, confidence: 0.82, minThreshold: 0.01 },
    { sourceType: "PROJECT_DIMENSION", matcherType: "THRESHOLD", matcherKey: "git", targetCapabilitySlug: "git", baseScore: 0, scoreMultiplier: 1, confidence: 0.76, minThreshold: 0.01 },
    { sourceType: "PROJECT_DIMENSION", matcherType: "THRESHOLD", matcherKey: "devops", targetCapabilitySlug: "ci-cd", baseScore: 0, scoreMultiplier: 1, confidence: 0.72, minThreshold: 0.01 },
    { sourceType: "PROJECT_DIMENSION", matcherType: "THRESHOLD", matcherKey: "devops", targetCapabilitySlug: "cloud-deployment", baseScore: 0, scoreMultiplier: 1, confidence: 0.66, minThreshold: 0.01 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "typescript", targetCapabilitySlug: "typescript", baseScore: 0.52, scoreMultiplier: 0.2, confidence: 0.7 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "javascript", targetCapabilitySlug: "javascript", baseScore: 0.52, scoreMultiplier: 0.2, confidence: 0.7 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "python", targetCapabilitySlug: "python", baseScore: 0.52, scoreMultiplier: 0.2, confidence: 0.7 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "java", targetCapabilitySlug: "java", baseScore: 0.52, scoreMultiplier: 0.2, confidence: 0.7 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "prisma", targetCapabilitySlug: "prisma", baseScore: 0.5, scoreMultiplier: 0.22, confidence: 0.72 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "postgres", targetCapabilitySlug: "postgresql", baseScore: 0.5, scoreMultiplier: 0.22, confidence: 0.72 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "redis", targetCapabilitySlug: "redis", baseScore: 0.5, scoreMultiplier: 0.22, confidence: 0.72 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "docker", targetCapabilitySlug: "docker", baseScore: 0.5, scoreMultiplier: 0.22, confidence: 0.72 },
    { sourceType: "PROJECT_TERM", matcherType: "CONTAINS", matcherKey: "github actions", targetCapabilitySlug: "ci-cd", baseScore: 0.5, scoreMultiplier: 0.22, confidence: 0.72 },
    { sourceType: "DSA_PROFILE", matcherType: "EXACT", matcherKey: "LEETCODE", targetCapabilitySlug: "problem-solving", baseScore: 0, scoreMultiplier: 1, confidence: 0.82 },
    { sourceType: "DSA_PROFILE", matcherType: "EXACT", matcherKey: "CODEFORCES", targetCapabilitySlug: "problem-solving", baseScore: 0, scoreMultiplier: 1, confidence: 0.82 },
    { sourceType: "JRI_PROFILE", matcherType: "EXACT", matcherKey: "dsaScore", targetCapabilitySlug: "problem-solving", baseScore: 0, scoreMultiplier: 1, confidence: 0.68 },
    { sourceType: "JRI_PROFILE", matcherType: "EXACT", matcherKey: "githubScore", targetCapabilitySlug: "backend-architecture", baseScore: 0, scoreMultiplier: 1, confidence: 0.6 }
];

function buildGithubTermMappings(): SignalMappingSeed[] {
    const seen = new Set<string>();
    const mappings: SignalMappingSeed[] = [];

    for (const capability of CAPABILITY_SEED_DATA) {
        for (const keyword of capability.keywords) {
            const matcherKey = normalizeWhitespace(keyword).toLowerCase();
            if (matcherKey.length < 3) {
                continue;
            }

            const dedupeKey = `${capability.slug}:${matcherKey}`;
            if (seen.has(dedupeKey)) {
                continue;
            }

            seen.add(dedupeKey);
            mappings.push({
                sourceType: "GITHUB_TERM",
                matcherType: "CONTAINS",
                matcherKey,
                targetCapabilitySlug: capability.slug,
                baseScore: 0.48,
                scoreMultiplier: 0.18,
                confidence: 0.64,
                evidenceTemplate: `${capability.name} appears in GitHub evidence.`
            });
        }
    }

    return mappings;
}

const MARKET_FIT_CONFIG_SEED_DATA = [
    { key: "baseline_frequency_weight", valueNumber: 0.65, description: "Weight assigned to listing recurrence in demand scoring." },
    { key: "baseline_importance_weight", valueNumber: 0.35, description: "Weight assigned to average capability importance in demand scoring." },
    { key: "baseline_cache_ttl_hours", valueNumber: 12, description: "Hours a cached market baseline remains fresh." },
    { key: "baseline_default_sample_size", valueNumber: 12, description: "Default number of listings to sample for a role baseline." },
    { key: "baseline_max_sample_size", valueNumber: 25, description: "Maximum number of listings to consider for a role baseline." }
];

const DEV_JOB_FIXTURES: DevFixture[] = [
    {
        role: "Backend Developer",
        seniority: "Fresher",
        listings: [
            {
                source: "dev-fixture",
                externalId: "backend-fresher-1",
                sourceUrl: "https://example.dev/jobs/backend-fresher-1",
                companyName: "StackForge Labs",
                title: "Backend Developer Intern",
                location: "Remote",
                employmentType: "Full-time",
                workMode: "Remote",
                description: "Build REST APIs using Node.js, Express, TypeScript, and PostgreSQL. Work with Prisma migrations, authentication, testing, GitHub Actions, and Docker-based local environments."
            },
            {
                source: "dev-fixture",
                externalId: "backend-fresher-2",
                sourceUrl: "https://example.dev/jobs/backend-fresher-2",
                companyName: "DataHarbor",
                title: "Junior Backend Engineer",
                location: "Bengaluru",
                employmentType: "Full-time",
                workMode: "Hybrid",
                description: "Design backend services with Node.js and PostgreSQL, implement async jobs with BullMQ or queues, add Redis caching, write integration tests, and document architecture decisions."
            },
            {
                source: "dev-fixture",
                externalId: "backend-fresher-3",
                sourceUrl: "https://example.dev/jobs/backend-fresher-3",
                companyName: "SignalMesh",
                title: "Associate Backend Developer",
                location: "Pune",
                employmentType: "Full-time",
                workMode: "Onsite",
                description: "Develop scalable APIs, manage SQL schemas, optimize database queries, add observability and logging, secure endpoints with JWT auth, and collaborate through clean Git workflows."
            },
            {
                source: "dev-fixture",
                externalId: "backend-fresher-4",
                sourceUrl: "https://example.dev/jobs/backend-fresher-4",
                companyName: "QueuePilot",
                title: "Software Engineer, Backend",
                location: "Remote",
                employmentType: "Full-time",
                workMode: "Remote",
                description: "Implement backend microservices in TypeScript, use Redis for caching, process background jobs, write unit and integration tests, and deploy containerized services with Docker."
            }
        ]
    },
    {
        role: "Backend Developer",
        seniority: "0-1 years",
        listings: [
            {
                source: "dev-fixture",
                externalId: "backend-0-1-1",
                sourceUrl: "https://example.dev/jobs/backend-0-1-1",
                companyName: "API Foundry",
                title: "Backend Engineer",
                location: "Remote",
                employmentType: "Full-time",
                workMode: "Remote",
                description: "Ship backend APIs in TypeScript and Node.js, maintain PostgreSQL data models, design queue-backed workflows, improve CI/CD, and own production debugging through logs and metrics."
            },
            {
                source: "dev-fixture",
                externalId: "backend-0-1-2",
                sourceUrl: "https://example.dev/jobs/backend-0-1-2",
                companyName: "LedgerNest",
                title: "Junior Platform Backend Engineer",
                location: "Delhi NCR",
                employmentType: "Full-time",
                workMode: "Hybrid",
                description: "Build internal APIs, manage authentication, caching, Docker deployment, Redis-backed coordination, and testing for critical business workflows."
            },
            {
                source: "dev-fixture",
                externalId: "backend-0-1-3",
                sourceUrl: "https://example.dev/jobs/backend-0-1-3",
                companyName: "OpsOrbit",
                title: "Backend Software Engineer",
                location: "Chennai",
                employmentType: "Full-time",
                workMode: "Onsite",
                description: "Develop modular backend services, improve SQL performance, automate validation in GitHub Actions, write documentation, and collaborate on scalable system design."
            }
        ]
    }
];

function slugify(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

export async function seedMarketFit(): Promise<void> {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/slh_dev";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        for (const capability of CAPABILITY_SEED_DATA) {
            await prisma.capability.upsert({
                where: { slug: capability.slug },
                create: {
                    slug: capability.slug,
                    name: capability.name,
                    category: capability.category,
                    description: capability.description,
                    synonyms: capability.keywords as any,
                    recommendation: capability.recommendation,
                    projectSuggestion: capability.projectSuggestion
                },
                update: {
                    name: capability.name,
                    category: capability.category,
                    description: capability.description,
                    synonyms: capability.keywords as any,
                    recommendation: capability.recommendation,
                    projectSuggestion: capability.projectSuggestion
                }
            });
        }

        for (const config of MARKET_FIT_CONFIG_SEED_DATA) {
            await prisma.marketFitConfig.upsert({
                where: { key: config.key },
                create: config,
                update: config
            });
        }

        await prisma.signalMapping.deleteMany();
        await prisma.signalMapping.createMany({
            data: [...SIGNAL_MAPPING_SEED_DATA, ...buildGithubTermMappings()].map((mapping) => ({
                sourceType: mapping.sourceType,
                matcherType: mapping.matcherType,
                matcherKey: mapping.matcherKey,
                matcherValue: mapping.matcherValue,
                targetCapabilitySlug: mapping.targetCapabilitySlug,
                baseScore: mapping.baseScore,
                scoreMultiplier: mapping.scoreMultiplier,
                confidence: mapping.confidence,
                minThreshold: mapping.minThreshold,
                profileIds: mapping.profileIds as any,
                evidenceTemplate: mapping.evidenceTemplate,
                isActive: true
            }))
        });

        for (const fixture of DEV_JOB_FIXTURES) {
            const clusterKey = `${slugify(fixture.role)}:${slugify(fixture.seniority)}`;
            const cluster = await prisma.jobCluster.upsert({
                where: { clusterKey },
                create: {
                    clusterKey,
                    roleSlug: slugify(fixture.role),
                    roleTitle: fixture.role,
                    seniority: fixture.seniority,
                    sampleSize: fixture.listings.length,
                    lastIngestedAt: new Date()
                },
                update: {
                    roleTitle: fixture.role,
                    seniority: fixture.seniority,
                    sampleSize: fixture.listings.length,
                    lastIngestedAt: new Date()
                }
            });

            for (const listing of fixture.listings) {
                const descriptionRaw = normalizeWhitespace(listing.description);
                const sourceHash = stableHash([
                    listing.source,
                    listing.externalId,
                    listing.sourceUrl,
                    listing.companyName,
                    listing.title,
                    descriptionRaw.toLowerCase()
                ].join("|"));

                await prisma.jobListing.upsert({
                    where: { sourceHash },
                    create: {
                        clusterId: cluster.id,
                        source: listing.source,
                        externalId: listing.externalId,
                        sourceUrl: listing.sourceUrl,
                        companyName: listing.companyName,
                        title: listing.title,
                        location: listing.location,
                        employmentType: listing.employmentType,
                        workMode: listing.workMode,
                        descriptionRaw,
                        descriptionNormalized: descriptionRaw.toLowerCase(),
                        sourceHash,
                        normalizedHash: stableHash(descriptionRaw.toLowerCase())
                    },
                    update: {
                        clusterId: cluster.id,
                        companyName: listing.companyName,
                        title: listing.title,
                        location: listing.location,
                        employmentType: listing.employmentType,
                        workMode: listing.workMode,
                        descriptionRaw,
                        descriptionNormalized: descriptionRaw.toLowerCase(),
                        normalizedHash: stableHash(descriptionRaw.toLowerCase())
                    }
                });
            }
        }

        console.log("Market Fit seed completed.");
    } finally {
        await pool.end();
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedMarketFit().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
