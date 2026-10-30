import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  ChevronRight,
  Trophy,
  Award,
  Filter,
} from 'lucide-react';
import { Championship } from '../../../types/motorsport';
import { ChampionshipDetailData, ChampionshipDriverStanding } from '../../../types/motorsportDetail';
import { DriverProfile } from '../../../types/driversHub';
import { DRIVER_PROFILES, getDriverProfileBySlug } from '../../../services/motorsport/driversHubService';
import { DriverProfileCard } from '../DriverProfileCard';

export interface SportDriversTabProps {
  championship: Championship;
  detail: ChampionshipDetailData | null;
  drivers: DriverProfile[];
}

export const SportDriversTab: React.FC<SportDriversTabProps> = ({
  championship,
  detail,
  drivers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Reconcile drivers for this championship:
  // Combine evergreen profiles belonging to this series with any active driver standings records
  const allSeriesDrivers: DriverProfile[] = useMemo(() => {
    const map = new Map<string, DriverProfile>();

    // 1. Add known rich profiles from DRIVER_PROFILES
    drivers.forEach(d => {
      map.set(d.id.toLowerCase(), d);
      if (d.slug) map.set(d.slug.toLowerCase(), d);
    });

    // 2. Also incorporate active drivers from detail.driversStandings if not already mapped
    if (detail?.driversStandings) {
      detail.driversStandings.forEach((ds: ChampionshipDriverStanding) => {
        const slug = ds.driverName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existing = map.get(slug) || getDriverProfileBySlug(slug) || getDriverProfileBySlug(ds.driverCode);

        if (existing) {
          map.set(existing.id.toLowerCase(), existing);
        } else if (!map.has(slug)) {
          // Synthesize a clean verified driver card
          const synthesized: DriverProfile = {
            id: `${championship.id}-${slug}`,
            slug,
            name: ds.driverName,
            fullName: ds.driverName,
            code: ds.driverCode || ds.driverName.slice(0, 3).toUpperCase(),
            number: ds.carNumber,
            nationality: ds.nationality,
            countryCode: ds.nationality,
            countryFlag: '🏁',
            team: ds.teamName,
            series: championship.id as any,
            seriesName: championship.name,
            seriesBadgeColor: championship.badgeColor,
            primaryDiscipline: championship.vehicleType,
            status: 'active',
            racingClass: ds.racingClass,
            driverDna: `${ds.driverName} is a verified competitor representing ${ds.teamName} in ${championship.name}.`,
            stats: {
              worldChampionships: 0,
              raceWins: ds.wins || 0,
              podiums: ds.podiums || 0,
              polePositions: ds.polePositions || 0,
              fastestLaps: ds.fastestLaps || 0,
              statLabel: 'Career Entries',
            },
            careerHighlights: [
              `Official competitor for ${ds.teamName} in the ${detail.seasonYear} championship.`,
            ],
            careerJourney: [
              {
                period: `${detail.seasonYear}`,
                title: `${ds.teamName} Championship Campaign`,
                category: 'TOP_FLIGHT',
                description: `Competing in ${championship.name}.`,
              },
            ],
            teamsHistory: [
              {
                period: `${detail.seasonYear}`,
                team: ds.teamName,
                championship: championship.name,
              },
            ],
          };
          map.set(slug, synthesized);
        }
      });
    }

    return Array.from(new Set(map.values()));
  }, [drivers, detail, championship]);

  // Extract unique team names for filtering
  const availableTeams = useMemo(() => {
    const teams = new Set<string>();
    allSeriesDrivers.forEach(d => {
      if (d.team) teams.add(d.team);
    });
    return Array.from(teams).sort();
  }, [allSeriesDrivers]);

  // Extract unique classes for filtering (e.g. WEC Hypercar / LMGT3)
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    allSeriesDrivers.forEach(d => {
      if (d.racingClass) classes.add(d.racingClass);
    });
    return Array.from(classes).sort();
  }, [allSeriesDrivers]);

  // Filtered driver list
  const filteredDrivers = useMemo(() => {
    return allSeriesDrivers.filter(driver => {
      // 1. Team filter
      if (selectedTeam !== 'all' && driver.team.toLowerCase() !== selectedTeam.toLowerCase()) {
        return false;
      }

      // 2. Class filter
      if (selectedClass !== 'all' && driver.racingClass && driver.racingClass.toLowerCase() !== selectedClass.toLowerCase()) {
        return false;
      }

      // 3. Search query (name, number, nationality, code)
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        driver.name.toLowerCase().includes(q) ||
        (driver.fullName && driver.fullName.toLowerCase().includes(q)) ||
        driver.team.toLowerCase().includes(q) ||
        driver.nationality.toLowerCase().includes(q) ||
        driver.code.toLowerCase().includes(q) ||
        String(driver.number).includes(q)
      );
    });
  }, [allSeriesDrivers, selectedTeam, selectedClass, searchQuery]);

  const competitorTitle = championship.id === 'motogp' ? 'Riders' : 'Drivers';

  return (
    <div
      role="tabpanel"
      id="sport-panel-drivers"
      aria-labelledby="sport-tab-drivers"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}
    >
      {/* 1. DISCOVERY & FILTER TOOLBAR */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '-0.01em',
            }}
          >
            {championship.shortName.toUpperCase()} {competitorTitle.toUpperCase()} ROSTER
          </h2>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Showing {filteredDrivers.length} {competitorTitle.toLowerCase()} representing the official {detail?.seasonYear || 2026} grid
          </span>
        </div>

        {/* Discovery Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Category / Class Filter */}
          {availableClasses.length > 0 && (
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                backgroundColor: 'var(--bg-base, #0d0f14)',
                color: '#ffffff',
                outline: 'none',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              <option value="all">All Classes</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          )}

          {/* Team Filter */}
          {availableTeams.length > 0 && (
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                backgroundColor: 'var(--bg-base, #0d0f14)',
                color: '#ffffff',
                outline: 'none',
                fontFamily: 'var(--font-mono, monospace)',
                maxWidth: '180px',
              }}
            >
              <option value="all">All Teams</option>
              {availableTeams.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {/* Search by name or number */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #64748b)',
              }}
            />
            <input
              type="text"
              placeholder={`Search ${competitorTitle.toLowerCase()} or #...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                backgroundColor: 'var(--bg-base, #0d0f14)',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. DRIVERS GRID */}
      {filteredDrivers.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredDrivers.map(driver => (
            <DriverProfileCard key={driver.id} driver={driver} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--bg-surface, #131722)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ margin: '0 0 1rem 0' }}>No {competitorTitle.toLowerCase()} match your filter &ldquo;{searchQuery}&rdquo;.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTeam('all');
              setSelectedClass('all');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
