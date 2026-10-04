/**
 * storyShareService.ts
 *
 * Professional 9:16 vertical story card generator (1080 x 1920) for The Grid.
 * Supports:
 * 1. User Result Story: Scored prediction result card (+30 PTS, event name, rank, public username).
 * 2. Admin Leaderboard Story: Championship standings story (strictly guarded by role === 'admin').
 *
 * Sharing mechanics:
 * - Native Web Share API with image file sharing where supported
 * - Instant high-res PNG download fallback for desktop & unsupported browsers
 * - Copy link fallback
 * - Privacy invariant: Strictly public username only; zero email or private account information.
 */

import { User } from '../../types';

export interface UserResultStoryData {
  username: string;
  eventName: string;
  pointsEarned: number | string;
  rank?: number;
  season?: number;
  roundType?: string;
  racesParticipated?: number;
  totalPoints?: number;
}

export interface LeaderboardStoryEntry {
  rank: number;
  username: string;
  points: number;
}

export interface GlobalLeaderboardStoryData {
  season?: number;
  championshipTitle?: string;
  entries: LeaderboardStoryEntry[];
  totalRacers?: number;
  latestEventName?: string;
}

/**
 * Sanitizes a username so no email address or private info is ever leaked onto a public story.
 */
export function sanitizePublicUsername(rawUsername: string): string {
  if (!rawUsername) return 'RACER';
  let cleaned = rawUsername.trim();
  // Strip email domains if accidentally passed
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@')[0];
  }
  // Sanitize to max 24 chars for visual integrity
  if (cleaned.length > 24) {
    cleaned = cleaned.slice(0, 24);
  }
  return cleaned;
}

/**
 * Formats points string (e.g. 30 -> "+30 PTS", "30 PTS" -> "+30 PTS", 0 -> "+0 PTS")
 */
export function formatStoryPoints(points: number | string): string {
  if (typeof points === 'string') {
    const num = parseInt(points.replace(/[^0-9-]/g, ''), 10);
    if (!isNaN(num)) {
      return num >= 0 ? `+${num} PTS` : `${num} PTS`;
    }
  }
  const n = typeof points === 'number' ? points : 0;
  return n >= 0 ? `+${n} PTS` : `${n} PTS`;
}

/**
 * Validates admin authorization before generating global leaderboard story.
 * Strict code-level authorization (not just UI hiding).
 */
export function assertAdminAuthorized(user: { role?: string } | null | undefined): void {
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED: Only verified administrators can generate and share global championship leaderboard stories.');
  }
}

/**
 * Helper to draw rounded rectangle on canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws the signature "The Grid" premium dark background with carbon/speed subtle grid lines.
 */
function drawStoryBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Rich deep dark gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0c0d12');
  bgGrad.addColorStop(0.3, '#08080a');
  bgGrad.addColorStop(0.7, '#050507');
  bgGrad.addColorStop(1, '#020203');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle carbon grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const gridSize = 48;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Red racing stripe accent on the top left/right
  const stripeGrad = ctx.createLinearGradient(0, 0, width, 0);
  stripeGrad.addColorStop(0, '#E10600');
  stripeGrad.addColorStop(0.5, '#FF3B30');
  stripeGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(0, 0, width, 8);

  // Subtle ambient radial glow behind the center
  const glowGrad = ctx.createRadialGradient(width / 2, height * 0.45, 100, width / 2, height * 0.45, 600);
  glowGrad.addColorStop(0, 'rgba(225, 6, 0, 0.08)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

/**
 * Draws the standard header for The Grid stories
 */
function drawStoryHeader(ctx: CanvasRenderingContext2D, width: number, season: number = 2026, subtitle: string) {
  ctx.save();
  ctx.textAlign = 'center';

  // Motorsport pill badge
  const badgeWidth = 240;
  const badgeHeight = 44;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 120;
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 22);
  ctx.fillStyle = 'rgba(225, 6, 0, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(225, 6, 0, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 18px "Titillium Web", -apple-system, sans-serif';
  ctx.fillStyle = '#E10600';
  ctx.fillText('FORMULA 1 PREDICTOR', width / 2, badgeY + 28);

  // Main Brand Name
  ctx.font = '900 64px "Formula1", "Titillium Web", Impact, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '6px';
  ctx.fillText('THE GRID', width / 2, 230);

  // Season / Championship subtitle
  ctx.font = '600 24px "Titillium Web", -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(`${season} ${subtitle.toUpperCase()}`, width / 2, 275);

  // Sleek dividing hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 310);
  ctx.lineTo(width - 140, 310);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the standard footer for The Grid stories
 */
function drawStoryFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.textAlign = 'center';

  const footerY = height - 120;
  // Hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(180, footerY);
  ctx.lineTo(width - 180, footerY);
  ctx.stroke();

  // Branding text
  ctx.font = '700 22px "Formula1", "Titillium Web", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('THE GRID', width / 2, footerY + 45);

  ctx.font = '500 16px "Titillium Web", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('thegridf1.com  •  Compete. Predict. Dominate.', width / 2, footerY + 75);

  ctx.restore();
}

