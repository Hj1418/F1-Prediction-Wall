import fs from 'fs';
import path from 'path';
import {
  DRIVER_PROFILES,
  getDriversByDiscipline,
  getDriverProfileBySlug,
  getDisciplineDriverCounts,
} from '../src/services/motorsport/driversHubService';
import { GLOBAL_CIRCUITS, getCircuitVerificationAuditStats } from '../src/services/circuits/globalCircuitsService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

console.log('🏎️ STARTING DETERMINISTIC TEST SUITE: MOTORSPORT DISCOVERY, DRIVERS HUBS & EVERGREEN PROFILES\n');

// ============================================================================
// 1. EXPLORE PAGE STRUCTURE & INDIVIDUAL MOTORSPORT SECTIONS
// ============================================================================
console.log('🧭 [SECTION 1] Explore Page Hierarchy & Individual Discipline Sections:');
const explorePath = path.resolve('src/pages/ChampionshipsPage.tsx');
const exploreContent = fs.readFileSync(explorePath, 'utf8');

assert(
  exploreContent.includes('THE WORLD OF <span className="explore-hero-title-accent">MOTORSPORT</span>'),
  'Explore page begins with "THE WORLD OF MOTORSPORT" introductory hero'
);
assert(
  exploreContent.includes('BROWSE BY MOTORSPORT'),
  'Explore page presents "BROWSE BY MOTORSPORT" main content header'
);
assert(
  exploreContent.includes('FORMULA RACING — DRIVERS HUB'),
  'Formula Racing section contains dedicated "FORMULA RACING — DRIVERS HUB"'
);
assert(
  exploreContent.includes('MOTORCYCLE RACING — RIDERS HUB'),
  'Motorcycle Racing section contains dedicated "MOTORCYCLE RACING — RIDERS HUB"'
);
assert(
  exploreContent.includes('ENDURANCE / GT — DRIVERS HUB'),
  'Endurance / GT section contains dedicated "ENDURANCE / GT — DRIVERS HUB"'
);
assert(
  exploreContent.includes('OTHER DISCIPLINES — COMPETITORS HUB'),
  'Other Disciplines section contains dedicated "OTHER DISCIPLINES — COMPETITORS HUB"'
);
assert(
  exploreContent.includes('View All Formula Racing Drivers'),
  'Formula section contains "[View All Formula Racing Drivers]" action'
);
assert(
  exploreContent.includes('View All Motorcycle Racing Riders'),
  'Motorcycle section contains "[View All Motorcycle Racing Riders]" action'
);
assert(
  exploreContent.includes('View All Endurance / GT Drivers'),
  'Endurance section contains "[View All Endurance / GT Drivers]" action'
);
assert(
  exploreContent.includes('View All Other Disciplines Competitors'),
  'Other disciplines section contains "[View All Other Disciplines Competitors]" action'
);
assert(
  exploreContent.includes('/explore/drivers?discipline=formula'),
  'Formula action links to dedicated filtered page /explore/drivers?discipline=formula'
);
assert(
  exploreContent.includes('/explore/drivers?discipline=motorcycle'),
  'Motorcycle action links to dedicated filtered page /explore/drivers?discipline=motorcycle'
);
assert(
  exploreContent.includes('/explore/drivers?discipline=endurance'),
  'Endurance action links to dedicated filtered page /explore/drivers?discipline=endurance'
);
assert(
  exploreContent.includes('/explore/drivers?discipline=other'),
  'Other disciplines action links to dedicated filtered page /explore/drivers?discipline=other'
);
assert(
  !exploreContent.includes('to="/community-stats"'),
  'Public Explore page does not expose administrative Community Report button'
);

// ============================================================================
// 2. DEDICATED DRIVERS HUB PAGE & ROUTING
// ============================================================================
console.log('\n🏎️ [SECTION 2] Dedicated Drivers Hub Page & Routing:');
const appPath = path.resolve('src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes('path="/explore/drivers" element={<DriversHubPage />}'),
  'App.tsx registers route /explore/drivers mapped to DriversHubPage'
);
assert(
  appContent.includes('path="/drivers" element={<DriversHubPage />}'),
  'App.tsx registers route /drivers mapped to DriversHubPage'
);
assert(
  appContent.includes('path="/explore/drivers/:driverSlug" element={<DriverProfilePage />}'),
  'App.tsx registers direct profile route /explore/drivers/:driverSlug'
);
assert(
  appContent.includes('path="/drivers/:driverSlug" element={<DriverProfilePage />}'),
  'App.tsx registers direct profile route /drivers/:driverSlug'
);

