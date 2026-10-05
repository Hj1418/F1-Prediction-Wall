/**
 * The Grid Motorsport — Rich HTML Email Template Builder
 * Generates responsive, high-contrast, dark motorsport styled HTML emails
 * with matching structured plain-text fallback.
 * 
 * Optimized for email-client compatibility (Gmail Web, iOS, Android, Desktop):
 * - Table-based layout
 * - Inline CSS styles
 * - Safe system fonts & fallbacks
 * - Absolute links
 * - Bulletproof CTA buttons
 * - XSS-safe dynamic value escaping
 */

export interface FormattedPick {
  position: string;
  driverName: string;
  teamName?: string;
  driverNumber?: number | string;
}

export interface EmailPayload {
  subject: string;
  htmlBody: string;
  body: string; // plain-text fallback
}

export interface CtaButton {
  text: string;
  url: string;
}

const PRIMARY_RED = '#e10600';
const BG_DARK = '#0a0d14';
const BG_CARD = '#121721';
const BG_HEADER = '#151b27';
const BG_ROW_EVEN = '#161e2b';
const BG_ROW_ODD = '#131a26';
const BORDER_COLOR = '#222d3d';
const TEXT_LIGHT = '#ffffff';
const TEXT_SECONDARY = '#f1f5f9';
const TEXT_MUTED = '#94a3b8';
const TELEMETRY_GREEN = '#00e676';
const TELEMETRY_YELLOW = '#ffd600';
const APP_URL = 'https://hj1418.github.io/F1-Prediction-Wall/';

/**
 * Safely escape dynamic values to prevent broken HTML or injection in email clients.
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Normalizes event/round title into a clean Grand Prix name without duplicate "Prediction".
 */
export function formatGrandPrixName(title?: string): string {
  if (!title || typeof title !== 'string') return 'Grand Prix';
  const clean = title
    .replace(/\s+(Race\s+)?Prediction(\s+Round)?$/i, '')
    .replace(/\s+Race\s+Session$/i, '')
    .trim();
  return clean || 'Grand Prix';
}

/**
 * Reusable shared email layout for consistent The Grid motorsport branding across all emails.
 */
export function wrapHtmlTemplate(
  title: string,
  subtitle: string,
  contentHtml: string,
  primaryCta?: CtaButton,
  secondaryCta?: CtaButton,
  secondaryNote?: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BG_DARK}; padding: 32px 12px 48px 12px; margin: 0;">
    <tr>
      <td align="center">
        <!-- Main Container (Max 580px) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: ${BG_CARD}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; overflow: hidden; border-spacing: 0;">
          <!-- Header Banner with Motorsport Red Accent -->
          <tr>
            <td style="background-color: ${BG_HEADER}; border-top: 3px solid ${PRIMARY_RED}; border-bottom: 1px solid ${BORDER_COLOR}; padding: 26px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: ${PRIMARY_RED}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                      THE GRID • FORMULA 1 PREDICTION BENCH
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; line-height: 1.25; color: ${TEXT_LIGHT}; text-transform: uppercase; letter-spacing: 0.2px;">
                      ${escapeHtml(title)}
                    </h1>
                    ${subtitle ? `
                    <div style="margin-top: 6px; font-size: 13px; color: ${TEXT_MUTED}; font-weight: 500;">
                      ${escapeHtml(subtitle)}
                    </div>` : ''}
                  </td>
                  <td align="right" valign="top" style="width: 44px; padding-left: 12px;">
                    <span style="font-size: 28px; line-height: 1;">🏁</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 28px 28px 24px 28px;">
              ${contentHtml}

              <!-- Action CTAs -->
              ${(primaryCta || secondaryCta) ? `
              <div style="margin-top: 28px; text-align: center;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
                  <tr>
                    ${primaryCta ? `
                    <td align="center" bgcolor="${PRIMARY_RED}" style="border-radius: 6px; padding: 0;">
                      <a href="${escapeHtml(primaryCta.url)}" target="_blank" style="display: inline-block; padding: 13px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; background-color: ${PRIMARY_RED};">
                        ${escapeHtml(primaryCta.text)}
                      </a>
                    </td>` : ''}
                    ${secondaryCta ? `
                    <td align="center" style="padding-left: 12px;">
                      <a href="${escapeHtml(secondaryCta.url)}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; background-color: #1f2937; border: 1px solid #374151;">
                        ${escapeHtml(secondaryCta.text)}
                      </a>
                    </td>` : ''}
                  </tr>
                </table>
              </div>` : ''}

              ${secondaryNote ? `
              <div style="margin-top: 18px; text-align: center; font-size: 13px; color: ${TEXT_MUTED}; font-weight: 500;">
                ${secondaryNote}
              </div>` : ''}
            </td>
          </tr>

          <!-- The Grid Footer -->
          <tr>
            <td style="background-color: #0e121a; padding: 22px 28px; border-top: 1px solid ${BORDER_COLOR}; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              <div style="font-weight: 700; color: ${TEXT_MUTED}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                THE GRID MOTORSPORT PLATFORM • FORMULA 1 PREDICTION BENCH
              </div>
              <div style="margin-bottom: 8px;">
                Official FIA classification and telemetry verified. Predictions locked at formation lap.
              </div>
              <div>
                <a href="${APP_URL}" target="_blank" style="color: ${PRIMARY_RED}; text-decoration: none; font-weight: 600;">
                  Launch The Grid Web App &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. PREDICTION CONFIRMATION EMAIL
 */
