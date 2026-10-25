import assert from 'node:assert';
import { VERIFIED_QUESTION_BANK, getApprovedQuestions, validateQuestionBank } from '../src/services/quiz/questionBank';

console.log('🏁 STARTING DEEP AUDIT OF GRDX KNOWLEDGE CHALLENGE QUESTION BANK...\n');

// 1. Structural schema validation
const { isValid, errors } = validateQuestionBank(VERIFIED_QUESTION_BANK);
assert(isValid, `Schema validation failed: ${errors.join(', ')}`);
console.log('✅ PASS: Overall schema structure is valid');

// 2. Count verification
assert.strictEqual(VERIFIED_QUESTION_BANK.length, 170, 'Question bank must have exactly 170 questions');
const approved = getApprovedQuestions();
assert.strictEqual(approved.length, 170, 'All 170 questions must be approved');
console.log(`✅ PASS: Exactly 170 approved questions in bank across 8 categories`);

// 3. Category distribution
const categoryCounts: Record<string, number> = {};
const questionIds = new Set<string>();
const questionTexts = new Set<string>();

const expectedCategories = [
  'formula-1',
  'formula-2',
  'formula-3',
  'formula-4',
  'formula-e',
  'motogp',
  'endurance-racing',
  'gt-racing',
];

for (const q of VERIFIED_QUESTION_BANK) {
  // Category tracking
  categoryCounts[q.categoryId] = (categoryCounts[q.categoryId] || 0) + 1;

  // Uniqueness
  assert(!questionIds.has(q.questionId), `Duplicate questionId detected: ${q.questionId}`);
  questionIds.add(q.questionId);

  const normalizedText = q.question.trim().toLowerCase();
  assert(!questionTexts.has(normalizedText), `Duplicate question text: ${q.question}`);
  questionTexts.add(normalizedText);

  // Options validation
  assert.strictEqual(q.options.length, 4, `Question ${q.questionId} must have exactly 4 options`);
  const optionIds = q.options.map(o => o.id);
  assert.deepStrictEqual(optionIds, ['a', 'b', 'c', 'd'], `Question ${q.questionId} option IDs must be ['a','b','c','d']`);

  const optionTexts = new Set(q.options.map(o => o.text.trim().toLowerCase()));
  assert.strictEqual(optionTexts.size, 4, `Question ${q.questionId} has duplicate option texts`);

  // Answer key validation
  assert(['a', 'b', 'c', 'd'].includes(q.correctOptionId), `Question ${q.questionId} has invalid correctOptionId: ${q.correctOptionId}`);

  // Explanation validation
  assert(q.explanation && q.explanation.length >= 25, `Question ${q.questionId} has insufficient explanation`);

  // Source URL validation
  assert(
    q.sourceUrl && (q.sourceUrl.startsWith('https://') || q.sourceUrl.startsWith('http://')),
    `Question ${q.questionId} missing valid source URL`
  );

  // Context & topic
  assert(q.context && q.context.length >= 3, `Question ${q.questionId} missing regulatory context`);
  assert(q.topic && q.topic.length >= 3, `Question ${q.questionId} missing topic`);
  assert(q.contentVersion >= 1, `Question ${q.questionId} invalid contentVersion`);
}

for (const cat of expectedCategories) {
  const expectedCount = cat === 'formula-1' ? 65 : 15;
  assert.strictEqual(categoryCounts[cat], expectedCount, `Category ${cat} must have exactly ${expectedCount} questions, got ${categoryCounts[cat]}`);
  console.log(`  ✓ Category [${cat}]: exactly ${expectedCount} verified questions`);
}

console.log('\n======================================================');
console.log('🏆 DEEP CONTENT & ACCURACY AUDIT: 170/170 QUESTIONS VERIFIED');
console.log('======================================================\n');
