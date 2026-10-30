import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Championship } from '../../../types/motorsport';
import { ChampionshipDetailData } from '../../../types/motorsportDetail';
import { SeriesWeekendFormatConfig } from '../../../services/motorsport/motorsportData';

export interface SportWeekendTabProps {
  championship: Championship;
  detail: ChampionshipDetailData | null;
  weekendFormats: SeriesWeekendFormatConfig[];
}

export const SportWeekendTab: React.FC<SportWeekendTabProps> = ({
  championship,
  detail,
  weekendFormats,
}) => {
  const [activeFormatIndex, setActiveFormatIndex] = useState<number>(0);

  const currentFormat = weekendFormats[activeFormatIndex] || weekendFormats[0];

  return (
    <div
      role="tabpanel"
      id="sport-panel-weekend"
      aria-labelledby="sport-tab-weekend"
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '2rem 0' }}
    >
      {/* 1. WEEKEND FORMAT SELECTOR / HEADER */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: championship.badgeColor,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              <span>{currentFormat.badge}</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {currentFormat.label}
            </h2>
            <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem', margin: 0, maxWidth: '750px', lineHeight: 1.55 }}>
              {currentFormat.description}
            </p>
          </div>

          {/* Multiple Weekend Format Tabs Toggle (e.g. F1 Standard vs Sprint, WEC 6h vs Le Mans) */}
          {weekendFormats.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '0.35rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {weekendFormats.map((fmt, idx) => {
                const isSelected = activeFormatIndex === idx;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setActiveFormatIndex(idx)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                      backgroundColor: isSelected ? championship.badgeColor : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 12px ${championship.badgeColor}40` : 'none',
                    }}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grid Decider Callout Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '10px',
            fontSize: '0.86rem',
          }}
        >
          <Flag size={18} style={{ color: 'var(--telemetry-cyan, #00e5ff)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff', marginRight: '0.5rem' }}>HOW GRID POSITIONS ARE DETERMINED:</strong>
            <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>{currentFormat.gridDecider}</span>
          </div>
        </div>
      </section>

      {/* 2. CHRONOLOGICAL SESSION TIMELINE */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 0.35rem 0',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '-0.01em',
            }}
          >
            CHRONOLOGICAL SESSION SEQUENCE
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
            Session-by-session breakdown from opening practice to the final checkered flag.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {currentFormat.sessions.map((session, idx) => {
            const stepNum = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: '1.25rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.28)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Left Step Indicator Column */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '60px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingRight: '1.25rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: championship.badgeColor,
                    }}
                  >
                    {stepNum}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted, #64748b)',
                      textTransform: 'uppercase',
                    }}
                  >
                    STAGE
                  </span>
                </div>

                {/* Session Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {session.name}
                      </h4>
                      {session.durationMinutes && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted, #64748b)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          <Clock size={11} />
                          <span>{session.durationMinutes} MIN</span>
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--telemetry-cyan, #00e5ff)',
                        backgroundColor: 'rgba(0, 229, 255, 0.08)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                      }}
                    >
                      {session.day}
                    </span>
                  </div>

                  {/* Purpose */}
                  <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600 }}>
                    Purpose: <span style={{ color: 'var(--text-secondary, #cbd5e1)', fontWeight: 400 }}>{session.purpose}</span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.55 }}>
                    {session.description}
                  </p>

                  {/* Rules Highlight if available */}
                  {session.rulesHighlight && (
                    <div
                      style={{
                        marginTop: '0.35rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${championship.badgeColor}`,
                        fontSize: '0.78rem',
                        color: '#e2e8f0',
                      }}
                    >
                      <strong>Regulations Note:</strong> {session.rulesHighlight}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
