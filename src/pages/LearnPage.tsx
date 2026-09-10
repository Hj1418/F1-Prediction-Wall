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
  Compass,
  Layers,
  Award,
  Activity,
} from 'lucide-react';
import { STRUCTURED_TOPICS, StructuredTopic } from '../services/educational/officialContent';
import { OfficialUpdatesSection } from '../components/common/OfficialUpdatesSection';

interface GlossaryTerm {
  term: string;
  category: 'Strategy' | 'Rules' | 'Technical' | 'Driving' | 'Motorsport';
  definition: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Active Aerodynamics (X-Mode & Z-Mode)',
    category: 'Technical',
    definition: '2026 movable wing system replacing traditional DRS. Straight mode (X-Mode) minimizes drag on straights for efficiency; Corner mode (Z-Mode) maximizes downforce through corners.',
  },
  {
    term: 'Attack Mode (Formula E)',
    category: 'Motorsport',
    definition: 'Mandatory high-power mode in Formula E. Drivers must steer offline through designated timing loops off the racing line to unlock an extra 50 kW of electric power.',
  },
  {
    term: 'Balance of Performance (BoP)',
    category: 'Motorsport',
    definition: 'Regulatory system in endurance (WEC) and GT racing adjusting vehicle minimum weight, power output, and ballast to ensure diverse engine configurations compete on equal terms.',
  },
  {
    term: 'Pace Notes (Rally)',
    category: 'Motorsport',
    definition: 'Detailed shorthand descriptive notes read by a rally co-driver at machine-gun pace to warn the driver of upcoming corner radius, blind crests, and road hazards.',
  },
  {
    term: 'FIA Superlicense',
    category: 'Rules',
    definition: 'The qualification license required to drive in Formula 1. Drivers must earn at least 40 Superlicense points across junior championships (such as F2, F3, and F4) over three seasons.',
  },
  {
    term: 'Hypercar (WEC)',
    category: 'Motorsport',
    definition: 'The premier class of endurance sports prototype racing. Includes bespoke Le Mans Hypercars (LMH) and standardized Le Mans Daytona h (LMDh) hybrid race cars competing for overall 24h of Le Mans victory.',
  },
  {
    term: 'Highside vs Lowside (MotoGP)',
    category: 'Driving',
    definition: 'Two primary crash types in motorcycle racing. A lowside occurs when tyres lose grip and slide out; a highside occurs when a sliding rear tyre abruptly regains grip and violently flips the rider over the bike.',
  },
  {
    term: 'Overtake Mode / Manual Override',
    category: 'Technical',
    definition: 'The 2026 electrical passing assist. When an attacking car is within 1.000s of a rival at the activation point, the driver receives an additional 0.5 MJ of MGU-K electrical boost up to 337 km/h.',
  },
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
    term: 'DRS (Drag Reduction System — Legacy)',
    category: 'Technical',
    definition: 'Historical aerodynamic flap system used through 2025. In 2026, traditional DRS has been replaced by Active Aero (energy efficiency for all cars) and Overtake Mode (electrical boost for attackers).',
  },
  {
    term: 'Parc Fermé',
    category: 'Rules',
    definition: 'Strict impound conditions beginning at the start of qualifying. Teams are prohibited from altering car setup, suspension geometry, or aerodynamics without FIA approval.',
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
    term: 'ERS (Energy Recovery System — 2026)',
    category: 'Technical',
    definition: 'The 2026 hybrid powertrain recovery system. Feeds an advanced 350 kW MGU-K motor by harvesting up to 8.5 MJ/lap of kinetic braking energy into the energy store (with MGU-H eliminated).',
  },
  {
    term: 'Track Limits',
    category: 'Rules',
    definition: 'Defined by the white lines bordering the circuit surface. If all four wheels cross completely over the white boundary, lap times are deleted and warnings/penalties are applied.',
  },
];

