import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';
import { User, Achievement, Driver, Constructor, WeekendTrophy } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { F1_CONSTRUCTORS_2026 } from '../services/mockData';
import { CHAMPIONSHIPS_REGISTRY } from '../services/motorsport/motorsportRegistry';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import { PredictionSpeedometer } from '../components/predictions/PredictionSpeedometer';
import { testGrandPrixService } from '../services/testGrandPrix/testGrandPrixService';
import { calculateUserStatsFromHistory } from '../utils/predictionScoring';
import {
  Trophy,
  TrendingUp,
  Target,
  Sparkles,
  Edit2,
  ChevronRight,
  Share2,
  Medal,
  Award,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { StoryShareModal } from '../components/sharing/StoryShareModal';
import { PasswordSetupModal } from '../components/auth/PasswordSetupModal';
import { PointsBreakdownModal } from '../components/predictions/PointsBreakdownModal';
import { notificationService } from '../services/notificationService';
import { CANONICAL_ACHIEVEMENT_REGISTRY } from '../services/achievementRegistry';
import { generateUserResultStoryCanvas } from '../services/sharing/storyShareService';
import { quizService } from '../services/quiz/quizService';
import { QuizAttemptRecord, UserQuizAchievement, QuizPerformanceSummary } from '../types/quiz';
import { getTierDetails, getQuizCategory } from '../services/quiz/quizRegistry';
import { Brain, Compass } from 'lucide-react';

const GLOBAL_CONSTRUCTORS_LIST = [
  ...F1_CONSTRUCTORS_2026.map(c => ({ ...c, series: 'Formula 1' })),
  { id: 'ducati', name: 'Ducati Lenovo Team', country: 'Italy', flag: '🇮🇹', color: '#dc2626', series: 'MotoGP' },
  { id: 'ktm', name: 'Red Bull KTM Factory Racing', country: 'Austria', flag: '🇦🇹', color: '#ea580c', series: 'MotoGP' },
  { id: 'aprilia', name: 'Aprilia Racing', country: 'Italy', flag: '🇮🇹', color: '#10b981', series: 'MotoGP' },
  { id: 'yamaha', name: 'Monster Energy Yamaha MotoGP', country: 'Japan', flag: '🇯🇵', color: '#002b49', series: 'MotoGP' },
  { id: 'honda', name: 'Repsol Honda Team', country: 'Japan', flag: '🇯🇵', color: '#f97316', series: 'MotoGP' },
  { id: 'ferrari-af-corse', name: 'Ferrari AF Corse (499P)', country: 'Italy', flag: '🇮🇹', color: '#dc2626', series: 'FIA WEC Hypercar' },
  { id: 'toyota-gazoo', name: 'Toyota Gazoo Racing (GR010)', country: 'Japan', flag: '🇯🇵', color: '#ffffff', series: 'FIA WEC Hypercar' },
  { id: 'porsche-penske', name: 'Porsche Penske Motorsport (963)', country: 'Germany', flag: '🇩🇪', color: '#d97706', series: 'FIA WEC Hypercar' },
  { id: 'cadillac-wec', name: 'Cadillac Racing (V-Series.R)', country: 'USA', flag: '🇺🇸', color: '#eab308', series: 'FIA WEC Hypercar' },
];

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentUser, allUsers, isLoadingAuth, updateProfile, openLoginModal } = useAuth();
  const { showToast } = useApp();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingFavDriver, setIsEditingFavDriver] = useState(false);
  const [selectedFavDriver, setSelectedFavDriver] = useState('');
  const [isEditingFavConstructor, setIsEditingFavConstructor] = useState(false);
  const [selectedFavConstructor, setSelectedFavConstructor] = useState('');
  const [isEditingFavChampionship, setIsEditingFavChampionship] = useState(false);
  const [selectedFavChampionship, setSelectedFavChampionship] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [selectedBio, setSelectedBio] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPasswordSetupOpen, setIsPasswordSetupOpen] = useState(false);
  const [trophies, setTrophies] = useState<WeekendTrophy[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>([]);
  const [quizAchievements, setQuizAchievements] = useState<UserQuizAchievement[]>([]);
  const [quizSummary, setQuizSummary] = useState<QuizPerformanceSummary | null>(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [selectedBreakdownItem, setSelectedBreakdownItem] = useState<any | null>(null);
  const [shareModalTitle, setShareModalTitle] = useState('');
  const [shareModalCanvas, setShareModalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [shareModalFilename, setShareModalFilename] = useState('');
  const [shareModalText, setShareModalText] = useState('');

  const handleShareMyResult = () => {
    if (!profileUser) return;
    try {
      // Find latest scored prediction from history
      const scoredPredictions = history.filter(h => h.score && (typeof h.score.totalScore === 'number' || typeof h.pointsEarned === 'number'));
      const latestScored = scoredPredictions[0];

      if (latestScored) {
        const eventName = latestScored.weekend?.raceName || latestScored.round?.title || 'Grand Prix Prediction';
        const pointsEarned = latestScored.score?.totalScore ?? latestScored.pointsEarned ?? 0;
        const canvas = generateUserResultStoryCanvas({
          username: profileUser.username,
          eventName,
          pointsEarned,
          rank: profileUser.seasonRank,
          season: 2026,
          totalPoints: profileUser.totalPoints,
          isSeasonSummary: false,
        });

        setShareModalCanvas(canvas);
        setShareModalTitle(`Share ${eventName} Result`);
        setShareModalFilename(`the-grid-${profileUser.username}-result.png`);
        setShareModalText(`I scored +${pointsEarned} PTS in the ${eventName} on The Grid!`);
      } else {
        // No scored predictions yet: share authentic Championship Standing summary
        const canvas = generateUserResultStoryCanvas({
          username: profileUser.username,
          eventName: '2026 World Championship',
          pointsEarned: profileUser.totalPoints || 0,
          rank: profileUser.seasonRank || 1,
          season: 2026,
          totalPoints: profileUser.totalPoints || 0,
          racesParticipated: profileUser.racesParticipated || 0,
          isSeasonSummary: true,
        });

        setShareModalCanvas(canvas);
        setShareModalTitle('Share My Championship Standing');
        setShareModalFilename(`the-grid-${profileUser.username}-standing.png`);
        setShareModalText(`I am ranked P${profileUser.seasonRank || 1} with ${profileUser.totalPoints || 0} PTS in the 2026 Championship on The Grid!`);
      }
      setIsShareModalOpen(true);
    } catch (e: any) {
      showToast(e.message || 'Failed to generate story', 'error');
    }
  };

  const handleShareSpecificResult = (item: any) => {
    if (!profileUser) return;
    try {
      const eventName = item.weekend?.raceName || item.round?.title || 'Grand Prix Prediction';
      const pts = item.score?.totalScore ?? item.pointsEarned ?? 0;
      const canvas = generateUserResultStoryCanvas({
        username: profileUser.username,
        eventName,
        pointsEarned: pts,
        rank: profileUser.seasonRank,
        season: 2026,
        totalPoints: profileUser.totalPoints,
        isSeasonSummary: false,
      });

      setShareModalCanvas(canvas);
      setShareModalTitle(`Share ${eventName} Result`);
      setShareModalFilename(`the-grid-${profileUser.username}-${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`);
      setShareModalText(`I scored ${pts >= 0 ? `+${pts}` : pts} PTS in the ${eventName} on The Grid!`);
      setIsShareModalOpen(true);
    } catch (e: any) {
      showToast(e.message || 'Failed to generate story', 'error');
    }
  };

  useEffect(() => {
    if (!isEditingUsername) return;
    const raw = newUsername.trim();
    if (!raw) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username cannot be empty');
      return;
    }
    if (raw.length < 3 || raw.length > 20) {
      setUsernameStatus('invalid');
      setUsernameMessage('Must be 3 to 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Letters, numbers, _, - only');
      return;
    }
    if (raw.toLowerCase() === (currentUser?.username || '').toLowerCase()) {
      setUsernameStatus('available');
      setUsernameMessage('Current username');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(raw, currentUser?.userId);
        if (res.available) {
          setUsernameStatus('available');
          setUsernameMessage('Username available');
        } else {
          setUsernameStatus('unavailable');
          setUsernameMessage(res.reason || 'Username already taken');
        }
      } catch {
        setUsernameStatus('unavailable');
        setUsernameMessage('Could not verify availability');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [newUsername, isEditingUsername, currentUser?.userId, currentUser?.username]);

  const handleSaveUsername = async () => {
    const clean = newUsername.trim();
    if (!clean || usernameStatus !== 'available') return;
    try {
      await updateProfile({ username: clean });
      setProfileUser(prev => prev ? { ...prev, username: clean } : null);
      setIsEditingUsername(false);
      showToast('Username updated successfully!', 'success');
      navigate(`/profile/${clean}`, { replace: true });
    } catch (e: any) {
      showToast(e?.message || 'Failed to update username', 'error');
    }
  };

  useEffect(() => {
    async function loadProfile() {
      // If auth is still restoring and route has no explicit username, wait for auth to finish
      if (!username && isLoadingAuth) {
        return;
      }

      try {
        setLoading(true);
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) {
          setProfileUser(null);
          setLoading(false);
          return;
        }

        const isSelf = Boolean(
          currentUser && (
            (currentUser.username && currentUser.username.toLowerCase() === targetUsername.toLowerCase()) ||
            currentUser.userId === targetUsername
          )
        );

        // Optimistically set profileUser from currentUser if viewing own profile so user never sees a blank or missing screen
        if (isSelf && currentUser) {
          setProfileUser(currentUser);
          setSelectedFavDriver(currentUser.favouriteDriver || '');
          setSelectedFavConstructor(currentUser.favouriteConstructor || 'ferrari');
          setSelectedFavChampionship(currentUser.favouriteChampionship || 'f1');
          setSelectedBio(currentUser.bio || '');
        }

        const [u, dList, seasonStandings] = await Promise.all([
          api.getUserProfile(targetUsername).catch(() => null),
          api.getDrivers().catch(() => []),
          api.getLeaderboard('season').catch(() => []),
        ]);

        let effectiveUser = u;

        // Fallback 1: If current user matches target, use currentUser
        if (!effectiveUser && isSelf && currentUser) {
          effectiveUser = currentUser;
        }

        // Fallback 2: Check season standings
        if (!effectiveUser) {
          const lbMatch = (seasonStandings || []).find(
            e => e.userId === targetUsername ||
                 (e.username && e.username.toLowerCase() === targetUsername.toLowerCase()) ||
                 (e.displayName && e.displayName.toLowerCase() === targetUsername.toLowerCase())
          );
          if (lbMatch) {
            effectiveUser = {
              userId: lbMatch.userId,
              username: lbMatch.username || targetUsername,
              displayName: lbMatch.displayName || lbMatch.username || targetUsername,
              email: `${lbMatch.userId}@thegrid.mock`,
              avatarUrl: lbMatch.avatarUrl || '',
              favouriteDriver: lbMatch.favouriteDriver || 'norris',
              role: 'user',
              totalPoints: lbMatch.totalPoints || 0,
              seasonRank: lbMatch.rank || 1,
              previousRank: lbMatch.previousRank || lbMatch.rank || 1,
              racesParticipated: lbMatch.racesParticipated || 0,
              exactP1Count: lbMatch.exactP1Count || 0,
              perfectPodiumCount: lbMatch.perfectPodiumCount || 0,
              wildcardsCorrect: 0,
              bestWeekendScore: lbMatch.totalPoints || 0,
              createdAt: new Date().toISOString(),
            };
          }
        }

        // Fallback 3: Check allUsers from auth directory
        if (!effectiveUser && allUsers && allUsers.length > 0) {
          const matchedUser = allUsers.find(
            a => a.userId === targetUsername ||
                 (a.username && a.username.toLowerCase() === targetUsername.toLowerCase()) ||
                 (a.displayName && a.displayName.toLowerCase() === targetUsername.toLowerCase())
          );
          if (matchedUser) {
            effectiveUser = matchedUser;
          }
        }

        setProfileUser(effectiveUser);
        setDrivers(dList);

        if (effectiveUser) {
          document.title = `${effectiveUser.displayName || effectiveUser.username} (@${effectiveUser.username}) | The Grid Profile`;
          setSelectedFavDriver(effectiveUser.favouriteDriver || '');
          setSelectedFavConstructor(effectiveUser.favouriteConstructor || 'ferrari');
          setSelectedFavChampionship(effectiveUser.favouriteChampionship || 'f1');
          setSelectedBio(effectiveUser.bio || '');
          const [achs, userHistory, userTrophies] = await Promise.all([
            api.getUserAchievements(effectiveUser.userId).catch(() => []),
            api.getUserPredictionsHistory(effectiveUser.userId).catch(() => []),
            api.getUserTrophies(effectiveUser.userId).catch(() => []),
          ]);
          setAchievements(achs);
          setHistory(userHistory);
          setTrophies(userTrophies);

          // If current logged-in user is viewing their own profile, evaluate and trigger verified unlock notifications
          if (currentUser && (currentUser.userId === effectiveUser.userId || (currentUser.username && currentUser.username.toLowerCase() === effectiveUser.username.toLowerCase()))) {
            achs.filter(a => a.isUnlocked).forEach(a => {
              notificationService.notifyAchievementUnlocked(effectiveUser!.userId, a);
            });
            userTrophies.forEach(t => {
              notificationService.notifyTrophyAwarded(effectiveUser!.userId, t);
            });

            // Fetch private authenticated quiz history and achievements
            Promise.all([
              quizService.getUserQuizHistory(effectiveUser.userId).catch(() => []),
              quizService.getUserQuizAchievements(effectiveUser.userId).catch(() => []),
              quizService.getQuizPerformanceSummary(effectiveUser.userId).catch(() => null),
            ]).then(([qHist, qAchs, qSum]) => {
              setQuizHistory(qHist);
              setQuizAchievements(qAchs);
              setQuizSummary(qSum);
            }).catch(() => {});
          }

          const historyStats = calculateUserStatsFromHistory(userHistory);
          const lbEntry = (seasonStandings || []).find(
            e => e.userId === effectiveUser!.userId || (e.username && e.username.toLowerCase() === effectiveUser!.username.toLowerCase())
          );

          // Enforce one consistent aggregation model:
          // The canonical source of truth is authoritative scored prediction records.
          const effectiveTotalPoints = lbEntry?.totalPoints !== undefined && lbEntry.totalPoints > 0
            ? lbEntry.totalPoints
            : historyStats.totalPoints > 0
            ? historyStats.totalPoints
            : (effectiveUser.totalPoints || 0);

          const effectiveRacesParticipated = historyStats.racesParticipated > 0
            ? historyStats.racesParticipated
            : lbEntry?.racesParticipated !== undefined && lbEntry.racesParticipated > 0
            ? lbEntry.racesParticipated
            : (effectiveUser.racesParticipated || 0);

          const effectiveSeasonRank = lbEntry?.rank || effectiveUser.seasonRank || 1;
          const effectivePreviousRank = lbEntry?.previousRank || effectiveUser.previousRank || effectiveSeasonRank;
          const effectiveBestWeekend = historyStats.bestWeekendScore > 0 ? historyStats.bestWeekendScore : (effectiveUser.bestWeekendScore || 0);
          const effectiveExactP1 = historyStats.exactP1Count > 0 ? historyStats.exactP1Count : (lbEntry?.exactP1Count || effectiveUser.exactP1Count || 0);
          const effectivePerfectPodium = historyStats.perfectPodiumCount > 0 ? historyStats.perfectPodiumCount : (lbEntry?.perfectPodiumCount || effectiveUser.perfectPodiumCount || 0);
          const effectiveWildcards = historyStats.wildcardsCorrect > 0 ? historyStats.wildcardsCorrect : (effectiveUser.wildcardsCorrect || 0);

          setProfileUser({
            ...effectiveUser,
            totalPoints: effectiveTotalPoints,
            racesParticipated: effectiveRacesParticipated,
            seasonRank: effectiveSeasonRank,
            previousRank: effectivePreviousRank,
            bestWeekendScore: effectiveBestWeekend,
            exactP1Count: effectiveExactP1,
            perfectPodiumCount: effectivePerfectPodium,
            wildcardsCorrect: effectiveWildcards,
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username, currentUser?.userId, currentUser?.username, isLoadingAuth]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="live-pulse" style={{ width: '12px', height: '12px', backgroundColor: 'var(--f1-red)', marginBottom: '1rem' }} />
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          RETRIEVING DRIVER TELEMETRY PROFILE...
        </div>
      </div>
    );
  }

  if (!profileUser) {
    const isSelfProfile = !username && !currentUser;
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>{isSelfProfile ? 'Sign In to View Profile' : 'User Profile Not Found'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isSelfProfile
            ? 'Please sign in to manage your racer license, driver picks, and prediction history.'
            : 'The requested racer profile could not be found or connection timed out.'}
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {isSelfProfile && (
            <button onClick={() => openLoginModal('/profile')} className="btn btn-primary">
              Sign In
            </button>
          )}
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry Connection
          </button>
          <Link to="/" className="btn btn-secondary">
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(
    currentUser && (
      currentUser.userId === profileUser.userId ||
      (currentUser.username && profileUser.username && currentUser.username.toLowerCase() === profileUser.username.toLowerCase())
    )
  );
  const favDriver = drivers.find(d => d.id === (isEditingFavDriver ? selectedFavDriver : profileUser.favouriteDriver));
  const favConstructor = GLOBAL_CONSTRUCTORS_LIST.find(
    c => c.id === (isEditingFavConstructor ? selectedFavConstructor : profileUser.favouriteConstructor)
  );
  const favChampionship = CHAMPIONSHIPS_REGISTRY.find(
    c => c.id === (isEditingFavChampionship ? selectedFavChampionship : profileUser.favouriteChampionship)
  );

  const handleSaveFavDriver = async () => {
    try {
      await updateProfile({ favouriteDriver: selectedFavDriver });
      setProfileUser(prev => (prev ? { ...prev, favouriteDriver: selectedFavDriver } : null));
      setIsEditingFavDriver(false);
      showToast('Favourite driver updated!', 'success');
    } catch (e) {
      showToast('Failed to update favourite driver', 'error');
    }
  };

  const handleSaveFavConstructor = async () => {
    try {
      await updateProfile({ favouriteConstructor: selectedFavConstructor });
      setProfileUser(prev => (prev ? { ...prev, favouriteConstructor: selectedFavConstructor } : null));
      setIsEditingFavConstructor(false);
      showToast('Favourite constructor updated!', 'success');
    } catch (e) {
      showToast('Failed to update constructor', 'error');
    }
  };

  const handleSaveFavChampionship = async () => {
    try {
      await updateProfile({ favouriteChampionship: selectedFavChampionship });
      setProfileUser(prev => (prev ? { ...prev, favouriteChampionship: selectedFavChampionship } : null));
      setIsEditingFavChampionship(false);
      showToast('Favourite championship updated!', 'success');
    } catch (e) {
      showToast('Failed to update favourite championship', 'error');
    }
  };

  const handleSaveBio = async () => {
    try {
      await updateProfile({ bio: selectedBio });
      setProfileUser(prev => (prev ? { ...prev, bio: selectedBio } : null));
      setIsEditingBio(false);
      showToast('Strategy bio statement updated!', 'success');
    } catch (e) {
      showToast('Failed to update bio', 'error');
    }
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Profile Header Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '3rem 0 2.5rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
            }}
          >
            {/* Left: Avatar + Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <UserInitialsAvatar
                  name={profileUser.username || 'Grid User'}
                  imageUrl={profileUser.avatarUrl}
                  size={90}
                  style={{
                    border: '3px solid var(--f1-red)',
                    boxShadow: '0 0 24px -3px var(--f1-red-glow)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    background: '#eab308',
                    color: '#000',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--bg-base)',
                  }}
                >
                  #{profileUser.seasonRank}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                  THE GRID • RACING IDENTITY & TELEMETRY PROFILE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    {profileUser.username || 'Grid User'}
                  </h1>
                  {profileUser.role === 'admin' && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(225, 6, 0, 0.2)',
                        color: 'var(--f1-red)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(225, 6, 0, 0.4)',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      Race Director
                    </span>
                  )}
                </div>

                {/* Username with edit affordance for profile owner */}
                {isOwner && isEditingUsername ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-input, #131722)',
                          border: `1px solid ${
                            usernameStatus === 'available'
                              ? 'var(--telemetry-green, #10b981)'
                              : usernameStatus === 'unavailable' || usernameStatus === 'invalid'
                              ? 'var(--f1-red, #e10600)'
                              : 'var(--border-subtle, rgba(255, 255, 255, 0.15))'
                          }`,
                          borderRadius: '6px',
                          padding: '0.2rem 0.5rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>@</span>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={e => setNewUsername(e.target.value.replace(/\s+/g, ''))}
                          maxLength={20}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            width: '140px',
                          }}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleSaveUsername}
                        disabled={usernameStatus !== 'available'}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingUsername(false)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color:
                          usernameStatus === 'available'
                            ? 'var(--telemetry-green, #10b981)'
                            : usernameStatus === 'unavailable' || usernameStatus === 'invalid'
                            ? 'var(--f1-red, #e10600)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {usernameStatus === 'available' && '✓ '}
                      {usernameMessage}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>@{profileUser.username || 'Grid User'} • Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setIsEditingUsername(true);
                          setNewUsername(profileUser.username || '');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                        title="Edit Username"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Favourite Driver, Constructor & Championship Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {isEditingFavDriver ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                        value={selectedFavDriver}
                        onChange={e => setSelectedFavDriver(e.target.value)}
                      >
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            #{d.number} {d.firstName} {d.lastName} ({d.team})
                          </option>
                        ))}
                      </select>
                      <button onClick={handleSaveFavDriver} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Save
                      </button>
                      <button onClick={() => setIsEditingFavDriver(false)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'var(--bg-input)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Favourite Driver:</span>
                      {favDriver ? (
                        <span style={{ fontWeight: 800, color: favDriver.teamColor }}>
                          #{favDriver.number} {favDriver.lastName} ({favDriver.team}) {favDriver.countryFlag}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not set</span>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => setIsEditingFavDriver(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '0.2rem',
                          }}
                          title="Edit Favourite Driver"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Favourite Constructor Chip */}
                  {isEditingFavConstructor ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                        value={selectedFavConstructor}
                        onChange={e => setSelectedFavConstructor(e.target.value)}
                      >
                        {GLOBAL_CONSTRUCTORS_LIST.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} • {c.series} ({c.flag})
                          </option>
                        ))}
                      </select>
                      <button onClick={handleSaveFavConstructor} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Save
                      </button>
                      <button onClick={() => setIsEditingFavConstructor(false)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'var(--bg-input)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Constructor:</span>
                      {favConstructor ? (
                        <span style={{ fontWeight: 800, color: favConstructor.color }}>
                          {favConstructor.name} {favConstructor.flag}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not set</span>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => setIsEditingFavConstructor(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '0.2rem',
                          }}
                          title="Edit Favourite Constructor"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Favourite Championship Chip */}
                  {isEditingFavChampionship ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                        value={selectedFavChampionship}
                        onChange={e => setSelectedFavChampionship(e.target.value)}
                      >
                        {CHAMPIONSHIPS_REGISTRY.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.shortName} — {c.name}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleSaveFavChampionship} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Save
                      </button>
                      <button onClick={() => setIsEditingFavChampionship(false)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'var(--bg-input)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Championship:</span>
                      {favChampionship ? (
                        <span style={{ fontWeight: 800, color: favChampionship.badgeColor }}>
                          {favChampionship.shortName}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not set</span>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => setIsEditingFavChampionship(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '0.2rem',
                          }}
                          title="Edit Favourite Championship"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Strategy Statement / Bio */}
                <div style={{ marginTop: '0.85rem' }}>
                  {isEditingBio ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: '480px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', flex: 1 }}
                        value={selectedBio}
                        onChange={e => setSelectedBio(e.target.value)}
                        placeholder="Enter strategy statement..."
                      />
                      <button onClick={handleSaveBio} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Save
                      </button>
                      <button onClick={() => setIsEditingBio(false)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                        "{profileUser.bio || 'Telemetry enthusiast and precision strategy predictor.'}"
                      </p>
                      {isOwner && (
                        <button
                          onClick={() => setIsEditingBio(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.1rem',
                          }}
                          title="Edit Strategy Statement"
                        >
                          <Edit2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Key Trophy Stats & Share Result */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: 'var(--bg-surface-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    minWidth: '130px',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    CHAMPIONSHIP RANK
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, color: '#eab308' }}>
                    #{profileUser.seasonRank}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Prev: #{profileUser.previousRank || profileUser.seasonRank}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-surface-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    minWidth: '130px',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    TOTAL POINTS
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--telemetry-green)' }}>
                    {profileUser.totalPoints}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {profileUser.racesParticipated} Rounds
                  </div>
                </div>
              </div>

              {/* Primary Profile Share Action */}
              <button
                id="profile-share-result-btn"
                onClick={handleShareMyResult}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#E10600',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  border: 'none',
                  boxShadow: '0 0 14px rgba(225, 6, 0, 0.4)',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={14} /> SHARE MY RESULT
              </button>

              {isOwner && (
                <button
                  id="profile-password-setup-btn"
                  onClick={() => setIsPasswordSetupOpen(true)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#e2e8f0',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                  }}
                >
                  {(() => {
                    const hasPass = currentUser?.hasPasswordConfigured ?? currentUser?.hasPassword;
                    return (
                      <>
                        <Lock size={14} style={{ color: hasPass ? '#10b981' : '#e10600' }} />
                        {hasPass ? 'CHANGE PASSWORD' : 'SET ACCOUNT PASSWORD'}
                      </>
                    );
                  })()}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Quick Competition Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleShareMyResult}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', fontFamily: 'var(--font-mono)', borderColor: 'rgba(225, 6, 0, 0.4)' }}
          >
            <Share2 size={14} color="var(--f1-red)" /> SHARE MY RESULT
          </button>
          <Link
            to="/predictions"
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', fontFamily: 'var(--font-mono)' }}
          >
            <Target size={14} color="var(--f1-red)" /> PREDICTION BENCH
          </Link>
          <Link
            to="/leaderboard"
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', fontFamily: 'var(--font-mono)' }}
          >
            <Trophy size={14} color="#eab308" /> CHAMPIONSHIP STANDINGS
          </Link>
        </div>

        {/* Prediction Points Speedometer */}
        <div style={{ marginBottom: '2.5rem' }}>
          {(() => {
            const prodPts = profileUser.totalPoints || 0;

            return (
              <PredictionSpeedometer
                points={prodPts}
                productionPoints={prodPts}
                testPoints={0}
                seasonRank={profileUser.seasonRank}
                previousRank={profileUser.previousRank}
                championshipName={favChampionship?.shortName || 'Motorsport'}
                actionLink="/predictions"
                actionLabel="Make Predictions"
              />
            );
          })()}
        </div>

        {/* Performance Telemetry Grid */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Prediction Performance Telemetry
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          <div className="race-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-green)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Target size={14} /> EXACT P1 PREDICTIONS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
              {profileUser.exactP1Count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              25 pts for P1 winner • 10 pts for pole
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', fontSize: '0.75rem', fontWeight: 700 }}>
              <Trophy size={14} /> PERFECT PODIUMS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
              {profileUser.perfectPodiumCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              100% correct 1-2-3 podium finishes
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-purple)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Sparkles size={14} /> WILDCARDS CORRECT
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
              {profileUser.wildcardsCorrect}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              5 pts per correct insight
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-cyan)', fontSize: '0.75rem', fontWeight: 700 }}>
              <TrendingUp size={14} /> AVG PTS / ROUND
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
              {profileUser.racesParticipated > 0
                ? Math.round((profileUser.totalPoints / profileUser.racesParticipated) * 10) / 10
                : 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Best single weekend: {profileUser.bestWeekendScore || 0} pts
            </div>
          </div>
        </div>

        {/* Weekend Trophies Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={18} color="#eab308" /> Weekend Trophies ({trophies.length})
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            PERMANENT WEEKEND OVERALL SILVERWARE
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          {trophies.map(trophy => {
            const isGold = trophy.trophyType === 'GOLD';
            const isSilver = trophy.trophyType === 'SILVER';
            const trophyColor = isGold ? '#eab308' : isSilver ? '#94a3b8' : '#cd7f32';
            const trophyGlow = isGold ? 'rgba(234, 179, 8, 0.25)' : isSilver ? 'rgba(148, 163, 184, 0.25)' : 'rgba(205, 127, 50, 0.25)';
            const iconBadge = isGold ? '🥇' : isSilver ? '🥈' : '🥉';

            return (
              <div
                key={trophy.trophyId}
                className="race-card"
                style={{
                  padding: '1.25rem',
                  border: `1px solid ${trophyColor}`,
                  boxShadow: `0 0 16px ${trophyGlow}`,
                  background: `linear-gradient(135deg, ${trophyGlow} 0%, var(--bg-surface-card) 100%)`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '2.2rem',
                    background: 'var(--bg-surface-elevated)',
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${trophyColor}`,
                    flexShrink: 0,
                  }}
                >
                  {iconBadge}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        color: trophyColor,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {trophy.trophyType} TROPHY • P{trophy.rank}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: 'var(--telemetry-green)',
                      }}
                    >
                      {trophy.points} PTS
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.98rem', textTransform: 'uppercase', marginTop: '0.2rem', color: '#ffffff' }}>
                    {trophy.eventName}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {trophy.circuitName || 'Grand Prix Weekend'} • {trophy.season}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    Awarded {new Date(trophy.awardedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}

          {trophies.length === 0 && (
            <div
              className="race-card"
              style={{
                gridColumn: '1 / -1',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                border: '1px dashed var(--border-medium)',
              }}
            >
              <Trophy size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', opacity: 0.6 }} />
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                No Weekend Silverware Yet
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0.35rem auto 0', lineHeight: 1.4 }}>
                Permanent Gold, Silver, and Bronze trophies are awarded to P1, P2, and P3 in finalized Weekend Overall competitions. Compete in upcoming race weekends to earn silverware!
              </p>
            </div>
          )}
        </div>

        {/* Achievement Registry & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--telemetry-purple)" /> Achievements Registry ({achievements.filter(a => a.isUnlocked).length}/{CANONICAL_ACHIEVEMENT_REGISTRY.length})
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            DATA-DRIVEN BADGES
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          {CANONICAL_ACHIEVEMENT_REGISTRY.map(def => {
            const ach = achievements.find(a => a.achievementType === def.type || a.achievementId.includes(def.id));
            const isUnlocked = Boolean(ach?.isUnlocked);
            const progressCurrent = ach?.progress?.current ?? (isUnlocked ? def.targetValue : 0);
            const progressPct = Math.min(100, Math.round((progressCurrent / def.targetValue) * 100));

            return (
              <div
                key={def.id}
                className="race-card"
                style={{
                  padding: '1.25rem',
                  border: isUnlocked
                    ? '1px solid rgba(234, 179, 8, 0.35)'
                    : '1px solid var(--border-medium)',
                  background: isUnlocked
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, var(--bg-surface-card) 100%)'
                    : 'var(--bg-surface-card)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: isUnlocked ? 1 : 0.72,
                }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    background: 'var(--bg-surface-elevated)',
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isUnlocked ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid var(--border-subtle)',
                    flexShrink: 0,
                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  }}
                >
                  {def.badgeIcon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', color: isUnlocked ? '#ffffff' : 'var(--text-secondary)' }}>
                      {def.title}
                    </div>
                    {isUnlocked ? (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        UNLOCKED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                        }}
                      >
                        LOCKED
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                    {def.description}
                  </p>

                  {/* Progress bar or earned timestamp */}
                  {isUnlocked ? (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                      ✓ Earned {ach?.earnedAt ? new Date(ach.earnedAt).toLocaleDateString() : 'Active'}
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        <span>Progress</span>
                        <span>{progressCurrent} / {def.targetValue}</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            backgroundColor: 'var(--f1-red)',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prediction Ledger & History */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Prediction Ledger & History ({history.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.map(({ prediction: p, round: r, score: s, weekend: w }) => (
            <div
              key={p.predictionId}
              className="race-card"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{w?.flag || '🏁'}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                    {w?.raceName || 'Grand Prix'} — {r?.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                    }}
                  >
                    {r?.roundType || 'GRAND_PRIX'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Submitted: {new Date(p.submittedAt).toLocaleDateString()} • Round #{r?.roundNumber || ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {s ? (
                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-green)', fontSize: '1.1rem' }}>
                      +{s.totalScore ?? s.pointsEarned ?? 0} PTS
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Scored
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Pending Score
                  </div>
                )}

                {/* View Points Breakdown Action */}
                {s && (
                  <button
                    onClick={() => {
                      setSelectedBreakdownItem({ prediction: p, round: r, score: s, weekend: w });
                      setIsBreakdownModalOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      borderColor: 'rgba(234, 179, 8, 0.4)',
                      color: '#eab308',
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.65rem',
                    }}
                    title="View verified points breakdown across scoring categories"
                  >
                    <Award size={13} /> Breakdown
                  </button>
                )}

                {s && (
                  <button
                    onClick={() => handleShareSpecificResult({ prediction: p, round: r, score: s, weekend: w })}
                    className="btn btn-outline btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.65rem',
                    }}
                    title="Share this result as a 9:16 story"
                  >
                    <Share2 size={12} color="var(--f1-red)" /> Share
                  </button>
                )}

                <Link
                  to={`/predict/${p.roundId}`}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  View <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No predictions recorded for this user yet.
            </div>
          )}
        </div>

        {/* ===================================================================
            GRDX • Motorsport Fan Identity & Quiz History
            =================================================================== */}
        <div style={{ marginTop: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--f1-red)" /> GRDX • Racing Tags & Achievements
              </h2>
              {/* Internal Invariant Anchor: GRDX • Motorsport Fan Identity & Knowledge */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Verified Knowledge Challenges • Earned Racing Tags & Accolades
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              AUTHENTICATED RACING TAGS & ATTEMPTS
            </span>
          </div>

          {!isOwner ? (
            <div
              className="race-card"
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                border: '1px dashed var(--border-medium)',
              }}
            >
              <Brain size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', opacity: 0.6 }} />
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Racer Knowledge Telemetry is Private
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0.35rem auto 0', lineHeight: 1.4 }}>
                Motorsport quiz attempts and detailed fan identity records are securely protected and visible only to the authenticated racer.
              </p>
            </div>
          ) : (
            <>
              {/* Performance Summary Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                <div className="race-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Brain size={14} /> QUIZZES COMPLETED
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
                    {quizSummary?.quizzesCompleted ?? 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Official scored attempts
                  </div>
                </div>

                <div className="race-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Target size={14} /> BEST KNOWLEDGE SCORE
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
                    {quizSummary?.bestScorePercentage ?? 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {quizSummary?.bestScoreCorrect ?? 0} / {quizSummary?.bestScoreTotal ?? 0} correct answers
                  </div>
                </div>

                <div className="race-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b966ff', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Sparkles size={14} /> EARNED RACING TAG
                    {/* Internal Invariant Anchor: FAN IDENTITY TIER */}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, marginTop: '0.4rem', color: '#ffffff', textTransform: 'uppercase' }}>
                    {quizSummary?.highestTier ?? 'The Rookie'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Based on verified quiz performance
                  </div>
                </div>

                <div className="race-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Compass size={14} /> CATEGORIES TESTED
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
                    {quizSummary?.uniqueDisciplinesCount ?? 0} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ 8</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Formula, MotoGP, WEC & GT
                  </div>
                </div>
              </div>

              {/* Quiz Achievements & Awards Section */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} color="var(--f1-red)" /> Quiz Achievements & Awards ({quizAchievements.filter(a => a.isUnlocked).length}/{quizAchievements.length || 5})
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  SEPARATE FROM PREDICTION TROPHIES
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2.5rem',
                }}
              >
                {quizAchievements.map(ach => {
                  const isUnlocked = Boolean(ach.isUnlocked);
                  const progressCurrent = ach.progress?.current ?? (isUnlocked ? ach.progress?.target ?? 1 : 0);
                  const progressTarget = ach.progress?.target ?? 1;
                  const progressPct = Math.min(100, Math.round((progressCurrent / progressTarget) * 100));

                  return (
                    <div
                      key={ach.achievementId}
                      className="race-card"
                      style={{
                        padding: '1.25rem',
                        border: isUnlocked
                          ? `1px solid ${ach.badgeColor || '#10b981'}`
                          : '1px solid var(--border-medium)',
                        background: isUnlocked
                          ? `linear-gradient(135deg, ${ach.badgeColor || '#10b981'}15 0%, var(--bg-surface-card) 100%)`
                          : 'var(--bg-surface-card)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        opacity: isUnlocked ? 1 : 0.72,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '2rem',
                          background: 'var(--bg-surface-elevated)',
                          width: '52px',
                          height: '52px',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isUnlocked ? `1px solid ${ach.badgeColor}` : '1px solid var(--border-subtle)',
                          flexShrink: 0,
                          filter: isUnlocked ? 'none' : 'grayscale(100%)',
                        }}
                      >
                        {ach.badgeIcon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', color: isUnlocked ? '#ffffff' : 'var(--text-secondary)' }}>
                            {ach.title}
                          </div>
                          {isUnlocked ? (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '3px',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              UNLOCKED
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-muted)',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '3px',
                              }}
                            >
                              LOCKED
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                          {ach.description}
                        </p>

                        {isUnlocked ? (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                            ✓ Earned {ach.earnedAt ? new Date(ach.earnedAt).toLocaleDateString() : 'Active'}
                          </div>
                        ) : (
                          <div style={{ marginTop: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                              <span>Progress</span>
                              <span>{progressCurrent} / {progressTarget}</span>
                            </div>
                            <div style={{ height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${progressPct}%`,
                                  backgroundColor: 'var(--f1-red)',
                                  borderRadius: '2px',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quiz Attempts Ledger */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={16} color="var(--f1-red)" /> Quiz Attempts Ledger ({quizHistory.length})
                </h3>
                <Link to="/quiz" className="btn btn-primary btn-sm" style={{ gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                  Take Quiz <ChevronRight size={13} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quizHistory.map(att => {
                  const tier = getTierDetails(att.fanIdentityTier);
                  return (
                    <div
                      key={att.attemptId}
                      className="race-card"
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: `${tier.color}22`,
                              color: tier.color,
                              border: `1px solid ${tier.color}55`,
                              textTransform: 'uppercase',
                            }}
                          >
                            {att.fanIdentityTier}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                            {att.score} / {att.totalQuestions} ({att.percentage}%)
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span>Completed {new Date(att.completedAt || att.startedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Categories:</span>
                          {(att.selectedCategories || []).map(catId => {
                            const cat = getQuizCategory(catId);
                            return (
                              <span
                                key={catId}
                                style={{
                                  backgroundColor: 'var(--bg-input)',
                                  color: 'var(--text-secondary)',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '3px',
                                  fontSize: '0.68rem',
                                }}
                              >
                                {cat?.displayName || catId}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Link
                          to={`/quiz/${att.attemptId}`}
                          className="btn btn-outline btn-sm"
                          style={{ gap: '0.3rem', fontSize: '0.75rem' }}
                        >
                          Review Answers <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {quizHistory.length === 0 && (
                  <div
                    className="race-card"
                    style={{
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      border: '1px dashed var(--border-medium)',
                    }}
                  >
                    <Award size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.7 }} />
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                      No Racing Tags Earned Yet
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0.4rem auto 1.25rem', lineHeight: 1.45 }}>
                      Test your motorsport knowledge across verified questions to earn your authentic racing tag and unlock profile badges.
                    </p>
                    <Link to="/quiz" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={15} /> Get Your Racing Tag
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <StoryShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={shareModalTitle}
        canvas={shareModalCanvas}
        filename={shareModalFilename}
        shareText={shareModalText}
      />
      <PasswordSetupModal
        isOpen={isPasswordSetupOpen}
        onClose={() => setIsPasswordSetupOpen(false)}
      />
      <PointsBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        predictionItem={selectedBreakdownItem}
      />
    </div>
  );
};
