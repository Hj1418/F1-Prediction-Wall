import React, { useState } from 'react';
import {
  BookOpen,
  Flag,
  Gauge,
  HelpCircle,
  Search,
  Shield,
  Sliders,
  Timer,
  Trophy,
  Zap,
  ExternalLink,
  Wind,
  Scale,
} from 'lucide-react';
import { STRUCTURED_TOPICS, StructuredTopic } from '../services/educational/officialContent';
import { OfficialUpdatesSection } from '../components/common/OfficialUpdatesSection';

interface GlossaryTerm {
  term: string;
  category: 'Strategy' | 'Rules' | 'Technical' | 'Driving';
  definition: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Apex',
    category: 'Driving',
    definition: 'The innermost point of a corner trajectory where the car is closest to the inside kerb before unwinding steering lock to accelerate.',
  },
  {
    term: 'Box, Box',
    category: 'Strategy',
    definition: 'The radio instruction from race engineer to driver instructing them to enter the pit lane this lap for a pit stop.',
  },
  {
    term: 'DRS (Drag Reduction System)',
    category: 'Technical',
    definition: 'A hydraulic actuator that opens a flap in the rear wing when within 1.000s of the car ahead in designated zones, reducing aerodynamic drag and boosting top speed by 15-25 km/h.',
  },
  {
    term: 'Parc Fermé',
    category: 'Rules',
    definition: 'Strict impound conditions beginning at the start of qualifying. Teams are prohibited from altering car setup, suspension geometry, or aerodynamics without FIA approval, with limited exceptions like front wing angle adjustments and tire pressure.',
  },
  {
    term: 'Undercut',
    category: 'Strategy',
    definition: 'Pitting earlier than a rival to use fresh tyres and set faster out-lap times, enabling the driver to jump ahead when the rival eventually pits.',
  },
  {
    term: 'Overcut',
    category: 'Strategy',
    definition: 'Staying out on track longer while a competitor pits, banking on clear air and durable tyre life to gain track position before making a pit stop.',
  },
  {
    term: 'Dirty Air',
    category: 'Technical',
    definition: 'Turbulent, disrupted airflow shed behind a Formula 1 car that robs trailing cars of aerodynamic downforce and accelerates tyre degradation.',
  },
  {
    term: 'Slipstream',
    category: 'Driving',
    definition: 'Tucking closely behind a rival car down high-speed straights where air resistance is lower, allowing higher acceleration and overtaking momentum.',
  },
  {
    term: 'Delta Time',
    category: 'Rules',
    definition: 'The minimum reference lap time drivers must adhere to on dashboard displays during Virtual Safety Car (VSC) or Safety Car in-laps to ensure safe speeds.',
  },
  {
    term: 'Flat Spot',
    category: 'Driving',
    definition: 'A localized patch of rubber scraped flat when a wheel locks under heavy braking, inducing severe steering vibration and requiring premature pit stops.',
  },
  {
    term: 'ERS (Energy Recovery System)',
    category: 'Technical',
    definition: 'The hybrid powertrain component harvesting heat energy (MGU-H) and kinetic braking energy (MGU-K) into an energy store, providing supplementary electric boost.',
  },
  {
    term: 'Track Limits',
    category: 'Rules',
    definition: 'Defined by the white lines bordering the circuit surface. If all four wheels cross completely over the white boundary, lap times are deleted in practice/qualifying, and race warnings/penalties are applied.',
  },
];

