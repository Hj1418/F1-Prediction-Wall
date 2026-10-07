import React from 'react';
import { Tv, Tv2, ExternalLink, ShieldCheck, HelpCircle, Radio, PlayCircle } from 'lucide-react';
import { getIndianBroadcastRights, BroadcastProvider } from '../../services/motorsport/whereToWatchService';

interface WhereToWatchCardProps {
  championshipId: string;
  championshipName: string;
  season?: number;
}

export const WhereToWatchCard: React.FC<WhereToWatchCardProps> = ({
  championshipId,
  championshipName,
  season = 2026,
}) => {
  const rightsConfig = getIndianBroadcastRights(championshipId, season);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface, #131722)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        borderRadius: '16px',
        padding: '1.5rem',
        marginTop: '1.5rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(225, 6, 0, 0.12)',
              border: '1px solid rgba(225, 6, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--f1-red, #e10600)',
            }}
          >
            <Tv size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  color: 'var(--f1-red)',
                  textTransform: 'uppercase',
                }}
              >
                WHERE TO WATCH • INDIA 🇮🇳
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff' }}>
              Official Broadcast & Streaming Rights
            </h3>
          </div>
        </div>

        {rightsConfig && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--telemetry-green, #00e676)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> VERIFIED ({season} SEASON)
          </div>
        )}
      </div>

      {/* Body */}
      {!rightsConfig || rightsConfig.providers.length === 0 ? (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed var(--border-subtle, rgba(255, 255, 255, 0.12))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-secondary, #cbd5e1)',
          }}
        >
          <HelpCircle size={20} color="var(--text-muted, #64748b)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
              Broadcast Information Unavailable
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Official broadcast distribution rights for {championshipName} ({season}) in India have not been verified yet. Check official championship channels for region updates.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {rightsConfig.providers.map(provider => (
            <div
              key={provider.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderLeft: `4px solid ${provider.badgeColor || 'var(--f1-red)'}`,
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
                    {provider.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: provider.type === 'streaming' ? 'rgba(225, 6, 0, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: provider.type === 'streaming' ? 'var(--f1-red)' : '#60a5fa',
                      textTransform: 'uppercase',
                    }}
                  >
                    {provider.type.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {provider.notes}
                </p>

                {/* Session Coverage Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {provider.coverage.map(cov => (
                    <span
                      key={cov}
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-primary, #e2e8f0)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {cov}
                    </span>
                  ))}
                </div>
              </div>

              {provider.url && (
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{
                    alignSelf: 'flex-start',
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    gap: '0.4rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <PlayCircle size={14} /> Watch on {provider.name} <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
