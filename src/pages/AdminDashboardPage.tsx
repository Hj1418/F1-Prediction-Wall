import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import {
  RaceWeekend,
  PredictionRound,
  Driver,
  User,
  Prediction,
  LeaderboardEntry,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import {
  Shield,
  RefreshCw,
  Users,
  Eye,
  Trophy,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Search,
  Check,
  Calendar,
  Lock,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  X,
  Mail,
  Send,
} from 'lucide-react';
import { raceWeekendApi } from '../api/raceWeekendApi';
import { testGrandPrixService, TEST_DRIVERS, TEST_GP_ID, TEST_ROUND_ID } from '../services/testGrandPrix/testGrandPrixService';
import { isQualificationPredictionRound } from '../services/schedule/predictionRoundGenerator';
import {
  buildPredictionConfirmationEmail,
  buildPredictionResultEmail,
  buildPredictionOpenEmail,
} from '../services/notifications/emailTemplateBuilder';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, isAuthenticated, openLoginModal } = useAuth();
  const { showToast, triggerDataRefresh } = useApp();

  // Active section tab: strictly 5 sections
  const [activeTab, setActiveTab] = useState<'sync' | 'users' | 'predictions' | 'leaderboard' | 'testgp'>('sync');

  // Common metadata
  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // SECTION 1: CALENDAR SYNC STATE
  // --------------------------------------------------------------------------
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('thegrid_last_calendar_sync') || '22 Sep 2026, 10:42 AM';
  });

  const handleSyncCalendar = async () => {
    try {
      setIsSyncing(true);
      const res = await raceWeekendApi.syncSeasonCalendar(2026);
      const nowStr = new Date().toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastSyncTime(nowStr);
      localStorage.setItem('thegrid_last_calendar_sync', nowStr);

      const [wList, rList] = await Promise.all([
        api.getRaceWeekends(2026),
        api.getPredictionRounds(),
      ]);
      const raceRounds = rList.filter(r => !isQualificationPredictionRound(r));
      setWeekends(wList);
      setRounds(raceRounds);
      showToast(`Calendar synced: ${res.syncedCount || wList.length} Grands Prix up to date.`, 'success');
      triggerDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to sync calendar', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION 2: USERS STATE
  // --------------------------------------------------------------------------
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchAdminUsers = async () => {
    if (!currentUser?.userId) return;
    try {
      setLoadingUsers(true);
      const data = await api.getAdminUsers(currentUser.userId);
      setAdminUsers(data);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
      showToast(err.message || 'Failed to load user directory', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION 3: PREDICTIONS STATE
  // --------------------------------------------------------------------------
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [adminPredictions, setAdminPredictions] = useState<Prediction[]>([]);
  const [predictionSearchQuery, setPredictionSearchQuery] = useState('');
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const fetchPredictionsForRound = async (roundId: string) => {
    if (!roundId) return;
    try {
      setLoadingPredictions(true);
      const preds = await api.getAdminPredictions(roundId);
      setAdminPredictions(preds);
    } catch (err: any) {
      console.error('Failed to load predictions:', err);
      showToast('Failed to load predictions for this round', 'error');
    } finally {
      setLoadingPredictions(false);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION 4: LEADERBOARD STATE
  // --------------------------------------------------------------------------
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardSearchQuery, setLeaderboardSearchQuery] = useState('');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const entries = await api.getLeaderboard('season', '2026');
      setLeaderboard(entries);
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION 5: TEST GRAND PRIX STATE
  // --------------------------------------------------------------------------
  const [testGpState, setTestGpState] = useState(testGrandPrixService.getState());
  const [testResultModalOpen, setTestResultModalOpen] = useState(false);
  const [testResultP1, setTestResultP1] = useState('test-alpha');
  const [testResultP2, setTestResultP2] = useState('test-bravo');
  const [testResultP3, setTestResultP3] = useState('test-charlie');
  const [testResultFastestLap, setTestResultFastestLap] = useState('test-alpha');
  const [testResultSafetyCar, setTestResultSafetyCar] = useState('YES');
  const [testResultVirtualSafetyCar, setTestResultVirtualSafetyCar] = useState('NO');
  const [testResultRedFlag, setTestResultRedFlag] = useState('NO');
  const [testResultYellowFlag, setTestResultYellowFlag] = useState('YES');
  const [isAmendingResult, setIsAmendingResult] = useState(false);
  const [showTestLeaderboardModal, setShowTestLeaderboardModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isDispatchingEmails, setIsDispatchingEmails] = useState(false);

  const refreshTestGp = () => {
    setTestGpState(testGrandPrixService.getState());
  };

  const handleCreateTestGp = () => {
    try {
      testGrandPrixService.createTestGrandPrix(isAdmin);
      refreshTestGp();
      showToast('The Grid Test Grand Prix created successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create Test GP', 'error');
    }
  };

  const handleOpenTestPrediction = () => {
    try {
      const registered = adminUsers.map(u => ({
        userId: u.userId,
        email: u.email || `${u.userId}@thegrid.test`,
        name: u.displayName || u.username,
      }));
      testGrandPrixService.openTestPrediction(isAdmin, registered);
      refreshTestGp();
      showToast('Predictions opened for Test Grand Prix.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to open Test GP predictions', 'error');
    }
  };

  const handleSaveTestResult = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      testGrandPrixService.enterTestResult(
        isAdmin,
        {
          p1: testResultP1,
          p2: testResultP2,
          p3: testResultP3,
          fastestLap: testResultFastestLap,
          safetyCar: testResultSafetyCar,
          virtualSafetyCar: testResultVirtualSafetyCar,
          redFlag: testResultRedFlag,
          yellowFlag: testResultYellowFlag,
        },
        isAmendingResult
      );
      refreshTestGp();
      setTestResultModalOpen(false);
      showToast(isAmendingResult ? 'Test result amended successfully.' : 'Test result entered successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to enter test result', 'error');
    }
  };

  const handleRunTestScoring = () => {
    try {
      testGrandPrixService.runTestScoring(isAdmin);
      refreshTestGp();
      showToast('Test scoring engine executed. Stored scores and leaderboard updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to run test scoring', 'error');
    }
  };

  const handleResetTestGp = () => {
    try {
      testGrandPrixService.resetTestGrandPrix(isAdmin);
      refreshTestGp();
      setShowTestLeaderboardModal(false);
      setShowResetConfirmModal(false);
      showToast('Test Grand Prix reset successfully.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset test Grand Prix', 'error');
    }
  };

  const handleDispatchNotificationQueue = async () => {
    try {
      setIsDispatchingEmails(true);
      const pendingNotes = testGpState.notifications.filter(n => n.status !== 'SENT');
      const res = testGrandPrixService.processNotificationQueue();
      refreshTestGp();

      let liveSent = 0;
      for (const note of pendingNotes) {
        const isRealEmail =
          note.recipientEmail &&
          !note.recipientEmail.endsWith('@thegrid.test') &&
          !note.recipientEmail.endsWith('@example.com') &&
          note.recipientEmail.includes('@');

        if (isRealEmail) {
          try {
            let emailPayload = {
              subject: note.subject,
              body: `Hello ${note.recipientName},\n\nUpdate regarding ${note.templateData?.raceName || 'The Grid Test Grand Prix'}.\n\nWarm regards,\nThe Grid Race Control`,
              htmlBody: undefined as string | undefined,
            };

            if (note.notificationType === 'PREDICTION_CONFIRMATION') {
              const pData = note.templateData?.predictionData || {};
              const picks = [
                { position: '🥇 P1 Race Winner', driverName: getDriverName(pData.p1) },
                { position: '🥈 P2 Runner-Up', driverName: getDriverName(pData.p2) },
                { position: '🥉 P3 Third Place', driverName: getDriverName(pData.p3) },
                { position: '⚡ Fastest Lap', driverName: getDriverName(pData.fastestLap) },
              ];
              emailPayload = buildPredictionConfirmationEmail({
                recipientName: note.recipientName,
                roundTitle: note.templateData?.roundTitle || 'Race Prediction',
                raceName: note.templateData?.raceName || 'The Grid Test Grand Prix',
                picks,
                expectedResultsFormatted: 'Approx. 2 hours after race formation lap',
              });
            } else if (note.notificationType === 'PREDICTION_RESULT') {
              emailPayload = buildPredictionResultEmail({
                recipientName: note.recipientName,
                roundTitle: note.templateData?.roundTitle || 'Race Session',
                raceName: note.templateData?.raceName || 'The Grid Test Grand Prix',
                totalScore: note.templateData?.score ?? 0,
                breakdown: note.templateData?.breakdown || {},
              });
            } else if (note.notificationType === 'PREDICTION_OPEN') {
              emailPayload = buildPredictionOpenEmail({
                recipientName: note.recipientName,
                roundTitle: note.templateData?.roundTitle || 'Race Prediction',
                raceName: note.templateData?.raceName || 'The Grid Test Grand Prix',
                closesAtFormatted: note.templateData?.closesAt ? new Date(note.templateData.closesAt).toLocaleString() : 'At Formation Lap',
                expectedResultsFormatted: 'Approx. 2 hours after race start',
              });
            }

            await api.sendDirectEmail({
              to: note.recipientEmail,
              subject: emailPayload.subject,
              body: emailPayload.body,
              htmlBody: emailPayload.htmlBody,
              name: 'The Grid Race Control',
            });
            liveSent++;
          } catch (_err) {}
        }
      }

      if (liveSent > 0) {
        showToast(`Sent ${res.sent} queue notifications (${liveSent} real emails dispatched).`, 'success');
      } else {
        showToast(`Notification queue processed: ${res.sent} delivered.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to process email queue', 'error');
    } finally {
      setIsDispatchingEmails(false);
    }
  };

  // --------------------------------------------------------------------------
  // INITIAL DATA LOAD
  // --------------------------------------------------------------------------
  useEffect(() => {
    document.title = 'Admin Control Center | The Grid';
  }, []);

  useEffect(() => {
    async function initAdmin() {
      try {
        setLoading(true);
        const [wList, rList, dList] = await Promise.all([
          api.getRaceWeekends(2026),
          api.getPredictionRounds(),
          api.getDrivers(2026),
        ]);
        const raceRounds = rList.filter(r => !isQualificationPredictionRound(r));
        setWeekends(wList);
        setRounds(raceRounds);
        setDrivers(dList);

        if (raceRounds.length > 0 && (!selectedRoundId || isQualificationPredictionRound({ roundId: selectedRoundId }))) {
          const openOrFirst = raceRounds.find(r => r.status === 'OPEN') || raceRounds[0];
          setSelectedRoundId(openOrFirst.roundId);
          fetchPredictionsForRound(openOrFirst.roundId);
        }
      } catch (err) {
        console.error('Failed to initialize admin control data', err);
      } finally {
        setLoading(false);
      }
    }
    initAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === 'users' && adminUsers.length === 0) {
      fetchAdminUsers();
    }
    if (activeTab === 'leaderboard' && leaderboard.length === 0) {
      fetchLeaderboard();
    }
  }, [isAdmin, activeTab]);

  const handleSelectRound = (roundId: string) => {
    setSelectedRoundId(roundId);
    fetchPredictionsForRound(roundId);
  };

  const getDriverName = (driverId?: string): string => {
    if (!driverId) return '—';
    if (driverId.startsWith('test-')) {
      const match = TEST_DRIVERS.find(d => d.id === driverId);
      return match ? `${match.firstName} ${match.lastName}` : driverId;
    }
    const d = drivers.find(drv => drv.id === driverId);
    return d ? `${d.firstName} ${d.lastName}` : driverId;
  };

  const filteredUsers = adminUsers.filter(u => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.userId && u.userId.toLowerCase().includes(q))
    );
  });

  const filteredPredictions = adminPredictions.filter(p => {
    const q = predictionSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchedUser = adminUsers.find(u => u.userId === p.userId);
    const pData = p.predictionData || {};
    return (
      (matchedUser?.displayName && matchedUser.displayName.toLowerCase().includes(q)) ||
      (matchedUser?.username && matchedUser.username.toLowerCase().includes(q)) ||
      (matchedUser?.email && matchedUser.email.toLowerCase().includes(q)) ||
      p.userId.toLowerCase().includes(q) ||
      getDriverName(pData.p1).toLowerCase().includes(q) ||
      getDriverName(pData.p2).toLowerCase().includes(q) ||
      getDriverName(pData.p3).toLowerCase().includes(q) ||
      getDriverName(pData.fastestLap).toLowerCase().includes(q)
    );
  });

  const filteredLeaderboard = leaderboard.filter(e => {
    const q = leaderboardSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (e.displayName && e.displayName.toLowerCase().includes(q)) ||
      (e.username && e.username.toLowerCase().includes(q)) ||
      (e.userId && e.userId.toLowerCase().includes(q))
    );
  });

  const selectedRound = rounds.find(r => r.roundId === selectedRoundId);
  const selectedRoundWeekend = weekends.find(w => w.raceWeekendId === selectedRound?.raceWeekendId);
  const selectedRoundIsSprint = selectedRound?.roundType === 'SPRINT' || selectedRound?.roundId.includes('SPRINT');

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem' }}>
      {/* Header */}
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
              THE GRID • ADMIN CONTROL CENTER
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
              Admin Control Center
            </h1>
          </div>
        </div>

        {/* Authorization status pill */}
        <div>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--telemetry-green)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              <CheckCircle2 size={16} /> ADMIN PRIVILEGES VERIFIED ({currentUser?.displayName})
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={14} /> {!isAuthenticated ? 'Sign in required' : 'Admin authorization required'}
              </span>
              <button onClick={() => openLoginModal('/admin')} className="btn btn-primary btn-sm">
                Sign In as Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Five Major Admin Tabs */}
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
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> 1. CALENDAR SYNC
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'users' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'users' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <Users size={14} /> 2. USERS
        </button>

        <button
          onClick={() => setActiveTab('predictions')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'predictions' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'predictions' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <Eye size={14} /> 3. PREDICTIONS
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'leaderboard' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'leaderboard' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <Trophy size={14} /> 4. LEADERBOARD
        </button>

        <button
          onClick={() => setActiveTab('testgp')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'testgp' ? 'var(--f1-red)' : 'transparent',
            color: activeTab === 'testgp' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <Flag size={14} /> 5. TEST GRAND PRIX
        </button>
      </div>

      {/* ===================================================================
          TAB 1: CALENDAR SYNC
          =================================================================== */}
      {activeTab === 'sync' && (
        <div style={{ maxWidth: '680px' }} className="animate-fade-in">
          <div className="race-card" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              CALENDAR SYNC
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Last synced:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                {lastSyncTime}
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <button
                type="button"
                onClick={handleSyncCalendar}
                disabled={isSyncing || !isAdmin}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'SYNCING CALENDAR...' : 'SYNC CALENDAR'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Status:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-green)', fontWeight: 800, fontSize: '0.95rem' }}>
                <Check size={18} /> Up to date
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Season 2026 • {weekends.length} Grands Prix registered
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: USERS
          =================================================================== */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          {/* Search bar & Filter telemetry */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="pitwall-search-box" style={{ maxWidth: '460px', width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search users by name, username or email..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setUserSearchQuery('');
                }}
                className="pitwall-search-input"
                autoComplete="off"
                spellCheck={false}
              />
              {userSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery('')}
                  className="pitwall-search-clear"
                  title="Clear search (Esc)"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              ) : (
                <span className="pitwall-search-badge" title="Press Escape to clear">
                  ESC
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className={`pitwall-search-badge ${userSearchQuery ? 'active' : ''}`}>
                {userSearchQuery ? `${filteredUsers.length} of ${adminUsers.length} MATCHED` : `${adminUsers.length} REGISTERED`}
              </span>
            </div>
          </div>

          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Registered Users Directory ({filteredUsers.length})
              </div>
              <button onClick={fetchAdminUsers} disabled={loadingUsers} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                <RefreshCw size={12} className={loadingUsers ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th style={{ textAlign: 'center' }}>JOINED</th>
                    <th style={{ textAlign: 'center' }}>PREDICTIONS</th>
                    <th style={{ textAlign: 'right' }}>TOTAL POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.userId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <UserInitialsAvatar name={u.displayName || u.username} imageUrl={u.avatarUrl} size={28} showBorder={false} />
                          <div>
                            <div style={{ fontWeight: 800, color: '#ffffff' }}>{u.displayName || u.username}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: u.role === 'admin' ? 'rgba(225, 6, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: u.role === 'admin' ? 'var(--f1-red)' : 'var(--text-secondary)',
                            border: u.role === 'admin' ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                          }}
                        >
                          {String(u.role).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {u.racesParticipated || 0}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)', fontSize: '1rem' }}>
                        {u.totalPoints || 0} PTS
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {loadingUsers ? 'Loading registered users...' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: PREDICTIONS
          =================================================================== */}
      {activeTab === 'predictions' && (
        <div className="animate-fade-in">
          {/* Race Selection Header */}
          <div className="race-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SELECT GRAND PRIX
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <select
                  value={selectedRoundId}
                  onChange={e => handleSelectRound(e.target.value)}
                  className="input-field"
                  style={{ minWidth: '340px', fontWeight: 700 }}
                >
                  {rounds
                    .filter(r => !isQualificationPredictionRound(r))
                    .map(r => {
                      const matchedWeekend = weekends.find(w => w.raceWeekendId === r.raceWeekendId);
                      const isSprint = r.roundType === 'SPRINT' || r.roundId.includes('SPRINT');
                      const sessionLabel = isSprint ? 'Sprint Race Prediction' : 'Grand Prix Prediction';
                      const weekendLabel = matchedWeekend ? (matchedWeekend.raceName || matchedWeekend.country) : '';
                      const displayTitle = weekendLabel ? `${weekendLabel} — ${sessionLabel}` : `${r.title || sessionLabel}`;

                      return (
                        <option key={r.roundId} value={r.roundId}>
                          {displayTitle} ({r.status})
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            {selectedRound && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round Status:</span>
                <StatusBadge status={selectedRound.status} size="sm" />
              </div>
            )}
          </div>

          {/* Search filter for predictions */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="pitwall-search-box" style={{ maxWidth: '460px', width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search predictions by user or driver..."
                value={predictionSearchQuery}
                onChange={e => setPredictionSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setPredictionSearchQuery('');
                }}
                className="pitwall-search-input"
                autoComplete="off"
                spellCheck={false}
              />
              {predictionSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setPredictionSearchQuery('')}
                  className="pitwall-search-clear"
                  title="Clear search (Esc)"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              ) : (
                <span className="pitwall-search-badge" title="Press Escape to clear">
                  ESC
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className={`pitwall-search-badge ${predictionSearchQuery ? 'active' : ''}`}>
                {predictionSearchQuery ? `${filteredPredictions.length} of ${adminPredictions.length} MATCHED` : `${adminPredictions.length} PREDICTIONS`}
              </span>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                User Predictions for {selectedRoundWeekend ? `${selectedRoundWeekend.raceName} (${selectedRoundIsSprint ? 'Sprint Race' : 'Main Grand Prix'})` : selectedRound?.title || 'Selected Race'} ({filteredPredictions.length})
              </div>
              <button onClick={() => fetchPredictionsForRound(selectedRoundId)} disabled={loadingPredictions} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                <RefreshCw size={12} className={loadingPredictions ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>PREDICTION DETAILS</th>
                    <th style={{ textAlign: 'center' }}>STATUS</th>
                    <th style={{ textAlign: 'center' }}>SUBMITTED AT</th>
                    <th style={{ textAlign: 'right' }}>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map(p => {
                    const matchedUser = adminUsers.find(u => u.userId === p.userId);
                    const pData = p.predictionData || {};

                    return (
                      <tr key={p.predictionId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <UserInitialsAvatar name={matchedUser?.displayName || p.userId} imageUrl={matchedUser?.avatarUrl} size={28} showBorder={false} />
                            <div>
                              <div style={{ fontWeight: 800, color: '#ffffff' }}>{matchedUser?.displayName || p.userId}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                @{matchedUser?.username || p.userId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
                            <span><strong>P1:</strong> {getDriverName(pData.p1)}</span>
                            <span><strong>P2:</strong> {getDriverName(pData.p2)}</span>
                            <span><strong>P3:</strong> {getDriverName(pData.p3)}</span>
                            {pData.fastestLap && <span><strong>FL:</strong> {getDriverName(pData.fastestLap)}</span>}
                            {pData.safetyCar && <span><strong>SC:</strong> {pData.safetyCar}</span>}
                            {pData.virtualSafetyCar && <span><strong>VSC:</strong> {pData.virtualSafetyCar}</span>}
                            {pData.redFlag && <span><strong>Red Flag:</strong> {pData.redFlag}</span>}
                            {pData.yellowFlag && <span><strong>Yellow Flag:</strong> {pData.yellowFlag}</span>}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)' }}>
                            LOCKED 🔒
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {p.submittedAt ? new Date(p.submittedAt).toLocaleString() : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', color: selectedRound?.status === 'SCORED' ? 'var(--telemetry-green)' : 'var(--text-muted)' }}>
                          {selectedRound?.status === 'SCORED' ? 'SCORED' : 'PENDING'}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPredictions.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loadingPredictions
                          ? 'Loading user predictions...'
                          : predictionSearchQuery
                          ? `No predictions found matching "${predictionSearchQuery}".`
                          : 'No user predictions recorded yet for this race.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: LEADERBOARD
          =================================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="animate-fade-in">
          {/* Search bar & Filter telemetry */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="pitwall-search-box" style={{ maxWidth: '460px', width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search leaderboard by racer name or username..."
                value={leaderboardSearchQuery}
                onChange={e => setLeaderboardSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setLeaderboardSearchQuery('');
                }}
                className="pitwall-search-input"
                autoComplete="off"
                spellCheck={false}
              />
              {leaderboardSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setLeaderboardSearchQuery('')}
                  className="pitwall-search-clear"
                  title="Clear search (Esc)"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              ) : (
                <span className="pitwall-search-badge" title="Press Escape to clear">
                  ESC
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className={`pitwall-search-badge ${leaderboardSearchQuery ? 'active' : ''}`}>
                {leaderboardSearchQuery ? `${filteredLeaderboard.length} of ${leaderboard.length} MATCHED` : `${leaderboard.length} STANDINGS`}
              </span>
            </div>
          </div>

          <div className="race-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  2026 WORLD CHAMPIONSHIP
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff' }}>
                  Authoritative Leaderboard
                </div>
              </div>
              <button onClick={fetchLeaderboard} disabled={loadingLeaderboard} className="btn btn-outline btn-sm">
                <RefreshCw size={12} className={loadingLeaderboard ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="timing-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>RANK</th>
                    <th>USER</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>PREDICTIONS</th>
                    <th style={{ width: '200px', textAlign: 'right', paddingRight: '2rem' }}>TOTAL POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map(entry => (
                    <tr key={entry.userId}>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 900,
                            fontSize: '1rem',
                            color:
                              entry.rank === 1
                                ? 'var(--telemetry-yellow)'
                                : entry.rank === 2
                                ? '#cbd5e1'
                                : entry.rank === 3
                                ? '#d97706'
                                : 'var(--text-secondary)',
                          }}
                        >
                          {entry.rank === 1 && <span>🥇</span>}
                          {entry.rank === 2 && <span>🥈</span>}
                          {entry.rank === 3 && <span>🥉</span>}
                          <span>{entry.rank}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <UserInitialsAvatar name={entry.displayName || entry.username} imageUrl={entry.avatarUrl} size={28} showBorder={false} />
                          <div>
                            <div style={{ fontWeight: 800, color: '#ffffff' }}>{entry.displayName || entry.username}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{entry.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {entry.racesParticipated || 0}
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                        {entry.totalPoints} PTS
                      </td>
                    </tr>
                  ))}
                  {filteredLeaderboard.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loadingLeaderboard
                          ? 'Loading production leaderboard...'
                          : leaderboardSearchQuery
                          ? `No leaderboard entries found matching "${leaderboardSearchQuery}".`
                          : 'No leaderboard scores recorded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 5: TEST GRAND PRIX
          =================================================================== */}
      {activeTab === 'testgp' && (
        <div className="animate-fade-in" style={{ maxWidth: '780px' }}>
          {/* Main Test GP Card */}
          <div className="race-card" style={{ padding: '2rem', border: '1px solid rgba(0, 210, 255, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--telemetry-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  TEST GRAND PRIX
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0 0', color: '#ffffff' }}>
                  The Grid Test Grand Prix
                </h2>
              </div>
              <span
                style={{
                  background: 'rgba(0, 210, 255, 0.15)',
                  color: 'var(--telemetry-cyan)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                }}
              >
                ISOLATED TEST SANDBOX
              </span>
            </div>

            {/* Current State Indicator */}
            <div style={{ background: 'var(--bg-input)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status:</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
                {!testGpState.weekend
                  ? 'Not Created'
                  : testGpState.round?.status === 'UPCOMING'
                  ? 'Created (Prediction Not Open)'
                  : testGpState.round?.status === 'OPEN'
                  ? 'Prediction Open'
                  : testGpState.round?.status === 'SCORED'
                  ? 'Race Scored (Completed)'
                  : testGpState.officialResult
                  ? 'Result Entered (Awaiting Scoring)'
                  : 'Prediction Locked'}
              </div>

              {testGpState.weekend && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>Predictions Submitted: <strong style={{ color: '#fff' }}>{Object.keys(testGpState.predictions).length}</strong></div>
                  <div>Official Result: <strong style={{ color: '#fff' }}>{testGpState.officialResult ? 'Entered' : 'Pending'}</strong></div>
                  <div>Scored: <strong style={{ color: '#fff' }}>{Object.keys(testGpState.scores).length} users</strong></div>
                </div>
              )}
            </div>

            {/* State-Based Action Controls (Strictly Showing Relevant Buttons for Current State) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              {/* 1. Before creation */}
              {!testGpState.weekend && (
                <button
                  type="button"
                  onClick={handleCreateTestGp}
                  className="btn btn-primary"
                  style={{ textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.04em' }}
                >
                  [ CREATE TEST GRAND PRIX ]
                </button>
              )}

              {/* 2. After creation: Open Predictions */}
              {testGpState.weekend && testGpState.round?.status === 'UPCOMING' && (
                <button
                  type="button"
                  onClick={handleOpenTestPrediction}
                  className="btn btn-primary"
                  style={{ textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.04em' }}
                >
                  [ OPEN PREDICTIONS ]
                </button>
              )}

              {/* 3. Once predictions are open or locked (before scoring): Enter Result */}
              {testGpState.weekend && testGpState.round && testGpState.round.status !== 'UPCOMING' && !testGpState.officialResult && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAmendingResult(false);
                    setTestResultModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.04em' }}
                >
                  [ ENTER RESULT ]
                </button>
              )}

              {/* 4. After result is entered, but not scored: Score Race */}
              {testGpState.officialResult && testGpState.round?.status !== 'SCORED' && (
                <button
                  type="button"
                  onClick={handleRunTestScoring}
                  className="btn btn-primary"
                  style={{ textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.04em' }}
                >
                  [ SCORE RACE ]
                </button>
              )}

              {/* 5. After scoring: View Test Leaderboard & Amend Result */}
              {testGpState.round?.status === 'SCORED' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowTestLeaderboardModal(true)}
                    className="btn btn-primary"
                    style={{ textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.04em' }}
                  >
                    [ VIEW TEST LEADERBOARD ]
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAmendingResult(true);
                      setTestResultModalOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}
                  >
                    [ AMEND RESULT ]
                  </button>
                </>
              )}

              {/* Reset is available whenever a Test GP exists */}
              {testGpState.weekend && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="btn btn-outline"
                  style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', borderColor: '#f87171', color: '#f87171' }}
                >
                  [ RESET TEST GRAND PRIX ]
                </button>
              )}
            </div>

            {/* Email Notification Queue Helper */}
            {testGpState.notifications.length > 0 && (
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Notification Queue: <strong style={{ color: '#fff' }}>{testGpState.notifications.filter(n => n.status !== 'SENT').length} pending</strong> / {testGpState.notifications.length} total
                </div>
                <button
                  type="button"
                  onClick={handleDispatchNotificationQueue}
                  disabled={isDispatchingEmails}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', gap: '0.35rem' }}
                >
                  <Send size={12} className={isDispatchingEmails ? 'animate-spin' : ''} />
                  Process Email Queue
                </button>
              </div>
            )}
          </div>

          {/* Result Entry Modal */}
          {testResultModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1.5rem',
              }}
            >
              <div
                className="race-card animate-scale-in"
                style={{
                  maxWidth: '480px',
                  width: '100%',
                  padding: '2rem',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                    {isAmendingResult ? 'Amend Race Result' : 'Enter Official Result'}
                  </h3>
                  <button onClick={() => setTestResultModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveTestResult}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      P1 Winner
                    </label>
                    <select value={testResultP1} onChange={e => setTestResultP1(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      {TEST_DRIVERS.map(d => (
                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      P2 Runner-up
                    </label>
                    <select value={testResultP2} onChange={e => setTestResultP2(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      {TEST_DRIVERS.map(d => (
                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      P3 Third Place
                    </label>
                    <select value={testResultP3} onChange={e => setTestResultP3(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      {TEST_DRIVERS.map(d => (
                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Fastest Lap
                    </label>
                    <select value={testResultFastestLap} onChange={e => setTestResultFastestLap(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      {TEST_DRIVERS.map(d => (
                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Safety Car Deployed?
                    </label>
                    <select value={testResultSafetyCar} onChange={e => setTestResultSafetyCar(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      <option value="YES">Yes — Safety Car Deployed</option>
                      <option value="NO">No — No Safety Car</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Virtual Safety Car (VSC)?
                    </label>
                    <select value={testResultVirtualSafetyCar} onChange={e => setTestResultVirtualSafetyCar(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      <option value="YES">Yes — VSC Deployed</option>
                      <option value="NO">No — No VSC</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Red Flag Stoppage?
                    </label>
                    <select value={testResultRedFlag} onChange={e => setTestResultRedFlag(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      <option value="YES">Yes — Red Flag Stoppage</option>
                      <option value="NO">No — No Red Flag</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Yellow Flag Caution?
                    </label>
                    <select value={testResultYellowFlag} onChange={e => setTestResultYellowFlag(e.target.value)} className="input-field" style={{ width: '100%' }}>
                      <option value="YES">Yes — Yellow Flag Waved</option>
                      <option value="NO">No — Clean Green Flag</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setTestResultModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Result
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Test Leaderboard Modal */}
          {showTestLeaderboardModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1.5rem',
              }}
            >
              <div
                className="race-card animate-scale-in"
                style={{
                  maxWidth: '560px',
                  width: '100%',
                  padding: '2rem',
                  border: '1px solid rgba(0, 210, 255, 0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--telemetry-cyan)', textTransform: 'uppercase' }}>
                      ISOLATED TEST STANDINGS
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.15rem 0 0 0' }}>
                      TEST GRAND PRIX LEADERBOARD
                    </h3>
                  </div>
                  <button onClick={() => setShowTestLeaderboardModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <table className="timing-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>RANK</th>
                        <th>USER</th>
                        <th style={{ textAlign: 'right' }}>POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testGrandPrixService.getTestLeaderboard().map(entry => (
                        <tr key={entry.userId}>
                          <td style={{ textAlign: 'center', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                            {entry.rank}
                          </td>
                          <td style={{ fontWeight: 800, color: '#ffffff' }}>
                            {entry.displayName}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)' }}>
                            {entry.totalPoints} PTS
                          </td>
                        </tr>
                      ))}
                      {testGrandPrixService.getTestLeaderboard().length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            No scores recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => setShowTestLeaderboardModal(false)} className="btn btn-secondary btn-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Reset Confirmation Modal */}
          {showResetConfirmModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1.5rem',
              }}
              onClick={() => setShowResetConfirmModal(false)}
            >
              <div
                className="race-card animate-scale-in"
                style={{
                  maxWidth: '460px',
                  width: '100%',
                  padding: '2rem',
                  border: '1px solid rgba(225, 6, 0, 0.4)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(225, 6, 0, 0.25)',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(225, 6, 0, 0.12)',
                      border: '1px solid rgba(225, 6, 0, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={22} color="var(--f1-red)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      SANDBOX SIMULATION RESET
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                      Reset Test Grand Prix?
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                  Only isolated test data will be cleared (test race, simulated predictions, and test leaderboard).
                  Production calendar, user records, and season standings remain <strong style={{ color: 'var(--telemetry-green)' }}>100% untouched</strong>.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTestGp}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, var(--f1-red), #990000)',
                      boxShadow: '0 4px 15px -3px rgba(225, 6, 0, 0.5)',
                    }}
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
