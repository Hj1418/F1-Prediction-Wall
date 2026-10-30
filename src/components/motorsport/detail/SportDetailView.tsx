import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { getUnifiedSportConfig, UnifiedSportConfig } from '../../../services/motorsport/motorsportData';
import { SportHero } from './SportHero';
import { SportTabNavigation, SportHubTabKey } from './SportTabNavigation';

export type { SportHubTabKey };
import { SportOverviewTab } from './SportOverviewTab';
import { SportWeekendTab } from './SportWeekendTab';
import { SportTeamsTab } from './SportTeamsTab';
import { SportDriversTab } from './SportDriversTab';
import { SportCircuitsTab } from './SportCircuitsTab';
import { PageLoadingFallback } from '../../common/PageLoadingFallback';

export function normalizeSportTabKey(rawSection?: string): SportHubTabKey {
  if (!rawSection) return 'overview';
  const s = rawSection.toLowerCase().trim();
  if (s === 'overview' || s === 'rules' || s === 'basics' || s === 'learn' || s === 'how-it-works') return 'overview';
  if (s === 'weekend' || s === 'weekend-structure' || s === 'format' || s === 'schedule' || s === 'calendar') return 'weekend';
  if (s === 'teams' || s === 'manufacturers' || s === 'constructors') return 'teams';
  if (s === 'drivers' || s === 'riders' || s === 'crews' || s === 'standings') return 'drivers';
  if (s === 'circuits' || s === 'tracks' || s === 'venues' || s === 'rallies') return 'circuits';
  return 'overview';
}

export interface SportDetailViewProps {
  forcedChampionshipId?: string;
  initialTab?: SportHubTabKey;
}

export const SportDetailView: React.FC<SportDetailViewProps> = ({
  forcedChampionshipId,
  initialTab,
}) => {
  const { championshipId: paramChampionshipId, section } = useParams<{ championshipId: string; section?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeChampionshipId = (forcedChampionshipId || paramChampionshipId || 'f1').toLowerCase().trim();

  // Active tab state initialized from route / query param
  const activeTab: SportHubTabKey = useMemo(() => {
    if (initialTab) return initialTab;
    return normalizeSportTabKey(section || searchParams.get('tab') || undefined);
  }, [section, searchParams, initialTab]);

  const [sportConfig, setSportConfig] = useState<UnifiedSportConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    getUnifiedSportConfig(activeChampionshipId)
      .then(config => {
        if (!isMounted) return;
        if (!config) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setSportConfig(config);
        setLoading(false);
        document.title = `${config.championship.name} | Motorsport Hub • THE GRDX`;
      })
      .catch(err => {
        console.error('Failed to load sport detail:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeChampionshipId]);

  const handleTabChange = (newTab: SportHubTabKey) => {
    // Smooth URL navigation preserving series slug without full page reload
    const targetUrl = newTab === 'overview'
      ? `/explore/${activeChampionshipId}`
      : `/explore/${activeChampionshipId}/${newTab}`;
    navigate(targetUrl, { replace: true });
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (notFound || !sportConfig) {
    return (
      <div
        className="container"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '6rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--f1-red)',
            marginBottom: '1.5rem',
          }}
        >
          <Compass size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
          Motorsport Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          No supported championship matches the slug &ldquo;<strong>{activeChampionshipId}</strong>&rdquo;. Please choose from our verified series registry.
        </p>
        <Link
          to="/explore"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Browse All Motorsports</span>
        </Link>
      </div>
    );
  }

  const { championship, detail, basics, teams, drivers, circuits, weekendFormats } = sportConfig;

  return (
    <div className="sport-detail-hub" style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* A. MOTORSPORT HERO / PADDOCK HEADER */}
      <SportHero
        championship={championship}
        detail={detail}
        driversCount={drivers.length > 0 ? drivers.length : detail?.driversStandings.length || 0}
        teamsCount={teams.length}
        circuitsCount={circuits.length}
      />

      {/* B. FIVE-PILLAR NAVIGATION */}
      <SportTabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        badgeColor={championship.badgeColor}
        teamsCount={teams.length}
        driversCount={drivers.length > 0 ? drivers.length : detail?.driversStandings.length || 0}
        circuitsCount={circuits.length}
        competitorLabel={detail?.competitorLabel}
      />

      {/* C. FIVE CONTENT MODULES */}
      <main className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
        {activeTab === 'overview' && (
          <SportOverviewTab
            championship={championship}
            detail={detail}
            basics={basics}
          />
        )}

        {activeTab === 'weekend' && (
          <SportWeekendTab
            championship={championship}
            detail={detail}
            weekendFormats={weekendFormats}
          />
        )}

        {activeTab === 'teams' && (
          <SportTeamsTab
            championship={championship}
            detail={detail}
            teams={teams}
            onSelectDriver={driverName => {
              // Smoothly transition to drivers tab if requested
              handleTabChange('drivers');
            }}
          />
        )}

        {activeTab === 'drivers' && (
          <SportDriversTab
            championship={championship}
            detail={detail}
            drivers={drivers}
          />
        )}

        {activeTab === 'circuits' && (
          <SportCircuitsTab
            championship={championship}
            detail={detail}
            circuits={circuits}
          />
        )}
      </main>
    </div>
  );
};

export default SportDetailView;
