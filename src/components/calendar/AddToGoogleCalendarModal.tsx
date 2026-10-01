import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Calendar, ExternalLink, Download } from 'lucide-react';
import { getCalendarFeedUrl } from '../../services/calendar/calendarFeedGenerator';

export interface AddToGoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddToGoogleCalendarModal: React.FC<AddToGoogleCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  // Derive public feed URL dynamically
  const feedUrl = getCalendarFeedUrl();

  // Direct Google Calendar web subscription URL helper
  const webGoogleCalUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feedUrl)}`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(feedUrl);
      } else {
        // Fallback for restricted clipboard contexts
        const textArea = document.createElement('textarea');
        textArea.value = feedUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 2500);
    } catch (_err) {
      setCopyError('Unable to copy automatically. Please select and copy the link above.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-calendar-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '480px',
          padding: '1.5rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          boxSizing: 'border-box',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(225, 6, 0, 0.12)',
                border: '1px solid rgba(225, 6, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--f1-red, #e10600)',
                flexShrink: 0,
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <h2
                id="google-calendar-modal-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                THE GRID CALENDAR
              </h2>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary, #cbd5e1)',
                  margin: '0.2rem 0 0 0',
                  lineHeight: 1.4,
                }}
              >
                Subscribe to The Grid's motorsport calendar in Google Calendar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              minWidth: '36px',
              minHeight: '36px',
              transition: 'color 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* FEED URL DISPLAY & COPY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <label
            htmlFor="calendar-feed-url-input"
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--text-muted, #94a3b8)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.05em',
            }}
          >
            Calendar Link:
          </label>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              borderRadius: '8px',
              padding: '0.55rem 0.75rem',
              gap: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <input
              id="calendar-feed-url-input"
              type="text"
              readOnly
              value={feedUrl}
              onFocus={e => e.target.select()}
              aria-label="iCalendar feed URL"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono, monospace)',
                width: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              id="btn-copy-calendar-link"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.65rem 1rem',
                minHeight: '44px',
                borderRadius: '8px',
                border: copied ? '1px solid #10b981' : '1px solid var(--f1-red, #e10600)',
                backgroundColor: copied ? '#059669' : 'var(--f1-red, #e10600)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Calendar link copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>COPY CALENDAR LINK</span>
                </>
              )}
            </button>

            <a
              href={webGoogleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-open-google-cal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                width: '100%',
                padding: '0.55rem 1rem',
                minHeight: '40px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-secondary, #cbd5e1)',
                fontSize: '0.76rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono, monospace)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
              }}
            >
              <span>OPEN GOOGLE CALENDAR WEB</span>
              <ExternalLink size={13} />
            </a>

            <a
              href="./calendar/the-grid.ics"
              download="the-grid.ics"
              id="btn-download-ics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                width: '100%',
                padding: '0.55rem 1rem',
                minHeight: '40px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted, #94a3b8)',
                fontSize: '0.74rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono, monospace)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
              }}
            >
              <Download size={13} />
              <span>DOWNLOAD .ICS (DIRECT FILE IMPORT)</span>
            </a>
          </div>

          {copyError && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.74rem', color: '#f87171' }}>
              {copyError}
            </p>
          )}
        </div>

        {/* STEP-BY-STEP INSTRUCTIONS */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted, #94a3b8)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            HOW TO SUBSCRIBE:
          </div>

          <ol
            style={{
              margin: 0,
              paddingLeft: '1.15rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #cbd5e1)',
              lineHeight: 1.6,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <li>Open Google Calendar on desktop/web.</li>
            <li>Go to <strong>Other calendars</strong>.</li>
            <li>Select <strong>“+” → “From URL”</strong>.</li>
            <li>Paste the calendar link.</li>
            <li>Select <strong>“Add calendar”</strong>.</li>
          </ol>
        </div>

        {/* READ-ONLY SUBSCRIPTION NOTICE */}
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.4,
            textAlign: 'center',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            paddingTop: '0.75rem',
          }}
        >
          Public read-only subscription. Events synchronize automatically as race schedules update.
        </div>
      </div>
    </div>
  );
};
