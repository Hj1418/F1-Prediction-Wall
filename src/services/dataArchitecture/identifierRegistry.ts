/**
 * The Grid — Stable Identifier Registry & Provider Mapping
 * 
 * Maps external data provider keys (e.g. Jolpica, Ergast, F1DB) to stable,
 * discipline-agnostic internal The Grid identifiers, preserving circuit
 * normalization via the existing circuitRegistry.
 */

import { normalizeCircuitId } from '../circuits/circuitRegistry';
import { JuniorAcademy, JuniorAcademyId } from '../../types/dataContract';

// Driver ID mappings: [externalProviderKey] -> internalStableId
const DRIVER_EXTERNAL_MAPPING: Record<string, string> = {
  // Common Ergast/Jolpica driver IDs
  max_verstappen: 'verstappen',
  verstappen: 'verstappen',
  norris: 'norris',
  lando_norris: 'norris',
  piastri: 'piastri',
  oscar_piastri: 'piastri',
  leclerc: 'leclerc',
  charles_leclerc: 'leclerc',
  hamilton: 'hamilton',
  lewis_hamilton: 'hamilton',
  russell: 'russell',
  george_russell: 'russell',
  lawson: 'lawson',
  liam_lawson: 'lawson',
  antonelli: 'antonelli',
  kimi_antonelli: 'antonelli',
  alonso: 'alonso',
  fernando_alonso: 'alonso',
  stroll: 'stroll',
  lance_stroll: 'stroll',
  gasly: 'gasly',
  pierre_gasly: 'gasly',
  doohan: 'doohan',
  jack_doohan: 'doohan',
  albon: 'albon',
  alex_albon: 'albon',
  sainz: 'sainz',
  carlos_sainz: 'sainz',
  tsunoda: 'tsunoda',
  yuki_tsunoda: 'tsunoda',
  hadjar: 'hadjar',
  isack_hadjar: 'hadjar',
  hulkenberg: 'hulkenberg',
  nico_hulkenberg: 'hulkenberg',
  bortoleto: 'bortoleto',
  gabriel_bortoleto: 'bortoleto',
  ocon: 'ocon',
  esteban_ocon: 'ocon',
  bearman: 'bearman',
  oliver_bearman: 'bearman',
  bottas: 'bottas',
  valtteri_bottas: 'bottas',
  perez: 'perez',
  sergio_perez: 'perez',

  // F2 & F3 Feeder Drivers
  lindblad: 'lindblad',
  arvid_lindblad: 'lindblad',
  dunne: 'dunne',
  alex_dunne: 'dunne',
  browning: 'browning',
  luke_browning: 'browning',
  goethe: 'goethe',
  oliver_goethe: 'goethe',
  mini: 'mini',
  gabriele_mini: 'mini',
  marti: 'marti',
  josep_maria_marti: 'marti',
  maini: 'maini',
  kush_maini: 'maini',
  beganovic: 'beganovic',
  dino_beganovic: 'beganovic',
  camara: 'camara',
  rafael_camara: 'camara',
  taponen: 'taponen',
  tuukka_taponen: 'taponen',
  boya: 'boya',
  mari_boya: 'boya',
  tsolov: 'tsolov',
  nikola_tsolov: 'tsolov',
  leon: 'leon',
  noel_leon: 'leon',
  van_hoepen: 'van_hoepen',
  laurens_van_hoepen: 'van_hoepen',
  wurz: 'wurz',
  charlie_wurz: 'wurz',
  tramnitz: 'tramnitz',
  tim_tramnitz: 'tramnitz',
  badoer: 'badoer',
  brando_badoer: 'badoer',
  voisin: 'voisin',
  callum_voisin: 'voisin',
  stenshorne: 'stenshorne',
  martinius_stenshorne: 'stenshorne',
  floersch: 'floersch',
  sophia_floersch: 'floersch',

  // WEC Endurance Drivers (Hypercar & LMGT3)
  estre: 'estre',
  kevin_estre: 'estre',
  lotterer: 'lotterer',
  andre_lotterer: 'lotterer',
  vanthoor: 'vanthoor',
  laurens_vanthoor: 'vanthoor',
  fuoco: 'fuoco',
  antonio_fuoco: 'fuoco',
  molina: 'molina',
  miguel_molina: 'molina',
  nielsen: 'nielsen',
  nicklas_nielsen: 'nielsen',
  kobayashi: 'kobayashi',
  kamui_kobayashi: 'kobayashi',
  conway: 'conway',
  mike_conway: 'conway',
  de_vries: 'de_vries',
  nyck_de_vries: 'de_vries',
  pier_guidi: 'pier_guidi',
  alessandro_pier_guidi: 'pier_guidi',
  calado: 'calado',
  james_calado: 'calado',
  giovinazzi: 'giovinazzi',
  antonio_giovinazzi: 'giovinazzi',
  campbell: 'campbell',
  matt_campbell: 'campbell',
  christensen: 'christensen',
  michael_christensen: 'christensen',
  makowiecki: 'makowiecki',
  frederic_makowiecki: 'makowiecki',
  buemi: 'buemi',
  sebastien_buemi: 'buemi',
  hartley: 'hartley',
  brendon_hartley: 'hartley',
  hirakawa: 'hirakawa',
  ryo_hirakawa: 'hirakawa',
  kubica: 'kubica',
  robert_kubica: 'kubica',
  shwartzman: 'shwartzman',
  robert_shwartzman: 'shwartzman',
  ye: 'ye',
  yifei_ye: 'ye',
  d_vanthoor: 'd_vanthoor',
  dries_vanthoor: 'dries_vanthoor',
  marciello: 'marciello',
  raffaele_marciello: 'marciello',
  wittmann: 'wittmann',
  marco_wittmann: 'wittmann',
  lynn: 'lynn',
  alex_lynn: 'lynn',
  bamber: 'bamber',
  earl_bamber: 'bamber',
  bourdais: 'bourdais',
  sebastien_bourdais: 'bourdais',
  milesi: 'milesi',
  charles_milesi: 'milesi',
  m_schumacher: 'm_schumacher',
  mick_schumacher: 'mick_schumacher',
  bachler: 'bachler',
  klaus_bachler: 'bachler',
  rovera: 'rovera',
  alessio_rovera: 'rovera',
  rossi: 'rossi',
  valentino_rossi: 'rossi',
  gatting: 'gatting',
  michelle_gatting: 'gatting',
  bovy: 'bovy',
  sarah_bovy: 'bovy',

  // MotoGP World Championship Riders
  martin: 'martin',
  jorge_martin: 'martin',
  bagnaia: 'bagnaia',
  francesco_bagnaia: 'bagnaia',
  pecco_bagnaia: 'bagnaia',
  m_marquez: 'm_marquez',
  marc_marquez: 'm_marquez',
  marquez: 'm_marquez',
  bastianini: 'bastianini',
  enea_bastianini: 'bastianini',
  acosta: 'acosta',
  pedro_acosta: 'acosta',
  binder: 'binder',
  brad_binder: 'binder',
  vinales: 'vinales',
  maverick_vinales: 'vinales',
  quartararo: 'quartararo',
  fabio_quartararo: 'quartararo',
  bezzecchi: 'bezzecchi',
  marco_bezzecchi: 'bezzecchi',
  morbidelli: 'morbidelli',
  franco_morbidelli: 'morbidelli',
  di_giannantonio: 'di_giannantonio',
  fabio_di_giannantonio: 'di_giannantonio',
  a_espargaro: 'a_espargaro',
  aleix_espargaro: 'a_espargaro',
  a_marquez: 'a_marquez',
  alex_marquez: 'a_marquez',
  miller: 'miller',
  jack_miller: 'miller',
  oliveira: 'oliveira',
  miguel_oliveira: 'oliveira',
  r_fernandez: 'r_fernandez',
  raul_fernandez: 'r_fernandez',
  mir: 'mir',
  joan_mir: 'mir',
  zarco: 'zarco',
  johann_zarco: 'zarco',
  rins: 'rins',
  alex_rins: 'rins',
  nakagami: 'nakagami',
  takaaki_nakagami: 'nakagami',
  marini: 'marini',
  luca_marini: 'marini',
  a_fernandez: 'a_fernandez',
  augusto_fernandez: 'a_fernandez',
};

