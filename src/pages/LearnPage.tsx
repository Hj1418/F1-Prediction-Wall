import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  relatedLink?: {
    label: string;
    url: string;
    badge?: string;
  };
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Active Aerodynamics (X-Mode & Z-Mode)',
    category: 'Technical',
    definition: '2026 movable wing system replacing traditional DRS. Straight mode (X-Mode) minimizes drag on straights for efficiency; Corner mode (Z-Mode) maximizes downforce through corners.',
    relatedLink: {
      label: 'Formula 1 Active Aero Dossier',
      url: '/championships/f1#feature',
      badge: 'F1',
    },
  },
  {
    term: 'Attack Mode (Formula E)',
    category: 'Motorsport',
    definition: 'Mandatory high-power mode in Formula E. Drivers must steer offline through designated timing loops off the racing line to unlock an extra 50 kW of electric power.',
    relatedLink: {
      label: 'Formula E Gen3 Evo Guide',
      url: '/championships/formula-e#feature',
      badge: 'FE',
    },
  },
  {
    term: 'Balance of Performance (BoP)',
    category: 'Motorsport',
    definition: 'Regulatory system in endurance (WEC) and GT racing adjusting vehicle minimum weight, power output, and ballast to ensure diverse engine configurations compete on equal terms.',
    relatedLink: {
      label: 'FIA WEC Hypercar Regulations',
      url: '/championships/wec#overview',
      badge: 'WEC',
    },
  },
  {
    term: 'Pace Notes (Rally)',
    category: 'Motorsport',
    definition: 'Detailed shorthand descriptive notes read by a rally co-driver at machine-gun pace to warn the driver of upcoming corner radius, blind crests, and road hazards.',
    relatedLink: {
      label: 'WRC Rally Guide',
      url: '/championships/wrc#overview',
      badge: 'WRC',
    },
  },
  {
    term: 'FIA Super Licence',
    category: 'Rules',
    definition: 'The qualification license required to drive in Formula 1. Drivers must earn at least 40 Super Licence points across junior championships (such as F2, F3, and F4) over three seasons.',
    relatedLink: {
      label: 'Feeder Ladder & 40-Pt Simulator',
      url: '/championships/f2#feature',
      badge: 'Feeder',
    },
  },
  {
    term: 'Hypercar (LMH & LMDh)',
    category: 'Motorsport',
    definition: 'The premier class of endurance sports prototype racing. Includes bespoke Le Mans Hypercars (LMH) and standardized Le Mans Daytona h (LMDh) hybrid race cars competing for overall 24h of Le Mans victory.',
    relatedLink: {
      label: 'WEC Standings & Lineups',
      url: '/championships/wec#standings',
      badge: 'WEC',
    },
  },
  {
    term: 'Highside vs Lowside (MotoGP)',
    category: 'Driving',
    definition: 'Two primary crash types in motorcycle racing. A lowside occurs when tyres lose grip and slide out; a highside occurs when a sliding rear tyre abruptly regains grip and violently flips the rider over the bike.',
    relatedLink: {
      label: 'MotoGP Guide & Concessions',
      url: '/championships/motogp#overview',
      badge: 'MotoGP',
    },
  },
  {
    term: 'Overtake Mode / Manual Override',
    category: 'Technical',
    definition: 'The 2026 electrical passing assist. When an attacking car is within 1.000s of a rival at the activation point, the driver receives an additional 0.5 MJ of MGU-K electrical boost up to 337 km/h.',
    relatedLink: {
      label: 'F1 2026 Technical Specs',
      url: '/championships/f1#feature',
      badge: 'F1',
    },
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
    definition: 'Turbulent, disrupted airflow shed behind a race car that robs trailing cars of aerodynamic downforce and accelerates tyre degradation.',
  },
  {
    term: 'Slipstream / Tow',
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
  {
    term: 'Oversteer vs Understeer',
    category: 'Driving',
    definition: 'Handling imbalances. Understeer ("push") occurs when front tyres lose grip and car resists turning; Oversteer ("loose") occurs when rear tyres lose grip and rear slides out.',
  },
  {
    term: 'Trail Braking',
    category: 'Driving',
    definition: 'An advanced driving technique where the driver gradually bleeds off brake pressure while turning towards the apex, transferring weight onto front tyres for sharper turn-in.',
  },
  {
    term: 'Wheelspin',
    category: 'Driving',
    definition: 'When engine torque exceeds rear tyre grip under acceleration, spinning tyres uncontrollably, destroying surface rubber and losing forward acceleration.',
  },
  {
    term: 'Brake Bias',
    category: 'Technical',
    definition: 'The cockpit-adjustable ratio of braking force distributed between front and rear axles, tuned dynamically per corner to balance braking stability with turn-in bite.',
  },
  {
    term: 'Blistering vs Graining',
    category: 'Technical',
    definition: 'Tyre wear failure modes. Graining occurs when cold rubber tears and balls up on the tread surface; Blistering occurs when internal carcass overheating vaporizes rubber underneath the tread.',
  },
  {
    term: 'Telemetry',
    category: 'Technical',
    definition: 'Real-time wireless data transmission streaming hundreds of sensor channels (throttle, brake, tyre surface temp, g-force, steering angle) to pit wall engineers.',
  },
  {
    term: 'Ride-Height & Holeshot Device (MotoGP)',
    category: 'Technical',
    definition: 'Mechanical suspension lowering mechanisms on MotoGP prototypes that compress rear linkages to lower the center of gravity, preventing wheelies on starts and straightaways.',
  },
  {
    term: 'Multiclass Racing (WEC / IMSA)',
    category: 'Motorsport',
    definition: 'Simultaneous competition on the same track between top-tier prototypes (Hypercars) and production-based sportscars (LMGT3), requiring non-stop high-speed traffic management.',
  },
  {
    term: 'Driver Categorization (Platinum to Bronze)',
    category: 'Rules',
    definition: 'The FIA rating system ranking drivers by age, career record, and pace. Endurance and GT pro-am entries mandate specific combinations of amateur (Bronze/Silver) and pro (Gold/Platinum) drivers.',
  },
  {
    term: 'Reverse Grid (F2 / F3 / IRL)',
    category: 'Rules',
    definition: 'Sprint race format where the top qualifying drivers (top 10 in F2, top 12 in F3) are reversed on the starting grid, forcing title contenders to overtake through the field.',
  },
  {
    term: 'Power Stage (WRC)',
    category: 'Motorsport',
    definition: 'The televised final stage of a World Rally Championship rally, awarding bonus 5-4-3-2-1 championship points to the five fastest crews through that stage.',
  },
  {
    term: 'Super Special Stage (SSS)',
    category: 'Motorsport',
    definition: 'A short, purpose-built head-to-head rally stage held inside stadiums or showgrounds with parallel tracks for spectator entertainment.',
  },
  {
    term: 'Scrutineering',
    category: 'Rules',
    definition: 'Official technical inspection before and after racing sessions to verify vehicles comply strictly with safety equipment, weight, fuel, and aerodynamic dimension regulations.',
  },
  {
    term: 'Jump Start (False Start)',
    category: 'Rules',
    definition: 'Moving forward from the grid box before start lights extinguish. Transponders embedded in the asphalt trigger automatic 5s or drive-through penalties.',
  },
  {
    term: '107% Rule',
    category: 'Rules',
    definition: 'Sporting regulation mandating any driver who fails to set a Q1 lap within 107% of the fastest Q1 time may not start the Grand Prix without exceptional steward permission.',
  },
  {
    term: 'Black and Orange Flag (Mechanical Warning)',
    category: 'Rules',
    definition: 'Signaled directly to a car suffering dangerous mechanical damage (e.g. dragging wing, fluid leak). The driver must pit immediately for safety repairs.',
  },
  {
    term: 'Blue Flag',
    category: 'Rules',
    definition: 'Shown to warn a slower car that a faster leader is approaching to lap them. The slower driver must yield track position within three marshal sectors.',
  },
  {
    term: 'Yellow Flag (Single & Double Waved)',
    category: 'Rules',
    definition: 'Single yellow indicates hazard off or near track; reduce speed and no overtaking. Double yellow indicates track partially or fully blocked; must be prepared to stop.',
  },
  {
    term: 'Red Flag',
    category: 'Rules',
    definition: 'Session halted immediately due to serious crash, extreme weather, or blocked circuit. All cars must proceed slowly to the pit lane.',
  },
  {
    term: 'Safety Car & Virtual Safety Car (VSC)',
    category: 'Rules',
    definition: 'Physical Safety Car leads the field at reduced pace to allow track cleanup. VSC requires drivers to immediately reduce speed and maintain positive delta times without a physical car on track.',
  },
  {
    term: 'Pit Window',
    category: 'Strategy',
    definition: 'The optimal window of laps during a race to make scheduled pit stops based on fuel consumption, tyre compound durability, and pit lane loss delta.',
  },
  {
    term: 'Lift and Coast',
    category: 'Strategy',
    definition: 'Releasing throttle several hundred metres before braking zones to coast. Saves significant fuel and electrical battery charge with minimal lap time penalty.',
  },
  {
    term: 'Split Strategy',
    category: 'Strategy',
    definition: 'A team running different pit stop timings or starting tyre compounds on their two cars to hedge against safety cars or divergent weather forecasts.',
  },
  {
    term: 'Stint',
    category: 'Strategy',
    definition: 'A continuous sequence of laps completed on a single set of tyres between pit stops or between the start/finish of the race.',
  },
  {
    term: 'Prime vs Option Tyres',
    category: 'Strategy',
    definition: 'Historical terminology: Prime refers to the harder, more durable compound; Option refers to the softer, faster qualifying-oriented compound.',
  },
  {
    term: 'Full Wet vs Intermediate Tyres',
    category: 'Strategy',
    definition: 'Inters (green grooved) clear ~35 litres of water/sec on damp tracks without standing water; Full Wets (blue deep treads) clear up to ~85 litres/sec in heavy rain.',
  },
  {
    term: 'Downforce & Ground Effect',
    category: 'Technical',
    definition: 'Aerodynamic vertical load pushing the car into the track surface. Ground effect uses underfloor Venturi tunnels to generate massive suction without creating excess drag.',
  },
  {
    term: 'MGU-K (Motor Generator Unit - Kinetic)',
    category: 'Technical',
    definition: 'The electric motor connected to the crankshaft. Under braking, it acts as a generator harvesting kinetic energy; under acceleration, it deploys up to 350 kW of electric power.',
  },
  {
    term: 'Sustainable Drop-in Fuel (E-Fuel)',
    category: 'Technical',
    definition: 'Advanced 100% fossil-free synthetic fuel refined from carbon capture or non-food bio-waste, emitting near-net-zero greenhouse gases while matching high-octane combustion performance.',
  },
  {
    term: 'Indian Racing League (IRL)',
    category: 'Motorsport',
    definition: 'India’s premier single-make franchise prototype championship headline of the Indian Racing Festival, featuring Wolf GB08 prototypes and gender-equal driver crews.',
  },
  {
    term: 'F4 Indian Championship',
    category: 'Motorsport',
    definition: 'The official FIA-certified Formula 4 championship in India awarding up to 12 FIA Super Licence points, racing Mygale M21-F4 single-seaters on circuits across India.',
  },
  {
    term: 'Shakedown',
    category: 'Motorsport',
    definition: 'A brief pre-event test session allowing teams and drivers to verify throttle, brake lines, radio telemetry, and basic vehicle systems before official competitive sessions begin.',
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
    | 'indian'
    | 'gt'
    | 'glossary'
  >('overview');
  const [activeDiscipline, setActiveDiscipline] = useState<
    | 'getting_started'
    | 'formula'
    | 'endurance'
    | 'motorcycle'
    | 'rally'
    | 'gt'
    | 'indian'
    | 'fundamentals'
    | 'glossary'
  >('getting_started');
  const [weekendFormat, setWeekendFormat] = useState<'standard' | 'sprint'>('standard');
  const [glossaryFilter, setGlossaryFilter] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('all');

  React.useEffect(() => {
    document.title = 'Learn Motorsport | The Grid Knowledge Hub';
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
          <span>GLOBAL MOTORSPORT ACADEMY & KNOWLEDGE HUB</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
          Learn Motorsport
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '820px', lineHeight: 1.5 }}>
          Master the rules, racecraft, technical systems, and race weekend strategies across Formula 1, Feeder Series, MotoGP, WEC, Formula E, WRC, and Indian Motorsport. For authoritative rulebooks and official regulatory decisions, direct links to official FIA, FIM, SRO, and FMSCI publications are provided throughout.
        </p>
      </header>

      {/* Primary Discipline Navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: '0.6rem' }}>
          EXPLORE BY MOTORSPORT DISCIPLINE
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
          }}
        >
          {[
            { id: 'getting_started' as const, label: 'Getting Started', icon: Compass, defaultTab: 'overview' as const },
            { id: 'formula' as const, label: 'Formula Racing', icon: Trophy, defaultTab: 'qualifying' as const },
            { id: 'endurance' as const, label: 'Endurance Racing', icon: Activity, defaultTab: 'endurance' as const },
            { id: 'motorcycle' as const, label: 'Motorcycle Racing', icon: Award, defaultTab: 'motogp' as const },
            { id: 'rally' as const, label: 'Rally', icon: Compass, defaultTab: 'rally' as const },
            { id: 'gt' as const, label: 'GT Racing', icon: Sliders, defaultTab: 'gt' as const },
            { id: 'indian' as const, label: 'Indian Motorsport', icon: Flag, defaultTab: 'indian' as const },
            { id: 'fundamentals' as const, label: 'Motorsport Fundamentals', icon: Scale, defaultTab: 'flags' as const },
            { id: 'glossary' as const, label: 'Glossary', icon: HelpCircle, defaultTab: 'glossary' as const },
          ].map(d => {
            const Icon = d.icon;
            const isDiscActive = activeDiscipline === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveDiscipline(d.id);
                  setActiveTab(d.defaultTab);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  background: isDiscActive ? 'rgba(225, 6, 0, 0.16)' : 'var(--bg-surface)',
                  border: isDiscActive ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                  color: isDiscActive ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                <Icon size={14} style={{ color: isDiscActive ? 'var(--f1-red)' : 'var(--text-muted)' }} />
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Bar for Current Discipline */}
      <nav
        aria-label="Motorsport Knowledge Topics"
        style={{
          display: 'flex',
          gap: '0.45rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
          scrollbarWidth: 'none',
        }}
      >
        {[
          { id: 'overview' as const, discipline: 'getting_started' as const, label: 'The Championship', icon: Trophy },
          { id: 'weekend' as const, discipline: 'getting_started' as const, label: 'Weekend Anatomy', icon: Timer },
          { id: 'qualifying' as const, discipline: 'formula' as const, label: 'Knockout Qualifying', icon: Zap },
          { id: 'aero' as const, discipline: 'formula' as const, label: 'Active Aero (X & Z Mode)', icon: Wind },
          { id: 'overtake' as const, discipline: 'formula' as const, label: 'Overtake Mode', icon: Gauge },
          { id: 'powerunit' as const, discipline: 'formula' as const, label: '2026 Hybrid PU', icon: Zap },
          { id: 'tyres' as const, discipline: 'formula' as const, label: 'Tyres & Strategy', icon: Sliders },
          { id: 'ladder' as const, discipline: 'formula' as const, label: 'Feeder Ladder (F4–F1)', icon: Layers },
          { id: 'electric' as const, discipline: 'formula' as const, label: 'Formula E (Electric)', icon: Zap },
          { id: 'endurance' as const, discipline: 'endurance' as const, label: 'Endurance & WEC', icon: Activity },
          { id: 'motogp' as const, discipline: 'motorcycle' as const, label: 'MotoGP (Bikes)', icon: Award },
          { id: 'rally' as const, discipline: 'rally' as const, label: 'Rally & Stages (WRC)', icon: Compass },
          { id: 'gt' as const, discipline: 'gt' as const, label: 'GT World Challenge & GT3', icon: Sliders },
          { id: 'indian' as const, discipline: 'indian' as const, label: 'Indian Motorsport 🇮🇳', icon: Flag },
          { id: 'flags' as const, discipline: 'fundamentals' as const, label: 'Flags & Safety', icon: Flag },
          { id: 'officials' as const, discipline: 'fundamentals' as const, label: 'Officials & Stewards', icon: Scale },
          { id: 'points' as const, discipline: 'fundamentals' as const, label: 'Points System', icon: Trophy },
          { id: 'glossary' as const, discipline: 'glossary' as const, label: 'Glossary', icon: HelpCircle },
        ]
          .filter(topic => topic.discipline === activeDiscipline)
          .map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <Icon size={13} style={{ color: isActive ? 'var(--f1-red)' : 'var(--text-muted)' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </nav>

      {/* TAB 1: THE CHAMPIONSHIP */}
      {activeTab === 'overview' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
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
                {item.relatedLink && (
                  <div style={{ marginTop: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Link
                      to={item.relatedLink.url}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--f1-red)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span>{item.relatedLink.label}</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
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

      {/* TAB: INDIAN MOTORSPORT */}
      {activeTab === 'indian' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: '#ff9933', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              DOMESTIC MOTORSPORT PYRAMID • FMSCI GOVERNANCE
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              The Indian Racing Ecosystem & Driver Ladder
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              From grassroots Rotax Max and X30 two-stroke karting to national prototype franchise leagues and FIA-certified junior championships, Indian motorsport provides a domestic ladder awarding up to 12 FIA Super Licence points.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#ff9933' }}>PROTOTYPE & FRANCHISE</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>City Teams</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Indian Racing League (IRL)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                The flagship series of the Indian Racing Festival. Six city-based franchises compete with Italian Wolf GB08 Thunder carbon-chassis prototypes powered by 215 bhp Aprilia RSV4 engines.
              </p>
              <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: '0.75rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.8rem' }}>Gender-Equal Driver Pairing:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                  Every franchise must field both male and female professional drivers sharing the car across sprint races, earning equal points towards the team championship.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#10b981' }}>FIA CERTIFIED STEP 1</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>12 Super Licence Points</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                FIA Formula 4 Indian Championship
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                The official national gateway for junior talents stepping out of karting into international carbon-fibre single-seaters.
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li>Identical French Mygale M21-F4 chassis with Alpine 1.3L turbocharged engines (~160 bhp).</li>
                <li>Operated centrally with equalized machinery, giving young drivers transparent benchmark racing on home soil.</li>
                <li>Champion earns 12 official FIA Super Licence points towards the 40 points needed for Formula 1.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)' }}>ICONIC CIRCUITS</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4 Permanent Tracks</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Domestic Racing Venues
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                India's competitive circuits span permanent championship circuits to high-profile night street courses:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li><strong style={{ color: '#fff' }}>Buddh International Circuit (BIC)</strong>: FIA Grade 1 Tilke masterpiece in Greater Noida with a 1.06 km straight.</li>
                <li><strong style={{ color: '#fff' }}>Madras International Circuit (MIC)</strong>: Historic 3.717 km technical proving ground in Irungattukottai.</li>
                <li><strong style={{ color: '#fff' }}>Kari Motor Speedway</strong>: 2.1 km compact handling circuit in Coimbatore.</li>
                <li><strong style={{ color: '#fff' }}>Chennai Street Circuit</strong>: 3.5 km FIA Grade 3 night street circuit around Island Grounds and Napier Bridge.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* TAB: GT WORLD CHALLENGE & GT3 */}
      {activeTab === 'gt' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              SRO MOTORSPORTS GROUP / FIA GT3
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#fff' }}>
              GT Racing & Customer Sportscar Competition
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', maxWidth: '800px', margin: 0 }}>
              GT racing bridges manufacturer prestige with customer privateers. Contested by homologated FIA GT3 supercars from Ferrari, Porsche, BMW, Mercedes-AMG, and Aston Martin, performance is equalized through strict Balance of Performance (BoP) ballast and air restrictors.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b' }}>DUAL CHAMPIONSHIP CUPS</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sprint & Endurance</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Sprint vs Endurance Cups
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Championships like Fanatec GT World Challenge Europe contest two complementary disciplines:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li><strong style={{ color: '#fff' }}>Sprint Cup:</strong> 60-minute flat-out sprints with a mandatory driver change pit window between minutes 25 and 35.</li>
                <li><strong style={{ color: '#fff' }}>Endurance Cup:</strong> 3-hour, 1,000 km, or 24-hour marathons crowned by the iconic CrowdStrike 24 Hours of Spa.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#10b981' }}>FIA DRIVER GRADING</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Pro / Gold / Silver / Bronze</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                Categorisations & Pro-Am Racing
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Drivers are categorized into Platinum, Gold, Silver, and Bronze to ensure fair sporting parity:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0 1.25rem' }}>
                <li><strong style={{ color: '#dc2626' }}>Pro Cup:</strong> Factory works drivers competing for overall glory.</li>
                <li><strong style={{ color: '#f59e0b' }}>Gold & Silver Cup:</strong> Stepping stone for rising sportscar talents and junior single-seater graduates.</li>
                <li><strong style={{ color: '#b45309' }}>Bronze Cup:</strong> True gentleman racers paired with professional coaches, with the class champion earning an automatic invitation to the 24 Hours of Le Mans.</li>
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
