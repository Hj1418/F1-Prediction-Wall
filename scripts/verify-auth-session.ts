/**
 * Authentication Regression Test Suite
 * Verifies unified authentication flow, admin session token generation,
 * failed login error handling, and authorization guards for protected pages.
 */
import { mockApi } from '../src/services/mockApi';
import { authService, hashPassword } from '../src/services/authService';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    failCount++;
  }
}

async function runTests() {
  console.log('🏎️ Starting Authentication & Session Architecture Regression Suite...\n');

  // TEST 1: Codebase declaration verification for createAdminSessionToken
  console.log('Test 1: Backend Declaration Verification for createAdminSessionToken');
  const codeGsPath = resolve(process.cwd(), 'backend/Code.gs');
  const codeGsContent = readFileSync(codeGsPath, 'utf8');

  const hasDeclaration = codeGsContent.includes('function createAdminSessionToken(userObj)');
  assert(hasDeclaration, 'backend/Code.gs declares function createAdminSessionToken(userObj)');

  const hasVerifyCaller = codeGsContent.includes('function verifyAdminCaller(payload)');
  assert(hasVerifyCaller, 'backend/Code.gs declares function verifyAdminCaller(payload)');

  const hasSecretResolver = codeGsContent.includes('function getSessionSigningSecret()');
  assert(hasSecretResolver, 'backend/Code.gs declares function getSessionSigningSecret()');

  // TEST 2: Successful admin login creates valid session with verified authToken
  console.log('\nTest 2: Successful Admin Login Session Creation');
  const adminUser = await authService.login('harsh');
  assert(adminUser.role === 'admin', 'Admin account retains role === "admin"');
  assert(Boolean(adminUser.authToken && adminUser.authToken.length > 0), 'Admin userObj contains non-empty authToken');
  assert(adminUser.userId === 'user_harsh', 'Admin user ID resolved to user_harsh');

  // Verify token format (HS256 signed JWT structure: header.payload.signature)
  const tokenParts = (adminUser.authToken || '').split('.');
  assert(tokenParts.length >= 2, 'Admin authToken conforms to structured signed token format');

  // TEST 3: Successful regular user login
  console.log('\nTest 3: Successful Regular User Login Session');
  const regularUser = await authService.login('sharmavishnur0');
  assert(regularUser.role === 'user', 'Regular racer retains role === "user"');
  assert(regularUser.userId === 'usr_sharmavishnur0_6cf234bf', 'Regular racer ID resolved to usr_sharmavishnur0_6cf234bf');

  // TEST 4: Failed login displays appropriate error message
  console.log('\nTest 4: Failed Login Credential Error Handling');

  // 4a. Wrong password on password-enabled account
  await authService.register({
    displayName: 'Test Racer Auth',
    username: 'test_auth_racer',
    email: 'test_auth_racer@grid.test',
    password: 'correct_password_123',
    favouriteDriver: 'norris',
  });

  let wrongPassError = '';
  try {
    await authService.login('test_auth_racer', 'completely_wrong_password');
  } catch (err: any) {
    wrongPassError = err.message || '';
  }
  assert(wrongPassError.includes('Invalid password'), `Wrong password produces clean error: "${wrongPassError}"`);

  // 4b. Non-existent racer tag/email
  let missingUserError = '';
  try {
    await authService.login('non_existent_ghost_racer_99999', 'any_password');
  } catch (err: any) {
    missingUserError = err.message || '';
  }
  assert(missingUserError.includes('No racer found'), `Non-existent user produces clean error: "${missingUserError}"`);

  // 4c. Empty identifier
  let emptyIdError = '';
  try {
    await authService.login('');
  } catch (err: any) {
    emptyIdError = err.message || '';
  }
  assert(emptyIdError.includes('required'), 'Empty identifier rejected with required field error');

  // TEST 5: Protected pages & admin endpoint authorization
  console.log('\nTest 5: Protected Page & Admin Endpoint Authorization');

  // 5a. Regular user is rejected from admin directory
  let regularUserRejected = false;
  try {
    await mockApi.getAdminUsers('usr_sharmavishnur0_6cf234bf');
  } catch (err: any) {
    regularUserRejected = err.message.includes('Forbidden') || err.message.includes('privileges');
  }
  assert(regularUserRejected, 'Unauthorized regular user is forbidden from admin user directory');

  // 5b. Unauthenticated / anonymous caller is rejected
  let unauthRejected = false;
  try {
    await mockApi.getAdminUsers('');
  } catch (err: any) {
    unauthRejected = err.message.includes('Forbidden') || err.message.includes('Unauthorized') || err.message.includes('privileges');
  }
  assert(unauthRejected, 'Unauthenticated caller is strictly forbidden from admin user directory');

  // 5c. Verified admin caller succeeds
  const adminDirectory = await mockApi.getAdminUsers('user_harsh');
  assert(Array.isArray(adminDirectory) && adminDirectory.length > 0, 'Verified administrator receives user directory');

  // TEST 6: Google Sign-in flow session verification
  console.log('\nTest 6: Google Sign-In Authentication Flow');

  // 6a. Admin user Google sign-in
  const googleAdmin = await mockApi.googleLogin({
    email: 'harsh@community.f1',
    displayName: 'Harsh Jalnekar',
  });
  assert(googleAdmin.role === 'admin', 'Google sign-in for admin retains admin role');
  assert(Boolean(googleAdmin.authToken && googleAdmin.authToken.length > 0), 'Google sign-in for admin issues verified authToken');

  // 6b. Regular user Google sign-in
  const googleRegular = await mockApi.googleLogin({
    email: 'alex@community.f1',
    displayName: 'Alex Thorne',
  });
  assert(googleRegular.role === 'user', 'Google sign-in for regular racer assigns user role');

  console.log(`\n========================================`);
  console.log(`Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount === 0) {
    console.log('🏆 ALL AUTHENTICATION & SESSION REGRESSION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner crash:', err);
  process.exit(1);
});
