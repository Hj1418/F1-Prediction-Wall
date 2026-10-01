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
  Shield,
  Layers,
  HelpCircle,
  Clock,
  Flag,
  CheckCircle2,
  Zap,
  MapPin,
  ArrowRight,
  BookOpen,
  Sparkles,
  Flame,
} from 'lucide-react';
import { getChampionshipDetail } from '../services/motorsport/championshipDataService';
import { ChampionshipDetailData } from '../types/motorsportDetail';
import { PageLoadingFallback } from '../components/common/PageLoadingFallback';
import { CompetitorProfileModal, CompetitorProfileData } from '../components/competitor/CompetitorProfileModal';
import { TeamProfileModal, TeamProfileData } from '../components/team/TeamProfileModal';
import { SourceProvenanceBadge } from '../components/common/SourceProvenanceBadge';
import { FeederLadderView } from '../components/feeder/FeederLadderView';
import { getCircuitsByChampionship } from '../services/circuits/globalCircuitsService';
import { CircuitCard } from '../components/circuits/CircuitCard';
import { getMotorsportBasics } from '../services/motorsport/motorsportBasicsService';
import { resolveChampionshipCurrentEvent, getEventStatusBadge, getCurrentEventStatus } from '../services/schedule/eventStatusResolver';

type DetailTab =
  | 'overview'
  | 'season'
  | 'basics'
  | 'drivers'
  | 'teams'
  | 'series'
  | 'circuits'
  | 'calendar'
  | 'rules'
  | 'standings'
  | 'feature';

