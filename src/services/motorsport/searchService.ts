/**
 * Universal Motorsport Search Service
 * Dynamically indexes entities across all 10 motorsport categories:
 * - Drivers & Riders
 * - Teams & Manufacturers
 * - Circuits & Venues
 * - Championships & Ecosystems
 * - Technical Concepts & Regulations
 * - Calendar Events
 *
 * Implements lazy on-demand loading to ensure zero impact on initial bundle size.
 */

export type SearchCategory = 'all' | 'championship' | 'driver' | 'team' | 'circuit' | 'concept' | 'event';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'championship' | 'driver' | 'team' | 'circuit' | 'concept' | 'event';
  championshipId?: string;
  championshipName?: string;
  badge?: string;
  badgeColor?: string;
  url: string;
  keywords?: string[];
  relevanceScore?: number;
}

let cachedIndex: SearchResultItem[] | null = null;
let indexLoadingPromise: Promise<SearchResultItem[]> | null = null;

/**
 * Lazy loads and compiles the universal search index from all motorsport datasets.
 */
export async function getUniversalSearchIndex(): Promise<SearchResultItem[]> {
  if (cachedIndex) {
    return cachedIndex;
  }

  if (indexLoadingPromise) {
    return indexLoadingPromise;
  }

  indexLoadingPromise = (async () => {
    const items: SearchResultItem[] = [];

    // 1. Add all 10 Championships & Ecosystems
    items.push(
      {
        id: 'champ-f1',
        title: 'Formula 1® (FIA Formula One World Championship)',
        subtitle: 'The pinnacle of global open-wheel motorsport • Active Aero • Hybrid 2026',
        category: 'championship',
        championshipId: 'f1',
        championshipName: 'Formula 1',
        badge: 'F1',
        badgeColor: '#e10600',
        url: '/championships/f1',
        keywords: ['f1', 'formula one', 'grand prix', 'verstappen', 'hamilton', 'ferrari', 'mercedes', 'red bull'],
      },
      {
        id: 'champ-f2',
        title: 'FIA Formula 2 Championship',
        subtitle: 'Premier feeder series to F1 • Spec Dallara F2 2024 • Mecachrome 3.4L Turbo',
        category: 'championship',
        championshipId: 'f2',
        championshipName: 'Formula 2',
        badge: 'F2',
        badgeColor: '#0090d0',
        url: '/championships/f2',
        keywords: ['f2', 'formula 2', 'feeder', 'hadjar', 'bortoleto', 'maini', 'dallara', 'super licence'],
      },
      {
        id: 'champ-f3',
        title: 'FIA Formula 3 Championship',
        subtitle: 'High-attrition junior single-seaters • 30-car grid • Spec Dallara F3',
        category: 'championship',
        championshipId: 'f3',
        championshipName: 'Formula 3',
        badge: 'F3',
        badgeColor: '#e10600',
        url: '/championships/f3',
        keywords: ['f3', 'formula 3', 'fornaroli', 'minì', 'junior', 'feeder'],
      },
      {
        id: 'champ-f4',
        title: 'FIA Formula 4',
        subtitle: 'The global entry-level single-seater stepping stone from karting to cars',
        category: 'championship',
        championshipId: 'f4',
        championshipName: 'Formula 4',
        badge: 'F4',
        badgeColor: '#10b981',
        url: '/championships/f4',
        keywords: ['f4', 'formula 4', 'tatuus', 'entry level', 'karting ladder'],
      },
      {
        id: 'champ-formula-e',
        title: 'ABB FIA Formula E World Championship',
        subtitle: 'All-electric street racing • GEN3 Evo AWD • Attack Mode • 350 kW',
        category: 'championship',
        championshipId: 'formula-e',
        championshipName: 'Formula E',
        badge: 'FE',
        badgeColor: '#00d2be',
        url: '/championships/formula-e',
        keywords: ['fe', 'formula e', 'electric', 'wehrlein', 'evans', 'attack mode', 'regen', 'gen3 evo', 'porsche', 'jaguar'],
      },
      {
        id: 'champ-wec',
        title: 'FIA World Endurance Championship (WEC)',
        subtitle: 'Multi-class sports prototype & GT endurance • 24 Hours of Le Mans • Hypercar & LMGT3',
        category: 'championship',
        championshipId: 'wec',
        championshipName: 'WEC',
        badge: 'WEC',
        badgeColor: '#002b49',
        url: '/championships/wec',
        keywords: ['wec', 'le mans', '24 hours', 'hypercar', 'lmgt3', 'ferrari 499p', 'toyota', 'bop', 'fuoco', 'endurance'],
      },
      {
        id: 'champ-gt-world-challenge',
        title: 'Fanatec GT World Challenge',
        subtitle: 'Global GT3 customer sprint & endurance • CrowdStrike 24 Hours of Spa • SRO BoP',
        category: 'championship',
        championshipId: 'gt-world-challenge',
        championshipName: 'GT World Challenge',
        badge: 'GT3',
        badgeColor: '#d97706',
        url: '/championships/gt-world-challenge',
        keywords: ['gt', 'gt3', 'spa 24', 'sro', 'vanthoor', 'wrt', 'bmw m4', 'ferrari 296', 'iron dames', 'bop'],
      },
      {
        id: 'champ-wrc',
        title: 'FIA World Rally Championship (WRC)',
        subtitle: 'Against the clock on gravel, snow & asphalt • Rally1 Hybrid • Power Stage • Co-Drivers',
        category: 'championship',
        championshipId: 'wrc',
        championshipName: 'WRC',
        badge: 'WRC',
        badgeColor: '#ea580c',
        url: '/championships/wrc',
        keywords: ['wrc', 'rally', 'neuville', 'ogier', 'tanak', 'toyota yaris', 'hyundai i20', 'pace notes', 'power stage'],
      },
      {
        id: 'champ-motogp',
        title: 'FIM MotoGP™ World Championship',
        subtitle: 'Premier two-wheel motorcycle racing • 300+ bhp • 65° lean angles • Saturday Sprint + GP',
        category: 'championship',
        championshipId: 'motogp',
        championshipName: 'MotoGP',
        badge: 'MotoGP',
        badgeColor: '#dc2626',
        url: '/championships/motogp',
        keywords: ['motogp', 'motorcycle', 'bagnaia', 'martin', 'marquez', 'ducati', 'ktm', 'buddh', 'rider', 'holeshot'],
      },
      {
        id: 'champ-indian-motorsport',
        title: 'Indian Motorsport Ecosystem',
        subtitle: 'FMSCI governance • Indian Racing League • F4 India • Buddh BIC • Madras MMRT',
        category: 'championship',
        championshipId: 'indian-motorsport',
        championshipName: 'Indian Motorsport',
        badge: 'INDIA',
        badgeColor: '#ff9933',
        url: '/indian-motorsport',
        keywords: ['india', 'fmsci', 'irl', 'wolf gb08', 'f4 india', 'karthikeyan', 'chandhok', 'daruvala', 'maini', 'bic', 'mmrt'],
      }
    );

    // 2. Dynamically load detailed datasets in parallel
    try {
      const [
        f2Module,
        f3Module,
        f4Module,
        feModule,
        wecModule,
        gtModule,
        wrcModule,
        motogpModule,
        indiaModule,
      ] = await Promise.all([
        import('./data/f2Data'),
        import('./data/f3Data'),
        import('./data/f4Data'),
        import('./data/formulaEData'),
        import('./data/wecData'),
        import('./data/gtWorldChallengeData'),
        import('./data/wrcData'),
        import('./data/motogpData'),
        import('./data/indianMotorsportData'),
      ]);

      const datasets = [
        { id: 'f2', name: 'Formula 2', data: f2Module.f2Data, badge: 'F2', badgeColor: '#0090d0' },
        { id: 'f3', name: 'Formula 3', data: f3Module.f3Data, badge: 'F3', badgeColor: '#e10600' },
        { id: 'f4', name: 'Formula 4', data: f4Module.f4Data, badge: 'F4', badgeColor: '#10b981' },
        { id: 'formula-e', name: 'Formula E', data: feModule.formulaEData, badge: 'FE', badgeColor: '#00d2be' },
        { id: 'wec', name: 'WEC', data: wecModule.wecData, badge: 'WEC', badgeColor: '#002b49' },
        { id: 'gt-world-challenge', name: 'GT World Challenge', data: gtModule.gtWorldChallengeData, badge: 'GT3', badgeColor: '#d97706' },
        { id: 'wrc', name: 'WRC', data: wrcModule.wrcData, badge: 'WRC', badgeColor: '#ea580c' },
        { id: 'motogp', name: 'MotoGP', data: motogpModule.motogpData, badge: 'MotoGP', badgeColor: '#dc2626' },
      ];

      // Index Drivers & Riders
      for (const ds of datasets) {
        if (!ds.data) continue;

        if (ds.data.driversStandings) {
          for (const d of ds.data.driversStandings) {
            if (!d || !d.driverName) continue;
            const coDrivers = d.coDrivers?.length ? ` (with ${d.coDrivers.join(', ')})` : '';
            const isRider = ds.data.competitorLabel === 'Rider';
            items.push({
              id: `driver-${ds.id}-${d.driverName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              title: `${d.driverName} ${d.carNumber ? `#${d.carNumber}` : ''}`.trim(),
              subtitle: `${isRider ? 'Rider' : 'Driver'} • ${d.teamName || ''}${coDrivers} • ${ds.name}`,
              category: 'driver',
              championshipId: ds.id,
              championshipName: ds.name,
              badge: ds.badge,
              badgeColor: ds.badgeColor,
              url: `/championships/${ds.id}#standings`,
              keywords: [d.driverName, d.teamName || '', d.nationality || '', String(d.carNumber || ''), ds.name],
            });
          }
        }

        // Index Teams
        if (ds.data.teamsStandings) {
          for (const t of ds.data.teamsStandings) {
            if (!t || !t.teamName) continue;
            const machine = t.carModel ? ` • ${t.carModel}` : (t.manufacturer ? ` • ${t.manufacturer}` : '');
            items.push({
              id: `team-${ds.id}-${t.teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              title: t.teamName,
              subtitle: `Team${machine} • ${ds.name}`,
              category: 'team',
              championshipId: ds.id,
              championshipName: ds.name,
              badge: ds.badge,
              badgeColor: ds.badgeColor,
              url: `/championships/${ds.id}#teams`,
              keywords: [t.teamName, t.country || '', t.carModel || '', t.manufacturer || '', ds.name],
            });
          }
        }

        // Index Calendar Rounds & Circuits
        if (ds.data.rounds) {
          for (const round of ds.data.rounds) {
            if (!round) continue;
            const roundTitle = round.officialTitle || `Round ${round.roundNumber}`;
            items.push({
              id: `event-${ds.id}-${round.roundNumber}`,
              title: `${roundTitle} (Round ${round.roundNumber})`,
              subtitle: `${round.circuitName || ''} • ${round.location || ''} • ${round.dates || ''}`,
              category: 'event',
              championshipId: ds.id,
              championshipName: ds.name,
              badge: ds.badge,
              badgeColor: ds.badgeColor,
              url: `/championships/${ds.id}#calendar`,
              keywords: [roundTitle, round.circuitName || '', round.location || '', ds.name],
            });

            // Circuit entry
            if (round.circuitName) {
              items.push({
                id: `circuit-${ds.id}-${round.circuitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                title: round.circuitName,
                subtitle: `${round.location || ''} • Host venue for ${ds.name}`,
                category: 'circuit',
                championshipId: ds.id,
                championshipName: ds.name,
                badge: 'Circuit',
                badgeColor: '#6366f1',
                url: `/championships/${ds.id}#calendar`,
                keywords: [round.circuitName, round.location || '', ds.name],
              });
            }
          }
        }

        // Index Technical Guides & Feature Concepts
        if (ds.data.featureGuide?.sections) {
          for (const feat of ds.data.featureGuide.sections) {
            if (!feat || !feat.title) continue;
            items.push({
              id: `concept-${ds.id}-${feat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              title: feat.title,
              subtitle: `${feat.subtitle || (feat.description ? feat.description.slice(0, 100) : '')} • ${ds.name} Guide`,
              category: 'concept',
              championshipId: ds.id,
              championshipName: ds.name,
              badge: 'Guide',
              badgeColor: '#8b5cf6',
              url: `/championships/${ds.id}#guide`,
              keywords: [feat.title, feat.subtitle || '', ds.name, 'technical', 'regulation'],
            });
          }
        }
      }

      // Index Indian Motorsport Ecosystem
      const indianData = indiaModule.indianMotorsportData;
      if (indianData) {
        // Indian series
        for (const s of indianData.series) {
          items.push({
            id: `indian-series-${s.id}`,
            title: s.name,
            subtitle: `${s.shortName || s.name} • ${s.vehicle} (${s.engine})`,
            category: 'championship',
            championshipId: 'indian-motorsport',
            championshipName: 'Indian Motorsport',
            badge: 'IRL/F4',
            badgeColor: '#ff9933',
            url: `/indian-motorsport#championships`,
            keywords: [s.name, s.shortName, s.category, s.engine, 'india'],
          });
        }

        // Indian circuits
        for (const c of indianData.circuits) {
          items.push({
            id: `indian-circuit-${c.id}`,
            title: `${c.name} (${c.location})`,
            subtitle: `${c.fiaGrade} • ${c.lengthKm} km • ${c.corners} corners`,
            category: 'circuit',
            championshipId: 'indian-motorsport',
            championshipName: 'Indian Motorsport',
            badge: 'Circuit',
            badgeColor: '#ff9933',
            url: `/indian-motorsport#circuits`,
            keywords: [c.name, c.location, c.fiaGrade, 'buddh', 'mmrt', 'kari', 'coastt', 'chennai', 'india'],
          });
        }

        // Indian drivers & pioneers
        for (const p of indianData.drivers) {
          const firstAch = p.keyAchievements?.[0] || p.role;
          const safeAchievements = p.keyAchievements || [];
          items.push({
            id: `indian-driver-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            title: p.name,
            subtitle: `${p.role} • ${firstAch}`,
            category: 'driver',
            championshipId: 'indian-motorsport',
            championshipName: 'Indian Motorsport',
            badge: p.role.includes('Pioneer') ? 'Pioneer' : 'India',
            badgeColor: '#ff9933',
            url: `/indian-motorsport#drivers`,
            keywords: [p.name, p.role, ...safeAchievements, 'india'].filter(Boolean),
          });
        }

        // Indian franchises
        for (const f of indianData.franchises) {
          items.push({
            id: `indian-franchise-${f.teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            title: f.teamName,
            subtitle: `City: ${f.city} • Team Principal: ${f.ownerOrPrincipal}`,
            category: 'team',
            championshipId: 'indian-motorsport',
            championshipName: 'Indian Motorsport',
            badge: 'IRF',
            badgeColor: f.primaryColor || '#ff9933',
            url: `/indian-motorsport#drivers`,
            keywords: [f.teamName, f.city, f.ownerOrPrincipal, 'franchise', 'india'],
          });
        }
      }

      // Add Top F1 Drivers & Teams
      items.push(
        {
          id: 'driver-f1-verstappen',
          title: 'Max Verstappen #1',
          subtitle: 'Driver • Red Bull Racing • Formula 1',
          category: 'driver',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'F1',
          badgeColor: '#e10600',
          url: '/championships/f1',
          keywords: ['verstappen', 'max', 'red bull', 'champion', 'f1'],
        },
        {
          id: 'driver-f1-hamilton',
          title: 'Lewis Hamilton #44',
          subtitle: 'Driver • Scuderia Ferrari • Formula 1',
          category: 'driver',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'F1',
          badgeColor: '#e10600',
          url: '/championships/f1',
          keywords: ['hamilton', 'lewis', 'ferrari', 'champion', 'f1'],
        },
        {
          id: 'driver-f1-norris',
          title: 'Lando Norris #4',
          subtitle: 'Driver • McLaren F1 Team • Formula 1',
          category: 'driver',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'F1',
          badgeColor: '#e10600',
          url: '/championships/f1',
          keywords: ['norris', 'lando', 'mclaren', 'f1'],
        },
        {
          id: 'driver-f1-leclerc',
          title: 'Charles Leclerc #16',
          subtitle: 'Driver • Scuderia Ferrari • Formula 1',
          category: 'driver',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'F1',
          badgeColor: '#e10600',
          url: '/championships/f1',
          keywords: ['leclerc', 'charles', 'ferrari', 'f1'],
        },
        {
          id: 'team-f1-ferrari',
          title: 'Scuderia Ferrari HP',
          subtitle: 'Constructor • Ferrari 066/12 • Formula 1',
          category: 'team',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'F1',
          badgeColor: '#e10600',
          url: '/championships/f1',
          keywords: ['ferrari', 'scuderia', 'maranello', 'hamilton', 'leclerc', 'f1'],
        },
        {
          id: 'team-f1-mclaren',
          title: 'McLaren Formula 1 Team',
          subtitle: 'Constructor • Mercedes-AMG • Formula 1',
          category: 'team',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'F1',
          badgeColor: '#e10600',
          url: '/championships/f1',
          keywords: ['mclaren', 'norris', 'piastri', 'papaya', 'f1'],
        }
      );

      // Add Core Technical Concepts
      items.push(
        {
          id: 'concept-active-aero',
          title: 'Active Aerodynamics (X-Mode & Z-Mode)',
          subtitle: '2026 F1 movable wing regulations balancing drag reduction and high-speed cornering downforce',
          category: 'concept',
          championshipId: 'f1',
          championshipName: 'Formula 1',
          badge: 'Aero',
          badgeColor: '#3b82f6',
          url: '/learn#glossary',
          keywords: ['active aero', 'x-mode', 'z-mode', 'drs', 'downforce', 'drag'],
        },
        {
          id: 'concept-attack-mode',
          title: 'Formula E Attack Mode & Boost Zones',
          subtitle: 'Steering off the racing line to arm 50 kW power surge from twin electric motors',
          category: 'concept',
          championshipId: 'formula-e',
          championshipName: 'Formula E',
          badge: 'Electric',
          badgeColor: '#00d2be',
          url: '/championships/formula-e#guide',
          keywords: ['attack mode', 'boost', 'formula e', '350kw', 'electric', 'overtake'],
        },
        {
          id: 'concept-bop',
          title: 'Balance of Performance (BoP)',
          subtitle: 'Weight ballast, engine power limits, and energy stint allotments in WEC & GT3',
          category: 'concept',
          championshipId: 'wec',
          championshipName: 'WEC & GT',
          badge: 'BoP',
          badgeColor: '#002b49',
          url: '/championships/wec#guide',
          keywords: ['bop', 'balance of performance', 'wec', 'gt3', 'ballast', 'le mans'],
        },
        {
          id: 'concept-lean-angles',
          title: '65°+ Lean Angles & Rider Physics',
          subtitle: 'Elbow-down cornering, gyroscopic precession, and tyre slip angle dynamics in MotoGP',
          category: 'concept',
          championshipId: 'motogp',
          championshipName: 'MotoGP',
          badge: 'MotoGP',
          badgeColor: '#dc2626',
          url: '/championships/motogp#guide',
          keywords: ['lean angle', 'elbow down', 'knee down', 'motogp', 'physics', 'michelin'],
        },
        {
          id: 'concept-pace-notes',
          title: 'Pace Notes & Co-Driver Communication',
          subtitle: 'High-speed audio shorthand describing corner severity, blind crests, and road surfaces in WRC',
          category: 'concept',
          championshipId: 'wrc',
          championshipName: 'WRC',
          badge: 'Rally',
          badgeColor: '#ea580c',
          url: '/championships/wrc#guide',
          keywords: ['pace notes', 'co-driver', 'wrc', 'rally', 'stages', 'crests'],
        }
      );
    } catch (err) {
      console.warn('Failed to load full search datasets dynamically:', err);
    }

    // Deduplicate by ID
    const uniqueMap = new Map<string, SearchResultItem>();
    for (const it of items) {
      if (!uniqueMap.has(it.id)) {
        uniqueMap.set(it.id, it);
      }
    }

    cachedIndex = Array.from(uniqueMap.values());
    return cachedIndex;
  })();

  return indexLoadingPromise;
}

