/**
 * =========================================================================
 * F1 COMMUNITY PREDICTION LEAGUE - SHEET INITIALIZATION & SEED SCRIPT
 * =========================================================================
 * 
 * Run the initializeDatabase() function once inside the Google Apps Script
 * editor (Extensions > Apps Script) to create all 9 sheets with exact headers.
 */

function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const tables = [
    {
      name: 'Users',
      headers: ['userId', 'googleSubjectId', 'email', 'displayName', 'username', 'avatarUrl', 'favouriteDriver', 'favouriteConstructor', 'bio', 'passwordHash', 'authProvider', 'lastLoginAt', 'role', 'createdAt', 'totalPoints', 'seasonRank'],
      headerColor: '#e10600'
    },
    {
      name: 'RaceWeekends',
      headers: ['raceWeekendId', 'season', 'round', 'name', 'country', 'circuitId', 'circuitName', 'weekendType', 'startDate', 'endDate', 'status', 'externalProvider', 'externalId', 'lastSyncedAt'],
      headerColor: '#1e41ff'
    },
    {
      name: 'Sessions',
      headers: ['sessionId', 'raceWeekendId', 'sessionType', 'sessionName', 'startTime', 'endTime', 'status', 'externalProvider', 'externalId', 'lastSyncedAt'],
      headerColor: '#ff8000'
    },
    {
      name: 'PredictionRounds',
      headers: ['roundId', 'raceWeekendId', 'sessionId', 'roundType', 'title', 'description', 'opensAt', 'closesAt', 'status', 'predictionFields', 'scoringRules', 'lastSyncedAt'],
      headerColor: '#00d2be'
    },
    {
      name: 'Predictions',
      headers: ['predictionId', 'userId', 'roundId', 'predictionData', 'submittedAt', 'updatedAt', 'lockedAt'],
      headerColor: '#a855f7'
    },
    {
      name: 'Results',
      headers: ['resultId', 'roundId', 'resultData', 'publishedAt'],
      headerColor: '#22c55e'
    },
    {
      name: 'Scores',
      headers: ['scoreId', 'userId', 'roundId', 'scoreBreakdown', 'totalScore', 'calculatedAt'],
      headerColor: '#eab308'
    },
    {
      name: 'Achievements',
      headers: ['achievementId', 'userId', 'achievementType', 'title', 'description', 'badgeIcon', 'earnedAt'],
      headerColor: '#ec4899'
    },
    {
      name: 'SyncLogs',
      headers: ['logId', 'timestamp', 'entityType', 'entityId', 'action', 'previousValue', 'newValue', 'details'],
      headerColor: '#0284c7'
    },
    {
      name: 'NotificationQueue',
      headers: ['id', 'recipientEmail', 'recipientName', 'notificationType', 'subject', 'templateDataJson', 'status', 'idempotencyKey', 'attempts', 'queuedAt', 'sentAt', 'errorMessage'],
      headerColor: '#10b981'
    },
    {
      name: 'NotificationLog',
      headers: ['id', 'queueId', 'recipientEmail', 'notificationType', 'idempotencyKey', 'sentAt', 'status', 'deliveryMetadata'],
      headerColor: '#6366f1'
    }
  ];

  tables.forEach(table => {
    let sheet = ss.getSheetByName(table.name);
    if (!sheet) {
      sheet = ss.insertSheet(table.name);
    } else {
      sheet.clear();
    }

    // Set headers
    sheet.getRange(1, 1, 1, table.headers.length).setValues([table.headers]);
    
    // Style headers
    const headerRange = sheet.getRange(1, 1, 1, table.headers.length);
    headerRange.setBackground(table.headerColor);
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  });

  // Remove default "Sheet1" if it exists and other sheets are present
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Ignored if can't delete
    }
  }

  Logger.log('Successfully initialized all F1 Prediction tables including NotificationQueue and NotificationLog with headers and formatting!');
}

/**
 * Automated Trigger Setup Function.
 * Run this function ONCE inside Google Apps Script as thepaddockprediction14@gmail.com
 * to authorize MailApp permissions and install the 1-minute time-driven background worker.
 */
function setupEmailWorkerTrigger() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log('[EMAIL_SETUP] Remaining daily email quota: ' + quota);

  // Remove existing triggers for processNotificationQueue to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  let removedCount = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processNotificationQueue') {
      ScriptApp.deleteTrigger(triggers[i]);
      removedCount++;
    }
  }
  Logger.log('[EMAIL_SETUP] Removed ' + removedCount + ' existing triggers.');

  // Create clean 1-minute time-driven trigger
  const newTrigger = ScriptApp.newTrigger('processNotificationQueue')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('[EMAIL_SETUP] Created new 1-minute time-driven trigger ID: ' + newTrigger.getUniqueId());

  // Immediately process any pending items in queue
  const queueResult = typeof processNotificationQueue === 'function' ? processNotificationQueue(25) : null;
  Logger.log('[EMAIL_SETUP] Initial queue process result: ' + JSON.stringify(queueResult));

  return {
    success: true,
    senderAccount: 'thepaddockprediction14@gmail.com',
    quotaRemaining: quota,
    triggerCreated: true,
    initialProcess: queueResult
  };
}

/**
 * Manual test function to send a verification email and authorize MailApp in 1 click.
 */
function testSendWelcomeEmail(targetEmail) {
  const recipient = targetEmail || 'thepaddockprediction14@gmail.com';
  const subject = 'Welcome to The Grid 🏁';
  const body = 'Hi Racer,\n\n' +
    'Welcome to The Grid — your home for learning, following, and experiencing Formula 1.\n\n' +
    'You are officially registered. On The Grid you can:\n' +
    '1. Learn F1 rules, 2026 regulations (Active Aero X-Mode/Z-Mode & 400 kW ICE + 350 kW MGU-K), and strategy\n' +
    '2. Follow live circuit telemetry and session schedules across all 24 Grand Prix weekends\n' +
    '3. Compete in Prediction Bench and battle on the global championship leaderboard\n\n' +
    '— The Grid Team\n' +
    'https://hj1418.github.io/F1-Prediction-Wall/';

  MailApp.sendEmail({
    to: recipient,
    name: 'The Grid',
    subject: subject,
    body: body
  });

  Logger.log('[EMAIL_SENT] Verification test email sent successfully to: ' + recipient);
  return { success: true, recipient: recipient, sender: 'thepaddockprediction14@gmail.com' };
}

