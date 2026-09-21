import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import {
  RaceWeekend,
  PredictionRound,
  Driver,
  WeekendType,
  RoundType,
  RoundStatus,
  User,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
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
  Users,
  Flag,
  Mail,
  Play,
  Trophy,
} from 'lucide-react';
import { raceWeekendApi } from '../api/raceWeekendApi';
import { SyncLog } from '../types';
import { testGrandPrixService, TEST_DRIVERS, TEST_GP_ID } from '../services/testGrandPrix/testGrandPrixService';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, isAuthenticated, allUsers, openLoginModal } = useAuth();
  const { showToast, triggerDataRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'results' | 'weekends' | 'rounds' | 'users' | 'testgp'>('sync');
  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Users state
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const fetchAdminUsers = async () => {
    if (!currentUser?.userId) return;
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const data = await api.getAdminUsers(currentUser.userId);
      setAdminUsers(data);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
      setUsersError(err.message || 'Failed to retrieve registered users directory.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Test Grand Prix State & Handlers
  const [testGpState, setTestGpState] = useState(testGrandPrixService.getState());
  const [testResultP1, setTestResultP1] = useState('test-alpha');
  const [testResultP2, setTestResultP2] = useState('test-bravo');
  const [testResultP3, setTestResultP3] = useState('test-charlie');
  const [testResultFastestLap, setTestResultFastestLap] = useState('test-alpha');
  const [testUserPickP1, setTestUserPickP1] = useState('test-alpha');
  const [testUserPickP2, setTestUserPickP2] = useState('test-bravo');
  const [testUserPickP3, setTestUserPickP3] = useState('test-charlie');
  const [testUserPickFastestLap, setTestUserPickFastestLap] = useState('test-alpha');

  const refreshTestGp = () => {
    setTestGpState(testGrandPrixService.getState());
  };

  const handleCreateTestGp = () => {
    try {
      testGrandPrixService.createTestGrandPrix(isAdmin);
      refreshTestGp();
      showToast('End-to-End Test Grand Prix initialized successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create Test GP', 'error');
    }
  };

  const handleOpenTestPrediction = () => {
    try {
      const registered = adminUsers.map(u => ({ userId: u.userId, email: u.email || `${u.userId}@thegrid.test`, name: u.displayName || u.username }));
      testGrandPrixService.openTestPrediction(isAdmin, registered);
      refreshTestGp();
      showToast('Test Grand Prix prediction opened and open-emails queued.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to open Test GP prediction', 'error');
    }
  };

  const handleSubmitUserTestPrediction = () => {
    try {
      const uid = currentUser?.userId || 'test_user_alpha';
      const name = currentUser?.displayName || 'Test Racer Alpha';
      const email = currentUser?.email || 'racer@thegrid.test';
      testGrandPrixService.submitTestPrediction(uid, name, email, {
        p1: testUserPickP1,
        p2: testUserPickP2,
        p3: testUserPickP3,
        fastestLap: testUserPickFastestLap,
      });
      refreshTestGp();
      showToast('Test prediction locked & confirmation email queued.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit test prediction', 'error');
    }
  };

  const handleEnterTestResult = (isAmended = false) => {
    try {
      testGrandPrixService.enterTestResult(isAdmin, {
        p1: testResultP1,
        p2: testResultP2,
        p3: testResultP3,
        fastestLap: testResultFastestLap,
      }, isAmended);
      refreshTestGp();
      showToast(`Test result ${isAmended ? 'amended' : 'entered'} successfully.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to enter test result', 'error');
    }
  };

  const handleRunTestScoring = () => {
    try {
      testGrandPrixService.runTestScoring(isAdmin);
      refreshTestGp();
      showToast('Test scoring engine executed. Scores & notifications updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to run test scoring', 'error');
    }
  };

  const [isProcessingEmails, setIsProcessingEmails] = useState(false);

  const handleProcessEmailQueue = async () => {
    try {
      setIsProcessingEmails(true);
      // 1. Process the in-memory/test queue first
      const pendingNotes = testGpState.notifications.filter(n => n.status !== 'SENT');
      const res = testGrandPrixService.processNotificationQueue();
      refreshTestGp();

      // 2. If there are notifications addressed to real email addresses (e.g. gmail.com), dispatch them via live backend!
      let liveSent = 0;
      let liveFailed = 0;

      for (const note of pendingNotes) {
        // Check if recipient is a real email (not @thegrid.test or @example.com)
        const isRealEmail = note.recipientEmail &&
          !note.recipientEmail.endsWith('@thegrid.test') &&
          !note.recipientEmail.endsWith('@example.com') &&
          note.recipientEmail.includes('@');

        if (isRealEmail) {
          let emailBody = `Hi ${note.recipientName || 'Racer'},\n\n`;
          if (note.notificationType === 'PREDICTION_OPEN') {
            emailBody += `Predictions are now officially OPEN for ${note.templateData?.raceName || 'The Grid Test Grand Prix'}!\n\n` +
              `Head over to The Grid to make your predictions:\n` +
              `https://hj1418.github.io/F1-Prediction-Wall/#/predictions\n\n` +
              `Warm regards,\nThe Grid Race Control`;
          } else if (note.notificationType === 'PREDICTION_CONFIRMATION') {
            emailBody += `Your predictions for ${note.templateData?.raceName || 'The Grid Test Grand Prix'} have been locked in!\n\n`;
            if (note.templateData?.predictionData) {
              const p = note.templateData.predictionData;
              emailBody += `Your Selections:\n` +
                `• P1 Winner: ${String(p.p1).toUpperCase()}\n` +
                `• P2 Runner-up: ${String(p.p2).toUpperCase()}\n` +
                `• P3 Third Place: ${String(p.p3).toUpperCase()}\n` +
                `• Fastest Lap: ${String(p.fastestLap).toUpperCase()}\n\n`;
            }
            emailBody += `Locked at: ${note.templateData?.lockedAt || new Date().toLocaleString()}\n` +
              `Warm regards,\nThe Grid Race Control`;
          } else if (note.notificationType === 'PREDICTION_RESULT') {
            emailBody += `Official results and scores are in for ${note.templateData?.raceName || 'The Grid Test Grand Prix'}!\n\n` +
              `Your Total Score: ${note.templateData?.totalScore || 0} PTS\n\n`;
            if (note.templateData?.breakdown) {
              emailBody += `Score Breakdown:\n`;
              for (const [k, v] of Object.entries(note.templateData.breakdown)) {
                emailBody += `• ${k}: +${v} pts\n`;
              }
              emailBody += '\n';
            }
            emailBody += `Check your rank on the leaderboard:\nhttps://hj1418.github.io/F1-Prediction-Wall/#/leaderboard\n\n` +
              `Warm regards,\nThe Grid Race Control`;
          }

          try {
            const dispatchRes = await api.sendDirectEmail({
              to: note.recipientEmail,
              subject: note.subject,
              body: emailBody,
              name: 'The Grid Race Control',
            });
            if (dispatchRes.success) {
              liveSent++;
            } else {
              liveFailed++;
              console.warn(`Failed to dispatch real email to ${note.recipientEmail}:`, dispatchRes.error);
            }
          } catch (liveErr) {
            liveFailed++;
            console.error(`Live dispatch error for ${note.recipientEmail}:`, liveErr);
          }
        }
      }

      if (liveSent > 0) {
        showToast(`Delivered ${res.sent} queue items (${liveSent} real emails dispatched to inbox via Google Apps Script).`, 'success');
      } else {
        showToast(`Notification worker finished: ${res.sent} sent, ${res.failed} failed.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to process notification queue', 'error');
    } finally {
      setIsProcessingEmails(false);
    }
  };

  const handleResetTestGp = () => {
    if (!window.confirm('Reset the Test Grand Prix? Only test data will be deleted; production remains untouched.')) {
      return;
    }
    try {
      testGrandPrixService.resetTestGrandPrix(isAdmin);
      refreshTestGp();
      showToast('Test Grand Prix has been completely reset.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset test Grand Prix', 'error');
    }
  };

  useEffect(() => {
    document.title = 'Race Control & Administration | The Grid';
  }, []);

  useEffect(() => {
    if (isAdmin && (activeTab === 'users' || adminUsers.length === 0)) {
      fetchAdminUsers();
    }
  }, [isAdmin, activeTab, currentUser?.userId]);

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

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
              THE GRID • RACE CONTROL & STEWARDS PANEL
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>
              Race Control
            </h1>
          </div>
        </div>

        {/* Admin authorization status pill */}
        <div>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--telemetry-green)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              <CheckCircle2 size={16} /> ADMIN PRIVILEGES VERIFIED ({currentUser?.displayName})
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={14} /> {!isAuthenticated ? 'Sign in as administrator required' : 'Current account does not have admin privileges'}
              </span>
              <button onClick={() => openLoginModal('/admin')} className="btn btn-primary btn-sm">
                Sign In as Admin
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

        <button
          onClick={() => setActiveTab('users')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'users' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'users' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          <Users size={14} /> Users
        </button>

        <button
          onClick={() => setActiveTab('testgp')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'testgp' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'testgp' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          <Flag size={14} /> 🏁 End-to-End Test Grand Prix
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
                  {(activeRound.predictionFields && activeRound.predictionFields.length > 0) ? (
                    activeRound.predictionFields.map(field => {
                      if (field.type === 'driver') {
                        return (
                          <div key={field.id}>
                            <label className="form-label">{field.label}</label>
                            <select
                              className="form-select"
                              value={resultForm[field.id] || ''}
                              onChange={e => setResultForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                            >
                              <option value="">Select Driver...</option>
                              {drivers.map(d => (
                                <option key={d.id} value={d.id}>
                                  #{d.number} {d.firstName} {d.lastName} ({d.team})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      // Option or boolean field (Safety Car, VSC, Red Flag, Wildcards, etc.)
                      return (
                        <div key={field.id}>
                          <label className="form-label">{field.label}</label>
                          <select
                            className="form-select"
                            value={resultForm[field.id] ?? (field.options?.[0]?.value || 'YES')}
                            onChange={e => setResultForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                          >
                            {(field.options || [
                              { value: 'YES', label: 'YES' },
                              { value: 'NO', label: 'NO' },
                            ]).map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })
                  ) : (
                    <>
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
                    </>
                  )}
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
      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="race-card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
                USERS
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
                Registered members on The Grid.
              </p>
            </div>

            {/* Small Context Summary: TOTAL USERS */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1rem',
                minWidth: '130px',
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                TOTAL USERS
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.1,
                }}
              >
                {adminUsers.length}
              </div>
            </div>
          </div>

          {!isAdmin ? (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>
                ADMINISTRATOR ACCESS REQUIRED
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                You must be authenticated with an ADMIN role account to view registered users.
              </div>
              <button onClick={() => openLoginModal('/admin')} className="btn btn-primary btn-sm">
                Sign In as Administrator
              </button>
            </div>
          ) : loadingUsers && adminUsers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              <div>Loading registered users directory from live database...</div>
            </div>
          ) : usersError ? (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={24} color="#f87171" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.5rem' }}>
                {usersError}
              </div>
              <button onClick={fetchAdminUsers} className="btn btn-outline btn-sm">
                <RotateCcw size={14} /> Retry Fetch
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Joined</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u, idx) => {
                    const isUserAdmin = u.role?.toLowerCase() === 'admin';
                    return (
                      <tr
                        key={u.userId || idx}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <UserInitialsAvatar
                              name={u.displayName || u.username}
                              imageUrl={u.avatarUrl}
                              size={32}
                              showBorder={false}
                            />
                            <div>
                              <div>{u.displayName || u.username || 'Anonymous Racer'}</div>
                              {u.username && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                  @{u.username}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {u.email || '—'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            className="status-pill"
                            style={{
                              background: isUserAdmin ? 'rgba(225, 6, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                              color: isUserAdmin ? 'var(--f1-red)' : 'var(--text-secondary)',
                              border: isUserAdmin ? '1px solid rgba(225, 6, 0, 0.4)' : '1px solid var(--border-subtle)',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {isUserAdmin ? 'ADMIN' : 'USER'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {formatDate(u.createdAt)}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {formatDateTime(u.lastLoginAt)}
                        </td>
                      </tr>
                    );
                  })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: END-TO-END TEST GRAND PRIX */}
      {activeTab === 'testgp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Card */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--telemetry-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    ISOLATED TEST HARNESS • ENVIRONMENT = TEST
                  </span>
                  <span style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--telemetry-cyan)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                    {TEST_GP_ID}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  The Grid Test Grand Prix
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '750px' }}>
                  A strictly sandboxed environment to verify the entire Prediction Bench lifecycle: 
                  <strong> Race Setup → Prediction Open → Lock → Submission Email → Official Result → Scoring → Leaderboard → Result Email → Reset</strong>.
                  Zero pollution into production leaderboards or active calendars.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button onClick={handleResetTestGp} className="btn btn-outline btn-sm" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}>
                  <RotateCcw size={14} /> RESET TEST GRAND PRIX
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Race Status</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: testGpState.weekend ? 'var(--telemetry-green)' : 'var(--text-muted)' }}>
                  {testGpState.weekend ? 'INITIALIZED' : 'NOT CREATED'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Prediction Round</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: testGpState.round?.status === 'OPEN' ? 'var(--telemetry-green)' : '#fff' }}>
                  {testGpState.round ? testGpState.round.status : 'NONE'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Official Result</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: testGpState.officialResult ? 'var(--telemetry-purple)' : 'var(--text-muted)' }}>
                  {testGpState.officialResult ? testGpState.officialResult.status : 'PENDING'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Locked Predictions</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {Object.keys(testGpState.predictions).length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Queued / Sent Emails</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {testGpState.notifications.length} / {testGpState.notificationLog.length}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Lifecycle Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Step 1 & 2: Race & Prediction Controls */}
            <div className="race-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Calendar size={18} color="var(--f1-red)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  1. Setup & Prediction Opening
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Create the isolated test weekend and open prediction window for test drivers.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCreateTestGp}
                  disabled={Boolean(testGpState.weekend)}
                  className="btn btn-primary btn-sm"
                  style={{ opacity: testGpState.weekend ? 0.6 : 1 }}
                >
                  <PlusCircle size={14} /> CREATE TEST GRAND PRIX
                </button>
                <button
                  onClick={handleOpenTestPrediction}
                  disabled={!testGpState.weekend || testGpState.round?.status === 'OPEN'}
                  className="btn btn-secondary btn-sm"
                  style={{ opacity: !testGpState.weekend || testGpState.round?.status === 'OPEN' ? 0.6 : 1 }}
                >
                  <Play size={14} /> OPEN TEST PREDICTION
                </button>
              </div>
            </div>

            {/* Step 3: Simulate User Prediction Submission */}
            <div className="race-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={18} color="var(--telemetry-green)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  2. User Prediction & Lock
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Pick test drivers, review selections, and lock prediction:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>P1 WINNER</label>
                  <select
                    value={testUserPickP1}
                    onChange={e => setTestUserPickP1(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>P2 RUNNER-UP</label>
                  <select
                    value={testUserPickP2}
                    onChange={e => setTestUserPickP2(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>P3 THIRD</label>
                  <select
                    value={testUserPickP3}
                    onChange={e => setTestUserPickP3(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>FASTEST LAP</label>
                  <select
                    value={testUserPickFastestLap}
                    onChange={e => setTestUserPickFastestLap(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSubmitUserTestPrediction}
                disabled={testGpState.round?.status !== 'OPEN'}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                🔒 LOCK TEST PREDICTION
              </button>
            </div>
          </div>

          {/* Section 2: Results & Scoring */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Enter Official Test Result */}
            <div className="race-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={18} color="var(--telemetry-purple)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  3. Enter Controlled Result
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Enter race finish positions to test scoring scenarios (perfect, partial, or amended):
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTUAL P1</label>
                  <select
                    value={testResultP1}
                    onChange={e => setTestResultP1(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTUAL P2</label>
                  <select
                    value={testResultP2}
                    onChange={e => setTestResultP2(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTUAL P3</label>
                  <select
                    value={testResultP3}
                    onChange={e => setTestResultP3(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTUAL FASTEST LAP</label>
                  <select
                    value={testResultFastestLap}
                    onChange={e => setTestResultFastestLap(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {TEST_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEnterTestResult(false)}
                  disabled={!testGpState.round}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  ENTER TEST RESULT
                </button>
                <button
                  onClick={() => handleEnterTestResult(true)}
                  disabled={!testGpState.officialResult}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  AMEND RESULT
                </button>
              </div>
            </div>

            {/* Run Scoring Engine */}
            <div className="race-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={18} color="var(--telemetry-yellow)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  4. Scoring & Leaderboard
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Run scoring using the production scoring rules. Scoring is idempotent (running twice does not double points).
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <button
                  onClick={handleRunTestScoring}
                  disabled={!testGpState.officialResult}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  RUN TEST SCORING
                </button>
                <button
                  onClick={handleProcessEmailQueue}
                  disabled={isProcessingEmails}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Mail size={14} /> {isProcessingEmails ? 'SENDING LIVE EMAILS...' : 'PROCESS EMAIL WORKER'}
                </button>
              </div>
              {Object.keys(testGpState.scores).length > 0 && (
                <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--telemetry-green)' }}>
                    Authoritative Scores Calculated:
                  </div>
                  {Object.entries(testGpState.scores).map(([uid, sc]) => (
                    <div key={uid} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span>User: {uid}</span>
                      <strong style={{ color: '#fff' }}>{sc.totalScore} PTS</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Isolated Notification Queue Inspector */}
          <div className="race-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="var(--telemetry-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  Test Email Pipeline & Idempotency Queue
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {testGpState.notifications.length} Items Enqueued • {testGpState.notificationLog.length} Delivered
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>TYPE</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>RECIPIENT</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>SUBJECT</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>IDEMPOTENCY KEY</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {testGpState.notifications.map(n => (
                    <tr key={n.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 800, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {n.notificationType}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>{n.recipientEmail}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>{n.subject}</td>
                      <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {n.idempotencyKey}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          background: n.status === 'SENT' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 184, 0, 0.15)',
                          color: n.status === 'SENT' ? 'var(--telemetry-green)' : 'var(--telemetry-yellow)',
                        }}>
                          {n.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {testGpState.notifications.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No test emails queued. Run steps above to trigger notifications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Isolated Test Leaderboard */}
          <div className="race-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} color="var(--telemetry-yellow)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  Isolated Test Leaderboard
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--telemetry-green)', fontWeight: 800 }}>
                100% ISOLATED FROM PRODUCTION
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem' }}>RANK</th>
                    <th style={{ padding: '0.6rem' }}>USER</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>POINTS</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>EXACT P1</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>PERFECT PODIUM</th>
                  </tr>
                </thead>
                <tbody>
                  {testGpState.leaderboard.map(e => (
                    <tr key={e.userId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>#{e.rank}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>{e.displayName}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)' }}>
                        {e.totalPoints} PTS
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>{e.exactP1Count}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>{e.perfectPodiumCount ? '🏆 YES' : '—'}</td>
                    </tr>
                  ))}
                  {testGpState.leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Test leaderboard empty. Submit test predictions and run test scoring.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
