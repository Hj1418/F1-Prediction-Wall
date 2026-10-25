import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trophy, Sparkles, CheckCheck, Check, Clock, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { InAppNotification } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
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

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const displayedNotifications = activeTab === 'unread' ? unreadNotifications : notifications;

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.userId) {
      notificationService.markAllAsRead(currentUser.userId);
    }
  };

  const handleMarkSingleRead = (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.userId) {
      notificationService.markAsRead(currentUser.userId, notifId);
    }
  };

  const handleItemClick = (notif: InAppNotification) => {
    if (currentUser?.userId && !notif.isRead) {
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
          width: '40px',
          height: '40px',
          background: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: unreadCount > 0 ? '#fff' : '#8E9BAE',
          position: 'relative',
          flexShrink: 0,
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
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
            width: '340px',
            maxWidth: 'calc(100vw - 2rem)',
            backgroundColor: '#14181F',
            border: '1px solid #282F3C',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.75rem 1rem 0.5rem 1rem',
              borderBottom: '1px solid #1F2532',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>
              <Bell size={14} color="var(--f1-red)" /> Notifications
            </div>

            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
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
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* View Filter Tabs: Unread vs All */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0 0.5rem',
            }}
          >
            <button
              onClick={() => setActiveTab('unread')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'unread' ? '2px solid var(--f1-red)' : '2px solid transparent',
                color: activeTab === 'unread' ? '#FFFFFF' : '#8E9BAE',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'unread' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Unread
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'unread' ? 'rgba(225, 6, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: activeTab === 'unread' ? 'var(--f1-red)' : '#8E9BAE',
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'all' ? '2px solid var(--f1-red)' : '2px solid transparent',
                color: activeTab === 'all' ? '#FFFFFF' : '#8E9BAE',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'all' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              History
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#8E9BAE',
                  fontWeight: 700,
                }}
              >
                {notifications.length}
              </span>
            </button>
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {displayedNotifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.78rem' }}>
                <Inbox size={28} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                {activeTab === 'unread' ? (
                  <div>
                    <div style={{ fontWeight: 700, color: '#94A3B8' }}>All caught up!</div>
                    <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>No unread notifications</div>
                  </div>
                ) : (
                  <div>No notification history yet</div>
                )}
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(225, 6, 0, 0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'background-color 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'rgba(225, 6, 0, 0.04)'; }}
                >
                  <div style={{ marginTop: '0.15rem', flexShrink: 0 }}>
                    {renderIcon(notif)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: notif.isRead ? 600 : 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {notif.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                        {!notif.isRead && (
                          <button
                            title="Mark as read"
                            aria-label="Mark notification as read"
                            onClick={(e) => handleMarkSingleRead(notif.id, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748B',
                              cursor: 'pointer',
                              padding: '0.15rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#10b981'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
                          >
                            <Check size={13} />
                          </button>
                        )}
                        {!notif.isRead && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--f1-red)', flexShrink: 0 }} />
                        )}
                      </div>
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
