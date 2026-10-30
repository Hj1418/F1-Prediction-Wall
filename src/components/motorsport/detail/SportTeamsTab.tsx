import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Users,
  ChevronRight,
  ExternalLink,
  Wrench,
  Flag,
} from 'lucide-react';
import { Championship } from '../../../types/motorsport';
import { ChampionshipDetailData, ChampionshipTeamStanding } from '../../../types/motorsportDetail';
import { TeamProfileModal, TeamProfileData } from '../../team/TeamProfileModal';

export interface SportTeamsTabProps {
  championship: Championship;
  detail: ChampionshipDetailData | null;
  teams: ChampionshipTeamStanding[];
  onSelectDriver?: (driverName: string) => void;
}

export const SportTeamsTab: React.FC<SportTeamsTabProps> = ({
  championship,
  detail,
  teams,
  onSelectDriver,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTeamData, setSelectedTeamData] = useState<TeamProfileData | null>(null);

  // Available classes if applicable (e.g. WEC Hypercar / LMGT3)
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    teams.forEach(t => {
      if (t.racingClass) classSet.add(t.racingClass);
    });
    return Array.from(classSet);
  }, [teams]);

  // Filter teams based on search & class
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      if (selectedClass !== 'all' && team.racingClass && team.racingClass.toLowerCase() !== selectedClass.toLowerCase()) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        team.teamName.toLowerCase().includes(q) ||
        (team.manufacturer && team.manufacturer.toLowerCase().includes(q)) ||
        (team.carModel && team.carModel.toLowerCase().includes(q)) ||
        (team.country && team.country.toLowerCase().includes(q)) ||
        team.drivers.some(d => d.toLowerCase().includes(q))
      );
    });
  }, [teams, selectedClass, searchQuery]);

  const handleOpenTeamModal = (team: ChampionshipTeamStanding) => {
    const modalData: TeamProfileData = {
      id: team.teamName,
      name: team.teamName,
      championshipId: championship.id,
      championshipName: championship.name,
      championshipBadge: championship.shortName,
      championshipColor: championship.badgeColor,
      carModel: team.carModel,
      manufacturer: team.manufacturer || team.carModel?.split(' ')[0] || team.teamName.split(' ')[0],
      country: team.country,
      countryFlag: team.flag,
      primaryColor: team.primaryColor || championship.badgeColor,
      rank: team.rank,
      points: team.points,
      wins: team.wins,
      podiums: team.podiums,
      drivers: team.drivers,
    };
    setSelectedTeamData(modalData);
  };

  return (
    <div
      role="tabpanel"
      id="sport-panel-teams"
      aria-labelledby="sport-tab-teams"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}
    >
      {/* 1. DISCOVERY TOOLBAR */}
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
            OFFICIAL PARTICIPATING TEAMS
          </h2>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)' }}>
            {filteredTeams.length} Active Team{filteredTeams.length > 1 ? 's' : ''} in the {detail?.seasonYear || 2026} Championship
          </span>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Class Filters if multiple exist */}
          {availableClasses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => setSelectedClass('all')}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: selectedClass === 'all' ? 800 : 600,
                  backgroundColor: selectedClass === 'all' ? `${championship.badgeColor}25` : 'rgba(255, 255, 255, 0.05)',
                  border: selectedClass === 'all' ? `1px solid ${championship.badgeColor}` : '1px solid var(--border-subtle)',
                  color: selectedClass === 'all' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                All Classes
              </button>
              {availableClasses.map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: selectedClass === cls ? 800 : 600,
                    backgroundColor: selectedClass === cls ? `${championship.badgeColor}25` : 'rgba(255, 255, 255, 0.05)',
                    border: selectedClass === cls ? `1px solid ${championship.badgeColor}` : '1px solid var(--border-subtle)',
                    color: selectedClass === cls ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search team or driver..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.75rem 0.4rem 2rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-base, #0d0f14)',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. TEAMS GRID */}
      {filteredTeams.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredTeams.map((team, idx) => {
            const teamAccent = team.primaryColor || championship.badgeColor;

            return (
              <div
                key={idx}
                className="team-card race-card-interactive"
                style={{
                  backgroundColor: 'var(--bg-surface, #131722)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenTeamModal(team)}
              >
                {/* Livery Color Accent Bar */}
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    backgroundColor: teamAccent,
                  }}
                />

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Top Header: Nationality & Class */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '1rem' }}>{team.flag || '🏳️'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', fontFamily: 'var(--font-mono)' }}>
                        {team.country}
                      </span>
                    </div>

                    {team.racingClass && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: teamAccent,
                          backgroundColor: `${teamAccent}15`,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          border: `1px solid ${teamAccent}33`,
                        }}
                      >
                        {team.racingClass}
                      </span>
                    )}
                  </div>

                  {/* Team Name */}
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      margin: '0 0 0.5rem 0',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.25,
                    }}
                  >
                    {team.teamName}
                  </h3>

                  {/* Car / Engine / Constructor Specs */}
                  {team.carModel && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary, #94a3b8)',
                        marginBottom: '1rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <Wrench size={13} style={{ color: teamAccent }} />
                      <span>{team.carModel}</span>
                    </div>
                  )}

                  {/* Drivers Lineup for this Team */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted, #64748b)',
                        display: 'block',
                        marginBottom: '0.4rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {championship.id === 'motogp' ? 'Riders Lineup' : 'Driver Lineup'}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {team.drivers.map((driverName, dIdx) => (
                        <span
                          key={dIdx}
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {driverName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Details Affordance */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.35rem',
                      marginTop: '1rem',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: teamAccent,
                    }}
                  >
                    <span>VIEW PROFILE</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
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
          No teams found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      )}

      {/* 3. TEAM DETAIL MODAL */}
      <TeamProfileModal
        team={selectedTeamData}
        isOpen={Boolean(selectedTeamData)}
        onClose={() => setSelectedTeamData(null)}
        onSelectCompetitor={onSelectDriver}
      />
    </div>
  );
};
