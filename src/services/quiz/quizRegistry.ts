import { QuizCategory, FanIdentityTier } from '../../types/quiz';

/**
 * The Grid — Centralized Motorsport Category Registry
 * 
 * Extensible category registry defining:
 * - Stable unique category IDs
 * - Official display names
 * - Championship groupings (Formula Racing, Motorcycle Racing, Endurance Racing, GT Racing)
 * - Descriptions & branding
 * - Question bank mapping
 */
export const MOTORSPORT_QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: 'formula-1',
    displayName: 'Formula 1',
    grouping: 'Formula Racing',
    description: 'The pinnacle of open-wheel single-seater motorsport governed by the FIA.',
    status: 'available',
    questionBankRef: 'formula-1',
    color: '#e10600',
    badge: 'F1',
  },
  {
    id: 'formula-2',
    displayName: 'Formula 2',
    grouping: 'Formula Racing',
    description: 'The ultimate feeder championship with spec Dallara chassis and Mecachrome engines.',
    status: 'available',
    questionBankRef: 'formula-2',
    color: '#0090d0',
    badge: 'F2',
  },
  {
    id: 'formula-3',
    displayName: 'Formula 3',
    grouping: 'Formula Racing',
    description: 'High-intensity 30-car junior battles on Grand Prix weekends.',
    status: 'available',
    questionBankRef: 'formula-3',
    color: '#e03a3e',
    badge: 'F3',
  },
  {
    id: 'formula-4',
    displayName: 'Formula 4',
    grouping: 'Formula Racing',
    description: 'The global entry-level single-seater category bridging karting to professional car racing.',
    status: 'available',
    questionBankRef: 'formula-4',
    color: '#10b981',
    badge: 'F4',
  },
  {
    id: 'formula-e',
    displayName: 'Formula E',
    grouping: 'Formula Racing',
    description: 'The premier all-electric FIA world championship racing on tight city street tracks.',
    status: 'available',
    questionBankRef: 'formula-e',
    color: '#00d2be',
    badge: 'FE',
  },
  {
    id: 'motogp',
    displayName: 'MotoGP',
    grouping: 'Motorcycle Racing',
    description: 'The pinnacle of two-wheeled motorcycle prototype road racing governed by FIM.',
    status: 'available',
    questionBankRef: 'motogp',
    color: '#dc2626',
    badge: 'MotoGP',
  },
  {
    id: 'endurance-racing',
    displayName: 'Endurance Racing',
    grouping: 'Endurance Racing',
    description: 'Multi-class sports prototype & GT endurance racing, headlined by Le Mans & FIA WEC.',
    status: 'available',
    questionBankRef: 'endurance-racing',
    color: '#2563eb',
    badge: 'WEC',
  },
  {
    id: 'gt-racing',
    displayName: 'GT Racing',
    grouping: 'GT Racing',
    description: 'Customer and manufacturer GT3/GT4 racing across premier sprint & endurance cups worldwide.',
    status: 'available',
    questionBankRef: 'gt-racing',
    color: '#f59e0b',
    badge: 'GT3',
  },
];

/**
 * Category ID lookup map supporting canonical IDs and common aliases
 */
export const CATEGORY_ID_MAP: Record<string, string> = {
  'formula-1': 'formula-1',
  'f1': 'formula-1',
  'formula-2': 'formula-2',
  'f2': 'formula-2',
  'formula-3': 'formula-3',
  'f3': 'formula-3',
  'formula-4': 'formula-4',
  'f4': 'formula-4',
  'formula-e': 'formula-e',
  'fe': 'formula-e',
  'motogp': 'motogp',
  'endurance-racing': 'endurance-racing',
  'endurance': 'endurance-racing',
  'wec': 'endurance-racing',
  'gt-racing': 'gt-racing',
  'gt': 'gt-racing',
  'gt3': 'gt-racing',
  'gt-world-challenge': 'gt-racing',
};

export function resolveCategoryId(rawId: string): string {
  const normalized = (rawId || '').toLowerCase().trim();
  return CATEGORY_ID_MAP[normalized] || normalized;
}

export function getQuizCategory(categoryId: string): QuizCategory | undefined {
  const resolvedId = resolveCategoryId(categoryId);
  return MOTORSPORT_QUIZ_CATEGORIES.find(c => c.id === resolvedId);
}

/**
 * Fan Identity Tier Thresholds
 * 
 * 0–39%: The Rookie
 * 40–59%: The Enthusiast
 * 60–79%: The Paddock Insider
 * 80–94%: The Race Strategist
 * 95–100%: The Motorsport Oracle
 */
export interface TierConfig {
  tier: FanIdentityTier;
  minPercentage: number;
  maxPercentage: number;
  title: string;
  tagline: string;
  color: string;
  description: string;
}