/**
 * Generates an HTML5 Canvas for a User Result Story (9:16, 1080 x 1920)
 */
export function generateUserResultStoryCanvas(data: UserResultStoryData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  const width = canvas.width;
  const height = canvas.height;
  const username = sanitizePublicUsername(data.username).toUpperCase();
  const season = data.season || 2026;
  const pointsFormatted = formatStoryPoints(data.pointsEarned);
  const eventName = (data.eventName || 'GRAND PRIX').toUpperCase();

  // 1. Background
  drawStoryBackground(ctx, width, height);

  // 2. Header
  drawStoryHeader(ctx, width, season, 'World Championship');

  // 3. Central Hero Result Card
  const cardX = 90;
  const cardY = 360;
  const cardW = width - 180;
  const cardH = 1100;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, 'rgba(25, 28, 38, 0.85)');
  cardGrad.addColorStop(1, 'rgba(12, 14, 19, 0.95)');
  ctx.fillStyle = cardGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subtle red racing accent on left of card
  ctx.save();
  ctx.beginPath();
  drawRoundedRect(ctx, cardX, cardY, 8, cardH, 4);
  ctx.fillStyle = '#E10600';
  ctx.fill();
  ctx.restore();

  // Content inside Card
  ctx.save();
  ctx.textAlign = 'center';

  // Event Category / Tag
  ctx.font = '700 20px "Titillium Web", sans-serif';
  ctx.fillStyle = '#FF3B30';
  ctx.fillText('🏁 PREDICTION RESULT', width / 2, cardY + 90);

  // Event Name with graceful multi-line wrapping
  ctx.font = '900 48px "Formula1", "Titillium Web", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  if (eventName.length > 20) {
    ctx.font = '900 38px "Formula1", "Titillium Web", sans-serif';
  }
  ctx.fillText(eventName, width / 2, cardY + 160);

  // Large Scoring Badge
  const scoreBoxY = cardY + 230;
  const scoreBoxH = 340;
  drawRoundedRect(ctx, cardX + 50, scoreBoxY, cardW - 100, scoreBoxH, 24);
  const scoreBgGrad = ctx.createLinearGradient(0, scoreBoxY, 0, scoreBoxY + scoreBoxH);
  scoreBgGrad.addColorStop(0, 'rgba(225, 6, 0, 0.15)');
  scoreBgGrad.addColorStop(1, 'rgba(225, 6, 0, 0.03)');
  ctx.fillStyle = scoreBgGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(225, 6, 0, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Giant Points Display
  ctx.font = '900 120px "Formula1", "Titillium Web", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(pointsFormatted, width / 2, scoreBoxY + 180);

  ctx.font = '700 24px "Titillium Web", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('EARNED THIS ROUND', width / 2, scoreBoxY + 245);

  // Grid Rank Indicator (if available)
  if (data.rank && data.rank > 0) {
    const rankPillW = 340;
    const rankPillH = 50;
    const rankPillX = (width - rankPillW) / 2;
    const rankPillY = scoreBoxY + scoreBoxH + 50;
    drawRoundedRect(ctx, rankPillX, rankPillY, rankPillW, rankPillH, 25);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.font = '800 24px "Titillium Web", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`P${data.rank} ON THE GRID`, width / 2, rankPillY + 34);
  }

  // Racer Section
  const racerSectionY = cardY + 740;
  ctx.font = '600 20px "Titillium Web", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText('RACER TELEMETRY', width / 2, racerSectionY);

  // Public Username (prominent, never cropped)
  ctx.font = '900 52px "Formula1", "Titillium Web", sans-serif';
  if (username.length > 14) {
    ctx.font = '900 40px "Formula1", "Titillium Web", sans-serif';
  }
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(username, width / 2, racerSectionY + 65);

  // Season Total context (if available)
  if (data.totalPoints !== undefined && data.totalPoints !== null) {
    ctx.font = '600 24px "Titillium Web", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`SEASON TOTAL: ${data.totalPoints} PTS`, width / 2, racerSectionY + 115);
  }

  // Verified Authenticity Watermark Stamp
  const stampY = cardY + cardH - 80;
  ctx.font = '700 16px "Titillium Web", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('OFFICIAL RACER VERIFICATION  •  THE GRID MOTORSPORT', width / 2, stampY);

  ctx.restore();

  // 4. Footer
  drawStoryFooter(ctx, width, height);

  return canvas;
}

/**
 * Generates an HTML5 Canvas for the Global Leaderboard Story (Admin Only) (9:16, 1080 x 1920)
 */
