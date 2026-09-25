import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, Sparkles, Lock, Trophy, Zap, ShieldAlert, Award } from 'lucide-react';
import { Prediction, PredictionRound, RaceWeekend, Driver, User } from '../../types';

interface PredictionStoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction;
  round: PredictionRound;
  weekend: RaceWeekend | null;
  currentUser: User | null;
  drivers: Driver[];
}

const TEAM_COLORS: Record<string, string> = {
  mercedes: '#00d2be',
  mclaren: '#ff8000',
  ferrari: '#e80020',
  redbull: '#3671c6',
  'red bull': '#3671c6',
  williams: '#00a0de',
  astonmartin: '#229971',
  'aston martin': '#229971',
  alpine: '#0093cc',
  haas: '#b6babd',
  sauber: '#52e252',
  audi: '#52e252',
  racingbulls: '#6692ff',
  'racing bulls': '#6692ff',
  rb: '#6692ff',
  cadillac: '#ffd700',
};

export const PredictionStoryShareModal: React.FC<PredictionStoryShareModalProps> = ({
  isOpen,
  onClose,
  prediction,
  round,
  weekend,
  currentUser,
  drivers,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getDriver = (driverId?: string): Driver | undefined => {
    if (!driverId) return undefined;
    return drivers.find(
      d =>
        d.id.toLowerCase() === driverId.toLowerCase() ||
        d.lastName.toLowerCase() === driverId.toLowerCase() ||
        (d.code && d.code.toLowerCase() === driverId.toLowerCase())
    );
  };

  const getDriverDisplay = (driverId?: string) => {
    if (!driverId) return { name: '—', number: '', team: 'F1', color: '#e10600' };
    const d = getDriver(driverId);
    if (d) {
      const teamKey = Object.keys(TEAM_COLORS).find(k => d.team.toLowerCase().includes(k)) || 'ferrari';
      return {
        name: `${d.firstName} ${d.lastName}`,
        number: d.number ? `#${d.number}` : '',
        team: d.team,
        color: TEAM_COLORS[teamKey] || '#e10600',
        code: d.code || '',
      };
    }
    if (driverId.startsWith('test-')) {
      return {
        name: 'Test Driver ' + driverId.replace('test-', '').toUpperCase(),
        number: '#99',
        team: 'Test Bench Racing',
        color: '#00d2ff',
        code: 'TST',
      };
    }
    return { name: driverId.toUpperCase(), number: '', team: 'F1', color: '#e10600' };
  };

  const pData = prediction.predictionData || {};
  const p1 = getDriverDisplay(pData.p1);
  const p2 = getDriverDisplay(pData.p2);
  const p3 = getDriverDisplay(pData.p3);
  const fl = getDriverDisplay(pData.fastestLap);
  const dotd = getDriverDisplay(pData.driverOfTheDay);

  const grandPrixTitle = weekend?.raceName || round.title || 'Formula 1 Grand Prix';
  const circuitTitle = (typeof weekend?.circuit === 'object' && weekend.circuit?.name) ? weekend.circuit.name : (weekend?.country || 'Grand Prix Circuit');
  const userDisplayName = currentUser?.displayName || currentUser?.username || 'F1 Strategist';
  const userHandle = currentUser?.username ? `@${currentUser.username}` : '@thegrid_racer';

  // Story Text Generator for Copying
  const generateStoryText = () => {
    const lines = [
      `🏎️ MY F1 PICKS LOCKED IN! 🔒`,
      `📍 ${grandPrixTitle} (${weekend?.flag || '🏁'})`,
      ``,
      `🥇 P1: ${p1.name} (${p1.team})`,
      `🥈 P2: ${p2.name} (${p2.team})`,
      `🥉 P3: ${p3.name} (${p3.team})`,
      fl.name !== '—' ? `⚡ Fastest Lap: ${fl.name}` : '',
      dotd.name !== '—' ? `⭐ Driver of the Day: ${dotd.name}` : '',
      pData.safetyCar ? `🚨 Safety Car: ${pData.safetyCar}` : '',
      pData.redFlag ? `🚩 Red Flag: ${pData.redFlag}` : '',
      ``,
      `Think you can beat my strategy? Lock in your picks now on The Grid:`,
      `https://hj1418.github.io/F1-Prediction-Wall/`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateStoryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_e) {
      // Fallback
    }
  };

  // Render High-Res (1080x1920) Story to Canvas
  const drawStoryCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Deep Motorsport Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.4, '#10141f');
    bgGrad.addColorStop(1, '#07090e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle carbon grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1080; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1920);
      ctx.stroke();
    }
    for (let y = 0; y < 1920; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1080, y);
      ctx.stroke();
    }

    // Glowing Neon Accent Gradients
    const redGlow = ctx.createRadialGradient(900, 150, 50, 900, 150, 550);
    redGlow.addColorStop(0, 'rgba(225, 6, 0, 0.35)');
    redGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = redGlow;
    ctx.fillRect(0, 0, 1080, 700);

    const cyanGlow = ctx.createRadialGradient(150, 1400, 50, 150, 1400, 600);
    cyanGlow.addColorStop(0, 'rgba(0, 230, 118, 0.25)');
    cyanGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = cyanGlow;
    ctx.fillRect(0, 800, 1080, 1120);

    // 2. Top Header Brand Bar
    ctx.fillStyle = 'rgba(22, 28, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(80, 90, 920, 100, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Red tag
    ctx.fillStyle = '#e10600';
    ctx.beginPath();
    ctx.roundRect(105, 112, 120, 56, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('THE GRID', 118, 150);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px monospace';
    ctx.fillText('OFFICIAL PREDICTION PASS', 250, 148);

    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.arc(930, 140, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '800 20px monospace';
    ctx.fillText('LOCKED', 835, 147);

    // 3. Grand Prix Title Hero Card
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px sans-serif';
    ctx.fillText(grandPrixTitle.toUpperCase(), 80, 280);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 30px sans-serif';
    ctx.fillText(`📍 ${circuitTitle} • ${weekend?.flag || '🏁'} 2026 Season`, 80, 335);

    // 4. User Profile Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(80, 380, 920, 110, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Avatar Circle
    ctx.fillStyle = '#e10600';
    ctx.beginPath();
    ctx.arc(145, 435, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(userDisplayName.charAt(0).toUpperCase(), 145, 446);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px sans-serif';
    ctx.fillText(userDisplayName, 205, 428);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 24px monospace';
    ctx.fillText(`${userHandle} • Verified Strategy Picks`, 205, 464);

    // 5. Section Header: PODIUM PREDICTIONS
    ctx.fillStyle = '#e10600';
    ctx.font = '900 24px monospace';
    ctx.fillText('🏎️ PODIUM PREDICTIONS', 80, 555);

    // Podium Cards Helper
    const drawPodiumCard = (
      y: number,
      posBadge: string,
      badgeColor: string,
      label: string,
      driver: { name: string; number: string; team: string; color: string }
    ) => {
      // Card Body
      ctx.fillStyle = 'rgba(18, 24, 37, 0.92)';
      ctx.beginPath();
      ctx.roundRect(80, y, 920, 150, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Team Color Stripe on left
      ctx.fillStyle = driver.color || '#e10600';
      ctx.beginPath();
      ctx.roundRect(80, y, 14, 150, [20, 0, 0, 20]);
      ctx.fill();

      // Position Circle
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(155, y + 75, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0a0d14';
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(posBadge, 155, y + 88);
      ctx.textAlign = 'left';

      // Position Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 20px monospace';
      ctx.fillText(label, 225, y + 55);

      // Driver Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px sans-serif';
      ctx.fillText(driver.name, 225, y + 105);

      // Car Number + Team Badge on Right
      if (driver.number) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(850, y + 35, 120, 80, 14);
        ctx.fill();

        ctx.fillStyle = driver.color || '#ffffff';
        ctx.font = '900 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(driver.number, 910, y + 90);
        ctx.textAlign = 'left';
      }
    };

    // Draw P1, P2, P3
    drawPodiumCard(580, 'P1', '#ffd700', '1ST PLACE • RACE WINNER', p1);
    drawPodiumCard(755, 'P2', '#e2e8f0', '2ND PLACE • RUNNER-UP', p2);
    drawPodiumCard(930, 'P3', '#cd7f32', '3RD PLACE • PODIUM FINISHER', p3);

    // 6. FASTEST LAP & DRIVER OF THE DAY
    const drawMiniCard = (x: number, y: number, width: number, tag: string, tagColor: string, driver: { name: string; number: string; team: string; color: string }) => {
      ctx.fillStyle = 'rgba(18, 24, 37, 0.92)';
      ctx.beginPath();
      ctx.roundRect(x, y, width, 140, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = tagColor;
      ctx.font = '800 20px monospace';
      ctx.fillText(tag, x + 30, y + 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(driver.name, x + 30, y + 96);
    };

    drawMiniCard(80, 1110, 445, '⚡ FASTEST LAP', '#b966ff', fl);
    drawMiniCard(555, 1110, 445, '⭐ DRIVER OF THE DAY', '#00e676', dotd);

    // 7. RACE DISRUPTIONS & WILDCARDS (Grid of 4)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '900 24px monospace';
    ctx.fillText('🚨 RACE DISRUPTIONS & WILDCARDS', 80, 1295);

    const drawPill = (x: number, y: number, w: number, label: string, val: string, color: string) => {
      ctx.fillStyle = 'rgba(18, 24, 37, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, 95, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 20px sans-serif';
      ctx.fillText(label, x + 24, y + 42);

      ctx.fillStyle = color;
      ctx.font = '900 28px monospace';
      ctx.fillText(val, x + 24, y + 76);
    };

    const scVal = pData.safetyCar || 'NO';
    const vscVal = pData.virtualSafetyCar || 'NO';
    const rfVal = pData.redFlag || 'NO';
    const yfVal = pData.yellowFlag || 'YES';

    drawPill(80, 1320, 215, 'Safety Car', scVal, scVal === 'YES' ? '#ffcc00' : '#64748b');
    drawPill(315, 1320, 215, 'VSC Deployed', vscVal, vscVal === 'YES' ? '#ff9800' : '#64748b');
    drawPill(550, 1320, 215, 'Red Flag', rfVal, rfVal === 'YES' ? '#ff3b30' : '#64748b');
    drawPill(785, 1320, 215, 'Yellow Flag', yfVal, yfVal === 'YES' ? '#eab308' : '#64748b');

    // 8. CHALLENGE BANNER (Call to Action)
    const ctaGrad = ctx.createLinearGradient(80, 1460, 1000, 1680);
    ctaGrad.addColorStop(0, 'rgba(225, 6, 0, 0.25)');
    ctaGrad.addColorStop(1, 'rgba(22, 28, 42, 0.95)');
    ctx.fillStyle = ctaGrad;
    ctx.beginPath();
    ctx.roundRect(80, 1450, 920, 200, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(225, 6, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ff4d4d';
    ctx.font = '900 22px monospace';
    ctx.fillText('🏁 COMMUNITY CHALLENGE', 130, 1515);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px sans-serif';
    ctx.fillText('CAN YOU BEAT MY PICKS?', 130, 1570);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 26px sans-serif';
    ctx.fillText('Predict before lights out • Climb the Leaderboard', 130, 1615);

    // 9. Bottom Footer URL
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(80, 1685, 920, 120, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('hj1418.github.io/F1-Prediction-Wall', 540, 1755);
    ctx.textAlign = 'left';

    return canvas;
  };

  const handleDownloadImage = () => {
    setDownloading(true);
    try {
      const canvas = drawStoryCanvas();
      const link = document.createElement('a');
      link.download = `F1_Prediction_Story_${(weekend?.raceName || 'GrandPrix').replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    const canvas = drawStoryCanvas();
    if (navigator.share) {
      canvas.toBlob(async blob => {
        if (!blob) return;
        try {
          const file = new File([blob], `f1-prediction-story.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${grandPrixTitle} - My F1 Predictions`,
              text: `Check out my locked picks for the ${grandPrixTitle} on The Grid! Think you can beat my strategy?`,
            });
          } else {
            await navigator.share({
              title: `${grandPrixTitle} - My F1 Predictions`,
              text: generateStoryText(),
              url: 'https://hj1418.github.io/F1-Prediction-Wall/',
            });
          }
        } catch (_err) {
          // Fallback to text copy
          handleCopyText();
        }
      });
    } else {
      handleCopyText();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'linear-gradient(145deg, #121722, #0a0d14)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          maxWidth: '850px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(225, 6, 0, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--f1-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Share2 size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase' }}>
                Share Your Predictions
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Download an Instagram/WhatsApp 9:16 Story card or share your picks with friends
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.75rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr',
            gap: '1.75rem',
            overflowY: 'auto',
          }}
          className="story-modal-grid"
        >
          {/* Story Card Visual Preview (9:16 vertical ratio) */}
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              aspectRatio: '9 / 16',
              borderRadius: '20px',
              border: '2px solid rgba(225, 6, 0, 0.4)',
              background: 'linear-gradient(180deg, #101522 0%, #0a0d14 100%)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(225, 6, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Red glow */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '140px',
                height: '140px',
                background: 'radial-gradient(circle, rgba(225, 6, 0, 0.4) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div>
              {/* Brand bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ background: 'var(--f1-red)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    THE GRID
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    PREDICTIONS
                  </span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'var(--telemetry-green)', fontWeight: 800 }}>
                  <Lock size={10} /> LOCKED
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.15, color: '#fff' }}>
                {grandPrixTitle}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: '0.85rem' }}>
                {circuitTitle} • {weekend?.flag || '🏁'}
              </div>

              {/* User badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.35rem 0.55rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--f1-red)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {userDisplayName.charAt(0)}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff' }}>{userDisplayName}</div>
              </div>

              {/* Podium Picks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.6rem', borderRadius: '8px', borderLeft: `3px solid ${p1.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffd700' }}>P1</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>{p1.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: p1.color }}>{p1.number}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.6rem', borderRadius: '8px', borderLeft: `3px solid ${p2.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e2e8f0' }}>P2</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>{p2.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: p2.color }}>{p2.number}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.6rem', borderRadius: '8px', borderLeft: `3px solid ${p3.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#cd7f32' }}>P3</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>{p3.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: p3.color }}>{p3.number}</span>
                </div>
              </div>

              {/* Extra chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.65rem' }}>
                <div style={{ background: 'rgba(185, 102, 255, 0.08)', border: '1px solid rgba(185, 102, 255, 0.25)', padding: '0.3rem 0.45rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.58rem', color: '#c084fc', fontWeight: 800 }}>⚡ FASTEST LAP</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fl.name}</div>
                </div>
                <div style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.25)', padding: '0.3rem 0.45rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--telemetry-green)', fontWeight: 800 }}>⭐ DRIVER OF DAY</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dotd.name}</div>
                </div>
              </div>

              {/* Disruption indicators */}
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: pData.safetyCar === 'YES' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: pData.safetyCar === 'YES' ? '#fde047' : '#64748b', fontWeight: 800 }}>
                  SC: {pData.safetyCar || 'NO'}
                </span>
                <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: pData.virtualSafetyCar === 'YES' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: pData.virtualSafetyCar === 'YES' ? '#fdba74' : '#64748b', fontWeight: 800 }}>
                  VSC: {pData.virtualSafetyCar || 'NO'}
                </span>
                <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: pData.redFlag === 'YES' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: pData.redFlag === 'YES' ? '#fca5a5' : '#64748b', fontWeight: 800 }}>
                  RED FLAG: {pData.redFlag || 'NO'}
                </span>
              </div>
            </div>

            {/* Bottom challenge badge */}
            <div style={{ background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.25), rgba(22, 28, 42, 0.9))', padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(225, 6, 0, 0.4)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#fff' }}>CAN YOU BEAT MY PICKS?</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>hj1418.github.io/F1-Prediction-Wall</div>
            </div>
          </div>

          {/* Action Panel on Right */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} color="var(--f1-red)" />
                <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Share to Instagram & WhatsApp
                </span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
                Show Your Grid Strategy
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Download a high-resolution 9:16 vertical story graphic custom rendered with your official podium picks, driver numbers, and race wildcards. Perfect for Instagram Stories, WhatsApp Status, or Snapchat!
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', fontSize: '0.95rem' }}
                >
                  <Download size={18} />
                  {downloading ? 'Rendering HD Story Image...' : 'Download Story Image (PNG)'}
                </button>

                {'share' in navigator && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderColor: 'var(--border-medium)' }}
                  >
                    <Share2 size={16} /> Share via Phone / Apps
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
                >
                  {copied ? <Check size={16} color="var(--telemetry-green)" /> : <Copy size={16} />}
                  {copied ? 'Story Caption Copied!' : 'Copy Caption & Text'}
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                💡 How to post to Stories:
              </div>
              <div>1. Tap <strong>Download Story Image</strong> to save the 1080×1920 graphic to your camera roll / device.</div>
              <div>2. Open Instagram or WhatsApp, create a new Story / Status, and select the image!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
