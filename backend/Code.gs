/**
 * =========================================================================
 * F1 COMMUNITY PREDICTION LEAGUE - GOOGLE APPS SCRIPT BACKEND
 * =========================================================================
 * 
 * Provides a lightweight serverless REST API on top of Google Sheets.
 * 
 * Features:
 * - Jolpica F1 API Live Calendar Synchronization
 * - Automatic Weekend Format Detection (NORMAL vs SPRINT)
 * - Dynamic Prediction Round Generation
 * - Server-side deadline validation (using new Date())
 * - Duplicate driver selection prevention
 * - Idempotent score calculations & Schedule Updates
 * - CacheService caching for high performance
 */

// Configuration
const SHEET_NAMES = {
  USERS: 'Users',
  RACE_WEEKENDS: 'RaceWeekends',
  SESSIONS: 'Sessions',
  PREDICTION_ROUNDS: 'PredictionRounds',
  PREDICTIONS: 'Predictions',
  RESULTS: 'Results',
  SCORES: 'Scores',
  ACHIEVEMENTS: 'Achievements',
  SYNC_LOGS: 'SyncLogs',
  NOTIFICATION_QUEUE: 'NotificationQueue',
  NOTIFICATION_LOG: 'NotificationLog'
};

const JOLPICA_BASE_URLS = [
  'https://api.jolpi.ca/ergast/f1',
  'https://api.jolpica.net/ergast/f1'
];

/**
 * Handle HTTP GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let responseData = null;

    switch (action) {
      case 'getServerTime':
        responseData = { serverTime: new Date().toISOString() };
        break;
      case 'getCurrentWeekend':
        responseData = getCurrentWeekend();
        break;
      case 'getUpcomingRace':
        responseData = getUpcomingRace();
        break;
      case 'getRaceWeekends':
        responseData = getRaceWeekends(e.parameter.season);
        break;
      case 'getRaceWeekend':
      case 'getWeekendDetails':
        responseData = getWeekendDetails(e.parameter.raceWeekendId || e.parameter.id);
        break;
      case 'getCurrentPredictionRounds':
        responseData = getCurrentPredictionRounds();
        break;
      case 'getPredictionRounds':
        responseData = getPredictionRounds(e.parameter.raceWeekendId);
        break;
      case 'getPredictionRound':
        responseData = getPredictionRound(e.parameter.roundId);
        break;
      case 'getSessionSchedule':
        responseData = getSessionSchedule(e.parameter.raceWeekendId);
        break;
      case 'getUserPrediction':
        responseData = getUserPrediction(e.parameter.roundId, e.parameter.userId);
        break;
      case 'getRoundResults':
        responseData = getRoundResults(e.parameter.roundId);
        break;
      case 'getLeaderboard':
        responseData = getLeaderboard(e.parameter.type, e.parameter.id);
        break;
      case 'getUserProfile':
        responseData = getUserProfile(e.parameter.username || e.parameter.userId);
        break;
      case 'getAllUsers':
        responseData = getAllUsers();
        break;
      case 'getAdminUsers':
      case 'getUsers':
        responseData = getAdminUsers(e.parameter.requesterId || e.parameter.userId);
        break;
      case 'getUserAchievements':
        responseData = getUserAchievements(e.parameter.userId);
        break;
      case 'getUserPredictionsHistory':
        responseData = getUserPredictionsHistory(e.parameter.userId);
        break;
      case 'getAllDrivers':
        responseData = getAllDrivers();
        break;
      default:
        return createJsonResponse({
          success: false,
          data: null,
          message: 'Unknown action: ' + action
        });
    }

    return createJsonResponse({
      success: true,
      data: responseData,
      message: null
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      data: null,
      message: err.toString()
    });
  }
}

/**
 * Handle HTTP POST requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    const action = payload.action;
    let responseData = null;

    switch (action) {
      case 'googleLogin':
        responseData = googleLogin(payload);
        break;
      case 'loginUser':
        responseData = loginUser(payload.identifier, payload.passwordHash);
        break;
      case 'submitPrediction':
        responseData = submitPrediction(payload);
        break;
      case 'syncSeasonCalendar':
        responseData = syncSeasonCalendar(payload.season || 2026);
        break;
      case 'syncCurrentWeekend':
        responseData = syncCurrentWeekend();
        break;
      case 'syncRaceWeekend':
        responseData = syncRaceWeekend(payload.season, payload.round);
        break;
      case 'adminSaveWeekend':
        responseData = adminSaveWeekend(payload);
        break;
      case 'adminSubmitResult':
        responseData = adminSubmitResult(payload);
        break;
      case 'adminCalculateScores':
        responseData = adminCalculateScores(payload.roundId);
        break;
      case 'registerUser':
        responseData = registerUser(payload);
        break;
      case 'updateUser':
        responseData = updateUser(payload);
        break;
      case 'processNotificationQueue':
        responseData = processNotificationQueue(payload.limit);
        break;
      case 'getAdminUsers':
      case 'getUsers':
        responseData = getAdminUsers(payload.requesterId || payload.userId);
        break;
      default:
        return createJsonResponse({
          success: false,
          data: null,
          message: 'Unknown POST action: ' + action
        });
    }

    return createJsonResponse({
      success: true,
      data: responseData,
      message: null
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      data: null,
      message: err.toString()
    });
  }
}

/**
 * =========================================================================
 * JOLPICA F1 SYNCHRONIZATION & DATA PROVIDER LAYER
 * =========================================================================
 */

function fetchJolpica(endpoint) {
  for (let i = 0; i < JOLPICA_BASE_URLS.length; i++) {
    try {
      const url = JOLPICA_BASE_URLS[i] + endpoint;
      const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (res.getResponseCode() === 200) {
        return JSON.parse(res.getContentText());
      }
    } catch (e) {
      // Continue to next mirror
    }
  }
  throw new Error('Could not connect to Jolpica F1 API mirrors.');
}

/**
 * Synchronize full season calendar from Jolpica F1 API
 */