// Team / Constructor ID mappings: [externalProviderKey] -> internalStableId
const TEAM_EXTERNAL_MAPPING: Record<string, string> = {
  red_bull: 'red_bull',
  red_bull_racing: 'red_bull',
  'red-bull': 'red_bull',
  ferrari: 'ferrari',
  scuderia_ferrari: 'ferrari',
  mclaren: 'mclaren',
  mercedes: 'mercedes',
  mercedes_amg: 'mercedes',
  aston_martin: 'aston_martin',
  williams: 'williams',
  williams_racing: 'williams',
  racing_bulls: 'racing_bulls',
  rb: 'racing_bulls',
  alphatauri: 'racing_bulls',
  alpine: 'alpine',
  alpine_f1: 'alpine',
  sauber: 'sauber_audi',
  sauber_audi: 'sauber_audi',
  stake_f1: 'sauber_audi',
  audi: 'sauber_audi',
  haas: 'haas',
  haas_f1_team: 'haas',
  cadillac: 'cadillac',
  cadillac_f1: 'cadillac',

  // F2 & F3 Feeder Teams
  campos: 'campos',
  campos_racing: 'campos',
  rodin: 'rodin',
  rodin_motorsport: 'rodin',
  prema: 'prema',
  prema_racing: 'prema',
  mp_motorsport: 'mp_motorsport',
  mp: 'mp_motorsport',
  art: 'art_gp',
  art_gp: 'art_gp',
  art_grand_prix: 'art_gp',
  invicta: 'invicta',
  invicta_racing: 'invicta',
  hitech: 'hitech',
  hitech_pulse_eight: 'hitech',
  hitech_grand_prix: 'hitech',
  trident: 'trident',
  trident_motorsport: 'trident',
  van_amersfoort: 'van_amersfoort',
  van_amersfoort_racing: 'van_amersfoort',
  var: 'van_amersfoort',
  aix: 'aix_racing',
  aix_racing: 'aix_racing',
  dams: 'dams',
  dams_lucas_oil: 'dams',

  // WEC Endurance Teams (Hypercar & LMGT3)
  porsche_penske: 'porsche_penske',
  porsche_penske_motorsport: 'porsche_penske',
  ferrari_af_corse: 'ferrari_af_corse',
  af_corse: 'ferrari_af_corse',
  toyota_gazoo_racing: 'toyota_gazoo',
  toyota_gazoo: 'toyota_gazoo',
  toyota: 'toyota_gazoo',
  bmw_m_team_wrt: 'bmw_wrt',
  bmw_wrt: 'bmw_wrt',
  cadillac_racing: 'cadillac_racing',
  cadillac_wec: 'cadillac_racing',
  alpine_endurance: 'alpine_endurance',
  alpine_endurance_team: 'alpine_endurance',
  peugeot_totalenergies: 'peugeot_totalenergies',
  peugeot: 'peugeot_totalenergies',
  aston_martin_thor: 'aston_martin_thor',
  manthey_purerxcing: 'manthey',
  manthey: 'manthey',
  vista_af_corse: 'vista_af_corse',
  team_wrt: 'team_wrt',
  heart_of_racing: 'heart_of_racing',
  heart_of_racing_team: 'heart_of_racing',
  iron_dames: 'iron_dames',
  united_autosports: 'united_autosports',

  // MotoGP Teams & Factories
  ducati_lenovo: 'ducati_lenovo',
  ducati_lenovo_team: 'ducati_lenovo',
  ducati: 'ducati_lenovo',
  prima_pramac: 'pramac_racing',
  pramac: 'pramac_racing',
  pramac_racing: 'pramac_racing',
  prima_pramac_racing: 'pramac_racing',
  gresini_racing: 'gresini_racing',
  gresini: 'gresini_racing',
  gresini_racing_motogp: 'gresini_racing',
  vr46: 'vr46_racing',
  vr46_racing: 'vr46_racing',
  pertamina_enduro_vr46: 'vr46_racing',
  ktm_factory: 'ktm_factory',
  red_bull_ktm: 'ktm_factory',
  red_bull_ktm_factory_racing: 'ktm_factory',
  ktm: 'ktm_factory',
  tech3: 'tech3_racing',
  gasgas_tech3: 'tech3_racing',
  red_bull_gasgas_tech3: 'tech3_racing',
  aprilia_racing: 'aprilia_racing',
  aprilia: 'aprilia_racing',
  trackhouse_racing: 'trackhouse_racing',
  trackhouse: 'trackhouse_racing',
  yamaha_factory: 'yamaha_factory',
  monster_energy_yamaha: 'yamaha_factory',
  yamaha: 'yamaha_factory',
  repsol_honda: 'repsol_honda',
  repsol_honda_team: 'repsol_honda',
  honda_factory: 'repsol_honda',
  honda: 'repsol_honda',
  lcr_honda: 'lcr_honda',
  lcr: 'lcr_honda',
};