/**
 * Searches the universal index with query string and optional category filter.
 */
export async function searchMotorsport(
  query: string,
  category: SearchCategory = 'all',
  limit: number = 25
): Promise<SearchResultItem[]> {
  const index = await getUniversalSearchIndex();
  const cleanQuery = query.trim().toLowerCase();

  let filtered = index;
  if (category !== 'all') {
    filtered = index.filter(item => item.category === category);
  }

  if (!cleanQuery) {
    // Return curated spotlight items if empty query
    return filtered.slice(0, limit);
  }

  // Score matches
  const scored: Array<{ item: SearchResultItem; score: number }> = [];

  for (const item of filtered) {
    if (!item) continue;
    let score = 0;
    const titleLower = item.title ? String(item.title).toLowerCase() : '';
    const subtitleLower = item.subtitle ? String(item.subtitle).toLowerCase() : '';
    const champLower = item.championshipName ? String(item.championshipName).toLowerCase() : '';

    // Title match
    if (titleLower === cleanQuery) {
      score += 100;
    } else if (titleLower.startsWith(cleanQuery)) {
      score += 75;
    } else if (titleLower.includes(cleanQuery)) {
      score += 50;
    }

    // Subtitle match
    if (subtitleLower.includes(cleanQuery)) {
      score += 25;
    }

    // Championship match
    if (champLower.includes(cleanQuery)) {
      score += 20;
    }

    // Keywords match
    if (item.keywords?.some(k => typeof k === 'string' && k.toLowerCase().includes(cleanQuery))) {
      score += 30;
    }

    if (score > 0) {
      scored.push({ item: { ...item, relevanceScore: score }, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.item);
}
