"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveSignals = deriveSignals;
function deriveSignals(metrics) {
    var dependencies = (metrics === null || metrics === void 0 ? void 0 : metrics.dependencies) || [];
    var languages = (metrics === null || metrics === void 0 ? void 0 : metrics.languages) || {};
    var folder_structure = (metrics === null || metrics === void 0 ? void 0 : metrics.folder_structure) || [];
    var deploy_config_types = (metrics === null || metrics === void 0 ? void 0 : metrics.deploy_config_types) || [];
    var hasDependency = function (deps) { return deps.some(function (d) { return dependencies.includes(d); }); };
    var htmlLoc = languages['.html'] || 0;
    var cssLoc = languages['.css'] || 0;
    var has_frontend = hasDependency(['react', 'vue', 'next', 'svelte', 'angular']) || (htmlLoc + cssLoc) > 200;
    var has_backend = hasDependency(['express', 'nestjs', 'fastify', 'django', 'flask', 'spring']);
    var sqlLoc = languages['.sql'] || 0;
    var prismaLoc = languages['.prisma'] || 0;
    var has_database = hasDependency(['prisma', 'mongoose', 'typeorm', 'pg', 'sequelize']) || sqlLoc > 0 || prismaLoc > 0;
    var test_file_count = (metrics === null || metrics === void 0 ? void 0 : metrics.test_file_count) || 0;
    var has_tests = (test_file_count > 0) || hasDependency(['jest', 'mocha', 'vitest', 'cypress', 'pytest']);
    var has_ci = (metrics === null || metrics === void 0 ? void 0 : metrics.ci_config_present) === true;
    var has_docker = deploy_config_types.some(function (d) { return d.toLowerCase() === 'docker' || d.toLowerCase() === 'docker compose'; });
    var is_monorepo = (folder_structure.includes('apps') && folder_structure.includes('packages')) || hasDependency(['lerna', 'turbo']);
    var mdLoc = languages['.md'] || 0;
    var has_documentation = mdLoc > 50 || folder_structure.includes('docs');
    var commit_span_days = (metrics === null || metrics === void 0 ? void 0 : metrics.commit_span_days) || 0;
    var is_short_timeline = commit_span_days < 7;
    var has_heavy_framework = hasDependency(['next', 'nestjs', 'angular', 'django', 'spring']);
    return {
        has_frontend: has_frontend,
        has_backend: has_backend,
        has_database: has_database,
        has_tests: has_tests,
        has_ci: has_ci,
        has_docker: has_docker,
        is_monorepo: is_monorepo,
        has_documentation: has_documentation,
        is_short_timeline: is_short_timeline,
        has_heavy_framework: has_heavy_framework
    };
}
