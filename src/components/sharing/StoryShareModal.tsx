import React, { useEffect, useState } from 'react';
import { X, Share2, Download, Check, Copy } from 'lucide-react';
import {
  shareOrDownloadStory,
  triggerImageDownload,
  canvasToBlob,
} from '../../services/sharing/storyShareService';

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  canvas: HTMLCanvasElement | null;
  filename: string;
  shareText: string;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  isOpen,
  onClose,
  title,
  canvas,
  filename,
  shareText,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvas) {
      setPreviewUrl(null);
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
    } catch (e) {
      console.error('Error generating preview data URL:', e);
    }
  }, [isOpen, canvas]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!canvas) return;
    setSharing(true);
    try {
      const result = await shareOrDownloadStory({
        canvas,
        filename,
        title,
        text: shareText,
      });
      if (result.downloaded) {
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
      }
    } catch (err) {
      console.error('Share action error:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleDirectDownload = async () => {
    if (!canvas) return;
    try {
      const blob = await canvasToBlob(canvas);
      triggerImageDownload(blob, filename);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (_err) {
      // Fallback
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0f1118',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(225, 6, 0, 0.15)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#E10600',
                boxShadow: '0 0 8px #E10600',
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-heading, "Formula1", sans-serif)',
                color: '#FFFFFF',
              }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Story 9:16 Preview Box */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'radial-gradient(circle at top, #141724 0%, #0a0b10 100%)',
          }}
        >
          {previewUrl ? (
            <div
              style={{
                width: '100%',
                maxWidth: '240px',
                aspectRatio: '9 / 16',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(225, 6, 0, 0.2)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
              }}
            >
              <img
                src={previewUrl}
                alt="Story Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                maxWidth: '240px',
                aspectRatio: '9 / 16',
                borderRadius: '16px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
              }}
            >
              Rendering Story...
            </div>
          )}

          <div
            style={{
              marginTop: '0.85rem',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}
          >
            VERTICAL STORY FORMAT (9:16)  •  INSTAGRAM & WHATSAPP READY
          </div>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            padding: '1.1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#090a0f',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          {/* Primary Share Action */}
          <button
            onClick={handleShare}
            disabled={sharing || !canvas}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#E10600',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: sharing || !canvas ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(225, 6, 0, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Share2 size={16} />
            {sharing ? 'PREPARING SHARE...' : 'SHARE STORY'}
          </button>

          {/* Secondary Buttons Row */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handleDirectDownload}
              disabled={!canvas}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: downloaded ? '#10B981' : '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              {downloaded ? <Check size={14} /> : <Download size={14} />}
              {downloaded ? 'SAVED TO DEVICE' : 'DOWNLOAD'}
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: copiedLink ? '#10B981' : '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'LINK COPIED' : 'COPY LINK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
