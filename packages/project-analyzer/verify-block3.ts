import { evaluateProfiles } from './src/profiles/profiles';
import { StructuralSignals } from './src/signals/signals';

const signals: StructuralSignals = {
    has_frontend: false,
    has_backend: true,
    has_database: true,
    has_tests: false,
    has_ci: false,
    has_deployment_config: false,
    has_docker: false,
    is_monorepo: false,
    has_documentation: false,
    is_short_timeline: false,
    has_heavy_framework: false,
    has_ml_components: false,
    has_notebooks: false,
    is_minimal: false,
    is_library_package: false,
    is_cli_tool: false,
    is_cli_entrypoint: false
};

const results = evaluateProfiles(signals);

results.forEach(r => {
    console.log(`Profile: ${r.displayName} (${r.profileId})`);
    console.log(`  Score:  ${r.fitnessScore.toFixed(2)}`);
    console.log(`  Status: ${r.status}`);
    console.log(`  Matched: ${r.matchedSignals.join(', ')}`);
    console.log(`  Missing: ${r.missingSignals.join(', ')}\n`);
});

const backendResult = results.find(r => r.profileId === 'backend_api');
const fullstackResult = results.find(r => r.profileId === 'production_web_app');
const frontendResult = results.find(r => r.profileId === 'frontend_app');

if (backendResult?.status !== 'active') throw new Error('Backend should be active');
if (fullstackResult!.fitnessScore <= 0) throw new Error('Fullstack should have a positive score');
if (frontendResult?.status !== 'rejected') throw new Error('Frontend should be rejected');

console.log("✅ Verification passed!");
