/**
 * Verification script for F1 Prediction League Authentication & User Profile features.
 */
import { authService, hashPassword } from '../src/services/authService';
import { getInitials } from '../src/utils/getInitials';
import { INITIAL_USERS } from '../src/services/mockData';

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
  console.log('🏎️ Starting Authentication & User Profile Logic Verification...\n');

  // Test 1: Initials Generation
  console.log('Testing Initials Avatar Logic:');
  assert(getInitials('Harsh Jalnekar') === 'H', 'Harsh Jalnekar -> H');
  assert(getInitials('Alex Thorne') === 'A', 'Alex Thorne -> A');
  assert(getInitials('Max Verstappen') === 'M', 'Max Verstappen -> M');
  assert(getInitials('Charles Leclerc') === 'C', 'Charles Leclerc -> C');
  assert(getInitials('Lewis') === 'L', 'Single word Lewis -> L');
  assert(getInitials('') === 'U', 'Empty string -> U');

  // Test 2: Password hashing
  console.log('\nTesting Password Hashing:');
  const hash1 = await hashPassword('mySecurePass123');
  const hash2 = await hashPassword('mySecurePass123');
  const hash3 = await hashPassword('differentPass');
  assert(hash1.length > 0, 'Password hash is non-empty');
  assert(hash1 === hash2, 'Password hash is deterministic');
  assert(hash1 !== hash3, 'Different passwords yield different hashes');

  // Test 3: Login authentication with demo users
  console.log('\nTesting Login Service:');
  const userByTag = await authService.login('harsh');
  assert(userByTag.displayName === 'Harsh Jalnekar', 'Login by quick tag "harsh" returns Harsh Jalnekar');

  const userByFullTag = await authService.login('harsh_f1');
  assert(userByFullTag.userId === 'user_harsh', 'Login by full username "harsh_f1" succeeds');

  const userByEmail = await authService.login('harsh@community.f1');
  assert(userByEmail.userId === 'user_harsh', 'Login by email "harsh@community.f1" succeeds');

  let failedNonExistent = false;
  try {
    await authService.login('non_existent_racer_xyz');
  } catch (e: any) {
    failedNonExistent = e.message.includes('No racer found');
  }
  assert(failedNonExistent, 'Login correctly rejects non-existent racer');

  // Test 4: Registration
  console.log('\nTesting User Registration:');
  const newRacer = await authService.register({
    displayName: 'Carlos Sainz Fan',
    username: 'smooth_operator',
    email: 'carlos.fan@grid.f1',
    password: 'vivid_telemetry_2026',
    favouriteDriver: 'sainz',
    favouriteConstructor: 'williams',
  });
  assert(newRacer.displayName === 'Carlos Sainz Fan', 'Registered racer has correct display name');
  assert(newRacer.username === 'smooth_operator', 'Registered racer has sanitized username');
  assert(newRacer.role === 'user', 'Registered racer is safely assigned "user" role');
  assert(newRacer.favouriteDriver === 'sainz', 'Registered racer favourite driver is saved');

  // Test login with newly registered racer
  const loggedInNewRacer = await authService.login('smooth_operator');
  assert(loggedInNewRacer.email === 'carlos.fan@grid.f1', 'Newly registered user can immediately log in');

  // Test 5: Validation errors on registration
  let failedInvalidEmail = false;
  try {
    await authService.register({
      displayName: 'Bad Email User',
      username: 'bad_email',
      email: 'not-an-email',
      favouriteDriver: 'leclerc',
    });
  } catch (e: any) {
    failedInvalidEmail = e.message.includes('valid email');
  }
  assert(failedInvalidEmail, 'Registration rejects invalid email format');

  let failedShortUsername = false;
  try {
    await authService.register({
      displayName: 'Short Tag',
      username: 'ab',
      email: 'short@grid.f1',
      favouriteDriver: 'leclerc',
    });
  } catch (e: any) {
    failedShortUsername = e.message.includes('at least 3');
  }
  assert(failedShortUsername, 'Registration rejects username under 3 characters');

  console.log(`\n========================================`);
  console.log(`Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount === 0) {
    console.log('🏆 ALL AUTHENTICATION & INITIALS TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during auth tests:', err);
  process.exit(1);
});