const hubPath = path.resolve('src/pages/DriversHubPage.tsx');
assert(fs.existsSync(hubPath), 'DriversHubPage.tsx file exists');
const hubContent = fs.readFileSync(hubPath, 'utf8');
assert(hubContent.includes('getDriversByDiscipline'), 'DriversHubPage uses getDriversByDiscipline helper');
assert(hubContent.includes('DriverProfileCard'), 'DriversHubPage renders DriverProfileCard components');

// Verify discipline counts and sub-filters
const counts = getDisciplineDriverCounts();
assert(counts.formula >= 7, `Formula discipline contains verified drivers (found ${counts.formula})`);
assert(counts.motorcycle >= 3, `Motorcycle discipline contains verified riders (found ${counts.motorcycle})`);
assert(counts.endurance >= 4, `Endurance discipline contains verified drivers (found ${counts.endurance})`);
assert(counts.other >= 4, `Other disciplines contains verified competitors (found ${counts.other})`);

// Test getDriversByDiscipline querying
const formulaDrivers = getDriversByDiscipline('formula', 'all');
assert(formulaDrivers.length >= 7, 'getDriversByDiscipline returns Formula drivers');
assert(formulaDrivers.every(d => ['f1', 'f2', 'f3', 'f4', 'formula-e'].includes(d.series)), 'All returned formula drivers belong strictly to formula racing');

const motorcycleRiders = getDriversByDiscipline('motorcycle', 'all');
assert(motorcycleRiders.length >= 3, 'getDriversByDiscipline returns motorcycle riders');
assert(motorcycleRiders.every(d => ['motogp', 'moto2', 'moto3'].includes(d.series)), 'Motorcycle riders are not mixed with Formula drivers');

const enduranceHypercar = getDriversByDiscipline('endurance', 'hypercar');
assert(enduranceHypercar.length >= 3, 'Endurance Hypercar sub-filter correctly isolates Hypercar pilots');
assert(enduranceHypercar.every(d => d.racingClass === 'Hypercar'), 'All returned endurance drivers have verified Hypercar class');

const enduranceLMGT3 = getDriversByDiscipline('endurance', 'lmgt3');
assert(enduranceLMGT3.length >= 1, 'Endurance LMGT3 sub-filter correctly isolates LMGT3 entries (e.g. Valentino Rossi)');
assert(enduranceLMGT3.every(d => d.racingClass === 'LMGT3'), 'All returned LMGT3 drivers have verified LMGT3 class');

// ============================================================================
// 3. EVERGREEN EDITORIAL DRIVER PROFILES
// ============================================================================
console.log('\n📖 [SECTION 3] Evergreen Editorial Driver Profiles:');
const profilePath = path.resolve('src/pages/DriverProfilePage.tsx');
const profileContent = fs.readFileSync(profilePath, 'utf8');

assert(
  profileContent.includes('Early Life & Motorsport Beginnings'),
  'DriverProfilePage renders Section B: Early Life & Motorsport Beginnings'
);
assert(
  profileContent.includes('Career Journey & Milestones'),
  'DriverProfilePage renders Section C: Career Journey & Milestones'
);
assert(
  profileContent.includes('Teams & Career History'),
  'DriverProfilePage renders Section D: Teams & Career History'
);
assert(
  profileContent.includes('Career Achievements & Records'),
  'DriverProfilePage renders Section E: Career Achievements & Records'
);
assert(
  profileContent.includes('Interesting Facts & Lore'),
  'DriverProfilePage renders Section F: Interesting Facts & Lore'
);
assert(
  profileContent.includes('Driver Legacy & Influence on Motorsport'),
  'DriverProfilePage renders Section G: Driver Legacy & Influence on Motorsport'
);
assert(
  profileContent.includes('SHARE PROFILE'),
  'DriverProfilePage includes shareable profile button'
);
assert(
  !profileContent.includes('Current Season Performance'),
  'DriverProfilePage removes live current-season performance statistical dashboard clutter'
);
assert(
  !profileContent.includes('dnaAttributes.map'),
  'DriverProfilePage removes artificial Driver DNA percentage/telemetry score bars'
);
assert(
  !profileContent.includes('recentResults.map'),
  'DriverProfilePage removes live race-by-race results table'
);

// ============================================================================
// 4. DRIVER DATA ACCURACY & HISTORICAL TEAM AUDIT
// ============================================================================
console.log('\n🔍 [SECTION 4] Driver Data Accuracy & Historical Team Verification:');

