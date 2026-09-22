/**
 * The Grid Motorsport — Rich HTML Email Template Builder
 * Generates responsive, high-contrast, dark motorsport styled HTML emails
 * with matching structured plain-text fallback.
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

const PRIMARY_RED = '#e10600';
const BG_DARK = '#0a0d14';
const BG_CARD = '#141a24';
const BG_ROW = '#1c2433';
const TEXT_LIGHT = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const TELEMETRY_GREEN = '#00e676';
const TELEMETRY_YELLOW = '#ffd600';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)';
const APP_URL = 'https://hj1418.github.io/F1-Prediction-Wall/';

function wrapHtmlTemplate(title: string, subtitle: string, contentHtml: string, ctaButton?: { text: string; url: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: ${BG_CARD}; border-radius: 12px; border: 1px solid ${BORDER_COLOR}; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b0000 0%, #0d121c 100%); border-bottom: 2px solid ${PRIMARY_RED}; padding: 24px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: ${PRIMARY_RED}; letter-spacing: 2px; text-transform: uppercase;">THE GRID • MOTORSPORT PREDICTION BENCH</div>
                    <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 900; text-transform: uppercase; color: #ffffff;">${title}</h1>
                    ${subtitle ? `<div style="font-size: 13px; color: ${TEXT_MUTED}; margin-top: 4px;">${subtitle}</div>` : ''}
                  </td>
                  <td align="right" valign="top">
                    <span style="font-size: 28px;">🏁</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 30px;">
              ${contentHtml}

              ${ctaButton ? `
              <div style="margin-top: 28px; text-align: center;">
                <a href="${ctaButton.url}" style="display: inline-block; background: linear-gradient(135deg, ${PRIMARY_RED}, #b30000); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; padding: 13px 30px; border-radius: 6px; box-shadow: 0 4px 15px rgba(225, 6, 0, 0.4);">
                  ${ctaButton.text}
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f17; padding: 20px 30px; border-top: 1px solid ${BORDER_COLOR}; text-align: center; font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">
              <div>THE GRID MOTORSPORT PLATFORM • FORMULA 1 PREDICTION BENCH</div>
              <div style="margin-top: 4px;">Official FIA classification and telemetry verified. Predictions locked at formation lap.</div>
              <div style="margin-top: 8px;">
                <a href="${APP_URL}" style="color: ${PRIMARY_RED}; text-decoration: none;">Launch The Grid</a>
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
  picks: FormattedPick[];
  closesAtFormatted?: string;
  expectedResultsFormatted?: string;
}): EmailPayload {
  const subject = `Prediction Locked In — ${params.raceName || params.roundTitle} 🔒`;

  let picksRowsHtml = '';
  let picksText = '';

  params.picks.forEach(p => {
    picksRowsHtml += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 10px 14px; font-weight: 800; color: #ffffff; font-size: 13px; width: 35%;">${p.position}</td>
        <td style="padding: 10px 14px; color: ${TEXT_LIGHT}; font-size: 14px;">
          <strong>${p.driverName}</strong>
          ${p.teamName ? `<div style="font-size: 11px; color: ${TEXT_MUTED}; margin-top: 2px;">${p.teamName}</div>` : ''}
        </td>
      </tr>
    `;
    picksText += `• ${p.position}: ${p.driverName} ${p.teamName ? `(${p.teamName})` : ''}\n`;
  });

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.5; color: ${TEXT_LIGHT}; margin-bottom: 18px;">
      Hi <strong>${params.recipientName}</strong>,
    </div>
    <div style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 22px;">
      Your race outcome prediction for the <strong>${params.raceName || params.roundTitle}</strong> has been registered and authoritatively locked into The Grid database.
    </div>

    <!-- Locked Picks Card -->
    <div style="background-color: ${BG_ROW}; border-radius: 8px; border: 1px solid ${BORDER_COLOR}; overflow: hidden; margin-bottom: 22px;">
      <div style="background-color: rgba(255,255,255,0.04); padding: 10px 14px; font-size: 11px; font-weight: 800; color: ${TELEMETRY_GREEN}; letter-spacing: 1px; text-transform: uppercase;">
        🔒 YOUR CONFIRMED SELECTIONS
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${picksRowsHtml}
      </table>
    </div>

    <!-- Results Timeline -->
    <div style="background-color: rgba(0, 229, 255, 0.06); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; color: #00e5ff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
        ⏱️ WHEN WILL RESULTS BE OUT?
      </div>
      <div style="font-size: 13px; color: ${TEXT_LIGHT}; line-height: 1.5;">
        ${params.expectedResultsFormatted
          ? `Official results are expected to be verified and scored on <strong>${params.expectedResultsFormatted}</strong> (~2 hours after race start).`
          : `Official scores are calculated approx. 1 to 2 hours after the checkered flag once the FIA publishes the official classification.`}
      </div>
      <div style="font-size: 12px; color: ${TEXT_MUTED}; margin-top: 6px;">
        Points and leaderboard positions will be updated automatically as soon as scoring runs.
      </div>
    </div>
  `;

  const htmlBody = wrapHtmlTemplate(
    'Prediction Locked In',
    `${params.raceName} • Authoritative Submission`,
    contentHtml,
    { text: 'View on Prediction Bench', url: `${APP_URL}#/predictions` }
  );

  const body = `Hi ${params.recipientName},

Your predictions for ${params.raceName || params.roundTitle} are locked in!

YOUR LOCKED PICKS:
${picksText}
WHEN RESULTS WILL BE OUT:
${params.expectedResultsFormatted ? `Official results will be published on ${params.expectedResultsFormatted}.` : 'Official results will be published ~2 hours after the race concludes.'}

View your submission: ${APP_URL}#/predictions

Warm regards,
The Grid Race Control`;

  return { subject, htmlBody, body };
}

/**
 * 2. PREDICTION RESULT EMAIL
 */