function syncSeasonCalendar(season) {
  const json = fetchJolpica('/' + season + '.json?limit=100');
  const races = json.MRData.RaceTable.Races || [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rwSheet = ss.getSheetByName(SHEET_NAMES.RACE_WEEKENDS);
  const sessSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  const prSheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  const logSheet = ss.getSheetByName(SHEET_NAMES.SYNC_LOGS);

  const syncedWeekends = [];
  const logs = [];
  const nowIso = new Date().toISOString();

  races.forEach(function(rawRace) {
    const roundNumber = Number(rawRace.round);
    const weekendId = season + '_' + roundNumber;

    // Detect Sprint vs Normal
    const hasSprint = Boolean(rawRace.Sprint || rawRace.SprintQualifying || rawRace.SprintShootout);
    const weekendType = hasSprint ? 'SPRINT' : 'NORMAL';

    // Dates
    const sessions = [];
    if (rawRace.FirstPractice) {
      sessions.push({
        id: weekendId + '_FP1',
        type: 'FP1',
        name: 'Practice 1',
        startTime: parseUtcTime(rawRace.FirstPractice.date, rawRace.FirstPractice.time)
      });
    }

    if (hasSprint) {
      const sq = rawRace.SprintQualifying || rawRace.SprintShootout;
      if (sq) {
        sessions.push({
          id: weekendId + '_SPRINT_QUALIFYING',
          type: 'SPRINT_QUALIFYING',
          name: 'Sprint Qualifying',
          startTime: parseUtcTime(sq.date, sq.time)
        });
      }
      if (rawRace.Sprint) {
        sessions.push({
          id: weekendId + '_SPRINT',
          type: 'SPRINT',
          name: 'Sprint Race',
          startTime: parseUtcTime(rawRace.Sprint.date, rawRace.Sprint.time)
        });
      }
    } else {
      if (rawRace.SecondPractice) {
        sessions.push({
          id: weekendId + '_FP2',
          type: 'FP2',
          name: 'Practice 2',
          startTime: parseUtcTime(rawRace.SecondPractice.date, rawRace.SecondPractice.time)
        });
      }
      if (rawRace.ThirdPractice) {
        sessions.push({
          id: weekendId + '_FP3',
          type: 'FP3',
          name: 'Practice 3',
          startTime: parseUtcTime(rawRace.ThirdPractice.date, rawRace.ThirdPractice.time)
        });
      }
    }

    if (rawRace.Qualifying) {
      sessions.push({
        id: weekendId + '_QUALIFYING',
        type: 'QUALIFYING',
        name: hasSprint ? 'Grand Prix Qualifying' : 'Qualifying',
        startTime: parseUtcTime(rawRace.Qualifying.date, rawRace.Qualifying.time)
      });
    }

    sessions.push({
      id: weekendId + '_RACE',
      type: 'RACE',
      name: rawRace.raceName,
      startTime: parseUtcTime(rawRace.date, rawRace.time)
    });

    const startDate = sessions[0] ? sessions[0].startTime : rawRace.date + 'T00:00:00Z';
    const endDate = parseUtcTime(rawRace.date, rawRace.time);

    // Upsert RaceWeekend in Sheet
    upsertRaceWeekendRow(rwSheet, {
      raceWeekendId: weekendId,
      season: season,
      round: roundNumber,
      name: rawRace.raceName,
      country: rawRace.Circuit.Location.country,
      circuitId: rawRace.Circuit.circuitId,
      circuitName: rawRace.Circuit.circuitName,
      weekendType: weekendType,
      startDate: startDate,
      endDate: endDate,
      status: 'UPCOMING',
      externalProvider: 'JOLPICA_F1',
      externalId: weekendId,
      lastSyncedAt: nowIso
    });

    // Upsert Sessions
    sessions.forEach(function(sess) {
      upsertSessionRow(sessSheet, {
        sessionId: sess.id,
        raceWeekendId: weekendId,
        sessionType: sess.type,
        sessionName: sess.name,
        startTime: sess.startTime,
        endTime: '',
        status: 'UPCOMING',
        externalProvider: 'JOLPICA_F1',
        externalId: sess.id,
        lastSyncedAt: nowIso
      });
    });

    // Generate & Upsert Prediction Rounds
    generatePredictionRoundsForWeekend(prSheet, weekendId, rawRace.raceName, weekendType, sessions, nowIso);

    syncedWeekends.push({ id: weekendId, name: rawRace.raceName, weekendType: weekendType });
  });

  // Clear cache
  CacheService.getScriptCache().remove('current_weekend');
  CacheService.getScriptCache().remove('season_weekends_' + season);

  return {
    season: season,
    syncedCount: syncedWeekends.length,
    weekends: syncedWeekends
  };
}

function parseUtcTime(dateStr, timeStr) {
  if (!dateStr) return new Date().toISOString();
  if (timeStr) {
    var t = timeStr.indexOf('Z') === -1 ? timeStr + 'Z' : timeStr;
    return dateStr + 'T' + t;
  }
  return dateStr + 'T12:00:00Z';
}

function upsertRaceWeekendRow(sheet, data) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.raceWeekendId) {
      sheet.getRange(i + 1, 8, 1, 7).setValues([[
        data.weekendType, data.startDate, data.endDate, data.status,
        data.externalProvider, data.externalId, data.lastSyncedAt
      ]]);
      return;
    }
  }
  sheet.appendRow([
    data.raceWeekendId, data.season, data.round, data.name, data.country,
    data.circuitId, data.circuitName, data.weekendType, data.startDate,
    data.endDate, data.status, data.externalProvider, data.externalId, data.lastSyncedAt
  ]);
}

function upsertSessionRow(sheet, data) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.sessionId) {
      sheet.getRange(i + 1, 5, 1, 6).setValues([[
        data.startTime, data.endTime, data.status, data.externalProvider, data.externalId, data.lastSyncedAt
      ]]);
      return;
    }
  }
  sheet.appendRow([
    data.sessionId, data.raceWeekendId, data.sessionType, data.sessionName,
    data.startTime, data.endTime, data.status, data.externalProvider, data.externalId, data.lastSyncedAt
  ]);
}

function generatePredictionRoundsForWeekend(sheet, weekendId, raceName, weekendType, sessions, nowIso) {
  // Generate prediction rounds based on session starts
  var bufferMs = 5 * 60 * 1000; // 5 min close buffer

  sessions.forEach(function(sess) {
    if (sess.type === 'QUALIFYING' || sess.type === 'RACE' || sess.type === 'SPRINT_QUALIFYING' || sess.type === 'SPRINT') {
      var roundId = weekendId + '_' + sess.type + '_PREDICTION';
      var sessStartMs = new Date(sess.startTime).getTime();
      var closesAt = new Date(sessStartMs - bufferMs).toISOString();
      var opensAt = new Date(sessStartMs - 48 * 3600 * 1000).toISOString();

      var title = (sess.type === 'QUALIFYING' ? 'Qualifying' : sess.type === 'RACE' ? 'Grand Prix' : sess.name) + ' Prediction';
      var status = new Date().getTime() > (sessStartMs - bufferMs) ? 'LOCKED' : 'OPEN';

      upsertPredictionRoundRow(sheet, {
        roundId: roundId,
        raceWeekendId: weekendId,
        sessionId: sess.id,
        roundType: sess.type,
        title: title,
        description: 'Predict session outcomes for ' + raceName,
        opensAt: opensAt,
        closesAt: closesAt,
        status: status,
        predictionFields: '[]',
        scoringRules: '{}',
        lastSyncedAt: nowIso
      });
    }
  });
}

