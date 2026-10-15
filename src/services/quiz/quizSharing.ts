import { QuizResultPayload } from '../../types/quiz';
import { getTierDetails, getQuizCategory } from './quizRegistry';

/**
 * Generates a polished 1080x1350 mobile-friendly share card on an off-screen HTML5 Canvas.
 * Returns a high-res Blob or Data URL without exposing sensitive user metadata.
 */
export async function generateQuizShareCard(
  result: QuizResultPayload,
  username?: string
): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const tier = getTierDetails(result.fanIdentityTier);

  // 1. Dark Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, '#0a0d14');
  bgGrad.addColorStop(0.5, '#0f1420');
  bgGrad.addColorStop(1, '#080a0e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // Carbon weave texture effect (subtle diagonal lines)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = -1350; x < 2430; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 1350, 1350);
    ctx.stroke();
  }

  // Radial glow around badge
  const glowGrad = ctx.createRadialGradient(540, 520, 50, 540, 520, 400);
  glowGrad.addColorStop(0, `${tier.color}33`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 200, 1080, 700);

  // 2. Top Header / Brand
  // Red Logo Box
  ctx.fillStyle = '#e10600';
  ctx.beginPath();
  ctx.roundRect(70, 80, 54, 54, 10);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GRDX', 97, 107);

  // Brand Name
  ctx.textAlign = 'left';
  ctx.font = '900 34px "Barlow Condensed", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '2px';
  ctx.fillText('THE GRDX', 140, 102);

  ctx.font = '600 16px "Inter", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.letterSpacing = '1px';
  ctx.fillText('THE GRDX KNOWLEDGE CHALLENGE', 142, 126);

  // Clean Red accent line
  ctx.fillStyle = '#e10600';
  ctx.fillRect(70, 160, 940, 3);

  // 3. User display tag (sanitized, optional)
  if (username && username.trim() && username !== 'guest_user') {
    const cleanUser = username.trim().replace(/^@/, '');
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(70, 210, 300, 48, 24);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`RACER: @${cleanUser.substring(0, 20).toUpperCase()}`, 96, 234);
  }

  // 4. Centerpiece: Identity Tier Shield / Card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(70, 280, 940, 500, 24);
  ctx.fill();
  ctx.stroke();

  // Tier Subtitle
  ctx.textAlign = 'center';
  ctx.fillStyle = tier.color;
  ctx.font = '800 20px "JetBrains Mono", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('RACING TAG EARNED', 540, 350);

  // Main Tier Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px "Barlow Condensed", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(tier.title.toUpperCase(), 540, 440);

  // Tagline
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 24px "Inter", sans-serif';
  ctx.fillText(tier.tagline, 540, 500);

  // Score Highlight Pill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(290, 560, 500, 140, 20);
  ctx.fill();
  ctx.strokeStyle = tier.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px "Barlow Condensed", sans-serif';
  ctx.fillText(`${result.percentage}%`, 440, 630);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.fillText(`${result.score} / ${result.totalQuestions} CORRECT`, 590, 630);

  // 5. Selected Categories Breakdown Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(70, 810, 940, 360, 24);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 18px "JetBrains Mono", monospace';
  ctx.letterSpacing = '1px';
  ctx.fillText('DISCIPLINE MASTERY BREAKDOWN', 110, 855);

  const categories = Object.values(result.categoryBreakdown || {});
  const displayCats = categories.slice(0, 6);
  const rowHeight = 44;
  let startY = 890;

  for (const cat of displayCats) {
    const meta = getQuizCategory(cat.categoryId);
    // Category Badge
    ctx.fillStyle = meta?.color || '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(110, startY, 48, 26, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(meta?.badge || 'TG', 134, startY + 14);

    // Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 20px "Inter", sans-serif';
    ctx.fillText(cat.categoryName, 175, startY + 16);

    // Score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(`${cat.correct}/${cat.total} (${cat.percentage}%)`, 970, startY + 16);

    startY += rowHeight;
  }

  // 6. Footer call to action
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px "Barlow Condensed", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('DISCOVER YOUR MOTORSPORT IDENTITY', 540, 1230);

  ctx.fillStyle = '#e10600';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('hj1418.github.io/F1-Prediction-Wall/#/quiz', 540, 1265);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

/**
 * Share action executing native Web Share API or download / copy fallback.
 */
export async function shareQuizResult(
  result: QuizResultPayload,
  username?: string
): Promise<{ method: 'native' | 'download' | 'clipboard'; success: boolean }> {
  const shareText = `I took the GRDX Knowledge Challenge and earned the "${result.fanIdentityTier}" Racing Tag with a score of ${result.score}/${result.totalQuestions} (${result.percentage}%). Test your knowledge:`;
  const shareUrl = `${window.location.origin}${window.location.pathname}#/quiz`;

  // Try generating image card
  let imageFile: File | null = null;
  try {
    const blob = await generateQuizShareCard(result, username);
    if (blob) {
      imageFile = new File([blob], `grdx-racing-tag-${result.attemptId.substring(0, 8)}.png`, {
        type: 'image/png',
      });
    }
  } catch (_e) {
    // Non-critical if canvas fails
  }

  // 1. Try Native Web Share with image
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    imageFile &&
    navigator.canShare({ files: [imageFile] })
  ) {
    try {
      await navigator.share({
        title: `GRDX — ${result.fanIdentityTier}`,
        text: shareText,
        url: shareUrl,
        files: [imageFile],
      });
      return { method: 'native', success: true };
    } catch (err: any) {
      if (err.name === 'AbortError') return { method: 'native', success: false };
    }
  }

  // 2. Try Native Web Share with text
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `GRDX — ${result.fanIdentityTier}`,
        text: shareText,
        url: shareUrl,
      });
      return { method: 'native', success: true };
    } catch (err: any) {
      if (err.name === 'AbortError') return { method: 'native', success: false };
    }
  }

  // 3. Download card if image exists
  if (imageFile) {
    try {
      const url = URL.createObjectURL(imageFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { method: 'download', success: true };
    } catch (_e) {}
  }

  // 4. Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    return { method: 'clipboard', success: true };
  }

  return { method: 'clipboard', success: false };
}
