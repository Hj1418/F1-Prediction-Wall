import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { LeaderboardEntry, RaceWeekend, PredictionRound } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Award,
  Crown,
  Share2,
} from 'lucide-react';
import { StoryShareModal } from '../components/sharing/StoryShareModal';
import {
  generateLeaderboardStoryCanvas,
  generateUserResultStoryCanvas,
  assertAdminAuthorized,
} from '../services/sharing/storyShareService';
import { resolveLatestCompletedAndFinalizedWeekend } from '../utils/raceLifecycle';

export const LeaderboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataVersion, showToast } = useApp();
  const { currentUser, openLoginModal } = useAuth();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalTitle, setShareModalTitle] = useState('');
  const [shareModalCanvas, setShareModalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [shareModalFilename, setShareModalFilename] = useState('');
  const [shareModalText, setShareModalText] = useState('');

  // Exactly two views: 'season' and 'weekend'
  const rawType = searchParams.get('type');
  const tab: 'season' | 'weekend' = rawType === 'weekend' ? 'weekend' : 'season';
  const urlId = searchParams.get('id') || '';

  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected weekend state with persistence ref
  const [selectedWeekendId, setSelectedWeekendId] = useState<string>(urlId);
  const userManualSelectionRef = useRef<boolean>(Boolean(urlId));

  useEffect(() => {
    document.title = 'Championship Standings | Prediction Bench • The Grid';
  }, []);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [wList, rList] = await Promise.all([
          api.getRaceWeekends(),
          api.getPredictionRounds(),
        ]);
        setWeekends(wList);
        setRounds(rList);

        // Normalize legacy 'round' parameter if accessed via old links/bookmarks
        if (rawType === 'round') {
          const matchingRound = rList.find(r => r.roundId === urlId);
          const targetWeekend = matchingRound?.raceWeekendId;
          const resolvedId =
            targetWeekend ||
            resolveLatestCompletedAndFinalizedWeekend(wList, rList)?.raceWeekendId ||
            wList[0]?.raceWeekendId ||
            '';
          setSelectedWeekendId(resolvedId);
          setSearchParams({ type: 'weekend', id: resolvedId }, { replace: true });
          return;
        }

        // If valid explicit weekend ID in URL, honor it
        if (urlId && wList.some(w => w.raceWeekendId === urlId)) {
          setSelectedWeekendId(urlId);
        } else if (!userManualSelectionRef.current || !selectedWeekendId) {
          // Resolve canonical latest completed and finalized weekend dynamically
          const defaultWeekend = resolveLatestCompletedAndFinalizedWeekend(wList, rList);
          if (defaultWeekend) {
            setSelectedWeekendId(defaultWeekend.raceWeekendId);
            if (tab === 'weekend') {
              setSearchParams({ type: 'weekend', id: defaultWeekend.raceWeekendId }, { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load leaderboard metadata', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const idToQuery = tab === 'weekend' ? selectedWeekendId : undefined;
        const data = await api.getLeaderboard(tab, idToQuery);
        setEntries(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard entries', err);
      } finally {
        setLoading(false);
      }
    }

    if (tab === 'season' || (tab === 'weekend' && selectedWeekendId)) {
      fetchLeaderboard();
    }
  }, [tab, selectedWeekendId, dataVersion]);

  const handleTabChange = (newTab: 'season' | 'weekend') => {
    const params = new URLSearchParams();
    params.set('type', newTab);
    if (newTab === 'weekend') {
      let weekendToUse = selectedWeekendId;
      if (!weekendToUse && weekends.length > 0) {
        const defaultWeekend = resolveLatestCompletedAndFinalizedWeekend(weekends, rounds);
        weekendToUse = defaultWeekend ? defaultWeekend.raceWeekendId : weekends[0].raceWeekendId;
        setSelectedWeekendId(weekendToUse);
      }
      if (weekendToUse) params.set('id', weekendToUse);
    }
    setSearchParams(params);
  };

  const handleWeekendChange = (newWeekendId: string) => {
    userManualSelectionRef.current = true;
    setSelectedWeekendId(newWeekendId);
    setSearchParams({ type: 'weekend', id: newWeekendId });
  };

  // Sort weekends chronologically, newest first
  const sortedWeekends = [...weekends].sort((a, b) => {
    const roundA = a.roundNumber ?? a.round ?? 0;
    const roundB = b.roundNumber ?? b.round ?? 0;
    if (roundB !== roundA) return roundB - roundA;
    const dateA = new Date(a.endDate || a.startDate).getTime();
    const dateB = new Date(b.endDate || b.startDate).getTime();
    return dateB - dateA;
  });

  const currentWeekend = weekends.find(w => w.raceWeekendId === selectedWeekendId);
  const weekendRounds = rounds.filter(
    r => r.raceWeekendId === selectedWeekendId || (r as any).weekendId === selectedWeekendId
  );
  const hasSprint =
    currentWeekend?.weekendType === 'SPRINT' ||
    weekendRounds.some(r => r.roundType === 'SPRINT' || r.roundId.toUpperCase().includes('SPRINT'));
  const isWeekendFinalized = weekendRounds.some(r => r.status === 'SCORED');

  const userEntry = entries.find(
    e =>
      e.userId === currentUser?.userId ||
      (currentUser?.username && e.username.toLowerCase() === currentUser.username.toLowerCase())
  );

  const handleShareLeaderboard = () => {
    try {
      assertAdminAuthorized(currentUser);
      const isSeason = tab === 'season';
      const eventName = isSeason ? '2026 World Championship' : (currentWeekend?.raceName || 'Race Weekend');

      const canvas = generateLeaderboardStoryCanvas(
        {
          season: 2026,
          entries: entries.slice(0, 10).map(e => ({
            rank: e.rank,
            username: e.username,
            points: e.totalPoints,
          })),
          latestEventName: eventName,
        },
        currentUser
      );

      setShareModalCanvas(canvas);
      setShareModalTitle(isSeason ? 'Share Season Leaderboard Story' : `Share ${eventName} Standings`);
      setShareModalFilename(
        `the-grid-${isSeason ? 'season' : (currentWeekend?.raceName || 'weekend').toLowerCase().replace(/\s+/g, '-')}-leaderboard.png`
      );
      setShareModalText(
        isSeason
          ? 'Check out the official 2026 F1 Championship standings on The Grid!'
          : `Check out the official ${eventName} standings on The Grid!`
      );
      setIsShareModalOpen(true);
    } catch (e: any) {
      showToast(e.message || 'Unauthorized', 'error');
    }
  };

  const handleShareMyResult = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const isSeason = tab === 'season';
      const pts = userEntry ? userEntry.totalPoints : isSeason ? currentUser.totalPoints || 0 : 0;
      const rank = userEntry ? userEntry.rank : isSeason ? currentUser.seasonRank || 1 : 1;
      const eventName = isSeason ? '2026 World Championship' : (currentWeekend?.raceName || 'Race Weekend');

      const canvas = generateUserResultStoryCanvas({
        username: currentUser.username,
        eventName,
        pointsEarned: pts,
        rank,
        season: 2026,
        totalPoints: currentUser.totalPoints || pts,
        racesParticipated: userEntry?.racesParticipated ?? currentUser.racesParticipated,
        isSeasonSummary: isSeason,
      });

      setShareModalCanvas(canvas);
      setShareModalTitle(isSeason ? 'Share My Championship Standing' : `Share ${eventName} Result`);
      setShareModalFilename(
        `the-grid-${currentUser.username}-${isSeason ? 'season-standing' : 'weekend-result'}.png`
      );
      setShareModalText(
        isSeason
          ? `I am ranked P${rank} with ${pts} PTS in the 2026 Championship on The Grid!`
          : `I scored ${pts} PTS in the ${eventName} on The Grid!`
      );
      setIsShareModalOpen(true);
    } catch (e: any) {
      showToast(e.message || 'Failed to generate story', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem' }}>
      {/* Title & Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--f1-red)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            THE GRID • COMPETITION STANDINGS
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
            Championship Standings
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Official community member standings across Season Overall and individual Race Weekend competition.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Admin Leaderboard Share Action (Strictly Admin Authorized) */}
          {currentUser?.role === 'admin' && (
            <button
              id="admin-share-leaderboard-btn"
              onClick={handleShareLeaderboard}
              className="btn btn-sm"
              style={{
                backgroundColor: 'var(--f1-red)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: 'none',
                boxShadow: '0 0 14px rgba(225, 6, 0, 0.4)',
                cursor: 'pointer',
                padding: '0.5rem 0.95rem',
              }}
            >
              <Share2 size={14} /> SHARE LEADERBOARD
            </button>
          )}

          {/* Tab switcher: Exactly Two Views */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-elevated)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              maxWidth: '100%',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            <button
              id="tab-season-overall"
              onClick={() => handleTabChange('season')}
              className="btn btn-sm"
              style={{
                background: tab === 'season' ? 'var(--f1-red)' : 'transparent',
                color: tab === 'season' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                flexShrink: 0,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Trophy size={14} /> Season Overall
            </button>
            <button
              id="tab-weekend-overall"
              onClick={() => handleTabChange('weekend')}
              className="btn btn-sm"
              style={{
                background: tab === 'weekend' ? 'var(--f1-red)' : 'transparent',
                color: tab === 'weekend' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                flexShrink: 0,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Calendar size={14} /> Weekend Overall
            </button>
          </div>
        </div>
      </div>

      {/* Prominent YOUR POSITION Banner */}
      {currentUser && (
        <div
          className="race-card"
          style={{
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.12) 0%, var(--bg-surface-card) 100%)',
            border: '1px solid rgba(225, 6, 0, 0.35)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <UserInitialsAvatar
              name={currentUser.username || userEntry?.username || 'Grid User'}
              imageUrl={userEntry?.avatarUrl || currentUser.avatarUrl}
              size={46}
            />
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--f1-red)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {tab === 'season' ? 'CHAMPIONSHIP STANDING' : `${currentWeekend?.raceName || 'RACE WEEKEND'} STANDING`}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {currentUser.username || userEntry?.username || 'Grid User'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {tab === 'season' ? 'SEASON RANK' : 'WEEKEND RANK'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#eab308', fontFamily: 'var(--font-mono)' }}>
                {tab === 'season'
                  ? userEntry
                    ? `P${userEntry.rank}`
                    : currentUser.seasonRank
                    ? `P${currentUser.seasonRank}`
                    : '—'
                  : userEntry
                  ? `P${userEntry.rank}`
                  : 'UNRANKED'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {tab === 'season' ? 'SEASON SCORE' : 'WEEKEND SCORE'}
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--telemetry-green)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {tab === 'season'
                  ? userEntry
                    ? userEntry.totalPoints
                    : currentUser.totalPoints || 0
                  : userEntry
                  ? userEntry.totalPoints
                  : 0}{' '}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PTS</span>
              </div>
            </div>

            {tab === 'season' && userEntry && userEntry.rankChange !== 0 && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  MOVEMENT
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: userEntry.rankChange > 0 ? 'var(--telemetry-green)' : '#f87171',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {userEntry.rankChange > 0 ? `+${userEntry.rankChange} spots` : `${userEntry.rankChange} spots`}
                </div>
              </div>
            )}

            {/* Share My Rank Button */}
            <button
              id="user-share-rank-btn"
              onClick={handleShareMyResult}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                padding: '0.5rem 0.95rem',
              }}
            >
              <Share2 size={14} /> {tab === 'season' ? 'SHARE SEASON RANK' : 'SHARE WEEKEND RANK'}
            </button>
          </div>
        </div>
      )}

      {/* Weekend selector control (Only visible in Weekend Overall view) */}
      {tab === 'weekend' && (
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            background: 'var(--bg-surface-elevated)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--f1-red)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Select Race Weekend:
            </span>
            <select
              id="race-weekend-selector"
              className="form-select"
              style={{
                maxWidth: '100%',
                minWidth: 'min(100%, 340px)',
                fontWeight: 700,
                backgroundColor: 'var(--bg-surface-card)',
                borderColor: 'var(--border-subtle)',
                color: '#fff',
              }}
              value={selectedWeekendId}
              onChange={e => handleWeekendChange(e.target.value)}
            >
              {sortedWeekends.map(w => {
                const wRounds = rounds.filter(
                  r => r.raceWeekendId === w.raceWeekendId || (r as any).weekendId === w.raceWeekendId
                );
                const isFinalized = wRounds.some(r => r.status === 'SCORED');
                const typeLabel = w.weekendType === 'SPRINT' ? 'Sprint + Grand Prix' : 'Grand Prix';
                const statusTag = isFinalized
                  ? '• Finalized'
                  : w.status === 'COMPLETED'
                  ? '• Results Pending'
                  : w.status === 'ACTIVE'
                  ? '• Live'
                  : '• Upcoming';

                return (
                  <option key={w.raceWeekendId} value={w.raceWeekendId}>
                    Round {w.round} • {w.flag} {w.raceName} ({typeLabel}) {statusTag}
                  </option>
                );
              })}
            </select>
          </div>

          {currentWeekend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
              <span
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isWeekendFinalized ? 'var(--telemetry-green)' : '#eab308',
                }}
              >
                {isWeekendFinalized
                  ? '● VERIFIED & FINALIZED'
                  : currentWeekend.status === 'COMPLETED'
                  ? '● RESULTS UNDER REVIEW'
                  : '○ EVENT SCHEDULED'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Timing Screen Table */}
      <div className="race-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div
              className="live-pulse"
              style={{ width: '10px', height: '10px', backgroundColor: 'var(--f1-red)', marginBottom: '0.75rem' }}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              COMPUTING CHAMPIONSHIP STANDINGS & SECTOR DELTAS...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                color: '#fff',
              }}
            >
              {tab === 'season'
                ? 'No Scored Results Available Yet'
                : isWeekendFinalized
                ? 'No Participant Scores Found'
                : currentWeekend?.status === 'COMPLETED'
                ? 'Weekend Results Under Review'
                : 'Upcoming Race Weekend'}
            </div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto', fontSize: '0.88rem' }}>
              {tab === 'season'
                ? 'Official results must be entered and scored for at least one race round to populate the championship leaderboard.'
                : isWeekendFinalized
                ? 'No verified prediction scores were submitted for this race weekend.'
                : currentWeekend?.status === 'COMPLETED'
                ? `Official FIA results for the ${currentWeekend?.raceName} are being finalized by race control. Standings will be published as soon as scores are verified.`
                : `Predictions for the ${currentWeekend?.raceName} have not concluded yet. Inspect previous completed race weekends or check back once the race finishes.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="timing-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>POS</th>
                  {tab === 'season' && <th style={{ width: '60px', textAlign: 'center' }}>+/-</th>}
                  <th>USERNAME</th>
                  {/* Season Overall Columns */}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>WEEKENDS</th>}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>EXACT P1</th>}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>PERFECT PODIUM</th>}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>AVG PTS</th>}
                  {/* Weekend Overall Columns */}
                  {tab === 'weekend' && hasSprint && <th style={{ textAlign: 'center' }}>SPRINT PTS</th>}
                  {tab === 'weekend' && <th style={{ textAlign: 'center' }}>GRAND PRIX PTS</th>}
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    {tab === 'season' ? 'TOTAL PTS' : 'WEEKEND TOTAL'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const isLeader = entry.rank === 1;

                  let rankColor = 'var(--text-secondary)';
                  if (entry.rank === 1) rankColor = '#eab308';
                  else if (entry.rank === 2) rankColor = '#cbd5e1';
                  else if (entry.rank === 3) rankColor = '#d97706';

                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        background: isLeader ? 'rgba(234, 179, 8, 0.04)' : undefined,
                      }}
                    >
                      {/* Position */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 900,
                            fontSize: '1rem',
                            color: rankColor,
                          }}
                        >
                          {entry.rank}
                        </span>
                      </td>

                      {/* Delta Rank (Season only) */}
                      {tab === 'season' && (
                        <td style={{ textAlign: 'center' }}>
                          {entry.rankChange > 0 ? (
                            <span
                              style={{
                                color: 'var(--telemetry-green)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <ArrowUpRight size={13} /> +{entry.rankChange}
                            </span>
                          ) : entry.rankChange < 0 ? (
                            <span
                              style={{
                                color: '#f87171',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <ArrowDownRight size={13} /> {entry.rankChange}
                            </span>
                          ) : (
                            <span
                              style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Minus size={13} />
                            </span>
                          )}
                        </td>
                      )}

                      {/* Racer Profile: Username & Avatar */}
                      <td>
                        <Link
                          to={`/profile/${entry.username}`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <UserInitialsAvatar
                            name={entry.username || 'Grid User'}
                            imageUrl={entry.avatarUrl}
                            size={32}
                            showBorder={false}
                          />
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            {entry.username || 'Grid User'}
                            {isLeader && (
                              <span title="Championship Leader" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Crown size={14} color="#eab308" />
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Season stats (Season only) */}
                      {tab === 'season' && (
                        <td
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {entry.racesParticipated}
                        </td>
                      )}

                      {tab === 'season' && (
                        <td
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--telemetry-green)',
                            fontWeight: 700,
                          }}
                        >
                          {entry.exactP1Count}
                        </td>
                      )}

                      {tab === 'season' && (
                        <td
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            color: '#eab308',
                            fontWeight: 700,
                          }}
                        >
                          {entry.perfectPodiumCount}
                        </td>
                      )}

                      {tab === 'season' && (
                        <td
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--telemetry-cyan)',
                          }}
                        >
                          {entry.avgPointsPerRace}
                        </td>
                      )}

                      {/* Weekend specific points breakdown (Weekend only) */}
                      {tab === 'weekend' && hasSprint && (
                        <td
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.88rem',
                            color: 'var(--telemetry-cyan)',
                            fontWeight: 700,
                          }}
                        >
                          {entry.sprintPoints !== undefined ? `${entry.sprintPoints} PTS` : '0 PTS'}
                        </td>
                      )}

                      {tab === 'weekend' && (
                        <td
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.88rem',
                            color: 'var(--telemetry-green)',
                            fontWeight: 700,
                          }}
                        >
                          {entry.grandPrixPoints !== undefined
                            ? `${entry.grandPrixPoints} PTS`
                            : hasSprint
                            ? '0 PTS'
                            : `${entry.totalPoints} PTS`}
                        </td>
                      )}

                      {/* Total Points */}
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 900,
                            fontSize: '1.15rem',
                            color: isLeader ? 'var(--telemetry-yellow)' : '#fff',
                          }}
                        >
                          {entry.totalPoints}{' '}
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PTS</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Prediction Scoring Rules Matrix Card */}
      <div
        className="race-card"
        style={{
          marginTop: '2.5rem',
          padding: '1.5rem 1.75rem',
          background: 'linear-gradient(135deg, rgba(22, 28, 40, 0.95), rgba(18, 23, 34, 0.95))',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Award size={18} color="var(--f1-red)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Official Prediction Scoring Rules
          </h3>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              P1 WINNER
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--telemetry-green)', marginTop: '0.2rem' }}>
              25 PTS
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              P2 / P3 PODIUM
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--telemetry-green)', marginTop: '0.2rem' }}>
              18 / 15 PTS
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              POLE POSITION
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--telemetry-yellow)', marginTop: '0.2rem' }}>
              10 PTS
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              FASTEST LAP
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b966ff', marginTop: '0.2rem' }}>10 PTS</div>
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              PERFECT PODIUM
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#eab308', marginTop: '0.2rem' }}>
              +10 BONUS
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              MARGIN / SAFETY CAR
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--telemetry-cyan)', marginTop: '0.2rem' }}>
              5 PTS EACH
            </div>
          </div>
        </div>
      </div>

      <StoryShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={shareModalTitle}
        canvas={shareModalCanvas}
        filename={shareModalFilename}
        shareText={shareModalText}
        shareCategory="leaderboard"
      />
    </div>
  );
};