function upsertPredictionRoundRow(sheet, data) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.roundId) {
      sheet.getRange(i + 1, 7, 1, 6).setValues([[
        data.opensAt, data.closesAt, data.status, data.predictionFields, data.scoringRules, data.lastSyncedAt
      ]]);
      return;
    }
  }
  sheet.appendRow([
    data.roundId, data.raceWeekendId, data.sessionId, data.roundType,
    data.title, data.description, data.opensAt, data.closesAt,
    data.status, data.predictionFields, data.scoringRules, data.lastSyncedAt
  ]);
}

/**
 * Get current / active race weekend
 */
function getCurrentWeekend() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('current_weekend');
  if (cached) return JSON.parse(cached);

  const weekends = getRaceWeekends();
  const now = new Date().getTime();
  let current = null;

  for (let i = 0; i < weekends.length; i++) {
    const end = new Date(weekends[i].endDate).getTime();
    if (end >= now - 24 * 3600 * 1000) {
      current = weekends[i];
      break;
    }
  }
  if (!current && weekends.length > 0) current = weekends[0];

  if (current) {
    current.sessions = getSessionSchedule(current.raceWeekendId);
    current.predictionRounds = getPredictionRounds(current.raceWeekendId);
    cache.put('current_weekend', JSON.stringify(current), 600); // 10 min cache
  }

  return current;
}

function getUpcomingRace() {
  return getCurrentWeekend();
}

function getSessionSchedule(weekendId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  const rows = sheet.getDataRange().getValues();
  const sessions = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === weekendId) {
      sessions.push({
        id: rows[i][0],
        raceWeekendId: rows[i][1],
        type: rows[i][2],
        name: rows[i][3],
        startTime: rows[i][4],
        endTime: rows[i][5],
        status: rows[i][6]
      });
    }
  }
  return sessions;
}

function getPredictionRounds(weekendId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  const rows = sheet.getDataRange().getValues();
  const rounds = [];
  const now = new Date().getTime();

  for (let i = 1; i < rows.length; i++) {
    if (!weekendId || rows[i][1] === weekendId) {
      const opensAt = new Date(rows[i][6]).getTime();
      const closesAt = new Date(rows[i][7]).getTime();
      let status = rows[i][8];
      if (status !== 'SCORED' && status !== 'COMPLETED') {
        if (now < opensAt) status = 'UPCOMING';
        else if (now <= closesAt) status = 'OPEN';
        else status = 'LOCKED';
      }

      rounds.push({
        roundId: rows[i][0],
        raceWeekendId: rows[i][1],
        sessionId: rows[i][2],
        roundType: rows[i][3],
        title: rows[i][4],
        description: rows[i][5],
        opensAt: rows[i][6],
        closesAt: rows[i][7],
        status: status
      });
    }
  }
  return rounds;
}

function getCurrentPredictionRounds() {
  const allRounds = getPredictionRounds();
  return allRounds.filter(function(r) {
    return r.status === 'OPEN' || r.status === 'UPCOMING';
  });
}

function getPredictionRound(roundId) {
  const all = getPredictionRounds();
  for (let i = 0; i < all.length; i++) {
    if (all[i].roundId === roundId) return all[i];
  }
  return null;
}

function getRaceWeekends(season) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.RACE_WEEKENDS);
  const rows = sheet.getDataRange().getValues();
  const weekends = [];
  const now = new Date().getTime();
  const targetSeason = season ? Number(season) : 2026;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rowSeason = Number(r[1]);
    if (targetSeason && rowSeason !== targetSeason) {
      continue;
    }

    const startMs = new Date(r[8]).getTime();
    const endMs = new Date(r[9]).getTime();
    let dynamicStatus = r[10];

    // Compute dynamic status relative to server time
    if (now > endMs) {
      dynamicStatus = 'COMPLETED';
    } else if (now >= startMs - 24 * 3600 * 1000 && now <= endMs) {
      dynamicStatus = 'ACTIVE';
    } else {
      dynamicStatus = 'UPCOMING';
    }

    weekends.push({
      raceWeekendId: r[0],
      id: r[0],
      season: rowSeason,
      round: r[2],
      roundNumber: r[2],
      name: r[3],
      raceName: r[3],
      country: r[4],
      circuit: { id: r[5], name: r[6] },
      weekendType: r[7],
      startDate: r[8],
      endDate: r[9],
      status: dynamicStatus,
      externalProvider: r[11],
      externalId: r[12],
      lastSyncedAt: r[13]
    });
  }
  return weekends;
}

function getWeekendDetails(id) {
  const weekends = getRaceWeekends();
  for (let i = 0; i < weekends.length; i++) {
    if (weekends[i].raceWeekendId === id) {
      weekends[i].sessions = getSessionSchedule(id);
      weekends[i].predictionRounds = getPredictionRounds(id);
      return weekends[i];
    }
  }
  return null;
}

/**
 * Prediction Submission & Scoring (Preserved from existing working implementation)
 */
