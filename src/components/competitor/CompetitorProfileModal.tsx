import React from 'react';
import { X, Trophy, Award, Shield, Flag, ExternalLink, Users, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CompetitorProfileData {
  id: string;
  name: string;
  code?: string;
  number?: number;
  nationality?: string;
  teamName: string;
  teamId?: string;
  championshipId: string;
  championshipName: string;
  championshipBadge: string;
  championshipColor: string;
  competitorLabel?: string; // 'Driver' | 'Rider'
  rank?: number;
  points?: number;
  wins?: number;
  podiums?: number;
  // Discipline specific
  juniorAcademy?: string;
  f1Affiliation?: string;
  academyColor?: string;
  driverGrade?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | string;
  coDrivers?: string[];
  bikeModel?: string;
  concessionTier?: string;
  carModel?: string;
  biography?: string;
}

interface CompetitorProfileModalProps {
  competitor: CompetitorProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam?: (teamName: string) => void;
}

export const CompetitorProfileModal: React.FC<CompetitorProfileModalProps> = ({
  competitor,
  isOpen,
  onClose,
  onSelectTeam,
}) => {
  if (!isOpen || !competitor) return null;

  const label = competitor.competitorLabel || (competitor.championshipId === 'motogp' ? 'Rider' : 'Driver');
  const accentColor = competitor.championshipColor || 'var(--f1-red)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="competitor-profile-title"
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
        {/* Top Header Bar with Championship Badge & Close */}
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
                backgroundColor: accentColor,
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                letterSpacing: '0.05em',
              }}
            >
              {competitor.championshipBadge}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {competitor.championshipName} • Official {label} Profile
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile"
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
                  id="competitor-profile-title"
                  style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', margin: 0 }}
                >
                  {competitor.name}
                </h2>
                {competitor.code && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {competitor.code}
                  </span>
                )}
              </div>

              {/* Team & Vehicle */}
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
                {onSelectTeam ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectTeam(competitor.teamName);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 700,
                      textDecoration: 'underline',
                    }}
                  >
                    {competitor.teamName}
                  </button>
                ) : (
                  <span style={{ color: '#fff', fontWeight: 700 }}>{competitor.teamName}</span>
                )}
                {competitor.nationality && (
                  <span style={{ color: 'var(--text-muted)' }}>• {competitor.nationality}</span>
                )}
                {competitor.carModel && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>• {competitor.carModel}</span>
                )}
                {competitor.bikeModel && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>• {competitor.bikeModel}</span>
                )}
              </div>
            </div>

            {/* Number Pill */}
            {competitor.number !== undefined && (
              <div
                style={{
                  minWidth: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  fontSize: '1.45rem',
                  color: '#fff',
                }}
              >
                {competitor.number}
              </div>
            )}
          </div>

          {/* Badges Bar (Academy, FIA Driver Grade, Concession Tier) */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {competitor.juniorAcademy && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: competitor.academyColor ? `${competitor.academyColor}22` : 'rgba(59, 130, 246, 0.15)',
                  color: competitor.academyColor || '#60a5fa',
                  border: `1px solid ${competitor.academyColor || 'rgba(59, 130, 246, 0.4)'}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Award size={13} />
                {competitor.juniorAcademy} {competitor.f1Affiliation ? `(${competitor.f1Affiliation})` : ''}
              </span>
            )}

            {competitor.driverGrade && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Shield size={13} />
                FIA Grade: {competitor.driverGrade}
              </span>
            )}

            {competitor.concessionTier && (
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
                FIM Concession: Tier {competitor.concessionTier}
              </span>
            )}
          </div>
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
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: competitor.rank === 1 ? '#eab308' : '#fff' }}>
              {competitor.rank ? `P${competitor.rank}` : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>POINTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              {competitor.points !== undefined ? competitor.points : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>WINS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              {competitor.wins !== undefined ? competitor.wins : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#181b22', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PODIUMS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              {competitor.podiums !== undefined ? competitor.podiums : '—'}
            </div>
          </div>
        </div>

        {/* WEC Co-drivers Section */}
        {competitor.coDrivers && competitor.coDrivers.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              ENDURANCE CO-DRIVERS
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {competitor.coDrivers.map((co, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {co}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
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
            to={`/championships/${competitor.championshipId}`}
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
            <span>Explore {competitor.championshipName}</span>
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
