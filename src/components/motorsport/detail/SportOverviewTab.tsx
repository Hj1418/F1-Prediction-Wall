import React, { useState } from 'react';
import {
  BookOpen,
  Gauge,
  Trophy,
  Zap,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Flag,
  Flame,
} from 'lucide-react';
import { Championship } from '../../../types/motorsport';
import { ChampionshipDetailData } from '../../../types/motorsportDetail';
import { MotorsportBasicsGuide } from '../../../services/motorsport/motorsportBasicsService';

export interface SportOverviewTabProps {
  championship: Championship;
  detail: ChampionshipDetailData | null;
  basics: MotorsportBasicsGuide | null;
}

export const SportOverviewTab: React.FC<SportOverviewTabProps> = ({
  championship,
  detail,
  basics,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => (prev === idx ? null : idx));
  };

  const techSpecs = detail?.technicalSpecs;
  const featureGuide = detail?.featureGuide;
  const faqs = detail?.faqs || [];
  const beginnerConcepts = basics?.beginnerConcepts || [];
  const keyRegulations = basics?.keyRegulations || [];
  const pointsTable = basics?.pointsAndScoring?.pointsTable || [];
  const pointsSummary = basics?.pointsAndScoring?.summary || detail?.pointsSystemDescription || championship.scoringSummary;

  return (
    <div
      role="tabpanel"
      id="sport-panel-overview"
      aria-labelledby="sport-tab-overview"
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '2rem 0' }}
    >
      {/* 1. EDITORIAL INTRO: "IN SIMPLE TERMS" & BEGINNER CONCEPTS */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={18} style={{ color: championship.badgeColor }} />
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '-0.01em',
            }}
          >
            HOW {championship.shortName.toUpperCase()} WORKS — IN SIMPLE TERMS
          </h2>
        </div>

        <p
          style={{
            fontSize: '1rem',
            color: '#ffffff',
            lineHeight: 1.65,
            marginBottom: '1.75rem',
            maxWidth: '920px',
            fontWeight: 500,
          }}
        >
          {basics?.simpleTerms || championship.beginnerOverview}
        </p>

        {/* 4 Core Beginner Pillars / Concepts */}
        {beginnerConcepts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1.5rem',
            }}
          >
            {beginnerConcepts.map(concept => (
              <div
                key={concept.num}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: championship.badgeColor,
                      backgroundColor: `${championship.badgeColor}20`,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {concept.num}
                  </span>
                  <h3
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {concept.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
                  {concept.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. TECHNICAL SPECIFICATIONS & REGULATIONS */}
      {techSpecs && (
        <section
          style={{
            backgroundColor: 'var(--bg-surface, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Gauge size={18} style={{ color: championship.badgeColor }} />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.01em',
              }}
            >
              TECHNICAL SPECIFICATIONS & REGULATIONS
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
            {detail?.specRegulationsSummary || 'Official technical parameters homologated by the governing sanctioning body.'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CHASSIS / MONOCOQUE</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.chassis}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ENGINE & POWERTRAIN</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.engine}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TOTAL POWER OUTPUT</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.powerOutput}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MINIMUM WEIGHT & TOP SPEED</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
                {techSpecs.weight} • Top Speed {techSpecs.topSpeed}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TYRES & COMPOUNDS</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.tyres}</div>
            </div>

            {techSpecs.fuelSupplier && (
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FUEL & SUSTAINABILITY</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.fuelSupplier}</div>
              </div>
            )}

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SAFETY RATING & COCKPIT</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.safetyRating}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACCELERATION BENCHMARK</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{techSpecs.acceleration}</div>
            </div>
          </div>
        </section>
      )}

      {/* 3. SPORTING REGULATIONS & RULES HIGHLIGHTS */}
      {keyRegulations.length > 0 && (
        <section
          style={{
            backgroundColor: 'var(--bg-surface, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={18} style={{ color: championship.badgeColor }} />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.01em',
              }}
            >
              SPORTING REGULATIONS & ESSENTIAL RULES
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {keyRegulations.map((reg, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem 0' }}>
                  {reg.rule}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
                  {reg.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. FEATURE GUIDE / INNOVATION SHOWCASE (e.g. Active Aero, BoP, MOM, Attack Mode) */}
      {featureGuide && featureGuide.sections.length > 0 && (
        <section
          style={{
            backgroundColor: 'var(--bg-surface, #131722)',
            border: `1px solid ${championship.badgeColor}35`,
            borderRadius: '16px',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: championship.badgeColor,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              {featureGuide.tabLabel}
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              {featureGuide.tabTitle}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '800px', lineHeight: 1.55 }}>
              {featureGuide.tabDescription}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {featureGuide.sections.map((section, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: section.badgeColor || championship.badgeColor,
                      backgroundColor: `${section.badgeColor || championship.badgeColor}20`,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {section.badge}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {section.title}
                  </h3>
                </div>

                {section.subtitle && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--telemetry-cyan, #00e5ff)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
                    {section.subtitle}
                  </div>
                )}

                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 1rem 0' }}>
                  {section.description}
                </p>

                {section.metrics && section.metrics.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {section.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'block' }}>
                          {m.label}
                        </span>
                        <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>{m.value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {section.details && section.details.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>
                    {section.details.map((detailText, dIdx) => (
                      <li key={dIdx}>{detailText}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. POINTS & SCORING SYSTEM */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Trophy size={18} style={{ color: championship.badgeColor }} />
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '-0.01em',
            }}
          >
            POINTS SYSTEM & CHAMPIONSHIP SCORING
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
          {pointsSummary}
        </p>

        {pointsTable.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {pointsTable.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{pt.position}</span>
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: championship.badgeColor }}>
                  {pt.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '1.25rem',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.88rem',
              lineHeight: 1.6,
            }}
          >
            {championship.scoringSummary}
          </div>
        )}
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      {faqs.length > 0 && (
        <section
          style={{
            backgroundColor: 'var(--bg-surface, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <HelpCircle size={18} style={{ color: championship.badgeColor }} />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.01em',
              }}
            >
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.1rem 1.25rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp size={16} style={{ color: championship.badgeColor, flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.25rem 1.25rem 1.25rem',
                        fontSize: '0.86rem',
                        color: 'var(--text-secondary, #94a3b8)',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        paddingTop: '0.85rem',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