export const LearnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'weekend' | 'qualifying' | 'officials' | 'flags' | 'tyres' | 'drs' | 'points' | 'glossary'
  >('overview');
  const [weekendFormat, setWeekendFormat] = useState<'standard' | 'sprint'>('standard');
  const [glossaryFilter, setGlossaryFilter] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('all');

  const filteredGlossary = GLOSSARY_TERMS.filter(item => {
    const matchesSearch =
      item.term.toLowerCase().includes(glossaryFilter.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossaryFilter.toLowerCase());
    const matchesCat = glossaryCategory === 'all' || item.category === glossaryCategory;
    return matchesSearch && matchesCat;
  });

  const getTopic = (id: string): StructuredTopic | undefined => {
    return STRUCTURED_TOPICS.find(t => t.id === id);
  };

  /**
   * Helper component rendering the structured 3-part framework:
   * WHAT IS IT? -> HOW DOES IT WORK? -> WHY DOES IT MATTER? -> OFFICIAL INFO
   */
  const renderStructuredTopicCard = (topic: StructuredTopic) => (
    <article
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Governance & Verification Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: 'rgba(225, 6, 0, 0.15)',
              color: 'var(--f1-red)',
              textTransform: 'uppercase',
            }}
          >
            {topic.category}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#fff' }}>
            {topic.title}
          </h2>
        </div>

        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            background: 'var(--bg-base)',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Season {topic.governance.season} • Verified: {topic.governance.verifiedDate}
        </div>
      </div>

      {/* 1. WHAT IS IT? */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
          1. WHAT IS IT?
        </div>
        <p style={{ color: '#fff', fontSize: '0.96rem', lineHeight: 1.55, margin: 0, fontWeight: 500 }}>
          {topic.whatIsIt}
        </p>
      </div>

      {/* 2. HOW DOES IT WORK? */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--telemetry-cyan, #00e5ff)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
          2. HOW DOES IT WORK?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {topic.howItWorks.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
              }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* 3. WHY DOES IT MATTER? */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--telemetry-green, #00e676)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
          3. WHY DOES IT MATTER?
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
          {topic.whyItMatters}
        </p>
      </div>

      {/* 4. OFFICIAL REGULATORY LINK */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Authoritative Reference:{' '}
          <strong style={{ color: 'var(--text-secondary)' }}>
            {topic.governance.source}
            {topic.governance.ruleReference ? ` (${topic.governance.ruleReference})` : ''}
          </strong>
        </div>

        <a
          href={topic.governance.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--f1-red)',
            fontSize: '0.78rem',
            fontWeight: 800,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <span>Read Official Regulation</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );

  const qualifyingTopic = getTopic('qualifying');
  const sprintTopic = getTopic('sprint');
  const officialsTopic = getTopic('officials');
  const flagsTopic = getTopic('flags');
  const tyresTopic = getTopic('tyres');
  const drsTopic = getTopic('drs');
  const pointsTopic = getTopic('points');

  return (
    <div className="learn-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
      {/* Header Banner */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--f1-red)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <BookOpen size={16} />
          <span>F1 ACADEMY & TECHNICAL GUIDE</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
          Understanding Formula 1
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '820px', lineHeight: 1.5 }}>
          We explain the fundamentals so you can follow any Grand Prix with confidence. For official rulebooks, editorial analysis, and authoritative FIA decisions, direct links to official publications are provided throughout.
        </p>
      </header>

      {/* Navigation Sub-Tabs */}
      <nav aria-label="Learn F1 Topics" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'overview', label: 'The Championship', icon: Trophy },
          { id: 'weekend', label: 'Weekend Anatomy', icon: Timer },
          { id: 'qualifying', label: 'Knockout Qualifying', icon: Zap },
          { id: 'officials', label: 'Officials & Stewards', icon: Scale },
          { id: 'flags', label: 'Flags & Safety', icon: Flag },
          { id: 'tyres', label: 'Tyres & Strategy', icon: Sliders },
          { id: 'drs', label: 'DRS & Aero', icon: Wind },
          { id: 'points', label: 'Points System', icon: Gauge },
          { id: 'glossary', label: 'Glossary', icon: HelpCircle },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                background: isActive ? 'rgba(225, 6, 0, 0.12)' : 'var(--bg-surface)',
                border: isActive ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--f1-red)' : 'var(--text-muted)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB 1: THE CHAMPIONSHIP */}
      {activeTab === 'overview' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: 'var(--f1-red)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                THE PINNACLE OF MOTORSPORT
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#fff' }}>
                Two World Championships
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                Every Formula 1 season contests two distinct titles across 24 Grands Prix worldwide:
              </p>
              <ul style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 0 1.25rem', lineHeight: 1.6, fontSize: '0.92rem' }}>
                <li><strong style={{ color: '#fff' }}>World Drivers' Championship (WDC)</strong>: Awarded to the individual driver who amasses the highest point total.</li>
                <li><strong style={{ color: '#fff' }}>World Constructors' Championship (WCC)</strong>: Awarded to the team whose two cars accumulate the most combined points. WCC standings determine hundreds of millions in prize distributions.</li>
              </ul>
              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <a
                  href="https://www.formula1.com/en/championship/awards.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--f1-red)', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                >
                  <span>Read Official Championship History</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: 'var(--f1-red)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                THE GRID
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#fff' }}>
                10 Teams, 20 Drivers
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                Each constructor designs and manufactures their own aerodynamic chassis. They field two identical cars driven by full-time drivers holding an FIA Super Licence.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--f1-red)' }}>10</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Constructors</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>20</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Drivers</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#238636' }}>24</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grands Prix</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: WEEKEND ANATOMY */}
      {activeTab === 'weekend' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                The Grand Prix Weekend Format
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                Compare the flow between a standard Grand Prix and a fast-paced Sprint weekend.
              </p>
            </div>
            <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setWeekendFormat('standard')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: weekendFormat === 'standard' ? 'var(--f1-red)' : 'transparent',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Standard Weekend
              </button>
              <button
                onClick={() => setWeekendFormat('sprint')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: weekendFormat === 'sprint' ? 'var(--f1-red)' : 'transparent',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sprint Weekend (6x / season)
              </button>
            </div>
          </div>

          {weekendFormat === 'standard' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>FRIDAY</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>PREPARATION</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>Free Practice 1 & 2 (FP1, FP2)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Two 60-minute untimed sessions. Teams dial in aerodynamic setups, test tire degradation over high-fuel race simulations, and evaluate track evolution.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>SATURDAY</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(225, 6, 0, 0.15)', color: 'var(--f1-red)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>LOCKS PICKS</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>FP3 & Qualifying</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Final 60-minute practice followed by the 3-stage Knockout Qualifying (Q1, Q2, Q3) to establish Sunday's starting grid and crown the Pole Sitter.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>SUNDAY</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>RACE DAY</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>The Grand Prix</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Full ~305 km race distance (typically 50-78 laps or max 2 hours). Mandatory pit stop rules apply in dry weather. 25 points awarded to the winner.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {sprintTopic && renderStructuredTopicCard(sprintTopic)}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: QUALIFYING */}
      {activeTab === 'qualifying' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {qualifyingTopic && renderStructuredTopicCard(qualifyingTopic)}
        </section>
      )}

      {/* TAB 4: OFFICIALS & STEWARDS */}
      {activeTab === 'officials' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {officialsTopic && renderStructuredTopicCard(officialsTopic)}
        </section>
      )}

      {/* TAB 5: FLAGS & SAFETY */}
      {activeTab === 'flags' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {flagsTopic && renderStructuredTopicCard(flagsTopic)}
        </section>
      )}

      {/* TAB 6: TYRES & STRATEGY */}
      {activeTab === 'tyres' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tyresTopic && renderStructuredTopicCard(tyresTopic)}
        </section>
      )}

      {/* TAB 7: DRS & AERO */}
      {activeTab === 'drs' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {drsTopic && renderStructuredTopicCard(drsTopic)}
        </section>
      )}

      {/* TAB 8: POINTS SYSTEM */}
      {activeTab === 'points' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pointsTopic && renderStructuredTopicCard(pointsTopic)}
        </section>
      )}

      {/* TAB 9: MOTORSPORT GLOSSARY */}
      {activeTab === 'glossary' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Motorsport Glossary
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search technical term or concept..."
                  value={glossaryFilter}
                  onChange={e => setGlossaryFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['all', 'Strategy', 'Rules', 'Technical', 'Driving'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGlossaryCategory(cat)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      border: glossaryCategory === cat ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                      background: glossaryCategory === cat ? 'rgba(225, 6, 0, 0.15)' : 'var(--bg-surface)',
                      color: glossaryCategory === cat ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredGlossary.map(item => (
              <div
                key={item.term}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>{item.term}</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--f1-red)', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(225, 6, 0, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    {item.category}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OFFICIAL F1 & FIA UPDATES DISCOVERY COMPONENT */}
      <OfficialUpdatesSection />
    </div>
  );
};

export default LearnPage;