function submitPrediction(payload) {
  const userId = payload.userId;
  const roundId = payload.roundId;
  const predictionData = payload.predictionData;

  if (!userId || !roundId || !predictionData) {
    throw new Error('Missing required prediction fields.');
  }

  // Verify that submitting user exists in the database
  const userProfile = getUserProfile(userId);
  if (!userProfile) {
    throw new Error('User not found in database. Please log in again.');
  }

  const round = getPredictionRound(roundId);
  if (!round) throw new Error('Prediction round not found.');

  const serverTime = new Date();
  const closeTime = new Date(round.closesAt);
  if (serverTime.getTime() > closeTime.getTime()) {
    throw new Error('Predictions are LOCKED. Deadline has passed.');
  }

  const podium = [predictionData.p1, predictionData.p2, predictionData.p3].filter(Boolean);
  const uniquePodium = Array.from(new Set(podium));
  if (podium.length !== uniquePodium.length) {
    throw new Error('A driver cannot be selected more than once on the podium.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  const rows = sheet.getDataRange().getValues();
  let existingRow = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId && rows[i][2] === roundId) {
      existingRow = i + 1;
      break;
    }
  }

  const nowIso = serverTime.toISOString();
  const dataJson = JSON.stringify(predictionData);
  let savedPrediction = null;

  if (existingRow > 0) {
    sheet.getRange(existingRow, 4).setValue(dataJson);
    sheet.getRange(existingRow, 6).setValue(nowIso);
    savedPrediction = {
      predictionId: rows[existingRow - 1][0],
      userId: userId,
      roundId: roundId,
      predictionData: predictionData,
      submittedAt: rows[existingRow - 1][4],
      updatedAt: nowIso
    };
  } else {
    const predId = 'pred_' + Utilities.getUuid();
    sheet.appendRow([predId, userId, roundId, dataJson, nowIso, nowIso, '']);
    savedPrediction = {
      predictionId: predId,
      userId: userId,
      roundId: roundId,
      predictionData: predictionData,
      submittedAt: nowIso,
      updatedAt: nowIso
    };
  }

  // Enqueue confirmation notification idempotently
  try {
    const recipientEmail = userProfile ? userProfile.email : (payload.email || '');
    if (recipientEmail) {
      enqueueNotification(
        recipientEmail,
        userProfile ? userProfile.displayName : userId,
        'PREDICTION_CONFIRMATION',
        'F1 Community: Prediction Registered for ' + round.title,
        { roundId: roundId, roundTitle: round.title, predictionData: predictionData },
        'PREDICTION:' + roundId + ':' + userId
      );
    }
  } catch (err) {
    Logger.log('Failed to enqueue prediction confirmation: ' + err.toString());
  }

  return savedPrediction;
}

function adminCalculateScores(roundId) {
  // Calculates scores idempotently
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const round = getPredictionRound(roundId);
  if (!round) throw new Error('Round not found');

  const resSheet = ss.getSheetByName(SHEET_NAMES.RESULTS);
  const resRows = resSheet.getDataRange().getValues();
  let official = null;
  for (let i = 1; i < resRows.length; i++) {
    if (resRows[i][1] === roundId) {
      official = JSON.parse(resRows[i][2] || '{}');
      break;
    }
  }
  if (!official) throw new Error('Official results not published yet.');

  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  const predRows = predSheet.getDataRange().getValues();
  const scoresSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  const scoreRows = scoresSheet.getDataRange().getValues();
  const nowIso = new Date().toISOString();
  let scoredCount = 0;

  for (let i = 1; i < predRows.length; i++) {
    if (predRows[i][2] === roundId) {
      const predData = JSON.parse(predRows[i][3] || '{}');
      const userId = predRows[i][1];
      const calc = computeScore(predData, official);

      let existingScoreRow = -1;
      for (let j = 1; j < scoreRows.length; j++) {
        if (scoreRows[j][1] === userId && scoreRows[j][2] === roundId) {
          existingScoreRow = j + 1;
          break;
        }
      }

      if (existingScoreRow > 0) {
        scoresSheet.getRange(existingScoreRow, 4).setValue(JSON.stringify(calc.breakdown));
        scoresSheet.getRange(existingScoreRow, 5).setValue(calc.totalScore);
        scoresSheet.getRange(existingScoreRow, 6).setValue(nowIso);
      } else {
        scoresSheet.appendRow(['score_' + Utilities.getUuid(), userId, roundId, JSON.stringify(calc.breakdown), calc.totalScore, nowIso]);
      }
      scoredCount++;

      // Enqueue results published email idempotently
      try {
        const userProfile = getUserProfile(userId);
        if (userProfile && userProfile.email) {
          enqueueNotification(
            userProfile.email,
            userProfile.displayName || userId,
            'RACE_RESULTS',
            'F1 Community: Results Published for ' + round.title,
            { roundId: roundId, roundTitle: round.title, score: calc.totalScore, breakdown: calc.breakdown },
            'RESULT:' + roundId + ':' + userId
          );
        }
      } catch (err) {
        Logger.log('Failed to enqueue result notification: ' + err.toString());
      }
    }
  }

  return { roundId: roundId, scoredCount: scoredCount };
}

function computeScore(pred, official) {
  var b = {};
  var total = 0;
  var officialPodium = [official.p1, official.p2, official.p3].filter(Boolean);

  var p1Exact = pred.p1 && pred.p1 === official.p1;
  var p2Exact = pred.p2 && pred.p2 === official.p2;
  var p3Exact = pred.p3 && pred.p3 === official.p3;

  b.p1 = p1Exact ? 15 : (officialPodium.indexOf(pred.p1) !== -1 ? 5 : 0);
  b.p2 = p2Exact ? 10 : (officialPodium.indexOf(pred.p2) !== -1 ? 5 : 0);
  b.p3 = p3Exact ? 10 : (officialPodium.indexOf(pred.p3) !== -1 ? 5 : 0);
  b.perfectPodiumBonus = (p1Exact && p2Exact && p3Exact) ? 10 : 0;

  b.fastestLap = (pred.fastestLap && pred.fastestLap === official.fastestLap) ? 10 : 0;
  b.driverOfTheDay = (pred.driverOfTheDay && pred.driverOfTheDay === official.driverOfTheDay) ? 10 : 0;

  if (pred.wildCard !== undefined && official.wildCard !== undefined) {
    b.wildCard = (String(pred.wildCard).toUpperCase() === String(official.wildCard).toUpperCase()) ? 15 : 0;
  } else {
    b.wildCard = 0;
  }

  total = b.p1 + b.p2 + b.p3 + b.perfectPodiumBonus + b.fastestLap + b.driverOfTheDay + b.wildCard;
  return { breakdown: b, totalScore: total };
}

function getUserPrediction(roundId, userId) {
  if (!roundId || !userId) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId && rows[i][2] === roundId) {
      return {
        predictionId: rows[i][0],
        userId: rows[i][1],
        roundId: rows[i][2],
        predictionData: JSON.parse(rows[i][3] || '{}'),
        submittedAt: rows[i][4],
        updatedAt: rows[i][5],
        lockedAt: rows[i][6]
      };
    }
  }
  return null;
}

function getRoundResults(roundId) {
  if (!roundId) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.RESULTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === roundId) {
      return {
        resultId: rows[i][0],
        roundId: rows[i][1],
        resultData: JSON.parse(rows[i][2] || '{}'),
        publishedAt: rows[i][3]
      };
    }
  }
  return null;
}