export const ChampionshipDetailPage: React.FC = () => {
  const { championshipId } = useParams<{ championshipId: string }>();
  const [data, setData] = useState<ChampionshipDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [standingsSubTab, setStandingsSubTab] = useState<'drivers' | 'teams'>('drivers');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<number>(2026);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [prevChampionshipId, setPrevChampionshipId] = useState(championshipId);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorProfileData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamProfileData | null>(null);
  const tabsScrollRef = React.useRef<HTMLDivElement>(null);

  const currentEventResult = React.useMemo(() => {
    if (!data?.rounds || data.rounds.length === 0) return null;
    return resolveChampionshipCurrentEvent(data.rounds);
  }, [data?.rounds]);

  const activeRound = currentEventResult?.event;
  const activeRoundStatus = currentEventResult?.status;
  const activeBadgeConfig = activeRoundStatus ? getEventStatusBadge(activeRoundStatus) : null;

  if (prevChampionshipId !== championshipId) {
    setPrevChampionshipId(championshipId);
    setSelectedClass('all');
  }

  useEffect(() => {
    if (tabsScrollRef.current) {
      const activeEl = tabsScrollRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

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


  const handleSelectTeamByName = (teamName: string) => {
    if (!data) return;
    const found = data.teamsStandings.find(t =>
      t.teamName.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.teamName.toLowerCase())
    );
    if (found) {
      setSelectedTeam({
        id: found.teamName,
        name: found.teamName,
        championshipId: data.id,
        championshipName: data.name,
        championshipBadge: data.shortName || data.name,
        championshipColor: data.heroBadgeColor,
        carModel: found.carModel,
        manufacturer: found.manufacturer || found.carModel?.split(' ')[0] || found.teamName.split(' ')[0],
        country: found.country,
        countryFlag: found.flag,
        primaryColor: found.primaryColor,
        rank: found.rank,
        points: found.points,
        wins: found.wins,
        podiums: found.podiums,
        drivers: found.drivers,
      });
    } else {
      // Fallback if not directly matched in standings
      setSelectedTeam({
        id: teamName,
        name: teamName,
        championshipId: data.id,
        championshipName: data.name,
        championshipBadge: data.shortName || data.name,
        championshipColor: data.heroBadgeColor,
        primaryColor: data.heroBadgeColor,
      });
    }
  };

  const handleSelectCompetitorByName = (competitorName: string) => {
    if (!data) return;
    const found = data.driversStandings.find(d =>
      d.driverName.toLowerCase().includes(competitorName.toLowerCase()) ||
      competitorName.toLowerCase().includes(d.driverName.toLowerCase())
    );
    if (found) {
      setSelectedCompetitor({
        id: found.driverCode || found.driverName,
        name: found.driverName,
        code: found.driverCode,
        number: found.carNumber,
        nationality: found.nationality,
        teamName: found.teamName,
        championshipId: data.id,
        championshipName: data.name,
        championshipBadge: data.shortName || data.name,
        championshipColor: data.heroBadgeColor,
        competitorLabel: data.competitorLabel,
        rank: found.rank,
        points: found.points,
        wins: found.wins,
        podiums: found.podiums,
        juniorAcademy: found.juniorAcademy,
        academyColor: found.academyColor,
        driverGrade: found.driverGrade,
        coDrivers: found.coDrivers,
      });
    } else {
      // Fallback if not found in driversStandings
      setSelectedCompetitor({
        id: competitorName,
        name: competitorName,
        teamName: '',
        championshipId: data.id,
        championshipName: data.name,
        championshipBadge: data.shortName || data.name,
        championshipColor: data.heroBadgeColor,
        competitorLabel: data.competitorLabel,
      });
    }
  };

  const championshipCircuits = React.useMemo(() => {
    if (!data) return [];
    return getCircuitsByChampionship(data.id, data.rounds);
  }, [data]);

  const basicsData = React.useMemo(() => {
    return championshipId ? getMotorsportBasics(championshipId) : null;
  }, [championshipId]);

  const navTabs = React.useMemo(() => {
    if (!data) return [];
    const competitorLabel = data.competitorLabel || 'Driver';
    const competitorPlural = competitorLabel === 'Rider' ? 'Riders' : competitorLabel === 'Crew' ? 'Crews & Drivers' : 'Drivers';
    const teamsLabel = data.id === 'wrc' ? 'Manufacturers' : (data.id === 'wec' ? 'Teams & Manufacturers' : (competitorLabel === 'Rider' ? 'Teams & Grid' : 'Teams & Constructors'));
    const circuitsLabel = data.id === 'wrc' ? `RALLIES & STAGES (${data.rounds.length})` : `CIRCUITS (${championshipCircuits.length})`;

    return [
      { id: 'overview' as DetailTab, label: '1. OVERVIEW', icon: <Layers size={14} /> },
      { id: 'season' as DetailTab, label: '2. CURRENT SEASON', icon: <Flame size={14} /> },
      { id: 'basics' as DetailTab, label: '3. HOW IT WORKS', icon: <BookOpen size={14} /> },
      { id: 'drivers' as DetailTab, label: `4. ${competitorPlural.toUpperCase()}`, icon: <Users size={14} /> },
      { id: 'teams' as DetailTab, label: `5. ${teamsLabel.toUpperCase()}`, icon: <Shield size={14} /> },
      { id: 'series' as DetailTab, label: '6. CHAMPIONSHIPS & SERIES', icon: <Award size={14} /> },
      { id: 'circuits' as DetailTab, label: `7. ${circuitsLabel.toUpperCase()}`, icon: <MapPin size={14} /> },
      { id: 'calendar' as DetailTab, label: `8. CALENDAR (${data.rounds.length})`, icon: <Calendar size={14} /> },
      { id: 'rules' as DetailTab, label: '9. RULES & REGULATIONS', icon: <CheckCircle2 size={14} /> },
    ];
  }, [data, championshipCircuits.length]);

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
              to="/explore"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ArrowLeft size={14} /> EXPLORE MOTORSPORT
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
              {/* Interactive Season Selector */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.2rem 0.35rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    paddingLeft: '0.35rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  SEASON:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSeason(data.seasonYear || 2026)}
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '5px',
                    border: selectedSeason === (data.seasonYear || 2026) ? `1px solid ${data.heroBadgeColor}` : '1px solid transparent',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: selectedSeason === (data.seasonYear || 2026) ? `${data.heroBadgeColor}33` : 'transparent',
                    color: selectedSeason === (data.seasonYear || 2026) ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {data.id === 'formula-e' ? '2025–26 (ACTIVE)' : `${data.seasonYear || 2026} (ACTIVE)`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeason(2025)}
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '5px',
                    border: selectedSeason === 2025 ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: selectedSeason === 2025 ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    color: selectedSeason === 2025 ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  2025 ARCHIVE
                </button>
              </div>
              <SourceProvenanceBadge
                customAttribution={data.governingBody}
                customSourceId={`${data.id}-official`}
              />
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

      {/* F1 Dedicated Platform Prediction Launchpad */}
      {data.id === 'f1' && (
        <section
          style={{
            backgroundColor: 'rgba(225, 6, 0, 0.05)',
            borderBottom: '1px solid rgba(225, 6, 0, 0.25)',
            padding: '0.85rem 0',
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🎯</span>
              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  F1 PREDICTION BENCH ACTIVE
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  Predict P1, P2, P3 & Fastest Lap for the 2026 Formula 1 season.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <Link
                to="/races"
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Races
              </Link>
              <Link
                to="/circuits"
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Circuits
              </Link>
              <Link
                to="/leaderboard"
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Leaderboard
              </Link>
              <Link
                to="/predictions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--f1-red)',
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                PREDICT ON BENCH →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. COMPACT EDITORIAL STATS RIBBON */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.85rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem 1.75rem',
            }}
          >
            {(basicsData?.inlineStats || [
              { label: 'CALENDAR', value: `${data.rounds.length} ROUNDS` },
              { label: 'GRID', value: `${data.teamsStandings.length} TEAMS` },
              { label: data.competitorLabel ? `${data.competitorLabel.toUpperCase()}S` : 'DRIVERS', value: `${data.driversStandings.length} CONFIRMED` },
              { label: 'TOP SPEED', value: data.technicalSpecs.topSpeed },
            ]).map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {idx > 0 && <span style={{ color: 'var(--border-subtle)', userSelect: 'none' }}>•</span>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}:
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
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
        <div className="container" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
          <div
            ref={tabsScrollRef}
            style={{
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              padding: '0.65rem 0',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.1rem',
                    minHeight: '44px',
                    minWidth: '44px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isActive ? data.heroBadgeColor : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? `1px solid ${data.heroBadgeColor}` : '1px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    touchAction: 'pan-x',
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
      <main className="container" style={{ paddingTop: '2rem' }}>
        {/* Archive Season Notice */}
        {selectedSeason === 2025 && (
          <div
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '10px',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📁</span>
              <span style={{ fontSize: '0.84rem', color: '#fbbf24' }}>
                Viewing historical archive for the <strong>2025</strong> season. The official current competition is the <strong>{data.seasonYear || 2026}</strong> season.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSeason(data.seasonYear || 2026)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: '#eab308',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              RETURN TO ACTIVE {data.seasonYear || 2026} SEASON →
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW — BEGINNER-FIRST EDITORIAL INTEL */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* 1. WHAT IS THIS SPORT? */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: data.heroBadgeColor,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.4rem',
                  }}
                >
                  DISCOVER THE SPORT
                </span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem 0', lineHeight: 1.2 }}>
                  What is {data.shortName}?
                </h2>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '840px', margin: 0 }}>
                  {data.overviewSummary}
                </p>
              </div>

              {/* IN SIMPLE TERMS CALLOUT */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  borderLeft: `4px solid ${data.heroBadgeColor}`,
                  padding: '1.25rem 1.5rem',
                  borderRadius: '0 10px 10px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.05rem' }}>💡</span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: data.heroBadgeColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    IN SIMPLE TERMS (BEGINNER EXPLANATION)
                  </span>
                </div>
                <p style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
                  "{basicsData?.simpleTerms || data.tagline}"
                </p>
              </div>
            </section>

            {/* 2. HOW A WEEKEND WORKS (VISUAL SEQUENCE) */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: data.heroBadgeColor, marginBottom: '0.35rem' }}>
                <Clock size={16} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  EVENT PROGRESSION
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem 0' }}>
                How an Event Weekend Works
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '0.85rem',
                }}
              >
                {(basicsData?.weekendSequence || [
                  { step: '01', name: 'PRACTICE', description: 'Setup validation and data collection' },
                  { step: '02', name: 'QUALIFYING', description: 'Single-lap grid position shootout' },
                  { step: '03', name: 'RACE', description: 'Main championship race for points' },
                  { step: '04', name: 'CLASSIFICATION', description: 'Podium celebration and official points tally' },
                ]).map((seq, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: data.heroBadgeColor, marginBottom: '0.35rem' }}>
                        STEP {seq.step}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
                        {seq.name}
                      </div>
                      {seq.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {seq.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. WHAT SHOULD I KNOW? (NUMBERED BEGINNER CONCEPTS) */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--telemetry-yellow, #ffd600)', marginBottom: '0.35rem' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  THE ESSENTIALS
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem 0' }}>
                What Should I Know as a Beginner?
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                  gap: '1rem',
                }}
              >
                {(basicsData?.beginnerConcepts || [
                  { num: '01', title: 'CHAMPIONSHIP FORMAT', explanation: 'Points accumulate throughout the season across drivers and teams.' },
                  { num: '02', title: 'TECHNICAL EQUALITY', explanation: data.specRegulationsSummary },
                  { num: '03', title: 'CAREER LADDER', explanation: data.feederLadderRole },
                  { num: '04', title: 'SCORING RULES', explanation: data.pointsSystemDescription },
                ]).map((concept, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: data.heroBadgeColor,
                        opacity: 0.85,
                        lineHeight: 1,
                        marginBottom: '0.45rem',
                      }}
                    >
                      {concept.num}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {concept.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {concept.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. CURRENT / NEXT EVENT BANNER */}
            {activeRound && (
              <section
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: activeBadgeConfig?.color || 'var(--telemetry-green, #00e676)',
                        backgroundColor: activeBadgeConfig?.bg || 'rgba(0, 230, 118, 0.12)',
                        border: `1px solid ${activeBadgeConfig?.border || 'rgba(0, 230, 118, 0.3)'}`,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      ROUND {activeRound.roundNumber} • {activeBadgeConfig?.label || 'NEXT EVENT'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {activeRound.dates}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{activeRound.flag}</span>
                    <span>{activeRound.officialTitle}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {activeRound.circuitName} • {activeRound.location}, {activeRound.country}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: data.heroBadgeColor,
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>VIEW IN CALENDAR</span>
                  <ArrowRight size={14} />
                </button>
              </section>
            )}

            {/* 5. CURRENT CHAMPIONSHIP LEADERS */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: data.heroBadgeColor, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>
                    OFFICIAL {data.seasonYear} STANDINGS
                  </span>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                    Current Championship Leaders
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('drivers')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: data.heroBadgeColor,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <span>VIEW FULL STANDINGS ({data.driversStandings.length})</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Top 3 Competitors */}
                {data.driversStandings.slice(0, 3).map((drv, idx) => (
                  <div
                    key={drv.driverName}
                    onClick={() => handleSelectCompetitorByName(drv.driverName)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = data.heroBadgeColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: idx === 0 ? 'var(--telemetry-yellow)' : '#cbd5e1' }}>
                        P{drv.rank} LEADER
                      </span>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        #{drv.carNumber} • {drv.nationality}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.2rem' }}>
                      {drv.driverName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {drv.teamName}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <div><strong style={{ color: '#fff' }}>{drv.points}</strong> PTS</div>
                      <div><strong style={{ color: '#fff' }}>{drv.wins}</strong> WINS</div>
                      <div><strong style={{ color: '#fff' }}>{drv.podiums}</strong> PODIUMS</div>
                    </div>
                  </div>
                ))}

                {/* Top 2 Teams */}
                {data.teamsStandings.slice(0, 2).map((team) => (
                  <div
                    key={team.teamName}
                    onClick={() => handleSelectTeamByName(team.teamName)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = team.primaryColor || data.heroBadgeColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-green)' }}>
                        CONSTRUCTOR #{team.rank}
                      </span>
                      <span style={{ fontSize: '1.1rem' }}>{team.flag}</span>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.2rem' }}>
                      {team.teamName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {team.country} • {team.carModel || 'Factory Specification'}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <div><strong style={{ color: '#fff' }}>{team.points}</strong> PTS</div>
                      <div><strong style={{ color: '#fff' }}>{team.wins}</strong> WINS</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. EXPLORE THIS SPORT (NAVIGATION JUMP LINKS) */}
            <section
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem 0' }}>
                Explore {data.shortName}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {[
                  { tab: 'drivers' as DetailTab, label: data.competitorLabel ? `${data.competitorLabel}s & Standings` : 'Drivers & Standings' },
                  { tab: 'teams' as DetailTab, label: data.id === 'wrc' ? 'Manufacturers' : 'Teams & Grid' },
                  { tab: 'circuits' as DetailTab, label: data.id === 'wrc' ? 'Rallies & Stages' : 'Circuits & Tracks' },
                  { tab: 'calendar' as DetailTab, label: `${data.seasonYear || 2026} Full Calendar` },
                  { tab: 'rules' as DetailTab, label: 'Rules & Regulations' },
                ].map(item => (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = data.heroBadgeColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={13} style={{ color: data.heroBadgeColor }} />
                  </button>
                ))}
              </div>
            </section>

            {/* 7. TECHNICAL DETAILS (PROGRESSIVE DISCLOSURE COLLAPSIBLE) */}
            <section
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setShowTechDetails(!showTechDetails)}
                style={{
                  width: '100%',
                  padding: '1.2rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Gauge size={19} style={{ color: data.heroBadgeColor, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
                      Technical Specifications & Vehicle Engineering
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {showTechDetails ? 'Click to hide engineering details' : 'Click to inspect powertrain, chassis, top speed, and safety ratings'}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: data.heroBadgeColor,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {showTechDetails ? 'HIDE [-]' : 'VIEW TECHNICAL DETAILS [→]'}
                </span>
              </button>

              {showTechDetails && (
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                      gap: '0.75rem',
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
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              marginBottom: '0.2rem',
                            }}
                          >
                            {formatKey}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                            {value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* 8. SERIES FAQS */}
            {data.faqs && data.faqs.length > 0 && (
              <section>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem', color: '#fff' }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {data.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '1.15rem 1.25rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: 800,
                          color: '#fff',
                          fontSize: '0.92rem',
                          marginBottom: '0.4rem',
                        }}
                      >
                        <HelpCircle size={15} style={{ color: data.heroBadgeColor, flexShrink: 0 }} />
                        <span>{faq.question}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6, margin: 0, paddingLeft: '1.4rem' }}>
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 2: CURRENT SEASON */}
        {activeTab === 'season' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: data.heroBadgeColor, marginBottom: '0.5rem' }}>
                <Flame size={18} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  {data.seasonYear} Championship Season
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                {data.seasonYear} {data.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '820px', lineHeight: 1.6 }}>
                Official championship season status, title battle leaders, round progression, and active grid statistics.
              </p>
            </div>

            {/* Title Contenders Spotlight */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Leader Competitor Card */}
              {data.driversStandings[0] && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 214, 0, 0.15)',
                        color: 'var(--telemetry-yellow)',
                        border: '1px solid rgba(255, 214, 0, 0.3)',
                      }}
                    >
                      CHAMPIONSHIP LEADER • P1
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>👑</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
                    {data.driversStandings[0].driverName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {data.driversStandings[0].teamName} • #{data.driversStandings[0].carNumber} ({data.driversStandings[0].nationality})
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POINTS</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: data.heroBadgeColor, fontFamily: 'var(--font-mono)' }}>
                        {data.driversStandings[0].points} PTS
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WINS</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {data.driversStandings[0].wins}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PODIUMS</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {data.driversStandings[0].podiums}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leader Team Card */}
              {data.teamsStandings[0] && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 230, 118, 0.15)',
                        color: 'var(--telemetry-green)',
                        border: '1px solid rgba(0, 230, 118, 0.3)',
                      }}
                    >
                      CONSTRUCTOR LEADER • P1
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
                    {data.teamsStandings[0].teamName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {data.teamsStandings[0].country} {data.teamsStandings[0].flag} • {data.teamsStandings[0].carModel || 'Factory Specification'}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POINTS</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: data.heroBadgeColor, fontFamily: 'var(--font-mono)' }}>
                        {data.teamsStandings[0].points} PTS
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WINS</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {data.teamsStandings[0].wins}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LINEUP</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginTop: '0.35rem' }}>
                        {data.teamsStandings[0].drivers?.join(' • ') || 'Confirmed'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Season Metrics Bar */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Total Rounds
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {data.rounds.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Competitors
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {data.driversStandings.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Teams Grid
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {data.teamsStandings.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Circuits
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {championshipCircuits.length}
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('drivers')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: data.heroBadgeColor,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>View Full Standings Table</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                <Calendar size={14} />
                <span>Season Calendar ({data.rounds.length} Rounds)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: HOW IT WORKS / BASICS */}
        {activeTab === 'basics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header intro */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: data.heroBadgeColor, marginBottom: '0.5rem' }}>
                <BookOpen size={18} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Beginner Knowledge & Fundamentals
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Understand {data.shortName} in Minutes
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '820px', lineHeight: 1.6 }}>
                {basicsData?.oneLineIntro || data.tagline}
              </p>
            </div>

            {/* Section 1: How It Works & Weekend Schedule */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: data.heroBadgeColor }} /> How an Event Weekend Works
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '800px' }}>
                {basicsData?.howItWorks.overview || data.overviewSummary}
              </p>
              {basicsData?.howItWorks.weekendStructure && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                  {basicsData.howItWorks.weekendStructure.map((session, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '1.1rem',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: data.heroBadgeColor, marginBottom: '0.35rem' }}>
                        SESSION {idx + 1}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                        {session.session}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {session.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Points & Scoring System */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} style={{ color: '#eab308' }} /> Points & Scoring System
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '800px' }}>
                {basicsData?.pointsAndScoring.summary || data.pointsSystemDescription}
              </p>
              {basicsData?.pointsAndScoring.pointsTable && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                  {basicsData.pointsAndScoring.pointsTable.map((pt, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem 0.85rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                        {pt.position}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                        {pt.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {basicsData?.pointsAndScoring.bonuses && (
                <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {basicsData.pointsAndScoring.bonuses.map((b, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={13} style={{ color: 'var(--telemetry-green)' }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Key Rules & Regulations */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: 'var(--telemetry-green)' }} /> Essential Rules & Regulations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                {(basicsData?.keyRegulations || [
                  { rule: 'Spec Equality & Parity', explanation: data.specRegulationsSummary },
                  { rule: 'Feeder Ladder Progression', explanation: data.feederLadderRole },
                ]).map((reg, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                      {reg.rule}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {reg.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Machinery / Vehicle Architecture */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gauge size={18} style={{ color: data.heroBadgeColor }} /> What is Being Raced: {basicsData?.machineryOverview.vehicleType || data.technicalSpecs.chassis.split(' ')[0]}
              </h3>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                  {basicsData?.machineryOverview.headline || `${data.technicalSpecs.engine} • ${data.technicalSpecs.topSpeed}`}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.85rem' }}>
                  {(basicsData?.machineryOverview.keyHighlights || [
                    `Chassis: ${data.technicalSpecs.chassis}`,
                    `Engine / Powertrain: ${data.technicalSpecs.engine}`,
                    `Top Speed: ${data.technicalSpecs.topSpeed}`,
                    `Safety Rating: ${data.technicalSpecs.safetyRating}`,
                  ]).map((hl, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <Zap size={14} style={{ color: data.heroBadgeColor, flexShrink: 0, marginTop: '2px' }} />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Beginner Topics & Takeaways */}
            {basicsData?.beginnerTopics && basicsData.beginnerTopics.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} style={{ color: data.heroBadgeColor }} /> Key Concepts You Should Know
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
                  {basicsData.beginnerTopics.map(topic => (
                    <div
                      key={topic.id}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '1.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: topic.badgeColor || data.heroBadgeColor,
                            backgroundColor: `${topic.badgeColor || data.heroBadgeColor}18`,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.65rem',
                          }}
                        >
                          {topic.badge}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.4rem 0' }}>
                          {topic.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                          {topic.shortSummary}
                        </p>
                      </div>

                      <div
                        style={{
                          backgroundColor: 'var(--bg-base)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                        }}
                      >
                        {topic.keyPoints.map((pt, pIdx) => (
                          <div key={pIdx} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.45rem', lineHeight: 1.4 }}>
                            <span style={{ color: topic.badgeColor || data.heroBadgeColor, fontWeight: 900 }}>•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
                      {(() => {
                        const rStatus = getCurrentEventStatus(round);
                        const rBadge = getEventStatusBadge(rStatus);
                        return (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              color: rBadge.color,
                              backgroundColor: rBadge.bg,
                              border: `1px solid ${rBadge.border}`,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {rBadge.label}
                          </span>
                        );
                      })()}
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

        {/* TAB: CIRCUITS & HOST VENUES */}
        {activeTab === 'circuits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: data.heroBadgeColor, marginBottom: '0.5rem' }}>
                <MapPin size={18} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  {data.name} Circuit Portfolio
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Championship Circuits & Host Venues
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '820px', lineHeight: 1.6 }}>
                Explore the iconic racetracks, permanent facilities, and street circuits hosting the {data.name} {data.seasonYear || 2026} calendar. Inspect high-precision track geometry, direction indicators, and technical characteristics.
              </p>
            </div>

            {data.id === 'wrc' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <strong style={{ color: '#fff' }}>Rally Stages & Service Parks:</strong> WRC events do not use closed permanent circuits. Instead, rallies span 15 to 25 closed public road stages across 300+ competitive kilometers, based out of central Service Parks.
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {data.rounds.map(rally => (
                    <div
                      key={rally.roundNumber}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: data.heroBadgeColor }}>
                            ROUND {rally.roundNumber} • {rally.dates}
                          </span>
                          <span style={{ fontSize: '1.2rem' }}>{rally.flag}</span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                          {rally.officialTitle}
                        </h3>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {rally.circuitName} • {rally.location}, {rally.country}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {rally.surface && (
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>
                            SURFACE: {rally.surface.toUpperCase()}
                          </span>
                        )}
                        {rally.totalStages && (
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                            {rally.totalStages} STAGES
                          </span>
                        )}
                        {rally.competitiveDistanceKm && (
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                            {rally.competitiveDistanceKm} KM COMP.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : championshipCircuits.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                  gap: '1.5rem',
                }}
              >
                {championshipCircuits.map(circuit => (
                  <CircuitCard key={circuit.circuitId} circuit={circuit} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <MapPin size={32} style={{ opacity: 0.3, marginBottom: '0.75rem', color: data.heroBadgeColor }} />
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Circuits Catalog In Preparation</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem' }}>
                  Dedicated circuit profiles for this championship are being verified and updated.
                </p>
                <Link
                  to="/circuits"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span>BROWSE GLOBAL CIRCUITS DIRECTORY</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DRIVERS / STANDINGS */}
        {(activeTab === 'standings' || activeTab === 'drivers') && (
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
                        onClick={() => {
                          setSelectedCompetitor({
                            id: driver.driverCode || driver.driverName,
                            name: driver.driverName,
                            code: driver.driverCode,
                            number: driver.carNumber,
                            nationality: driver.nationality,
                            teamName: driver.teamName,
                            championshipId: data.id,
                            championshipName: data.name,
                            championshipBadge: data.shortName || data.name,
                            championshipColor: data.heroBadgeColor,
                            competitorLabel: data.competitorLabel,
                            rank: driver.rank,
                            points: driver.points,
                            wins: driver.wins,
                            podiums: driver.podiums,
                            juniorAcademy: driver.juniorAcademy,
                            academyColor: driver.academyColor,
                            driverGrade: driver.driverGrade,
                            coDrivers: driver.coDrivers,
                          });
                        }}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background-color 0.15s ease',
                          cursor: 'pointer',
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const teamData = data.teamsStandings.find(t => t.teamName.toLowerCase().includes(driver.teamName.toLowerCase()) || driver.teamName.toLowerCase().includes(t.teamName.toLowerCase()));
                              setSelectedTeam({
                                id: driver.teamName,
                                name: driver.teamName,
                                championshipId: data.id,
                                championshipName: data.name,
                                championshipBadge: data.shortName || data.name,
                                championshipColor: data.heroBadgeColor,
                                carModel: teamData?.carModel,
                                manufacturer: teamData?.carModel?.split(' ')[0] || driver.teamName.split(' ')[0],
                                country: teamData?.country,
                                countryFlag: teamData?.flag,
                                primaryColor: teamData?.primaryColor,
                                rank: teamData?.rank,
                                points: teamData?.points,
                                wins: teamData?.wins,
                                podiums: teamData?.podiums,
                                drivers: teamData?.drivers,
                              });
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#60a5fa',
                              cursor: 'pointer',
                              padding: 0,
                              textAlign: 'left',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            {driver.teamName}
                          </button>
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
                        onClick={() => handleSelectTeamByName(team.teamName)}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                          {team.drivers.map((drvName, dIdx) => (
                            <span key={dIdx}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCompetitorByName(drvName);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#93c5fd',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontSize: 'inherit',
                                  fontWeight: 600,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                              >
                                {drvName}
                              </button>
                              {dIdx < team.drivers.length - 1 && ' • '}
                            </span>
                          ))}
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
                            <button
                              type="button"
                              onClick={() => handleSelectTeamByName(team.teamName)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: '#fff',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#60a5fa')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
                            >
                              {team.teamName}
                            </button>
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
                              onClick={() => handleSelectCompetitorByName(drv.driverName)}
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {team.drivers.map((drvName, dIdx) => (
                              <button
                                key={dIdx}
                                type="button"
                                onClick={() => handleSelectCompetitorByName(drvName)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  color: '#ffffff',
                                  fontSize: '0.8rem',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                {drvName}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectTeamByName(team.teamName)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      VIEW TEAM DOSSIER →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: CHAMPIONSHIPS / SERIES & LADDER PROGRESSION */}
        {(activeTab === 'series' || activeTab === 'feature') && (
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
            {['f2', 'f3', 'f4'].includes(data.id) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <FeederLadderView
                  currentTierId={data.id}
                  onSelectCompetitor={(name: string) => handleSelectCompetitorByName(name)}
                />

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
            ) : data.superLicencePoints ? (
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
            ) : null}
          </div>
        )}

        {/* TAB 9: RULES & REGULATIONS */}
        {activeTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: data.heroBadgeColor, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Governance & Official Regulations
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                {data.shortName} Rules & Regulations
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '820px', lineHeight: 1.6 }}>
                Official {data.governingBody} sporting guidelines, championship points distribution, technical constraints, and beginner FAQs.
              </p>
            </div>

            {/* Points System Breakdown */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} style={{ color: data.heroBadgeColor }} /> Official Points System
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 1rem 0' }}>
                {data.pointsSystemDescription}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: data.heroBadgeColor, fontWeight: 800 }}>P1 Winner:</span> 25 PTS
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: data.heroBadgeColor, fontWeight: 800 }}>P2:</span> 18 PTS
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: data.heroBadgeColor, fontWeight: 800 }}>P3:</span> 15 PTS
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-secondary)' }}>Points awarded through top 10 finishers</span>
              </div>
            </div>

            {/* Technical Regulations Summary */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: data.heroBadgeColor }} /> Technical & Vehicle Specifications
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                {data.specRegulationsSummary}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                  gap: '1rem',
                }}
              >
                <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CHASSIS / MONOCOQUE</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>{data.technicalSpecs.chassis}</div>
                </div>
                <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ENGINE / POWERTRAIN</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>{data.technicalSpecs.engine}</div>
                </div>
                <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POWER OUTPUT</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>{data.technicalSpecs.powerOutput}</div>
                </div>
                <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SAFETY RATING</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--telemetry-green)', marginTop: '0.2rem' }}>{data.technicalSpecs.safetyRating}</div>
                </div>
              </div>
            </div>

            {/* Beginner FAQs */}
            {data.faqs && data.faqs.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} style={{ color: data.heroBadgeColor }} /> Frequently Asked Questions
                </h3>
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
            )}
          </div>
        )}
      </main>

      {/* Reusable Competitor Profile Modal */}
      {selectedCompetitor && (
        <CompetitorProfileModal
          isOpen={!!selectedCompetitor}
          competitor={selectedCompetitor}
          onClose={() => setSelectedCompetitor(null)}
          onSelectTeam={(teamName) => handleSelectTeamByName(teamName)}
        />
      )}

      {/* Reusable Team Profile Modal */}
      {selectedTeam && (
        <TeamProfileModal
          isOpen={!!selectedTeam}
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onSelectCompetitor={(compName) => handleSelectCompetitorByName(compName)}
        />
      )}
    </div>
  );
};
