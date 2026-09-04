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
  SYNC_LOGS: 'SyncLogs'
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

  if (existingRow > 0) {
    sheet.getRange(existingRow, 4).setValue(dataJson);
    sheet.getRange(existingRow, 6).setValue(nowIso);
  } else {
    const predId = 'pred_' + Utilities.getUuid();
    sheet.appendRow([predId, userId, roundId, dataJson, nowIso, nowIso, '']);
  }

  return { success: true, roundId: roundId, userId: userId, updatedAt: nowIso };
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const userRows = userSheet.getDataRange().getValues();
  const usersMap = {};
  for (let i = 1; i < userRows.length; i++) {
    usersMap[userRows[i][0]] = {
      userId: userRows[i][0],
      email: userRows[i][1],
      displayName: userRows[i][2],
      username: userRows[i][3],
      avatarUrl: userRows[i][4],
      favouriteDriver: userRows[i][5],
      role: userRows[i][6],
      totalPoints: Number(userRows[i][8] || 0)
    };
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

function getUserProfile(userIdOrUsername) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const rows = userSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userIdOrUsername || rows[i][3] === userIdOrUsername) {
      return {
        userId: rows[i][0],
        email: rows[i][1],
        displayName: rows[i][2],
        username: rows[i][3],
        avatarUrl: rows[i][4],
        favouriteDriver: rows[i][5],
        role: rows[i][6],
        createdAt: rows[i][7],
        totalPoints: Number(rows[i][8] || 0),
        seasonRank: Number(rows[i][9] || 1)
      };
    }
  }
  return null;
}

function getAllDrivers() {
  return [
    { id: 'norris', code: 'NOR', firstName: 'Lando', lastName: 'Norris', number: 4, team: 'McLaren', teamColor: '#ff8000', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'piastri', code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', number: 81, team: 'McLaren', teamColor: '#ff8000', country: 'Australia', countryFlag: '🇦🇺' },
    { id: 'verstappen', code: 'VER', firstName: 'Max', lastName: 'Verstappen', number: 1, team: 'Red Bull Racing', teamColor: '#1e41ff', country: 'Netherlands', countryFlag: '🇳🇱' },
    { id: 'lawson', code: 'LAW', firstName: 'Liam', lastName: 'Lawson', number: 30, team: 'Red Bull Racing', teamColor: '#1e41ff', country: 'New Zealand', countryFlag: '🇳🇿' },
    { id: 'hamilton', code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', number: 44, team: 'Ferrari', teamColor: '#e10600', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'leclerc', code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', number: 16, team: 'Ferrari', teamColor: '#e10600', country: 'Monaco', countryFlag: '🇲🇨' },
    { id: 'russell', code: 'RUS', firstName: 'George', lastName: 'Russell', number: 63, team: 'Mercedes', teamColor: '#00a19c', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'antonelli', code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', number: 12, team: 'Mercedes', teamColor: '#00a19c', country: 'Italy', countryFlag: '🇮🇹' },
    { id: 'alonso', code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', number: 14, team: 'Aston Martin', teamColor: '#229971', country: 'Spain', countryFlag: '🇪🇸' },
    { id: 'stroll', code: 'STR', firstName: 'Lance', lastName: 'Stroll', number: 18, team: 'Aston Martin', teamColor: '#229971', country: 'Canada', countryFlag: '🇨🇦' },
    { id: 'gasly', code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', number: 10, team: 'Alpine', teamColor: '#0090ff', country: 'France', countryFlag: '🇫🇷' },
    { id: 'doohan', code: 'DOO', firstName: 'Jack', lastName: 'Doohan', number: 7, team: 'Alpine', teamColor: '#0090ff', country: 'Australia', countryFlag: '🇦🇺' },
    { id: 'albon', code: 'ALB', firstName: 'Alexander', lastName: 'Albon', number: 23, team: 'Williams', teamColor: '#64c4ff', country: 'Thailand', countryFlag: '🇹🇭' },
    { id: 'sainz', code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', number: 55, team: 'Williams', teamColor: '#64c4ff', country: 'Spain', countryFlag: '🇪🇸' },
    { id: 'tsunoda', code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', number: 22, team: 'Racing Bulls', teamColor: '#6692ff', country: 'Japan', countryFlag: '🇯🇵' },
    { id: 'hadjar', code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', number: 6, team: 'Racing Bulls', teamColor: '#6692ff', country: 'France', countryFlag: '🇫🇷' },
    { id: 'hulkenberg', code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', number: 27, team: 'Sauber', teamColor: '#52e252', country: 'Germany', countryFlag: '🇩🇪' },
    { id: 'bortoleto', code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', number: 5, team: 'Sauber', teamColor: '#52e252', country: 'Brazil', countryFlag: '🇧🇷' },
    { id: 'ocon', code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', number: 31, team: 'Haas', teamColor: '#b6babd', country: 'France', countryFlag: '🇫🇷' },
    { id: 'bearman', code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', number: 87, team: 'Haas', teamColor: '#b6babd', country: 'United Kingdom', countryFlag: '🇬🇧' }
  ];
}

function syncCurrentWeekend() {
  const current = getCurrentWeekend();
  if (current && current.season && current.round) {
    return syncRaceWeekend(current.season, current.round);
  }
  return { success: false, message: 'No current weekend found' };
}

function syncRaceWeekend(season, round) {
  return syncSeasonCalendar(season || 2026);
}

function adminSaveWeekend(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.RACE_WEEKENDS);
  upsertRaceWeekendRow(sheet, payload);
  return { success: true, weekend: payload };
}

function adminSubmitResult(payload) {
  const roundId = payload.roundId;
  const resultData = payload.resultData;
  if (!roundId || !resultData) throw new Error('Missing roundId or resultData');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.RESULTS);
  const rows = sheet.getDataRange().getValues();
  let existingRow = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === roundId) {
      existingRow = i + 1;
      break;
    }
  }

  const nowIso = new Date().toISOString();
  const jsonStr = JSON.stringify(resultData);

  if (existingRow > 0) {
    sheet.getRange(existingRow, 3).setValue(jsonStr);
    sheet.getRange(existingRow, 4).setValue(nowIso);
  } else {
    sheet.appendRow(['res_' + Utilities.getUuid(), roundId, jsonStr, nowIso]);
  }

  const prSheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  const prRows = prSheet.getDataRange().getValues();
  for (let j = 1; j < prRows.length; j++) {
    if (prRows[j][0] === roundId) {
      prSheet.getRange(j + 1, 9).setValue('COMPLETED');
      break;
    }
  }

  return { success: true, roundId: roundId, publishedAt: nowIso };
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
