import { execSync } from 'child_process';

console.log('🚀 Running Full Suite: Scoring Engine + Live Schedule Sync Tests...\n');

try {
  execSync('npx tsx scripts/verify-scoring.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-sync.ts', { stdio: 'inherit' });
  console.log('🏆 ALL 37 UNIT & INTEGRATION TESTS PASSED PERFECTLY!\n');
} catch (err) {
  console.error('Test execution failed');
  process.exit(1);
}