export const FAN_IDENTITY_TIERS: TierConfig[] = [
  {
    tier: 'The Motorsport Oracle',
    minPercentage: 95,
    maxPercentage: 100,
    title: 'The Motorsport Oracle',
    tagline: 'Encyclopedic Knowledge & Tactical Precision',
    color: '#e10600',
    description: 'Unrivaled mastery across multiple racing disciplines. From tyre compounds to balance of performance, nothing escapes your radar.',
  },
  {
    tier: 'The Race Strategist',
    minPercentage: 80,
    maxPercentage: 94,
    title: 'The Race Strategist',
    tagline: 'Pit Wall Intel & Championship Acumen',
    color: '#a855f7',
    description: 'Sharp analytical grasp of technical regulations, feeder hierarchies, and race weekend dynamics.',
  },
  {
    tier: 'The Paddock Insider',
    minPercentage: 60,
    maxPercentage: 79,
    title: 'The Paddock Insider',
    tagline: 'Seasoned Follower of the Grid',
    color: '#00d2be',
    description: 'You follow the sport closely and understand the intricate nuances that separate champions from contenders.',
  },
  {
    tier: 'The Enthusiast',
    minPercentage: 40,
    maxPercentage: 59,
    title: 'The Enthusiast',
    tagline: 'Passionate Motorsport Follower',
    color: '#3b82f6',
    description: 'You love the roar of engines and watch marquee events, with plenty of room to explore deeper motorsport territory.',
  },
  {
    tier: 'The Rookie',
    minPercentage: 0,
    maxPercentage: 39,
    title: 'The Rookie',
    tagline: 'Fresh on the Starting Grid',
    color: '#94a3b8',
    description: 'Your motorsport journey has just begun. Explore The Grid explore hubs to level up your racing knowledge.',
  },
];

/**
 * Documented Rounding Policy:
 * Percentages are rounded to the nearest integer using Math.round().
 * Handles boundaries safely and clamps result between 0 and 100.
 */
export function calculateOverallPercentage(correctCount: number, totalQuestions: number): number {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  const raw = (correctCount / totalQuestions) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function calculateCategoryPercentage(correctCount: number, totalQuestions: number): number {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  const raw = (correctCount / totalQuestions) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Calculates Fan Identity Tier from overall percentage
 */
export function calculateFanIdentityTier(percentage: number): FanIdentityTier {
  const rounded = Math.max(0, Math.min(100, Math.round(percentage)));
  if (rounded >= 95) return 'The Motorsport Oracle';
  if (rounded >= 80) return 'The Race Strategist';
  if (rounded >= 60) return 'The Paddock Insider';
  if (rounded >= 40) return 'The Enthusiast';
  return 'The Rookie';
}

export function getTierDetails(tier: FanIdentityTier): TierConfig {
  return (
    FAN_IDENTITY_TIERS.find(t => t.tier === tier) || {
      tier: 'The Rookie',
      minPercentage: 0,
      maxPercentage: 39,
      title: 'The Rookie',
      tagline: 'Fresh on the Starting Grid',
      color: '#94a3b8',
      description: 'Your motorsport journey has just begun.',
    }
  );
}

/**
 * Balanced Question Allocation Algorithm:
 * - Never exceeds maxTotal (default 15).
 * - Distributes questions as evenly as possible across selected categories.
 * - Respects available approved question count per category.
 * - If a category has fewer than its base quota, remaining quota is distributed to other selected categories.
 */
export function allocateQuestionsPerCategory(
  selectedCategoryIds: string[],
  maxTotal: number = 15,
  availablePerCategory: Record<string, number> = {}
): Record<string, number> {
  const allocation: Record<string, number> = {};
  if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
    return allocation;
  }

  // Deduplicate and resolve categories
  const resolvedCategories = Array.from(
    new Set(selectedCategoryIds.map(id => resolveCategoryId(id)))
  ).filter(id => MOTORSPORT_QUIZ_CATEGORIES.some(c => c.id === id));

  if (resolvedCategories.length === 0) {
    return allocation;
  }

  // Initialize all with 0
  for (const catId of resolvedCategories) {
    allocation[catId] = 0;
  }

  // Calculate available counts (defaulting to 15 if not specified)
  const available: Record<string, number> = {};
  for (const catId of resolvedCategories) {
    available[catId] = typeof availablePerCategory[catId] === 'number'
      ? availablePerCategory[catId]
      : 15;
  }

  let remainingSlots = maxTotal;
  let activeCategories = [...resolvedCategories];

  // Distribute slots in rounds as evenly as possible
  while (remainingSlots > 0 && activeCategories.length > 0) {
    const share = Math.floor(remainingSlots / activeCategories.length);
    const remainder = remainingSlots % activeCategories.length;

    if (share === 0) {
      // Give 1 slot to first 'remainder' categories that have capacity
      let allocatedInRemainder = 0;
      for (const catId of activeCategories) {
        if (allocation[catId] < available[catId]) {
          allocation[catId] += 1;
          allocatedInRemainder += 1;
          if (allocatedInRemainder >= remainder) break;
        }
      }
      break;
    }

    let allocatedInThisRound = 0;
    const stillActive: string[] = [];

    for (let i = 0; i < activeCategories.length; i++) {
      const catId = activeCategories[i];
      const targetToAdd = share + (i < remainder ? 1 : 0);
      const capacity = available[catId] - allocation[catId];
      const toAdd = Math.min(targetToAdd, capacity);

      allocation[catId] += toAdd;
      allocatedInThisRound += toAdd;

      if (allocation[catId] < available[catId]) {
        stillActive.push(catId);
      }
    }

    remainingSlots -= allocatedInThisRound;
    if (allocatedInThisRound === 0) {
      // No category could take any more questions
      break;
    }
    activeCategories = stillActive;
  }

  return allocation;
}
