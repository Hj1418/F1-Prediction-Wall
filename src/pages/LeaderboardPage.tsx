import React, { useState, useEffect } from 'react';
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
  Medal,
  Calendar,
  Layers,
  ChevronRight,
  Award,
  Crown,
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataVersion } = useApp();
  const { currentUser } = useAuth();

  const tab = (searchParams.get('type') as 'season' | 'weekend' | 'round') || 'season';
  const targetId = searchParams.get('id') || '';

  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected weekend or round dropdown
  const [selectedWeekendId, setSelectedWeekendId] = useState<string>('');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [wList, rList] = await Promise.all([
          api.getRaceWeekends(),
          api.getPredictionRounds(),
        ]);
        setWeekends(wList);
        setRounds(rList);

        if (targetId && tab === 'weekend') {
          setSelectedWeekendId(targetId);
        } else if (wList.length > 0 && !selectedWeekendId) {
          const activeOrFirst = wList.find(w => w.status === 'ACTIVE') || wList[0];
          setSelectedWeekendId(activeOrFirst.raceWeekendId);
        }

        if (targetId && tab === 'round') {
          setSelectedRoundId(targetId);
        } else if (rList.length > 0 && !selectedRoundId) {
          const scoredOrFirst = rList.find(r => r.status === 'SCORED') || rList[0];
          setSelectedRoundId(scoredOrFirst.roundId);
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
        let idToQuery = undefined;
        if (tab === 'weekend') {
          idToQuery = selectedWeekendId;
        } else if (tab === 'round') {
          idToQuery = selectedRoundId;
        }

        const data = await api.getLeaderboard(tab, idToQuery);
        setEntries(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard entries', err);
      } finally {
        setLoading(false);
      }
    }

    if (tab === 'season' || (tab === 'weekend' && selectedWeekendId) || (tab === 'round' && selectedRoundId)) {
      fetchLeaderboard();
    }
  }, [tab, selectedWeekendId, selectedRoundId, dataVersion]);

  const handleTabChange = (newTab: 'season' | 'weekend' | 'round') => {
    const params = new URLSearchParams();
    params.set('type', newTab);
    if (newTab === 'weekend' && selectedWeekendId) params.set('id', selectedWeekendId);
    if (newTab === 'round' && selectedRoundId) params.set('id', selectedRoundId);
    setSearchParams(params);
  };

  const currentWeekend = weekends.find(w => w.raceWeekendId === selectedWeekendId);
  const currentRound = rounds.find(r => r.roundId === selectedRoundId);
  const weekendRounds = rounds.filter(r => r.raceWeekendId === selectedWeekendId);
  const userEntry = entries.find(e => e.userId === currentUser?.userId);

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
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            COMMUNITY CHAMPIONSHIP
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
            Leaderboards & Standings
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Compete with friends and fellow Formula 1 fans across the season.
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => handleTabChange('season')}
            className="btn btn-sm"
            style={{
              background: tab === 'season' ? 'var(--f1-red)' : 'transparent',
              color: tab === 'season' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
            }}
          >
            <Trophy size={14} /> Season Overall
          </button>
          <button
            onClick={() => handleTabChange('weekend')}
            className="btn btn-sm"
            style={{
              background: tab === 'weekend' ? 'var(--f1-red)' : 'transparent',
              color: tab === 'weekend' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
            }}
          >
            <Calendar size={14} /> This Weekend
          </button>
          <button
            onClick={() => handleTabChange('round')}
            className="btn btn-sm"
            style={{
              background: tab === 'round' ? 'var(--f1-red)' : 'transparent',
              color: tab === 'round' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
            }}
          >
            <Layers size={14} /> Session Round
          </button>
        </div>
      </div>

      {/* Prominent YOUR POSITION Banner */}
      {userEntry && (
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
              name={userEntry.displayName}
              size={46}
            />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--f1-red)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                YOUR POSITION
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {userEntry.displayName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>YOUR RANK</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#eab308', fontFamily: 'var(--font-mono)' }}>
                P{userEntry.rank}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL SCORE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)' }}>
                {userEntry.totalPoints} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PTS</span>
              </div>
            </div>
            {userEntry.rankChange !== 0 && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MOVEMENT</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: userEntry.rankChange > 0 ? 'var(--telemetry-green)' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                  {userEntry.rankChange > 0 ? `+${userEntry.rankChange} spots` : `${userEntry.rankChange} spots`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selector controls for weekend / round */}
      {tab === 'weekend' && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Select Grand Prix:
          </span>
          <select
            className="form-select"
            style={{ maxWidth: '320px' }}
            value={selectedWeekendId}
            onChange={e => {
              setSelectedWeekendId(e.target.value);
              setSearchParams({ type: 'weekend', id: e.target.value });
            }}
          >
            {weekends.map(w => (
              <option key={w.raceWeekendId} value={w.raceWeekendId}>
                {w.flag} {w.raceName} ({w.weekendType})
              </option>
            ))}
          </select>
        </div>
      )}

      {tab === 'round' && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Select Prediction Round:
          </span>
          <select
            className="form-select"
            style={{ maxWidth: '380px' }}
            value={selectedRoundId}
            onChange={e => {
              setSelectedRoundId(e.target.value);
              setSearchParams({ type: 'round', id: e.target.value });
            }}
          >
            {rounds.map(r => {
              const wk = weekends.find(w => w.raceWeekendId === r.raceWeekendId);
              return (
                <option key={r.roundId} value={r.roundId}>
                  {wk?.flag} {wk?.raceName} — {r.title} ({r.status})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Leaderboard Timing Screen Table */}
      <div className="race-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div className="live-pulse" style={{ width: '10px', height: '10px', backgroundColor: 'var(--f1-red)', marginBottom: '0.75rem' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              COMPUTING SECTOR DELTAS & SCORES...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No calculated scores found for this session yet. Official results must be entered and scored by the race director.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="timing-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>POS</th>
                  {tab === 'season' && <th style={{ width: '60px', textAlign: 'center' }}>+/-</th>}
                  <th>RACER</th>
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>RACES</th>}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>EXACT P1</th>}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>PERFECT PODIUM</th>}
                  {tab === 'season' && <th style={{ textAlign: 'center' }}>AVG PTS</th>}
                  {tab === 'weekend' &&
                    weekendRounds.map(wr => (
                      <th key={wr.roundId} style={{ textAlign: 'center' }}>
                        {wr.roundType.replace('_', ' ')}
                      </th>
                    ))}
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>TOTAL PTS</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const isLeader = entry.rank === 1;
                  const isPodium = entry.rank <= 3;

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
                            <span style={{ color: 'var(--telemetry-green)', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
                              <ArrowUpRight size={13} /> +{entry.rankChange}
                            </span>
                          ) : entry.rankChange < 0 ? (
                            <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
                              <ArrowDownRight size={13} /> {entry.rankChange}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}>
                              <Minus size={13} />
                            </span>
                          )}
                        </td>
                      )}

                      {/* Racer Profile */}
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
                            name={entry.displayName}
                            size={32}
                            showBorder={false}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {entry.displayName}
                              {isLeader && (
                                <span title="Championship Leader" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                  <Crown size={14} color="#eab308" />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              @{entry.username}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Season stats */}
                      {tab === 'season' && (
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {entry.racesParticipated}
                        </td>
                      )}

                      {tab === 'season' && (
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)', fontWeight: 700 }}>
                          {entry.exactP1Count}
                        </td>
                      )}

                      {tab === 'season' && (
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#eab308', fontWeight: 700 }}>
                          {entry.perfectPodiumCount}
                        </td>
                      )}

                      {tab === 'season' && (
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-cyan)' }}>
                          {entry.avgPointsPerRace}
                        </td>
                      )}

                      {/* Weekend round-by-round points */}
                      {tab === 'weekend' &&
                        weekendRounds.map(wr => (
                          <td key={wr.roundId} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            {entry.roundScores?.[wr.roundId] !== undefined ? (
                              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                                {entry.roundScores[wr.roundId]} pts
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>-</span>
                            )}
                          </td>
                        ))}

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
    </div>
  );
};