function getLeaderboard(type, id) {
  const users = getAllUsers();
  const usersMap = {};
  for (let i = 0; i < users.length; i++) {
    usersMap[users[i].userId] = users[i];
  }

  const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  const scoreRows = scoreSheet.getDataRange().getValues();

  // Aggregate based on type
  const userTotals = {};
  const userBreakdowns = {};

  for (let i = 1; i < scoreRows.length; i++) {
    const userId = scoreRows[i][1];
    const roundId = scoreRows[i][2];
    const pts = Number(scoreRows[i][4] || 0);

    let include = false;
    if (type === 'round' || type === 'session') {
      include = (roundId === id);
    } else if (type === 'weekend') {
      include = (roundId && roundId.indexOf(id) !== -1);
    } else {
      include = true; // season
    }

    if (include) {
      userTotals[userId] = (userTotals[userId] || 0) + pts;
      if (!userBreakdowns[userId]) userBreakdowns[userId] = {};
      userBreakdowns[userId][roundId] = pts;
    }
  }

  // Build entry list
  const entries = [];
  const allUserIds = Object.keys(usersMap);
  for (let i = 0; i < allUserIds.length; i++) {
    const uid = allUserIds[i];
    const u = usersMap[uid];
    const pts = userTotals[uid] !== undefined ? userTotals[uid] : (type === 'season' ? u.totalPoints : 0);
    entries.push({
      userId: uid,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      favouriteDriver: u.favouriteDriver,
      totalPoints: pts,
      roundScores: userBreakdowns[uid] || {},
      racesParticipated: Object.keys(userBreakdowns[uid] || {}).length,
      avgPointsPerRace: Object.keys(userBreakdowns[uid] || {}).length > 0
        ? Math.round((pts / Object.keys(userBreakdowns[uid] || {}).length) * 10) / 10
        : 0,
      exactP1Count: 0,
      perfectPodiumCount: 0
    });
  }

  entries.sort(function(a, b) { return b.totalPoints - a.totalPoints; });
  return entries.map(function(e, idx) {
    return Object.assign({}, e, {
      rank: idx + 1,
      previousRank: idx + 1,
      rankChange: 0
    });
  });
}

const USER_HEADERS = [
  'userId', 'email', 'displayName', 'username', 'avatarUrl',
  'favouriteDriver', 'favouriteConstructor', 'bio', 'passwordHash',
  'authProvider', 'lastLoginAt', 'role', 'createdAt', 'totalPoints', 'seasonRank'
];

function ensureUserHeaders(sheet) {
  if (!sheet) return;
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    sheet.getRange(1, 1, 1, USER_HEADERS.length).setValues([USER_HEADERS]);
    sheet.getRange(1, 1, 1, USER_HEADERS.length).setBackground('#e10600').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    return;
  }
  const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0] || [];
  const existingMap = {};
  currentHeaders.forEach(function(h) { existingMap[String(h).trim()] = true; });

  const missing = [];
  USER_HEADERS.forEach(function(h) {
    if (!existingMap[h]) missing.push(h);
  });
  if (missing.length > 0) {
    sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
    sheet.getRange(1, lastCol + 1, 1, missing.length).setBackground('#e10600').setFontColor('#ffffff').setFontWeight('bold');
  }
}

function getAllUsersInternal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) return [];
  ensureUserHeaders(sheet);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const colMap = {};
  for (let c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).trim()] = c;
  }

  const users = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uid = colMap['userId'] !== undefined ? row[colMap['userId']] : row[0];
    if (!uid) continue;

    users.push({
      userId: String(uid),
      email: String(colMap['email'] !== undefined ? row[colMap['email']] : row[1] || ''),
      displayName: String(colMap['displayName'] !== undefined ? row[colMap['displayName']] : row[2] || ''),
      username: String(colMap['username'] !== undefined ? row[colMap['username']] : row[3] || ''),
      avatarUrl: String(colMap['avatarUrl'] !== undefined ? row[colMap['avatarUrl']] : row[4] || ''),
      favouriteDriver: String(colMap['favouriteDriver'] !== undefined ? row[colMap['favouriteDriver']] : row[5] || ''),
      favouriteConstructor: String((colMap['favouriteConstructor'] !== undefined ? row[colMap['favouriteConstructor']] : '') || 'ferrari'),
      bio: String((colMap['bio'] !== undefined ? row[colMap['bio']] : '') || ''),
      role: String((colMap['role'] !== undefined ? row[colMap['role']] : '') || 'user'),
      createdAt: String((colMap['createdAt'] !== undefined ? row[colMap['createdAt']] : '') || ''),
      lastLoginAt: String((colMap['lastLoginAt'] !== undefined ? row[colMap['lastLoginAt']] : '') || ''),
      totalPoints: Number((colMap['totalPoints'] !== undefined ? row[colMap['totalPoints']] : 0) || 0),
      seasonRank: Number((colMap['seasonRank'] !== undefined ? row[colMap['seasonRank']] : i) || i)
    });
  }
  return users;
}

/**
 * Public User Listing:
 * Protects email privacy by blanking email addresses for public consumption.
 */
function getAllUsers() {
  const users = getAllUsersInternal();
  return users.map(function(u) {
    return Object.assign({}, u, { email: '' });
  });
}

/**
 * Admin User Directory:
 * Strictly verifies that the requesting user exists in the USERS table
 * and possesses role === 'admin'. Only verified administrators receive
 * complete user data with email and login timestamps.
 */
function getAdminUsers(requesterId) {
  if (!requesterId) {
    throw new Error('Unauthorized: Authentication identity required.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) return [];
  ensureUserHeaders(sheet);

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const colMap = {};
  for (let c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).trim()] = c;
  }

  const cleanReq = String(requesterId).trim().toLowerCase();
  let isAdmin = false;

  const uidCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
  const emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
  const usernameCol = colMap['username'] !== undefined ? colMap['username'] : 3;
  const roleCol = colMap['role'] !== undefined ? colMap['role'] : 6;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uId = String(row[uidCol] || '').trim().toLowerCase();
    const uEmail = String(row[emailCol] || '').trim().toLowerCase();
    const uName = String(row[usernameCol] || '').trim().toLowerCase();

    if (uId === cleanReq || uEmail === cleanReq || uName === cleanReq) {
      const roleVal = String(row[roleCol] || '').trim().toLowerCase();
      if (roleVal === 'admin') {
        isAdmin = true;
      }
      break;
    }
  }

  if (!isAdmin) {
    throw new Error('Forbidden: Administrator privileges required to access user list.');
  }

  return getAllUsersInternal();
}

function getUserProfile(userIdOrUsername) {
  if (!userIdOrUsername) return null;
  const target = String(userIdOrUsername).trim().toLowerCase();
  const users = getAllUsersInternal();
  for (let i = 0; i < users.length; i++) {
    if (
      String(users[i].userId).toLowerCase() === target ||
      String(users[i].username).toLowerCase() === target ||
      String(users[i].email).toLowerCase() === target
    ) {
      return users[i];
    }
  }
  return null;
}

