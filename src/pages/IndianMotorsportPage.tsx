import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Shield,
  Trophy,
  Zap,
  MapPin,
  Flag,
  HelpCircle,
  Award,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { PageLoadingFallback } from '../components/common/PageLoadingFallback';
import { getIndianMotorsportEcosystem } from '../services/motorsport/championshipDataService';
import { IndianMotorsportEcosystem } from '../services/motorsport/data/indianMotorsportData';

export const IndianMotorsportPage: React.FC = () => {
  const [data, setData] = useState<IndianMotorsportEcosystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'series' | 'circuits' | 'pathway' | 'drivers' | 'follow'>('overview');
  const [selectedCircuit, setSelectedCircuit] = useState<string>('bic');
  const [activePathwayStep, setActivePathwayStep] = useState<number>(3);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getIndianMotorsportEcosystem()
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
          document.title = 'Indian Motorsport Ecosystem | The Grid';
        }
      })
      .catch(err => {
        console.error('Failed to load Indian motorsport ecosystem data', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !data) {
    return <PageLoadingFallback label="LOADING INDIAN MOTORSPORT ECOSYSTEM..." />;
  }

  const currentCircuit = data.circuits.find(c => c.id === selectedCircuit) || data.circuits[0];

  const navTabs = [
    { id: 'overview', label: 'Ecosystem', icon: <Layers size={15} /> },
    { id: 'series', label: `Championships (${data.series.length})`, icon: <Trophy size={15} /> },
    { id: 'circuits', label: `Circuits (${data.circuits.length})`, icon: <MapPin size={15} /> },
    { id: 'pathway', label: 'Driver Ladder', icon: <Zap size={15} /> },
    { id: 'drivers', label: `Drivers & Teams`, icon: <Users size={15} /> },
    { id: 'follow', label: 'How to Follow', icon: <Flag size={15} /> },
  ];

  return (
    <div className="indian-motorsport-page" style={{ paddingBottom: '6rem' }}>
      {/* 1. HERO BANNER */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 153, 51, 0.22) 0%, rgba(19, 136, 8, 0.08) 50%, var(--bg-base) 80%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0 2rem 0',
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}
          >
            <Link
              to="/championships"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ArrowLeft size={14} /> EXPLORE
            </Link>
            <span>/</span>
            <span style={{ color: data.heroBadgeColor, fontWeight: 700 }}>NATIONAL ECOSYSTEM</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  backgroundColor: 'rgba(255, 153, 51, 0.2)',
                  color: '#ff9933',
                  border: '1px solid rgba(255, 153, 51, 0.4)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                NATIONAL ECOSYSTEM
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                FMSCI SANCTIONED
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#fff',
                  fontWeight: 700,
                  backgroundColor: 'rgba(19, 136, 8, 0.2)',
                  border: '1px solid rgba(19, 136, 8, 0.4)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}
              >
                FIA & FIM AFFILIATED
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.4rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0.25rem 0 0.5rem 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Indian Motorsport Ecosystem
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                color: 'var(--text-secondary)',
                maxWidth: '820px',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {data.tagline}
            </p>

            {/* External Links */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <a
                href={data.howToFollow.governingBodyPortal}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  textDecoration: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Official FMSCI Portal <ExternalLink size={13} />
              </a>
              <Link
                to="/championships/f4"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#e10600',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(225, 6, 0, 0.1)',
                  border: '1px solid rgba(225, 6, 0, 0.3)',
                }}
              >
                F4 Indian Pathway <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK STATS RIBBON */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Permanent Circuits
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {data.quickStats.permanentCircuits} Tracks
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                FIA Super Licence Points
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--telemetry-green, #00e676)', fontFamily: 'var(--font-mono)' }}>
                {data.quickStats.fiaSuperLicencePointsMax} Max (F4 India)
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Championship Series
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ff9933', fontFamily: 'var(--font-mono)' }}>
                {data.quickStats.annualChampionships} Annual
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Formula 1 Alumni
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {data.quickStats.f1DriversProduced} Drivers
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Governing Body
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                FMSCI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TABS NAVIGATION */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-base)',
          position: 'sticky',
          top: 0,
          zIndex: 15,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.75rem 0',
              scrollbarWidth: 'none',
            }}
          >
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isActive ? '#ff9933' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? '1px solid #ff9933' : '1px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MAIN TAB CONTENTS */}
      <main className="container" style={{ paddingTop: '2.5rem' }}>
        {/* TAB 1: ECOSYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#ff9933' }}>
                  <Shield size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Governing Authority & Roots</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Governed by the <strong>Federation of Motor Sports Clubs of India (FMSCI)</strong>, Indian racing traces its roots to postwar airfield battles on the disused WWII Sholavaram runway near Chennai, where pioneering tuners raced modified Ambassadors and classic imports.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--telemetry-green, #00e676)' }}>
                  <Zap size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>The Indian Racing Festival</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Organized by RPPL, the <strong>Indian Racing Festival</strong> combines the franchise-based Indian Racing League (IRL) Wolf GB08 prototypes with the FIA F4 Indian Championship, taking motorsport out of rural enclosures into city street circuits like Chennai’s Island Grounds.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#3b82f6' }}>
                  <Award size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Global Footprint</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  India’s international footprint includes <strong>Force India F1 Team</strong> (scoring multiple podiums from 2008–2018), <strong>Mahindra Racing</strong> (founding ABB FIA Formula E team with 5 E-Prix wins), and F1 drivers Narain Karthikeyan & Karun Chandhok.
                </p>
              </div>
            </div>

            {/* Architecture Map */}
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '1rem', color: '#fff' }}>
                Indian Motorsport Architecture & Pillars
              </h2>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#ff9933', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Pillar 1 • Single-Seaters
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                    Formula LGB & FIA F4 India
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>
                    Transitioning drivers from two-stroke national karts through raw mechanical spaceframe cars into FIA carbon-chassis turbo formulas awarding international Super Licence points.
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Pillar 2 • Prototype & Franchise
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                    Indian Racing League (IRL)
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>
                    Six city franchises (Goa, Hyderabad, Chennai, Bangalore, Bengal, Delhi) fielding 215 bhp Wolf GB08 Thunder prototypes with mandatory gender-equal male and female driver pairings.
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Pillar 3 • National Rallying
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                    INRC Gravel & Tarmac
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>
                    The Indian National Rally Championship tests driver versatility across the coffee estates of Chikmagalur, Tamil Nadu plantations, and Maharashtra gravel trails.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '1rem', color: '#fff' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      <HelpCircle size={16} style={{ color: '#ff9933', flexShrink: 0 }} />
                      <span>{faq.question}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, paddingLeft: '1.5rem' }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAMPIONSHIPS & SERIES */}
        {activeTab === 'series' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                Major Indian Racing Championships & Formulas
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Explore the five primary racing series driving India’s domestic motorsport calendar.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
              {data.series.map(s => (
                <div
                  key={s.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderTop: `3px solid ${s.badgeColor}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          backgroundColor: `${s.badgeColor}22`,
                          color: s.badgeColor,
                          border: `1px solid ${s.badgeColor}44`,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.category}
                      </span>
                      {s.superLicencePoints && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: 'var(--telemetry-green, #00e676)',
                            backgroundColor: 'rgba(0, 230, 118, 0.12)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                          }}
                        >
                          +{s.superLicencePoints} Super Licence Pts
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                      {s.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55, margin: '0 0 1rem 0' }}>
                      {s.description}
                    </p>

                    {/* Machine Specs Snapshot */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Chassis:</span>
                        <span style={{ color: '#fff', fontWeight: 600, maxWidth: '65%', textAlign: 'right' }}>{s.vehicle}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Powertrain:</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{s.engine}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Power Output:</span>
                        <span style={{ color: s.badgeColor, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.powerOutput}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Top Speed:</span>
                        <span style={{ color: 'var(--telemetry-green, #00e676)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.topSpeed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer links */}
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Venues: {s.keyCircuits.slice(0, 2).join(', ')}
                    </div>
                    {s.championshipLink && (
                      <Link
                        to={s.championshipLink}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: '#fff',
                          backgroundColor: s.badgeColor,
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          textDecoration: 'none',
                        }}
                      >
                        VIEW SERIES <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CIRCUITS & VENUES */}
        {activeTab === 'circuits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                Iconic Circuits & Venues of India
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                From Hermann Tilke’s FIA Grade 1 temple at Greater Noida to the historic spiritual home of Indian racing at Irungattukottai.
              </p>
            </div>

            {/* Circuit Selector Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {data.circuits.map(c => {
                const isSelected = selectedCircuit === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCircuit(c.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: isSelected ? 'rgba(255, 153, 51, 0.15)' : 'var(--bg-surface)',
                      color: isSelected ? '#ff9933' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid #ff9933' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c.shortName}
                  </button>
                );
              })}
            </div>

            {/* Circuit Detail Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {currentCircuit.fiaGrade}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Opened {currentCircuit.openedYear}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0 0 0.35rem 0' }}>
                    {currentCircuit.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} style={{ color: '#ff9933' }} /> {currentCircuit.location} ({currentCircuit.state})
                  </div>
                </div>

                {/* Circuit Quick Metrics */}
                <div
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    backgroundColor: 'var(--bg-base)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Length</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{currentCircuit.lengthKm} km</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corners</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff9933' }}>{currentCircuit.corners}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Direction</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--telemetry-green, #00e676)' }}>{currentCircuit.direction}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Straight</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6' }}>{currentCircuit.longestStraightMeters}m</div>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                {currentCircuit.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                  }}
                >
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ff9933', margin: '0 0 0.6rem 0' }}>
                    Technical & Track Characteristics
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {currentCircuit.keyFeatures.map((feat, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>{feat}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                  }}
                >
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#3b82f6', margin: '0 0 0.6rem 0' }}>
                    Historical Milestones & Events
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {currentCircuit.historicalHighlights.map((hist, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>{hist}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DRIVER DEVELOPMENT PATHWAY */}
        {activeTab === 'pathway' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                Grassroots to Global: The Indian Driver Pathway
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                The proven 5-stage progression from two-stroke rental karts in Bengaluru to FIA Formula 2 and Formula 1 test seats.
              </p>
            </div>

            {/* Stepper Navigation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {data.driverPathway.map(step => {
                const isSelected = activePathwayStep === step.step;
                return (
                  <button
                    key={step.step}
                    onClick={() => setActivePathwayStep(step.step)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                      border: isSelected ? `2px solid ${step.badgeColor}` : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: step.badgeColor,
                          backgroundColor: `${step.badgeColor}22`,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        STEP {step.step}
                      </span>
                      {step.superLicencePoints > 0 && (
                        <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green, #00e676)', fontWeight: 800 }}>
                          +{step.superLicencePoints} SL Pts
                        </span>
                      )}
                    </div>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>
                      {step.stageName.split('(')[0]}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {step.targetAge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Deep-Dive */}
            {(() => {
              const step = data.driverPathway.find(s => s.step === activePathwayStep) || data.driverPathway[2];
              return (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${step.badgeColor}`,
                    borderRadius: '12px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: step.badgeColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Step {step.step} of 5 • {step.targetAge}
                      </div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                        {step.stageName}
                      </h3>
                    </div>
                    <div
                      style={{
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Typical Budget: </span>
                      <strong style={{ color: '#ff9933' }}>{step.typicalCostBudget}</strong>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    <strong>Core Objective:</strong> {step.objective}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Machinery & Equipment
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                        {step.machinery}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Primary Championships
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                        {step.primarySeries.join(' • ')}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Key Tracks & Proving Grounds
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                        {step.keyVenues.join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: DRIVERS & FRANCHISES */}
        {activeTab === 'drivers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                Indian Motorsport Icons, Contenders & Franchises
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Celebrating the Formula 1 trailblazers, international feeder series winners, next-gen talents, and city franchises.
              </p>
            </div>

            {/* Drivers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
              {data.drivers.map(drv => (
                <div
                  key={drv.name}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: `${drv.badgeColor}22`,
                        color: drv.badgeColor,
                        border: `2px solid ${drv.badgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {drv.avatarInitials}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: drv.badgeColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {drv.era}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: '0.1rem 0' }}>
                        {drv.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {drv.role} • {drv.hometown.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {drv.keyAchievements.map((ach, idx) => (
                      <li key={idx} style={{ marginBottom: '0.3rem' }}>{ach}</li>
                    ))}
                  </ul>

                  {drv.activeSeries && (
                    <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      Active: <strong style={{ color: '#fff' }}>{drv.activeSeries}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* City Franchises Section */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.35rem' }}>
                Indian Racing Festival City Franchises
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Six city teams competing across the Indian Racing League and F4 Indian Championship.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
                {data.franchises.map(team => (
                  <div
                    key={team.teamName}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${team.primaryColor}`,
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{team.teamName}</strong>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{team.city}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{team.tagline}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Drivers: {team.notableDrivers.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: HOW TO FOLLOW & PARTICIPATE */}
        {activeTab === 'follow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                How to Follow & Get Involved in Indian Motorsport
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Broadcast streams, licensing instructions, and accredited racing academies.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Broadcast Channels */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff9933', marginBottom: '1rem' }}>
                  <Calendar size={18} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Live Streaming & Broadcast</h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  {data.howToFollow.broadcastPartners.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* FMSCI License Steps */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--telemetry-green, #00e676)', marginBottom: '1rem' }}>
                  <CheckCircle2 size={18} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Getting Your FMSCI License</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.howToFollow.licensingSteps.map((step, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Karting Academies Directory */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
                Accredited Karting & Racing Academies
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {data.howToFollow.kartingAcademies.map((acad, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.1rem 1.25rem',
                    }}
                  >
                    <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                      {acad.name}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: '#ff9933', fontFamily: 'var(--font-mono)' }}>
                      {acad.city}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Home Track: {acad.track}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