export const LearnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'weekend'
    | 'qualifying'
    | 'aero'
    | 'overtake'
    | 'powerunit'
    | 'tyres'
    | 'flags'
    | 'officials'
    | 'points'
    | 'ladder'
    | 'endurance'
    | 'electric'
    | 'rally'
    | 'motogp'
    | 'glossary'
  >('overview');
  const [weekendFormat, setWeekendFormat] = useState<'standard' | 'sprint'>('standard');
  const [glossaryFilter, setGlossaryFilter] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('all');

  React.useEffect(() => {
    document.title = 'Learn F1 | The Grid Academy';
  }, []);

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
  const activeAeroTopic = getTopic('active-aero');
  const overtakeTopic = getTopic('overtake-mode');
  const powerUnitTopic = getTopic('power-unit');
  const pointsTopic = getTopic('points');

  return (
    <div className="learn-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
      {/* Header Banner */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--f1-red)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <BookOpen size={16} />
          <span>F1 ACADEMY & 2026 TECHNICAL GUIDE</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
          Understanding Formula 1
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '820px', lineHeight: 1.5 }}>
          We explain the fundamentals so you can follow any Grand Prix with confidence. For authoritative rulebooks, technical specifications, and official FIA decisions, direct links to current official publications are provided throughout.
        </p>
      </header>

      {/* Navigation Sub-Tabs */}
      <nav aria-label="Learn F1 Topics" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'overview', label: 'The Championship', icon: Trophy },
          { id: 'weekend', label: 'Weekend Anatomy', icon: Timer },
          { id: 'qualifying', label: 'Knockout Qualifying', icon: Zap },
          { id: 'aero', label: 'Active Aero (X & Z Mode)', icon: Wind },
          { id: 'overtake', label: 'Overtake Mode', icon: Gauge },
          { id: 'powerunit', label: '2026 Hybrid PU', icon: Zap },
          { id: 'tyres', label: 'Tyres & Strategy', icon: Sliders },
          { id: 'flags', label: 'Flags & Safety', icon: Flag },
          { id: 'officials', label: 'Officials & Stewards', icon: Scale },
          { id: 'points', label: 'Points System', icon: Trophy },
          { id: 'ladder', label: 'Feeder Ladder (F4–F1)', icon: Layers },
          { id: 'endurance', label: 'Endurance & WEC', icon: Activity },
          { id: 'electric', label: 'Formula E (Electric)', icon: Zap },
          { id: 'rally', label: 'Rally & Stages (WRC)', icon: Compass },
          { id: 'motogp', label: 'MotoGP (Bikes)', icon: Award },
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
                11 Teams, 22 Race Seats
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                Each constructor designs and manufactures their own aerodynamic chassis. At the start of the 2026 season, 11 constructors field 22 full-time race seats, including the debut of the Cadillac Formula 1 Team.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginTop: '0.4rem' }}>
                *Note: While 22 race seats are contested each Grand Prix weekend, the total roster of drivers participating across a season dynamically expands as teams deploy reserve and substitute drivers.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--f1-red)' }}>11</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Constructors</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>22</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Race Seats</div>
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
                type="button"
                onClick={() => setWeekendFormat('standard')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: weekendFormat === 'standard' ? 'var(--f1-red)' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Standard Grand Prix
              </button>
              <button
                type="button"
                onClick={() => setWeekendFormat('sprint')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: weekendFormat === 'sprint' ? 'var(--f1-red)' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Sprint Weekend
              </button>
            </div>
          </div>

          {weekendFormat === 'standard' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>FRIDAY</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>Free Practice 1 & 2</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  Two 60-minute sessions. Teams optimize aerodynamic balance, test tyre degradation on high fuel, and refine race simulation setups.
                </p>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>SATURDAY</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>Practice 3 & Qualifying</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  A final 60-minute tune-up followed by three-stage knockout qualifying (Q1, Q2, Q3) to decide Sunday’s 22-car starting grid.
                </p>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: 'var(--f1-red)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>SUNDAY</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>The Grand Prix</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  305 km race distance (approx. 2 hours max). Drivers must complete at least one pit stop and run two different dry compounds.
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

      {/* TAB 4: ACTIVE AERO */}
      {activeTab === 'aero' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeAeroTopic && renderStructuredTopicCard(activeAeroTopic)}
        </section>
      )}

      {/* TAB 5: OVERTAKE MODE */}
      {activeTab === 'overtake' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {overtakeTopic && renderStructuredTopicCard(overtakeTopic)}
        </section>
      )}

      {/* TAB 6: HYBRID POWER UNIT */}
      {activeTab === 'powerunit' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {powerUnitTopic && renderStructuredTopicCard(powerUnitTopic)}
        </section>
      )}

      {/* TAB 7: TYRES & STRATEGY */}
      {activeTab === 'tyres' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tyresTopic && renderStructuredTopicCard(tyresTopic)}
        </section>
      )}

      {/* TAB 8: FLAGS & SAFETY */}
      {activeTab === 'flags' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {flagsTopic && renderStructuredTopicCard(flagsTopic)}
        </section>
      )}

      {/* TAB 9: OFFICIALS & STEWARDS */}
      {activeTab === 'officials' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {officialsTopic && renderStructuredTopicCard(officialsTopic)}
        </section>
      )}

      {/* TAB 10: POINTS SYSTEM */}
      {activeTab === 'points' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pointsTopic && renderStructuredTopicCard(pointsTopic)}
        </section>
      )}

      {/* TAB 11: MOTORSPORT GLOSSARY */}
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

      {/* TAB: FEEDER LADDER (F4 -> F3 -> F2 -> F1) */}
      {activeTab === 'ladder' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: 'var(--f1-red)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              THE SINGLE-SEATER PYRAMID
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              The Road to Formula 1: F4 → F3 → F2 → F1
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              Reaching Formula 1 requires navigating the official FIA single-seater ladder. Each tier increases in horsepower, aerodynamic grip, operational complexity, and tyre degradation challenges while drivers accumulate the 40 Superlicense points needed to race in F1.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Step 1: F4 */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>STEP 01 • GRASSROOTS</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age 15+</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>Formula 4</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                The first step out of karting into carbon-fibre single-seaters. National championships across Europe, Americas, and India (F4 Indian Championship) use standardized 160 bhp turbo engines to teach racecraft, car setup, and data acquisition on a controlled budget.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                ~160 bhp • 570 kg • 240 km/h top speed
              </div>
            </div>

            {/* Step 2: F3 */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#e03a3e' }}>STEP 02 • JUNIOR PINNACLE</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>30 Cars Grid</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>FIA Formula 3</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                A ruthless 30-car spec grid supporting F1 Grands Prix. Powered by a 380 bhp 3.4L V6 engine, drivers must adapt to significant aerodynamic downforce, high-speed slipstreaming battles, and a top-12 reverse grid Sprint format.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                380 bhp • 698 kg • 300 km/h top speed
              </div>
            </div>

            {/* Step 3: F2 */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#0090d0' }}>STEP 03 • FINAL AUDITION</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spec 620 bhp</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>FIA Formula 2</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                The immediate feeder series to Formula 1. Identical Dallara chassis powered by a 620 bhp Mecachrome turbo engine. Features mandatory pit stops with compound changes, extreme Pirelli thermal tyre degradation, and top-10 reverse grid Sprints.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                620 bhp • 795 kg • 335 km/h top speed
              </div>
            </div>

            {/* Step 4: F1 */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(225, 6, 0, 0.4)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)' }}>STEP 04 • THE PINNACLE</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>22 World Seats</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>Formula 1</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Custom constructor prototypes. Unlike spec feeder series, F1 teams engineer their own chassis and aerodynamic wings. Powered by 2026 hybrid powertrains pairing 400 kW V6 combustion with 350 kW MGU-K electrical boost and Active Aerodynamics.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--f1-red)' }}>
                ~1000+ bhp combined • 768 kg • 350+ km/h
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB: ENDURANCE & WEC */}
      {activeTab === 'endurance' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              FIA WORLD ENDURANCE CHAMPIONSHIP
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              Endurance & Multi-Class Racing
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              Endurance racing is not a sprint — it is a test of engineering reliability, team pit operations, and driver stamina over 6 to 24 continuous hours, headlined by the legendary 24 Hours of Le Mans.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Multi-Class Traffic Management
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Two very different car classes race on the same tarmac simultaneously:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li><strong style={{ color: '#38bdf8' }}>Hypercar (LMH / LMDh)</strong>: 670 bhp top-tier sports prototypes with hybrid all-wheel drive fighting for outright race victories.</li>
                <li><strong style={{ color: '#f59e0b' }}>LMGT3</strong>: Production-derived customer sportscars (Ferrari 296, Porsche 911, Corvette Z06) competing in their own private class battle.</li>
              </ul>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                Hypercar drivers must lap 15–20 LMGT3 cars every few laps through tight chicanes and blind curves without losing momentum or causing collisions.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Driver Stints & Balance of Performance (BoP)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Teams field crews of 3 drivers who swap seats during fuel and tyre stops. Regulations dictate minimum and maximum driving times per stint so no single driver exhausts themselves.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: '0.75rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.82rem' }}>What is BoP?</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                  Balance of Performance mathematically adjusts vehicle ballast weights, maximum kilowatt output, and stint energy allowances to guarantee equal competitive potential between V6 hybrids, V8 twins, and naturally aspirated V8 prototypes.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB: FORMULA E (ELECTRIC) */}
      {activeTab === 'electric' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: '#00d2be', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              ABB FIA FORMULA E WORLD CHAMPIONSHIP
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              Electric Innovation & Street Racing
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              Formula E races battery-electric open-wheelers exclusively on temporary city street circuits. Without gearboxes or fuel tanks, the battle is decided by energy management, software efficiency, and regenerative braking.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Attack Mode: Mario Kart in Real Life
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Every driver is mandated to activate Attack Mode twice during the race. To trigger it, a driver must deliberately steer off the racing line through an "Activation Zone" with timing sensors on the outer perimeter of a corner.
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li>Temporarily unlocks an extra <strong style={{ color: '#00d2be' }}>50 kW of electric power</strong> (350 kW total).</li>
                <li>The driver loses track position when steering off-line, but gains immense straight-line acceleration to overtake rivals over the next few minutes.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                600 kW Extreme Energy Regeneration
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Formula E cars have no rear hydraulic brakes — all rear stopping power is provided by the electric motor acting as a massive generator.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: '0.75rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.82rem' }}>Over 40% Energy Harvesting:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                  More than 40% of the energy consumed to finish a 45-minute race is regenerated under braking during the race itself. If a driver defends too aggressively without "lifting and coasting", their battery will hit 0% before the chequered flag.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB: RALLY & WRC */}
      {activeTab === 'rally' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              FIA WORLD RALLY CHAMPIONSHIP
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              Point-to-Point Racing Against the Clock
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              Rallying is the ultimate motorsport test of adaptability. Cars do not race side-by-side on smooth circuits; they blast individually through forests, mountains, snowdrifts, and gravel paths at 180 km/h with inches of margin to cliffs and trees.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                The Co-Driver & Pace Notes System
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                A rally driver cannot memorize 300 km of public backroads. Instead, the co-driver in the passenger seat reads "Pace Notes" written during low-speed reconnaissance runs.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--telemetry-cyan, #00e5ff)' }}>
                "Right 5 over crest into Left 3 tightens, don't cut, rock inside!"
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.45 }}>
                Numbers 1 to 6 denote corner severity (1 = hairpin 1st gear, 6 = flat-out 6th gear). Absolute trust between driver and co-driver is vital for survival.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Service Park: Mechanical Miracles
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Between stages, battered Rally1 machines return to the central Service Park. Mechanics are given strictly timed 15, 30, or 45-minute windows to replace entire suspensions, gearboxes, or damaged radiators.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: '0.75rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.82rem' }}>Super Sunday & Power Stage:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                  The rally concludes with the televised "Wolf Power Stage", where the top five fastest drivers through that final stage earn 5-4-3-2-1 bonus championship points.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB: MOTOGP (BIKES) */}
      {activeTab === 'motogp' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              FIM MOTOGP WORLD CHAMPIONSHIP
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              Two-Wheeled Prototype Royalty
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              MotoGP is the pinnacle of motorcycle racing. Prototype bikes produced by Ducati, KTM, Aprilia, Yamaha, and Honda produce over 300 horsepower while weighing only 157 kg, reaching top speeds exceeding 366 km/h.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Physics of 65° Lean Angles
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Riders do not sit statically on the bike. Through corners, they hang entirely off the side, dragging knees, elbows, and shoulders along the asphalt at 160 km/h.
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li>At 65° lean, the contact patch between tyre and tarmac is barely the size of a credit card.</li>
                <li>Aerodynamic winglets and ride height devices lower the bike's rear geometry on straights to prevent high-speed wheelies under acceleration.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Saturday Sprint & Sunday Grand Prix
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Every single MotoGP weekend features two distinct races:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li><strong style={{ color: '#fff' }}>Saturday Sprint (50% distance)</strong>: Flat-out aggression with half championship points (12 for P1 down to 1 for P9). Tyre saving is disregarded.</li>
                <li><strong style={{ color: 'var(--f1-red)' }}>Sunday Grand Prix (100% distance)</strong>: Full race distance awarding 25 points for victory, requiring precision fuel and tyre wear management.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* OFFICIAL F1 & FIA UPDATES DISCOVERY COMPONENT */}
      <OfficialUpdatesSection />
    </div>
  );
};

export default LearnPage;