// ============================================================================
// Junior Academies Registry
// ============================================================================

export const JUNIOR_ACADEMIES_REGISTRY: Record<JuniorAcademyId, JuniorAcademy> = {
  'red-bull-junior': {
    academyId: 'red-bull-junior',
    name: 'Red Bull Junior Team',
    f1TeamId: 'red_bull',
    f1TeamName: 'Red Bull Racing',
    accentColor: '#1e40af',
    description: 'Dr. Helmut Marko’s legendary junior development programme which produced Sebastian Vettel, Max Verstappen, Daniel Ricciardo, and Carlos Sainz.',
    headquarters: 'Milton Keynes, United Kingdom',
  },
  'ferrari-driver-academy': {
    academyId: 'ferrari-driver-academy',
    name: 'Ferrari Driver Academy',
    f1TeamId: 'ferrari',
    f1TeamName: 'Scuderia Ferrari',
    accentColor: '#dc2626',
    description: 'Maranello’s prestigious academy nurturing future Ferrari stars, including Charles Leclerc, Oliver Bearman, and Mick Schumacher.',
    headquarters: 'Maranello, Italy',
  },
  'mercedes-junior': {
    academyId: 'mercedes-junior',
    name: 'Mercedes Junior Team',
    f1TeamId: 'mercedes',
    f1TeamName: 'Mercedes-AMG PETRONAS',
    accentColor: '#00d2be',
    description: 'Toto Wolff’s talent pipeline developing elite talent from karting to F1, including George Russell, Andrea Kimi Antonelli, and Esteban Ocon.',
    headquarters: 'Brackley, United Kingdom',
  },
  'alpine-academy': {
    academyId: 'alpine-academy',
    name: 'Alpine Academy',
    f1TeamId: 'alpine',
    f1TeamName: 'Alpine F1 Team',
    accentColor: '#0078d0',
    description: 'Enstone’s young driver programme with a rich legacy from the Renault Driver Development era.',
    headquarters: 'Enstone, United Kingdom',
  },
  'mclaren-driver-development': {
    academyId: 'mclaren-driver-development',
    name: 'McLaren Driver Development',
    f1TeamId: 'mclaren',
    f1TeamName: 'McLaren F1 Team',
    accentColor: '#ff8000',
    description: 'Woking’s driver development programme, continuing the pedigree that discovered Lewis Hamilton and Lando Norris.',
    headquarters: 'Woking, United Kingdom',
  },
  'williams-racing-driver-academy': {
    academyId: 'williams-racing-driver-academy',
    name: 'Williams Racing Driver Academy',
    f1TeamId: 'williams',
    f1TeamName: 'Williams Racing',
    accentColor: '#00a0de',
    description: 'Grove’s junior programme focused on developing drivers through F3 and F2 into Formula 1 seats, including Franco Colapinto.',
    headquarters: 'Grove, United Kingdom',
  },
  'sauber-academy': {
    academyId: 'sauber-academy',
    name: 'Sauber Academy',
    f1TeamId: 'sauber_audi',
    f1TeamName: 'Sauber / Audi F1',
    accentColor: '#52e252',
    description: 'Hinwil’s talent academy preparing drivers for the forthcoming Audi Formula 1 works entry, including Gabriel Bortoleto.',
    headquarters: 'Hinwil, Switzerland',
  },
  'aston-martin-driver-development': {
    academyId: 'aston-martin-driver-development',
    name: 'Aston Martin Driver Development',
    f1TeamId: 'aston_martin',
    f1TeamName: 'Aston Martin Aramco',
    accentColor: '#00594f',
    description: 'Silverstone-based driver programme fostering promising talents with direct F1 simulator and testing pathways.',
    headquarters: 'Silverstone, United Kingdom',
  },
};

