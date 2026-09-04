import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import {
  RaceWeekend,
  PredictionRound,
  Driver,
  WeekendType,
  RoundType,
  RoundStatus,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Shield,
  PlusCircle,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Settings,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Database,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { raceWeekendApi } from '../api/raceWeekendApi';
import { SyncLog } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, switchUser, allUsers } = useAuth();
  const { showToast, triggerDataRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'results' | 'weekends' | 'rounds'>('sync');
  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Sync state
  const [syncSeason, setSyncSeason] = useState<number>(2026);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Result entry state
  const [selectedRoundId, setSelectedRoundId] = useState<string>('round_chn_gp');
  const [resultForm, setResultForm] = useState<Record<string, any>>({
    p1: 'verstappen',
    p2: 'norris',
    p3: 'leclerc',
    fastestLap: 'norris',
    driverOfTheDay: 'leclerc',
    wildCard: 'YES',
  });
  const [calcResult, setCalcResult] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  // New Weekend Form state
  const [newWeekend, setNewWeekend] = useState({
    raceName: '',
    country: '',
    circuit: '',
    flag: '🏁',
    weekendType: 'NORMAL' as WeekendType,
    circuitLengthKm: 5.3,
    laps: 57,
  });

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [wList, rList, dList] = await Promise.all([
          api.getRaceWeekends(),
          api.getPredictionRounds(),
          api.getDrivers(),
        ]);
        setWeekends(wList);
        setRounds(rList);
        setDrivers(dList);

        if (rList.length > 0 && !selectedRoundId) {
          const openOrFirst = rList.find(r => r.status === 'OPEN') || rList[0];
          setSelectedRoundId(openOrFirst.roundId);
        }
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const activeRound = rounds.find(r => r.roundId === selectedRoundId);

  // Handle switching to admin account if not currently admin
  const handleBecomeAdmin = async () => {
    const adminUser = allUsers.find(u => u.role === 'admin') || allUsers[allUsers.length - 1];
    await switchUser(adminUser.userId);
    showToast(`Switched to administrator account: ${adminUser.displayName}`, 'success');
  };

  // Submit Official Result & Calculate Scores
  const handleSaveResultAndCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoundId) return;

    try {
      setProcessing(true);
      // 1. Save official result
      await api.adminSubmitResult(selectedRoundId, resultForm);

      // 2. Run idempotent score calculation
      const scored = await api.adminCalculateScores(selectedRoundId);
      setCalcResult(scored);

      // 3. Refresh local rounds list
      const updatedRounds = await api.getPredictionRounds();
      setRounds(updatedRounds);

      showToast(`Scores successfully calculated for ${scored.scoredCount} racer predictions!`, 'success');
      triggerDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error calculating scores', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Create new weekend
  const handleCreateWeekend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekend.raceName || !newWeekend.circuit) {
      showToast('Please provide Race Name and Circuit', 'error');
      return;
    }

    try {
      setProcessing(true);
      const created = await api.adminSaveWeekend({
        ...newWeekend,
        season: 2026,
        status: 'UPCOMING',
        startDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 47 * 86400000).toISOString(),
      });

      setWeekends(prev => [...prev, created]);
      showToast(`Grand Prix ${created.raceName} successfully created!`, 'success');
      setNewWeekend({
        raceName: '',
        country: '',
        circuit: '',
        flag: '🏁',
        weekendType: 'NORMAL',
        circuitLengthKm: 5.3,
        laps: 57,
      });
      triggerDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to create weekend', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleLiveSync = async () => {
    try {
      setIsSyncing(true);
      const res = await raceWeekendApi.syncSeasonCalendar(syncSeason);
      setSyncLogs(res.logs || []);
      const [wList, rList] = await Promise.all([
        api.getRaceWeekends(),
        api.getPredictionRounds(),
      ]);
      setWeekends(wList);
      setRounds(rList);
      showToast(`Synchronized ${res.syncedCount} race weekends from Jolpica F1 API!`, 'success');
      triggerDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'Live synchronization failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem' }}>
      {/* Admin Title & Status */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(225, 6, 0, 0.15)',
              border: '1px solid var(--f1-red)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={24} color="var(--f1-red)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              RACE CONTROL & STEWARDS PANEL
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Admin authorization status pill */}
        <div>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--telemetry-green)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              <CheckCircle2 size={16} /> ADMIN PRIVILEGES VERIFIED ({currentUser.displayName})
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={14} /> Currently logged in as standard user
              </span>
              <button onClick={handleBecomeAdmin} className="btn btn-primary btn-sm">
                Switch to Admin Role
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('sync')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'sync' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'sync' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> Jolpica Live Calendar Sync
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'results' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'results' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          <Award size={14} /> Official Results & Scoring
        </button>

        <button
          onClick={() => setActiveTab('weekends')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'weekends' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'weekends' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          <Calendar size={14} /> Race Weekend Creator
        </button>

        <button
          onClick={() => setActiveTab('rounds')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'rounds' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'rounds' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          <Layers size={14} /> Prediction Rounds Manager
        </button>
      </div>

      {/* TAB 0: JOLPICA LIVE CALENDAR SYNC */}
      {activeTab === 'sync' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Card */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--telemetry-green)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    EXTERNAL DATA PROVIDER ABSTRACTION
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0, 230, 118, 0.15)',
                      color: 'var(--telemetry-green)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      border: '1px solid rgba(0, 230, 118, 0.3)',
                    }}
                  >
                    LIVE • JOLPICA F1 (api.jolpi.ca)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Formula 1 Calendar & Schedule Synchronization
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', maxWidth: '750px' }}>
                  Synchronizes external Formula 1 race weekends, session schedules, and timestamps. The system automatically detects Sprint vs. Normal formats, dynamically generates prediction rounds, updates closing deadlines, and logs changes while preserving existing user predictions.
                </p>
              </div>

              {/* Sync Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.2rem' }}>Target Season</label>
                  <select
                    className="form-select"
                    style={{ width: '110px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                    value={syncSeason}
                    onChange={e => setSyncSeason(Number(e.target.value))}
                    disabled={isSyncing}
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                  </select>
                </div>

                <button
                  onClick={handleLiveSync}
                  disabled={isSyncing}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-end', padding: '0.65rem 1.25rem' }}
                >
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'SYNCING FROM JOLPICA...' : `SYNC ${syncSeason} CALENDAR`}
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RACE WEEKENDS IN DB</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {weekends.length} Grands Prix
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PREDICTION ROUNDS</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {rounds.length} Active Rounds
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SPRINT WEEKENDS</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem', color: '#ff9500' }}>
                  {weekends.filter(w => w.weekendType === 'SPRINT').length} Sprint Format
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROVIDER PROTOCOL</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--telemetry-cyan)' }}>
                  Jolpica / Ergast v1
                </div>
              </div>
            </div>
          </div>

          {/* Sync Audit Logs Section */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Synchronization Audit Trail & Change Detection Log
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Detailed record of created entities, schedule adjustments, and verified sessions.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {syncLogs.length} Events Logged
              </span>
            </div>

            {syncLogs.length > 0 ? (
              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {syncLogs.map(log => {
                  let actionBg = 'rgba(148, 163, 184, 0.15)';
                  let actionColor = 'var(--text-secondary)';
                  if (log.action === 'CREATED') {
                    actionBg = 'rgba(0, 230, 118, 0.15)';
                    actionColor = 'var(--telemetry-green)';
                  } else if (log.action === 'UPDATED') {
                    actionBg = 'rgba(234, 179, 8, 0.15)';
                    actionColor = '#eab308';
                  } else if (log.action === 'ERROR') {
                    actionBg = 'rgba(239, 68, 68, 0.15)';
                    actionColor = '#f87171';
                  }

                  return (
                    <div
                      key={log.logId}
                      style={{
                        background: 'var(--bg-input)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '3px',
                            backgroundColor: actionBg,
                            color: actionColor,
                          }}
                        >
                          {log.action}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            {log.details || log.entityId}
                          </div>
                          {log.previousValue && log.newValue && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              From: {log.previousValue} ➔ To: {log.newValue}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '3rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                Click "SYNC CALENDAR" above to synchronize live Formula 1 dates, detect changes, and generate logs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: OFFICIAL RESULTS & SCORING ENGINE */}
      {activeTab === 'results' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Result Entry Form */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Publish Official Outcome & Compute Scores
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Enter the verified FIA session results. Running score calculation will execute the scoring engine across all racer predictions and update the championship leaderboards.
            </p>

            {/* Select Target Round */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select Prediction Round</label>
              <select
                className="form-select"
                value={selectedRoundId}
                onChange={e => setSelectedRoundId(e.target.value)}
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

            {activeRound && (
              <form onSubmit={handleSaveResultAndCalculate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* P1 */}
                  <div>
                    <label className="form-label">Official Winner (P1)</label>
                    <select
                      className="form-select"
                      value={resultForm.p1 || ''}
                      onChange={e => setResultForm(prev => ({ ...prev, p1: e.target.value }))}
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          #{d.number} {d.firstName} {d.lastName} ({d.team})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* P2 */}
                  <div>
                    <label className="form-label">Official Second (P2)</label>
                    <select
                      className="form-select"
                      value={resultForm.p2 || ''}
                      onChange={e => setResultForm(prev => ({ ...prev, p2: e.target.value }))}
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          #{d.number} {d.firstName} {d.lastName} ({d.team})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* P3 */}
                  <div>
                    <label className="form-label">Official Third (P3)</label>
                    <select
                      className="form-select"
                      value={resultForm.p3 || ''}
                      onChange={e => setResultForm(prev => ({ ...prev, p3: e.target.value }))}
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          #{d.number} {d.firstName} {d.lastName} ({d.team})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fastest Lap */}
                  <div>
                    <label className="form-label">Fastest Lap Driver</label>
                    <select
                      className="form-select"
                      value={resultForm.fastestLap || ''}
                      onChange={e => setResultForm(prev => ({ ...prev, fastestLap: e.target.value }))}
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          #{d.number} {d.firstName} {d.lastName} ({d.team})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Driver of the Day */}
                  <div>
                    <label className="form-label">Driver of the Day</label>
                    <select
                      className="form-select"
                      value={resultForm.driverOfTheDay || ''}
                      onChange={e => setResultForm(prev => ({ ...prev, driverOfTheDay: e.target.value }))}
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          #{d.number} {d.firstName} {d.lastName} ({d.team})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Wildcard */}
                  <div>
                    <label className="form-label">Wild Card Outcome</label>
                    <select
                      className="form-select"
                      value={resultForm.wildCard || 'YES'}
                      onChange={e => setResultForm(prev => ({ ...prev, wildCard: e.target.value }))}
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  <Sparkles size={16} />
                  {processing ? 'COMPUTING ROUND SCORES...' : 'PUBLISH & CALCULATE SCORES'}
                </button>
              </form>
            )}
          </div>

          {/* Scoring Engine Live Log / Report */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Scoring Engine Output
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Idempotent calculation results, breakdown verification, and updated user scores.
            </p>

            {calcResult ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    background: 'rgba(0, 230, 118, 0.1)',
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--telemetry-green)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  ✓ Scored {calcResult.scoredCount} racer predictions for {calcResult.roundId}!
                </div>

                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {calcResult.scores.map((sc: any) => {
                    const u = allUsers.find(usr => usr.userId === sc.userId);
                    return (
                      <div
                        key={sc.userId}
                        style={{
                          background: 'var(--bg-input)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                            {u?.displayName || sc.userId}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            P1: {sc.breakdown.p1} • P2: {sc.breakdown.p2} • P3: {sc.breakdown.p3} • FL: {sc.breakdown.fastestLap} • Wild: {sc.breakdown.wildCard}
                            {sc.breakdown.perfectPodiumBonus ? ' • 🎯 Podium Bonus: +10' : ''}
                          </div>
                        </div>

                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-green)', fontSize: '1.1rem' }}>
                          +{sc.totalScore} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '3rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                Trigger score calculation on the left to view the live execution log.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RACE WEEKEND CREATOR */}
      {activeTab === 'weekends' && (
        <div style={{ maxWidth: '650px' }} className="race-card">
          <div style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Create New Race Weekend
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Add a Grand Prix to the championship calendar with normal or sprint format.
            </p>

            <form onSubmit={handleCreateWeekend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Grand Prix Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Belgian Grand Prix"
                  value={newWeekend.raceName}
                  onChange={e => setNewWeekend(prev => ({ ...prev, raceName: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Belgium"
                    value={newWeekend.country}
                    onChange={e => setNewWeekend(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Country Flag Emoji</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="🇧🇪"
                    value={newWeekend.flag}
                    onChange={e => setNewWeekend(prev => ({ ...prev, flag: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Circuit Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Circuit de Spa-Francorchamps"
                  value={newWeekend.circuit}
                  onChange={e => setNewWeekend(prev => ({ ...prev, circuit: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Weekend Format</label>
                <select
                  className="form-select"
                  value={newWeekend.weekendType}
                  onChange={e => setNewWeekend(prev => ({ ...prev, weekendType: e.target.value as WeekendType }))}
                >
                  <option value="NORMAL">Conventional Grand Prix (FP1, FP2, FP3, Quali, GP)</option>
                  <option value="SPRINT">Sprint Weekend Format (FP1, SQ, Sprint, Quali, GP)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Circuit Length (km)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="form-input"
                    value={newWeekend.circuitLengthKm}
                    onChange={e => setNewWeekend(prev => ({ ...prev, circuitLengthKm: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="form-label">Total Laps</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newWeekend.laps}
                    onChange={e => setNewWeekend(prev => ({ ...prev, laps: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button type="submit" disabled={processing} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <PlusCircle size={16} /> Create Race Weekend
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PREDICTION ROUNDS LIST */}
      {activeTab === 'rounds' && (
        <div className="race-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            All Configured Prediction Rounds ({rounds.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rounds.map(r => {
              const wk = weekends.find(w => w.raceWeekendId === r.raceWeekendId);
              return (
                <div
                  key={r.roundId}
                  style={{
                    background: 'var(--bg-input)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{wk?.flag || '🏁'}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        {wk?.raceName} — {r.title}
                      </span>
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      ID: {r.roundId} • Closes: {new Date(r.closesAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedRoundId(r.roundId);
                        setActiveTab('results');
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Enter Results & Score
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
