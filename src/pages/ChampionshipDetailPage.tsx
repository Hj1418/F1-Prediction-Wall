import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Users,
  Gauge,
  Award,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Flag,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { getChampionshipDetail } from '../services/motorsport/championshipDataService';
import { ChampionshipDetailData } from '../types/motorsportDetail';
import { PageLoadingFallback } from '../components/common/PageLoadingFallback';

type DetailTab = 'overview' | 'calendar' | 'standings' | 'teams' | 'feature';

export const ChampionshipDetailPage: React.FC = () => {
  const { championshipId } = useParams<{ championshipId: string }>();
  const [data, setData] = useState<ChampionshipDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [standingsSubTab, setStandingsSubTab] = useState<'drivers' | 'teams'>('drivers');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [prevChampionshipId, setPrevChampionshipId] = useState(championshipId);

  if (prevChampionshipId !== championshipId) {
    setPrevChampionshipId(championshipId);
    setSelectedClass('all');
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (championshipId) {
      getChampionshipDetail(championshipId)
        .then(result => {
          if (isMounted) {
            setData(result);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to load championship details:', err);
          if (isMounted) {
            setData(null);
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [championshipId]);

  const featureTab = React.useMemo(() => {
    if (data?.featureGuide) {
      return {
        id: 'feature' as DetailTab,
        label: data.featureGuide.tabLabel,
        icon: <Zap size={15} />,
      };
    }
    if (data?.superLicencePoints) {
      return {
        id: 'feature' as DetailTab,
        label: 'F1 Ladder & Licence',
        icon: <Award size={15} />,
      };
    }
    return null;
  }, [data]);

  const navTabs = React.useMemo(() => {
    if (!data) return [];
    const list: Array<{ id: DetailTab; label: string; icon: React.ReactNode }> = [
      { id: 'overview', label: 'Overview & Specs', icon: <Layers size={15} /> },
      { id: 'calendar', label: `Calendar (${data.rounds.length})`, icon: <Calendar size={15} /> },
      { id: 'standings', label: 'Standings', icon: <Trophy size={15} /> },
      { id: 'teams', label: `Teams & Grid (${data.teamsStandings.length})`, icon: <Users size={15} /> },
    ];
    if (featureTab) {
      list.push(featureTab);
    }
    return list;
  }, [data, featureTab]);

  const filteredDrivers = React.useMemo(() => {
    if (!data?.driversStandings) return [];
    if (!data.classes || selectedClass === 'all') return data.driversStandings;
    return data.driversStandings.filter(d => d.racingClass?.toLowerCase() === selectedClass.toLowerCase());
  }, [data, selectedClass]);

  const filteredTeams = React.useMemo(() => {
    if (!data?.teamsStandings) return [];
    if (!data.classes || selectedClass === 'all') return data.teamsStandings;
    return data.teamsStandings.filter(t => t.racingClass?.toLowerCase() === selectedClass.toLowerCase());
  }, [data, selectedClass]);

  const renderClassFilter = () => {
    if (!data?.classes || data.classes.length === 0) return null;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.35rem 0.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          width: 'fit-content',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginRight: '0.25rem',
            paddingLeft: '0.25rem',
          }}
        >
          Category:
        </span>
        <button
          type="button"
          onClick={() => setSelectedClass('all')}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            backgroundColor: selectedClass === 'all' ? data.heroBadgeColor : 'transparent',
            color: selectedClass === 'all' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          ALL CLASSES ({data.driversStandings.length})
        </button>
        {data.classes.map(cls => {
          const isSelected = selectedClass.toLowerCase() === cls.name.toLowerCase();
          const classColor = cls.badgeColor || cls.color || data.heroBadgeColor;
          return (
            <button
              key={cls.name}
              type="button"
              onClick={() => setSelectedClass(cls.name.toLowerCase())}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: isSelected ? `1px solid ${classColor}` : '1px solid transparent',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                backgroundColor: isSelected ? `${classColor}22` : 'transparent',
                color: isSelected ? classColor : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cls.name.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <PageLoadingFallback label="LOADING CHAMPIONSHIP DETAILS..." />;
  }

  // Indian Motorsport dedicated ecosystem redirect
  if (championshipId?.toLowerCase() === 'indian-motorsport') {
    return <Navigate to="/indian-motorsport" replace />;
  }

  // F1 special redirect banner
  if (championshipId?.toLowerCase() === 'f1') {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            padding: '2.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid rgba(225, 6, 0, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 0 30px rgba(225, 6, 0, 0.15)',
          }}
        >
          <div style={{ color: 'var(--f1-red)', marginBottom: '1rem' }}>
            <Sparkles size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', color: '#fff' }}>
            Formula 1 Is The Active Core Hub
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Formula 1 features our complete live race weekend tracker, interactive Prediction Bench,
            circuit telemetry, and real-time championship leaderboards.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/races"
              style={{
                backgroundColor: 'var(--f1-red)',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              GO TO F1 GRAND PRIX HUB <ChevronRight size={16} />
            </Link>
            <Link
              to="/championships"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not found or not yet implemented
  if (!data) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '550px',
            margin: '0 auto',
            padding: '2.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
          }}
        >
          <Shield size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
            Championship Data In Preparation
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            We are building out deep coverage series by series according to our progressive roadmap.
            Check back soon or explore our available championships!
          </p>
          <Link
            to="/championships"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--f1-red)',
              fontWeight: 800,
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={16} /> BACK TO EXPLORE MOTORSPORT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="championship-detail-page" style={{ paddingBottom: '6rem' }}>
      {/* 1. HERO BANNER */}
      <section
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${data.heroBadgeColor}28 0%, var(--bg-base) 75%)`,
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
            <span style={{ color: data.heroBadgeColor, fontWeight: 700 }}>{data.shortName}</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  backgroundColor: `${data.heroBadgeColor}22`,
                  color: data.heroBadgeColor,
                  border: `1px solid ${data.heroBadgeColor}55`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {data.tier}
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
                FIA SANCTIONED
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#fff',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}
              >
                {data.seasonYear} SEASON
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0.25rem 0 0.5rem 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {data.name}
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                color: 'var(--text-secondary)',
                maxWidth: '750px',
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              {data.tagline}
            </p>

            {/* Link out */}
            <div style={{ marginTop: '0.5rem' }}>
              <a
                href={data.officialWebsite}
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
                Official FIA Series Site <ExternalLink size={13} />
              </a>
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
                Calendar
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {data.rounds.length} Rounds
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Teams Grid
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {data.teamsStandings.length} Teams
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                {data.competitorLabel ? `${data.competitorLabel}s` : 'Drivers'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {data.driversStandings.length} {data.competitorLabel ? `${data.competitorLabel}s` : 'Drivers'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Top Speed
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--telemetry-green, #00e676)', fontFamily: 'var(--font-mono)' }}>
                {data.technicalSpecs.topSpeed}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Power Output
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: data.heroBadgeColor, fontFamily: 'var(--font-mono)' }}>
                {data.technicalSpecs.powerOutput.split('@')[0]}
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
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isActive ? data.heroBadgeColor : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? `1px solid ${data.heroBadgeColor}` : '1px solid transparent',
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

      {/* 4. TAB CONTENTS */}
      <main className="container" style={{ paddingTop: '2.5rem' }}>
        {/* TAB 1: OVERVIEW & SPECS */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Introductory Cards Grid */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: data.heroBadgeColor }}>
                  <Shield size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Role in the Feeder Ladder</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {data.feederLadderRole}
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
                  <Gauge size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Spec Equality Philosophy</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {data.specRegulationsSummary}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#eab308' }}>
                  <Trophy size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Points Allocation Rule</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {data.pointsSystemDescription}
                </p>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '1rem', color: '#fff' }}>
                Technical & Machinery Specifications
              </h2>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '1px',
                    backgroundColor: 'var(--border-subtle)',
                  }}
                >
                  {Object.entries(data.technicalSpecs).map(([key, value]) => {
                    const formatKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());
                    return (
                      <div
                        key={key}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          padding: '1.1rem 1.25rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {formatKey}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                          {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Series FAQs */}
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 800,
                        color: '#fff',
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <HelpCircle size={16} style={{ color: data.heroBadgeColor, flexShrink: 0 }} />
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

        {/* TAB 2: CALENDAR */}
        {activeTab === 'calendar' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#fff' }}>
                {data.seasonYear} Official Championship Calendar
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                {data.rounds.length} championship rounds scheduled for the {data.seasonYear} season.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.rounds.map(round => (
                <div
                  key={round.roundNumber}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                        }}
                      >
                        ROUND {round.roundNumber}
                      </span>
                      <span style={{ fontSize: '1.35rem' }}>{round.flag}</span>
                      <div>
                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                          {round.officialTitle}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {round.circuitName} • {round.location}, {round.country}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {round.surface && (
                        <span
                          style={{
                            backgroundColor:
                              round.surface === 'Snow'
                                ? 'rgba(56, 189, 248, 0.18)'
                                : round.surface === 'Gravel'
                                ? 'rgba(245, 158, 11, 0.18)'
                                : round.surface === 'Tarmac'
                                ? 'rgba(148, 163, 184, 0.18)'
                                : 'rgba(168, 85, 247, 0.18)',
                            color:
                              round.surface === 'Snow'
                                ? '#38bdf8'
                                : round.surface === 'Gravel'
                                ? '#f59e0b'
                                : round.surface === 'Tarmac'
                                ? '#cbd5e1'
                                : '#c084fc',
                            border: '1px solid currentColor',
                            padding: '0.15rem 0.55rem',
                            borderRadius: '5px',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {round.surface}
                        </span>
                      )}
                      {round.duration && (
                        <div
                          style={{
                            backgroundColor: `${data.heroBadgeColor}1f`,
                            color: data.heroBadgeColor,
                            border: `1px solid ${data.heroBadgeColor}44`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Clock size={12} /> {round.duration}
                        </div>
                      )}
                      <div style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} /> {round.dates}
                      </div>
                      {round.totalStages && round.competitiveDistanceKm ? (
                        <div style={{ color: 'var(--text-muted)' }}>
                          {round.totalStages} Stages • {round.competitiveDistanceKm} km comp.
                        </div>
                      ) : (
                        round.circuitLengthKm ? (
                          <div style={{ color: 'var(--text-muted)' }}>
                            {round.circuitLengthKm} km
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>

                  {/* Sessions breakdown */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    {round.sessions.map((session, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: data.heroBadgeColor, marginBottom: '0.25rem' }}>
                          <span>{session.day}</span>
                          <span>{session.durationMinutes}m</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                          {session.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {session.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STANDINGS */}
        {activeTab === 'standings' && (
          <div>
            {/* Sub Tabs: Drivers vs Teams */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                  {standingsSubTab === 'drivers' ? `${data.competitorLabel || 'Driver'}s Championship` : 'Teams Championship'} Standings
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Official {data.seasonYear} championship points tally.
                </p>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => setStandingsSubTab('drivers')}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: standingsSubTab === 'drivers' ? data.heroBadgeColor : 'transparent',
                    color: standingsSubTab === 'drivers' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {(data.competitorLabel || 'Driver').toUpperCase()}S ({filteredDrivers.length})
                </button>
                <button
                  onClick={() => setStandingsSubTab('teams')}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: standingsSubTab === 'teams' ? data.heroBadgeColor : 'transparent',
                    color: standingsSubTab === 'teams' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  TEAMS ({filteredTeams.length})
                </button>
              </div>
            </div>

            {/* Optional Multi-Class Category Filter */}
            {renderClassFilter()}

            {/* Drivers Standings Table */}
            {standingsSubTab === 'drivers' && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Pos</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>{data.competitorLabel || 'Driver'}</th>
                      {data.classes && <th style={{ padding: '0.85rem 1.25rem' }}>Class</th>}
                      <th style={{ padding: '0.85rem 1.25rem' }}>Team</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Academy</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Wins</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Podiums</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.map(driver => (
                      <tr
                        key={`${driver.racingClass || 'all'}-${driver.carNumber}-${driver.driverName}`}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '24px',
                              textAlign: 'center',
                              color: driver.rank === 1 ? '#eab308' : driver.rank === 2 ? '#cbd5e1' : driver.rank === 3 ? '#d97706' : 'var(--text-secondary)',
                            }}
                          >
                            {driver.rank}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                #{driver.carNumber}
                              </span>
                              <strong style={{ color: '#ffffff' }}>{driver.driverName}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                ({driver.nationality})
                              </span>
                              {driver.driverGrade && (
                                <span
                                  style={{
                                    fontSize: '0.64rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 800,
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '4px',
                                    backgroundColor:
                                      driver.driverGrade === 'Platinum' ? 'rgba(234, 179, 8, 0.2)' :
                                      driver.driverGrade === 'Gold' ? 'rgba(217, 119, 6, 0.2)' :
                                      driver.driverGrade === 'Silver' ? 'rgba(148, 163, 184, 0.2)' :
                                      'rgba(180, 83, 9, 0.2)',
                                    color:
                                      driver.driverGrade === 'Platinum' ? '#fde047' :
                                      driver.driverGrade === 'Gold' ? '#fbbf24' :
                                      driver.driverGrade === 'Silver' ? '#cbd5e1' :
                                      '#d97706',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                  }}
                                >
                                  {driver.driverGrade.toUpperCase()}
                                </span>
                              )}
                            </div>
                            {driver.coDrivers && driver.coDrivers.length > 0 && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                                {driver.coDrivers.length === 1 ? 'Co-driver' : 'Co-drivers'}: {driver.coDrivers.join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        {data.classes && (
                          <td style={{ padding: '0.85rem 1.25rem' }}>
                            {driver.racingClass ? (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 800,
                                  color: (() => {
                                    const found = data.classes.find(c => c.name.toLowerCase() === driver.racingClass?.toLowerCase());
                                    return found?.badgeColor || found?.color || '#fff';
                                  })(),
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {driver.racingClass}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        )}
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                          {driver.teamName}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {driver.juniorAcademy ? (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                color: driver.academyColor || '#fff',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: `1px solid ${driver.academyColor ? `${driver.academyColor}44` : 'var(--border-subtle)'}`,
                              }}
                            >
                              {driver.juniorAcademy}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {driver.wins}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {driver.podiums}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#fff' }}>
                          {driver.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Teams Standings Table */}
            {standingsSubTab === 'teams' && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Pos</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Team</th>
                      {data.classes && <th style={{ padding: '0.85rem 1.25rem' }}>Class</th>}
                      <th style={{ padding: '0.85rem 1.25rem' }}>{data.competitorLabel ? `${data.competitorLabel}s Lineup` : 'Drivers Lineup'}</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Wins</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Poles</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map(team => (
                      <tr
                        key={`${team.racingClass || 'all'}-${team.teamName}`}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '24px',
                              textAlign: 'center',
                              color: team.rank === 1 ? '#eab308' : team.rank === 2 ? '#cbd5e1' : team.rank === 3 ? '#d97706' : 'var(--text-secondary)',
                            }}
                          >
                            {team.rank}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ width: '4px', height: '18px', backgroundColor: team.primaryColor, borderRadius: '2px' }} />
                              <span style={{ fontSize: '1.1rem' }}>{team.flag}</span>
                              <strong style={{ color: '#ffffff' }}>{team.teamName}</strong>
                            </div>
                            {(team.carModel || team.manufacturer) && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem', paddingLeft: '1.5rem' }}>
                                {[team.carModel, team.manufacturer].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </div>
                        </td>
                        {data.classes && (
                          <td style={{ padding: '0.85rem 1.25rem' }}>
                            {team.racingClass ? (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 800,
                                  color: (() => {
                                    const found = data.classes.find(c => c.name.toLowerCase() === team.racingClass?.toLowerCase());
                                    return found?.badgeColor || found?.color || '#fff';
                                  })(),
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {team.racingClass}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        )}
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {team.drivers.join(' • ')}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {team.wins}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {team.polePositions}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#fff' }}>
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TEAMS & DRIVERS */}
        {activeTab === 'teams' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
                {data.seasonYear} Complete Team Lineups & {data.competitorLabel ? `${data.competitorLabel} Grid` : 'Driver Grid'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                {filteredTeams.length} competing teams and elite {data.competitorLabel ? `${data.competitorLabel.toLowerCase()} line-ups` : 'driver line-ups'}.
              </p>
            </div>

            {/* Optional Multi-Class Category Filter */}
            {renderClassFilter()}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredTeams.map(team => {
                // Find drivers for this team
                const teamDrivers = data.driversStandings.filter(d => d.teamName.toLowerCase().includes(team.teamName.toLowerCase()) || team.teamName.toLowerCase().includes(d.teamName.toLowerCase()));

                return (
                  <div
                    key={`${team.racingClass || 'all'}-${team.teamName}`}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderTop: `3px solid ${team.primaryColor}`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.2rem' }}>{team.flag}</span>
                            <strong style={{ fontSize: '1rem', color: '#fff' }}>{team.teamName}</strong>
                            {team.racingClass && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 800,
                                  color: (() => {
                                    const found = data.classes?.find(c => c.name.toLowerCase() === team.racingClass?.toLowerCase());
                                    return found?.badgeColor || found?.color || '#fff';
                                  })(),
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {team.racingClass}
                              </span>
                            )}
                          </div>
                          {team.carModel && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                              {data.vehicleLabel || 'Car'}: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{team.carModel}</span>
                              {team.manufacturer && (
                                <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>({team.manufacturer})</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          P{team.rank} • {team.points} pts
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                        Based in {team.country}
                      </div>

                      {/* Drivers paired */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {teamDrivers.length > 0 ? (
                          teamDrivers.map(drv => (
                            <div
                              key={`${drv.carNumber}-${drv.driverName}`}
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    #{drv.carNumber}
                                  </span>
                                  <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>
                                    {drv.driverName}
                                  </span>
                                  {drv.driverGrade && (
                                    <span
                                      style={{
                                        fontSize: '0.62rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 800,
                                        padding: '0.08rem 0.3rem',
                                        borderRadius: '3px',
                                        backgroundColor:
                                          drv.driverGrade === 'Platinum' ? 'rgba(234, 179, 8, 0.2)' :
                                          drv.driverGrade === 'Gold' ? 'rgba(217, 119, 6, 0.2)' :
                                          drv.driverGrade === 'Silver' ? 'rgba(148, 163, 184, 0.2)' :
                                          'rgba(180, 83, 9, 0.2)',
                                        color:
                                          drv.driverGrade === 'Platinum' ? '#fde047' :
                                          drv.driverGrade === 'Gold' ? '#fbbf24' :
                                          drv.driverGrade === 'Silver' ? '#cbd5e1' :
                                          '#d97706',
                                      }}
                                    >
                                      {drv.driverGrade}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  {drv.juniorAcademy && (
                                    <span
                                      style={{
                                        fontSize: '0.65rem',
                                        fontFamily: 'var(--font-mono)',
                                        color: drv.academyColor || 'var(--text-secondary)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        padding: '0.1rem 0.35rem',
                                        borderRadius: '3px',
                                      }}
                                    >
                                      {drv.juniorAcademy.replace(' Driver Development', '').replace(' Racing Driver Academy', '').replace(' Driver Academy', '')}
                                    </span>
                                  )}
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                                    {drv.points}p
                                  </span>
                                </div>
                              </div>
                              {drv.coDrivers && drv.coDrivers.length > 0 && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '1.25rem' }}>
                                  {drv.coDrivers.length === 1 ? `Co-driver: ${drv.coDrivers[0]}` : `Sharing car with: ${drv.coDrivers.join(', ')}`}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {team.drivers.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SPECIALIZED FEATURE GUIDE / LADDER PROGRESSION */}
        {activeTab === 'feature' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* VARIANT A: Dedicated Technical & Sporting Innovation Guide (e.g. Formula E Gen3 Evo & Energy) */}
            {data.featureGuide && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.4rem', color: '#fff' }}>
                    {data.featureGuide.tabTitle}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.55 }}>
                    {data.featureGuide.tabDescription}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {data.featureGuide.sections.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: `4px solid ${sec.badgeColor || data.heroBadgeColor}`,
                        borderRadius: '12px',
                        padding: '1.5rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '0 0 0.25rem 0' }}>
                            {sec.title}
                          </h3>
                          {sec.subtitle && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {sec.subtitle}
                            </div>
                          )}
                        </div>
                        {sec.badge && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              backgroundColor: `${sec.badgeColor || data.heroBadgeColor}22`,
                              color: sec.badgeColor || data.heroBadgeColor,
                              border: `1px solid ${sec.badgeColor || data.heroBadgeColor}55`,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {sec.badge}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                        {sec.description}
                      </p>

                      {/* Optional Key Metrics Grid */}
                      {sec.metrics && sec.metrics.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '0.75rem',
                            marginBottom: '1.25rem',
                          }}
                        >
                          {sec.metrics.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                              }}
                            >
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                {m.label}
                              </div>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                                {m.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Optional Detailed Points */}
                      {sec.details && sec.details.length > 0 && (
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.85rem' }}>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                            {sec.details.map((detail, dIdx) => (
                              <li key={dIdx} style={{ marginBottom: '0.25rem' }}>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VARIANT B: Feeder Ladder & FIA Super Licence Guide (for single-seater ladder) */}
            {data.superLicencePoints && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {/* Visual Stepping Stone Ladder */}
                {data.ladderPyramidTiers && data.ladderPyramidTiers.length > 0 && (
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>
                      The Official FIA Single-Seater Pyramid
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                      How aspiring racing drivers progress step-by-step into Formula 1.
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {data.ladderPyramidTiers.map((tier, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: tier.isCurrent ? `2px solid ${tier.color}` : '1px solid var(--border-subtle)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            position: 'relative',
                          }}
                        >
                          {tier.isCurrent && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '12px',
                                backgroundColor: tier.color,
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              YOU ARE HERE
                            </span>
                          )}
                          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: tier.color, fontWeight: 800, marginBottom: '0.25rem' }}>
                            {tier.step}
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: '0.2rem' }}>
                            {tier.title}
                          </div>
                          {tier.age && (
                            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              {tier.age}
                            </div>
                          )}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {tier.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FIA Super Licence Points Allocation */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Award size={20} style={{ color: '#eab308' }} />
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#fff' }}>
                      FIA Super Licence Points Distribution (Appendix L)
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                    Drivers need a total of <strong>40 FIA Super Licence points</strong> accumulated over the previous 3 seasons to be eligible to race in Formula 1.
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      overflowX: 'auto',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Finishing Position</th>
                          <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Super Licence Points Awarded</th>
                          <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Direct F1 Threshold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.superLicencePoints.map((tier, idx) => {
                          const qualifiesDirectly = tier.points >= 40;
                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#fff' }}>
                                {tier.position}
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '1rem', color: tier.points >= 30 ? 'var(--telemetry-green, #00e676)' : '#fff' }}>
                                +{tier.points} pts
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                {qualifiesDirectly ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      color: 'var(--telemetry-green, #00e676)',
                                      fontSize: '0.75rem',
                                      fontFamily: 'var(--font-mono)',
                                      fontWeight: 800,
                                    }}
                                  >
                                    <CheckCircle2 size={13} /> ELIGIBLE IN SINGLE SEASON
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                    Cumulative towards 40
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* National Series (if present, like F4 India, Italian F4, British F4) */}
                {data.nationalSeries && data.nationalSeries.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Flag size={20} style={{ color: data.heroBadgeColor }} />
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#fff' }}>
                        Premier National Championships & Indian Motorsport Pathway
                      </h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                      Regional FIA-certified F4 categories provide grassroots racing across Europe, Asia, and India.
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                        gap: '1.25rem',
                      }}
                    >
                      {data.nationalSeries.map((series, sIdx) => {
                        const isIndia = series.name.includes('India');
                        return (
                          <div
                            key={sIdx}
                            style={{
                              backgroundColor: 'var(--bg-surface)',
                              border: isIndia ? '1px solid rgba(234, 179, 8, 0.45)' : '1px solid var(--border-subtle)',
                              borderRadius: '12px',
                              padding: '1.25rem',
                              boxShadow: isIndia ? '0 0 20px rgba(234, 179, 8, 0.1)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.3rem' }}>{series.flag}</span>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 800,
                                  color: isIndia ? '#eab308' : 'var(--text-muted)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                }}
                              >
                                +{series.superLicencePoints} SL POINTS
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0 0 0.35rem 0' }}>
                              {series.name}
                            </h3>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              {series.region} • {series.carSpecs}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                              {series.description}
                            </p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <strong>Circuits:</strong> {series.keyCircuits.join(', ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