export function buildPredictionConfirmationEmail(params: {
  recipientName: string;
  roundTitle: string;
  raceName: string;
  roundNumber?: number | string;
  picks: FormattedPick[];
  closesAtFormatted?: string;
  expectedResultsFormatted?: string;
}): EmailPayload {
  const gpName = formatGrandPrixName(params.raceName || params.roundTitle);
  const subject = `Prediction Locked In — ${gpName}`;
  const roundText = params.roundNumber ? `Round ${params.roundNumber} • ` : '';

  let picksRowsHtml = '';
  let picksText = '';

  params.picks.forEach((p, idx) => {
    const isEven = (idx % 2 === 0);
    const rowBg = isEven ? BG_ROW_EVEN : BG_ROW_ODD;
    picksRowsHtml += `
      <tr style="background-color: ${rowBg}; border-bottom: 1px solid ${BORDER_COLOR};">
        <td style="padding: 10px 14px; font-weight: 700; color: ${TEXT_MUTED}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; width: 45%;">${escapeHtml(p.position)}</td>
        <td style="padding: 10px 14px; color: ${TEXT_LIGHT}; font-size: 13px; font-weight: 800;">
          ${escapeHtml(p.driverName)}
          ${p.teamName ? `<div style="font-size: 11px; color: ${TEXT_MUTED}; font-weight: 400; margin-top: 2px;">${escapeHtml(p.teamName)}</div>` : ''}
        </td>
      </tr>
    `;
    picksText += `• ${p.position}: ${p.driverName} ${p.teamName ? `(${p.teamName})` : ''}\n`;
  });

  const contentHtml = `
    <!-- Event / Race Info Strip -->
    <div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 800; color: ${PRIMARY_RED}; text-transform: uppercase; letter-spacing: 1px;">
              FORMULA 1 • ${escapeHtml(roundText)}CHAMPIONSHIP
            </div>
            <div style="font-size: 16px; font-weight: 800; color: ${TEXT_LIGHT}; margin-top: 3px;">
              ${escapeHtml(gpName)}
            </div>
          </td>
          <td align="right" valign="middle">
            <span style="display: inline-block; background-color: #064e3b; border: 1px solid #059669; color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
              ● LOCKED
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Short Confirmation Message -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 15px; font-weight: 600; color: ${TEXT_LIGHT}; margin-bottom: 6px;">
        Hi ${escapeHtml(params.recipientName)},
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED};">
        Your F1 prediction has been submitted successfully.
      </div>
    </div>

    ${params.picks.length > 0 ? `
    <!-- Confirmed Picks Table -->
    <div style="border: 1px solid ${BORDER_COLOR}; border-radius: 8px; overflow: hidden; margin-bottom: 22px;">
      <div style="background-color: #1a2332; padding: 10px 14px; font-size: 11px; font-weight: 800; color: ${TELEMETRY_GREEN}; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid ${BORDER_COLOR};">
        🔒 CONFIRMED SELECTIONS
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
        ${picksRowsHtml}
      </table>
    </div>
    ` : ''}

    <!-- Timeline Note -->
    <div style="background-color: rgba(225, 6, 0, 0.06); border-left: 3px solid ${PRIMARY_RED}; padding: 12px 14px; border-radius: 0 6px 6px 0; margin-bottom: 4px;">
      <div style="font-size: 12px; color: ${TEXT_MUTED}; line-height: 1.5;">
        ${params.expectedResultsFormatted
          ? `Official results are expected to be verified and scored on <strong>${escapeHtml(params.expectedResultsFormatted)}</strong> (~2 hours after race start).`
          : `Official scores are calculated approx. 1 to 2 hours after the checkered flag once the FIA publishes the official classification.`}
      </div>
    </div>
  `;

  const predictionBenchUrl = `${APP_URL}#/predictions`;

  const htmlBody = wrapHtmlTemplate(
    'Prediction Locked In',
    `${gpName} • ${roundText || 'Formula 1'}`,
    contentHtml,
    { text: 'VIEW MY PREDICTION', url: predictionBenchUrl },
    undefined,
    'Good luck! 🏁'
  );

  const body = `THE GRID • FORMULA 1 PREDICTION BENCH
==================================================

PREDICTION LOCKED IN
Event: ${gpName}
Championship: Formula 1
Status: LOCKED

Hi ${params.recipientName},

Your F1 prediction has been submitted successfully.

${params.picks.length > 0 ? `CONFIRMED SELECTIONS:\n${picksText}\n` : ''}VIEW MY PREDICTION:
${predictionBenchUrl}

Good luck! 🏁

--------------------------------------------------
THE GRID MOTORSPORT PLATFORM
Official FIA classification and telemetry verified.
${APP_URL}`;

  return { subject, htmlBody, body };
}

