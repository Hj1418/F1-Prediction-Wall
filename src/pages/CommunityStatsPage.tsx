import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Target,
  Brain,
  Sliders,
  Calendar,
  Share2,
  Copy,
  Download,
  Check,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { api } from '../services/apiClient';
import { AnalyticsTimeRange, PublicCommunityReport } from '../types/competitionAnalytics';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const CommunityStatsPage: React.FC = () => {
  const { showToast } = useApp();
  const { currentUser, isAdmin, isAuthenticated, openLoginModal } = useAuth();
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('all');
  const [report, setReport] = useState<PublicCommunityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [generatingCard, setGeneratingCard] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchReport = async (range: AnalyticsTimeRange) => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPublicCommunityReport(range, currentUser?.userId, currentUser?.authToken);
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load community competition report:', err);
      setError('Unable to load community statistics right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReport(timeRange);
    }
  }, [timeRange, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--f1-red)',
            marginBottom: '1.5rem',
          }}
        >
          <ShieldCheck size={32} />
        </div>
        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          ADMINISTRATOR PRIVILEGES REQUIRED
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem 0' }}>
          Restricted Community Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          This detailed competition report and community analytics dashboard is restricted to authorized platform administrators. Please sign in with administrator credentials or navigate back to the motorsport hub.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {!isAuthenticated ? (
            <button
              onClick={() => openLoginModal('/community-stats')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Lock size={15} />
              <span>Sign In as Admin</span>
            </button>
          ) : (
            <Link
              to="/admin"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={15} />
              <span>Open Admin Dashboard</span>
            </Link>
          )}
          <Link
            to="/explore"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Return to Motorsport Discovery</span>
          </Link>
        </div>
      </div>
    );
  }

  const generateTextSummary = (rep: PublicCommunityReport): string => {
    const periodStr = rep.periodLabel;
    const h = rep.headlineStats;
    const r = rep.racingTag;
    const s = rep.strategyRoom;
    const p = rep.predictions;

    return `🏁 THE GRDX — Community Competition Report (${periodStr})
📊 Community Highlights:
• Registered Members: ${h.registeredMembers}
• Active Competitors: ${h.activeCompetitors} (${h.participationRate}% participation)
• Total Competition Activities: ${h.totalCompetitionActivity}

🏆 Compete Breakdown:
• Racing Tag: ${h.racingTagParticipants} unique racers • ${r.totalAttempts} attempts (${r.completedAttempts} completed) • ${r.averagePercentage}% avg score
• Strategy Room: ${h.strategyRoomParticipants} strategists • ${s.totalRuns} simulation runs • ${s.averageScore}/100 avg score
• F1 Predictions: ${h.predictionParticipants} predictors • ${p.totalSubmissions} grid submissions across ${p.activeWeekendsCount} GPs

Explore the live community report:
${window.location.origin}${window.location.pathname}#/community-stats`;
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/community-stats`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast?.('Community report link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast?.('Could not copy link to clipboard.', 'error');
    }
  };

  const handleCopySummary = async () => {
    if (!report) return;
    const summary = generateTextSummary(report);
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      showToast?.('Competition report summary copied!', 'success');
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      showToast?.('Could not copy summary to clipboard.', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (!report) return;
    const url = `${window.location.origin}${window.location.pathname}#/community-stats`;
    const summary = generateTextSummary(report);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'THE GRDX — Community Competition Report',
          text: summary,
          url: url,
        });
        showToast?.('Shared successfully!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCard = () => {
    if (!report) return;
    setGeneratingCard(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350; // Standard 4:5 social share aspect ratio
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(0.5, '#0d111a');
      bgGrad.addColorStop(1, '#07090e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      // Top Red Racing Accent Line
      ctx.fillStyle = '#e10600';
      ctx.fillRect(0, 0, 1080, 12);

      // Decorative diagonal racing pinstripes in background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = -500; x < 1500; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 500, 1350);
        ctx.stroke();
      }

      // Brand Badge
      ctx.fillStyle = '#e10600';
      ctx.beginPath();
      ctx.roundRect(80, 70, 95, 42, 6);
      ctx.fill();

      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('GRDX', 127, 99);

      ctx.textAlign = 'left';
      ctx.font = '800 24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('THE GRDX', 190, 98);

      ctx.font = '700 15px "Courier New", monospace';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('MOTORSPORT COMMUNITY PLATFORM', 192, 120);

      // Report Title
      ctx.font = '900 48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('COMMUNITY COMPETITION REPORT', 80, 200);

      // Subtitle & Period Pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(80, 225, 200, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ff7a00';
      ctx.font = '800 14px "Courier New", monospace';
      ctx.fillText(`PERIOD: ${report.periodLabel.toUpperCase()}`, 100, 248);

      const updatedStr = new Date(report.lastUpdatedAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      ctx.fillStyle = '#9ca3af';
      ctx.font = '500 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Verified community activity as of ${updatedStr}`, 300, 248);

      // 4 Key Headline Metric Cards
      const metrics = [
        { label: 'REGISTERED MEMBERS', val: String(report.headlineStats.registeredMembers), color: '#ffffff', sub: 'Motorsport enthusiasts' },
        { label: 'ACTIVE COMPETITORS', val: String(report.headlineStats.activeCompetitors), color: '#ff7a00', sub: `${report.headlineStats.participationRate}% participation rate` },
        { label: 'COMPETITION ACTIVITIES', val: String(report.headlineStats.totalCompetitionActivity), color: '#10b981', sub: 'Completed runs & picks' },
        { label: 'PREDICTION SUBMISSIONS', val: String(report.predictions.totalSubmissions), color: '#e10600', sub: 'Across official GPs' },
      ];

      const startY = 290;
      metrics.forEach((m, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cardX = 80 + col * (440 + 40);
        const cardY = startY + row * 160;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 440, 135, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = '800 14px "Courier New", monospace';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(m.label, cardX + 24, cardY + 36);

        ctx.font = '900 48px "Courier New", monospace';
        ctx.fillStyle = m.color;
        ctx.fillText(m.val, cardX + 24, cardY + 92);

        ctx.font = '500 14px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(m.sub, cardX + 24, cardY + 118);
      });

      // Feature Breakdown Section
      const featY = 640;
      ctx.font = '900 24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('COMPETITION FEATURE BREAKDOWN', 80, featY);

      const features = [
        {
          title: 'RACING TAG & MOTORSPORT QUIZ',
          iconColor: '#ffb000',
          stats: [
            { label: 'Racers', val: `${report.headlineStats.racingTagParticipants}` },
            { label: 'Total Attempts', val: `${report.racingTag.totalAttempts}` },
            { label: 'Avg IQ Score', val: `${report.racingTag.averagePercentage}%` },
            { label: 'Rookie / Apex / Analyst', val: `${report.racingTag.difficultyBreakdown.rookie} / ${report.racingTag.difficultyBreakdown.apex} / ${report.racingTag.difficultyBreakdown.race_analyst}` },
          ],
        },
        {
          title: 'STRATEGY ROOM SIMULATIONS',
          iconColor: '#00d2ff',
          stats: [
            { label: 'Strategists', val: `${report.headlineStats.strategyRoomParticipants}` },
            { label: 'Simulation Runs', val: `${report.strategyRoom.totalRuns}` },
            { label: 'Average Score', val: `${report.strategyRoom.averageScore}/100` },
            { label: 'Tactical / Multi-Stage', val: `${report.strategyRoom.roomTypeBreakdown.tactical} / ${report.strategyRoom.roomTypeBreakdown.multiStage}` },
          ],
        },
        {
          title: 'F1 PREDICTION BENCH',
          iconColor: '#e10600',
          stats: [
            { label: 'Predictors', val: `${report.headlineStats.predictionParticipants}` },
            { label: 'Grid Submissions', val: `${report.predictions.totalSubmissions}` },
            { label: 'Race Weekends', val: `${report.predictions.activeWeekendsCount}` },
            { label: 'Average Points', val: `${report.predictions.averageScore} pts` },
          ],
        },
      ];

      features.forEach((f, fIdx) => {
        const boxY = featY + 30 + fIdx * 170;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(80, boxY, 920, 145, 12);
        ctx.fill();
        ctx.stroke();

        // Accent indicator
        ctx.fillStyle = f.iconColor;
        ctx.beginPath();
        ctx.roundRect(80, boxY, 8, 145, [12, 0, 0, 12]);
        ctx.fill();

        ctx.font = '800 18px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(f.title, 110, boxY + 40);

        f.stats.forEach((st, sIdx) => {
          const colX = 110 + sIdx * 215;
          ctx.font = '700 12px "Courier New", monospace';
          ctx.fillStyle = '#9ca3af';
          ctx.fillText(st.label.toUpperCase(), colX, boxY + 80);

          ctx.font = '900 22px "Courier New", monospace';
          ctx.fillStyle = f.iconColor;
          ctx.fillText(st.val, colX, boxY + 112);
        });
      });

      // Card Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(80, 1210, 920, 1);

      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Built for fans to learn, predict, and strategize motorsport together.', 80, 1255);

      ctx.font = '800 16px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText('THEGRDX.COM', 1000, 1255);

      ctx.font = '500 13px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'left';
      ctx.fillText('Verified aggregate metrics • Privacy protected • No individual racer data exposed', 80, 1285);

      // Trigger file download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `THE-GRDX-Community-Report-${report.period}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast?.('Community report card downloaded!', 'success');
    } catch (err) {
      console.error('Failed to generate report card image:', err);
      showToast?.('Could not download image. Use copy link or summary instead.', 'error');
    } finally {
      setGeneratingCard(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* HEADER SECTION */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span
              style={{
                background: 'rgba(225, 6, 0, 0.15)',
                color: 'var(--f1-red)',
                border: '1px solid rgba(225, 6, 0, 0.3)',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
              }}
            >
              PUBLIC COMMUNITY REPORT
            </span>
            <span
              style={{
                background: 'rgba(0, 210, 255, 0.1)',
                color: 'var(--telemetry-cyan)',
                border: '1px solid rgba(0, 210, 255, 0.25)',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldCheck size={12} />
              VERIFIED AGGREGATE DATA
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
                THE GRDX — Community Competition Report
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '780px', lineHeight: 1.5 }}>
                A look at our community's participation, performance, and growth across Racing Tag, Strategy Room, and F1 Predictions.
              </p>
            </div>

            {/* ACTION TOOLBAR: SHARE & EXPORT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleNativeShare}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                }}
                title="Share this community report"
              >
                <Share2 size={14} />
                <span>Share Report</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                }}
                title="Copy direct shareable link"
              >
                {copiedLink ? <Check size={14} color="var(--telemetry-green)" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                }}
                title="Copy ready-to-share text summary"
              >
                {copiedSummary ? <Check size={14} color="var(--telemetry-green)" /> : <Sparkles size={14} color="#ffb000" />}
                <span>{copiedSummary ? 'Copied Text!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadCard}
                disabled={generatingCard || !report}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                }}
                title="Download branded 4:5 image report card"
              >
                <Download size={14} />
                <span>{generatingCard ? 'Generating...' : 'Download Card'}</span>
              </button>
            </div>
          </div>

          {/* PERIOD FILTER BUTTONS & LAST UPDATED */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {[
                { id: 'all', label: 'All Time' },
                { id: '30d', label: 'Last 30 Days' },
                { id: '7d', label: 'Last 7 Days' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id as AnalyticsTimeRange)}
                  style={{
                    background: timeRange === tab.id ? 'var(--f1-red)' : 'transparent',
                    color: timeRange === tab.id ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {report && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <Clock size={13} />
                <span>Last updated: {new Date(report.lastUpdatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <button
                  onClick={() => fetchReport(timeRange)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', marginLeft: '0.4rem' }}
                  title="Refresh stats"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && !report && (
          <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--f1-red)', margin: '0 auto 1rem auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Loading Community Report...</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Aggregating community participation and competition records</div>
          </div>
        )}

        {error && (
          <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', color: '#f87171', textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{error}</p>
            <button onClick={() => fetchReport(timeRange)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* REPORT CONTENT */}
        {report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. HEADLINE KPI METRICS */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                COMMUNITY HEADLINE METRICS ({report.periodLabel.toUpperCase()})
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Registered Members */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>REGISTERED MEMBERS</span>
                    <Users size={16} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                    {report.headlineStats.registeredMembers}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Motorsport fans in community
                  </div>
                </div>

                {/* Active Competitors */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>ACTIVE COMPETITORS</span>
                    <TrendingUp size={16} color="#ff7a00" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ff7a00', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                    {report.headlineStats.activeCompetitors}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ff7a00', marginTop: '0.3rem', fontWeight: 700 }}>
                    {report.headlineStats.participationRate}% participation rate
                  </div>
                </div>

                {/* Total Competition Activity */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>TOTAL ACTIVITIES</span>
                    <Trophy size={16} color="var(--telemetry-green)" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                    {report.headlineStats.totalCompetitionActivity}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Quizzes, simulations & predictions
                  </div>
                </div>

                {/* Feature Reach */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>FEATURE REACH</span>
                    <Target size={16} color="var(--telemetry-cyan)" />
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Racing Tag:</span>
                      <span style={{ color: '#ffb000' }}>{report.headlineStats.racingTagParticipants} users</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Strategy Room:</span>
                      <span style={{ color: 'var(--telemetry-cyan)' }}>{report.headlineStats.strategyRoomParticipants} users</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>F1 Predictions:</span>
                      <span style={{ color: 'var(--f1-red)' }}>{report.headlineStats.predictionParticipants} users</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Definition Notice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Info size={13} />
                <span><strong>Definition of Total Activity:</strong> {report.headlineStats.activityDefinition} Page views and uncompleted scenario openings are strictly excluded.</span>
              </div>
            </div>

            {/* 2. FEATURE DEEP-DIVES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              
              {/* RACING TAG CARD */}
              <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255, 176, 0, 0.15)', padding: '0.45rem', borderRadius: '8px', color: '#ffb000' }}>
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>Racing Tag & Quiz</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Motorsport knowledge & regulations</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL ATTEMPTS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffb000', fontFamily: 'var(--font-mono)' }}>
                      {report.racingTag.totalAttempts}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AVG ACCURACY</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {report.racingTag.averagePercentage}%
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    ATTEMPTS BY DIFFICULTY
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '90px', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ROOKIE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{report.racingTag.difficultyBreakdown.rookie}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '90px', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>APEX</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffb000', fontFamily: 'var(--font-mono)' }}>{report.racingTag.difficultyBreakdown.apex}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '90px', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ANALYST</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)' }}>{report.racingTag.difficultyBreakdown.race_analyst}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    EARNED RACING TAG TIERS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {Object.entries(report.racingTag.tierDistribution).map(([tierName, count]) => (
                      <div key={tierName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{tierName}</span>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: count > 0 ? '#ffb000' : 'var(--text-muted)' }}>{count} racers</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STRATEGY ROOM CARD */}
              <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(0, 210, 255, 0.15)', padding: '0.45rem', borderRadius: '8px', color: 'var(--telemetry-cyan)' }}>
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>Strategy Room</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tactical, pit stop & race simulations</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL RUNS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {report.strategyRoom.totalRuns}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AVG SCORE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {report.strategyRoom.averageScore}/100
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    RUNS BY ROOM TYPE
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '90px', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TACTICAL</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{report.strategyRoom.roomTypeBreakdown.tactical}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '90px', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MULTI-STAGE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)' }}>{report.strategyRoom.roomTypeBreakdown.multiStage}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '90px', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PRE-RACE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ff7a00', fontFamily: 'var(--font-mono)' }}>{report.strategyRoom.roomTypeBreakdown.preRace}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    TOP SCENARIOS PLAYED
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {report.strategyRoom.popularScenarios.slice(0, 4).map(sc => (
                      <div key={sc.scenarioId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }}>
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>{sc.title}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--telemetry-cyan)', fontWeight: 800 }}>{sc.runs} runs ({sc.avgScore} pts)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* F1 PREDICTIONS CARD */}
              <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(225, 6, 0, 0.15)', padding: '0.45rem', borderRadius: '8px', color: 'var(--f1-red)' }}>
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>F1 Prediction Bench</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Podium, pole & race wildcard picks</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SUBMISSIONS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)' }}>
                      {report.predictions.totalSubmissions}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AVG SCORE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {report.predictions.averageScore} pts
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    PARTICIPATION BY GRAND PRIX
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {report.predictions.byWeekend.map(w => (
                      <div key={w.raceWeekendId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }}>
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>{w.grandPrixName}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--f1-red)', fontWeight: 800 }}>{w.submissionsCount} picks • {w.averageScore} avg</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(225, 6, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(225, 6, 0, 0.15)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Picks lock 5 minutes before session formation lap. Scoring is validated against official FIA results.
                </div>
              </div>
            </div>

            {/* 3. POPULAR SCENARIOS & TRENDS TABLE */}
            <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>Community Simulation Trends & Scenarios</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completion rates and tactical scores across scenarios</div>
                </div>
                <Link to="/strategy" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                  <span>Try Scenarios</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="timing-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>SCENARIO TITLE</th>
                      <th>MODE</th>
                      <th style={{ textAlign: 'center' }}>TOTAL RUNS</th>
                      <th style={{ textAlign: 'center' }}>COMPLETION RATE</th>
                      <th style={{ textAlign: 'right' }}>AVG SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.strategyRoom.popularScenarios.map(sc => (
                      <tr key={sc.scenarioId}>
                        <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>{sc.title}</td>
                        <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {(sc.mode || 'challenge').toUpperCase()}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                          {sc.runs}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)' }}>
                          {sc.completionRate}%
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-cyan)' }}>
                          {sc.avgScore}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. PRIVACY & TRANSPARENCY NOTICE */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={20} color="var(--telemetry-cyan)" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>Privacy & Data Integrity Guaranteed</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    This community report publishes aggregated metrics only. No private racer details, usernames, emails, or personal logs are exposed.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/about" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 700 }}>
                  About THE GRDX →
                </Link>
                <Link to="/predictions" className="btn btn-primary btn-sm" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  Compete on The Grid
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityStatsPage;