function googleLogin(payload) {
  const email = (payload.email || '').toLowerCase().trim();
  if (!email) {
    throw new Error('Google email address is required.');
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Database is busy, please retry in a moment.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAMES.USERS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.USERS);
    }
    ensureUserHeaders(sheet);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0] || [];
    const colMap = {};
    for (let c = 0; c < headers.length; c++) {
      colMap[String(headers[c]).trim()] = c;
    }

    const emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
    const userIdCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
    const displayNameCol = colMap['displayName'] !== undefined ? colMap['displayName'] : 2;
    const usernameCol = colMap['username'] !== undefined ? colMap['username'] : 3;
    const avatarCol = colMap['avatarUrl'] !== undefined ? colMap['avatarUrl'] : 4;
    const favDriverCol = colMap['favouriteDriver'] !== undefined ? colMap['favouriteDriver'] : 5;
    const favConstCol = colMap['favouriteConstructor'];
    const bioCol = colMap['bio'];
    const roleCol = colMap['role'] !== undefined ? colMap['role'] : 6;
    const createdAtCol = colMap['createdAt'] !== undefined ? colMap['createdAt'] : 7;
    const pointsCol = colMap['totalPoints'] !== undefined ? colMap['totalPoints'] : 8;
    const rankCol = colMap['seasonRank'] !== undefined ? colMap['seasonRank'] : 9;
    const authProviderCol = colMap['authProvider'];
    const lastLoginCol = colMap['lastLoginAt'];

    const nowIso = new Date().toISOString();

    // CASE B — RETURNING USER: Check if user already exists
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[emailCol]).toLowerCase() === email) {
        const rowIdx = i + 1;
        if (lastLoginCol !== undefined) {
          sheet.getRange(rowIdx, lastLoginCol + 1).setValue(nowIso);
        }
        if (payload.photoUrl && avatarCol !== undefined && !row[avatarCol]) {
          sheet.getRange(rowIdx, avatarCol + 1).setValue(payload.photoUrl);
        }

        return {
          userId: String(row[userIdCol]),
          email: String(row[emailCol]),
          displayName: String(row[displayNameCol] || payload.displayName || email.split('@')[0]),
          username: String(row[usernameCol] || email.split('@')[0]),
          avatarUrl: String((avatarCol !== undefined ? row[avatarCol] : '') || payload.photoUrl || ''),
          favouriteDriver: String((favDriverCol !== undefined ? row[favDriverCol] : '') || 'verstappen'),
          favouriteConstructor: String((favConstCol !== undefined ? row[favConstCol] : '') || 'red_bull'),
          bio: String((bioCol !== undefined ? row[bioCol] : '') || 'F1 Enthusiast & Strategy Predictor'),
          role: String(row[roleCol] || 'user'),
          createdAt: String(row[createdAtCol] || nowIso),
          totalPoints: Number((pointsCol !== undefined ? row[pointsCol] : 0) || 0),
          seasonRank: Number((rankCol !== undefined ? row[rankCol] : i) || i)
        };
      }
    }

    // CASE A — NEW USER: Create user record in USERS
    const baseUsername = (payload.username || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '') || 'racer';
    let cleanUsername = baseUsername;
    let suffix = 1;
    while (rows.some(function(r, idx) { return idx > 0 && String(r[usernameCol]).toLowerCase() === cleanUsername; })) {
      cleanUsername = baseUsername + suffix;
      suffix++;
    }

    const userId = 'usr_' + cleanUsername + '_' + Utilities.getUuid().substring(0, 8);
    const displayName = payload.displayName || cleanUsername;
    const avatarUrl = payload.photoUrl || '';
    const favouriteDriver = payload.favouriteDriver || 'verstappen';
    const favouriteConstructor = payload.favouriteConstructor || 'red_bull';
    const bio = payload.bio || 'F1 Enthusiast & Strategy Predictor';
    const role = 'user';
    const totalPoints = 0;
    const seasonRank = rows.length;

    const newRow = new Array(headers.length).fill('');
    newRow[userIdCol] = userId;
    newRow[emailCol] = email;
    newRow[displayNameCol] = displayName;
    newRow[usernameCol] = cleanUsername;
    if (avatarCol !== undefined) newRow[avatarCol] = avatarUrl;
    if (favDriverCol !== undefined) newRow[favDriverCol] = favouriteDriver;
    if (favConstCol !== undefined) newRow[favConstCol] = favouriteConstructor;
    if (bioCol !== undefined) newRow[bioCol] = bio;
    if (colMap['passwordHash'] !== undefined) newRow[colMap['passwordHash']] = '';
    if (roleCol !== undefined) newRow[roleCol] = role;
    if (createdAtCol !== undefined) newRow[createdAtCol] = nowIso;
    if (pointsCol !== undefined) newRow[pointsCol] = totalPoints;
    if (rankCol !== undefined) newRow[rankCol] = seasonRank;
    if (authProviderCol !== undefined) newRow[authProviderCol] = 'google';
    if (lastLoginCol !== undefined) newRow[lastLoginCol] = nowIso;

    sheet.appendRow(newRow);

    return {
      userId: userId,
      email: email,
      displayName: displayName,
      username: cleanUsername,
      avatarUrl: avatarUrl,
      favouriteDriver: favouriteDriver,
      favouriteConstructor: favouriteConstructor,
      bio: bio,
      role: role,
      createdAt: nowIso,
      totalPoints: 0,
      seasonRank: seasonRank
    };
  } finally {
    lock.releaseLock();
  }
}