/**
 * 2. PREDICTION RESULT EMAIL
 */
export function buildPredictionResultEmail(params: {
  recipientName: string;
  roundTitle: string;
  raceName: string;
  roundNumber?: number | string;
  totalScore: number;
  breakdown: Record<string, number>;
  podiumSummary?: { p1?: string; p2?: string; p3?: string; fastestLap?: string };
  leaderboardRank?: number;
}): EmailPayload {
  const gpName = formatGrandPrixName(params.raceName || params.roundTitle);
  const subject = `Your ${gpName} Prediction Results`;
  const roundText = params.roundNumber ? `Round ${params.roundNumber} • ` : '';
  const score = params.totalScore;

  let breakdownRowsHtml = '';
  let breakdownText = '';
  const keys = Object.keys(params.breakdown || {});

  const labelMap: Record<string, string> = {
    p1: 'P1 Winner',
    p2: 'P2 Second Place',
    p3: 'P3 Third Place',
    perfectPodiumBonus: 'Perfect Podium Bonus',
    fastestLap: 'Fastest Lap',
    driverOfTheDay: 'Driver of the Day',
    riderOfTheDay: 'Rider of the Day',
    safetyCar: 'Safety Car Prediction',
    virtualSafetyCar: 'Virtual Safety Car',
    redFlag: 'Red Flag Prediction',
    yellowFlag: 'Yellow Flag Prediction',
  };

  keys.forEach((key, idx) => {
    const pts = params.breakdown[key] || 0;
    const isPositive = pts > 0;
    const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const isEven = (idx % 2 === 0);
    const rowBg = isEven ? BG_ROW_EVEN : BG_ROW_ODD;

    breakdownRowsHtml += `
      <tr style="background-color: ${rowBg}; border-bottom: 1px solid ${BORDER_COLOR};">
        <td style="padding: 10px 14px; font-size: 13px; color: ${TEXT_SECONDARY};">${escapeHtml(label)}</td>
        <td align="right" style="padding: 10px 14px; font-weight: 800; font-family: monospace; font-size: 13px; color: ${isPositive ? TELEMETRY_GREEN : TEXT_MUTED};">
          ${isPositive ? `+${pts} PTS` : '0 PTS'}
        </td>
      </tr>
    `;
    breakdownText += `• ${label}: ${isPositive ? `+${pts}` : pts} pts\n`;
  });

  const contentHtml = `
    <!-- Event / Race Info Strip -->
    <div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 800; color: ${PRIMARY_RED}; text-transform: uppercase; letter-spacing: 1px;">
              FORMULA 1 • ${escapeHtml(roundText)}OFFICIAL CLASSIFICATION
            </div>
            <div style="font-size: 16px; font-weight: 800; color: ${TEXT_LIGHT}; margin-top: 3px;">
              ${escapeHtml(gpName)}
            </div>
          </td>
          <td align="right" valign="middle">
            <span style="display: inline-block; background-color: #1e3a8a; border: 1px solid #2563eb; color: #93c5fd; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
              ● SCORED
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Greeting -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 15px; font-weight: 600; color: ${TEXT_LIGHT}; margin-bottom: 6px;">
        Hi ${escapeHtml(params.recipientName)},
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED};">
        Official steward results for the <strong>${escapeHtml(gpName)}</strong> are in, and your scorecard has been processed against the official FIA race classification.
      </div>
    </div>

    <!-- Score Big Display -->
    <div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 10px; padding: 22px 20px; text-align: center; margin-bottom: 22px;">
      <div style="font-size: 11px; font-weight: 800; color: ${TEXT_MUTED}; letter-spacing: 2px; text-transform: uppercase;">TOTAL SESSION SCORE</div>
      <div style="margin: 8px 0 6px 0;">
        <span style="font-size: 42px; font-weight: 900; color: #ffffff; font-family: monospace; letter-spacing: -1px;">
          ${score > 0 ? `+${score}` : score}
        </span>
        <span style="font-size: 20px; font-weight: 800; color: ${score > 0 ? TELEMETRY_GREEN : TEXT_MUTED};">PTS</span>
      </div>
      ${params.leaderboardRank ? `
      <div style="margin-top: 10px; display: inline-block; background-color: rgba(255, 214, 0, 0.1); border: 1px solid rgba(255, 214, 0, 0.3); color: ${TELEMETRY_YELLOW}; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 999px;">
        🏆 Championship Standings: Rank #${escapeHtml(String(params.leaderboardRank))}
      </div>` : ''}
    </div>

    ${keys.length > 0 ? `
    <!-- Score Breakdown Table -->
    <div style="border: 1px solid ${BORDER_COLOR}; border-radius: 8px; overflow: hidden; margin-bottom: 22px;">
      <div style="background-color: #1a2332; padding: 10px 14px; font-size: 11px; font-weight: 800; color: ${TEXT_LIGHT}; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid ${BORDER_COLOR};">
        📊 POINT BREAKDOWN
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
        ${breakdownRowsHtml}
      </table>
    </div>
    ` : ''}
  `;

  const predictionBenchUrl = `${APP_URL}#/predictions`;
  const leaderboardUrl = `${APP_URL}#/leaderboard`;

  const htmlBody = wrapHtmlTemplate(
    'Your Prediction Results Are In',
    `${gpName} • ${roundText || 'Formula 1'}`,
    contentHtml,
    { text: 'VIEW MY RESULTS', url: predictionBenchUrl },
    { text: 'VIEW LEADERBOARD', url: leaderboardUrl },
    'Points have been credited to your championship tally. Check your position on the season standings.'
  );

  const body = `THE GRID • FORMULA 1 PREDICTION BENCH
==================================================

YOUR PREDICTION RESULTS ARE IN
Event: ${gpName}
Championship: Formula 1
Status: SCORED

Hi ${params.recipientName},

Official steward results for the ${gpName} are in, and your scorecard has been processed!

TOTAL SESSION SCORE: ${score > 0 ? `+${score}` : score} PTS
${params.leaderboardRank ? `Leaderboard Rank: #${params.leaderboardRank}\n` : ''}
${keys.length > 0 ? `POINT BREAKDOWN:\n${breakdownText}\n` : ''}VIEW MY RESULTS:
${predictionBenchUrl}

VIEW LEADERBOARD:
${leaderboardUrl}

Points have been credited to your championship tally. Check your position on the season standings.

--------------------------------------------------
THE GRID MOTORSPORT PLATFORM
Official FIA classification and telemetry verified.
${APP_URL}`;

  return { subject, htmlBody, body };
}

/**
 * 3. PREDICTION OPEN ANNOUNCEMENT EMAIL
 */
export function buildPredictionOpenEmail(params: {
  recipientName: string;
  roundTitle: string;
  raceName: string;
  circuitName?: string;
  country?: string;
  closesAtFormatted?: string;
  expectedResultsFormatted?: string;
}): EmailPayload {
  const gpName = formatGrandPrixName(params.raceName || params.roundTitle);
  const subject = `Predictions Now Open: ${gpName} 🏁`;

  const contentHtml = `
    <!-- Event / Race Info Strip -->
    <div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 800; color: ${PRIMARY_RED}; text-transform: uppercase; letter-spacing: 1px;">
              FORMULA 1 • SEASON ROUND
            </div>
            <div style="font-size: 16px; font-weight: 800; color: ${TEXT_LIGHT}; margin-top: 3px;">
              ${escapeHtml(gpName)}
            </div>
          </td>
          <td align="right" valign="middle">
            <span style="display: inline-block; background-color: #064e3b; border: 1px solid #059669; color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
              ● OPEN
            </span>
          </td>
        </tr>
      </table>
    </div>

    <div style="font-size: 15px; font-weight: 600; color: ${TEXT_LIGHT}; margin-bottom: 6px;">
      Hi ${escapeHtml(params.recipientName)},
    </div>
    <div style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 20px;">
      The Prediction Bench is officially <strong>OPEN</strong> for the upcoming <strong>${escapeHtml(gpName)}</strong>${params.circuitName ? ` at ${escapeHtml(params.circuitName)}` : ''}.
    </div>

    <!-- Details Box -->
    <div style="border: 1px solid ${BORDER_COLOR}; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
        <tr style="background-color: ${BG_ROW_EVEN}; border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: ${TEXT_MUTED}; width: 40%;">Grand Prix:</td>
          <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #ffffff;">${escapeHtml(gpName)}</td>
        </tr>
        ${params.circuitName ? `
        <tr style="background-color: ${BG_ROW_ODD}; border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: ${TEXT_MUTED};">Circuit:</td>
          <td style="padding: 10px 14px; font-size: 13px; color: #ffffff;">${escapeHtml(params.circuitName)} ${params.country ? `(${escapeHtml(params.country)})` : ''}</td>
        </tr>
        ` : ''}
        ${params.closesAtFormatted ? `
        <tr style="background-color: ${BG_ROW_EVEN}; border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: ${TEXT_MUTED};">Lockout Deadline:</td>
          <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #f87171;">${escapeHtml(params.closesAtFormatted)}</td>
        </tr>
        ` : ''}
        ${params.expectedResultsFormatted ? `
        <tr style="background-color: ${BG_ROW_ODD};">
          <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: ${TEXT_MUTED};">Results Published:</td>
          <td style="padding: 10px 14px; font-size: 13px; color: ${TELEMETRY_GREEN};">${escapeHtml(params.expectedResultsFormatted)}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5;">
      Make sure to lock in your selections for P1, P2, P3, and Fastest Lap before the formation lap commences!
    </div>
  `;

  const predictionBenchUrl = `${APP_URL}#/predictions`;

  const htmlBody = wrapHtmlTemplate(
    'Predictions Now Open',
    `${gpName} • Season Round`,
    contentHtml,
    { text: 'OPEN PREDICTION BENCH', url: predictionBenchUrl }
  );

  const body = `THE GRID • FORMULA 1 PREDICTION BENCH
==================================================

PREDICTIONS NOW OPEN
Event: ${gpName}
Status: OPEN

Hi ${params.recipientName},

Predictions are officially OPEN for ${gpName}!

Lockout Deadline: ${params.closesAtFormatted || 'At session start'}
Results Published: ${params.expectedResultsFormatted || '~2 hours after race'}

OPEN PREDICTION BENCH:
${predictionBenchUrl}

Warm regards,
The Grid Team`;

  return { subject, htmlBody, body };
}
