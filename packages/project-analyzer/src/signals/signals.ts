import { RawMetrics } from '../metrics/metrics';

export interface StructuralSignals {
    has_frontend: boolean;
    has_backend: boolean;
    has_database: boolean;
    has_tests: boolean;
    has_ci: boolean;
    has_docker: boolean;
    is_monorepo: boolean;
    has_documentation: boolean;
    is_short_timeline: boolean;
    has_heavy_framework: boolean;
}

export function deriveSignals(metrics: RawMetrics): StructuralSignals {
    const dependencies = metrics?.dependencies || [];
    const languages = metrics?.languages || {};
    const folder_structure = metrics?.folder_structure || [];
    const deploy_config_types = metrics?.deploy_config_types || [];

    const hasDependency = (deps: string[]) => deps.some(d => dependencies.includes(d));

    const htmlLoc = languages['.html'] || 0;
    const cssLoc = languages['.css'] || 0;
    const has_frontend = hasDependency(['react', 'vue', 'next', 'svelte', 'angular']) || (htmlLoc + cssLoc) > 200;

    const has_backend = hasDependency(['express', 'nestjs', 'fastify', 'django', 'flask', 'spring']);

    const sqlLoc = languages['.sql'] || 0;
    const prismaLoc = languages['.prisma'] || 0;
    const has_database = hasDependency(['prisma', 'mongoose', 'typeorm', 'pg', 'sequelize']) || sqlLoc > 0 || prismaLoc > 0;

    const test_file_count = metrics?.test_file_count || 0;
    const has_tests = (test_file_count > 0) || hasDependency(['jest', 'mocha', 'vitest', 'cypress', 'pytest']);

    const has_ci = metrics?.ci_config_present === true;

    const has_docker = deploy_config_types.some(d => d.toLowerCase() === 'docker' || d.toLowerCase() === 'docker compose');

    const is_monorepo = (folder_structure.includes('apps') && folder_structure.includes('packages')) || hasDependency(['lerna', 'turbo']);

    const mdLoc = languages['.md'] || 0;
    const has_documentation = mdLoc > 50 || folder_structure.includes('docs');

    const commit_span_days = metrics?.commit_span_days || 0;
    const is_short_timeline = commit_span_days < 7;

    const has_heavy_framework = hasDependency(['next', 'nestjs', 'angular', 'django', 'spring']);

    return {
        has_frontend,
        has_backend,
        has_database,
        has_tests,
        has_ci,
        has_docker,
        is_monorepo,
        has_documentation,
        is_short_timeline,
        has_heavy_framework
    };
}