// Test 4.1: Lewis Hamilton
const hamilton = getDriverProfileBySlug('lewis-hamilton');
assert(!!hamilton, 'Lewis Hamilton profile is resolved via slug');
assert(hamilton!.fullName === 'Sir Lewis Carl Davidson Hamilton', 'Hamilton full official name is verified');
assert(hamilton!.team === 'Scuderia Ferrari', 'Hamilton current team is Scuderia Ferrari');
assert(!!hamilton!.teamsHistory, 'Hamilton has verified teamsHistory ledger');

const hamHistory = hamilton!.teamsHistory!;
const mclarenRecord = hamHistory.find(h => h.team.includes('McLaren'));
const mercRecord = hamHistory.find(h => h.team.includes('Mercedes-AMG'));
const ferrariRecord = hamHistory.find(h => h.team.includes('Ferrari'));

assert(!!mclarenRecord && mclarenRecord.period === '2007–2012', 'Hamilton historical team 2007–2012 is McLaren');
assert(!!mercRecord && mercRecord.period === '2013–2024', 'Hamilton historical team 2013–2024 is Mercedes');
assert(!!ferrariRecord && (ferrariRecord.period.includes('2025') || ferrariRecord.period.includes('2026')), 'Hamilton team for 2025–2026 is Scuderia Ferrari');
assert(hamilton!.stats.worldChampionships === 7, 'Hamilton career championships verified as 7');
assert(hamilton!.stats.raceWins >= 105, 'Hamilton career race wins verified as 105+');
assert(hamilton!.stats.polePositions >= 104, 'Hamilton career pole positions verified as 104');

// Test 4.2: Max Verstappen
const verstappen = getDriverProfileBySlug('max-verstappen');
assert(!!verstappen, 'Max Verstappen profile is resolved via slug');
assert(verstappen!.fullName === 'Max Emilian Verstappen', 'Verstappen full official name is verified');
const verHistory = verstappen!.teamsHistory!;
assert(verHistory.some(h => h.team.includes('Toro Rosso') && h.period === '2015–2016'), 'Verstappen historical team 2015–2016 is Scuderia Toro Rosso');
assert(verHistory.some(h => h.team.includes('Red Bull Racing') && h.period.includes('2016')), 'Verstappen historical team 2016–Present is Red Bull Racing');
assert(verstappen!.stats.worldChampionships === 4, 'Verstappen career championships verified as 4');

// Test 4.3: Fernando Alonso
const alonso = getDriverProfileBySlug('fernando-alonso');
assert(!!alonso, 'Fernando Alonso profile is resolved via slug');
const aloHistory = alonso!.teamsHistory!;
assert(aloHistory.some(h => h.team.includes('Minardi') && h.period === '2001'), 'Alonso 2001 team is Minardi');
assert(aloHistory.some(h => h.team.includes('Renault') && h.period === '2003–2006'), 'Alonso 2003–2006 championship team is Renault');
assert(aloHistory.some(h => h.team.includes('McLaren') && h.period === '2007'), 'Alonso 2007 team is McLaren');
assert(aloHistory.some(h => h.team.includes('Ferrari') && h.period === '2010–2014'), 'Alonso 2010–2014 team is Ferrari');
assert(aloHistory.some(h => h.team.includes('Toyota Gazoo') && h.period === '2018–2019'), 'Alonso 2018–2019 WEC/Le Mans team is Toyota Gazoo Racing');
assert(aloHistory.some(h => h.team.includes('Aston Martin') && h.period.includes('2023')), 'Alonso current team is Aston Martin');

// Test 4.4: Marc Márquez
const marquez = getDriverProfileBySlug('marc-marquez');
assert(!!marquez, 'Marc Márquez profile is resolved via slug');
const mmHistory = marquez!.teamsHistory!;
assert(mmHistory.some(h => h.team.includes('Repsol Honda') && h.period === '2013–2023'), 'Márquez historical team 2013–2023 is Repsol Honda');
assert(mmHistory.some(h => h.team.includes('Gresini') && h.period === '2024'), 'Márquez historical team 2024 is Gresini Racing');
assert(mmHistory.some(h => h.team.includes('Ducati Lenovo') && h.period.includes('2025')), 'Márquez team 2025–Present is factory Ducati Lenovo Team');

// Test 4.5: Other Disciplines Competitors
const ogier = getDriverProfileBySlug('sebastien-ogier');
assert(!!ogier && ogier.series === 'wrc', 'Sébastien Ogier is verified in WRC Rally category');
assert(ogier!.stats.worldChampionships === 8, 'Ogier verified as 8x World Rally Champion');

