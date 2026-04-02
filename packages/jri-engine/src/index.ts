// ─── Core calculator ───────────────────────────────────────────
export { calculateJRI, calculateJRIBatch, ALGORITHM_VERSION } from './calculator';

// ─── Individual scorers ────────────────────────────────────────
export { scoreDSA } from './scorers/dsa.scorer';
export { scoreProjects, computeProjectsSnapshot } from './scorers/project.scorer';
export { scoreAcademic } from './scorers/academic.scorer';
export { scoreHackathon } from './scorers/hackathon.scorer';

// ─── Derived metrics ──────────────────────────────────────────
export { computeTier, tierColor } from './tiers';
export { computeArchetype } from './archetypes';
export { computeDeveloperAttributes, extractPlatformStats } from './attributes';

// ─── Weights ──────────────────────────────────────────────────
export { normalizeWeights, DEFAULT_WEIGHTS } from './weights';

// ─── Utilities ────────────────────────────────────────────────
export { clamp, round } from './utils';

// ─── Types ────────────────────────────────────────────────────
export type {
    // Inputs
    JRIInput,
    DSAProfileInput,
    ProjectAnalysisInput,
    AcademicInput,
    HackathonInput,
    WeightConfig,
    NormalizedWeights,
    // Outputs
    JRIResult,
    ComponentBreakdown,
    ProjectsSnapshot,
} from './types';
