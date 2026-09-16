import React from 'react';
import { X, Trophy, Users, Shield, ExternalLink, Zap, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface TeamProfileData {
  id: string;
  name: string;
  championshipId: string;
  championshipName: string;
  championshipBadge: string;
  championshipColor: string;
  carModel?: string;
  bikeModel?: string;
  manufacturer?: string;
  country?: string;
  countryFlag?: string;
  primaryColor?: string;
  rank?: number;
  points?: number;
  wins?: number;
  podiums?: number;
  drivers?: string[]; // Lineup strings (e.g. 'K. Estre / A. Lotterer / L. Vanthoor' or 'Max Verstappen')
  concessionTier?: string;
  powerUnit?: string;
}

interface TeamProfileModalProps {
  team: TeamProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCompetitor?: (competitorName: string) => void;
}

export const TeamProfileModal: React.FC<TeamProfileModalProps> = ({
  team,
  isOpen,
  onClose,
  onSelectCompetitor,
}) => {
  if (!isOpen || !team) return null;

  const accentColor = team.primaryColor || team.championshipColor || 'var(--f1-red)';
  const vehicleLabel = team.championshipId === 'motogp' ? 'Bike' : 'Chassis / Car';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-profile-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#12141a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                backgroundColor: team.championshipColor || '#e10600',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                letterSpacing: '0.05em',
              }}
            >
              {team.championshipBadge}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {team.championshipName} • Official Team Profile
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Team Profile"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero Section */}
        <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <h2
                  id="team-profile-title"
                  style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', margin: 0 }}
                >
                  {team.name}
                </h2>
                {team.countryFlag && (
                  <span style={{ fontSize: '1.3rem' }} title={team.country}>
                    {team.countryFlag}
                  </span>
                )}
              </div>

              {/* Machine Specs & Manufacturer */}
              <div
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {(team.carModel || team.bikeModel) && (
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    {vehicleLabel}: {team.carModel || team.bikeModel}
                  </span>
                )}
                {team.manufacturer && (
                  <span style={{ color: 'var(--text-muted)' }}>• {team.manufacturer}</span>
                )}
                {team.powerUnit && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>• {team.powerUnit}</span>
                )}
              </div>
            </div>

            {/* Team Color Dot / Accent */}
            <div
              style={{
                minWidth: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 12px ${accentColor}`,
                marginTop: '0.4rem',
              }}
            />
          </div>

          {/* Concession Tier (MotoGP) */}
          {team.concessionTier && (
            <div style={{ marginTop: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Zap size={13} />
                FIM Concession Tier {team.concessionTier} (Testing & Engine Allocation)
              </span>
            </div>
          )}
        </div>

        {/* Season Statistics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            margin: '0.5rem 1.5rem',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RANK</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: team.rank === 1 ? '#eab308' : '#fff' }}>
              {team.rank ? `P${team.rank}` : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>POINTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              {team.points !== undefined ? team.points : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>WINS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              {team.wins !== undefined ? team.wins : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PODIUMS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              {team.podiums !== undefined ? team.podiums : '—'}
            </div>
          </div>
        </div>

        {/* Drivers / Riders Roster */}
        {team.drivers && team.drivers.length > 0 && (
          <div style={{ padding: '1rem 1.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Users size={13} />
              <span>ACTIVE ROSTER & CAR ENTRIES</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {team.drivers.map((driverStr, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.88rem',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{driverStr}</span>
                  {onSelectCompetitor && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectCompetitor(driverStr);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View Profile →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to={`/championships/${team.championshipId}`}
            onClick={onClose}
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#60a5fa',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>View {team.championshipName} Grid</span>
            <ExternalLink size={14} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