export function generateLeaderboardStoryCanvas(
  data: GlobalLeaderboardStoryData,
  currentUser: { role?: string } | null | undefined
): HTMLCanvasElement {
  // Strict permission check
  assertAdminAuthorized(currentUser);

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  const width = canvas.width;
  const height = canvas.height;
  const season = data.season || 2026;
  const entries = (data.entries || []).slice(0, 10); // Top 10

  // 1. Background
  drawStoryBackground(ctx, width, height);

  // 2. Header
  drawStoryHeader(ctx, width, season, 'World Championship');

  // 3. Leaderboard Title Card
  const titleY = 350;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 44px "Formula1", "Titillium Web", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('WORLD STANDINGS', width / 2, titleY);

  ctx.font = '600 20px "Titillium Web", sans-serif';
  ctx.fillStyle = '#E10600';
  ctx.fillText(
    data.latestEventName ? `UPDATED AFTER ${data.latestEventName.toUpperCase()}` : 'OFFICIAL GLOBAL LEADERBOARD',
    width / 2,
    titleY + 38
  );
  ctx.restore();

  // 4. Standings Table Container
  const tableX = 90;
  const tableY = 430;
  const tableW = width - 180;
  const rowHeight = 98;
  const maxRows = Math.min(entries.length, 9);
  const tableH = maxRows * rowHeight + 30;

  drawRoundedRect(ctx, tableX, tableY, tableW, tableH, 28);
  ctx.fillStyle = 'rgba(18, 20, 28, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Render rows
  entries.slice(0, maxRows).forEach((entry, idx) => {
    const rowY = tableY + 15 + idx * rowHeight;
    const isTop1 = entry.rank === 1;
    const isTop3 = entry.rank <= 3;

    // Podium highlight row background
    if (isTop3) {
      drawRoundedRect(ctx, tableX + 8, rowY + 4, tableW - 16, rowHeight - 8, 16);
      if (isTop1) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fill();
      }
    }

    // Rank Number
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = isTop3 ? '900 32px "Formula1", sans-serif' : '700 26px "Formula1", sans-serif';
    ctx.fillStyle = isTop1 ? '#FFD700' : isTop3 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(`${entry.rank}`, tableX + 50, rowY + 54);

    // Racer Username
    ctx.textAlign = 'left';
    ctx.font = isTop1 ? '800 30px "Titillium Web", sans-serif' : '700 26px "Titillium Web", sans-serif';
    ctx.fillStyle = isTop1 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)';
    const cleanUser = sanitizePublicUsername(entry.username);
    ctx.fillText(cleanUser, tableX + 110, rowY + 52);

    // Points
    ctx.textAlign = 'right';
    ctx.font = '900 30px "Formula1", sans-serif';
    ctx.fillStyle = isTop1 ? '#FFD700' : '#E10600';
    ctx.fillText(`${entry.points}`, tableX + tableW - 85, rowY + 52);

    ctx.font = '600 16px "Titillium Web", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('PTS', tableX + tableW - 35, rowY + 52);

    ctx.restore();

    // Divider line between rows
    if (idx < maxRows - 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tableX + 24, rowY + rowHeight);
      ctx.lineTo(tableX + tableW - 24, rowY + rowHeight);
      ctx.stroke();
    }
  });

  // Admin Verification Tag
  const adminStampY = tableY + tableH + 60;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 18px "Titillium Web", sans-serif';
  ctx.fillStyle = 'rgba(225, 6, 0, 0.8)';
  ctx.fillText('OFFICIAL CHAMPIONSHIP LEADERBOARD  •  ADMINISTRATOR VERIFIED', width / 2, adminStampY);
  ctx.restore();

  // 5. Footer
  drawStoryFooter(ctx, width, height);

  return canvas;
}

/**
 * Converts a Canvas to a Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert canvas to blob'));
    }, 'image/png', 0.98);
  });
}

/**
 * Triggers native Web Share or falls back to direct download.
 */
export async function shareOrDownloadStory(params: {
  canvas: HTMLCanvasElement;
  filename: string;
  title: string;
  text: string;
}): Promise<{ shared: boolean; downloaded: boolean }> {
  const blob = await canvasToBlob(params.canvas);
  const file = new File([blob], params.filename, { type: 'image/png' });

  // 1. Try Native Web Share API with image file
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: params.title,
        text: params.text,
        files: [file],
      });
      return { shared: true, downloaded: false };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        // User dismissed the native share sheet
        return { shared: false, downloaded: false };
      }
      console.warn('Native file share failed, falling back to download:', e);
    }
  }

  // 2. Fallback: Direct Download
  triggerImageDownload(blob, params.filename);
  return { shared: false, downloaded: true };
}

/**
 * Triggers a client-side download of a blob
 */
export function triggerImageDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
