import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { User, Achievement, Driver, Constructor } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { F1_CONSTRUCTORS_2026 } from '../services/mockData';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  Edit2,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser, updateProfile, openLoginModal } = useAuth();
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
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [selectedBio, setSelectedBio] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) {
          setProfileUser(null);
          setLoading(false);
          return;
        }
        const [u, dList] = await Promise.all([
          api.getUserProfile(targetUsername),
          api.getDrivers(),
        ]);

        setProfileUser(u);
        setDrivers(dList);

        if (u) {
          setSelectedFavDriver(u.favouriteDriver || '');
          setSelectedFavConstructor(u.favouriteConstructor || 'ferrari');
          setSelectedBio(u.bio || '');
          const [achs, userHistory] = await Promise.all([
            api.getUserAchievements(u.userId),
            api.getUserPredictionsHistory(u.userId),
          ]);
          setAchievements(achs);
          setHistory(userHistory);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username, currentUser?.userId]);

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
            : 'The requested racer profile could not be found.'}
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {isSelfProfile && (
            <button onClick={() => openLoginModal('/profile')} className="btn btn-primary">
              Sign In
            </button>
          )}
          <Link to="/" className="btn btn-secondary">
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(currentUser && currentUser.userId === profileUser.userId);
  const favDriver = drivers.find(d => d.id === (isEditingFavDriver ? selectedFavDriver : profileUser.favouriteDriver));
  const favConstructor = F1_CONSTRUCTORS_2026.find(
    c => c.id === (isEditingFavConstructor ? selectedFavConstructor : profileUser.favouriteConstructor)
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
                  name={profileUser.displayName}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    {profileUser.displayName}
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

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  @{profileUser.username} • Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>

                {/* Favourite Driver Chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
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
                        {F1_CONSTRUCTORS_2026.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.country})
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

            {/* Right: Key Trophy Stats */}
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
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2.5rem' }}>
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
              15 pts awarded per exact pole/winner
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
              15 pts per wildcard insight
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-cyan)', fontSize: '0.75rem', fontWeight: 700 }}>
              <TrendingUp size={14} /> AVG PTS / ROUND
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.4rem' }}>
              {Math.round((profileUser.totalPoints / (profileUser.racesParticipated || 1)) * 10) / 10}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Best single weekend: {profileUser.bestWeekendScore} pts
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Trophies & Achievements ({achievements.length})
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          {achievements.map(ach => (
            <div
              key={ach.achievementId}
              className="race-card"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, var(--bg-surface-card) 100%)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
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
                  border: '1px solid var(--border-medium)',
                  flexShrink: 0,
                }}
              >
                {ach.badgeIcon}
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>
                  {ach.title}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                  {ach.description}
                </p>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  Earned {new Date(ach.earnedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {achievements.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No achievements unlocked yet. Keep predicting race weekends to earn badges!
            </div>
          )}
        </div>

        {/* Prediction History */}
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
                    {w?.raceName} — {r?.title}
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
                    {r?.roundType}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Submitted: {new Date(p.submittedAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {s ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-green)', fontSize: '1.1rem' }}>
                      +{s.totalScore} PTS
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
      </div>
    </div>
  );
};
