import { execSync } from 'child_process';

console.log('🚀 Running Full Suite: Scoring Engine + Live Schedule Sync + Beta Core Tests...\n');

try {
  execSync('npx tsx scripts/verify-scoring.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-sync.ts', { stdio: 'inherit' });
  execSync('node scripts/verify-all-circuits.js', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-auth.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-admin-users.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-beta-core.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-racing-identity.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-avatar.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-motorsport-foundation.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8a.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8b.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8b2.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8c.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8d.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8e.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase8f.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase9.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase9-2.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase9-3.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/verify-phase10.ts', { stdio: 'inherit' });
  console.log('🏆 ALL UNIT, INTEGRATION, AUTH, ADMIN, BETA, RACING IDENTITY, AVATAR, FOUNDATION, PHASE 8A-8F, 9.1-9.3 & PHASE 10 TESTS PASSED PERFECTLY!\n');
} catch (err) {
  console.error('Test execution failed');
  process.exit(1);
}