function loginUser(identifier, passwordHash) {
  if (!identifier) throw new Error('Username or email is required.');
  const cleanId = String(identifier).trim().toLowerCase();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) throw new Error('Users sheet not found');
  ensureUserHeaders(sheet);

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0] || [];
  const colMap = {};
  for (let c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).trim()] = c;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uName = String(colMap['username'] !== undefined ? row[colMap['username']] : row[3] || '').toLowerCase();
    const uEmail = String(colMap['email'] !== undefined ? row[colMap['email']] : row[1] || '').toLowerCase();
    const uId = String(colMap['userId'] !== undefined ? row[colMap['userId']] : row[0] || '').toLowerCase();
    const uRole = String(colMap['role'] !== undefined ? row[colMap['role']] : row[6] || '').toLowerCase();

    if (uName === cleanId || uEmail === cleanId || uId === cleanId || (cleanId === 'admin' && uRole === 'admin')) {
      const storedHash = colMap['passwordHash'] !== undefined ? String(row[colMap['passwordHash']]) : '';
      if (storedHash && passwordHash && storedHash !== passwordHash) {
        throw new Error('Invalid password for this account.');
      }
      return {
        userId: String(row[colMap['userId'] !== undefined ? colMap['userId'] : 0]),
        email: String(row[colMap['email'] !== undefined ? row[colMap['email']] : 1] || ''),
        displayName: String(row[colMap['displayName'] !== undefined ? row[colMap['displayName']] : 2] || ''),
        username: String(row[colMap['username'] !== undefined ? row[colMap['username']] : 3] || ''),
        avatarUrl: String(colMap['avatarUrl'] !== undefined ? row[colMap['avatarUrl']] : row[4] || ''),
        favouriteDriver: String(colMap['favouriteDriver'] !== undefined ? row[colMap['favouriteDriver']] : row[5] || ''),
        favouriteConstructor: String(colMap['favouriteConstructor'] !== undefined ? row[colMap['favouriteConstructor']] : 'ferrari'),
        bio: String(colMap['bio'] !== undefined ? row[colMap['bio']] : ''),
        role: String(colMap['role'] !== undefined ? row[colMap['role']] : 'user'),
        createdAt: String(colMap['createdAt'] !== undefined ? row[colMap['createdAt']] : ''),
        totalPoints: Number(colMap['totalPoints'] !== undefined ? row[colMap['totalPoints']] : 0),
        seasonRank: Number(colMap['seasonRank'] !== undefined ? row[colMap['seasonRank']] : i)
      };
    }
  }
  throw new Error('No racer found with username or email: ' + identifier);
}

function registerUser(payload) {
  const username = (payload.username || '').toLowerCase().trim();
  const email = (payload.email || '').toLowerCase().trim();

  if (!username || !email) {
    throw new Error('Username and email are required.');
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Database is busy, please retry in a moment.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAMES.USERS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.USERS);
    }
    ensureUserHeaders(sheet);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0] || [];
    const colMap = {};
    for (let c = 0; c < headers.length; c++) {
      colMap[String(headers[c]).trim()] = c;
    }

    const uCol = colMap['username'] !== undefined ? colMap['username'] : 3;
    const eCol = colMap['email'] !== undefined ? colMap['email'] : 1;

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][uCol]).toLowerCase() === username) {
        throw new Error('Username @' + username + ' is already registered.');
      }
      if (String(rows[i][eCol]).toLowerCase() === email) {
        throw new Error('Email ' + email + ' is already registered.');
      }
    }

    const userId = payload.userId || ('usr_' + username + '_' + Utilities.getUuid().substring(0, 8));
    const displayName = payload.displayName || username;
    const avatarUrl = payload.avatarUrl || '';
    const favouriteDriver = payload.favouriteDriver || 'verstappen';
    const favouriteConstructor = payload.favouriteConstructor || 'ferrari';
    const bio = payload.bio || 'F1 Enthusiast & Strategy Predictor';
    const passwordHash = payload.passwordHash || '';
    const role = 'user';
    const nowIso = new Date().toISOString();
    const totalPoints = 0;
    const seasonRank = rows.length;

    const newRow = new Array(headers.length).fill('');
    if (colMap['userId'] !== undefined) newRow[colMap['userId']] = userId;
    if (colMap['email'] !== undefined) newRow[colMap['email']] = email;
    if (colMap['displayName'] !== undefined) newRow[colMap['displayName']] = displayName;
    if (colMap['username'] !== undefined) newRow[colMap['username']] = username;
    if (colMap['avatarUrl'] !== undefined) newRow[colMap['avatarUrl']] = avatarUrl;
    if (colMap['favouriteDriver'] !== undefined) newRow[colMap['favouriteDriver']] = favouriteDriver;
    if (colMap['favouriteConstructor'] !== undefined) newRow[colMap['favouriteConstructor']] = favouriteConstructor;
    if (colMap['bio'] !== undefined) newRow[colMap['bio']] = bio;
    if (colMap['passwordHash'] !== undefined) newRow[colMap['passwordHash']] = passwordHash;
    if (colMap['role'] !== undefined) newRow[colMap['role']] = role;
    if (colMap['createdAt'] !== undefined) newRow[colMap['createdAt']] = nowIso;
    if (colMap['totalPoints'] !== undefined) newRow[colMap['totalPoints']] = totalPoints;
    if (colMap['seasonRank'] !== undefined) newRow[colMap['seasonRank']] = seasonRank;
    if (colMap['authProvider'] !== undefined) newRow[colMap['authProvider']] = 'credentials';
    if (colMap['lastLoginAt'] !== undefined) newRow[colMap['lastLoginAt']] = nowIso;

    sheet.appendRow(newRow);

    return {
      userId: userId,
      email: email,
      displayName: displayName,
      username: username,
      avatarUrl: avatarUrl,
      favouriteDriver: favouriteDriver,
      favouriteConstructor: favouriteConstructor,
      bio: bio,
      role: role,
      createdAt: nowIso,
      totalPoints: 0,
      seasonRank: seasonRank
    };
  } finally {
    lock.releaseLock();
  }
}

function updateUser(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) throw new Error('Users sheet not found');
  ensureUserHeaders(sheet);

  const rows = sheet.getDataRange().getValues();
  const userId = payload.userId;
  const updates = payload.updates || {};

  const headers = rows[0] || [];
  const colMap = {};
  for (let c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).trim()] = c;
  }

  for (let i = 1; i < rows.length; i++) {
    const uid = colMap['userId'] !== undefined ? rows[i][colMap['userId']] : rows[i][0];
    if (uid === userId) {
      const rowIdx = i + 1;
      if (updates.displayName !== undefined && colMap['displayName'] !== undefined) {
        sheet.getRange(rowIdx, colMap['displayName'] + 1).setValue(updates.displayName);
      }
      if (updates.avatarUrl !== undefined && colMap['avatarUrl'] !== undefined) {
        sheet.getRange(rowIdx, colMap['avatarUrl'] + 1).setValue(updates.avatarUrl);
      }
      if (updates.favouriteDriver !== undefined && colMap['favouriteDriver'] !== undefined) {
        sheet.getRange(rowIdx, colMap['favouriteDriver'] + 1).setValue(updates.favouriteDriver);
      }
      if (updates.favouriteConstructor !== undefined && colMap['favouriteConstructor'] !== undefined) {
        sheet.getRange(rowIdx, colMap['favouriteConstructor'] + 1).setValue(updates.favouriteConstructor);
      }
      if (updates.bio !== undefined && colMap['bio'] !== undefined) {
        sheet.getRange(rowIdx, colMap['bio'] + 1).setValue(updates.bio);
      }
      return { success: true, userId: userId };
    }
  }
  throw new Error('User not found in database');
}

