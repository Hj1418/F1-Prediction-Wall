/**
 * Verification Suite: Motorsport Foundation, Client Cache & Request De-duplication
 * 
 * Verifies:
 * 1. Championship registry integrity, categories, and format variations
 * 2. Client-side cache: hit, miss, TTL expiration, invalidation
 * 3. Concurrent in-flight request de-duplication
 * 4. User-facing branding purity (no legacy branding strings in src/ or index.html)
 */

import {
  CHAMPIONSHIPS_REGISTRY,
  MOTORSPORT_CATEGORIES,
  FORMAT_COMPARISONS,
  getChampionshipById,
  getChampionshipsByCategory,
} from '../src/services/motorsport/motorsportRegistry';
import { clientCache, TTL } from '../src/services/cache/clientCache';
import { searchMotorsport, getUniversalSearchIndex } from '../src/services/motorsport/searchService';
import { getCrossChampionshipHostings, CROSS_CHAMPIONSHIP_VENUES } from '../src/services/circuits/crossChampionshipVenues';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🏁 Starting Motorsport Expansion & Performance Foundation Verification...\n');

  // ==========================================
  // 1. REGISTRY INTEGRITY & CATEGORY VALIDATION
  // ==========================================
  console.log('1. Championship Registry & Categories:');

  assert(CHAMPIONSHIPS_REGISTRY.length >= 10, `Registry contains ${CHAMPIONSHIPS_REGISTRY.length} championships (>= 10)`);
  assert(MOTORSPORT_CATEGORIES.length >= 7, `Categories taxonomy contains ${MOTORSPORT_CATEGORIES.length} categories`);

  const requiredChampionshipIds = [
    'f1',
    'f2',
    'f3',
    'f4',
    'formula-e',
    'wec',
    'gt-world-challenge',
    'wrc',
    'motogp',
    'indian-motorsport',
  ];

  for (const id of requiredChampionshipIds) {
    const champ = getChampionshipById(id);
    assert(Boolean(champ), `Championship '${id}' exists in registry`);
    if (champ) {
      assert(champ.name.length > 0, `'${id}' has valid display name: ${champ.name}`);
      assert(champ.beginnerOverview.length > 20, `'${id}' has beginner overview`);
      assert(champ.vehicleType.length > 0, `'${id}' specifies vehicle type`);
    }
  }

  // Check F1 is designated as active starting point
  const f1 = getChampionshipById('f1');
  assert(f1?.isF1StartingPoint === true, 'Formula 1 is designated as active starting point');

  // Verify category filtering
  const openWheel = getChampionshipsByCategory('open_wheel');
  assert(openWheel.some(c => c.id === 'f1') && openWheel.some(c => c.id === 'f2'), 'Open-wheel category returns F1 and F2');

  const endurance = getChampionshipsByCategory('endurance');
  assert(endurance.some(c => c.id === 'wec'), 'Endurance category returns WEC');

  const rally = getChampionshipsByCategory('rally');
  assert(rally.some(c => c.id === 'wrc'), 'Rally category returns WRC');

  const motorcycle = getChampionshipsByCategory('motorcycle');
  assert(motorcycle.some(c => c.id === 'motogp'), 'Motorcycle category returns MotoGP');

  const indian = getChampionshipsByCategory('national_indian');
  assert(indian.some(c => c.id === 'indian-motorsport'), 'Indian category returns Indian Motorsport');

  // Verify format differences
  assert(FORMAT_COMPARISONS.length >= 4, `Format comparison covers ${FORMAT_COMPARISONS.length} distinct architectures`);
  const formatTypes = new Set(CHAMPIONSHIPS_REGISTRY.map(c => c.formatType));
  assert(formatTypes.has('grand_prix'), 'Format type "grand_prix" represented');
  assert(formatTypes.has('endurance'), 'Format type "endurance" represented');
  assert(formatTypes.has('rally_stages'), 'Format type "rally_stages" represented');
  assert(formatTypes.has('double_header'), 'Format type "double_header" represented');
  assert(formatTypes.has('sprint_and_feature'), 'Format type "sprint_and_feature" represented');

  // ==========================================
  // 2. CLIENT CACHE FUNCTIONALITY
  // ==========================================
  console.log('\n2. Client Cache & TTL Mechanics:');

  clientCache.clear();
  assert(clientCache.get('test_key') === null, 'Cache miss returns null');

  clientCache.set('test_key', { value: 42 }, 10000);
  const cached = clientCache.get<{ value: number }>('test_key');
  assert(cached?.value === 42, 'Cache hit retrieves stored value');

  clientCache.remove('test_key');
  assert(clientCache.get('test_key') === null, 'Manual remove removes entry');

  // Prefix invalidation
  clientCache.set('f1_item1', 'A', 10000);
  clientCache.set('f1_item2', 'B', 10000);
  clientCache.set('other_item', 'C', 10000);
  clientCache.invalidatePrefix('f1_');
  assert(clientCache.get('f1_item1') === null, 'Prefix invalidation removed f1_item1');
  assert(clientCache.get('f1_item2') === null, 'Prefix invalidation removed f1_item2');
  assert(clientCache.get('other_item') === 'C', 'Prefix invalidation preserved other_item');

  // Expired TTL
  clientCache.set('expired_key', 'old_data', -1000); // already expired
  assert(clientCache.get('expired_key') === null, 'Expired TTL entry returns null');

  // ==========================================
  // 3. CONCURRENT REQUEST DE-DUPLICATION
  // ==========================================
  console.log('\n3. In-Flight Request De-duplication:');

  let fetchCallCount = 0;
  const mockSlowFetcher = async () => {
    fetchCallCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    return { data: 'motorsport_payload', time: Date.now() };
  };

  clientCache.clear();

  // Trigger 5 concurrent requests for the exact same key
  const [res1, res2, res3, res4, res5] = await Promise.all([
    clientCache.getOrFetch('shared_resource', mockSlowFetcher, { ttlMs: 5000 }),
    clientCache.getOrFetch('shared_resource', mockSlowFetcher, { ttlMs: 5000 }),
    clientCache.getOrFetch('shared_resource', mockSlowFetcher, { ttlMs: 5000 }),
    clientCache.getOrFetch('shared_resource', mockSlowFetcher, { ttlMs: 5000 }),
    clientCache.getOrFetch('shared_resource', mockSlowFetcher, { ttlMs: 5000 }),
  ]);

  assert(fetchCallCount === 1, `5 concurrent calls resulted in exactly 1 fetch invocation (invoked: ${fetchCallCount})`);
  assert(res1.data === 'motorsport_payload', 'Result 1 matches payload');
  assert(res2.time === res1.time, 'Result 2 received identical promise resolution');
  assert(res5.time === res1.time, 'Result 5 received identical promise resolution');

  // Subsequent call gets from cache directly
  const res6 = await clientCache.getOrFetch('shared_resource', mockSlowFetcher, { ttlMs: 5000 });
  assert(fetchCallCount === 1, 'Subsequent call read from cache without triggering fetch');
  assert(res6.data === 'motorsport_payload', 'Cached data returned successfully');

  // ==========================================
  // 4. USER-FACING BRANDING PURITY
  // ==========================================
  console.log('\n4. User-Facing Branding Verification:');

  const legacyTerms = [
    'Prediction Wall',
    'Community Prediction League',
  ];

  function searchFilesRecursively(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchFilesRecursively(fullPath, fileList);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const srcFiles = searchFilesRecursively(path.resolve(process.cwd(), 'src'));
  srcFiles.push(path.resolve(process.cwd(), 'index.html'));

  let foundLegacyInUserFacing = false;
  for (const filePath of srcFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const term of legacyTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        console.error(`  ❌ Legacy term '${term}' found in ${path.relative(process.cwd(), filePath)}`);
        foundLegacyInUserFacing = true;
      }
    }
  }

  assert(!foundLegacyInUserFacing, 'No user-facing code in src/ or index.html contains legacy branding strings');

  // ==========================================
  // 5. REUSABLE CHAMPIONSHIP ARCHITECTURE & F2/F3/F4 VERTICAL SLICES
  // ==========================================
  console.log('\n5. Reusable Championship Architecture & Feeder Ladder:');

  const { getChampionshipDetail, isChampionshipDataReady, getIndianMotorsportEcosystem } = await import('../src/services/motorsport/championshipDataService');

  // Test readiness helpers
  assert(isChampionshipDataReady('f2') === true, 'F2 is flagged as data ready');
  assert(isChampionshipDataReady('f3') === true, 'F3 is flagged as data ready');
  assert(isChampionshipDataReady('f4') === true, 'F4 is flagged as data ready');
  assert(isChampionshipDataReady('motogp') === true, 'MotoGP is flagged as data ready');
  assert(isChampionshipDataReady('indian-motorsport') === true, 'Indian Motorsport is flagged as ecosystem ready');
  assert(isChampionshipDataReady('superbike') === false, 'World Superbike correctly flagged as not yet loaded');

  // Test F2 Dynamic Load
  const f2Detail = await getChampionshipDetail('f2');
  assert(Boolean(f2Detail), 'F2 detail dataset loaded successfully');
  if (f2Detail) {
    assert(f2Detail.rounds.length === 14, `F2 has 14 official Grand Prix support rounds (got ${f2Detail.rounds.length})`);
    assert(f2Detail.teamsStandings.length === 11, `F2 has 11 official teams (got ${f2Detail.teamsStandings.length})`);
    assert(f2Detail.driversStandings.length === 22, `F2 has 22 official drivers (got ${f2Detail.driversStandings.length})`);
    assert(f2Detail.technicalSpecs.powerOutput.includes('620 bhp'), 'F2 specifies 620 bhp Mecachrome single turbo');
    assert(f2Detail.superLicencePoints[0].points === 40, 'F2 champion earns 40 FIA Super Licence points');
    assert(f2Detail.faqs.length >= 3, 'F2 includes beginner and sporting FAQs');
  }

  // Test F3 Dynamic Load
  const f3Detail = await getChampionshipDetail('f3');
  assert(Boolean(f3Detail), 'F3 detail dataset loaded successfully');
  if (f3Detail) {
    assert(f3Detail.rounds.length === 10, `F3 has 10 official calendar rounds (got ${f3Detail.rounds.length})`);
    assert(f3Detail.teamsStandings.length === 10, `F3 has 10 official teams (got ${f3Detail.teamsStandings.length})`);
    assert(f3Detail.driversStandings.length >= 15, `F3 has comprehensive driver grid (got ${f3Detail.driversStandings.length})`);
    assert(f3Detail.technicalSpecs.powerOutput.includes('380 bhp'), 'F3 specifies 380 bhp naturally aspirated V6');
    assert(f3Detail.superLicencePoints[0].points === 30, 'F3 champion earns 30 FIA Super Licence points');
  }

  // Test F4 Dynamic Load & Indian Motorsport Pathway
  const f4Detail = await getChampionshipDetail('f4');
  assert(Boolean(f4Detail), 'F4 detail dataset loaded successfully');
  if (f4Detail) {
    assert(f4Detail.nationalSeries && f4Detail.nationalSeries.length >= 4, 'F4 covers top global national championships');
    const f4India = f4Detail.nationalSeries?.find(s => s.name.includes('India'));
    assert(Boolean(f4India), 'F4 Indian Championship explicitly integrated in single-seater ladder');
    if (f4India) {
      assert(f4India.superLicencePoints === 12, 'F4 Indian Championship awards 12 FIA Super Licence points');
      assert(f4India.keyCircuits.includes('Madras International Circuit (MMRT)'), 'F4 India includes Madras International Circuit (MMRT)');
    }
    assert(f4Detail.superLicencePoints && f4Detail.superLicencePoints[0].points === 12, 'National F4 champions receive 12 Super Licence points');
  }

  // Test Formula E Dynamic Load & Electric Innovation Guide
  assert(isChampionshipDataReady('formula-e') === true, 'Formula E is flagged as data ready');
  const feDetail = await getChampionshipDetail('formula-e');
  assert(Boolean(feDetail), 'Formula E detail dataset loaded successfully');
  if (feDetail) {
    assert(feDetail.rounds.length === 16, `Formula E has 16 World Championship rounds (got ${feDetail.rounds.length})`);
    assert(feDetail.teamsStandings.length === 11, `Formula E has 11 official teams (got ${feDetail.teamsStandings.length})`);
    assert(feDetail.driversStandings.length === 22, `Formula E has 22 official drivers (got ${feDetail.driversStandings.length})`);
    assert(feDetail.technicalSpecs.acceleration.includes('1.82s'), 'Gen3 Evo specifies 1.82s 0-100 km/h acceleration');
    assert(feDetail.technicalSpecs.powerOutput.includes('350 kW'), 'Formula E specifies 350 kW peak power');
    assert(Boolean(feDetail.featureGuide), 'Formula E has dedicated Gen3 Evo & Energy feature guide');
    if (feDetail.featureGuide) {
      assert(feDetail.featureGuide.sections.length >= 4, 'Feature guide covers Duels, Attack Mode, AWD, and Regen');
      const duels = feDetail.featureGuide.sections.find(s => s.title.includes('Duel'));
      assert(Boolean(duels), 'Feature guide covers Qualifying Duel format');
      const attackMode = feDetail.featureGuide.sections.find(s => s.title.includes('Attack Mode'));
      assert(Boolean(attackMode), 'Feature guide covers Attack Mode strategy');
    }
    const mahindra = feDetail.teamsStandings.find(t => t.teamName.includes('Mahindra'));
    assert(Boolean(mahindra), 'Formula E features Indian factory manufacturer Mahindra Racing');
  }

  // Test client-side caching of championship data
  const cachedFE = await getChampionshipDetail('formula-e');
  assert(cachedFE === feDetail, 'Subsequent call to getChampionshipDetail returns cached object reference');

  // Test WEC Dynamic Load, Multi-Class Racing & Endurance Feature Guide
  assert(isChampionshipDataReady('wec') === true, 'WEC is flagged as data ready');
  const wecDetail = await getChampionshipDetail('wec');
  assert(Boolean(wecDetail), 'WEC detail dataset loaded successfully');
  if (wecDetail) {
    assert(wecDetail.classes?.length === 2, `WEC features 2 classes (Hypercar & LMGT3) (got ${wecDetail.classes?.length})`);
    assert(wecDetail.rounds.length === 8, `WEC has 8 World Championship rounds (got ${wecDetail.rounds.length})`);
    
    // Test Le Mans round
    const leMans = wecDetail.rounds.find(r => r.officialTitle.includes('24 Hours of Le Mans'));
    assert(Boolean(leMans), 'WEC calendar features 24 Hours of Le Mans');
    assert(Boolean(leMans?.duration?.includes('24 Hours')), '24 Hours of Le Mans duration specifies 24 Hours');
    
    // Test Qatar round duration
    const qatar = wecDetail.rounds.find(r => r.officialTitle.includes('Qatar'));
    assert(qatar?.duration?.includes('1812 km'), 'Qatar round duration specifies 1812 km');

    // Test Multi-Class Teams & Car Models
    assert(wecDetail.teamsStandings.length >= 12, `WEC has comprehensive team grid (got ${wecDetail.teamsStandings.length})`);
    const ferrari499p = wecDetail.teamsStandings.find(t => t.teamName.includes('AF Corse') && t.carModel?.includes('499P'));
    assert(Boolean(ferrari499p), 'Hypercar features Ferrari AF Corse with Ferrari 499P');
    const manthey = wecDetail.teamsStandings.find(t => t.teamName.includes('Manthey'));
    assert(Boolean(manthey) && manthey?.racingClass === 'LMGT3', 'LMGT3 class features Manthey PureRxcing');

    // Test 3-Driver Lineup and Driver Grades
    assert(wecDetail.driversStandings.length >= 10, `WEC has complete driver standings (got ${wecDetail.driversStandings.length})`);
    const fuoco = wecDetail.driversStandings.find(d => d.driverName === 'Antonio Fuoco');
    assert(Boolean(fuoco), 'Antonio Fuoco is present in driver standings');
    assert(fuoco?.driverGrade === 'Platinum', 'Antonio Fuoco is categorised as Platinum grade');
    assert(Boolean(fuoco?.coDrivers && fuoco.coDrivers.length === 2), 'Antonio Fuoco shares car with 2 co-drivers (Molina & Nielsen)');

    // Test Endurance Feature Guide
    assert(Boolean(wecDetail.featureGuide), 'WEC features comprehensive endurance and multi-class guide');
    if (wecDetail.featureGuide) {
      assert(wecDetail.featureGuide.sections.length >= 4, 'Endurance guide covers LMH/LMDh, LMGT3, Le Mans, and BoP');
      const bop = wecDetail.featureGuide.sections.find(s => s.title.includes('Balance of Performance'));
      assert(Boolean(bop), 'Endurance guide covers Balance of Performance (BoP)');
      const multiClass = wecDetail.featureGuide.sections.find(s => s.title.includes('Multi-Class'));
      assert(Boolean(multiClass), 'Endurance guide covers multi-class traffic management');
    }
  }

  // Test client-side caching of WEC data
  const cachedWEC = await getChampionshipDetail('wec');
  assert(cachedWEC === wecDetail, 'Subsequent call to getChampionshipDetail returns cached WEC object reference');

  // Test GT World Challenge Dynamic Load, 4 Driver Cups, Sprint/Endurance & SRO BoP Guide
  assert(isChampionshipDataReady('gt-world-challenge') === true, 'GT World Challenge is flagged as data ready');
  const gtDetail = await getChampionshipDetail('gt-world-challenge');
  assert(Boolean(gtDetail), 'GT World Challenge detail dataset loaded successfully');
  if (gtDetail) {
    assert(gtDetail.classes?.length === 4, `GT World Challenge features 4 Driver Cups (got ${gtDetail.classes?.length})`);
    const proCup = gtDetail.classes?.find(c => c.name === 'Pro');
    const goldCup = gtDetail.classes?.find(c => c.name === 'Gold Cup');
    const silverCup = gtDetail.classes?.find(c => c.name === 'Silver Cup');
    const bronzeCup = gtDetail.classes?.find(c => c.name === 'Bronze Cup');
    assert(Boolean(proCup && goldCup && silverCup && bronzeCup), 'All 4 Driver Cups (Pro, Gold, Silver, Bronze) are defined');

    assert(gtDetail.rounds.length === 10, `GT World Challenge has 10 official calendar rounds (got ${gtDetail.rounds.length})`);
    
    // Test 24 Hours of Spa crown jewel
    const spa24h = gtDetail.rounds.find(r => r.officialTitle.includes('24 Hours of Spa'));
    assert(Boolean(spa24h), 'GT World Challenge features CrowdStrike 24 Hours of Spa');
    assert(Boolean(spa24h?.duration?.includes('24 Hours')), '24 Hours of Spa duration specifies 24 Hours');

    // Test Sprint Cup dual round format
    const brandsHatch = gtDetail.rounds.find(r => r.officialTitle.includes('Brands Hatch'));
    assert(Boolean(brandsHatch?.duration?.includes('60-Min Sprint')), 'Sprint rounds specify 60-Minute sprint format');

    // Test Teams, GT3 Models & Manufacturers
    assert(gtDetail.teamsStandings.length >= 10, `GT World Challenge has comprehensive team grid (got ${gtDetail.teamsStandings.length})`);
    const wrt = gtDetail.teamsStandings.find(t => t.teamName.includes('WRT') && t.carModel?.includes('M4 GT3'));
    assert(Boolean(wrt), 'Team WRT fields BMW M4 GT3 with BMW M Motorsport manufacturer');
    const ferrariTeam = gtDetail.teamsStandings.find(t => t.carModel?.includes('296 GT3'));
    assert(Boolean(ferrariTeam), 'Ferrari 296 GT3 represented in GT3 grid');

    // Test Driver Lineups & Driver Grades
    assert(gtDetail.driversStandings.length >= 12, `GT World Challenge has complete driver standings (got ${gtDetail.driversStandings.length})`);
    const vanthoor = gtDetail.driversStandings.find(d => d.driverName.includes('Vanthoor'));
    assert(Boolean(vanthoor && vanthoor.driverGrade === 'Platinum'), 'Dries Vanthoor is categorised as Platinum grade');
    assert(Boolean(vanthoor?.coDrivers && vanthoor.coDrivers.length >= 2), 'Vanthoor shares car with co-drivers (Weerts & van der Linde)');

    const ironDamesDriver = gtDetail.driversStandings.find(d => d.driverName === 'Sarah Bovy');
    assert(Boolean(ironDamesDriver && ironDamesDriver.racingClass === 'Bronze Cup'), 'Sarah Bovy competes in Bronze Cup with Iron Dames');

    // Test GT3 & SRO BoP Guide
    assert(Boolean(gtDetail.featureGuide), 'GT World Challenge features dedicated GT3 & SRO BoP guide');
    if (gtDetail.featureGuide) {
      assert(gtDetail.featureGuide.sections.length >= 4, 'GT guide covers GT3 platform, Sprint/Endurance, 24h of Spa, and BoP');
      const bopSection = gtDetail.featureGuide.sections.find(s => s.title.includes('Balance of Performance'));
      assert(Boolean(bopSection), 'Feature guide covers SRO Balance of Performance (BoP)');
      const spaSection = gtDetail.featureGuide.sections.find(s => s.title.includes('24 Hours of Spa'));
      assert(Boolean(spaSection), 'Feature guide covers CrowdStrike 24 Hours of Spa');
    }
  }

  // Test client-side caching of GT World Challenge data
  const cachedGT = await getChampionshipDetail('gt-world-challenge');
  assert(cachedGT === gtDetail, 'Subsequent call to getChampionshipDetail returns cached GT object reference');

  // Test WRC Dynamic Load, 3 Classes, 13 Rounds, Surfaces, Co-Drivers & Rally Guide
  assert(isChampionshipDataReady('wrc') === true, 'WRC is flagged as data ready');
  const wrcDetail = await getChampionshipDetail('wrc');
  assert(Boolean(wrcDetail), 'WRC detail dataset loaded successfully');
  if (wrcDetail) {
    assert(wrcDetail.classes?.length === 3, `WRC features 3 classes (Rally1, WRC2, Junior WRC) (got ${wrcDetail.classes?.length})`);
    const rally1 = wrcDetail.classes?.find(c => c.name === 'Rally1');
    const wrc2 = wrcDetail.classes?.find(c => c.name === 'WRC2');
    const jwrc = wrcDetail.classes?.find(c => c.name === 'Junior WRC');
    assert(Boolean(rally1 && wrc2 && jwrc), 'All 3 rally tiers (Rally1, WRC2, Junior WRC) are defined');

    assert(wrcDetail.rounds.length === 13, `WRC has 13 official calendar rounds (got ${wrcDetail.rounds.length})`);

    // Test surface variety
    const surfaces = new Set(wrcDetail.rounds.map(r => r.surface));
    assert(surfaces.has('Snow'), 'WRC calendar includes Snow surface (Rally Sweden)');
    assert(surfaces.has('Gravel'), 'WRC calendar includes Gravel surface (Safari Kenya, Finland)');
    assert(surfaces.has('Tarmac'), 'WRC calendar includes Tarmac surface (Croatia, Central Europe)');
    assert(surfaces.has('Mixed'), 'WRC calendar includes Mixed surface (Rallye Monte-Carlo)');

    // Test stages & competitive distance
    const safari = wrcDetail.rounds.find(r => r.officialTitle.includes('Safari'));
    assert(Boolean(safari && safari.totalStages === 19 && safari.competitiveDistanceKm === 367.76), 'Safari Rally Kenya specifies 19 stages and 367.76 km competitive distance');
    const sweden = wrcDetail.rounds.find(r => r.officialTitle.includes('Sweden'));
    assert(Boolean(sweden && sweden.surface === 'Snow' && sweden.totalStages === 18), 'Rally Sweden features 18 stages on Snow');

    // Test Manufacturers & Rally1 Machinery
    assert(wrcDetail.teamsStandings.length >= 5, `WRC has manufacturer and support teams (got ${wrcDetail.teamsStandings.length})`);
    const toyota = wrcDetail.teamsStandings.find(t => t.teamName.includes('Toyota Gazoo'));
    assert(Boolean(toyota && toyota.carModel?.includes('GR Yaris Rally1 Hybrid')), 'Toyota Gazoo Racing fields GR Yaris Rally1 Hybrid');
    const hyundai = wrcDetail.teamsStandings.find(t => t.teamName.includes('Hyundai Shell'));
    assert(Boolean(hyundai && hyundai.carModel?.includes('i20 N Rally1 Hybrid')), 'Hyundai Shell Mobis fields i20 N Rally1 Hybrid');
    const msport = wrcDetail.teamsStandings.find(t => t.teamName.includes('M-Sport Ford'));
    assert(Boolean(msport && msport.carModel?.includes('Puma Rally1 Hybrid')), 'M-Sport Ford fields Puma Rally1 Hybrid');

    // Test 1-to-1 Driver & Co-Driver Partnerships
    assert(wrcDetail.driversStandings.length >= 10, `WRC has comprehensive driver standings (got ${wrcDetail.driversStandings.length})`);
    const neuville = wrcDetail.driversStandings.find(d => d.driverName === 'Thierry Neuville');
    assert(Boolean(neuville), 'Thierry Neuville is present in driver standings');
    assert(Boolean(neuville?.coDrivers && neuville.coDrivers.length === 1 && neuville.coDrivers[0] === 'Martijn Wydaeghe'), 'Neuville is partnered 1-to-1 with co-driver Martijn Wydaeghe');

    const ogier = wrcDetail.driversStandings.find(d => d.driverName === 'Sébastien Ogier');
    assert(Boolean(ogier?.coDrivers && ogier.coDrivers[0] === 'Vincent Landais'), 'Sébastien Ogier partnered with Vincent Landais');

    const tanak = wrcDetail.driversStandings.find(d => d.driverName === 'Ott Tänak');
    assert(Boolean(tanak?.coDrivers && tanak.coDrivers[0] === 'Martin Järveoja'), 'Ott Tänak partnered with Martin Järveoja');

    // Test WRC Feature Guide
    assert(Boolean(wrcDetail.featureGuide), 'WRC features comprehensive rally mechanics and sporting guide');
    if (wrcDetail.featureGuide) {
      assert(wrcDetail.featureGuide.sections.length >= 5, 'Rally guide covers Special Stages, Pace Notes, Surfaces, Power Stage, and Service Parks');
      const paceNotes = wrcDetail.featureGuide.sections.find(s => s.title.includes('Pace Notes'));
      assert(Boolean(paceNotes), 'Feature guide explains Pace Notes and Co-Driver Communication');
      const powerStage = wrcDetail.featureGuide.sections.find(s => s.title.includes('Power Stage'));
      assert(Boolean(powerStage), 'Feature guide explains Wolf Power Stage bonus points system');
      const servicePark = wrcDetail.featureGuide.sections.find(s => s.title.includes('Service Park'));
      assert(Boolean(servicePark), 'Feature guide explains Service Parks & 45-Minute Rebuilds');
    }
  }

  // Test client-side caching of WRC data
  const cachedWRC = await getChampionshipDetail('wrc');
  assert(cachedWRC === wrcDetail, 'Subsequent call to getChampionshipDetail returns cached WRC object reference');

  // Test MotoGP Dynamic Load, 3 Classes, 20 Rounds, Tissot Sprint, Riders & Mechanics Guide
  assert(isChampionshipDataReady('motogp') === true, 'MotoGP is flagged as data ready');
  const motogpDetail = await getChampionshipDetail('motogp');
  assert(Boolean(motogpDetail), 'MotoGP detail dataset loaded successfully');
  if (motogpDetail) {
    assert(motogpDetail.competitorLabel === 'Rider', 'MotoGP designates competitorLabel as "Rider"');
    assert(motogpDetail.vehicleLabel === 'Bike', 'MotoGP designates vehicleLabel as "Bike"');
    assert(motogpDetail.classes?.length === 3, `MotoGP features 3 classes (MotoGP, Moto2, Moto3) (got ${motogpDetail.classes?.length})`);
    
    const premier = motogpDetail.classes?.find(c => c.name === 'MotoGP');
    const moto2 = motogpDetail.classes?.find(c => c.name === 'Moto2');
    const moto3 = motogpDetail.classes?.find(c => c.name === 'Moto3');
    assert(Boolean(premier && moto2 && moto3), 'All 3 motorcycle Grand Prix tiers (MotoGP, Moto2, Moto3) are defined');

    assert(motogpDetail.rounds.length === 20, `MotoGP has 20 official calendar rounds (got ${motogpDetail.rounds.length})`);

    // Test Tissot Sprint and Grand Prix dual-race format in sessions
    const lusail = motogpDetail.rounds.find(r => r.officialTitle.includes('Qatar'));
    assert(Boolean(lusail), 'MotoGP calendar features Qatar Grand Prix at Lusail');
    const sprintSession = lusail?.sessions.find(s => s.name.includes('Sprint'));
    const gpSession = lusail?.sessions.find(s => s.name.includes('Grand Prix'));
    assert(Boolean(sprintSession), 'Qatar round features Saturday Tissot Sprint session');
    assert(Boolean(gpSession), 'Qatar round features Sunday Grand Prix session');

    // Test Grand Prix of India
    const gpIndia = motogpDetail.rounds.find(r => r.officialTitle.includes('India'));
    assert(Boolean(gpIndia), 'MotoGP calendar includes Grand Prix of India at Buddh International Circuit');
    if (gpIndia) {
      assert(gpIndia.circuitName.includes('Buddh International Circuit'), 'Indian round is held at Buddh International Circuit');
      assert(gpIndia.duration?.includes('1.06 km Straight'), 'Indian round highlights the 1.06 km back straight');
    }

    // Test Top Speed and Technical Specs
    assert(motogpDetail.technicalSpecs.topSpeed.includes('366.1 km/h'), 'MotoGP specifies 366.1 km/h all-time speed record');
    assert(motogpDetail.technicalSpecs.weight.includes('157 kg'), 'MotoGP specifies 157 kg minimum dry weight');
    assert(motogpDetail.technicalSpecs.displacement.includes('1,000 cc'), 'MotoGP specifies 1,000 cc engine displacement');

    // Test Factory Teams, Bike Models & Manufacturers
    assert(motogpDetail.teamsStandings.length >= 10, `MotoGP has complete team grid (got ${motogpDetail.teamsStandings.length})`);
    const ducati = motogpDetail.teamsStandings.find(t => t.teamName.includes('Ducati Lenovo'));
    assert(Boolean(ducati && ducati.carModel?.includes('Desmosedici GP25')), 'Ducati Lenovo fields Ducati Desmosedici GP25');
    const aprilia = motogpDetail.teamsStandings.find(t => t.teamName.includes('Aprilia Racing'));
    assert(Boolean(aprilia && aprilia.carModel?.includes('RS-GP25')), 'Aprilia Racing fields Aprilia RS-GP25');
    const ktm = motogpDetail.teamsStandings.find(t => t.teamName.includes('Red Bull KTM'));
    assert(Boolean(ktm && ktm.carModel?.includes('RC16')), 'Red Bull KTM fields KTM RC16');
    const yamaha = motogpDetail.teamsStandings.find(t => t.teamName.includes('Monster Energy Yamaha'));
    assert(Boolean(yamaha && yamaha.carModel?.includes('YZR-M1')), 'Monster Energy Yamaha fields Yamaha YZR-M1');
    const honda = motogpDetail.teamsStandings.find(t => t.teamName.includes('Honda'));
    assert(Boolean(honda && honda.carModel?.includes('RC213V')), 'Honda fields Honda RC213V');

    // Test Riders Standings
    assert(motogpDetail.driversStandings.length >= 12, `MotoGP has complete rider standings (got ${motogpDetail.driversStandings.length})`);
    const bagnaia = motogpDetail.driversStandings.find(d => d.driverName === 'Francesco Bagnaia');
    assert(Boolean(bagnaia && bagnaia.carNumber === 63 && bagnaia.driverGrade === 'Platinum'), 'Francesco Bagnaia #63 is Platinum grade');
    const martin = motogpDetail.driversStandings.find(d => d.driverName === 'Jorge Martín');
    assert(Boolean(martin && martin.carNumber === 89 && martin.driverGrade === 'Platinum'), 'Jorge Martín #89 is Platinum grade');
    const marquez = motogpDetail.driversStandings.find(d => d.driverName === 'Marc Márquez');
    assert(Boolean(marquez && marquez.carNumber === 93), 'Marc Márquez #93 is present in rider grid');
    const acosta = motogpDetail.driversStandings.find(d => d.driverName === 'Pedro Acosta');
    assert(Boolean(acosta && acosta.carNumber === 31), 'Pedro Acosta #31 is present in rider grid');

    // Test 6-Section MotoGP Mechanics Feature Guide
    assert(Boolean(motogpDetail.featureGuide), 'MotoGP features dedicated mechanics & physics guide');
    if (motogpDetail.featureGuide) {
      assert(motogpDetail.featureGuide.sections.length >= 6, 'Feature guide covers 6 mechanics areas');
      const leanAngle = motogpDetail.featureGuide.sections.find(s => s.title.includes('Lean Angle'));
      assert(Boolean(leanAngle), 'Feature guide explains 65°+ Lean Angles & Rider Aerodynamics');
      const rideHeight = motogpDetail.featureGuide.sections.find(s => s.title.includes('Ride-Height'));
      assert(Boolean(rideHeight), 'Feature guide explains Ride-Height & Holeshot Squat Devices');
      const downforce = motogpDetail.featureGuide.sections.find(s => s.title.includes('Wings'));
      assert(Boolean(downforce), 'Feature guide explains Aerodynamic Downforce Wings & Fairing Ground Effect');
      const tyrePressure = motogpDetail.featureGuide.sections.find(s => s.title.includes('Tyre Pressure'));
      assert(Boolean(tyrePressure), 'Feature guide explains Michelin Tyre Pressure & Slipstream Thermal Window');
      const dualScoring = motogpDetail.featureGuide.sections.find(s => s.title.includes('Tissot Sprint'));
      assert(Boolean(dualScoring), 'Feature guide explains Tissot Sprint Saturday + Grand Prix Sunday Dual Scoring');
      const carbonBrakes = motogpDetail.featureGuide.sections.find(s => s.title.includes('Carbon Brakes'));
      assert(Boolean(carbonBrakes), 'Feature guide explains Brembo Carbon Brakes & 1.5G Deceleration');
    }
  }

  // Test client-side caching of MotoGP data
  const cachedMotoGP = await getChampionshipDetail('motogp');
  assert(cachedMotoGP === motogpDetail, 'Subsequent call to getChampionshipDetail returns cached MotoGP object reference');

  // Test Indian Motorsport Domestic Ecosystem & Multi-Pillar Architecture
  console.log('\n6. Indian Motorsport Domestic Ecosystem:');
  const indianEcosystem = await getIndianMotorsportEcosystem();
  assert(Boolean(indianEcosystem), 'Indian Motorsport ecosystem dataset loaded successfully');
  if (indianEcosystem) {
    assert(indianEcosystem.governingBody.includes('FMSCI'), 'Ecosystem governed by FMSCI');
    assert(indianEcosystem.quickStats.permanentCircuits === 4, 'Specifies 4 permanent racing circuits');
    assert(indianEcosystem.quickStats.fiaSuperLicencePointsMax === 12, 'Highlights 12 max domestic FIA Super Licence points');
    
    // Test 5 Domestic Series
    assert(indianEcosystem.series.length === 5, `Ecosystem covers 5 domestic championships (got ${indianEcosystem.series.length})`);
    const irl = indianEcosystem.series.find(s => s.id === 'irl');
    assert(Boolean(irl && irl.vehicle.includes('Wolf GB08')), 'Indian Racing League fields Wolf GB08 Thunder prototypes');
    const f4 = indianEcosystem.series.find(s => s.id === 'f4-india');
    assert(Boolean(f4 && f4.superLicencePoints === 12), 'F4 India awards 12 FIA Super Licence points');
    const lgb = indianEcosystem.series.find(s => s.id === 'formula-lgb');
    assert(Boolean(lgb && lgb.shortName === 'Formula LGB 4'), 'Grassroots Formula LGB 4 represented in single-seater ladder');
    const inrc = indianEcosystem.series.find(s => s.id === 'inrc');
    assert(Boolean(inrc && inrc.category === 'Rally'), 'Indian National Rally Championship (INRC) represented');

    // Test 5 Iconic Venues
    assert(indianEcosystem.circuits.length === 5, `Ecosystem covers 5 iconic racing venues (got ${indianEcosystem.circuits.length})`);
    const bic = indianEcosystem.circuits.find(c => c.id === 'bic');
    assert(Boolean(bic && bic.fiaGrade.includes('Grade 1') && bic.longestStraightMeters === 1060), 'Buddh International Circuit is FIA Grade 1 with 1.06 km back straight');
    const mmrt = indianEcosystem.circuits.find(c => c.id === 'mmrt');
    assert(Boolean(mmrt && mmrt.openedYear === 1990 && mmrt.fiaGrade === 'FIA Grade 2'), 'Madras International Circuit (MMRT) opened in 1990 as Grade 2 spiritual cradle');
    const street = indianEcosystem.circuits.find(c => c.id === 'chennai-street');
    assert(Boolean(street && street.shortName.includes('Chennai Street Circuit')), 'Chennai Formula Racing Circuit represents South Asia first night street race');

    // Test 5-Step Driver Pathway
    assert(indianEcosystem.driverPathway.length === 5, `Driver pathway comprises 5 progression stages (got ${indianEcosystem.driverPathway.length})`);
    assert(indianEcosystem.driverPathway[0].stageName.includes('Karting'), 'Stage 1 starts in Grassroots Karting');
    assert(indianEcosystem.driverPathway[1].machinery.includes('Formula LGB'), 'Stage 2 transitions into Formula LGB');
    assert(indianEcosystem.driverPathway[2].superLicencePoints === 12, 'Stage 3 (F4 India) awards 12 Super Licence points');
    assert(indianEcosystem.driverPathway[3].stageName.includes('Franchise'), 'Stage 4 advances into Professional Franchise Racing (IRL)');
    assert(indianEcosystem.driverPathway[4].stageName.includes('International'), 'Stage 5 progresses to Global World Championships');

    // Test Drivers & Pioneers
    assert(indianEcosystem.drivers.length >= 6, `Features comprehensive driver roster (got ${indianEcosystem.drivers.length})`);
    const narain = indianEcosystem.drivers.find(d => d.name.includes('Narain Karthikeyan'));
    assert(Boolean(narain && narain.era === 'Pioneers'), 'Narain Karthikeyan celebrated as India first F1 driver');
    const karun = indianEcosystem.drivers.find(d => d.name.includes('Karun Chandhok'));
    assert(Boolean(karun && karun.era === 'Pioneers'), 'Karun Chandhok celebrated as F1 driver and broadcaster');
    const jehan = indianEcosystem.drivers.find(d => d.name.includes('Jehan Daruvala'));
    assert(Boolean(jehan && jehan.era === 'International Contenders'), 'Jehan Daruvala celebrated as FIA F2 winner & FE factory driver');
    const kush = indianEcosystem.drivers.find(d => d.name.includes('Kush Maini'));
    assert(Boolean(kush && kush.era === 'International Contenders'), 'Kush Maini celebrated as Alpine F1 Reserve & F2 winner');

    // Test 6 City Franchises
    assert(indianEcosystem.franchises.length === 6, `Features 6 Indian Racing Festival city franchises (got ${indianEcosystem.franchises.length})`);
    const goa = indianEcosystem.franchises.find(f => f.city === 'Goa');
    const hyderabad = indianEcosystem.franchises.find(f => f.city === 'Hyderabad');
    assert(Boolean(goa && hyderabad), 'Franchises include Goa Aces and Hyderabad Blackbirds');
  }

  // 7. Universal Discovery, Search & Cross-Championship Interconnectedness
  console.log('\n7. Universal Discovery, Search & Cross-Championship Interconnectedness:');
  const fullIndex = await getUniversalSearchIndex();
  assert(fullIndex.length >= 50, `Universal search index compiles comprehensive multi-series entities (got ${fullIndex.length})`);

  // Test multi-series search for shared circuit (Spa)
  const spaResults = await searchMotorsport('Spa');
  assert(spaResults.length >= 3, `Searching "Spa" returns multi-championship matches (got ${spaResults.length})`);
  const spaChamps = spaResults.map(r => r.championshipName).filter(Boolean);
  assert(spaChamps.includes('Formula 1') || spaResults.some(r => r.id.includes('spa')), 'Spa search connects to Formula 1');
  assert(spaResults.some(r => r.title.includes('Spa') || r.subtitle.includes('Spa')), 'Spa search matches venue title or subtitle');

  // Test technical concept search (Attack Mode)
  const attackModeResults = await searchMotorsport('Attack Mode');
  assert(attackModeResults.length >= 1, 'Searching "Attack Mode" returns Formula E electric concept');
  assert(attackModeResults[0].championshipName === 'Formula E', 'Attack Mode is correctly attributed to Formula E');

  // Test rider search (Bagnaia)
  const bagnaiaResults = await searchMotorsport('Bagnaia');
  assert(bagnaiaResults.length >= 1, 'Searching "Bagnaia" returns premier MotoGP rider');
  assert(bagnaiaResults[0].championshipName === 'MotoGP', 'Bagnaia is attributed to MotoGP');

  // Test rally driver search (Neuville)
  const neuvilleResults = await searchMotorsport('Neuville');
  assert(neuvilleResults.length >= 1, 'Searching "Neuville" returns WRC rally driver');
  assert(neuvilleResults[0].championshipName === 'WRC', 'Neuville is attributed to WRC');

  // Test Indian driver search (Daruvala)
  const daruvalaResults = await searchMotorsport('Daruvala');
  assert(daruvalaResults.length >= 1, 'Searching "Daruvala" returns Indian driver contender');

  // Test category filtering (Teams only)
  const teamResults = await searchMotorsport('Ferrari', 'team');
  assert(teamResults.length >= 1, 'Category filtered search for Ferrari returns team entities');
  assert(teamResults.every(r => r.category === 'team'), 'All results match the requested team category');

  // Test cross-championship venue hostings registry
  const spaHostings = getCrossChampionshipHostings('spa');
  assert(spaHostings.length >= 3, `Spa hosts multiple world championships (got ${spaHostings.length})`);
  const silverstoneHostings = getCrossChampionshipHostings('silverstone');
  assert(silverstoneHostings.some(h => h.championshipId === 'motogp'), 'Silverstone cross-links to MotoGP British Grand Prix');
  const buddhHostings = getCrossChampionshipHostings('buddh');
  assert(buddhHostings.some(h => h.championshipId === 'indian-motorsport'), 'Buddh International Circuit cross-links to Indian Motorsport');
  assert(buddhHostings.some(h => h.championshipId === 'motogp'), 'Buddh International Circuit cross-links to MotoGP');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  if (failed === 0) {
    console.log('🏆 ALL MOTORSPORT FOUNDATION & EXPANSION TESTS PASSED!\n');
  } else {
    console.error('❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Verification suite crashed:', err);
  process.exit(1);
});
