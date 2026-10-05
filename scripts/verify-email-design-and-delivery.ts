/**
 * Verification Script: The Grid Email Design, Rendering & Subject Formatting
 * 
 * Verifies:
 * 1. formatGrandPrixName strips duplicate "Prediction" safely from all round titles.
 * 2. Prediction Confirmation Email:
 *    - Subject: "Prediction Locked In — [Grand Prix Name]" (No duplicate "Prediction")
 *    - Branded THE GRID header with motorsport red accent (#e10600)
 *    - Event section with Formula 1 & "● LOCKED" status badge
 *    - Message: "Your F1 prediction has been submitted successfully."
 *    - Structured selections table with driver names and positions
 *    - Prominent CTA: "VIEW MY PREDICTION" linking to Prediction Bench route
 *    - Secondary line: "Good luck! 🏁"
 *    - Structured plain-text fallback
 * 3. Prediction Results Email:
 *    - Subject: "Your [Grand Prix Name] Prediction Results" (No duplicate "Prediction")
 *    - Branded THE GRID header
 *    - Event section with Formula 1 & "● SCORED" status badge
 *    - Prominent score display (+PTS) & leaderboard rank
 *    - Point breakdown table
 *    - Primary CTA: "VIEW MY RESULTS"
 *    - Secondary CTA: "VIEW LEADERBOARD"
 *    - Structured plain-text fallback
 * 4. Google Apps Script backend/Code.gs integrity:
 *    - Contains HTML generation engine
 *    - processNotificationQueue always sets htmlBody
 *    - submitPrediction and adminCalculateScores pass clean subjects without duplicate Prediction
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  formatGrandPrixName,
  escapeHtml,
  buildPredictionConfirmationEmail,
  buildPredictionResultEmail,
  buildPredictionOpenEmail
} from '../src/services/notifications/emailTemplateBuilder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏁 Starting The Grid Email Design & Rendering Verification Suite...\n');

// ----------------------------------------------------------------------------
// 1. Dynamic Grand Prix Name & Subject Formatting Tests
// ----------------------------------------------------------------------------
console.log('--- 1. Testing formatGrandPrixName & Duplicate Subject Prevention ---');

assert.strictEqual(
  formatGrandPrixName('Grand Prix Prediction'),
  'Grand Prix',
  'Strips duplicate "Prediction" from "Grand Prix Prediction"'
);

assert.strictEqual(
  formatGrandPrixName('Australian Grand Prix Prediction'),
  'Australian Grand Prix',
  'Strips "Prediction" from "Australian Grand Prix Prediction"'
);

assert.strictEqual(
  formatGrandPrixName('Australian Grand Prix Race Prediction'),
  'Australian Grand Prix',
  'Strips "Race Prediction" from "Australian Grand Prix Race Prediction"'
);

assert.strictEqual(
  formatGrandPrixName('Bahrain Grand Prix in Malaysia'),
  'Bahrain Grand Prix in Malaysia',
  'Preserves clean Grand Prix name without trailing Prediction'
);

assert.strictEqual(
  formatGrandPrixName('Azerbaijan Grand Prix'),
  'Azerbaijan Grand Prix',
  'Preserves Azerbaijan Grand Prix'
);

assert.strictEqual(
  formatGrandPrixName(''),
  'Grand Prix',
  'Empty title defaults to Grand Prix'
);

assert.strictEqual(
  formatGrandPrixName(undefined),
  'Grand Prix',
  'Undefined title defaults to Grand Prix'
);

// Verify resulting subjects
const testConfirmSubject = `Prediction Locked In — ${formatGrandPrixName('Grand Prix Prediction')}`;
assert.strictEqual(
  testConfirmSubject,
  'Prediction Locked In — Grand Prix',
  'Confirmation subject does not have duplicate "Prediction"'
);

const testResultSubject = `Your ${formatGrandPrixName('Grand Prix Prediction')} Prediction Results`;
assert.strictEqual(
  testResultSubject,
  'Your Grand Prix Prediction Results',
  'Result subject does not have duplicate "Prediction Prediction"'
);

console.log('  ✓ PASS: formatGrandPrixName eliminates all duplicate Prediction occurrences');

// ----------------------------------------------------------------------------
// 2. Prediction Confirmation Email Verification
// ----------------------------------------------------------------------------
console.log('\n--- 2. Testing Prediction Confirmation Email Template ---');

const confirmEmail = buildPredictionConfirmationEmail({
  recipientName: 'Harsh Jalnekar',
  roundTitle: 'Australian Grand Prix Prediction',
  raceName: 'Australian Grand Prix',
  roundNumber: 1,
  picks: [
    { position: 'P1 Winner', driverName: 'Kimi Antonelli', teamName: 'Mercedes-AMG PETRONAS' },
    { position: 'P2 Second Place', driverName: 'George Russell', teamName: 'Mercedes-AMG PETRONAS' },
    { position: 'P3 Third Place', driverName: 'Lewis Hamilton', teamName: 'Scuderia Ferrari' },
    { position: 'Fastest Lap', driverName: 'Charles Leclerc', teamName: 'Scuderia Ferrari' },
  ],
  expectedResultsFormatted: 'Sunday, 15 Mar 2026, 12:30 IST'
});

// Subject assertion
assert.strictEqual(
  confirmEmail.subject,
  'Prediction Locked In — Australian Grand Prix',
  'Confirmation subject is clean and correctly formatted'
);
assert(!confirmEmail.subject.includes('Prediction Prediction'), 'Subject has no duplicate Prediction');

// HTML structure assertions
const html = confirmEmail.htmlBody;
assert(html.includes('<!DOCTYPE html>'), 'Email contains standard HTML doctype');
assert(html.includes('THE GRID • FORMULA 1 PREDICTION BENCH'), 'Email contains The Grid branded header');
assert(html.includes('PREDICTION LOCKED IN') || html.includes('Prediction Locked In'), 'Email contains prominent heading');
assert(html.includes('FORMULA 1'), 'Email includes Formula 1 championship reference');
assert(html.includes('Australian Grand Prix'), 'Email includes Grand Prix name');
assert(html.includes('LOCKED'), 'Email includes LOCKED status badge');
assert(html.includes('Your F1 prediction has been submitted successfully.'), 'Email includes exact confirmation copy');
assert(html.includes('CONFIRMED SELECTIONS'), 'Email includes confirmed selections table header');
assert(html.includes('Kimi Antonelli'), 'Email includes driver name in picks table');
assert(html.includes('Mercedes-AMG PETRONAS'), 'Email includes team name in picks table');
assert(html.includes('VIEW MY PREDICTION'), 'Email includes prominent [ VIEW MY PREDICTION ] CTA button');
assert(html.includes('https://hj1418.github.io/F1-Prediction-Wall/#/predictions'), 'CTA links to existing Prediction Bench route');
assert(html.includes('Good luck! 🏁'), 'Email includes secondary line: Good luck! 🏁');
assert(html.includes('#e10600'), 'Email includes motorsport red primary color');
assert(html.includes('#0a0d14') || html.includes('#121721'), 'Email includes dark motorsport background');

// Plain text fallback assertions
const text = confirmEmail.body;
assert(text.includes('PREDICTION LOCKED IN'), 'Text fallback contains heading');
assert(text.includes('Australian Grand Prix'), 'Text fallback contains event name');
assert(text.includes('Status: LOCKED'), 'Text fallback contains LOCKED status');
assert(text.includes('Your F1 prediction has been submitted successfully.'), 'Text fallback contains confirmation copy');
assert(text.includes('VIEW MY PREDICTION:'), 'Text fallback contains CTA text');
assert(text.includes('https://hj1418.github.io/F1-Prediction-Wall/#/predictions'), 'Text fallback contains absolute link');
assert(text.includes('Good luck! 🏁'), 'Text fallback contains secondary line');

console.log('  ✓ PASS: Prediction Confirmation email satisfies all layout, copy, branding and CTA requirements');

// ----------------------------------------------------------------------------
// 3. Prediction Results Email Verification
// ----------------------------------------------------------------------------
console.log('\n--- 3. Testing Prediction Results Email Template ---');

const resultEmail = buildPredictionResultEmail({
  recipientName: 'Harsh Jalnekar',
  roundTitle: 'Grand Prix Prediction',
  raceName: 'Grand Prix Prediction',
  roundNumber: 15,
  totalScore: 30,
  breakdown: {
    p1: 10,
    p2: 0,
    p3: 0,
    fastestLap: 7,
    safetyCar: 5,
    virtualSafetyCar: 5,
    redFlag: 0,
    yellowFlag: 3
  },
  leaderboardRank: 3
});

// Subject assertion
assert.strictEqual(
  resultEmail.subject,
  'Your Grand Prix Prediction Results',
  'Result subject correctly formatted without duplicate Prediction'
);
assert(!resultEmail.subject.includes('Prediction Prediction'), 'Result subject has no duplicate Prediction');

// HTML structure assertions
const resHtml = resultEmail.htmlBody;
assert(resHtml.includes('<!DOCTYPE html>'), 'Result email contains standard doctype');
assert(resHtml.includes('THE GRID • FORMULA 1 PREDICTION BENCH'), 'Result email contains The Grid branded header');
assert(resHtml.includes('YOUR PREDICTION RESULTS ARE IN') || resHtml.includes('Your Prediction Results Are In'), 'Result email contains prominent heading');
assert(resHtml.includes('SCORED'), 'Result email includes SCORED status badge');
assert(resHtml.includes('TOTAL SESSION SCORE'), 'Result email includes score section header');
assert(resHtml.includes('+30') || resHtml.includes('30'), 'Result email prominently displays earned points');
assert(resHtml.includes('Rank #3'), 'Result email displays leaderboard rank when available');
assert(resHtml.includes('POINT BREAKDOWN'), 'Result email includes point breakdown table');
assert(resHtml.includes('+10 PTS'), 'Result email includes individual breakdown pts');
assert(resHtml.includes('VIEW MY RESULTS'), 'Result email contains prominent [ VIEW MY RESULTS ] CTA button');
assert(resHtml.includes('VIEW LEADERBOARD'), 'Result email contains secondary [ VIEW LEADERBOARD ] CTA button');
assert(resHtml.includes('https://hj1418.github.io/F1-Prediction-Wall/#/predictions'), 'Primary CTA links to predictions route');
assert(resHtml.includes('https://hj1418.github.io/F1-Prediction-Wall/#/leaderboard'), 'Secondary CTA links to leaderboard route');
assert(resHtml.includes('Points have been credited to your championship tally.'), 'Result email includes secondary summary information');

// Plain text fallback assertions
const resText = resultEmail.body;
assert(resText.includes('YOUR PREDICTION RESULTS ARE IN'), 'Result text contains heading');
assert(resText.includes('Status: SCORED'), 'Result text contains SCORED status');
assert(resText.includes('TOTAL SESSION SCORE: +30 PTS') || resText.includes('30 PTS'), 'Result text contains points');
assert(resText.includes('Leaderboard Rank: #3'), 'Result text contains rank');
assert(resText.includes('VIEW MY RESULTS:'), 'Result text contains results link label');
assert(resText.includes('VIEW LEADERBOARD:'), 'Result text contains leaderboard link label');

console.log('  ✓ PASS: Prediction Results email satisfies all score summary, breakdown, CTAs and hierarchy requirements');

// ----------------------------------------------------------------------------
// 4. Backend (Code.gs) Architecture Audit
// ----------------------------------------------------------------------------
console.log('\n--- 4. Auditing backend/Code.gs Implementation ---');

const codeGsPath = path.resolve(__dirname, '../backend/Code.gs');
const codeGsContent = fs.readFileSync(codeGsPath, 'utf-8');

assert(codeGsContent.includes('function formatGrandPrixName'), 'Code.gs exports formatGrandPrixName helper');
assert(codeGsContent.includes('function buildTheGridEmailShell'), 'Code.gs includes shared email shell');
assert(codeGsContent.includes('function generatePredictionConfirmationEmail'), 'Code.gs includes prediction confirmation generator');
assert(codeGsContent.includes('function generatePredictionResultEmail'), 'Code.gs includes prediction result generator');
assert(codeGsContent.includes('function generateWelcomeEmail'), 'Code.gs includes welcome email generator');
assert(codeGsContent.includes('emailOpts.htmlBody = finalHtmlBody;'), 'Code.gs processNotificationQueue ensures htmlBody is always passed to MailApp');
assert(codeGsContent.includes('Prediction Locked In — \' + gpName'), 'Code.gs formats confirmation subject without duplicate Prediction');
assert(codeGsContent.includes('Your \' + gpName + \' Prediction Results'), 'Code.gs formats results subject without duplicate Prediction');
assert(codeGsContent.includes('VIEW MY PREDICTION'), 'Code.gs includes [ VIEW MY PREDICTION ] CTA');
assert(codeGsContent.includes('VIEW MY RESULTS'), 'Code.gs includes [ VIEW MY RESULTS ] CTA');
assert(codeGsContent.includes('VIEW LEADERBOARD'), 'Code.gs includes [ VIEW LEADERBOARD ] CTA');

console.log('  ✓ PASS: backend/Code.gs contains complete rich email engine with guaranteed htmlBody delivery');

console.log('\n🏆 ALL EMAIL RENDERING & REGRESSION AUDIT TESTS PASSED PERFECTLY!\n');