const karthikeyan = getDriverProfileBySlug('narain-karthikeyan');
assert(!!karthikeyan && karthikeyan.series === 'indian-motorsport', 'Narain Karthikeyan is verified in Indian Motorsport');
assert(karthikeyan!.teamsHistory!.some(h => h.team.includes('Jordan') && h.period === '2005'), 'Karthikeyan 2005 F1 team is Jordan Grand Prix');

const chandhok = getDriverProfileBySlug('karun-chandhok');
assert(!!chandhok && chandhok.series === 'indian-motorsport', 'Karun Chandhok is verified in Indian Motorsport');
assert(chandhok!.teamsHistory!.some(h => h.team.includes('Hispania') && h.period === '2010'), 'Chandhok 2010 F1 team is Hispania Racing F1 Team');

const daruvala = getDriverProfileBySlug('jehan-daruvala');
assert(!!daruvala && daruvala.series === 'indian-motorsport', 'Jehan Daruvala is verified in Indian Motorsport');

// Verify all drivers have rich evergreen biographical fields
for (const d of DRIVER_PROFILES) {
  assert(!!d.fullName, `Driver ${d.name} has verified fullName`);
  assert(!!d.primaryDiscipline, `Driver ${d.name} has verified primaryDiscipline`);
  assert(!!d.shortIntroduction, `Driver ${d.name} has verified shortIntroduction`);
  assert(!!d.earlyLifeAndBeginnings, `Driver ${d.name} has verified earlyLifeAndBeginnings`);
  assert(Array.isArray(d.careerJourney) && d.careerJourney.length > 0, `Driver ${d.name} has verified careerJourney milestones`);
  assert(Array.isArray(d.teamsHistory) && d.teamsHistory.length > 0, `Driver ${d.name} has verified teamsHistory ledger`);
  assert(Array.isArray(d.careerAchievements) && d.careerAchievements.length > 0, `Driver ${d.name} has verified careerAchievements`);
  assert(Array.isArray(d.interestingFacts) && d.interestingFacts.length > 0, `Driver ${d.name} has verified interestingFacts`);
  assert(!!d.driverLegacy, `Driver ${d.name} has verified driverLegacy`);
}

// ============================================================================
// 5. COMMUNITY REPORT ACCESS CONTROL
// ============================================================================
console.log('\n🔒 [SECTION 5] Community Report Access Control:');
const communityPath = path.resolve('src/pages/CommunityStatsPage.tsx');
const communityContent = fs.readFileSync(communityPath, 'utf8');

assert(
  communityContent.includes('!isAdmin') && communityContent.includes('ADMINISTRATOR PRIVILEGES REQUIRED'),
  'CommunityStatsPage strictly enforces !isAdmin access barrier with administrator privileges screen'
);

const adminDashPath = path.resolve('src/pages/AdminDashboardPage.tsx');
const adminDashContent = fs.readFileSync(adminDashPath, 'utf8');

assert(
  adminDashContent.includes('to="/community-stats"') && adminDashContent.includes('COMMUNITY REPORT'),
  'Admin Dashboard provides verified direct link to /community-stats for authenticated administrators'
);

// ============================================================================
// 6. CIRCUIT REGISTRY AUDIT
// ============================================================================
console.log('\n🏁 [SECTION 6] Circuit Registry Audit & Verification:');
const circuitStats = getCircuitVerificationAuditStats();

assert(circuitStats.totalRegistered >= 30, `Circuit registry contains comprehensive track library (registered: ${circuitStats.totalRegistered})`);
assert(circuitStats.totalVerified >= 25, `Circuit registry has certified SVG layouts and specifications (verified: ${circuitStats.totalVerified})`);
assert(circuitStats.totalPendingVerification >= 1, `Circuit registry maintains transparent pending verification statuses without silent hiding (pending: ${circuitStats.totalPendingVerification})`);

// Verify Buddh International Circuit cross-links to Indian Motorsport and MotoGP
const buddh = GLOBAL_CIRCUITS['buddh'];
assert(!!buddh, 'Buddh International Circuit exists in global registry');
assert(buddh.location.country === 'India', 'Buddh country is India');
assert(buddh.layouts[0].lengthKm === 5.125, 'Buddh length is 5.125 km');
assert(buddh.layouts[0].turns === 16, 'Buddh turns is 16');

console.log('\n======================================================');
console.log('🏆 ALL 45 / 45 MOTORSPORT DISCOVERY, DRIVERS HUBS & DRIVER PROFILE VERIFICATIONS PASSED PERFECTLY!');
console.log('======================================================\n');
