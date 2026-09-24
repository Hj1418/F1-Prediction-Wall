/**
 * The Grid — Centralized Motorsport Data Source Registry
 * 
 * Provides an authoritative index of all verified external data sources,
 * their legal licensing terms, authority tiers, and attribution requirements.
 */

import { SourceDefinition, SourceProvenanceMetadata } from '../../types/dataContract';

export const MOTORSPORT_SOURCE_REGISTRY: Record<string, SourceDefinition> = {
  'fia-official': {
    sourceId: 'fia-official',
    discipline: 'f1',
    datasetType: 'REGULATIONS_AND_STEWARD_DECISIONS',
    sourceName: "Fédération Internationale de l'Automobile (FIA)",
    sourceUrl: 'https://www.fia.com/regulation/category/110',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: "Source: Fédération Internationale de l'Automobile (FIA)",
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for sporting regulations, technical directives, track limits, and official steward bulletins. Content is linked and summarized in The Grid original wording without copying copyrighted texts.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'f1-official': {
    sourceId: 'f1-official',
    discipline: 'f1',
    datasetType: 'CALENDAR_AND_TITLES',
    sourceName: 'Formula 1 Official (Formula One World Championship Limited)',
    sourceUrl: 'https://www.formula1.com',
    sourceType: 'REGISTRY',
    authorityLevel: 'OFFICIAL',
    license: 'Proprietary Reference / Fair Use Citation',
    attributionRequirement: 'Formula One World Championship Limited',
    updateFrequency: 'SEASONAL',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for Grand Prix official titles, event branding, and promoter announcements.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'jolpica-f1': {
    sourceId: 'jolpica-f1',
    discipline: 'f1',
    datasetType: 'CALENDAR_SESSIONS_AND_RESULTS',
    sourceName: 'Jolpica-F1 (Ergast Format API)',
    sourceUrl: 'https://api.jolpi.ca/ergast/f1/',
    sourceType: 'API',
    authorityLevel: 'PRIMARY_OPEN_DATA',
    license: 'MIT / Ergast Open Data License',
    attributionRequirement: 'Data provided by Jolpica-F1 (Ergast Compatible API)',
    updateFrequency: 'POST_SESSION',
    fallbackSourceId: 'the-grid-fallback',
    ingestionMethod: 'AUTOMATED_SYNC',
    notes: 'Authoritative open structured API for race calendar schedules, sessions, green-flag timestamps, driver numbers, and race outcomes.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'f1db': {
    sourceId: 'f1db',
    discipline: 'f1',
    datasetType: 'HISTORICAL_AND_CIRCUITS',
    sourceName: 'F1DB (The Open-Source Formula 1 Database)',
    sourceUrl: 'https://github.com/f1db/f1db',
    sourceType: 'DATASET',
    authorityLevel: 'SECONDARY_OPEN_DATA',
    license: 'CC0 1.0 Universal (Public Domain)',
    attributionRequirement: 'F1DB Project (CC0 1.0)',
    updateFrequency: 'SEASONAL',
    ingestionMethod: 'VALIDATED_FIXTURE',
    notes: 'Structured historical lap records, circuit lengths, turns, and debut Grand Prix years.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-01-15',
  },

  'the-grid-circuits': {
    sourceId: 'the-grid-circuits',
    discipline: 'global',
    datasetType: 'CIRCUITS',
    sourceName: 'The Grid Verified Circuit Vector Registry',
    sourceUrl: 'https://github.com/julesr0y/f1-circuits-svg',
    sourceType: 'REGISTRY',
    authorityLevel: 'PRIMARY_OPEN_DATA',
    license: 'CC BY 4.0 by Jules ROY',
    attributionRequirement: 'Layout vector assets based on f1-circuits-svg by Jules ROY (CC BY 4.0)',
    updateFrequency: 'STATIC',
    ingestionMethod: 'VALIDATED_FIXTURE',
    notes: 'Verified local SVG vectors for 24 World Championship venues and Buddh International Circuit.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fia-f2-official': {
    sourceId: 'fia-f2-official',
    discipline: 'f2',
    datasetType: 'REGULATIONS_AND_STANDINGS',
    sourceName: 'FIA Formula 2 Championship (FIA Official)',
    sourceUrl: 'https://www.fiaformula2.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'FIA Formula 2 Championship',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for FIA Formula 2 sporting regulations, reverse-grid sprint rules, Dallara F2 2024 technical specs, and official standings.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fia-f3-official': {
    sourceId: 'fia-f3-official',
    discipline: 'f3',
    datasetType: 'REGULATIONS_AND_STANDINGS',
    sourceName: 'FIA Formula 3 Championship (FIA Official)',
    sourceUrl: 'https://www.fiaformula3.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'FIA Formula 3 Championship',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for FIA Formula 3 sporting regulations, top-12 reverse grid sprint rules, Dallara F3 2025 technical specs, and official standings.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'f1-junior-academies': {
    sourceId: 'f1-junior-academies',
    discipline: 'f1',
    datasetType: 'JUNIOR_ACADEMIES',
    sourceName: 'Formula 1 Team Junior Driver Development Registry',
    sourceUrl: 'https://www.formula1.com/en/latest/tags.junior-drivers',
    sourceType: 'REGISTRY',
    authorityLevel: 'PRIMARY_OPEN_DATA',
    license: 'Reference Citation / Public Roster Data',
    attributionRequirement: 'The Grid Junior Academy Pathway Registry',
    updateFrequency: 'SEASONAL',
    ingestionMethod: 'VALIDATED_FIXTURE',
    notes: 'Roster of junior driver contracts and affiliations linking F2/F3 drivers to F1 team development programmes.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fia-wec-official': {
    sourceId: 'fia-wec-official',
    discipline: 'wec',
    datasetType: 'CHAMPIONSHIP_RESULTS',
    sourceName: 'FIA World Endurance Championship & ACO Official Timing',
    sourceUrl: 'https://www.fiawec.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'FIA World Endurance Championship & Automobile Club de l’Ouest',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for FIA WEC sporting regulations, Hypercar & LMGT3 multi-class classifications, 24h Le Mans double points, and BoP directives.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fim-motogp-official': {
    sourceId: 'fim-motogp-official',
    discipline: 'motogp',
    datasetType: 'CHAMPIONSHIP_RESULTS',
    sourceName: 'FIM & Dorna Sports MotoGP Official Timing',
    sourceUrl: 'https://www.motogp.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'Fédération Internationale de Motocyclisme (FIM) & Dorna Sports',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for FIM MotoGP World Championship regulations, Tissot Sprint points, Grand Prix points, and manufacturer Concession rankings.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fia-formula-e-official': {
    sourceId: 'fia-formula-e-official',
    discipline: 'formula-e',
    datasetType: 'CHAMPIONSHIP_RESULTS_AND_ROSTER',
    sourceName: 'FIA Formula E Championship Official Timing & Scoring',
    sourceUrl: 'https://www.fiaformulae.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'FIA Formula E Championship',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for Gen3 Evo electric vehicle specifications, attack mode allocations, duel qualifying, and season standings.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fia-wrc-official': {
    sourceId: 'fia-wrc-official',
    discipline: 'wrc',
    datasetType: 'RALLY_RESULTS_AND_CREWS',
    sourceName: 'FIA World Rally Championship (WRC Promoter GmbH & FIA)',
    sourceUrl: 'https://www.wrc.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'FIA World Rally Championship',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for Rally1 and Rally2 entry lists, driver/co-driver crew pairings, stage times, power stage points, and championship standings.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'sro-gt-official': {
    sourceId: 'sro-gt-official',
    discipline: 'gt-world-challenge',
    datasetType: 'GT3_RESULTS_AND_BOP',
    sourceName: 'SRO Motorsports Group (Fanatec GT World Challenge)',
    sourceUrl: 'https://www.gt-world-challenge.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: 'SRO Motorsports Group',
    updateFrequency: 'POST_SESSION',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for GT3 homologation, SRO Balance of Performance (BoP) bulletins, driver categorisation lists, and Spa 24 Hours classifications.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fmsci-india-official': {
    sourceId: 'fmsci-india-official',
    discipline: 'indian-motorsport',
    datasetType: 'NATIONAL_SERIES_REGISTRATION',
    sourceName: 'Federation of Motor Sports Clubs of India (FMSCI)',
    sourceUrl: 'https://www.fmsci.co.in',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official National Sporting Authority (ASN) Reference',
    attributionRequirement: 'Federation of Motor Sports Clubs of India (FMSCI)',
    updateFrequency: 'SEASONAL',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative national governing body for Indian Racing League (IRL), F4 Indian Championship, INRC, and licensed permanent circuits (BIC, MMRT, Kari, CoASTT).',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'aco-lemans-official': {
    sourceId: 'aco-lemans-official',
    discipline: 'wec',
    datasetType: 'LE_MANS_ENTRY_LIST',
    sourceName: "Automobile Club de l'Ouest (ACO)",
    sourceUrl: 'https://www.24h-lemans.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Event Regulatory Reference',
    attributionRequirement: "Automobile Club de l'Ouest (ACO)",
    updateFrequency: 'SEASONAL',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for official 24 Hours of Le Mans 62-car invitation list, test day results, Hyperpole results, and multi-class classifications.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },

  'fia-f4-official': {
    sourceId: 'fia-f4-official',
    discipline: 'f4',
    datasetType: 'NATIONAL_F4_REGULATIONS',
    sourceName: 'FIA Formula 4 Global Technical Framework',
    sourceUrl: 'https://www.fia.com',
    sourceType: 'OFFICIAL_DOCUMENT',
    authorityLevel: 'OFFICIAL',
    license: 'Official Regulatory Publication / Educational Reference',
    attributionRequirement: "Fédération Internationale de l'Automobile (FIA)",
    updateFrequency: 'SEASONAL',
    ingestionMethod: 'REFERENCE_LINK',
    notes: 'Authoritative for global Gen2 F4 homologation standards, Tatuus/Mygale chassis specs, 12 Super Licence points allocation, and junior progression.',
    currentStatus: 'ACTIVE',
    lastVerifiedDate: '2026-03-01',
  },
};

/**
 * Returns the source definition for a given source ID.
 */
export function getSourceDefinition(sourceId: string): SourceDefinition | undefined {
  return MOTORSPORT_SOURCE_REGISTRY[sourceId];
}

/**
 * Returns all registered sources for a specific motorsport discipline (e.g. 'f1', 'global').
 */
export function getSourcesByDiscipline(discipline: string): SourceDefinition[] {
  return Object.values(MOTORSPORT_SOURCE_REGISTRY).filter(
    s => s.discipline === discipline || s.discipline === 'global'
  );
}

/**
 * Generates an authoritative SourceProvenanceMetadata stamp for an entity or dataset.
 */
export function createProvenanceMetadata(sourceId: string, version?: string): SourceProvenanceMetadata {
  const source = getSourceDefinition(sourceId);
  if (!source) {
    return {
      sourceId,
      authorityLevel: 'REFERENCE_ONLY',
      license: 'Unspecified',
      attribution: 'The Grid Community Reference',
      sourceUrl: '',
      retrievedAt: new Date().toISOString(),
      version,
    };
  }

  return {
    sourceId: source.sourceId,
    authorityLevel: source.authorityLevel,
    license: source.license,
    attribution: source.attributionRequirement,
    sourceUrl: source.sourceUrl,
    retrievedAt: new Date().toISOString(),
    version,
  };
}

/**
 * Validates whether a source ID exists and matches the required minimum authority level.
 */
export function isAuthoritativeSource(sourceId: string): boolean {
  const source = getSourceDefinition(sourceId);
  if (!source) return false;
  return source.authorityLevel === 'OFFICIAL' || source.authorityLevel === 'PRIMARY_OPEN_DATA';
}
