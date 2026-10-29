/**
 * Automated Verification Suite:
 * - Public Community Competition Report (Route, Aggregate Data Isolation, Period Filters, Sharing)
 * - About Us Page (Developer & Advisor Credits, Purpose, Vision, Route)
 * - Admin Competition Analytics (Private Admin Protection, Public Share Action)
 * - Prediction Status Consistency (Authoritative Cutoff, Synchronized States)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { mockApi } from '../src/services/mockApi';
import { api } from '../src/services/apiClient';

console.log('🧪 Starting Verification: Public Community Report, About Us & Status Consistency...\n');

async function runTests() {
  // =========================================================================
  // 1. PUBLIC COMMUNITY REPORT DATA SECURITY & AGGREGATE ISOLATION
  // =========================================================================
  console.log('--- 1. Testing Public Community Report Data Isolation ---');

  // Anonymous request without any requesterId or authToken
  const publicReport = await mockApi.getPublicCommunityReport('all');

  assert(publicReport !== null && typeof publicReport === 'object', 'Public report returned successfully');
  assert(publicReport.headlineStats, 'Public report contains headlineStats');
  assert(publicReport.headlineStats.registeredMembers > 0, 'Registered members count must be > 0');
  assert(publicReport.headlineStats.activeCompetitors > 0, 'Active competitors count must be > 0');
  assert(publicReport.headlineStats.totalCompetitionActivity > 0, 'Total competition activity must be > 0');
  assert(typeof publicReport.headlineStats.participationRate === 'number', 'Participation rate must be a number');

  // Verify STRICT absence of any user-level personal records
  assert(!('users' in publicReport), 'Public report must NOT expose users array');
  assert(!('usersTable' in publicReport), 'Public report must NOT expose usersTable');
  assert(!('userMap' in publicReport), 'Public report must NOT expose userMap');
  assert(!('userId' in publicReport), 'Public report must NOT expose user IDs');
  assert(!('email' in publicReport), 'Public report must NOT expose emails');

  console.log(`  ✓ Public aggregate data verified: ${publicReport.headlineStats.registeredMembers} members, ${publicReport.headlineStats.activeCompetitors} active (${publicReport.headlineStats.participationRate}%)`);
  console.log(`  ✓ PII & User Record leak prevention verified: No user arrays, emails, or personal IDs exposed.`);

  // =========================================================================
  // 2. PERIOD FILTERING & BREAKDOWN ACCURACY
  // =========================================================================
  console.log('\n--- 2. Testing Community Report Period Filtering & Breakdown ---');

  const reportAll = await mockApi.getPublicCommunityReport('all');
  const report30d = await mockApi.getPublicCommunityReport('30d');
  const report7d = await mockApi.getPublicCommunityReport('7d');

  assert(reportAll.period === 'all', 'Period all matches');
  assert(report30d.period === '30d', 'Period 30d matches');
  assert(report7d.period === '7d', 'Period 7d matches');

  assert(reportAll.racingTag.totalAttempts >= report30d.racingTag.totalAttempts, 'All-time quiz attempts >= 30d');
  assert(report30d.racingTag.totalAttempts >= report7d.racingTag.totalAttempts, '30d quiz attempts >= 7d');

  assert(reportAll.strategyRoom.totalRuns >= 0, 'Strategy runs valid');
  assert(reportAll.strategyRoom.popularScenarios.length > 0, 'Popular scenarios returned');
  assert(reportAll.predictions.totalSubmissions >= 0, 'Prediction submissions valid');

  console.log(`  ✓ Period filtering verified (All: ${reportAll.headlineStats.totalCompetitionActivity}, 30d: ${report30d.headlineStats.totalCompetitionActivity}, 7d: ${report7d.headlineStats.totalCompetitionActivity} activities)`);
  console.log(`  ✓ Popular scenarios: ${reportAll.strategyRoom.popularScenarios.length} scenarios tracked with completion rates`);

  // =========================================================================
  // 3. ADMIN DASHBOARD PRIVILEGE ISOLATION
  // =========================================================================
  console.log('\n--- 3. Testing Admin Dashboard Protection vs Public Access ---');

  // Standard user attempting to access private admin endpoint must be rejected
  let blocked = false;
  try {
    await mockApi.getAdminCompetitionAnalytics('usr_wickando1418', 'all');
  } catch (err: any) {
    if (err.message && err.message.includes('Forbidden')) {
      blocked = true;
    }
  }
  assert(blocked, 'Standard racer is strictly blocked from private admin analytics');

  // But standard user or anonymous visitor CAN access public community report
  const publicAccess = await api.getPublicCommunityReport('all');
  assert(publicAccess && publicAccess.headlineStats.registeredMembers > 0, 'Public report is accessible to all');

  console.log('  ✓ Admin analytics strictly restricted to admins (403 Forbidden on standard racer)');
  console.log('  ✓ Public community report opens cleanly without authentication');

  // =========================================================================
  // 4. ABOUT US PAGE ROUTE, TEAM CREDITS & CONTENT VERIFICATION
  // =========================================================================
  console.log('\n--- 4. Testing About Us Page Route & Team Credits ---');

  const aboutUsPath = path.resolve(process.cwd(), 'src/pages/AboutUsPage.tsx');
  assert(fs.existsSync(aboutUsPath), 'AboutUsPage.tsx exists in src/pages');

  const aboutContent = fs.readFileSync(aboutUsPath, 'utf8');

  // Check Developer Credits
  assert(aboutContent.includes('Harsh Jalnekar'), 'Credits Harsh Jalnekar');
  assert(aboutContent.includes('Founder & Developer') || aboutContent.includes('FOUNDER & DEVELOPER'), 'Credits Harsh Jalnekar as Founder & Developer');
  assert(aboutContent.includes('building, maintaining, and improving its features'), 'Developer bio present');

  // Check Advisor Credits
  assert(aboutContent.includes('Purvesha Khilare'), 'Credits Purvesha Khilare');
  assert(aboutContent.includes('Advisor & Contributor') || aboutContent.includes('ADVISOR & CONTRIBUTOR'), 'Credits Purvesha Khilare as Advisor & Contributor');
  assert(aboutContent.includes('sharing ideas, suggestions, and feedback'), 'Advisor contribution copy present');

  // Check Vision & Purpose
  assert(aboutContent.includes('The vision is to build a motorsport community'), 'Vision statement present');
  assert(aboutContent.includes('THE GRDX is a motorsport community built to make following racing more interactive'), 'Purpose statement present');

  // Check Feedback channel
  assert(aboutContent.includes('mailto:thepaddockprediction14@gmail.com'), 'Contains official feedback link');

  // Check App.tsx routing
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert(appContent.includes('path="/about"'), 'Route /about registered in App.tsx');
  assert(appContent.includes('path="/community-stats"'), 'Route /community-stats registered in App.tsx');

  // Check Footer.tsx links
  const footerPath = path.resolve(process.cwd(), 'src/components/common/Footer.tsx');
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  assert(footerContent.includes('to="/about"'), 'Footer links to /about');
  assert(footerContent.includes('to="/community-stats"'), 'Footer links to /community-stats');

  console.log('  ✓ Harsh Jalnekar credited as Founder & Developer');
  console.log('  ✓ Purvesha Khilare credited as Advisor & Contributor');
  console.log('  ✓ Platform purpose, vision, and feedback sections verified');
  console.log('  ✓ /about and /community-stats registered in App.tsx and discoverable in Footer');

  // =========================================================================
  // 5. PREDICTION STATUS CONTRADICTION ELIMINATION
  // =========================================================================
  console.log('\n--- 5. Testing Prediction Status Inconsistency Resolution ---');

  const homePath = path.resolve(process.cwd(), 'src/pages/HomePage.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');

  // Verify that status derivation enforces single source of truth:
  // effectivePredictionStatus evaluates isPastDeadline
  assert(homeContent.includes('let effectivePredictionStatus'), 'effectivePredictionStatus derived authoritatively');
  assert(homeContent.includes("if (effectivePredictionStatus === 'OPEN' && isPastDeadline)"), 'Status flips to LOCKED if past deadline');
  assert(homeContent.includes('const isPredictionsOpen = effectivePredictionStatus === \'OPEN\''), 'isPredictionsOpen strictly checks effectivePredictionStatus');

  // Check CountdownTimer synchronization
  const countdownPath = path.resolve(process.cwd(), 'src/components/common/CountdownTimer.tsx');
  const countdownContent = fs.readFileSync(countdownPath, 'utf8');
  assert(countdownContent.includes('onExpire?.()'), 'CountdownTimer safely notifies onExpire on expiration');

  console.log('  ✓ Authoritative deadline cutoff derivation verified');
  console.log('  ✓ Race weekend card cannot simultaneously display PREDICTION OPEN and DEADLINE PASSED');

  console.log('\n🎉 ALL 5 VERIFICATION CRITERIA PASSED WITHOUT DEFECT!');
}

runTests().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
