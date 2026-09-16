import React, { useState } from 'react';
import { Award, ShieldCheck, ChevronRight, Calculator, Users, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import { JUNIOR_ACADEMIES_REGISTRY } from '../../services/dataArchitecture/identifierRegistry';
import { SUPER_LICENCE_POINTS_TABLE } from '../../services/dataArchitecture/normalizers/feederNormalizer';
import { JuniorAcademyId } from '../../types/dataContract';

const LADDER_STEPS = [
  {
    tier: 1,
    code: 'KARTING',
    title: 'Karting Foundation',
    championship: 'CIK-FIA Karting / National Karting',
    ageRange: 'Ages 8–15',
    spec: 'KZ / OK-Junior 125cc 2-stroke direct-drive karts (130+ km/h)',
    superLicencePoints: 'Foundation (Pre-Licence)',
    description: 'The training ground where Max Verstappen, Lewis Hamilton, and Ayrton Senna forged lightning racecraft and raw car control.',
    badgeColor: '#64748b',
  },
  {
    tier: 2,
    code: 'F4',
    title: 'FIA Formula 4',
    championship: 'National F4 (Italy, GB4, F4 India, Spanish F4, etc.)',
    ageRange: 'Ages 15+',
    spec: 'Tatuus / Mygale Carbon Monocoque • Abarth / Renault 1.4L Turbo (160 bhp)',
    superLicencePoints: '12 Points (Champion)',
    description: 'First step from karting into carbon-fibre slicks-and-wings single-seaters with FIA halo cockpit protection.',
    badgeColor: '#10b981',
  },
  {
    tier: 3,
    code: 'F3',
    title: 'FIA Formula 3 Championship',
    championship: 'Official F1 Support Series (10 Rounds)',
    ageRange: 'Junior Single-Seater',
    spec: 'Dallara F3 2025 • Mecachrome 3.4L Naturally Aspirated V6 (380 bhp)',
    superLicencePoints: '30 Points (Champion) • 25 (P2) • 20 (P3)',
    description: 'Ultra-competitive 30-car spec grid racing on Grand Prix weekends with top-12 reverse grid Sprint races.',
    badgeColor: '#e10600',
  },
  {
    tier: 4,
    code: 'F2',
    title: 'FIA Formula 2 Championship',
    championship: 'Premier Feeder Series (14 Rounds)',
    ageRange: 'Feeder Apex',
    spec: 'Dallara F2 2024 • Mecachrome 3.4L Turbo V6 (620 bhp) • 18-inch Pirelli tyres',
    superLicencePoints: '40 Points (Top 3) — Instant Super Licence Eligibility!',
    description: 'Mandatory pit stops, Option & Prime tyre strategy, carbon-carbon brakes, and top-10 reverse grid Sprints.',
    badgeColor: '#0090d0',
  },
  {
    tier: 5,
    code: 'F1',
    title: 'FIA Formula 1 World Championship',
    championship: 'The Pinnacle of Global Motorsport',
    ageRange: 'World Championship',
    spec: 'Active Aero • 1.6L V6 Turbo Hybrid (1,000+ bhp) • 18-inch Pirelli tyres',
    superLicencePoints: 'Mandatory 40 Points Required',
    description: '20-22 elite drivers competing for the FIA Formula One Drivers’ and Constructors’ World Championships.',
    badgeColor: '#e10600',
  },
];

export interface FeederLadderViewProps {
  currentTierId?: string;
  onSelectCompetitor?: (name: string) => void;
}

export const FeederLadderView: React.FC<FeederLadderViewProps> = ({ currentTierId }) => {
  const [selectedAcademy, setSelectedAcademy] = useState<JuniorAcademyId | 'all'>('all');
  const initialStep = currentTierId === 'f4' ? 2 : currentTierId === 'f3' ? 3 : currentTierId === 'f1' ? 5 : 4;
  const [selectedStep, setSelectedStep] = useState<number>(initialStep);

  // Interactive Super Licence Simulator State
  const [f2Rank, setF2Rank] = useState<number>(1);
  const [f3Rank, setF3Rank] = useState<number>(2);
  const [f4Rank, setF4Rank] = useState<number>(1);

  // Compute points
  const f2Points = SUPER_LICENCE_POINTS_TABLE.f2[f2Rank - 1]?.points || 0;
  const f3Points = SUPER_LICENCE_POINTS_TABLE.f3[f3Rank - 1]?.points || 0;
  const f4Points = f4Rank === 1 ? 12 : f4Rank === 2 ? 10 : f4Rank === 3 ? 7 : 0;
  const totalPoints = f2Points + f3Points + f4Points;
  const isEligible = totalPoints >= 40;

  const academies = Object.values(JUNIOR_ACADEMIES_REGISTRY);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Interactive 5-Step Feeder Pyramid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              The Official FIA Single-Seater Career Pyramid
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              From grassroots karting to Formula 1 race seat eligibility. Click any tier to explore regulations and Super Licence points.
            </p>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
            }}
          >
            40 POINTS = SUPER LICENCE
          </span>
        </div>

        {/* Pyramid Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '0.75rem',
          }}
        >
          {LADDER_STEPS.map(step => {
            const isSelected = selectedStep === step.tier;
            return (
              <button
                key={step.tier}
                type="button"
                onClick={() => setSelectedStep(step.tier)}
                style={{
                  backgroundColor: isSelected ? `${step.badgeColor}22` : 'var(--bg-surface)',
                  border: isSelected ? `2px solid ${step.badgeColor}` : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      color: step.badgeColor,
                    }}
                  >
                    STEP 0{step.tier}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    {step.code}
                  </span>
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {step.ageRange}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {step.superLicencePoints}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Spotlight Details */}
        {(() => {
          const activeStep = LADDER_STEPS.find(s => s.tier === selectedStep) || LADDER_STEPS[3];
          return (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${activeStep.badgeColor}55`,
                borderRadius: '12px',
                padding: '1.25rem',
                marginTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: activeStep.badgeColor,
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  TIER {activeStep.tier} • {activeStep.code}
                </span>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  {activeStep.title} — {activeStep.championship}
                </h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                {activeStep.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span><strong>Machine Spec:</strong> {activeStep.spec}</span>
                <span><strong>SL Allocation:</strong> {activeStep.superLicencePoints}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 2. Interactive Super Licence Simulator */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={18} style={{ color: '#60a5fa' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                FIA Super Licence 40-Point Simulator
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              An F1 driver requires 40 FIA points over 3 consecutive seasons to qualify for a Formula 1 Super Licence race seat.
            </p>
          </div>

          {/* Eligibility Badge */}
          <div
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              backgroundColor: isEligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: isEligible ? '1px solid #10b981' : '1px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            {isEligible ? <CheckCircle2 size={20} style={{ color: '#10b981' }} /> : <Award size={20} style={{ color: '#ef4444' }} />}
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: isEligible ? '#10b981' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
                {totalPoints} / 40 PTS
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isEligible ? '#10b981' : '#ef4444', textTransform: 'uppercase' }}>
                {isEligible ? 'Super Licence Eligible!' : `Needs ${40 - totalPoints} more points`}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Season Result Inputs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '1rem',
          }}
        >
          {/* Season 1: FIA F2 */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#0090d0', fontWeight: 800, marginBottom: '0.35rem' }}>
              SEASON 1: FIA FORMULA 2
            </div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Final Championship Standing:
            </label>
            <select
              value={f2Rank}
              onChange={e => setF2Rank(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: '#1c1f26',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {SUPER_LICENCE_POINTS_TABLE.f2.map((rule, idx) => (
                <option key={idx} value={idx + 1}>
                  {rule.position} (+{rule.points} pts)
                </option>
              ))}
              <option value={11}>Outside Top 10 (0 pts)</option>
            </select>
          </div>

          {/* Season 2: FIA F3 */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#e10600', fontWeight: 800, marginBottom: '0.35rem' }}>
              SEASON 2: FIA FORMULA 3
            </div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Final Championship Standing:
            </label>
            <select
              value={f3Rank}
              onChange={e => setF3Rank(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: '#1c1f26',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {SUPER_LICENCE_POINTS_TABLE.f3.map((rule, idx) => (
                <option key={idx} value={idx + 1}>
                  {rule.position} (+{rule.points} pts)
                </option>
              ))}
              <option value={11}>Outside Top 10 (0 pts)</option>
            </select>
          </div>

          {/* Season 3: National F4 */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 800, marginBottom: '0.35rem' }}>
              SEASON 3: FIA FORMULA 4
            </div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Final Championship Standing:
            </label>
            <select
              value={f4Rank}
              onChange={e => setF4Rank(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: '#1c1f26',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <option value={1}>1st Place Champion (+12 pts)</option>
              <option value={2}>2nd Place Runner-Up (+10 pts)</option>
              <option value={3}>3rd Place (+7 pts)</option>
              <option value={4}>Outside Top 3 (0 pts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Junior Academy Affiliation Directory */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              Formula 1 Team Junior Academies
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Every F1 manufacturer operates a driver development programme nurturing talents from karting through F3 and F2.
            </p>
          </div>
        </div>

        {/* Academy Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '0.85rem',
          }}
        >
          {academies.map(acad => (
            <div
              key={acad.academyId}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid ${acad.accentColor}44`,
                borderRadius: '12px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: acad.accentColor,
                    }}
                  >
                    {acad.f1TeamName}
                  </span>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: acad.accentColor,
                      boxShadow: `0 0 8px ${acad.accentColor}`,
                    }}
                  />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
                  {acad.name}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.75rem 0' }}>
                  {acad.description}
                </p>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                HQ: {acad.headquarters}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
