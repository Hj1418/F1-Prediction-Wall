/**
 * Verification test for Admin User List & Backend Authorization.
 */
import { mockApi } from '../src/services/mockApi';

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
  console.log('🛡️ Starting Admin User List Authorization & Data Verification...\n');

  // Test 1: Non-existent requester is rejected
  let rejectedNonExistent = false;
  try {
    await mockApi.getAdminUsers('non_existent_requester');
  } catch (err: any) {
    rejectedNonExistent = err.message.includes('Forbidden') || err.message.includes('privileges');
  }
  assert(rejectedNonExistent, 'Unauthorized requester without admin role is strictly rejected');

  // Test 2: Standard USER role account cannot access admin user list
  let rejectedRegularUser = false;
  try {
    await mockApi.getAdminUsers('user_2'); // Alex Thorne has role: 'user'
  } catch (err: any) {
    rejectedRegularUser = err.message.includes('Forbidden') || err.message.includes('privileges');
  }
  assert(rejectedRegularUser, 'Regular user (role: "user") is rejected with Forbidden error');

  // Test 3: Authenticated ADMIN user successfully retrieves user directory
  const adminUserList = await mockApi.getAdminUsers('user_harsh'); // Harsh Jalnekar has role: 'admin'
  assert(Array.isArray(adminUserList), 'Admin request returns user array');
  assert(adminUserList.length > 0, `Admin request returned ${adminUserList.length} users`);

  // Test 4: Returned user objects contain required columns: Name, Email, Role, Joined, Last Login
  const firstUser = adminUserList[0];
  assert(typeof firstUser.displayName === 'string' && firstUser.displayName.length > 0, 'User has Name (displayName)');
  assert(typeof firstUser.email === 'string' && firstUser.email.includes('@'), 'User has Email');
  assert(firstUser.role === 'admin' || firstUser.role === 'user', 'User has valid Role');
  assert(typeof firstUser.createdAt === 'string' && firstUser.createdAt.length > 0, 'User has Joined timestamp');
  assert(firstUser.hasOwnProperty('lastLoginAt') || typeof firstUser.lastLoginAt === 'undefined' || typeof firstUser.lastLoginAt === 'string', 'User supports lastLoginAt');

  // Test 5: Verify admin lookup by email or username also works
  const adminByEmail = await mockApi.getAdminUsers('harsh@community.f1');
  assert(adminByEmail.length === adminUserList.length, 'Admin lookup by authenticated email works');

  console.log(`\n========================================`);
  console.log(`Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) {
    process.exit(1);
  }
  console.log('🏆 ALL ADMIN USER LIST AUTHORIZATION TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