export function buildPredictionResultEmail(params: {
  recipientName: string;
  roundTitle: string;
  raceName: string;
  totalScore: number;
  breakdown: Record<string, number>;
  podiumSummary?: { p1?: string; p2?: string; p3?: string; fastestLap?: string };
  leaderboardRank?: number;
}): EmailPayload {
  const subject = `Official Race Results: ${params.totalScore} PTS Scored — ${params.raceName || params.roundTitle} 🏆`;

  let breakdownRowsHtml = '';
  let breakdownText = '';
  for (const key in params.breakdown) {
    const pts = params.breakdown[key];
    const isPositive = pts > 0;
    breakdownRowsHtml += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 8px 14px; font-size: 13px; color: ${TEXT_LIGHT}; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}</td>
        <td align="right" style="padding: 8px 14px; font-weight: 800; font-family: monospace; font-size: 13px; color: ${isPositive ? TELEMETRY_GREEN : TEXT_MUTED};">
          ${isPositive ? `+${pts} PTS` : '0 PTS'}
        </td>
      </tr>
    `;
    breakdownText += `• ${key}: ${pts} pts\n`;
  }

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.5; color: ${TEXT_LIGHT}; margin-bottom: 16px;">
      Hi <strong>${params.recipientName}</strong>,
    </div>
    <div style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 22px;">
      Official steward results for the <strong>${params.raceName || params.roundTitle}</strong> are in, and your scorecard has been processed!
    </div>

    <!-- Score Big Display -->
    <div style="background: linear-gradient(135deg, rgba(0, 230, 118, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%); border: 1px solid rgba(0, 230, 118, 0.35); border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 22px;">
      <div style="font-size: 11px; font-weight: 800; color: ${TELEMETRY_GREEN}; letter-spacing: 2px; text-transform: uppercase;">TOTAL SESSION SCORE</div>
      <div style="font-size: 42px; font-weight: 900; color: #ffffff; font-family: monospace; margin: 4px 0;">
        ${params.totalScore} <span style="font-size: 20px; color: ${TELEMETRY_GREEN};">PTS</span>
      </div>
      ${params.leaderboardRank ? `<div style="font-size: 13px; color: ${TELEMETRY_YELLOW}; font-weight: 700;">Current Championship Standings: Rank #${params.leaderboardRank}</div>` : ''}
    </div>

    <!-- Score Breakdown Table -->
    <div style="background-color: ${BG_ROW}; border-radius: 8px; border: 1px solid ${BORDER_COLOR}; overflow: hidden; margin-bottom: 22px;">
      <div style="background-color: rgba(255,255,255,0.04); padding: 10px 14px; font-size: 11px; font-weight: 800; color: ${TEXT_LIGHT}; letter-spacing: 1px; text-transform: uppercase;">
        📊 POINT BREAKDOWN
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${breakdownRowsHtml}
      </table>
    </div>
  `;

  const htmlBody = wrapHtmlTemplate(
    'Official Race Results',
    `${params.raceName} • Session Scored`,
    contentHtml,
    { text: 'View Championship Standings', url: `${APP_URL}#/leaderboard` }
  );

  const body = `Hi ${params.recipientName},

Official race results are in for ${params.raceName || params.roundTitle}!

YOU SCORED: ${params.totalScore} POINTS

Score Breakdown:
${breakdownText}
Check out the updated championship leaderboard: ${APP_URL}#/leaderboard

Warm regards,
The Grid Race Control`;

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
  const subject = `Predictions Now Open: ${params.raceName || params.roundTitle} 🏁`;

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.5; color: ${TEXT_LIGHT}; margin-bottom: 16px;">
      Hi <strong>${params.recipientName}</strong>,
    </div>
    <div style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 20px;">
      The Prediction Bench is officially <strong>OPEN</strong> for the upcoming <strong>${params.raceName}</strong>${params.circuitName ? ` at ${params.circuitName}` : ''}.
    </div>

    <!-- Details Box -->
    <div style="background-color: ${BG_ROW}; border-radius: 8px; border: 1px solid ${BORDER_COLOR}; padding: 16px; margin-bottom: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED}; width: 40%;">Grand Prix:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #ffffff;">${params.raceName}</td>
        </tr>
        ${params.circuitName ? `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">Circuit:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #ffffff;">${params.circuitName} ${params.country ? `(${params.country})` : ''}</td>
        </tr>
        ` : ''}
        ${params.closesAtFormatted ? `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">Lockout Deadline:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #f87171;">${params.closesAtFormatted}</td>
        </tr>
        ` : ''}
        ${params.expectedResultsFormatted ? `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">Results Published:</td>
          <td style="padding: 6px 0; font-size: 13px; color: ${TELEMETRY_GREEN};">${params.expectedResultsFormatted}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5;">
      Make sure to lock in your selections for P1, P2, P3, and Fastest Lap before the formation lap commences!
    </div>
  `;

  const htmlBody = wrapHtmlTemplate(
    'Predictions Now Open',
    `${params.raceName} • Season Round`,
    contentHtml,
    { text: 'Open Prediction Bench', url: `${APP_URL}#/predictions` }
  );

  const body = `Hi ${params.recipientName},

Predictions are officially OPEN for ${params.raceName}!

Lockout Deadline: ${params.closesAtFormatted || 'At session start'}
Results Published: ${params.expectedResultsFormatted || '~2 hours after race'}

Lock in your picks now: ${APP_URL}#/predictions

Warm regards,
The Grid Team`;

  return { subject, htmlBody, body };
}
