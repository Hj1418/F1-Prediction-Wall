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
      headers: ['userId', 'email', 'displayName', 'username', 'avatarUrl', 'favouriteDriver', 'role', 'createdAt', 'totalPoints', 'seasonRank'],
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

  Logger.log('Successfully initialized all 9 F1 Prediction tables including SyncLogs with headers and formatting!');
}
