import { execSync } from 'child_process';

console.log('🚀 Running Full Suite: Scoring Engine + Live Schedule Sync + Beta Core Tests...\n');

try {
  execSync('npx tsx scripts/verify-scoring.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-sync.ts', { stdio: 'inherit' });
  execSync('node scripts/verify-all-circuits.js', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-auth.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-admin-users.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-beta-core.ts', { stdio: 'inherit' });
  console.log('🏆 ALL 121 UNIT, INTEGRATION, AUTH, ADMIN, BETA INVARIANTS & ASSET TESTS PASSED PERFECTLY!\n');
} catch (err) {
  console.error('Test execution failed');
  process.exit(1);
}