/**
 * Resolves any provider driver key or raw name to a stable internal driverId.
 */
export function resolveDriverId(rawKeyOrName?: string): string {
  if (!rawKeyOrName) return 'unknown-driver';
  const clean = rawKeyOrName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  if (DRIVER_EXTERNAL_MAPPING[clean]) {
    return DRIVER_EXTERNAL_MAPPING[clean];
  }
  // Try matching by last name
  for (const [providerKey, stableId] of Object.entries(DRIVER_EXTERNAL_MAPPING)) {
    if (clean.includes(providerKey) || clean.includes(stableId)) {
      return stableId;
    }
  }
  return clean.replace(/_/g, '-');
}

/**
 * Resolves any provider team key or constructor name to a stable internal teamId.
 */
export function resolveTeamId(rawKeyOrName?: string): string {
  if (!rawKeyOrName) return 'unknown-team';
  const clean = rawKeyOrName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  if (TEAM_EXTERNAL_MAPPING[clean]) {
    return TEAM_EXTERNAL_MAPPING[clean];
  }
  for (const [providerKey, stableId] of Object.entries(TEAM_EXTERNAL_MAPPING)) {
    if (clean.includes(providerKey) || clean.includes(stableId)) {
      return stableId;
    }
  }
  return clean.replace(/_/g, '-');
}

/**
 * Rider resolution alias for motorcycle racing disciplines.
 */
export const resolveRiderId = resolveDriverId;

/**
 * MotoGP Team resolution alias.
 */
export const resolveMotoGpTeamId = resolveTeamId;

/**
 * Resolves circuit reference to stable circuitId using the existing circuitRegistry.
 * Guarantees no competing circuit registry is created.
 */
export function resolveCircuitId(circuitInput?: any): string {
  return normalizeCircuitId(circuitInput);
}

/**
 * Builds a deterministic, standardized event identifier.
 * Example: buildEventId('f1', 2026, 1) -> 'f1-2026-r01'
 */
export function buildEventId(discipline: string, season: number, round: number): string {
  const roundStr = round < 10 ? `r0${round}` : `r${round}`;
  return `${discipline.toLowerCase()}-${season}-${roundStr}`;
}

/**
 * Builds a deterministic session identifier.
 * Example: buildSessionId('f1-2026-r01', 'QUALIFYING') -> 'f1-2026-r01-qualifying'
 */
export function buildSessionId(eventId: string, sessionType: string): string {
  return `${eventId}-${sessionType.toLowerCase().replace(/_/g, '-')}`;
}
