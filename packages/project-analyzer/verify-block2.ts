import { deriveSignals } from './src/signals/signals';

// 1. Mock the RawMetrics (Matches Block 1's actual output keys)
const mockMetrics: any = {
  total_loc: 5000,
  languages: {
    '.ts': 4000,
    '.prisma': 100,
    '.sql': 200
  },
  dependencies: ['express', 'prisma', 'pg', 'jest'],
  folder_structure: ['src', 'docs'],
  test_file_count: 5,
  commit_span_days: 14,
  ci_config_present: true,
  deploy_config_present: false,
  deploy_config_types: ['docker']
};

// 2. Run the deriver
const signals = deriveSignals(mockMetrics);

// 3. Log results
console.log('\n--- Block 2 Verification Results ---');
console.log('Signals Output:', JSON.stringify(signals, null, 2));

// 4. Automated assertions (Self-test)
const checks = [
  { name: 'has_backend', expected: true },
  { name: 'has_database', expected: true },
  { name: 'has_tests', expected: true },
  { name: 'has_docker', expected: true },
  { name: 'has_ci', expected: true },
  { name: 'is_monorepo', expected: false },
];

console.log('\n--- Assertions ---');
checks.forEach(check => {
  const actual = (signals as any)[check.name];
  const passed = actual === check.expected;
  console.log(`${passed ? '✅' : '❌'} ${check.name}: expected ${check.expected}, got ${actual}`);
});
checks.forEach(check => {
  const actual = (signals as any)[check.name];
  const passed = actual === check.expected;
  console.log(`${passed ? '✅' : '❌'} ${check.name}: expected ${check.expected}, got ${actual}`);
});
checks.forEach(check => {
const actual = (signals as any)[check.name];
  const passed = actual === check.expected;
  console.log(`${passed ? '✅' : '❌'} ${check.name}: expected ${check.expected}, got ${actual}`);
});
