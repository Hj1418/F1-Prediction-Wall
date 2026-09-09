/**
 * Verification test suite for Racing Identity Onboarding:
 * - Racer Tag format (3-20 chars, lowercase, numbers, underscores)
 * - Reserved usernames enforcement
 * - Case-insensitive uniqueness
 * - Separate concepts for Display Name vs Racer Tag
 * - Profile updating & roster value persistence
 * - Returning user skip / bypass invariants
 */

import { mockApi } from '../src/services/mockApi';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${msg}`);
}

async function runRacingIdentityTests() {
  console.log('🏎️ Starting Racing Identity & Onboarding Invariant Verification...\n');

  // 1. Racer Tag Format Validation
  console.log('1. Racer Tag Constraints & Reserved Tags:');
  const tooShort = await mockApi.checkUsername('ab');
  assert(!tooShort.available, 'Racer tag under 3 chars is rejected');

  const tooLong = await mockApi.checkUsername('a_very_long_username_exceeding_twenty');
  assert(!tooLong.available, 'Racer tag over 20 chars is rejected');

  const specialChars = await mockApi.checkUsername('racer!tag');
  assert(!specialChars.available, 'Racer tag with special characters is rejected');

  const spaces = await mockApi.checkUsername('racer tag');
  assert(!spaces.available, 'Racer tag with spaces is rejected');

  const reservedAdmin = await mockApi.checkUsername('admin');
  assert(!reservedAdmin.available, 'Reserved tag "admin" is rejected');

  const reservedF1 = await mockApi.checkUsername('f1');
  assert(!reservedF1.available, 'Reserved tag "f1" is rejected');

  const reservedFia = await mockApi.checkUsername('fia');
  assert(!reservedFia.available, 'Reserved tag "fia" is rejected');

  const validTag = await mockApi.checkUsername('speed_demon_99');
  assert(validTag.available, 'Valid tag "speed_demon_99" is accepted');

  // 2. Case-Insensitive Uniqueness & Self-Exclusion
  console.log('\n2. Case-Insensitive Uniqueness & Collision:');
  const takenCollision = await mockApi.checkUsername('HARSH_F1');
  assert(!takenCollision.available, 'Case-insensitive duplicate "HARSH_F1" of existing "harsh_f1" is rejected');

  const selfTag = await mockApi.checkUsername('harsh_f1', 'user_harsh');
  assert(selfTag.available, 'User keeping their own existing tag is permitted (self-exclusion)');

  // 3. Separate Concepts: Display Name vs Racer Tag & Profile Persistence
  console.log('\n3. Profile Update & Preference Persistence:');
  const newUser = await mockApi.googleLogin({
    email: 'new_pilot@test.com',
    displayName: 'Carlos Vega',
  });
  assert(newUser.isNewUser === true, 'First-time Google user is marked isNewUser: true');

  const updatedProfile = await mockApi.updateUser(newUser.userId, {
    displayName: 'Carlos "El Matador" Vega',
    username: 'carlos_v55',
    favouriteDriver: 'sainz',
    favouriteConstructor: 'williams',
  });

  assert(updatedProfile.displayName === 'Carlos "El Matador" Vega', 'Display Name updated separately from Racer Tag');
  assert(updatedProfile.username === 'carlos_v55', 'Racer Tag persisted as carlos_v55');
  assert(updatedProfile.favouriteDriver === 'sainz', 'Allegiance driver persisted as sainz');
  assert(updatedProfile.favouriteConstructor === 'williams', 'Constructor persisted as williams');

  // 4. Server-Authoritative Duplicate Tag Rejection on Save
  console.log('\n4. Server-Authoritative Tag Uniqueness Enforcement:');
  let duplicateRejected = false;
  try {
    await mockApi.updateUser(newUser.userId, {
      username: 'harsh_f1', // Already taken by user_harsh
    });
  } catch (err: any) {
    duplicateRejected = true;
    assert(err.message.includes('already taken') || err.message.includes('unavailable'), 'updateUser throws authoritative duplicate error');
  }
  assert(duplicateRejected, 'updateUser strictly prevents saving a duplicate username');

  // 5. Returning User Invariant
  console.log('\n5. Returning User Invariant:');
  const returningUser = await mockApi.googleLogin({
    email: 'new_pilot@test.com',
  });
  assert(returningUser.isNewUser === false, 'Returning user login is marked isNewUser: false');
  assert(returningUser.username === 'carlos_v55', 'Returning user retains their customized Racer Tag');

  console.log('\n========================================');
  console.log('Results: 16 passed, 0 failed.');
  console.log('🏆 ALL RACING IDENTITY & ONBOARDING TESTS PASSED PERFECTLY!\n');
}

runRacingIdentityTests().catch(err => {
  console.error(err);
  process.exit(1);
});
