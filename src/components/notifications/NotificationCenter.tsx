import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trophy, Sparkles, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { InAppNotification } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.userId) {
      setNotifications([]);
      return;
    }

    setNotifications(notificationService.getNotifications(currentUser.userId));

    const unsubscribe = notificationService.subscribe((items) => {
      setNotifications(items);
    });

    return unsubscribe;
  }, [currentUser?.userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleMarkAllRead = () => {
    if (currentUser?.userId) {
      notificationService.markAllAsRead(currentUser.userId);
    }
  };

  const handleItemClick = (notif: InAppNotification) => {
    if (currentUser?.userId) {
      notificationService.markAsRead(currentUser.userId, notif.id);
    }
    setIsOpen(false);

    if (notif.type === 'ACHIEVEMENT_UNLOCKED') {
      navigate('/profile');
    } else if (notif.type === 'TROPHY_AWARDED') {
      const weekendId = notif.metadata?.raceWeekendId;
      if (weekendId) {
        navigate(`/leaderboard?type=weekend&id=${encodeURIComponent(weekendId)}`);
      } else {
        navigate('/leaderboard?type=weekend');
      }
    } else if (notif.type === 'RESULTS_FINALIZED') {
      navigate('/leaderboard');
    } else if (notif.type === 'PREDICTION_SUBMITTED') {
      navigate('/predictions');
    }
  };

  const renderIcon = (notif: InAppNotification) => {
    if (notif.type === 'TROPHY_AWARDED') {
      return <Trophy size={16} color="#eab308" />;
    }
    if (notif.type === 'ACHIEVEMENT_UNLOCKED') {
      return <Sparkles size={16} color="#38bdf8" />;
    }
    return <Bell size={16} color="var(--f1-red)" />;
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        id="navbar-notification-btn"
        onClick={handleToggle}
        aria-label="View notifications"
        aria-expanded={isOpen}
        style={{
          background: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '0.45rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: unreadCount > 0 ? '#fff' : '#8E9BAE',
          position: 'relative',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            id="notification-badge-count"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--f1-red)',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(225, 6, 0, 0.6)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notification center"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            backgroundColor: '#14181F',
            border: '1px solid #282F3C',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #1F2532',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>
              <Bell size={13} color="var(--f1-red)" /> Notifications
              {unreadCount > 0 && (
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>({unreadCount} new)</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.2rem',
                }}
              >
                <CheckCheck size={12} /> Mark read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
                No notifications yet. Keep predicting race weekends!
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(225, 6, 0, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'rgba(225, 6, 0, 0.05)'; }}
                >
                  <div style={{ marginTop: '0.15rem', flexShrink: 0 }}>
                    {renderIcon(notif)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: notif.isRead ? 600 : 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {notif.title}
                      </div>
                      {!notif.isRead && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--f1-red)', flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', lineHeight: 1.3 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={10} /> {formatTime(notif.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
