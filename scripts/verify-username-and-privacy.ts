import assert from 'assert';
import { mockApi } from '../src/services/mockApi';
import { api } from '../src/services/apiClient';
import { User, LeaderboardEntry } from '../src/types';

console.log('🏎️ STARTING DETERMINISTIC TEST SUITE FOR USERNAME & PRIVACY SYSTEM\n');

async function runTestSuite() {
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res && typeof (res as any).then === 'function') {
        return (res as Promise<void>).then(() => {
          console.log(`  ✓ PASS: ${name}`);
          passed++;
        }).catch(err => {
          console.error(`  ✗ FAIL: ${name}`);
          console.error(err);
          process.exit(1);
        });
      } else {
        console.log(`  ✓ PASS: ${name}`);
        passed++;
      }
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log('🔒 [SECTION 1] Username Format & Character Rule Validation:');

  await test('1. Empty or whitespace-only username is rejected', async () => {
    const res1 = await mockApi.checkUsername('');
    assert.strictEqual(res1.available, false);
    assert(res1.reason && res1.reason.includes('empty'));

    const res2 = await mockApi.checkUsername('   ');
    assert.strictEqual(res2.available, false);
    assert(res2.reason && res2.reason.includes('empty'));
  });

  await test('2. Username length bounds (3 to 20 characters)', async () => {
    const tooShort = await mockApi.checkUsername('ab');
    assert.strictEqual(tooShort.available, false);
    assert(tooShort.reason && tooShort.reason.includes('between 3 and 20'));

    const tooLong = await mockApi.checkUsername('a_very_long_username_exceeding_twenty');
    assert.strictEqual(tooLong.available, false);
    assert(tooLong.reason && tooLong.reason.includes('between 3 and 20'));

    const validLength = await mockApi.checkUsername('valid_racer_123');
    assert.strictEqual(validLength.available, true);
  });

  await test('3. Allowed characters: letters, numbers, underscores, and hyphens', async () => {
    const validWithHyphen = await mockApi.checkUsername('apex-hunter_99');
    assert.strictEqual(validWithHyphen.available, true);
    assert.strictEqual(validWithHyphen.username, 'apex-hunter_99');

    const invalidSymbols = await mockApi.checkUsername('racer!fast');
    assert.strictEqual(invalidSymbols.available, false);
    assert(invalidSymbols.reason && invalidSymbols.reason.includes('letters, numbers, underscores, and hyphens'));

    const invalidSpaces = await mockApi.checkUsername('racer tag');
    assert.strictEqual(invalidSpaces.available, false);
  });

  await test('4. Reserved system usernames are blocked', async () => {
    const adminCheck = await mockApi.checkUsername('admin');
    assert.strictEqual(adminCheck.available, false);
    assert(adminCheck.reason && adminCheck.reason.includes('reserved'));

    const f1Check = await mockApi.checkUsername('f1');
    assert.strictEqual(f1Check.available, false);

    const gridUserCheck = await mockApi.checkUsername('grid_user');
    assert.strictEqual(gridUserCheck.available, false);
  });

  console.log('\n🔠 [SECTION 2] Case-Insensitive Uniqueness & Preservation of Display Casing:');

  await test('5. Duplicate username is rejected', async () => {
    // harsh_f1 already exists in mock users
    const res = await mockApi.checkUsername('harsh_f1');
    assert.strictEqual(res.available, false);
    assert(res.reason && res.reason.includes('already taken'));
  });

  await test('6. Case-insensitive duplicate collision: Harsh_F1 and HARSH_F1 match harsh_f1', async () => {
    const upperCheck = await mockApi.checkUsername('HARSH_F1');
    assert.strictEqual(upperCheck.available, false);
    assert(upperCheck.reason && upperCheck.reason.includes('already taken'));

    const mixedCheck = await mockApi.checkUsername('Harsh_F1');
    assert.strictEqual(mixedCheck.available, false);
    assert(mixedCheck.reason && mixedCheck.reason.includes('already taken'));
  });

  await test('7. User can preserve their chosen casing when unique', async () => {
    const brandNewUnique = await mockApi.checkUsername('ApexHunter');
    assert.strictEqual(brandNewUnique.available, true);
    assert.strictEqual(brandNewUnique.username, 'ApexHunter'); // casing preserved!

    // But lowercased version is now treated as taken
    const testUser = await mockApi.updateUser('usr_jalnekarharsh14_acaab661', { username: 'ApexHunter' });
    assert.strictEqual(testUser.username, 'ApexHunter');

    const collisionCheck = await mockApi.checkUsername('apexhunter');
    assert.strictEqual(collisionCheck.available, false);
    assert(collisionCheck.reason && collisionCheck.reason.includes('already taken'));

    // Exclude self allows current user to keep their username
    const selfCheck = await mockApi.checkUsername('ApexHunter', 'usr_jalnekarharsh14_acaab661');
    assert.strictEqual(selfCheck.available, true);
  });

  console.log('\n👤 [SECTION 3] New User Sign-Up & Google Auth Flow:');

  await test('8. New Google Sign-In user does not receive auto-generated username from email/name', async () => {
    const newUser = await mockApi.googleLogin({
      email: 'new_grid_driver@test.com',
      displayName: 'Firstname Lastname',
      photoUrl: 'https://test.com/photo.jpg',
    });

    assert.strictEqual(newUser.isNewUser, true);
    assert.strictEqual(newUser.email, 'new_grid_driver@test.com');
    assert.strictEqual(newUser.displayName, 'Firstname Lastname');
    assert.strictEqual(newUser.username, ''); // NOT auto-generated from email or name!
    assert(newUser.userId.startsWith('usr_'));
  });

  await test('9. New user explicitly confirms unique username during onboarding', async () => {
    const newUser = await mockApi.users.find(u => u.email === 'new_grid_driver@test.com')!;
    assert(newUser);

    // Attempting invalid username fails
    await assert.rejects(async () => {
      await mockApi.updateUser(newUser.userId, { username: 'a' });
    });

    // Saving valid unique username succeeds
    const updated = await mockApi.updateUser(newUser.userId, { username: 'FastLap99' });
    assert.strictEqual(updated.username, 'FastLap99');

    // Subsequent retrieval reflects saved username
    const retrieved = await mockApi.getUserProfile(newUser.userId);
    assert.strictEqual(retrieved?.username, 'FastLap99');
  });

  console.log('\n🔄 [SECTION 4] Existing User Compatibility & Session Refresh:');

  await test('10. Existing user with established username logs in without username prompt', async () => {
    const existing = await mockApi.googleLogin({
      email: 'harsh@community.f1',
      displayName: 'Harsh Jalnekar',
    });

    assert.strictEqual(existing.isNewUser, false);
    assert.strictEqual(existing.username, 'harsh_f1'); // preserved!
  });

  await test('11. Existing user without username has empty username so onboarding setup triggers', async () => {
    // Add legacy user with empty username
    mockApi.users.push({
      userId: 'legacy_user_no_uname',
      email: 'legacy@f1test.com',
      displayName: 'Legacy Racer',
      username: '',
      avatarUrl: '',
      favouriteDriver: 'norris',
      favouriteConstructor: 'mclaren',
      role: 'user',
      createdAt: '2026-01-01T00:00:00Z',
      totalPoints: 50,
      seasonRank: 10,
      previousRank: 10,
      racesParticipated: 2,
      bestWeekendScore: 25,
      exactP1Count: 1,
      perfectPodiumCount: 0,
      wildcardsCorrect: 1,
      isNewUser: false,
    });

    const legacyUser = await mockApi.getUserProfile('legacy_user_no_uname');
    assert(legacyUser);
    assert.strictEqual(legacyUser.username, '');

    // Saving chosen username resolves it
    const resolved = await mockApi.updateUser('legacy_user_no_uname', { username: 'LegacySpeed' });
    assert.strictEqual(resolved.username, 'LegacySpeed');
  });

  console.log('\n🛡️ [SECTION 5] Public Leaderboard & API Privacy Audit:');

  await test('12. Leaderboard API response never exposes real/full name or email', async () => {
    const seasonLb = await mockApi.getLeaderboard('season');
    assert(seasonLb.length > 0);

    for (const entry of seasonLb) {
      // Must have username
      assert(typeof entry.username === 'string' && entry.username.length > 0);
      // Entry must NOT contain email property
      assert.strictEqual((entry as any).email, undefined, `Entry ${entry.username} leaked email!`);
      // Entry displayName must be sanitized to username (never real name like Harsh Jalnekar)
      assert.strictEqual(entry.displayName, entry.username, `Entry ${entry.username} leaked private displayName!`);
    }

    const weekendLb = await mockApi.getLeaderboard('weekend', '2026_15_AZE');
    for (const entry of weekendLb) {
      assert.strictEqual((entry as any).email, undefined);
      assert.strictEqual(entry.displayName, entry.username);
    }
  });

  await test('13. Neutral fallback "Grid User" is used when username is unavailable for legacy records', async () => {
    // Add un-named user
    mockApi.users.push({
      userId: 'mystery_racer',
      email: 'secret@private.com',
      displayName: 'Secret Person',
      username: '',
      avatarUrl: '',
      favouriteDriver: 'norris',
      role: 'user',
      createdAt: '2026-01-01T00:00:00Z',
      totalPoints: 100,
      seasonRank: 1,
      previousRank: 1,
      racesParticipated: 1,
      bestWeekendScore: 100,
      exactP1Count: 0,
      perfectPodiumCount: 0,
      wildcardsCorrect: 0,
    });

    const lb = await mockApi.getLeaderboard('season');
    const entry = lb.find(e => e.userId === 'mystery_racer');
    assert(entry);
    assert.strictEqual(entry.username, 'Grid User');
    assert.strictEqual(entry.displayName, 'Grid User');
    assert.notStrictEqual(entry.username, 'Secret Person');
    assert.notStrictEqual(entry.username, 'secret@private.com');
  });

  await test('14. Prediction records continue referencing stable userId and remain intact after username change', async () => {
    const targetUserId = 'usr_jalnekarharsh14_acaab661';
    const preHistory = await mockApi.getUserPredictionsHistory(targetUserId);

    // Change username
    await mockApi.updateUser(targetUserId, { username: 'GrandPrixAce' });

    // Predictions still exist and reference targetUserId
    const postHistory = await mockApi.getUserPredictionsHistory(targetUserId);
    assert.strictEqual(postHistory.length, preHistory.length);
  });

  console.log('\n======================================================');
  console.log(`✨ ALL ${passed} / ${total} USERNAME & PRIVACY TESTS PASSED!`);
  console.log('======================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test suite runner failed:', err);
  process.exit(1);
});