function getUserAchievements(userId) {
  if (!userId) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ACHIEVEMENTS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const achievements = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId) {
      achievements.push({
        achievementId: rows[i][0],
        userId: rows[i][1],
        achievementType: rows[i][2],
        title: rows[i][3],
        description: rows[i][4],
        badgeIcon: rows[i][5],
        earnedAt: rows[i][6]
      });
    }
  }
  return achievements;
}

function getUserPredictionsHistory(userId) {
  if (!userId) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  if (!predSheet) return [];
  const predRows = predSheet.getDataRange().getValues();
  const userPreds = [];
  for (let i = 1; i < predRows.length; i++) {
    if (predRows[i][1] === userId) {
      const roundId = predRows[i][2];
      const round = getPredictionRound(roundId);
      const pred = {
        predictionId: predRows[i][0],
        userId: predRows[i][1],
        roundId: roundId,
        predictionData: JSON.parse(predRows[i][3] || '{}'),
        submittedAt: predRows[i][4],
        updatedAt: predRows[i][5]
      };
      const result = getRoundResults(roundId);
      let score = null;
      const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
      if (scoreSheet) {
        const scoreRows = scoreSheet.getDataRange().getValues();
        for (let s = 1; s < scoreRows.length; s++) {
          if (scoreRows[s][1] === userId && scoreRows[s][2] === roundId) {
            score = {
              scoreId: scoreRows[s][0],
              userId: scoreRows[s][1],
              roundId: scoreRows[s][2],
              breakdown: JSON.parse(scoreRows[s][3] || '{}'),
              totalScore: Number(scoreRows[s][4] || 0),
              calculatedAt: scoreRows[s][5]
            };
            break;
          }
        }
      }
      let weekend = null;
      if (round && round.raceWeekendId) {
        weekend = getWeekendDetails(round.raceWeekendId);
      }
      userPreds.push({
        prediction: pred,
        round: round,
        score: score,
        result: result,
        weekend: weekend
      });
    }
  }
  return userPreds;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================
 * ASYNCHRONOUS NOTIFICATION QUEUE & IDEMPOTENT DELIVERY
 * =========================================================================
 */

function enqueueNotification(recipientEmail, recipientName, notificationType, subject, templateData, idempotencyKey) {
  if (!recipientEmail || !idempotencyKey) return false;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let queueSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_QUEUE);
  if (!queueSheet) {
    queueSheet = ss.insertSheet(SHEET_NAMES.NOTIFICATION_QUEUE);
    queueSheet.getRange(1, 1, 1, 12).setValues([['id', 'recipientEmail', 'recipientName', 'notificationType', 'subject', 'templateDataJson', 'status', 'idempotencyKey', 'attempts', 'queuedAt', 'sentAt', 'errorMessage']]);
  }

  // Idempotency check in queue
  const queueRows = queueSheet.getDataRange().getValues();
  for (let i = 1; i < queueRows.length; i++) {
    if (queueRows[i][7] === idempotencyKey) {
      Logger.log('Notification with idempotency key ' + idempotencyKey + ' already enqueued. Skipping.');
      return false;
    }
  }

  // Idempotency check in log
  const logSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_LOG);
  if (logSheet) {
    const logRows = logSheet.getDataRange().getValues();
    for (let j = 1; j < logRows.length; j++) {
      if (logRows[j][4] === idempotencyKey) {
        Logger.log('Notification with idempotency key ' + idempotencyKey + ' already delivered. Skipping.');
        return false;
      }
    }
  }

  const queueId = 'ntf_' + Utilities.getUuid();
  const nowIso = new Date().toISOString();
  queueSheet.appendRow([
    queueId,
    recipientEmail,
    recipientName || '',
    notificationType,
    subject,
    JSON.stringify(templateData || {}),
    'PENDING',
    idempotencyKey,
    0,
    nowIso,
    '',
    ''
  ]);

  return true;
}

function processNotificationQueue(batchLimit) {
  const limit = batchLimit || 25;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const queueSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_QUEUE);
  if (!queueSheet) return { processed: 0, sent: 0, failed: 0 };

  let logSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_LOG);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_NAMES.NOTIFICATION_LOG);
    logSheet.getRange(1, 1, 1, 8).setValues([['id', 'queueId', 'recipientEmail', 'notificationType', 'idempotencyKey', 'sentAt', 'status', 'deliveryMetadata']]);
  }

  const rows = queueSheet.getDataRange().getValues();
  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (let i = 1; i < rows.length && processed < limit; i++) {
    const status = rows[i][6];
    if (status === 'PENDING' || status === 'RETRY') {
      processed++;
      const rowIdx = i + 1;
      const queueId = rows[i][0];
      const email = rows[i][1];
      const name = rows[i][2];
      const type = rows[i][3];
      const subject = rows[i][4];
      const data = JSON.parse(rows[i][5] || '{}');
      const idempotencyKey = rows[i][7];
      const attempts = Number(rows[i][8] || 0) + 1;
      const nowIso = new Date().toISOString();

      try {
        let body = 'Hello ' + (name || 'Racer') + ',\n\n' + subject + '\n\n';
        if (type === 'PREDICTION_CONFIRMATION') {
          body += 'Your predictions for ' + (data.roundTitle || 'this round') + ' have been registered and locked.\n';
        } else if (type === 'RACE_RESULTS') {
          body += 'Official race results are published. You scored ' + (data.score || 0) + ' points.\n';
        } else if (type === 'WELCOME') {
          body += 'Welcome to the 2026 F1 Community Platform!\n';
        }
        body += '\nTrack standings and race weekends: https://f1community.local\n— F1 Community Platform';

        MailApp.sendEmail({
          to: email,
          subject: subject,
          body: body
        });

        queueSheet.getRange(rowIdx, 7).setValue('SENT');
        queueSheet.getRange(rowIdx, 9).setValue(attempts);
        queueSheet.getRange(rowIdx, 11).setValue(nowIso);

        logSheet.appendRow([
          'log_' + Utilities.getUuid(),
          queueId,
          email,
          type,
          idempotencyKey,
          nowIso,
          'DELIVERED',
          JSON.stringify({ attempts: attempts })
        ]);
        sent++;
      } catch (err) {
        failed++;
        queueSheet.getRange(rowIdx, 7).setValue(attempts >= 3 ? 'FAILED' : 'RETRY');
        queueSheet.getRange(rowIdx, 9).setValue(attempts);
        queueSheet.getRange(rowIdx, 12).setValue(err.toString());
      }
    }
  }

  return { processed: processed, sent: sent, failed: failed };
}
