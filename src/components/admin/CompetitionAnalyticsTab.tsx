import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Users,
  Award,
  Target,
  Flag,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpDown,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Share2,
  Copy,
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  CompetitionAnalyticsPayload,
  UnifiedUserCompetitionProfile,
  AnalyticsTimeRange,
  CompetitionUserSummary,
} from '../../types/competitionAnalytics';
import { UserInitialsAvatar } from '../common/UserInitialsAvatar';
import { UnifiedUserCompetitionModal } from './UnifiedUserCompetitionModal';

export const CompetitionAnalyticsTab: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useApp();

  // State
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('all');
  const [data, setData] = useState<CompetitionAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-section navigation
  const [subSection, setSubSection] = useState<'users' | 'racing_tag' | 'strategy' | 'predictions'>('users');

  // User table state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [featureFilter, setFeatureFilter] = useState<'all' | 'racing_tag' | 'strategy' | 'predictions'>('all');
  const [sortField, setSortField] = useState<keyof CompetitionUserSummary>('totalAttempts');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Selected profile for inspection modal
  const [inspectingUser, setInspectingUser] = useState<UnifiedUserCompetitionProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Load analytics payload
  const fetchAnalytics = async (selectedRange: AnalyticsTimeRange = timeRange) => {
    if (!currentUser?.userId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminCompetitionAnalytics(currentUser.userId, undefined, selectedRange);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load competition analytics:', err);
      setError(err?.message || 'Failed to load competition analytics');
      showToast(err?.message || 'Failed to load competition analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange, currentUser?.userId]);

  // Open user profile modal
  const handleInspectUser = async (userId: string) => {
    if (!currentUser?.userId) return;
    try {
      setLoadingProfile(true);
      const profile = await api.getAdminUserCompetitionProfile(currentUser.userId, userId);
      setInspectingUser(profile);
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch user competition profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  // User table sorting and filtering
  const filteredAndSortedUsers = useMemo(() => {
    if (!data?.usersTable) return [];

    let users = [...data.usersTable];

    // Search query filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      users = users.filter(
        u =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.userId.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    // Feature filter
    if (featureFilter === 'racing_tag') {
      users = users.filter(u => u.racingTagAttempts > 0);
    } else if (featureFilter === 'strategy') {
      users = users.filter(u => u.strategyAttempts > 0);
    } else if (featureFilter === 'predictions') {
      users = users.filter(u => u.predictionSubmissions > 0);
    }

    // Sort
    users.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = aVal ?? 0;
      bVal = bVal ?? 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return users;
  }, [data?.usersTable, searchQuery, featureFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, page, pageSize]);

  const handleSort = (field: keyof CompetitionUserSummary) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Shield size={36} color="var(--f1-red)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Admin Authorization Required</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Competition analytics is restricted to authenticated system administrators.
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--f1-red)', marginBottom: '1rem' }} />
        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem' }}>
          Aggregating Competition Records...
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Compiling data from Racing Tag, Strategy Room, and F1 Predictions.
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <AlertCircle size={32} color="#f87171" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Unable to Load Competition Analytics</h3>
        <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>
        <button
          onClick={() => fetchAnalytics(timeRange)}
          className="btn btn-outline btn-sm"
          style={{ marginTop: '1rem' }}
        >
          <RefreshCw size={13} /> Try Again
        </button>
      </div>
    );
  }

  const global = data?.globalStats;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* SECTION 1: HEADER & TIME FILTERS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            COMPETE SECTION INTELLIGENCE
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0 0 0', textTransform: 'uppercase' }}>
            Competition Analytics
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Participation, performance, and activity statistics across Racing Tag, Strategy Room, and Predictions.
          </div>
        </div>

        {/* Time Filters & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '7d', label: 'Last 7 Days' },
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as AnalyticsTimeRange)}
                style={{
                  background: timeRange === range.id ? 'var(--f1-red)' : 'transparent',
                  color: timeRange === range.id ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(timeRange)}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            title="Refresh analytics data"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <a
            href="#/community-stats"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--telemetry-cyan)',
              borderColor: 'rgba(0, 210, 255, 0.35)',
              textDecoration: 'none',
              borderRadius: '6px',
            }}
            title="Open separate public community report"
          >
            <Share2 size={12} />
            <span>Share Public Report</span>
          </a>
        </div>
      </div>

      {/* SECTION 2: GLOBAL METRIC CARDS */}
      {global && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Total Registered Users */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                REGISTERED USERS
              </span>
              <Users size={14} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
              {global.totalRegisteredUsers}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Total platform accounts
            </div>
          </div>

          {/* Unique Competitors */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                ACTIVE COMPETITORS
              </span>
              <Layers size={14} color="var(--telemetry-cyan)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
              {global.usersWithAnyParticipation}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {global.participationRate}% of registered users
            </div>
          </div>

          {/* Racing Tag Participants */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                RACING TAG
              </span>
              <Award size={14} color="#FFB000" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFB000', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
              {global.racingTagParticipants}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {data?.racingTag?.totalAttempts || 0} attempts recorded
            </div>
          </div>

          {/* Strategy Room Participants */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                STRATEGY ROOM
              </span>
              <Target size={14} color="var(--telemetry-cyan)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
              {global.strategyRoomParticipants}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {data?.strategyRoom?.totalAttempts || 0} simulation runs
            </div>
          </div>

          {/* Prediction Participants */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                F1 PREDICTIONS
              </span>
              <Flag size={14} color="var(--f1-red)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
              {global.predictionParticipants}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {data?.predictions?.totalSubmissions || 0} grid submissions
            </div>
          </div>

          {/* Total Activities Completed */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                TOTAL SUBMISSIONS
              </span>
              <CheckCircle2 size={14} color="var(--telemetry-green)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
              {global.totalSubmissionsAndAttempts}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {global.activeParticipantsInPeriod} active in period
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SUB-NAVIGATION TABS */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSubSection('users')}
          className="btn btn-sm"
          style={{
            background: subSection === 'users' ? 'var(--f1-red)' : 'transparent',
            color: subSection === 'users' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Users size={14} /> USER COMPETITION DIRECTORY
        </button>

        <button
          onClick={() => setSubSection('racing_tag')}
          className="btn btn-sm"
          style={{
            background: subSection === 'racing_tag' ? '#FFB000' : 'transparent',
            color: subSection === 'racing_tag' ? '#000' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Award size={14} /> RACING TAG ANALYTICS
        </button>

        <button
          onClick={() => setSubSection('strategy')}
          className="btn btn-sm"
          style={{
            background: subSection === 'strategy' ? 'var(--telemetry-cyan)' : 'transparent',
            color: subSection === 'strategy' ? '#000' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Target size={14} /> STRATEGY ROOM ANALYTICS
        </button>

        <button
          onClick={() => setSubSection('predictions')}
          className="btn btn-sm"
          style={{
            background: subSection === 'predictions' ? 'var(--f1-red)' : 'transparent',
            color: subSection === 'predictions' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Flag size={14} /> F1 PREDICTION ANALYTICS
        </button>
      </div>

      {/* SUB-SECTION 1: USER TABLE & DIRECTORY */}
      {subSection === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Controls: Search and Feature Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search user name or ID..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pitwall-search-input"
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
                />
              </div>

              {/* Feature Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Filter size={13} color="var(--text-muted)" />
                <select
                  value={featureFilter}
                  onChange={e => {
                    setFeatureFilter(e.target.value as any);
                    setPage(1);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.6rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all" style={{ background: '#0e1117' }}>All Features</option>
                  <option value="racing_tag" style={{ background: '#0e1117' }}>Racing Tag Participants</option>
                  <option value="strategy" style={{ background: '#0e1117' }}>Strategy Room Participants</option>
                  <option value="predictions" style={{ background: '#0e1117' }}>Prediction Participants</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Showing {filteredAndSortedUsers.length} competitors
            </div>
          </div>

          {/* User Competition Table */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('displayName')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        USER {sortField === 'displayName' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('racingTagAttempts')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        RACING TAG {sortField === 'racingTagAttempts' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('racingTagBestScore')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        RT BEST {sortField === 'racingTagBestScore' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('strategyAttempts')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        STRATEGY {sortField === 'strategyAttempts' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('strategyBestScore')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        STRAT BEST {sortField === 'strategyBestScore' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('predictionSubmissions')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        PREDICTIONS {sortField === 'predictionSubmissions' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('predictionTotalPoints')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        PRED PTS {sortField === 'predictionTotalPoints' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('totalAttempts')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        TOTAL ATTEMPTS {sortField === 'totalAttempts' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('lastCompetitionActivity')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        LAST ACTIVITY {sortField === 'lastCompetitionActivity' && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No competitors match the search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map(u => (
                      <tr key={u.userId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <UserInitialsAvatar name={u.displayName || u.username} imageUrl={u.avatarUrl} size={30} showBorder={false} />
                            <div>
                              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                                {u.displayName || u.username}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                @{u.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Racing Tag Attempts */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          <span style={{ color: u.racingTagAttempts > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                            {u.racingTagAttempts}
                          </span>
                        </td>

                        {/* Racing Tag Best Score */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          {u.racingTagBestScore > 0 ? (
                            <span style={{ color: '#FFB000', fontWeight: 800 }}>
                              {u.racingTagBestScore} pts ({u.racingTagBestPercentage}%)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Strategy Attempts */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          <span style={{ color: u.strategyAttempts > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                            {u.strategyAttempts}
                          </span>
                        </td>

                        {/* Strategy Best Score */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          {u.strategyBestScore > 0 ? (
                            <span style={{ color: 'var(--telemetry-cyan)', fontWeight: 800 }}>
                              {u.strategyBestScore}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Prediction Submissions */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          <span style={{ color: u.predictionSubmissions > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                            {u.predictionSubmissions}
                          </span>
                        </td>

                        {/* Prediction Total Points */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          {u.predictionTotalPoints > 0 ? (
                            <span style={{ color: 'var(--f1-red)', fontWeight: 800 }}>
                              {u.predictionTotalPoints} pts
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Total Attempts */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                          {u.totalAttempts}
                        </td>

                        {/* Last Activity */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {u.lastCompetitionActivity ? new Date(u.lastCompetitionActivity).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleInspectUser(u.userId)}
                            disabled={loadingProfile}
                            className="btn btn-outline btn-sm"
                            style={{
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                            }}
                          >
                            <ExternalLink size={11} /> Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Page {page} of {totalPages}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.2rem 0.5rem' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.2rem 0.5rem' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: RACING TAG ANALYTICS */}
      {subSection === 'racing_tag' && data?.racingTag && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PARTICIPANTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFB000', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.racingTag.uniqueUsers}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Unique drivers</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL ATTEMPTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.racingTag.totalAttempts}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--telemetry-green)', marginTop: '0.2rem' }}>
                {data.racingTag.completedAttempts} completed
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AVERAGE SCORE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.racingTag.averageScore} pts
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {data.racingTag.averagePercentage}% average accuracy
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BEST SCORE ACHIEVED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFB000', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.racingTag.bestScore} pts
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Highest across participants</div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* By Difficulty */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                ATTEMPTS BY DIFFICULTY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>ROOKIE</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{data.racingTag.byDifficulty.rookie}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(data.racingTag.byDifficulty.rookie / Math.max(1, data.racingTag.totalAttempts)) * 100}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>APEX</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{data.racingTag.byDifficulty.apex}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(data.racingTag.byDifficulty.apex / Math.max(1, data.racingTag.totalAttempts)) * 100}%`, height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>RACE ANALYST</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{data.racingTag.byDifficulty.race_analyst}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(data.racingTag.byDifficulty.race_analyst / Math.max(1, data.racingTag.totalAttempts)) * 100}%`, height: '100%', background: '#ef4444' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                SCORE DISTRIBUTION
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(data.racingTag.scoreDistribution).map(([range, count]) => (
                  <div key={range}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{range}</span>
                      <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(count / Math.max(1, data.racingTag.totalAttempts)) * 100}%`, height: '100%', background: '#FFB000' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Attempts */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              RECENT RACING TAG ATTEMPTS ({data.racingTag.recentAttempts.length})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>DIFFICULTY</th>
                    <th style={{ textAlign: 'center' }}>SCORE</th>
                    <th style={{ textAlign: 'center' }}>ACCURACY</th>
                    <th>EARNED TIER</th>
                    <th style={{ textAlign: 'right' }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.racingTag.recentAttempts.map(att => (
                    <tr key={att.attemptId}>
                      <td style={{ fontWeight: 800, color: '#fff' }}>
                        {att.displayName || att.username}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {(att.difficultyLevel || 'Apex').toUpperCase()}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#FFB000' }}>
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                        {att.percentage}%
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--telemetry-cyan)', fontWeight: 700 }}>
                        {att.fanIdentityTier}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {att.completedAt ? new Date(att.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: STRATEGY ROOM ANALYTICS */}
      {subSection === 'strategy' && data?.strategyRoom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PARTICIPANTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.strategyRoom.uniqueUsers}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Strategists & Engineers</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SIMULATIONS RUN</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.strategyRoom.totalAttempts}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--telemetry-green)', marginTop: '0.2rem' }}>
                {data.strategyRoom.completedAttempts} completed
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AVERAGE SCORE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.strategyRoom.averageScore}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Best: {data.strategyRoom.bestScore}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AVG POSITIONS GAINED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: data.strategyRoom.averagePositionDelta >= 0 ? 'var(--telemetry-green)' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.strategyRoom.averagePositionDelta > 0 ? `+${data.strategyRoom.averagePositionDelta}` : data.strategyRoom.averagePositionDelta}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>vs starting baseline</div>
            </div>
          </div>

          {/* Scenario Breakdown Table */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              PERFORMANCE BY SCENARIO
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>SCENARIO TITLE</th>
                    <th>MODE</th>
                    <th style={{ textAlign: 'center' }}>ATTEMPTS</th>
                    <th style={{ textAlign: 'center' }}>COMPLETED</th>
                    <th style={{ textAlign: 'center' }}>AVG SCORE</th>
                    <th style={{ textAlign: 'right' }}>BEST SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.strategyRoom.scenariosAttempted.map(sc => (
                    <tr key={sc.scenarioId}>
                      <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                        {sc.title}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {String(sc.mode).toUpperCase()}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                        {sc.attempts}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)' }}>
                        {sc.completed}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-cyan)', fontWeight: 700 }}>
                        {sc.avgScore}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#FFB000', fontWeight: 800 }}>
                        {sc.bestScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Strategy Runs */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              RECENT STRATEGY SIMULATIONS ({data.strategyRoom.recentAttempts.length})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>SCENARIO</th>
                    <th style={{ textAlign: 'center' }}>SCORE</th>
                    <th style={{ textAlign: 'center' }}>POS DELTA</th>
                    <th style={{ textAlign: 'center' }}>TIME DELTA</th>
                    <th style={{ textAlign: 'right' }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.strategyRoom.recentAttempts.map(att => (
                    <tr key={att.attemptId}>
                      <td style={{ fontWeight: 800, color: '#ffffff' }}>
                        {att.displayName || att.username}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {att.scenarioTitle || att.scenarioId}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-cyan)' }}>
                        {att.score}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: att.positionDelta >= 0 ? 'var(--telemetry-green)' : '#f87171' }}>
                        {att.positionDelta > 0 ? `+${att.positionDelta}` : att.positionDelta}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: att.timeDeltaSeconds <= 0 ? 'var(--telemetry-green)' : '#f87171' }}>
                        {att.timeDeltaSeconds ? (att.timeDeltaSeconds <= 0 ? `${att.timeDeltaSeconds.toFixed(1)}s` : `+${att.timeDeltaSeconds.toFixed(1)}s`) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {att.completedAt ? new Date(att.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: PREDICTION ANALYTICS */}
      {subSection === 'predictions' && data?.predictions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PARTICIPANTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.predictions.uniqueUsers}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Predictors on the wall</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SUBMISSIONS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.predictions.totalSubmissions}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--telemetry-green)', marginTop: '0.2rem' }}>
                {data.predictions.completedSubmissions} scored / verified
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AVERAGE SCORE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.predictions.averageScore} pts
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Per scored Grand Prix</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BEST SCORE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                {data.predictions.bestScore} pts
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Top round tally</div>
            </div>
          </div>

          {/* Submissions by Grand Prix */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              PREDICTIONS BY GRAND PRIX
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>GRAND PRIX</th>
                    <th style={{ textAlign: 'center' }}>SUBMISSIONS</th>
                    <th style={{ textAlign: 'center' }}>SCORED</th>
                    <th style={{ textAlign: 'center' }}>AVG SCORE</th>
                    <th style={{ textAlign: 'right' }}>HIGHEST SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.predictions.byWeekend.map(w => (
                    <tr key={w.raceWeekendId}>
                      <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                        {w.grandPrixName}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                        {w.submissionsCount}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)' }}>
                        {w.scoredCount}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--f1-red)', fontWeight: 700 }}>
                        {w.averageScore} pts
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#FFB000', fontWeight: 800 }}>
                        {w.highestScore} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              RECENT PREDICTION SUBMISSIONS ({data.predictions.recentSubmissions.length})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>GRAND PRIX / ROUND</th>
                    <th style={{ textAlign: 'center' }}>STATUS</th>
                    <th style={{ textAlign: 'center' }}>SCORE</th>
                    <th style={{ textAlign: 'right' }}>SUBMITTED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {data.predictions.recentSubmissions.map(sub => (
                    <tr key={sub.predictionId}>
                      <td style={{ fontWeight: 800, color: '#ffffff' }}>
                        {sub.displayName || sub.username}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {sub.grandPrixName}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: sub.isScored ? 'var(--telemetry-green)' : 'var(--text-muted)' }}>
                          {sub.isScored ? 'SCORED' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: sub.isScored ? 'var(--f1-red)' : 'var(--text-muted)' }}>
                        {sub.isScored ? `${sub.score ?? 0} pts` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: UNIFIED USER PROFILE MODAL */}
      {inspectingUser && (
        <UnifiedUserCompetitionModal
          profile={inspectingUser}
          onClose={() => setInspectingUser(null)}
        />
      )}
    </div>
  );
};
