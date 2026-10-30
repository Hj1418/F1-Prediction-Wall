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
  NOTIFICATION_LOG: 'NotificationLog',
  QUIZ_CATEGORIES: 'QuizCategories',
  QUIZ_QUESTIONS: 'QuizQuestions',
  QUIZ_ATTEMPTS: 'QuizAttempts',
  QUIZ_ACHIEVEMENTS: 'QuizAchievements',
  STRATEGY_SCENARIOS: 'StrategyScenarios',
  STRATEGY_ATTEMPTS: 'StrategyAttempts',
  STRATEGY_DECISIONS: 'StrategyDecisions',
  STRATEGY_LEADERBOARD: 'StrategyLeaderboard',
  STRATEGY_ROUNDS: 'StrategyRounds',
  STRATEGY_DISCUSSIONS: 'StrategyDiscussions',
  STRATEGY_VOTES: 'StrategyVotes'
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
      case 'getDrivers':
        responseData = getDrivers(e.parameter.season);
        break;
      case 'getConstructors':
        responseData = getConstructors();
        break;
      case 'getEligibleDrivers':
        responseData = getEligibleDrivers(e.parameter.raceWeekendId, e.parameter.season);
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
      case 'getUserWeekendPredictions':
        responseData = getUserWeekendPredictions(e.parameter.userId, e.parameter.raceWeekendId);
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
        responseData = getAdminUsers(e.parameter.requesterId || e.parameter.userId, e.parameter.accessToken, e.parameter.authToken || e.parameter.token);
        break;
      case 'getAdminCompetitionAnalytics':
        responseData = getAdminCompetitionAnalytics(
          e.parameter.requesterId || e.parameter.userId,
          e.parameter.accessToken,
          e.parameter.authToken || e.parameter.token,
          e.parameter.timeRange
        );
        break;
      case 'getAdminUserCompetitionProfile':
        responseData = getAdminUserCompetitionProfile(
          e.parameter.requesterId || e.parameter.userId,
          e.parameter.targetUserId,
          e.parameter.accessToken,
          e.parameter.authToken || e.parameter.token
        );
        break;
      case 'getAdminPredictions':
      case 'getPredictions':
        responseData = getAdminPredictions(e.parameter.roundId);
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
      case 'getNotificationQueueStatus':
        responseData = getNotificationQueueStatus();
        break;
      case 'checkUsernameAvailability':
      case 'checkUsername':
        responseData = checkUsernameAvailability(e.parameter.username, e.parameter.userId || e.parameter.excludeUserId);
        break;
      case 'getRoundScore':
        responseData = getRoundScore(e.parameter.roundId, e.parameter.userId);
        break;
      case 'setBakuDeadlineMidnight':
        responseData = setBakuPredictionDeadlineMidnight();
        break;
      case 'normalizeAzerbaijanPredictions':
        responseData = normalizeAzerbaijanPredictionRoundIds();
        break;
      case 'auditAndDeduplicateUsers':
        responseData = auditAndDeduplicateUsers(e.parameter.dryRun !== 'false');
        break;
      case 'auditPlatformData':
        responseData = auditPlatformData(e.parameter.dryRun !== 'false');
        break;
      case 'getQuizCategories':
        responseData = handleGetQuizCategories();
        break;
      case 'getUserQuizHistory':
        responseData = handleGetUserQuizHistory(e.parameter.userId);
        break;
      case 'getQuizAttemptResult':
        responseData = handleGetQuizAttemptResult(e.parameter.attemptId, e.parameter.userId);
        break;
      case 'getUserQuizAchievements':
        responseData = handleGetUserQuizAchievements(e.parameter.userId);
        break;
      case 'getStrategyScenarios':
        responseData = handleGetStrategyScenarios(e.parameter.mode, e.parameter.category);
        break;
      case 'getStrategyAttempt':
        responseData = handleGetStrategyAttempt(e.parameter.attemptId, e.parameter.userId);
        break;
      case 'getStrategyHistory':
        responseData = handleGetStrategyHistory(e.parameter.userId);
        break;
      case 'getStrategyLeaderboard':
        responseData = handleGetStrategyLeaderboard(e.parameter.periodKey || 'all_time');
        break;
      case 'getStrategyPerformance':
        responseData = handleGetStrategyPerformance(e.parameter.userId);
        break;
      case 'getPreRaceRounds':
        responseData = handleGetPreRaceRounds(e.parameter.scenarioId);
        break;
      case 'getPreRaceDiscussions':
        responseData = handleGetPreRaceDiscussions(e.parameter.roundId);
        break;
      case 'getPreRaceVotes':
        responseData = handleGetPreRaceVotes(e.parameter.roundId);
        break;
      case 'getAdminCompetitionAnalytics':
        responseData = getAdminCompetitionAnalytics(
          e.parameter.requesterId,
          e.parameter.accessToken,
          e.parameter.authToken,
          e.parameter.timeRange
        );
        break;
      case 'getAdminUserCompetitionProfile':
        responseData = getAdminUserCompetitionProfile(
          e.parameter.requesterId,
          e.parameter.targetUserId,
          e.parameter.accessToken,
          e.parameter.authToken
        );
        break;
      case 'getPublicCommunityReport':
        assertAdminPrivileges(e.parameter.requesterId, e.parameter.accessToken, e.parameter.authToken);
        responseData = getPublicCommunityReport(e.parameter.timeRange || 'all');
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
      case 'setupPassword':
        responseData = setupPassword(payload);
        break;
      case 'requestPasswordReset':
        responseData = requestPasswordReset(payload);
        break;
      case 'resetPassword':
        responseData = resetPassword(payload);
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
      case 'auditAndDeduplicateUsers':
        responseData = auditAndDeduplicateUsers(payload.dryRun !== false);
        break;
      case 'auditPlatformData':
        responseData = auditPlatformData(payload.dryRun !== false);
        break;
      case 'processNotificationQueue':
        responseData = processNotificationQueue(payload.limit);
        break;
      case 'sendDirectEmail':
        if (!payload.to || !payload.subject || !payload.body) {
          throw new Error('Missing required fields: to, subject, body');
        }
        var mailOpts = {
          to: payload.to,
          name: payload.name || 'The Grid',
          subject: payload.subject,
          body: payload.body
        };
        if (payload.htmlBody) {
          mailOpts.htmlBody = payload.htmlBody;
        }
        MailApp.sendEmail(mailOpts);
        responseData = { sent: true, to: payload.to };
        break;
      case 'enqueueNotification':
        responseData = enqueueNotification(
          payload.recipientEmail,
          payload.recipientName,
          payload.notificationType,
          payload.subject,
          payload.templateData,
          payload.idempotencyKey
        );
        break;
      case 'getAdminUsers':
      case 'getUsers':
        responseData = getAdminUsers(payload.requesterId || payload.userId, payload.accessToken, payload.authToken || payload.token);
        break;
      case 'getAdminPredictions':
      case 'getPredictions':
        responseData = getAdminPredictions(payload.roundId);
        break;
      case 'setBakuDeadlineMidnight':
        responseData = setBakuPredictionDeadlineMidnight();
        break;
      case 'adminUpdatePredictionRound':
        responseData = adminUpdatePredictionRound(payload);
        break;
      case 'normalizeAzerbaijanPredictions':
        responseData = normalizeAzerbaijanPredictionRoundIds();
        break;
      case 'startQuizAttempt':
        responseData = handleStartQuizAttempt(payload);
        break;
      case 'submitQuizAttempt':
        responseData = handleSubmitQuizAttempt(payload);
        break;
      case 'startStrategyAttempt':
        responseData = handleStartStrategyAttempt(payload);
        break;
      case 'submitStrategyDecision':
        responseData = handleSubmitStrategyDecision(payload);
        break;
      case 'completeStrategyAttempt':
        responseData = handleCompleteStrategyAttempt(payload);
        break;
      case 'commitPreRaceStrategy':
        responseData = handleCommitPreRaceStrategy(payload);
        break;
      case 'postPreRaceDiscussion':
        responseData = handlePostPreRaceDiscussion(payload);
        break;
      case 'postPreRaceVote':
        responseData = handlePostPreRaceVote(payload);
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
  // Authoritative prediction deadline rules:
  // Sprint & Grand Prix predictions close exactly 1 hour (60 min) before session start
  var bufferMs = 60 * 60 * 1000; // 60 min close buffer
  var nowMs = new Date().getTime();

  sessions.forEach(function(sess) {
    if (sess.type === 'RACE' || sess.type === 'SPRINT') {
      var roundId = weekendId + '_' + sess.type + '_PREDICTION';
      var sessStartMs = new Date(sess.startTime).getTime();
      var closesAt = new Date(sessStartMs - bufferMs).toISOString();
      var opensAt = new Date(sessStartMs - 7 * 24 * 3600 * 1000).toISOString();
      var opensAtMs = new Date(opensAt).getTime();

      var title = (sess.type === 'RACE' ? 'Grand Prix' : sess.name) + ' Prediction';
      var status = 'OPEN';
      if (nowMs < opensAtMs) {
        status = 'UPCOMING';
      } else if (nowMs > (sessStartMs - bufferMs)) {
        status = 'LOCKED';
      }

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
  const cache = CacheService.getScriptCache();
  const cacheKey = 'sess_sched_' + (weekendId || 'all');
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

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
  if (sessions.length > 0) {
    try { cache.put(cacheKey, JSON.stringify(sessions), 300); } catch (err) {}
  }
  return sessions;
}

function getPredictionRounds(weekendId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'pred_rounds_' + (weekendId || 'all');
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  const rows = sheet.getDataRange().getValues();
  const rounds = [];
  const now = new Date().getTime();

  for (let i = 1; i < rows.length; i++) {
    if (!weekendId || rows[i][1] === weekendId) {
      const roundType = String(rows[i][3] || '').toUpperCase();
      const roundId = String(rows[i][0] || '').toUpperCase();
      const title = String(rows[i][4] || '').toUpperCase();
      if (roundType === 'QUALIFYING' || roundType === 'SPRINT_QUALIFYING' || roundId.indexOf('QUALIFYING') !== -1 || title.indexOf('QUALIFYING') !== -1) {
        continue;
      }

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
  if (rounds.length > 0) {
    try { cache.put(cacheKey, JSON.stringify(rounds), 120); } catch (err) {}
  } else if (weekendId) {
    try {
      const sess = getSessionSchedule(weekendId);
      if (sess && sess.length > 0) {
        let raceName = 'Grand Prix';
        const rwSheet = ss.getSheetByName(SHEET_NAMES.RACE_WEEKENDS);
        if (rwSheet) {
          const rwRows = rwSheet.getDataRange().getValues();
          for (let j = 1; j < rwRows.length; j++) {
            if (rwRows[j][0] === weekendId) {
              raceName = rwRows[j][3];
              break;
            }
          }
        }
        generatePredictionRoundsForWeekend(sheet, weekendId, raceName, 'NORMAL', sess, new Date().toISOString());
        cache.remove(cacheKey);
        return getPredictionRounds(weekendId);
      }
    } catch (err) {}
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

function getDrivers(season) {
  return [
    { id: 'norris', code: 'NOR', firstName: 'Lando', lastName: 'Norris', number: 4, team: 'McLaren', teamColor: '#ff8000', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'piastri', code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', number: 81, team: 'McLaren', teamColor: '#ff8000', country: 'Australia', countryFlag: '🇦🇺' },
    { id: 'verstappen', code: 'VER', firstName: 'Max', lastName: 'Verstappen', number: 1, team: 'Red Bull Racing', teamColor: '#1e41ff', country: 'Netherlands', countryFlag: '🇳🇱' },
    { id: 'lawson', code: 'LAW', firstName: 'Liam', lastName: 'Lawson', number: 30, team: 'Red Bull Racing', teamColor: '#1e41ff', country: 'New Zealand', countryFlag: '🇳🇿' },
    { id: 'hamilton', code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', number: 44, team: 'Ferrari', teamColor: '#e10600', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'leclerc', code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', number: 16, team: 'Ferrari', teamColor: '#e10600', country: 'Monaco', countryFlag: '🇲🇨' },
    { id: 'russell', code: 'RUS', firstName: 'George', lastName: 'Russell', number: 63, team: 'Mercedes-AMG', teamColor: '#00d2be', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'antonelli', code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', number: 12, team: 'Mercedes-AMG', teamColor: '#00d2be', country: 'Italy', countryFlag: '🇮🇹' },
    { id: 'alonso', code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', number: 14, team: 'Aston Martin', teamColor: '#00665e', country: 'Spain', countryFlag: '🇪🇸' },
    { id: 'stroll', code: 'STR', firstName: 'Lance', lastName: 'Stroll', number: 18, team: 'Aston Martin', teamColor: '#00665e', country: 'Canada', countryFlag: '🇨🇦' },
    { id: 'sainz', code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', number: 55, team: 'Williams', teamColor: '#005aff', country: 'Spain', countryFlag: '🇪🇸' },
    { id: 'albon', code: 'ALB', firstName: 'Alexander', lastName: 'Albon', number: 23, team: 'Williams', teamColor: '#005aff', country: 'Thailand', countryFlag: '🇹🇭' },
    { id: 'gasly', code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', number: 10, team: 'Alpine', teamColor: '#0093cc', country: 'France', countryFlag: '🇫🇷' },
    { id: 'doohan', code: 'DOO', firstName: 'Jack', lastName: 'Doohan', number: 7, team: 'Alpine', teamColor: '#0093cc', country: 'Australia', countryFlag: '🇦🇺' },
    { id: 'tsunoda', code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', number: 22, team: 'Racing Bulls', teamColor: '#6692ff', country: 'Japan', countryFlag: '🇯🇵' },
    { id: 'hadjar', code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', number: 6, team: 'Racing Bulls', teamColor: '#6692ff', country: 'France', countryFlag: '🇫🇷' },
    { id: 'hulkenberg', code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', number: 27, team: 'Sauber / Audi', teamColor: '#52e252', country: 'Germany', countryFlag: '🇩🇪' },
    { id: 'bortoleto', code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', number: 5, team: 'Sauber / Audi', teamColor: '#52e252', country: 'Brazil', countryFlag: '🇧🇷' },
    { id: 'ocon', code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', number: 31, team: 'Haas', teamColor: '#b6babd', country: 'France', countryFlag: '🇫🇷' },
    { id: 'bearman', code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', number: 87, team: 'Haas', teamColor: '#b6babd', country: 'United Kingdom', countryFlag: '🇬🇧' },
    { id: 'perez', code: 'PER', firstName: 'Sergio', lastName: 'Pérez', number: 11, team: 'Cadillac', teamColor: '#c5a059', country: 'Mexico', countryFlag: '🇲🇽' },
    { id: 'bottas', code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', number: 77, team: 'Cadillac', teamColor: '#c5a059', country: 'Finland', countryFlag: '🇫🇮' }
  ];
}

function getConstructors() {
  return [
    { id: 'mclaren', name: 'McLaren', color: '#ff8000', country: 'United Kingdom', flag: '🇬🇧', powerUnit: 'Mercedes' },
    { id: 'ferrari', name: 'Ferrari', color: '#e10600', country: 'Italy', flag: '🇮🇹', powerUnit: 'Ferrari' },
    { id: 'red_bull', name: 'Red Bull Racing', color: '#1e41ff', country: 'Austria', flag: '🇦🇹', powerUnit: 'Red Bull Ford' },
    { id: 'mercedes', name: 'Mercedes-AMG', color: '#00d2be', country: 'Germany', flag: '🇩🇪', powerUnit: 'Mercedes' },
    { id: 'aston_martin', name: 'Aston Martin', color: '#00665e', country: 'United Kingdom', flag: '🇬🇧', powerUnit: 'Honda' },
    { id: 'williams', name: 'Williams', color: '#005aff', country: 'United Kingdom', flag: '🇬🇧', powerUnit: 'Mercedes' },
    { id: 'racing_bulls', name: 'Racing Bulls', color: '#6692ff', country: 'Italy', flag: '🇮🇹', powerUnit: 'Red Bull Ford' },
    { id: 'alpine', name: 'Alpine', color: '#0093cc', country: 'France', flag: '🇫🇷', powerUnit: 'Renault' },
    { id: 'sauber_audi', name: 'Sauber / Audi', color: '#52e252', country: 'Switzerland', flag: '🇨🇭', powerUnit: 'Audi' },
    { id: 'haas', name: 'Haas', color: '#b6babd', country: 'United States', flag: '🇺🇸', powerUnit: 'Ferrari' },
    { id: 'cadillac', name: 'Cadillac', color: '#c5a059', country: 'United States', flag: '🇺🇸', powerUnit: 'Ferrari' }
  ];
}

function getEligibleDrivers(raceWeekendId, season) {
  return getDrivers(season);
}

function getRaceWeekends(season) {
  const targetSeason = season ? Number(season) : 2026;
  const cache = CacheService.getScriptCache();
  const cacheKey = 'race_weekends_' + targetSeason;
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.RACE_WEEKENDS);
  const rows = sheet.getDataRange().getValues();
  const weekends = [];
  const now = new Date().getTime();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rowSeason = Number(r[1]);
    if (targetSeason && rowSeason !== targetSeason) {
      continue;
    }

    const startMs = new Date(r[8]).getTime();
    const endMs = new Date(r[9]).getTime();
    let dynamicStatus = r[10];

    // Compute dynamic status relative to server time:
    // A race weekend remains ACTIVE during its schedule and 6h post-race buffer.
    // Scheduled race start time passing NEVER prematurely marks it COMPLETED.
    const postRaceBufferMs = 6 * 3600 * 1000;
    if (dynamicStatus === 'COMPLETED' || now > endMs + postRaceBufferMs) {
      dynamicStatus = 'COMPLETED';
    } else if (now >= startMs - 24 * 3600 * 1000) {
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
  if (weekends.length > 0) {
    try { cache.put(cacheKey, JSON.stringify(weekends), 300); } catch (err) {}
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
 * Authoritative 2026 Race-Eligible Driver Grid (11 Teams, 22 Drivers)
 */
function getAllDrivers(season) {
  return [
    { id: 'verstappen', number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', team: 'Red Bull Racing', teamColor: '#3671C6', countryFlag: '🇳🇱' },
    { id: 'hadjar', number: 6, code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', team: 'Red Bull Racing', teamColor: '#3671C6', countryFlag: '🇫🇷' },
    { id: 'norris', number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', team: 'McLaren', teamColor: '#FF8000', countryFlag: '🇬🇧' },
    { id: 'piastri', number: 81, code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', team: 'McLaren', teamColor: '#FF8000', countryFlag: '🇦🇺' },
    { id: 'leclerc', number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', team: 'Ferrari', teamColor: '#E80020', countryFlag: '🇲🇨' },
    { id: 'hamilton', number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', team: 'Ferrari', teamColor: '#E80020', countryFlag: '🇬🇧' },
    { id: 'russell', number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', team: 'Mercedes', teamColor: '#27F4D2', countryFlag: '🇬🇧' },
    { id: 'antonelli', number: 12, code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', team: 'Mercedes', teamColor: '#27F4D2', countryFlag: '🇮🇹' },
    { id: 'alonso', number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', team: 'Aston Martin', teamColor: '#229971', countryFlag: '🇪🇸' },
    { id: 'stroll', number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', team: 'Aston Martin', teamColor: '#229971', countryFlag: '🇨🇦' },
    { id: 'gasly', number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', team: 'Alpine', teamColor: '#0093CC', countryFlag: '🇫🇷' },
    { id: 'doohan', number: 7, code: 'DOO', firstName: 'Jack', lastName: 'Doohan', team: 'Alpine', teamColor: '#0093CC', countryFlag: '🇦🇺' },
    { id: 'albon', number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', team: 'Williams', teamColor: '#64C4FF', countryFlag: '🇹🇭' },
    { id: 'sainz', number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', team: 'Williams', teamColor: '#64C4FF', countryFlag: '🇪🇸' },
    { id: 'tsunoda', number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', team: 'Racing Bulls', teamColor: '#6692FF', countryFlag: '🇯🇵' },
    { id: 'lawson', number: 30, code: 'LAW', firstName: 'Liam', lastName: 'Lawson', team: 'Racing Bulls', teamColor: '#6692FF', countryFlag: '🇳🇿' },
    { id: 'hulkenberg', number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', team: 'Sauber / Audi', teamColor: '#52E252', countryFlag: '🇩🇪' },
    { id: 'bortoleto', number: 5, code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', team: 'Sauber / Audi', teamColor: '#52E252', countryFlag: '🇧🇷' },
    { id: 'ocon', number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', team: 'Haas', teamColor: '#B6BABD', countryFlag: '🇫🇷' },
    { id: 'bearman', number: 87, code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', team: 'Haas', teamColor: '#B6BABD', countryFlag: '🇬🇧' },
    { id: 'maloney', number: 77, code: 'MAL', firstName: 'Zane', lastName: 'Maloney', team: 'Cadillac F1 Team', teamColor: '#C0C0C0', countryFlag: '🇧🇧' },
    { id: 'pourchaire', number: 99, code: 'POU', firstName: 'Théo', lastName: 'Pourchaire', team: 'Cadillac F1 Team', teamColor: '#C0C0C0', countryFlag: '🇫🇷' }
  ];
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
  const openTime = new Date(round.opensAt);
  const closeTime = new Date(round.closesAt);

  // Validate predictions are actually open
  if (round.status === 'UPCOMING' || (round.opensAt && serverTime.getTime() < openTime.getTime())) {
    throw new Error('Predictions are not open yet for ' + (round.title || 'this round') + '. Entry opens on ' + round.opensAt + '.');
  }

  // Validate deadline has not passed
  if (serverTime.getTime() > closeTime.getTime() || round.status === 'LOCKED' || round.status === 'SCORED' || round.status === 'COMPLETED') {
    throw new Error('Predictions are LOCKED. Deadline has passed.');
  }

  // Authoritative 2026 driver validation: reject invalid or outdated drivers
  const validDrivers = getAllDrivers();
  const validDriverIds = validDrivers.map(function(d) { return d.id; });
  const driverFields = ['p1', 'p2', 'p3', 'fastestLap', 'driverOfTheDay'];
  driverFields.forEach(function(fieldKey) {
    var val = predictionData[fieldKey];
    if (val && validDriverIds.indexOf(val) === -1) {
      throw new Error('Invalid driver selection for ' + fieldKey + ': ' + val + ' is not an eligible 2026 driver.');
    }
  });

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
      const gpName = formatGrandPrixName(round.title);
      enqueueNotification(
        recipientEmail,
        userProfile ? userProfile.displayName : userId,
        'PREDICTION_CONFIRMATION',
        'Prediction Locked In — ' + gpName,
        { roundId: roundId, roundTitle: gpName, predictionData: predictionData },
        'PRED_' + userId + '_' + roundId
      );
    }
  } catch (err) {
    Logger.log('Failed to enqueue prediction confirmation: ' + err.toString());
  }

  return savedPrediction;
}

function adminSubmitResult(payload) {
  const roundId = payload.roundId;
  const resultData = payload.resultData;
  if (!roundId || !resultData) throw new Error('roundId and resultData are required');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.RESULTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.RESULTS);
    sheet.getRange(1, 1, 1, 4).setValues([['resultId', 'roundId', 'resultDataJson', 'publishedAt']]);
    sheet.getRange(1, 1, 1, 4).setBackground('#e10600').setFontColor('#ffffff').setFontWeight('bold');
  }

  const rows = sheet.getDataRange().getValues();
  const nowIso = new Date().toISOString();
  const dataJson = typeof resultData === 'string' ? resultData : JSON.stringify(resultData);

  let existingRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(roundId)) {
      existingRow = i + 1;
      break;
    }
  }
  if (existingRow > 0) {
    sheet.getRange(existingRow, 3).setValue(dataJson);
    sheet.getRange(existingRow, 4).setValue(nowIso);
  } else {
    sheet.appendRow(['res_' + Utilities.getUuid(), roundId, dataJson, nowIso]);
  }

  return {
    roundId: roundId,
    resultData: typeof resultData === 'string' ? JSON.parse(resultData) : resultData,
    publishedAt: nowIso
  };
}

function adminCalculateScores(roundId) {
  const startTime = Date.now();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const round = getPredictionRound(roundId);
  if (!round) throw new Error('Round not found: ' + roundId);

  const resSheet = ss.getSheetByName(SHEET_NAMES.RESULTS);
  const resRows = resSheet ? resSheet.getDataRange().getValues() : [];
  let official = null;
  for (let i = 1; i < resRows.length; i++) {
    const rowResRound = String(resRows[i][1] || '').trim();
    if (rowResRound === String(roundId).trim()) {
      official = typeof resRows[i][2] === 'string' ? JSON.parse(resRows[i][2] || '{}') : resRows[i][2];
      break;
    }
  }
  if (!official) throw new Error('Cannot calculate scores: Official session result has not been submitted or published yet for ' + roundId);

  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  const predRows = predSheet ? predSheet.getDataRange().getValues() : [];

  // Group predictions strictly for this roundId, deduplicating by userId (latest submittedAt/updatedAt wins)
  const userPredMap = {};
  for (let i = 1; i < predRows.length; i++) {
    const rowRound = String(predRows[i][2] || '').trim();
    if (rowRound === String(roundId).trim()) {
      const pUserId = String(predRows[i][1] || '').trim();
      if (!pUserId) continue;

      const pId = String(predRows[i][0] || '');
      let rawData = predRows[i][3];
      let pData = null;
      try {
        pData = typeof rawData === 'string' ? JSON.parse(rawData || '{}') : (rawData || {});
      } catch (e) {
        pData = null;
      }
      const submittedAt = String(predRows[i][4] || '');
      const updatedAt = String(predRows[i][5] || submittedAt || '');

      const record = {
        rowIndex: i + 1,
        predictionId: pId,
        userId: pUserId,
        roundId: rowRound,
        predictionData: pData,
        submittedAt: submittedAt,
        updatedAt: updatedAt,
      };

      if (!userPredMap[pUserId]) {
        userPredMap[pUserId] = record;
      } else {
        const existingTime = new Date(userPredMap[pUserId].updatedAt || 0).getTime();
        const currTime = new Date(updatedAt || 0).getTime();
        if (currTime >= existingTime) {
          userPredMap[pUserId] = record;
        }
      }
    }
  }

  const eligiblePreds = Object.values(userPredMap);

  // Read existing scores into in-memory lookup
  const scoresSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  if (!scoresSheet) throw new Error('Scores sheet not found');
  const scoreRows = scoresSheet.getDataRange().getValues();
  const existingScoreMap = {}; // key: userId + '__' + roundId -> { rowIndex, scoreId }
  for (let j = 1; j < scoreRows.length; j++) {
    const sUserId = String(scoreRows[j][1] || '').trim();
    const sRoundId = String(scoreRows[j][2] || '').trim();
    if (sUserId && sRoundId) {
      existingScoreMap[sUserId + '__' + sRoundId] = {
        rowIndex: j + 1,
        scoreId: scoreRows[j][0],
        totalScore: scoreRows[j][4]
      };
    }
  }

  // Preload users for notification names & emails
  const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const userRows = userSheet ? userSheet.getDataRange().getValues() : [];
  const userProfileMap = {};
  if (userRows.length > 1) {
    const uHeaders = userRows[0];
    const uUidCol = uHeaders.indexOf('userId') !== -1 ? uHeaders.indexOf('userId') : 0;
    const uEmailCol = uHeaders.indexOf('email') !== -1 ? uHeaders.indexOf('email') : 1;
    const uNameCol = uHeaders.indexOf('displayName') !== -1 ? uHeaders.indexOf('displayName') : 2;
    const uUsernameCol = uHeaders.indexOf('username') !== -1 ? uHeaders.indexOf('username') : 3;

    for (let u = 1; u < userRows.length; u++) {
      const uid = String(userRows[u][uUidCol] || '').trim();
      if (uid) {
        userProfileMap[uid] = {
          email: String(userRows[u][uEmailCol] || '').trim(),
          displayName: String(userRows[u][uNameCol] || userRows[u][uUsernameCol] || uid).trim()
        };
      }
    }
  }

  const nowIso = new Date().toISOString();
  const gpName = formatGrandPrixName(round.title || 'Grand Prix');
  const insertScoreRows = [];
  const updateScoreRows = [];
  const notificationsToQueue = [];
  const failedRecords = [];
  let scoredCount = 0;
  let newlyScoredCount = 0;
  let updatedScoredCount = 0;

  for (let k = 0; k < eligiblePreds.length; k++) {
    const pred = eligiblePreds[k];
    if (!pred.predictionData) {
      failedRecords.push({ userId: pred.userId, reason: 'Malformed JSON prediction data' });
      continue;
    }

    try {
      const calc = computeScore(pred.predictionData, official);
      const scoreKey = pred.userId + '__' + roundId;
      const existingScore = existingScoreMap[scoreKey];

      if (existingScore) {
        updateScoreRows.push({
          rowIndex: existingScore.rowIndex,
          breakdown: JSON.stringify(calc.breakdown),
          totalScore: calc.totalScore,
          calculatedAt: nowIso
        });
        updatedScoredCount++;
      } else {
        insertScoreRows.push([
          'score_' + Utilities.getUuid(),
          pred.userId,
          roundId,
          JSON.stringify(calc.breakdown),
          calc.totalScore,
          nowIso
        ]);
        newlyScoredCount++;
      }
      scoredCount++;

      // Prepare notification for batch queuing
      const uProfile = userProfileMap[pred.userId];
      if (uProfile && uProfile.email) {
        notificationsToQueue.push({
          recipientEmail: uProfile.email,
          recipientName: uProfile.displayName || pred.userId,
          notificationType: 'PREDICTION_RESULT',
          subject: 'Official Race Results: ' + calc.totalScore + ' PTS Scored — ' + gpName + ' 🏆',
          templateData: {
            roundId: roundId,
            roundTitle: round.title,
            raceName: gpName,
            score: calc.totalScore,
            breakdown: calc.breakdown
          },
          idempotencyKey: 'RESULT_' + roundId + '_' + pred.userId
        });
      }
    } catch (calcErr) {
      failedRecords.push({ userId: pred.userId, reason: calcErr.toString() });
    }
  }

  // Batch persist updates to Scores sheet
  if (updateScoreRows.length > 0) {
    for (let u = 0; u < updateScoreRows.length; u++) {
      const item = updateScoreRows[u];
      const rIdx = item.rowIndex - 1;
      scoreRows[rIdx][3] = item.breakdown;
      scoreRows[rIdx][4] = item.totalScore;
      scoreRows[rIdx][5] = item.calculatedAt;
    }
    scoresSheet.getRange(1, 1, scoreRows.length, scoreRows[0].length).setValues(scoreRows);
  }

  // Batch persist inserts to Scores sheet
  if (insertScoreRows.length > 0) {
    const startRow = scoresSheet.getLastRow() + 1;
    scoresSheet.getRange(startRow, 1, insertScoreRows.length, 6).setValues(insertScoreRows);
  }

  // Batch enqueue notification emails
  const batchNotifyRes = enqueueNotificationsBatch(notificationsToQueue);

  // Update PredictionRound status in PredictionRounds sheet to 'SCORED'
  const prSheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  if (prSheet) {
    const prRows = prSheet.getDataRange().getValues();
    for (let p = 1; p < prRows.length; p++) {
      if (String(prRows[p][0] || '').trim() === String(roundId).trim()) {
        prSheet.getRange(p + 1, 9).setValue('SCORED');
        break;
      }
    }
  }

  // Synchronize cumulative total points back to Users sheet
  try {
    const uSheet = ss.getSheetByName(SHEET_NAMES.USERS);
    if (uSheet && scoresSheet) {
      const freshScoreRows = scoresSheet.getDataRange().getValues();
      const userSumMap = {};
      for (let s = 1; s < freshScoreRows.length; s++) {
        const sUid = String(freshScoreRows[s][1] || '').trim();
        const sPts = Number(freshScoreRows[s][4]) || 0;
        if (sUid) userSumMap[sUid] = (userSumMap[sUid] || 0) + sPts;
      }
      const uRows = uSheet.getDataRange().getValues();
      const uHeaders = uRows[0];
      const ptsColIdx = uHeaders.indexOf('totalPoints') !== -1 ? uHeaders.indexOf('totalPoints') : 8;
      for (let u = 1; u < uRows.length; u++) {
        const uid = String(uRows[u][0] || '').trim();
        if (uid && userSumMap[uid] !== undefined) {
          const expectedPts = userSumMap[uid];
          const currPts = Number(uRows[u][ptsColIdx]) || 0;
          if (currPts !== expectedPts) {
            uSheet.getRange(u + 1, ptsColIdx + 1).setValue(expectedPts);
          }
        }
      }
    }
  } catch (uSyncErr) {
    Logger.log('[TOTAL_POINTS_SYNC_ERROR] ' + uSyncErr.toString());
  }

  // Invalidate leaderboard and prediction round cache
  try {
    const cache = CacheService.getScriptCache();
    cache.remove('leaderboard_season_global');
    cache.remove('leaderboard_round_' + roundId);
    cache.remove('pred_rounds_' + (round.raceWeekendId || 'all'));
    cache.remove('current_weekend');
  } catch (cErr) {}

  const durationMs = Date.now() - startTime;
  Logger.log('[SCORES_CALCULATED] round: ' + roundId + ', scored: ' + scoredCount + ' (new: ' + newlyScoredCount + ', updated: ' + updatedScoredCount + '), failed: ' + failedRecords.length + ', duration: ' + durationMs + 'ms');

  return {
    roundId: roundId,
    scoredCount: scoredCount,
    newlyScored: newlyScoredCount,
    updatedScored: updatedScoredCount,
    failedCount: failedRecords.length,
    failedRecords: failedRecords,
    emailsQueued: batchNotifyRes.queuedCount,
    emailsSkipped: batchNotifyRes.skippedCount,
    durationMs: durationMs
  };
}

function computeScore(pred, official) {
  var b = {};
  var total = 0;
  var dsqList = Array.isArray(official.disqualifiedDrivers) ? official.disqualifiedDrivers : [];
  var isDsq = function(driverId) { return dsqList.indexOf(driverId) !== -1; };

  var officialPodium = [official.p1, official.p2, official.p3]
    .filter(Boolean)
    .filter(function(d) { return !isDsq(d); });

  var p1Exact = pred.p1 && pred.p1 === official.p1 && !isDsq(pred.p1);
  var p2Exact = pred.p2 && pred.p2 === official.p2 && !isDsq(pred.p2);
  var p3Exact = pred.p3 && pred.p3 === official.p3 && !isDsq(pred.p3);

  // Simplified Active Prediction Point System (Max 55 PTS)
  // P1: 10 pts (podium wrong position: 3 pts)
  // P2: 7 pts (podium wrong position: 3 pts)
  // P3: 5 pts (podium wrong position: 3 pts)
  b.p1 = p1Exact ? 10 : (!isDsq(pred.p1) && officialPodium.indexOf(pred.p1) !== -1 ? 3 : 0);
  b.p2 = p2Exact ? 7 : (!isDsq(pred.p2) && officialPodium.indexOf(pred.p2) !== -1 ? 3 : 0);
  b.p3 = p3Exact ? 5 : (!isDsq(pred.p3) && officialPodium.indexOf(pred.p3) !== -1 ? 3 : 0);
  b.perfectPodiumBonus = 0;

  // Fastest Lap: 7 pts
  b.fastestLap = (pred.fastestLap && pred.fastestLap === official.fastestLap && !isDsq(pred.fastestLap)) ? 7 : 0;

  // Driver/Rider of the Day: 7 pts
  b.driverOfTheDay = (pred.driverOfTheDay && pred.driverOfTheDay === official.driverOfTheDay && !isDsq(pred.driverOfTheDay)) ? 7 : 0;

  // Safety Car: 5 pts
  if (pred.safetyCar !== undefined && official.safetyCar !== undefined) {
    b.safetyCar = (String(pred.safetyCar).trim().toUpperCase() === String(official.safetyCar).trim().toUpperCase()) ? 5 : 0;
  }

  // Virtual Safety Car (VSC): 5 pts
  if (pred.virtualSafetyCar !== undefined && official.virtualSafetyCar !== undefined) {
    b.virtualSafetyCar = (String(pred.virtualSafetyCar).trim().toUpperCase() === String(official.virtualSafetyCar).trim().toUpperCase()) ? 5 : 0;
  }

  // Red Flag: 5 pts
  if (pred.redFlag !== undefined && official.redFlag !== undefined) {
    b.redFlag = (String(pred.redFlag).trim().toUpperCase() === String(official.redFlag).trim().toUpperCase()) ? 5 : 0;
  }

  // Yellow Flag: 4 pts
  if (pred.yellowFlag !== undefined && official.yellowFlag !== undefined) {
    b.yellowFlag = (String(pred.yellowFlag).trim().toUpperCase() === String(official.yellowFlag).trim().toUpperCase()) ? 4 : 0;
  }

  // Handle any legacy wildcard fields for historical rounds if present in prediction and official result
  var activeFieldKeys = ['p1', 'p2', 'p3', 'perfectPodiumBonus', 'fastestLap', 'driverOfTheDay', 'safetyCar', 'virtualSafetyCar', 'redFlag', 'yellowFlag'];
  for (var key in pred) {
    if (activeFieldKeys.indexOf(key) !== -1) continue;
    if (pred[key] !== undefined && official[key] !== undefined) {
      var pts = (key === 'wildCard') ? 5 : 5;
      if (String(pred[key]).trim().toUpperCase() === String(official[key]).trim().toUpperCase()) {
        b[key] = pts;
      } else {
        b[key] = 0;
      }
    }
  }

  for (var k in b) {
    total += (b[k] || 0);
  }

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

function getRoundScore(roundId, userId) {
  if (!roundId || !userId) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  if (!sheet) return null;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(userId) && String(rows[i][2]) === String(roundId)) {
      return {
        scoreId: rows[i][0],
        userId: rows[i][1],
        roundId: rows[i][2],
        breakdown: JSON.parse(rows[i][3] || '{}'),
        totalScore: Number(rows[i][4] || 0),
        calculatedAt: rows[i][5]
      };
    }
  }
  return null;
}

function getLeaderboard(type, id) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'leaderboard_' + (type || 'season') + '_' + (id || 'global');
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const users = getAllUsers();
  
  // Deduplicate users by canonical identity (normalized username, or userId if no username)
  const canonicalUsersMap = {};
  const userIdToCanonicalKey = {};

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const uKey = (u.username && u.username.trim()) ? u.username.trim().toLowerCase() : u.userId;
    userIdToCanonicalKey[u.userId] = uKey;

    if (!canonicalUsersMap[uKey]) {
      canonicalUsersMap[uKey] = u;
    } else {
      // Pick best profile representation (avatar, points)
      const existing = canonicalUsersMap[uKey];
      const hasBetterAvatar = (!existing.avatarUrl || !existing.avatarUrl.startsWith('http')) && (u.avatarUrl && u.avatarUrl.startsWith('http'));
      const hasMorePoints = Number(u.totalPoints || 0) > Number(existing.totalPoints || 0);
      if (hasBetterAvatar || hasMorePoints) {
        canonicalUsersMap[uKey] = Object.assign({}, existing, u, {
          avatarUrl: u.avatarUrl || existing.avatarUrl,
          favouriteDriver: u.favouriteDriver || existing.favouriteDriver,
          favouriteConstructor: u.favouriteConstructor || existing.favouriteConstructor,
          bio: u.bio || existing.bio
        });
      }
    }
  }

  // Prediction rounds metadata for weekend isolation and Sprint vs Grand Prix classification
  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  const predRows = predSheet ? predSheet.getDataRange().getValues() : [];
  const roundMetaMap = {};
  for (let p = 1; p < predRows.length; p++) {
    const rId = String(predRows[p][0] || '');
    const rwId = String(predRows[p][1] || '');
    const rType = String(predRows[p][3] || '').toUpperCase();
    roundMetaMap[rId] = { raceWeekendId: rwId, roundType: rType };
  }

  const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  const scoreRows = scoreSheet ? scoreSheet.getDataRange().getValues() : [];

  // Aggregate based on type
  const userBreakdowns = {};
  const userSprintPoints = {};
  const userGpPoints = {};
  const userExactP1 = {};
  const userPerfectPodium = {};

  for (let i = 1; i < scoreRows.length; i++) {
    const rawUserId = scoreRows[i][1];
    const roundId = String(scoreRows[i][2] || '');
    const pts = Number(scoreRows[i][4] || 0);

    const rMeta = roundMetaMap[roundId] || {};
    const roundWeekendId = rMeta.raceWeekendId || '';
    const roundType = rMeta.roundType || '';

    let include = false;
    if (type === 'round' || type === 'session') {
      include = (roundId === String(id));
    } else if (type === 'weekend') {
      include = (roundWeekendId === String(id) || (roundId && roundId.indexOf(String(id)) !== -1));
    } else {
      include = true; // season
    }

    if (include) {
      const canonicalKey = userIdToCanonicalKey[rawUserId] || rawUserId;
      if (!userBreakdowns[canonicalKey]) {
        userBreakdowns[canonicalKey] = {};
        userSprintPoints[canonicalKey] = 0;
        userGpPoints[canonicalKey] = 0;
        userExactP1[canonicalKey] = 0;
        userPerfectPodium[canonicalKey] = 0;
      }

      const prevPts = Number(userBreakdowns[canonicalKey][roundId] || 0);
      if (pts > prevPts) {
        userBreakdowns[canonicalKey][roundId] = pts;
        const delta = pts - prevPts;
        if (roundType === 'SPRINT' || roundId.indexOf('SPRINT') !== -1) {
          userSprintPoints[canonicalKey] += delta;
        } else {
          userGpPoints[canonicalKey] += delta;
        }
      }
    }
  }

  // Build entry list from canonical users
  const entries = [];
  const canonicalKeys = Object.keys(canonicalUsersMap);
  for (let i = 0; i < canonicalKeys.length; i++) {
    const key = canonicalKeys[i];
    const u = canonicalUsersMap[key];
    const breakdown = userBreakdowns[key] || {};
    let pts = 0;
    const roundsScored = Object.keys(breakdown);
    for (let r = 0; r < roundsScored.length; r++) {
      pts += Number(breakdown[roundsScored[r]] || 0);
    }

    // In weekend view: users who didn't score must not receive season totals
    if (type === 'weekend' && roundsScored.length === 0) {
      continue;
    }

    if (roundsScored.length === 0 && type === 'season') {
      pts = Number(u.totalPoints || 0);
    }

    entries.push({
      userId: u.userId,
      username: u.username || 'Grid User',
      displayName: u.username || 'Grid User', // PRIVACY: Never expose real name or Google displayName in public leaderboard data
      avatarUrl: u.avatarUrl,
      favouriteDriver: u.favouriteDriver,
      totalPoints: pts,
      sprintPoints: userSprintPoints[key] || 0,
      grandPrixPoints: userGpPoints[key] || 0,
      roundScores: breakdown,
      racesParticipated: roundsScored.length,
      avgPointsPerRace: roundsScored.length > 0
        ? Math.round((pts / roundsScored.length) * 10) / 10
        : 0,
      exactP1Count: userExactP1[key] || 0,
      perfectPodiumCount: userPerfectPodium[key] || 0
    });
  }

  // Deterministic tie-breaking sort
  entries.sort(function(a, b) {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactP1Count !== a.exactP1Count) return b.exactP1Count - a.exactP1Count;
    if (b.perfectPodiumCount !== a.perfectPodiumCount) return b.perfectPodiumCount - a.perfectPodiumCount;
    return String(a.username || '').localeCompare(String(b.username || ''));
  });

  const result = entries.map(function(e, idx) {
    return Object.assign({}, e, {
      rank: idx + 1,
      previousRank: idx + 1,
      rankChange: 0
    });
  });

  if (result.length > 0) {
    try { cache.put(cacheKey, JSON.stringify(result), 120); } catch (err) {}
  }
  return result;
}

function getUserWeekendPredictions(userId, raceWeekendId) {
  if (!userId) return {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  if (!predSheet) return {};
  const predRows = predSheet.getDataRange().getValues();

  let targetRoundIds = null;
  if (raceWeekendId) {
    const rounds = getPredictionRounds(raceWeekendId);
    targetRoundIds = {};
    rounds.forEach(function(r) { targetRoundIds[r.roundId] = true; });
  }

  const map = {};
  for (let i = 1; i < predRows.length; i++) {
    if (String(predRows[i][1]) === String(userId)) {
      const roundId = String(predRows[i][2]);
      if (!targetRoundIds || targetRoundIds[roundId]) {
        map[roundId] = {
          predictionId: predRows[i][0],
          userId: predRows[i][1],
          roundId: roundId,
          predictionData: JSON.parse(predRows[i][3] || '{}'),
          submittedAt: predRows[i][4],
          updatedAt: predRows[i][5],
          lockedAt: predRows[i][6]
        };
      }
    }
  }
  return map;
}

function getAdminPredictions(roundId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  if (!predSheet) return [];
  const rows = predSheet.getDataRange().getValues();
  const list = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    const rowRound = String(r[2] || '');
    if (roundId && rowRound !== String(roundId)) {
      continue;
    }
    list.push({
      predictionId: r[0],
      userId: r[1],
      roundId: r[2],
      predictionData: JSON.parse(r[3] || '{}'),
      submittedAt: r[4],
      updatedAt: r[5],
      lockedAt: r[6] || r[5]
    });
  }
  return list;
}

const USER_HEADERS = [
  'userId', 'email', 'displayName', 'username', 'avatarUrl',
  'favouriteDriver', 'favouriteConstructor', 'bio', 'passwordHash',
  'authProvider', 'lastLoginAt', 'role', 'createdAt', 'totalPoints', 'seasonRank',
  'googleSubjectId'
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
      googleSubjectId: String((colMap['googleSubjectId'] !== undefined ? row[colMap['googleSubjectId']] : '') || ''),
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
      seasonRank: Number((colMap['seasonRank'] !== undefined ? row[colMap['seasonRank']] : i) || i),
      hasPassword: Boolean(colMap['passwordHash'] !== undefined && row[colMap['passwordHash']] && String(row[colMap['passwordHash']]).trim() !== ''),
      hasPasswordConfigured: Boolean(colMap['passwordHash'] !== undefined && row[colMap['passwordHash']] && String(row[colMap['passwordHash']]).trim() !== '')
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
function getAdminUsers(requesterId, accessToken, authToken) {
  if (!requesterId && !accessToken && !authToken) {
    throw new Error('Unauthorized: Authentication identity required.');
  }

  // Cryptographically verified backend admin session token
  if (authToken) {
    const verifiedAdmin = verifyAdminCaller({ authToken: authToken });
    if (verifiedAdmin && verifiedAdmin.role === 'admin') {
      return getAllUsersInternal();
    }
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

  let cleanReq = String(requesterId || '').trim().toLowerCase();
  if (accessToken) {
    const verified = verifyGoogleAccessToken(accessToken);
    if (!verified) {
      throw new Error('Forbidden: Invalid or expired Google OAuth credential.');
    }
    cleanReq = verified.email;
  }
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
  let matched = null;
  for (let i = 0; i < users.length; i++) {
    if (
      String(users[i].userId).toLowerCase() === target ||
      String(users[i].username).toLowerCase() === target ||
      String(users[i].email).toLowerCase() === target
    ) {
      matched = users[i];
      break;
    }
  }
  if (!matched) return null;

  // Sync with dynamic season leaderboard
  try {
    const leaderboard = getLeaderboard('season');
    if (Array.isArray(leaderboard)) {
      const entry = leaderboard.find(function(e) {
        return e.userId === matched.userId || (e.username && String(e.username).toLowerCase() === target);
      });
      if (entry) {
        matched.totalPoints = entry.totalPoints !== undefined ? entry.totalPoints : (matched.totalPoints || 0);
        matched.seasonRank = entry.rank || matched.seasonRank;
        matched.previousRank = entry.previousRank || matched.seasonRank;
        matched.racesParticipated = entry.racesParticipated !== undefined ? entry.racesParticipated : (matched.racesParticipated || 0);
      }
    }
  } catch (err) {
    Logger.log('Error syncing profile with leaderboard: ' + err);
  }

  return matched;
}

/**
 * Independently validates a Google OAuth 2.0 access token or OpenID ID token directly with Google.
 * Never trusts frontend-supplied identity claims.
 * Extracts immutable Google `sub` identifier as stable identity.
 */
function verifyGoogleAccessToken(credentialOrToken) {
  if (!credentialOrToken || typeof credentialOrToken !== 'string' || !credentialOrToken.trim()) {
    return null;
  }
  const token = credentialOrToken.trim();

  // 1. Try Google UserInfo endpoint (OAuth 2.0 access token)
  try {
    const res = UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: 'Bearer ' + token
      },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() === 200) {
      const data = JSON.parse(res.getContentText());
      if (data && data.email && (data.email_verified === true || data.email_verified === 'true')) {
        return {
          sub: String(data.sub || ''),
          email: String(data.email).toLowerCase().trim(),
          displayName: data.name || data.given_name || String(data.email).split('@')[0],
          photoUrl: data.picture || ''
        };
      }
    }
  } catch (err) {
    Logger.log('Google UserInfo verification error: ' + err);
  }

  // 2. Try Google TokenInfo endpoint (OpenID Connect ID Token)
  try {
    const resId = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), {
      muteHttpExceptions: true
    });
    if (resId.getResponseCode() === 200) {
      const data = JSON.parse(resId.getContentText());
      if (data && data.email && (data.email_verified === true || data.email_verified === 'true')) {
        return {
          sub: String(data.sub || ''),
          email: String(data.email).toLowerCase().trim(),
          displayName: data.name || data.given_name || String(data.email).split('@')[0],
          photoUrl: data.picture || ''
        };
      }
    }
  } catch (err2) {
    Logger.log('Google ID Token verification error: ' + err2);
  }

  return null;
}

function googleLogin(payload) {
  let email = '';
  let displayName = '';
  let photoUrl = '';
  let googleSubjectId = '';

  // 1. Independent backend credential validation with Google
  const token = payload.accessToken || payload.credential || payload.idToken;
  if (token) {
    const verified = verifyGoogleAccessToken(token);
    if (!verified) {
      throw new Error('Unauthorized: Google access token is invalid, expired, or failed verification with Google.');
    }
    // Trust ONLY Google's verified identity
    googleSubjectId = verified.sub || '';
    email = verified.email;
    displayName = verified.displayName || (payload.displayName || email.split('@')[0]);
    photoUrl = verified.photoUrl || (payload.photoUrl || '');
  } else {
    // Reject untrusted client identity without credential
    throw new Error('Unauthorized: Google OAuth access token is required. Client-supplied identity fields cannot be trusted.');
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
    const subCol = colMap['googleSubjectId'];

    const nowIso = new Date().toISOString();

    // CASE B — RETURNING USER LOOKUP:
    let existingRowIdx = -1;
    let existingRow = null;

    // First: Search by immutable googleSubjectId
    if (googleSubjectId && subCol !== undefined) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][subCol]).trim() === googleSubjectId) {
          existingRowIdx = i + 1;
          existingRow = rows[i];
          break;
        }
      }
    }

    // Fallback: Search by verified email (for users created before googleSubjectId column was populated)
    if (existingRowIdx === -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][emailCol]).toLowerCase() === email) {
          existingRowIdx = i + 1;
          existingRow = rows[i];
          // Backfill googleSubjectId on the existing user row
          if (googleSubjectId && subCol !== undefined) {
            sheet.getRange(existingRowIdx, subCol + 1).setValue(googleSubjectId);
          }
          break;
        }
      }
    }

    if (existingRowIdx > 0 && existingRow) {
      if (lastLoginCol !== undefined) {
        sheet.getRange(existingRowIdx, lastLoginCol + 1).setValue(nowIso);
      }
      if (photoUrl && avatarCol !== undefined && !existingRow[avatarCol]) {
        sheet.getRange(existingRowIdx, avatarCol + 1).setValue(photoUrl);
      }

      // Returning user retains their identity. Do NOT send welcome email!
      const returningUserObj = {
        userId: String(existingRow[userIdCol]),
        googleSubjectId: googleSubjectId || String(subCol !== undefined ? existingRow[subCol] || '' : ''),
        email: String(existingRow[emailCol]),
        displayName: String(existingRow[displayNameCol] || displayName || 'Racer'),
        username: String(existingRow[usernameCol] || ''),
        avatarUrl: String((avatarCol !== undefined ? existingRow[avatarCol] : '') || photoUrl || ''),
        favouriteDriver: String((favDriverCol !== undefined ? existingRow[favDriverCol] : '') || 'verstappen'),
        favouriteConstructor: String((favConstCol !== undefined ? existingRow[favConstCol] : '') || 'red_bull'),
        bio: String((bioCol !== undefined ? existingRow[bioCol] : '') || 'F1 Enthusiast & Strategy Predictor'),
        role: String(existingRow[roleCol] || 'user'),
        createdAt: String(existingRow[createdAtCol] || nowIso),
        totalPoints: Number((pointsCol !== undefined ? existingRow[pointsCol] : 0) || 0),
        seasonRank: Number((rankCol !== undefined ? existingRow[rankCol] : existingRowIdx - 1) || (existingRowIdx - 1)),
        isNewUser: false,
        hasPassword: Boolean(colMap['passwordHash'] !== undefined && existingRow && existingRow[colMap['passwordHash']] && String(existingRow[colMap['passwordHash']]).trim() !== ''),
        hasPasswordConfigured: Boolean(colMap['passwordHash'] !== undefined && existingRow && existingRow[colMap['passwordHash']] && String(existingRow[colMap['passwordHash']]).trim() !== '')
      };
      if (returningUserObj.role === 'admin') {
        returningUserObj.authToken = createAdminSessionToken(returningUserObj);
      }
      return returningUserObj;
    }

    // Reject unknown accounts attempting admin login without creating a ghost row
    if (payload.client === 'admin_app') {
      throw new Error('Access Denied: Account not found on The Grid. Authorized administrator account required.');
    }

    // CASE A — NEW USER: Create user record in USERS
    // Do NOT automatically generate a username from Google name or email.
    // Accept valid user-selected username if provided in payload; otherwise leave empty for onboarding.
    let cleanUsername = '';
    if (payload.username && typeof payload.username === 'string' && payload.username.trim()) {
      const avail = checkUsernameAvailability(payload.username);
      if (avail.available) {
        cleanUsername = avail.username;
      }
    }

    const userId = 'usr_' + Utilities.getUuid().replace(/-/g, '').substring(0, 12);
    const resolvedDisplayName = displayName || 'Racer';
    const avatarUrl = photoUrl || '';
    const favouriteDriver = payload.favouriteDriver || 'verstappen';
    const favouriteConstructor = payload.favouriteConstructor || 'red_bull';
    const bio = payload.bio || 'F1 Enthusiast & Strategy Predictor';
    const role = 'user';
    const totalPoints = 0;
    const seasonRank = rows.length;

    const newRow = new Array(headers.length).fill('');
    newRow[userIdCol] = userId;
    newRow[emailCol] = email;
    newRow[displayNameCol] = resolvedDisplayName;
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
    if (subCol !== undefined) newRow[subCol] = googleSubjectId;

    sheet.appendRow(newRow);

    // Queue exactly ONE welcome notification with deterministic idempotency key
    try {
      enqueueNotification(
        email,
        resolvedDisplayName,
        'WELCOME',
        'Welcome to The Grid 🏁',
        {
          userId: userId,
          displayName: resolvedDisplayName,
          username: cleanUsername
        },
        'WELCOME:' + userId
      );
    } catch (ntfErr) {
      Logger.log('[NOTIFICATION_FAILED] Welcome notification enqueue error: ' + ntfErr);
    }

    return {
      userId: userId,
      googleSubjectId: googleSubjectId,
      email: email,
      displayName: resolvedDisplayName,
      username: cleanUsername,
      avatarUrl: avatarUrl,
      favouriteDriver: favouriteDriver,
      favouriteConstructor: favouriteConstructor,
      bio: bio,
      role: role,
      createdAt: nowIso,
      totalPoints: 0,
      seasonRank: seasonRank,
      isNewUser: true,
      hasPassword: false,
      hasPasswordConfigured: false
    };
  } finally {
    lock.releaseLock();
  }
}


/**
 * Computes salted SHA-256 hash using Google Apps Script Utilities.
 * Stored format: $s256$<salt>$<hexDigest>
 */
function hashPasswordSalted(passwordHashOrPlain, existingSalt) {
  if (!passwordHashOrPlain) return '';
  const salt = existingSalt || Utilities.getUuid().replace(/-/g, '').substring(0, 16);
  const rawDigest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ':' + passwordHashOrPlain,
    Utilities.Charset.UTF_8
  );
  let hex = '';
  for (let i = 0; i < rawDigest.length; i++) {
    let byteVal = rawDigest[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return '$s256$' + salt + '$' + hex;
}

/**
 * Verifies a client-provided password hash against the stored hash.
 * Supports both new salted hashes ($s256$<salt>$<digest>) and legacy 64-char hex hashes.
 */
function verifyPasswordCredential(storedHash, clientPasswordHash) {
  if (!storedHash || !clientPasswordHash) return false;
  const trimmedStored = String(storedHash).trim();
  const trimmedClient = String(clientPasswordHash).trim();

  if (trimmedStored.indexOf('$s256$') === 0) {
    const parts = trimmedStored.split('$');
    if (parts.length >= 4) {
      const salt = parts[2];
      const expected = hashPasswordSalted(trimmedClient, salt);
      return trimmedStored === expected;
    }
  }

  // Legacy unsalted SHA-256 direct comparison
  return trimmedStored.toLowerCase() === trimmedClient.toLowerCase();
}

/**
 * Internal HMAC secret resolver for cryptographically signing backend admin session tokens.
 */
function getSessionSigningSecret() {
  try {
    const props = PropertiesService.getScriptProperties();
    let secret = props.getProperty('ADMIN_SESSION_SECRET');
    if (!secret) {
      secret = Utilities.getUuid() + '-' + Utilities.getUuid();
      props.setProperty('ADMIN_SESSION_SECRET', secret);
    }
    return secret;
  } catch (_) {
    return 'the_grid_f1_admin_secure_session_key_2026';
  }
}

/**
 * Generates a verified cryptographic session token for authenticated administrators.
 * Format: base64Header.base64Payload.base64Signature (HMAC-SHA256 signed).
 */
function createAdminSessionToken(userObj) {
  if (!userObj || userObj.role !== 'admin') {
    throw new Error('Forbidden: Admin session tokens can only be issued to verified administrators.');
  }

  const secret = getSessionSigningSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(userObj.userId || ''),
    email: String(userObj.email || '').toLowerCase(),
    username: String(userObj.username || ''),
    role: 'admin',
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days expiration
  };

  const headerB64 = Utilities.base64EncodeWebSafe(JSON.stringify(header)).replace(/=+$/, '');
  const payloadB64 = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');
  const dataToSign = headerB64 + '.' + payloadB64;
  const signatureBytes = Utilities.computeHmacSha256Signature(dataToSign, secret);
  const signatureB64 = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, '');

  return dataToSign + '.' + signatureB64;
}

/**
 * Verifies that the caller's session token is authentic, unexpired, and belongs to an administrator.
 */
function verifyAdminCaller(payload) {
  if (!payload) return null;
  const token = payload.authToken || payload.token;
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const secret = getSessionSigningSecret();
    const dataToSign = parts[0] + '.' + parts[1];
    const signatureBytes = Utilities.computeHmacSha256Signature(dataToSign, secret);
    const expectedSig = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, '');

    if (parts[2] !== expectedSig) {
      return null;
    }

    const payloadJson = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString();
    const claims = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) {
      return null; // Expired token
    }

    if (claims.role !== 'admin') {
      return null;
    }

    return claims;
  } catch (err) {
    Logger.log('Token verification error: ' + err);
    return null;
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

    // Strict identity matching: NO keyword 'admin' bypass allowed
    if (uName === cleanId || uEmail === cleanId || uId === cleanId) {
      const storedHash = colMap['passwordHash'] !== undefined ? String(row[colMap['passwordHash']]).trim() : '';
      if (!storedHash) {
        throw new Error('This account was registered via Google Sign-In and does not have a password configured. Please sign in with Google or use Set Password.');
      }
      if (!passwordHash) {
        throw new Error('Password is required for this account.');
      }
      if (!verifyPasswordCredential(storedHash, passwordHash)) {
        throw new Error('Invalid password for this account.');
      }
      // Progressive upgrade: migrate legacy unsalted hash to salted format
      if (storedHash.indexOf('$s256$') !== 0 && colMap['passwordHash'] !== undefined) {
        try {
          const upgraded = hashPasswordSalted(passwordHash);
          sheet.getRange(i + 1, colMap['passwordHash'] + 1).setValue(upgraded);
        } catch (upgradeErr) {
          Logger.log('Password hash upgrade notice: ' + upgradeErr);
        }
      }
      const userObj = {
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
        seasonRank: Number(colMap['seasonRank'] !== undefined ? row[colMap['seasonRank']] : i),
        hasPassword: true
      };
      if (userObj.role === 'admin') {
        userObj.authToken = createAdminSessionToken(userObj);
      }
      return userObj;
    }
  }
  throw new Error('No racer found with username or email: ' + identifier);
}


/**
 * Secure Password Setup for existing Google-only or authenticated accounts.
 * Associates a new salted password credential with the canonical account.
 */
function setupPassword(payload) {
  if (!payload) throw new Error('Invalid request payload.');
  const newPasswordHash = payload.newPasswordHash || payload.passwordHash;
  if (!newPasswordHash || typeof newPasswordHash !== 'string' || newPasswordHash.trim().length < 8) {
    throw new Error('A valid password credential is required.');
  }

  const cleanNewHash = newPasswordHash.trim();
  const userId = (payload.userId || '').trim();
  const email = (payload.email || '').toLowerCase().trim();
  const googleToken = payload.accessToken || payload.credential || payload.idToken;
  const currentPasswordHash = payload.currentPasswordHash || '';
  const authToken = payload.authToken;

  // Identity verification
  let verifiedGoogleIdentity = null;
  if (googleToken) {
    verifiedGoogleIdentity = verifyGoogleAccessToken(googleToken);
    if (!verifiedGoogleIdentity) {
      throw new Error('Unauthorized: Google identity verification failed.');
    }
  }

  let verifiedSessionPayload = null;
  if (authToken) {
    try {
      const adminCheck = verifyAdminCaller(payload);
      if (adminCheck && adminCheck.sub) {
        verifiedSessionPayload = adminCheck;
      }
    } catch (_) {}
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Database is busy, please retry in a moment.');
  }

  try {
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

    const uIdCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
    const emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
    const subCol = colMap['googleSubjectId'];
    const passCol = colMap['passwordHash'];

    let targetRowIdx = -1;
    let targetRow = null;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const rUid = String(r[uIdCol] || '');
      const rEmail = String(r[emailCol] || '').toLowerCase();
      const rSub = subCol !== undefined ? String(r[subCol] || '') : '';

      if (verifiedGoogleIdentity) {
        if ((rSub && rSub === verifiedGoogleIdentity.sub) || (rEmail && rEmail === verifiedGoogleIdentity.email)) {
          targetRowIdx = i + 1;
          targetRow = r;
          break;
        }
      } else if (verifiedSessionPayload) {
        if (rUid === verifiedSessionPayload.sub || rEmail === verifiedSessionPayload.email) {
          targetRowIdx = i + 1;
          targetRow = r;
          break;
        }
      } else if ((userId && rUid === userId) || (email && rEmail === email)) {
        targetRowIdx = i + 1;
        targetRow = r;
        break;
      }
    }

    if (targetRowIdx === -1 || !targetRow) {
      throw new Error('Account not found on The Grid.');
    }

    const existingStoredHash = passCol !== undefined ? String(targetRow[passCol] || '').trim() : '';

    // If account already has a password and caller is NOT verified via Google or session, require current password
    if (existingStoredHash && !verifiedGoogleIdentity && !verifiedSessionPayload) {
      if (!currentPasswordHash) {
        throw new Error('Current password or Google identity verification is required to update an existing password.');
      }
      if (!verifyPasswordCredential(existingStoredHash, currentPasswordHash)) {
        throw new Error('Current password is incorrect.');
      }
    }

    const salted = hashPasswordSalted(cleanNewHash);
    if (passCol !== undefined) {
      sheet.getRange(targetRowIdx, passCol + 1).setValue(salted);
    }

    // Clear reset tokens
    if (colMap['passwordResetToken'] !== undefined) {
      sheet.getRange(targetRowIdx, colMap['passwordResetToken'] + 1).setValue('');
    }
    if (colMap['passwordResetExpiry'] !== undefined) {
      sheet.getRange(targetRowIdx, colMap['passwordResetExpiry'] + 1).setValue('');
    }

    return {
      success: true,
      message: 'Password credential configured successfully. You can now sign in using your username or email and password.',
      hasPassword: true
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/**
 * Initiates single-use expiring password reset flow.
 * Rate-limited and returns generic response to prevent user enumeration.
 */
function requestPasswordReset(payload) {
  if (!payload || !payload.identifier) {
    throw new Error('Username or email is required.');
  }

  const cleanId = String(payload.identifier).trim().toLowerCase();
  if (!cleanId) {
    throw new Error('Username or email is required.');
  }

  const genericResponse = {
    success: true,
    message: 'If an account exists with this email or username, password reset instructions have been sent.'
  };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return genericResponse;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
    if (!sheet) return genericResponse;
    ensureUserHeaders(sheet);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0] || [];
    const colMap = {};
    for (let c = 0; c < headers.length; c++) {
      colMap[String(headers[c]).trim()] = c;
    }

    const uNameCol = colMap['username'] !== undefined ? colMap['username'] : 3;
    const emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
    const uIdCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
    const displayNameCol = colMap['displayName'] !== undefined ? colMap['displayName'] : 2;
    const tokenCol = colMap['passwordResetToken'];
    const expiryCol = colMap['passwordResetExpiry'];

    if (tokenCol === undefined || expiryCol === undefined) {
      return genericResponse;
    }

    let targetRowIdx = -1;
    let targetRow = null;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const rName = String(r[uNameCol] || '').toLowerCase();
      const rEmail = String(r[emailCol] || '').toLowerCase();
      const rId = String(r[uIdCol] || '').toLowerCase();

      if (rName === cleanId || rEmail === cleanId || rId === cleanId) {
        targetRowIdx = i + 1;
        targetRow = r;
        break;
      }
    }

    if (targetRowIdx === -1 || !targetRow) {
      return genericResponse;
    }

    const recipientEmail = String(targetRow[emailCol] || '').trim();
    if (!recipientEmail || recipientEmail.indexOf('@') === -1) {
      return genericResponse;
    }

    // Rate limiting: 1 request per 2 minutes
    const existingExpiry = String(targetRow[expiryCol] || '');
    if (existingExpiry) {
      const expiryTime = new Date(existingExpiry).getTime();
      if (expiryTime - Date.now() > 13 * 60 * 1000) {
        Logger.log('Password reset requested too recently for: ' + recipientEmail);
        return genericResponse;
      }
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const resetCode = String(randomNum);
    const expiryIso = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    sheet.getRange(targetRowIdx, tokenCol + 1).setValue(resetCode);
    sheet.getRange(targetRowIdx, expiryCol + 1).setValue(expiryIso);

    const recipientName = String(targetRow[displayNameCol] || 'Racer');
    const emailSubject = 'The Grid — Password Reset Code: ' + resetCode;
    const emailContentHtml = 
      '<div style="background-color:#0B0D11;color:#F0F2F5;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;padding:32px;max-width:560px;margin:0 auto;border-radius:12px;border:1px solid #1E222D;">' +
        '<div style="text-align:center;margin-bottom:24px;">' +
          '<div style="display:inline-block;background-color:#E10600;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:2px;padding:4px 12px;border-radius:4px;margin-bottom:8px;">THE GRID</div>' +
          '<h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px 0;letter-spacing:0.5px;">Password Reset Code</h1>' +
          '<p style="color:#8E9BAE;font-size:13px;margin:0;">Hello ' + escapeHtml(recipientName) + ',</p>' +
        '</div>' +
        '<div style="background-color:#161920;border:1px solid #282E3E;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">' +
          '<p style="color:#C1C9D6;font-size:14px;margin:0 0 16px 0;">Use the following single-use verification code to set a new password on your Grid account:</p>' +
          '<div style="display:inline-block;background-color:#0B0D11;color:#E10600;font-size:32px;font-weight:900;letter-spacing:8px;padding:12px 28px;border-radius:8px;border:2px dashed #E10600;font-family:Courier,monospace;">' +
            resetCode +
          '</div>' +
          '<p style="color:#8E9BAE;font-size:12px;margin:16px 0 0 0;">⏱️ This code expires in <strong>15 minutes</strong>.</p>' +
        '</div>' +
        '<p style="color:#6A778B;font-size:12px;line-height:1.5;margin:0;">If you did not request a password reset, you can safely ignore this email.</p>' +
      '</div>';

    try {
      MailApp.sendEmail({
        to: recipientEmail,
        name: 'The Grid — Security',
        subject: emailSubject,
        htmlBody: emailContentHtml,
        body: 'Your password reset verification code for The Grid is: ' + resetCode + ' (Expires in 15 minutes).'
      });
    } catch (mailErr) {
      Logger.log('Error dispatching password reset email: ' + mailErr);
    }

    return genericResponse;
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/**
 * Resets user password using single-use verification code.
 */
function resetPassword(payload) {
  if (!payload) throw new Error('Invalid request payload.');
  const resetCode = String(payload.token || payload.resetCode || '').trim();
  const newPasswordHash = String(payload.newPasswordHash || payload.passwordHash || '').trim();
  const identifier = String(payload.identifier || '').trim().toLowerCase();

  if (!resetCode) {
    throw new Error('Password reset code is required.');
  }
  if (!newPasswordHash) {
    throw new Error('A new password is required.');
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Database is busy, please retry in a moment.');
  }

  try {
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

    const uNameCol = colMap['username'] !== undefined ? colMap['username'] : 3;
    const emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
    const uIdCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
    const passCol = colMap['passwordHash'];
    const tokenCol = colMap['passwordResetToken'];
    const expiryCol = colMap['passwordResetExpiry'];

    if (tokenCol === undefined || expiryCol === undefined || passCol === undefined) {
      throw new Error('Password recovery columns not found in database.');
    }

    let targetRowIdx = -1;
    let targetRow = null;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const rToken = String(r[tokenCol] || '').trim();
      const rName = String(r[uNameCol] || '').toLowerCase();
      const rEmail = String(r[emailCol] || '').toLowerCase();
      const rId = String(r[uIdCol] || '').toLowerCase();

      if (identifier) {
        if ((rName === identifier || rEmail === identifier || rId === identifier) && rToken === resetCode) {
          targetRowIdx = i + 1;
          targetRow = r;
          break;
        }
      } else {
        if (rToken && rToken === resetCode) {
          targetRowIdx = i + 1;
          targetRow = r;
          break;
        }
      }
    }

    if (targetRowIdx === -1 || !targetRow) {
      throw new Error('Invalid or expired password reset code. Please request a new code.');
    }

    const expiryStr = String(targetRow[expiryCol] || '');
    if (!expiryStr || Date.now() > new Date(expiryStr).getTime()) {
      sheet.getRange(targetRowIdx, tokenCol + 1).setValue('');
      sheet.getRange(targetRowIdx, expiryCol + 1).setValue('');
      throw new Error('Password reset code has expired. Please request a new code.');
    }

    const salted = hashPasswordSalted(newPasswordHash);
    sheet.getRange(targetRowIdx, passCol + 1).setValue(salted);

    // Single-use: Clear reset code and expiry immediately
    sheet.getRange(targetRowIdx, tokenCol + 1).setValue('');
    sheet.getRange(targetRowIdx, expiryCol + 1).setValue('');

    return {
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
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

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'system', 'f1', 'fia', 'root', 'official',
  'predictionbench', 'support', 'help', 'null', 'undefined', 'moderator',
  'staff', 'api', 'bot', 'security', 'guest'
];

function checkUsernameAvailability(rawUsername, excludeUserId) {
  if (!rawUsername || typeof rawUsername !== 'string' || !rawUsername.trim()) {
    return { available: false, reason: 'Username cannot be empty.' };
  }
  const cleanUsername = rawUsername.trim();
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return { available: false, reason: 'Username must be between 3 and 20 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
    return { available: false, reason: 'Username can only contain letters, numbers, underscores, and hyphens.' };
  }
  if (RESERVED_USERNAMES.indexOf(cleanUsername.toLowerCase()) !== -1) {
    return { available: false, reason: 'This username is reserved.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) {
    return { available: true, username: cleanUsername };
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { available: true, username: cleanUsername };
  }

  const headers = rows[0] || [];
  let uCol = 3;
  let uidCol = 0;
  for (let c = 0; c < headers.length; c++) {
    const h = String(headers[c]).trim();
    if (h === 'username') uCol = c;
    if (h === 'userId') uidCol = c;
  }

  const exclude = excludeUserId ? String(excludeUserId).trim().toLowerCase() : '';
  const searchLower = cleanUsername.toLowerCase();
  for (let i = 1; i < rows.length; i++) {
    const rowUid = String(rows[i][uidCol] || '').trim().toLowerCase();
    if (exclude && rowUid === exclude) {
      continue;
    }
    const rowUser = String(rows[i][uCol] || '').trim().toLowerCase();
    if (rowUser === searchLower) {
      return { available: false, reason: 'Username is already taken.' };
    }
  }

  return { available: true, username: cleanUsername };
}

function updateUser(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Database is busy, please retry in a moment.');
  }

  try {
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

    // If updating username, perform strict validation & uniqueness check
    let cleanUsername = null;
    if (updates.username !== undefined) {
      const availability = checkUsernameAvailability(updates.username, userId);
      if (!availability.available) {
        throw new Error(availability.reason || 'Invalid or unavailable username.');
      }
      cleanUsername = availability.username;
    }

    for (let i = 1; i < rows.length; i++) {
      const uid = colMap['userId'] !== undefined ? rows[i][colMap['userId']] : rows[i][0];
      if (uid === userId) {
        const rowIdx = i + 1;
        if (cleanUsername !== null && colMap['username'] !== undefined) {
          sheet.getRange(rowIdx, colMap['username'] + 1).setValue(cleanUsername);
        }
        if (updates.displayName !== undefined && colMap['displayName'] !== undefined) {
          sheet.getRange(rowIdx, colMap['displayName'] + 1).setValue(String(updates.displayName).trim());
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

        // Return authoritative fresh user profile
        const updatedProfile = getUserProfile(userId);
        return updatedProfile || { success: true, userId: userId };
      }
    }
    throw new Error('User not found in database');
  } finally {
    lock.releaseLock();
  }
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
 * THE GRID — RICH HTML EMAIL ENGINE & MOTORSPORT DESIGN SYSTEM
 * =========================================================================
 */

var THE_GRID_EMAIL_CONFIG = {
  APP_URL: 'https://hj1418.github.io/F1-Prediction-Wall/',
  PRIMARY_RED: '#e10600',
  BG_DARK: '#0a0d14',
  BG_CARD: '#121721',
  BG_ROW_EVEN: '#161e2b',
  BG_ROW_ODD: '#131a26',
  BORDER_COLOR: '#222d3d',
  TEXT_LIGHT: '#ffffff',
  TEXT_MUTED: '#94a3b8',
  ACCENT_GREEN: '#00e676',
  ACCENT_YELLOW: '#ffd600',
  ACCENT_BLUE: '#38bdf8'
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatGrandPrixName(title) {
  if (!title || typeof title !== 'string') return 'Grand Prix';
  var clean = title
    .replace(/\s+(Race\s+)?Prediction(\s+Round)?$/i, '')
    .replace(/\s+Race\s+Session$/i, '')
    .trim();
  return clean || 'Grand Prix';
}

function formatDriverDisplayName(driverId) {
  if (!driverId) return '—';
  var str = String(driverId).trim();
  str = str.replace(/[_-]+/g, ' ');
  return str.split(' ').map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function buildTheGridEmailShell(params) {
  var title = params.title || 'THE GRID';
  var subtitle = params.subtitle || '';
  var contentHtml = params.contentHtml || '';
  var primaryCta = params.primaryCta;
  var secondaryCta = params.secondaryCta;
  var secondaryNote = params.secondaryNote || '';

  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' + escapeHtml(title) + '</title>\n' +
    '</head>\n' +
    '<body style="margin: 0; padding: 0; background-color: ' + THE_GRID_EMAIL_CONFIG.BG_DARK + '; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #ffffff;">\n' +
    '  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ' + THE_GRID_EMAIL_CONFIG.BG_DARK + '; padding: 32px 12px 48px 12px; margin: 0;">\n' +
    '    <tr>\n' +
    '      <td align="center">\n' +
    '        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: ' + THE_GRID_EMAIL_CONFIG.BG_CARD + '; border: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + '; border-radius: 12px; overflow: hidden; border-spacing: 0;">\n' +
    '          <!-- Header Banner -->\n' +
    '          <tr>\n' +
    '            <td style="background-color: #151b27; border-top: 3px solid ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; border-bottom: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + '; padding: 26px 28px;">\n' +
    '              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">\n' +
    '                <tr>\n' +
    '                  <td>\n' +
    '                    <div style="font-size: 11px; font-weight: 800; color: ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">\n' +
    '                      THE GRID • FORMULA 1 PREDICTION BENCH\n' +
    '                    </div>\n' +
    '                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; line-height: 1.25; color: #ffffff; text-transform: uppercase; letter-spacing: 0.2px;">\n' +
    '                      ' + escapeHtml(title) + '\n' +
    '                    </h1>\n' +
    (subtitle ? '                    <div style="margin-top: 6px; font-size: 13px; color: #94a3b8; font-weight: 500;">\n                      ' + escapeHtml(subtitle) + '\n                    </div>\n' : '') +
    '                  </td>\n' +
    '                  <td align="right" valign="top" style="width: 44px; padding-left: 12px;">\n' +
    '                    <span style="font-size: 28px; line-height: 1;">🏁</span>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '          <!-- Main Content -->\n' +
    '          <tr>\n' +
    '            <td style="padding: 28px 28px 24px 28px;">\n' +
    '              ' + contentHtml + '\n' +
    ((primaryCta || secondaryCta) ? (
      '              <div style="margin-top: 28px; text-align: center;">\n' +
      '                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">\n' +
      '                  <tr>\n' +
      (primaryCta ? (
        '                    <td align="center" bgcolor="' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '" style="border-radius: 6px; padding: 0;">\n' +
        '                      <a href="' + escapeHtml(primaryCta.url) + '" target="_blank" style="display: inline-block; padding: 13px 28px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; background-color: ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + ';">\n' +
        '                        ' + escapeHtml(primaryCta.text) + '\n' +
        '                      </a>\n' +
        '                    </td>\n'
      ) : '') +
      (secondaryCta ? (
        '                    <td align="center" style="padding-left: 12px;">\n' +
        '                      <a href="' + escapeHtml(secondaryCta.url) + '" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; background-color: #1f2937; border: 1px solid #374151;">\n' +
        '                        ' + escapeHtml(secondaryCta.text) + '\n' +
        '                      </a>\n' +
        '                    </td>\n'
      ) : '') +
      '                  </tr>\n' +
      '                </table>\n' +
      '              </div>\n'
    ) : '') +
    (secondaryNote ? (
      '              <div style="margin-top: 18px; text-align: center; font-size: 13px; color: #94a3b8; font-weight: 500;">\n' +
      '                ' + secondaryNote + '\n' +
      '              </div>\n'
    ) : '') +
    '            </td>\n' +
    '          </tr>\n' +
    '          <!-- Footer -->\n' +
    '          <tr>\n' +
    '            <td style="background-color: #0e121a; padding: 22px 28px; border-top: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + '; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">\n' +
    '              <div style="font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">\n' +
    '                THE GRID MOTORSPORT PLATFORM • FORMULA 1 PREDICTION BENCH\n' +
    '              </div>\n' +
    '              <div style="margin-bottom: 8px;">\n' +
    '                Official FIA classification and telemetry verified. Predictions locked at formation lap.\n' +
    '              </div>\n' +
    '              <div>\n' +
    '                <a href="' + THE_GRID_EMAIL_CONFIG.APP_URL + '" target="_blank" style="color: ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; text-decoration: none; font-weight: 600;">\n' +
    '                  Launch The Grid Web App &rarr;\n' +
    '                </a>\n' +
    '              </div>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '</body>\n' +
    '</html>';
}

function generatePredictionConfirmationEmail(params) {
  var gpName = formatGrandPrixName(params.roundTitle || params.raceName || 'Grand Prix');
  var subject = 'Prediction Locked In — ' + gpName;
  var recipientName = params.recipientName || 'Racer';
  var roundNum = params.roundNumber ? ('Round ' + params.roundNumber + ' • ') : '';

  var picks = [];
  var pData = params.predictionData || {};
  if (pData.p1) picks.push({ label: 'P1 Race Winner', value: formatDriverDisplayName(pData.p1) });
  if (pData.p2) picks.push({ label: 'P2 Second Place', value: formatDriverDisplayName(pData.p2) });
  if (pData.p3) picks.push({ label: 'P3 Third Place', value: formatDriverDisplayName(pData.p3) });
  if (pData.fastestLap) picks.push({ label: 'Fastest Lap', value: formatDriverDisplayName(pData.fastestLap) });
  if (pData.driverOfTheDay || pData.riderOfTheDay) picks.push({ label: 'Driver of the Day', value: formatDriverDisplayName(pData.driverOfTheDay || pData.riderOfTheDay) });
  if (pData.safetyCar) picks.push({ label: 'Safety Car', value: String(pData.safetyCar).toUpperCase() });
  if (pData.virtualSafetyCar) picks.push({ label: 'Virtual Safety Car', value: String(pData.virtualSafetyCar).toUpperCase() });
  if (pData.redFlag) picks.push({ label: 'Red Flag', value: String(pData.redFlag).toUpperCase() });
  if (pData.yellowFlag) picks.push({ label: 'Yellow Flag', value: String(pData.yellowFlag).toUpperCase() });

  var rowsHtml = '';
  var rowsText = '';
  for (var i = 0; i < picks.length; i++) {
    var p = picks[i];
    var isEven = (i % 2 === 0);
    var rowBg = isEven ? THE_GRID_EMAIL_CONFIG.BG_ROW_EVEN : THE_GRID_EMAIL_CONFIG.BG_ROW_ODD;
    rowsHtml += '<tr style="background-color: ' + rowBg + '; border-bottom: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + ';">' +
      '<td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; width: 45%;">' + escapeHtml(p.label) + '</td>' +
      '<td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #ffffff;">' + escapeHtml(p.value) + '</td>' +
      '</tr>';
    rowsText += '• ' + p.label + ': ' + p.value + '\n';
  }

  var contentHtml = 
    '<!-- Event / Race Info Strip -->' +
    '<div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">' +
        '<tr>' +
          '<td>' +
            '<div style="font-size: 11px; font-weight: 800; color: ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; text-transform: uppercase; letter-spacing: 1px;">' +
              'FORMULA 1 • ' + escapeHtml(roundNum) + 'CHAMPIONSHIP' +
            '</div>' +
            '<div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 3px;">' +
              escapeHtml(gpName) +
            '</div>' +
          '</td>' +
          '<td align="right" valign="middle">' +
            '<span style="display: inline-block; background-color: #064e3b; border: 1px solid #059669; color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">' +
              '● LOCKED' +
            '</span>' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</div>' +

    '<!-- Confirmation Message -->' +
    '<div style="margin-bottom: 20px;">' +
      '<div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">' +
        'Hi ' + escapeHtml(recipientName) + ',' +
      '</div>' +
      '<div style="font-size: 14px; line-height: 1.6; color: #94a3b8;">' +
        'Your F1 prediction has been submitted successfully.' +
      '</div>' +
    '</div>' +

    (picks.length > 0 ? (
      '<!-- Confirmed Picks Table -->' +
      '<div style="border: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + '; border-radius: 8px; overflow: hidden; margin-bottom: 22px;">' +
        '<div style="background-color: #1a2332; padding: 10px 14px; font-size: 11px; font-weight: 800; color: ' + THE_GRID_EMAIL_CONFIG.ACCENT_GREEN + '; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + ';">' +
          '🔒 CONFIRMED SELECTIONS' +
        '</div>' +
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">' +
          rowsHtml +
        '</table>' +
      '</div>'
    ) : '') +

    '<!-- Info Note -->' +
    '<div style="background-color: rgba(225, 6, 0, 0.06); border-left: 3px solid ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; padding: 12px 14px; border-radius: 0 6px 6px 0; margin-bottom: 4px;">' +
      '<div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">' +
        'Predictions are now authoritatively locked in the system. Official scores and points will be calculated approx. 1 to 2 hours after checkered flag verification.' +
      '</div>' +
    '</div>';

  var predictionBenchUrl = THE_GRID_EMAIL_CONFIG.APP_URL + '#/predictions';
  var htmlBody = buildTheGridEmailShell({
    title: 'Prediction Locked In',
    subtitle: gpName + ' • ' + (roundNum || 'Formula 1'),
    contentHtml: contentHtml,
    primaryCta: { text: 'VIEW MY PREDICTION', url: predictionBenchUrl },
    secondaryNote: 'Good luck! 🏁'
  });

  var plainBody = 
    'THE GRID • FORMULA 1 PREDICTION BENCH\n' +
    '==================================================\n\n' +
    'PREDICTION LOCKED IN\n' +
    'Event: ' + gpName + '\n' +
    'Championship: Formula 1\n' +
    'Status: LOCKED\n\n' +
    'Hi ' + recipientName + ',\n\n' +
    'Your F1 prediction has been submitted successfully.\n\n' +
    (picks.length > 0 ? ('CONFIRMED SELECTIONS:\n' + rowsText + '\n') : '') +
    'VIEW MY PREDICTION:\n' +
    predictionBenchUrl + '\n\n' +
    'Good luck! 🏁\n\n' +
    '--------------------------------------------------\n' +
    'THE GRID MOTORSPORT PLATFORM\n' +
    'Official FIA classification and telemetry verified.\n' +
    THE_GRID_EMAIL_CONFIG.APP_URL;

  return { subject: subject, htmlBody: htmlBody, body: plainBody };
}

function generatePredictionResultEmail(params) {
  var gpName = formatGrandPrixName(params.roundTitle || params.raceName || 'Grand Prix');
  var subject = 'Your ' + gpName + ' Prediction Results';
  var recipientName = params.recipientName || 'Racer';
  var score = Number(params.score !== undefined ? params.score : (params.totalScore !== undefined ? params.totalScore : 0));
  var roundNum = params.roundNumber ? ('Round ' + params.roundNumber + ' • ') : '';
  var leaderboardRank = params.leaderboardRank || params.rank;

  var breakdown = params.breakdown || {};
  var breakdownRowsHtml = '';
  var breakdownText = '';
  var keys = Object.keys(breakdown);

  var labelMap = {
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
    yellowFlag: 'Yellow Flag Prediction'
  };

  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var pts = Number(breakdown[k] || 0);
    var label = labelMap[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, function(str) { return str.toUpperCase(); });
    var isPositive = pts > 0;
    var rowBg = (i % 2 === 0) ? THE_GRID_EMAIL_CONFIG.BG_ROW_EVEN : THE_GRID_EMAIL_CONFIG.BG_ROW_ODD;
    
    breakdownRowsHtml += '<tr style="background-color: ' + rowBg + '; border-bottom: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + ';">' +
      '<td style="padding: 10px 14px; font-size: 13px; color: #f1f5f9;">' + escapeHtml(label) + '</td>' +
      '<td align="right" style="padding: 10px 14px; font-size: 13px; font-weight: 800; font-family: monospace; color: ' + (isPositive ? THE_GRID_EMAIL_CONFIG.ACCENT_GREEN : THE_GRID_EMAIL_CONFIG.TEXT_MUTED) + ';">' +
        (isPositive ? ('+' + pts + ' PTS') : '0 PTS') +
      '</td>' +
      '</tr>';
    breakdownText += '• ' + label + ': ' + (isPositive ? ('+' + pts) : pts) + ' pts\n';
  }

  var contentHtml = 
    '<!-- Event / Race Info Strip -->' +
    '<div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">' +
        '<tr>' +
          '<td>' +
            '<div style="font-size: 11px; font-weight: 800; color: ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; text-transform: uppercase; letter-spacing: 1px;">' +
              'FORMULA 1 • ' + escapeHtml(roundNum) + 'OFFICIAL CLASSIFICATION' +
            '</div>' +
            '<div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 3px;">' +
              escapeHtml(gpName) +
            '</div>' +
          '</td>' +
          '<td align="right" valign="middle">' +
            '<span style="display: inline-block; background-color: #1e3a8a; border: 1px solid #2563eb; color: #93c5fd; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">' +
              '● SCORED' +
            '</span>' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</div>' +

    '<!-- Greeting -->' +
    '<div style="margin-bottom: 20px;">' +
      '<div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">' +
        'Hi ' + escapeHtml(recipientName) + ',' +
      '</div>' +
      '<div style="font-size: 14px; line-height: 1.6; color: #94a3b8;">' +
        'Official steward results for the <strong>' + escapeHtml(gpName) + '</strong> are in, and your scorecard has been processed against the official FIA race classification.' +
      '</div>' +
    '</div>' +

    '<!-- Score Hero Card -->' +
    '<div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 10px; padding: 22px 20px; text-align: center; margin-bottom: 22px;">' +
      '<div style="font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase;">' +
        'TOTAL SESSION SCORE' +
      '</div>' +
      '<div style="margin: 8px 0 6px 0;">' +
        '<span style="font-size: 42px; font-weight: 900; color: #ffffff; font-family: monospace; letter-spacing: -1px;">' +
          (score > 0 ? ('+' + score) : score) +
        '</span> ' +
        '<span style="font-size: 20px; font-weight: 800; color: ' + (score > 0 ? THE_GRID_EMAIL_CONFIG.ACCENT_GREEN : THE_GRID_EMAIL_CONFIG.TEXT_MUTED) + ';">PTS</span>' +
      '</div>' +
      (leaderboardRank ? (
        '<div style="margin-top: 10px; display: inline-block; background-color: rgba(255, 214, 0, 0.1); border: 1px solid rgba(255, 214, 0, 0.3); color: #ffd600; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 999px;">' +
          '🏆 Championship Standings: Rank #' + escapeHtml(String(leaderboardRank)) +
        '</div>'
      ) : '') +
    '</div>' +

    (keys.length > 0 ? (
      '<!-- Point Breakdown Table -->' +
      '<div style="border: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + '; border-radius: 8px; overflow: hidden; margin-bottom: 22px;">' +
        '<div style="background-color: #1a2332; padding: 10px 14px; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid ' + THE_GRID_EMAIL_CONFIG.BORDER_COLOR + ';">' +
          '📊 POINT BREAKDOWN' +
        '</div>' +
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">' +
          breakdownRowsHtml +
        '</table>' +
      '</div>'
    ) : '');

  var predictionBenchUrl = THE_GRID_EMAIL_CONFIG.APP_URL + '#/predictions';
  var leaderboardUrl = THE_GRID_EMAIL_CONFIG.APP_URL + '#/leaderboard';

  var htmlBody = buildTheGridEmailShell({
    title: 'Your Prediction Results Are In',
    subtitle: gpName + ' • ' + (roundNum || 'Formula 1'),
    contentHtml: contentHtml,
    primaryCta: { text: 'VIEW MY RESULTS', url: predictionBenchUrl },
    secondaryCta: { text: 'VIEW LEADERBOARD', url: leaderboardUrl },
    secondaryNote: 'Points have been credited to your championship tally. Check your position on the season standings.'
  });

  var plainBody = 
    'THE GRID • FORMULA 1 PREDICTION BENCH\n' +
    '==================================================\n\n' +
    'YOUR PREDICTION RESULTS ARE IN\n' +
    'Event: ' + gpName + '\n' +
    'Championship: Formula 1\n' +
    'Status: SCORED\n\n' +
    'Hi ' + recipientName + ',\n\n' +
    'Official steward results for the ' + gpName + ' are in, and your scorecard has been processed!\n\n' +
    'TOTAL SESSION SCORE: ' + (score > 0 ? ('+' + score) : score) + ' PTS\n' +
    (leaderboardRank ? ('Leaderboard Rank: #' + leaderboardRank + '\n') : '') + '\n' +
    (keys.length > 0 ? ('POINT BREAKDOWN:\n' + breakdownText + '\n') : '') +
    'VIEW MY RESULTS:\n' +
    predictionBenchUrl + '\n\n' +
    'VIEW LEADERBOARD:\n' +
    leaderboardUrl + '\n\n' +
    'Points have been credited to your championship tally. Check your position on the season standings.\n\n' +
    '--------------------------------------------------\n' +
    'THE GRID MOTORSPORT PLATFORM\n' +
    'Official FIA classification and telemetry verified.\n' +
    THE_GRID_EMAIL_CONFIG.APP_URL;

  return { subject: subject, htmlBody: htmlBody, body: plainBody };
}

function generateWelcomeEmail(params) {
  var subject = 'Welcome to The Grid 🏁';
  var recipientName = params.displayName || params.recipientName || 'Racer';

  var contentHtml = 
    '<div style="margin-bottom: 20px;">' +
      '<div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">' +
        'Hi ' + escapeHtml(recipientName) + ',' +
      '</div>' +
      '<div style="font-size: 14px; line-height: 1.6; color: #94a3b8;">' +
        'Welcome to The Grid — your home for learning, following, and experiencing Formula 1 and global motorsport.' +
      '</div>' +
    '</div>' +

    '<div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 16px; margin-bottom: 16px;">' +
      '<div style="font-size: 13px; font-weight: 800; color: ' + THE_GRID_EMAIL_CONFIG.PRIMARY_RED + '; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">' +
        '📚 LEARN FORMULA 1' +
      '</div>' +
      '<div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">' +
        'Explore comprehensive breakdowns of F1 rules, 2026 technical regulations (Active Aero X-Mode/Z-Mode, 400 kW ICE + 350 kW MGU-K hybrid power units, and Overtake Mode), tyre strategy, and racing terminology.' +
      '</div>' +
    '</div>' +

    '<div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 16px; margin-bottom: 16px;">' +
      '<div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">' +
        '🏎️ FOLLOW RACE WEEKENDS' +
      '</div>' +
      '<div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">' +
        'Stay on top of all 24 Grand Prix circuits with real-time countdown timers, local session timetables (Practice, Qualifying, Sprint, and Race), and circuit telemetry.' +
      '</div>' +
    '</div>' +

    '<div style="background-color: #161e2b; border: 1px solid #283548; border-radius: 8px; padding: 16px; margin-bottom: 22px;">' +
      '<div style="font-size: 13px; font-weight: 800; color: #00e676; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">' +
        '🏁 PREDICTION BENCH & COMMUNITY COMPETITION' +
      '</div>' +
      '<div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">' +
        'Put your strategy knowledge to the test. Lock in your picks for Pole Position, Podium Finishers (P1, P2, P3), and Fastest Lap before sessions begin, score points, and climb the season leaderboard!' +
      '</div>' +
    '</div>';

  var htmlBody = buildTheGridEmailShell({
    title: 'Welcome to The Grid',
    subtitle: 'Motorsport Platform & Prediction Bench',
    contentHtml: contentHtml,
    primaryCta: { text: 'EXPLORE THE GRID', url: THE_GRID_EMAIL_CONFIG.APP_URL },
    secondaryNote: 'Good luck on the grid, and may your strategy lead you to the podium! 🏁'
  });

  var plainBody = 
    'THE GRID • MOTORSPORT PLATFORM\n' +
    '==================================================\n\n' +
    'Welcome to The Grid — your home for learning, following, and experiencing Formula 1.\n\n' +
    'Hi ' + recipientName + ',\n\n' +
    'We are thrilled to have you join our motorsport community. Here is what you can do on The Grid:\n\n' +
    '1. LEARN FORMULA 1\n' +
    'Explore F1 rules, 2026 technical regulations (Active Aero X-Mode/Z-Mode & 400 kW ICE + 350 kW MGU-K hybrid power units), tyre strategy, and racing terminology.\n\n' +
    '2. FOLLOW RACE WEEKENDS\n' +
    'Stay on top of all 24 Grand Prix circuits with real-time countdown timers, local session timetables, and circuit telemetry.\n\n' +
    '3. PREDICTION BENCH & COMMUNITY COMPETITION\n' +
    'Lock in your picks for Podium Finishers (P1, P2, P3) and Fastest Lap, score points, and climb the season leaderboard!\n\n' +
    'Launch The Grid: ' + THE_GRID_EMAIL_CONFIG.APP_URL + '\n\n' +
    '--------------------------------------------------\n' +
    'The Grid Team';

  return { subject: subject, htmlBody: htmlBody, body: plainBody };
}

/**
 * =========================================================================
 * ASYNCHRONOUS NOTIFICATION QUEUE & IDEMPOTENT DELIVERY
 * =========================================================================
 */

function enqueueNotificationsBatch(items) {
  if (!items || !items.length) return { queuedCount: 0, skippedCount: 0 };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let queueSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_QUEUE);
  if (!queueSheet) {
    queueSheet = ss.insertSheet(SHEET_NAMES.NOTIFICATION_QUEUE);
    queueSheet.getRange(1, 1, 1, 12).setValues([['id', 'recipientEmail', 'recipientName', 'notificationType', 'subject', 'templateDataJson', 'status', 'idempotencyKey', 'attempts', 'queuedAt', 'sentAt', 'errorMessage']]);
    queueSheet.getRange(1, 1, 1, 12).setBackground('#10b981').setFontColor('#ffffff').setFontWeight('bold');
  }

  // Single batch read of existing idempotency keys from queue and log
  const existingKeys = {};
  const queueRows = queueSheet.getDataRange().getValues();
  for (let i = 1; i < queueRows.length; i++) {
    const key = String(queueRows[i][7] || '').trim();
    if (key) {
      existingKeys[key] = true;
      existingKeys[key.replace(':', '_')] = true;
      existingKeys[key.replace('_', ':')] = true;
    }
  }

  const logSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_LOG);
  if (logSheet) {
    const logRows = logSheet.getDataRange().getValues();
    for (let j = 1; j < logRows.length; j++) {
      const key = String(logRows[j][4] || '').trim();
      if (key) {
        existingKeys[key] = true;
        existingKeys[key.replace(':', '_')] = true;
        existingKeys[key.replace('_', ':')] = true;
      }
    }
  }

  const nowIso = new Date().toISOString();
  const rowsToInsert = [];
  let skippedCount = 0;

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (!item.recipientEmail || !item.idempotencyKey) {
      skippedCount++;
      continue;
    }
    const key = String(item.idempotencyKey).trim();
    if (existingKeys[key]) {
      skippedCount++;
      continue;
    }
    // Prevent duplicates within this batch
    existingKeys[key] = true;
    existingKeys[key.replace(':', '_')] = true;
    existingKeys[key.replace('_', ':')] = true;

    const queueId = 'ntf_' + Utilities.getUuid();
    rowsToInsert.push([
      queueId,
      item.recipientEmail,
      item.recipientName || '',
      item.notificationType || 'GENERAL',
      item.subject || '',
      JSON.stringify(item.templateData || {}),
      'PENDING',
      key,
      0,
      nowIso,
      '',
      ''
    ]);
  }

  if (rowsToInsert.length > 0) {
    const startRow = queueSheet.getLastRow() + 1;
    queueSheet.getRange(startRow, 1, rowsToInsert.length, 12).setValues(rowsToInsert);
    Logger.log('[NOTIFICATIONS_BATCH_QUEUED] Enqueued ' + rowsToInsert.length + ' notifications (skipped ' + skippedCount + ')');
  }

  return { queuedCount: rowsToInsert.length, skippedCount: skippedCount };
}

function enqueueNotification(recipientEmail, recipientName, notificationType, subject, templateData, idempotencyKey) {
  const res = enqueueNotificationsBatch([{
    recipientEmail: recipientEmail,
    recipientName: recipientName,
    notificationType: notificationType,
    subject: subject,
    templateData: templateData,
    idempotencyKey: idempotencyKey
  }]);
  return res.queuedCount > 0;
}

function processNotificationQueue(batchLimit) {
  // Sanitize batchLimit: when invoked by a time trigger, Apps Script passes an event object e
  const limit = (typeof batchLimit === 'number' && !isNaN(batchLimit)) ? batchLimit : 25;
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    // Non-blocking lock try (max 5s) to avoid 60s trigger hang/timeout
    hasLock = lock.tryLock(5000);
  } catch (lockErr) {
    Logger.log('[EMAIL_LOCKED] Lock exception, skipping run: ' + lockErr.toString());
    return { processed: 0, sent: 0, failed: 0, locked: true };
  }

  if (!hasLock) {
    Logger.log('[EMAIL_BUSY] Another worker holds lock, skipping run.');
    return { processed: 0, sent: 0, failed: 0, locked: true };
  }

  try {
    Logger.log('[EMAIL_PROCESSING_STARTED] Checking queue (batch limit: ' + limit + ')...');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('[EMAIL_ERROR] Active spreadsheet unavailable.');
      return { processed: 0, sent: 0, failed: 0 };
    }

    const queueSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_QUEUE);
    if (!queueSheet) return { processed: 0, sent: 0, failed: 0 };

    let logSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_LOG);
    if (!logSheet) {
      logSheet = ss.insertSheet(SHEET_NAMES.NOTIFICATION_LOG);
      logSheet.getRange(1, 1, 1, 8).setValues([['id', 'queueId', 'recipientEmail', 'notificationType', 'idempotencyKey', 'sentAt', 'status', 'deliveryMetadata']]);
      logSheet.getRange(1, 1, 1, 8).setBackground('#e10600').setFontColor('#ffffff').setFontWeight('bold');
    }

    const rows = queueSheet.getDataRange().getValues();
    let processed = 0;
    let sent = 0;
    let failed = 0;

    let remainingQuota = 100;
    try {
      remainingQuota = MailApp.getRemainingDailyQuota();
    } catch (_qErr) {}

    for (let i = 1; i < rows.length && processed < limit; i++) {
      const status = String(rows[i][6] || '').trim();
      if (status === 'PENDING' || status === 'RETRY') {
        if (remainingQuota <= 0) {
          Logger.log('[EMAIL_QUOTA_EXHAUSTED] Remaining daily quota is 0. Pausing.');
          break;
        }

        processed++;
        const rowIdx = i + 1;
        const queueId = rows[i][0];
        const email = rows[i][1];
        const name = rows[i][2];
        const type = rows[i][3];
        const data = JSON.parse(rows[i][5] || '{}');
        const idempotencyKey = rows[i][7];
        const attempts = Number(rows[i][8] || 0) + 1;
        const nowIso = new Date().toISOString();

        // Standardized subject formatting
        var gpName = formatGrandPrixName(data.roundTitle || data.raceName || rows[i][4]);
        var subject = rows[i][4] || 'The Grid Notification';
        if (type === 'WELCOME') {
          subject = 'Welcome to The Grid 🏁';
        } else if (type === 'PREDICTION_CONFIRMATION' || type === 'PREDICTION_SUBMITTED') {
          subject = 'Prediction Locked In — ' + gpName;
        } else if (type === 'RACE_RESULTS' || type === 'PREDICTION_RESULT') {
          subject = 'Your ' + gpName + ' Prediction Results';
        }

        // Mark as PROCESSING
        queueSheet.getRange(rowIdx, 7).setValue('PROCESSING');

        try {
          Logger.log('[EMAIL_SEND_ATTEMPT] Delivering ' + type + ' to ' + email + ' (Attempt ' + attempts + ')');

          // Generate rich branded email payload
          var emailPayload = null;
          if (type === 'PREDICTION_CONFIRMATION' || type === 'PREDICTION_SUBMITTED') {
            emailPayload = generatePredictionConfirmationEmail({
              recipientName: name,
              roundTitle: gpName,
              raceName: gpName,
              roundNumber: data.roundNumber || '',
              predictionData: data.predictionData || {}
            });
          } else if (type === 'RACE_RESULTS' || type === 'PREDICTION_RESULT') {
            emailPayload = generatePredictionResultEmail({
              recipientName: name,
              roundTitle: gpName,
              raceName: gpName,
              roundNumber: data.roundNumber || '',
              score: data.score !== undefined ? data.score : (data.totalScore !== undefined ? data.totalScore : 0),
              breakdown: data.breakdown || {},
              leaderboardRank: data.leaderboardRank || data.rank
            });
          } else if (type === 'WELCOME') {
            emailPayload = generateWelcomeEmail({
              recipientName: name,
              displayName: name
            });
          }

          var finalSubject = emailPayload ? emailPayload.subject : subject;
          var finalBody = (data && data.body) ? data.body : (emailPayload ? emailPayload.body : ('Hello ' + (name || 'Racer') + ',\n\n' + subject + '\n\n' + THE_GRID_EMAIL_CONFIG.APP_URL));
          var finalHtmlBody = (data && data.htmlBody) ? data.htmlBody : (emailPayload ? emailPayload.htmlBody : undefined);

          const emailOpts = {
            to: email,
            name: 'The Grid',
            subject: finalSubject,
            body: finalBody
          };
          if (finalHtmlBody) {
            emailOpts.htmlBody = finalHtmlBody;
          }

          MailApp.sendEmail(emailOpts);
          remainingQuota--;

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
            JSON.stringify({ attempts: attempts, sender: 'thepaddockprediction14@gmail.com' })
          ]);
          sent++;
          Logger.log('[EMAIL_SENT] Successfully sent ' + type + ' to ' + email);
        } catch (err) {
          failed++;
          const finalStatus = attempts >= 3 ? 'FAILED' : 'RETRY';
          queueSheet.getRange(rowIdx, 7).setValue(finalStatus);
          queueSheet.getRange(rowIdx, 9).setValue(attempts);
          queueSheet.getRange(rowIdx, 12).setValue(err.toString());
          Logger.log('[EMAIL_FAILED] Delivery failed for ' + email + ': ' + err.toString());
          if (finalStatus === 'RETRY') {
            Logger.log('[EMAIL_RETRY] Queued for retry: ' + email + ' (Attempt ' + attempts + ' of 3)');
          }
        }
      }
    }

    Logger.log('[EMAIL_PROCESSING_COMPLETED] Processed: ' + processed + ', Sent: ' + sent + ', Failed: ' + failed);
    return { processed: processed, sent: sent, failed: failed };
  } catch (outerErr) {
    Logger.log('[EMAIL_OUTER_ERR] Unexpected error in notification processor: ' + outerErr.toString());
    return { processed: 0, sent: 0, failed: 0, error: outerErr.toString() };
  } finally {
    try {
      if (lock && hasLock && lock.hasLock()) {
        lock.releaseLock();
      }
    } catch (_releaseErr) {}
  }
}

/**
 * Update a prediction round's attributes (e.g. closesAt, opensAt, status)
 */
function adminUpdatePredictionRound(payload) {
  if (!payload || !payload.roundId) {
    throw new Error('roundId is required to update prediction round');
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  if (!sheet) throw new Error('PredictionRounds sheet not found');

  const rows = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.roundId) {
      if (payload.closesAt) sheet.getRange(i + 1, 8).setValue(payload.closesAt);
      if (payload.opensAt) sheet.getRange(i + 1, 7).setValue(payload.opensAt);
      if (payload.status) sheet.getRange(i + 1, 9).setValue(payload.status);
      found = true;
      break;
    }
  }

  // Clear caches
  try {
    const cache = CacheService.getScriptCache();
    cache.remove('pred_rounds_all');
    if (payload.raceWeekendId) cache.remove('pred_rounds_' + payload.raceWeekendId);
  } catch (_cErr) {}

  return { success: found, roundId: payload.roundId };
}

/**
 * Helper to update Azerbaijan Grand Prix (Baku) prediction closesAt deadline
 * to tonight at 12:00 AM midnight IST (2026-09-25T18:30:00.000Z).
 */
function setBakuPredictionDeadlineMidnight() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  if (!sheet) return { success: false, error: 'PredictionRounds sheet not found' };

  const rows = sheet.getDataRange().getValues();
  const newClosesAt = '2026-09-25T18:30:00.000Z'; // 12:00 AM midnight IST
  let updatedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const roundId = String(rows[i][0] || '');
    const weekendId = String(rows[i][1] || '');
    const title = String(rows[i][4] || '');
    if (
      roundId.indexOf('2026_15') !== -1 ||
      roundId.indexOf('2026_17') !== -1 ||
      weekendId === '2026_15' ||
      weekendId === '2026_17' ||
      title.indexOf('Azerbaijan') !== -1
    ) {
      sheet.getRange(i + 1, 8).setValue(newClosesAt); // Column 8 is closesAt
      updatedCount++;
    }
  }

  try {
    const cache = CacheService.getScriptCache();
    cache.remove('pred_rounds_2026_15');
    cache.remove('pred_rounds_2026_17');
    cache.remove('pred_rounds_all');
  } catch (_cErr) {}

  Logger.log('[DEADLINE_UPDATED] Updated ' + updatedCount + ' rounds to deadline ' + newClosesAt);
  return { success: true, updatedCount: updatedCount, closesAt: newClosesAt };
}

/**
 * One-click migration to normalize all Azerbaijan Grand Prix predictions in the
 * Predictions sheet from 2026_17_RACE_PREDICTION to 2026_15_RACE_PREDICTION.
 */
function normalizeAzerbaijanPredictionRoundIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  if (!sheet) return { success: false, error: 'Predictions sheet not found' };

  const rows = sheet.getDataRange().getValues();
  let migratedCount = 0;
  for (let i = 1; i < rows.length; i++) {
    const rowRound = String(rows[i][2] || '').trim();
    // Only migrate predictions submitted during Azerbaijan weekend (before 2026-09-28)
    const submittedAt = String(rows[i][4] || '');
    const isOldAzerbaijanSubmission = submittedAt && submittedAt < '2026-09-28T00:00:00.000Z';
    if ((rowRound === '2026_17_RACE_PREDICTION' || rowRound === '2026_17_RACE') && isOldAzerbaijanSubmission) {
      sheet.getRange(i + 1, 3).setValue('2026_15_RACE_PREDICTION');
      migratedCount++;
    }
  }
  Logger.log('[MIGRATION] Migrated ' + migratedCount + ' legacy predictions from 2026_17 to 2026_15_RACE_PREDICTION');
  return { success: true, migratedCount: migratedCount };
}

/**
 * P0 Data Integrity: Audit and consolidate duplicate user identities.
 * Supports dry-run inspection to safely detect duplicates without modifying sheets,
 * and creates an automated timestamped backup of the Users sheet before applying permanent changes.
 *
 * @param {boolean} dryRun - If true (default), returns audit report without modifying any data.
 */
function auditAndDeduplicateUsers(dryRun) {
  if (dryRun === undefined) dryRun = true;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!userSheet) return { success: false, error: 'Users sheet not found' };
  ensureUserHeaders(userSheet);

  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);

  const userRows = userSheet.getDataRange().getValues();
  if (userRows.length <= 1) {
    return { success: true, message: 'No users to audit', dryRun: dryRun, duplicateGroups: [] };
  }

  const headers = userRows[0];
  const colMap = {};
  for (let c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).trim()] = c;
  }

  const emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
  const userIdCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
  const usernameCol = colMap['username'] !== undefined ? colMap['username'] : 3;
  const avatarCol = colMap['avatarUrl'] !== undefined ? colMap['avatarUrl'] : 4;
  const subCol = colMap['googleSubjectId'];
  const pointsCol = colMap['totalPoints'] !== undefined ? colMap['totalPoints'] : 8;

  // Build structured user records
  const records = [];
  for (let i = 1; i < userRows.length; i++) {
    const row = userRows[i];
    const uid = String(row[userIdCol] || '').trim();
    if (!uid) continue;
    records.push({
      rowIndex: i + 1,
      userId: uid,
      email: String(row[emailCol] || '').trim().toLowerCase(),
      username: String(row[usernameCol] || '').trim().toLowerCase(),
      displayName: String(colMap['displayName'] !== undefined ? row[colMap['displayName']] : ''),
      avatarUrl: String(avatarCol !== undefined ? row[avatarCol] : '').trim(),
      googleSubjectId: String(subCol !== undefined ? row[subCol] : '').trim(),
      favouriteDriver: String(colMap['favouriteDriver'] !== undefined ? row[colMap['favouriteDriver']] : '').trim(),
      favouriteConstructor: String(colMap['favouriteConstructor'] !== undefined ? row[colMap['favouriteConstructor']] : '').trim(),
      bio: String(colMap['bio'] !== undefined ? row[colMap['bio']] : '').trim(),
      role: String(colMap['role'] !== undefined ? row[colMap['role']] : 'user').trim(),
      createdAt: String(colMap['createdAt'] !== undefined ? row[colMap['createdAt']] : '').trim(),
      totalPoints: Number(pointsCol !== undefined ? row[pointsCol] : 0) || 0
    });
  }

  // Identify connected duplicate groups
  const groups = [];
  const visited = {};

  for (let i = 0; i < records.length; i++) {
    if (visited[records[i].userId]) continue;
    const group = [records[i]];
    visited[records[i].userId] = true;

    for (let j = 0; j < records.length; j++) {
      if (i === j || visited[records[j].userId]) continue;
      const a = records[i];
      const b = records[j];

      const matchSub = a.googleSubjectId && b.googleSubjectId && a.googleSubjectId === b.googleSubjectId;
      const matchEmail = a.email && b.email && a.email === b.email;
      const matchUsername = a.username && b.username && a.username === b.username;

      if (matchSub || matchEmail || matchUsername) {
        group.push(records[j]);
        visited[records[j].userId] = true;
      }
    }

    if (group.length > 1) {
      groups.push(group);
    }
  }

  // Plan consolidation for duplicate groups
  const auditReport = [];
  const userReplacements = {};

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    // Score records to determine canonical authority:
    // +100 for verified googleSubjectId
    // +50 for valid http avatar
    // +20 for non-empty username
    // +10 for admin role
    // +points up to 50
    let bestRecord = group[0];
    let bestScore = -1;

    for (let r = 0; r < group.length; r++) {
      const rec = group[r];
      let score = 0;
      if (rec.googleSubjectId) score += 100;
      if (rec.avatarUrl && rec.avatarUrl.indexOf('http') === 0) score += 50;
      if (rec.username) score += 20;
      if (rec.role === 'admin') score += 10;
      score += Math.min(rec.totalPoints, 50);

      if (score > bestScore) {
        bestScore = score;
        bestRecord = rec;
      }
    }

    const secondaries = group.filter(function(r) { return r.userId !== bestRecord.userId; });
    secondaries.forEach(function(sec) {
      userReplacements[sec.userId] = bestRecord.userId;
    });

    auditReport.push({
      canonicalUserId: bestRecord.userId,
      canonicalUsername: bestRecord.username,
      canonicalEmail: bestRecord.email,
      canonicalAvatarUrl: bestRecord.avatarUrl,
      mergedUserIds: secondaries.map(function(s) { return s.userId; }),
      recordsInGroup: group.map(function(r) {
        return {
          userId: r.userId,
          username: r.username,
          email: r.email,
          avatarUrl: r.avatarUrl,
          points: r.totalPoints,
          rowIndex: r.rowIndex
        };
      })
    });
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      duplicateGroupsFound: groups.length,
      auditReport: auditReport,
      message: 'Dry run completed. Found ' + groups.length + ' duplicate user group(s). No sheets were modified.'
    };
  }

  // LIVE CONSOLIDATION
  const backupSheetName = 'Users_Backup_' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss');
  userSheet.copyTo(ss).setName(backupSheetName);

  let updatedPreds = 0;
  if (predSheet) {
    const pRows = predSheet.getDataRange().getValues();
    for (let i = 1; i < pRows.length; i++) {
      const oldUid = String(pRows[i][1] || '').trim();
      if (userReplacements[oldUid]) {
        predSheet.getRange(i + 1, 2).setValue(userReplacements[oldUid]);
        updatedPreds++;
      }
    }
  }

  let updatedScores = 0;
  if (scoreSheet) {
    const sRows = scoreSheet.getDataRange().getValues();
    for (let i = 1; i < sRows.length; i++) {
      const oldUid = String(sRows[i][1] || '').trim();
      if (userReplacements[oldUid]) {
        scoreSheet.getRange(i + 1, 2).setValue(userReplacements[oldUid]);
        updatedScores++;
      }
    }
  }

  // Delete secondary duplicate rows in reverse order to preserve indexes
  const rowsToDelete = [];
  auditReport.forEach(function(item) {
    item.recordsInGroup.forEach(function(r) {
      if (r.userId !== item.canonicalUserId) {
        rowsToDelete.push(r.rowIndex);
      }
    });
  });
  rowsToDelete.sort(function(a, b) { return b - a; });
  rowsToDelete.forEach(function(rowIdx) {
    userSheet.deleteRow(rowIdx);
  });

  try {
    const cache = CacheService.getScriptCache();
    cache.remove('leaderboard_season_global');
  } catch (_cErr) {}

  return {
    success: true,
    dryRun: false,
    backupCreated: backupSheetName,
    duplicateGroupsConsolidated: groups.length,
    rowsDeleted: rowsToDelete.length,
    predictionsRepointed: updatedPreds,
    scoresRepointed: updatedScores,
    auditReport: auditReport
  };
}

/**
 * Diagnostic & Status Endpoint for Notification Queue
 */
function getNotificationQueueStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const queueSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_QUEUE);
  if (!queueSheet) return { total: 0, pending: 0, processing: 0, sent: 0, failed: 0, retry: 0, items: [] };

  const rows = queueSheet.getDataRange().getValues();
  const statusCounts = { PENDING: 0, PROCESSING: 0, SENT: 0, FAILED: 0, RETRY: 0 };
  const items = [];

  for (let i = 1; i < rows.length; i++) {
    const status = String(rows[i][6] || '').trim().toUpperCase();
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
    items.push({
      id: rows[i][0],
      email: rows[i][1],
      type: rows[i][3],
      subject: rows[i][4],
      status: status,
      idempotencyKey: rows[i][7],
      attempts: rows[i][8],
      queuedAt: rows[i][9],
      sentAt: rows[i][10],
      errorMessage: rows[i][11]
    });
  }

  return {
    total: rows.length - 1,
    pending: statusCounts.PENDING,
    processing: statusCounts.PROCESSING,
    sent: statusCounts.SENT,
    failed: statusCounts.FAILED,
    retry: statusCounts.RETRY,
    items: items.slice(-10)
  };
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

  // Create clean 5-minute time-driven trigger (5 minutes stays well within quota and avoids Google RPC saturation)
  const newTrigger = ScriptApp.newTrigger('processNotificationQueue')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('[EMAIL_SETUP] Created new 5-minute time-driven trigger ID: ' + newTrigger.getUniqueId());

  // Immediately process any pending items in queue
  const queueResult = processNotificationQueue(25);
  Logger.log('[EMAIL_SETUP] Initial queue process result: ' + JSON.stringify(queueResult));

  return {
    success: true,
    senderAccount: 'thepaddockprediction14@gmail.com',
    quotaRemaining: quota,
    triggerCreated: true,
    triggerInterval: '5 minutes',
    initialProcess: queueResult
  };
}

/**
 * Manual test function to send a verification email and authorize MailApp in 1 click.
 */
function testSendWelcomeEmail(targetEmail) {
  const recipient = targetEmail || 'thepaddockprediction14@gmail.com';
  const emailPayload = generateWelcomeEmail({
    recipientName: 'Racer',
    displayName: 'Racer'
  });

  MailApp.sendEmail({
    to: recipient,
    name: 'The Grid',
    subject: emailPayload.subject,
    body: emailPayload.body,
    htmlBody: emailPayload.htmlBody
  });

  Logger.log('[EMAIL_SENT] Verification test email sent successfully to: ' + recipient);
  return { success: true, recipient: recipient, sender: 'thepaddockprediction14@gmail.com' };
}

/**
 * Real-time Automated Data Sync:
 * Clears caches and synchronizes live round and weekend status according to current time.
 */
function syncCurrentWeekendAndStatus() {
  Logger.log('[AUTO_SYNC] Executing automatic weekend, round status, and calendar sync...');
  const cache = CacheService.getScriptCache();
  cache.remove('current_weekend');
  cache.remove('race_weekends_2026');
  cache.remove('pred_rounds_all');

  const current = getCurrentWeekend();
  Logger.log('[AUTO_SYNC] Status sync complete. Current weekend: ' + (current ? current.raceName : 'None'));
  return { success: true, currentWeekend: current ? current.raceName : null, timestamp: new Date().toISOString() };
}

/**
 * Setup recurring trigger for automatic race calendar and status synchronization.
 * Runs every 6 hours automatically to ensure race states and round lifecycles stay fresh.
 */
function setupAutomaticSyncTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncCurrentWeekendAndStatus') {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }

  const newTrigger = ScriptApp.newTrigger('syncCurrentWeekendAndStatus')
    .timeBased()
    .everyHours(6)
    .create();

  Logger.log('[AUTO_SYNC_SETUP] Installed 6-hour time-driven calendar sync trigger: ' + newTrigger.getUniqueId());
  return { success: true, triggerId: newTrigger.getUniqueId(), removedPrevious: removed };
}

/**
 * =========================================================================
 * UNIVERSAL PLATFORM-WIDE PREDICTION INTEGRITY & RELIABILITY AUDITOR
 * =========================================================================
 * Scans every supported event, prediction, user, score, result, and notification.
 * Dry run mode: Identifies and tallies defects without altering state.
 * Remediation mode (dryRun: false): Automatically creates backup sheets, deduplicates,
 * reconciles points, and fixes discrepancies safely.
 */
function auditPlatformData(dryRun) {
  if (dryRun === undefined) dryRun = true;
  const startTime = Date.now();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const report = {
    timestamp: new Date().toISOString(),
    dryRun: dryRun,
    status: 'COMPLETE',
    summary: {
      totalDefects: 0,
      userDefects: 0,
      eventIsolationDefects: 0,
      duplicatePredictionDefects: 0,
      scoringDefects: 0,
      notificationDefects: 0
    },
    userAudit: { duplicateGroups: [], affectedUserIds: [] },
    eventIsolationAudit: {
      unknownRoundPredictions: [],
      sprintTypeMismatches: [],
      malformedRoundIds: []
    },
    duplicatePredictionsAudit: {
      duplicateGroups: [],
      totalDuplicates: 0
    },
    scoringAudit: {
      unscoredCompletedPredictions: [],
      orphanedScores: [],
      scoreDivergences: [],
      falseScoredStatus: []
    },
    notificationAudit: {
      duplicateQueueKeys: []
    },
    remediation: {
      backupSheetsCreated: [],
      usersConsolidated: 0,
      predictionsDeduplicated: 0,
      scoresReconciled: 0,
      notes: []
    },
    durationMs: 0
  };

  // 1. Audit Users
  const userAuditRes = auditAndDeduplicateUsers(true);
  if (userAuditRes && userAuditRes.duplicateGroups) {
    report.userAudit.duplicateGroups = userAuditRes.duplicateGroups;
    report.userAudit.affectedUserIds = userAuditRes.duplicateGroups.reduce(function(acc, g) {
      return acc.concat(g.users.map(function(u) { return u.userId; }));
    }, []);
    report.summary.userDefects = report.userAudit.duplicateGroups.length;
  }

  // Load all relevant sheets
  const rwSheet = ss.getSheetByName(SHEET_NAMES.RACE_WEEKENDS);
  const rwRows = rwSheet ? rwSheet.getDataRange().getValues() : [];
  const weekendMap = {};
  for (let w = 1; w < rwRows.length; w++) {
    const wid = String(rwRows[w][0] || '').trim();
    if (wid) weekendMap[wid] = { weekendType: rwRows[w][7], name: rwRows[w][3] };
  }

  const prSheet = ss.getSheetByName(SHEET_NAMES.PREDICTION_ROUNDS);
  const prRows = prSheet ? prSheet.getDataRange().getValues() : [];
  const roundMap = {};
  for (let r = 1; r < prRows.length; r++) {
    const rid = String(prRows[r][0] || '').trim();
    if (rid) {
      roundMap[rid] = {
        roundId: rid,
        raceWeekendId: String(prRows[r][1] || '').trim(),
        roundType: String(prRows[r][3] || '').trim(),
        status: String(prRows[r][8] || '').trim()
      };
    }
  }

  const resSheet = ss.getSheetByName(SHEET_NAMES.RESULTS);
  const resRows = resSheet ? resSheet.getDataRange().getValues() : [];
  const resultMap = {};
  for (let res = 1; res < resRows.length; res++) {
    const rRound = String(resRows[res][1] || '').trim();
    if (rRound) {
      try {
        resultMap[rRound] = typeof resRows[res][2] === 'string' ? JSON.parse(resRows[res][2] || '{}') : resRows[res][2];
      } catch (e) {
        resultMap[rRound] = null;
      }
    }
  }

  const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  const scoreRows = scoreSheet ? scoreSheet.getDataRange().getValues() : [];
  const scoreMap = {};
  for (let s = 1; s < scoreRows.length; s++) {
    const sId = String(scoreRows[s][0] || '').trim();
    const sUid = String(scoreRows[s][1] || '').trim();
    const sRid = String(scoreRows[s][2] || '').trim();
    const sTotal = Number(scoreRows[s][4]) || 0;
    const key = sUid + '__' + sRid;

    if (!scoreMap[key]) {
      scoreMap[key] = [];
    }
    scoreMap[key].push({
      rowIndex: s + 1,
      scoreId: sId,
      userId: sUid,
      roundId: sRid,
      totalScore: sTotal
    });

    if (!roundMap[sRid]) {
      report.scoringAudit.orphanedScores.push({ scoreId: sId, userId: sUid, roundId: sRid, reason: 'Round ID not registered in PredictionRounds' });
    }
  }

  const predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  const predRows = predSheet ? predSheet.getDataRange().getValues() : [];
  const predGrouping = {};

  for (let p = 1; p < predRows.length; p++) {
    const pid = String(predRows[p][0] || '').trim();
    const pUid = String(predRows[p][1] || '').trim();
    const pRid = String(predRows[p][2] || '').trim();
    const pSubmittedAt = String(predRows[p][4] || '');
    const pUpdatedAt = String(predRows[p][5] || pSubmittedAt || '');

    let pData = null;
    try {
      pData = typeof predRows[p][3] === 'string' ? JSON.parse(predRows[p][3] || '{}') : predRows[p][3];
    } catch (e) {
      pData = null;
    }

    if (!pRid || pRid.indexOf('_') === -1) {
      report.eventIsolationAudit.malformedRoundIds.push({ predictionId: pid, roundId: pRid });
    } else if (!roundMap[pRid]) {
      report.eventIsolationAudit.unknownRoundPredictions.push({ predictionId: pid, roundId: pRid });
    } else {
      const rInfo = roundMap[pRid];
      const wInfo = weekendMap[rInfo.raceWeekendId];
      if (wInfo && pRid.indexOf('_SPRINT_') !== -1 && wInfo.weekendType !== 'SPRINT') {
        report.eventIsolationAudit.sprintTypeMismatches.push({
          predictionId: pid,
          roundId: pRid,
          weekendId: rInfo.raceWeekendId,
          weekendType: wInfo.weekendType
        });
      }
    }

    const groupKey = pUid + '__' + pRid;
    if (!predGrouping[groupKey]) {
      predGrouping[groupKey] = [];
    }
    predGrouping[groupKey].push({
      rowIndex: p + 1,
      predictionId: pid,
      userId: pUid,
      roundId: pRid,
      predictionData: pData,
      submittedAt: pSubmittedAt,
      updatedAt: pUpdatedAt
    });

    if (roundMap[pRid] && (roundMap[pRid].status === 'SCORED' || resultMap[pRid])) {
      const scores = scoreMap[groupKey];
      if (!scores || scores.length === 0) {
        report.scoringAudit.unscoredCompletedPredictions.push({
          predictionId: pid,
          userId: pUid,
          roundId: pRid,
          reason: 'Round is marked SCORED but prediction has no persisted score row'
        });
      } else if (resultMap[pRid] && pData) {
        try {
          const expected = computeScore(pData, resultMap[pRid]);
          if (expected.totalScore !== scores[0].totalScore) {
            report.scoringAudit.scoreDivergences.push({
              predictionId: pid,
              userId: pUid,
              roundId: pRid,
              persistedScore: scores[0].totalScore,
              recalculatedScore: expected.totalScore
            });
          }
        } catch (e) {}
      }
    }
  }

  Object.keys(predGrouping).forEach(function(key) {
    const list = predGrouping[key];
    if (list.length > 1) {
      list.sort(function(a, b) { return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(); });
      const canonical = list[0];
      const obsolete = list.slice(1);
      report.duplicatePredictionsAudit.duplicateGroups.push({
        groupKey: key,
        userId: canonical.userId,
        roundId: canonical.roundId,
        count: list.length,
        canonicalPredictionId: canonical.predictionId,
        obsoletePredictionIds: obsolete.map(function(o) { return o.predictionId; })
      });
      report.duplicatePredictionsAudit.totalDuplicates += (list.length - 1);
    }
  });

  const ntfSheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATION_QUEUE);
  if (ntfSheet) {
    const ntfRows = ntfSheet.getDataRange().getValues();
    const seenKeys = {};
    for (let n = 1; n < ntfRows.length; n++) {
      const nKey = String(ntfRows[n][7] || '').trim();
      if (nKey) {
        if (seenKeys[nKey]) {
          report.notificationAudit.duplicateQueueKeys.push({ rowIndex: n + 1, idempotencyKey: nKey });
        } else {
          seenKeys[nKey] = true;
        }
      }
    }
  }

  report.summary.eventIsolationDefects = report.eventIsolationAudit.unknownRoundPredictions.length +
    report.eventIsolationAudit.sprintTypeMismatches.length +
    report.eventIsolationAudit.malformedRoundIds.length;
  report.summary.duplicatePredictionDefects = report.duplicatePredictionsAudit.totalDuplicates;
  report.summary.scoringDefects = report.scoringAudit.unscoredCompletedPredictions.length +
    report.scoringAudit.orphanedScores.length +
    report.scoringAudit.scoreDivergences.length;
  report.summary.notificationDefects = report.notificationAudit.duplicateQueueKeys.length;
  report.summary.totalDefects = report.summary.userDefects +
    report.summary.eventIsolationDefects +
    report.summary.duplicatePredictionDefects +
    report.summary.scoringDefects +
    report.summary.notificationDefects;

  if (!dryRun) {
    const ts = Utilities.formatDate(new Date(), 'UTC', "yyyyMMdd'_'HHmmss");

    const sheetsToBackup = [SHEET_NAMES.USERS, SHEET_NAMES.PREDICTIONS, SHEET_NAMES.SCORES, SHEET_NAMES.RESULTS];
    sheetsToBackup.forEach(function(sName) {
      const src = ss.getSheetByName(sName);
      if (src) {
        const backupName = sName + '_Backup_' + ts;
        const backupSheet = ss.insertSheet(backupName);
        const data = src.getDataRange().getValues();
        if (data.length > 0 && data[0].length > 0) {
          backupSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
        }
        report.remediation.backupSheetsCreated.push(backupName);
      }
    });

    if (report.userAudit.duplicateGroups.length > 0) {
      const userRemediationRes = auditAndDeduplicateUsers(false);
      report.remediation.usersConsolidated = userRemediationRes.consolidatedCount || 0;
      report.remediation.notes.push('Consolidated ' + report.remediation.usersConsolidated + ' duplicate user records.');
    }

    if (report.duplicatePredictionsAudit.duplicateGroups.length > 0 && predSheet) {
      const obsoleteRowIndices = [];
      report.duplicatePredictionsAudit.duplicateGroups.forEach(function(g) {
        const list = predGrouping[g.groupKey];
        if (list && list.length > 1) {
          for (let oi = 1; oi < list.length; oi++) {
            obsoleteRowIndices.push(list[oi].rowIndex);
          }
        }
      });

      obsoleteRowIndices.sort(function(a, b) { return b - a; });
      obsoleteRowIndices.forEach(function(rIdx) {
        predSheet.deleteRow(rIdx);
      });
      report.remediation.predictionsDeduplicated = obsoleteRowIndices.length;
      report.remediation.notes.push('Pruned ' + obsoleteRowIndices.length + ' obsolete duplicate prediction rows.');
    }

    const uSheet = ss.getSheetByName(SHEET_NAMES.USERS);
    const freshScoresSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
    if (uSheet && freshScoresSheet) {
      const fScoreRows = freshScoresSheet.getDataRange().getValues();
      const userPointsSum = {};
      for (let fs = 1; fs < fScoreRows.length; fs++) {
        const uid = String(fScoreRows[fs][1] || '').trim();
        const pts = Number(fScoreRows[fs][4]) || 0;
        if (uid) {
          userPointsSum[uid] = (userPointsSum[uid] || 0) + pts;
        }
      }

      const uRows = uSheet.getDataRange().getValues();
      const uHeaders = uRows[0];
      const ptsColIdx = uHeaders.indexOf('totalPoints') !== -1 ? uHeaders.indexOf('totalPoints') : 8;

      let reconciledUsers = 0;
      for (let ur = 1; ur < uRows.length; ur++) {
        const uid = String(uRows[ur][0] || '').trim();
        const currentPts = Number(uRows[ur][ptsColIdx]) || 0;
        const verifiedPts = userPointsSum[uid] || 0;
        if (currentPts !== verifiedPts) {
          uSheet.getRange(ur + 1, ptsColIdx + 1).setValue(verifiedPts);
          reconciledUsers++;
        }
      }
      report.remediation.scoresReconciled = reconciledUsers;
      report.remediation.notes.push('Reconciled total points for ' + reconciledUsers + ' user accounts with authoritative verified scores.');
    }
  }

  report.durationMs = Date.now() - startTime;
  Logger.log('[PLATFORM_AUDIT_COMPLETE] DryRun: ' + dryRun + ', Total Defects: ' + report.summary.totalDefects + ', Duration: ' + report.durationMs + 'ms');
  return report;
}

/**
 * =========================================================================
 * THE GRID — MOTORSPORT FAN IDENTITY QUIZ ENGINE
 * =========================================================================
 */

function handleGetQuizCategories() {
  const categories = [
    { id: 'formula-1', displayName: 'Formula 1', grouping: 'Formula Racing', description: 'The pinnacle of open-wheel single-seater motorsport governed by the FIA.', status: 'available', questionBankRef: 'formula-1', color: '#e10600', badge: 'F1' },
    { id: 'formula-2', displayName: 'Formula 2', grouping: 'Formula Racing', description: 'The ultimate feeder championship with spec Dallara chassis and Mecachrome engines.', status: 'available', questionBankRef: 'formula-2', color: '#0090d0', badge: 'F2' },
    { id: 'formula-3', displayName: 'Formula 3', grouping: 'Formula Racing', description: 'High-intensity 30-car junior battles on Grand Prix weekends.', status: 'available', questionBankRef: 'formula-3', color: '#e03a3e', badge: 'F3' },
    { id: 'formula-4', displayName: 'Formula 4', grouping: 'Formula Racing', description: 'The global entry-level single-seater category bridging karting to professional racing.', status: 'available', questionBankRef: 'formula-4', color: '#10b981', badge: 'F4' },
    { id: 'formula-e', displayName: 'Formula E', grouping: 'Formula Racing', description: 'The premier all-electric FIA world championship racing on tight city circuits.', status: 'available', questionBankRef: 'formula-e', color: '#00d2be', badge: 'FE' },
    { id: 'motogp', displayName: 'MotoGP', grouping: 'Motorcycle Racing', description: 'The pinnacle of two-wheeled motorcycle prototype road racing governed by FIM.', status: 'available', questionBankRef: 'motogp', color: '#dc2626', badge: 'MotoGP' },
    { id: 'endurance-racing', displayName: 'Endurance Racing', grouping: 'Endurance Racing', description: 'Multi-class sports prototype & GT endurance racing, headlined by Le Mans & FIA WEC.', status: 'available', questionBankRef: 'endurance-racing', color: '#2563eb', badge: 'WEC' },
    { id: 'gt-racing', displayName: 'GT Racing', grouping: 'GT Racing', description: 'Customer and manufacturer GT3/GT4 racing across premier sprint & endurance cups worldwide.', status: 'available', questionBankRef: 'gt-racing', color: '#f59e0b', badge: 'GT3' }
  ];

  return categories.map(function(c) {
    return {
      id: c.id,
      displayName: c.displayName,
      grouping: c.grouping,
      description: c.description,
      status: c.status,
      questionBankRef: c.questionBankRef,
      color: c.color,
      badge: c.badge,
      availableQuestions: 15
    };
  });
}

function handleStartQuizAttempt(payload) {
  const reqUserId = payload.userId ? String(payload.userId).trim() : '';
  if (!reqUserId || reqUserId === 'guest_user') {
    throw new Error('Authentication required: You must be signed in to take the Motorsport Fan Identity Quiz.');
  }

  // Authoritatively verify user existence in database
  const userProfile = getUserProfile(reqUserId);
  if (!userProfile || !userProfile.userId) {
    throw new Error('User not found or session expired. Please sign in to start your quiz attempt.');
  }
  const canonicalUserId = userProfile.userId;

  const categoryIds = payload.categoryIds || [];
  if (!categoryIds || categoryIds.length === 0) {
    throw new Error('Please select at least one motorsport category.');
  }

  const diffLevel = (payload.difficultyLevel || 'apex').toLowerCase();
  const normalizedDiff = (diffLevel === 'rookie' || diffLevel === 'easy') ? 'rookie' : (diffLevel === 'race_analyst' || diffLevel === 'hard') ? 'race_analyst' : 'apex';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let questions = getBackendApprovedQuestions();

  // Filter questions by difficulty ceiling
  questions = questions.filter(function(q) {
    const qDiff = (q.difficulty || 'medium').toLowerCase();
    const isRookie = (qDiff === 'easy' || qDiff === 'rookie');
    const isApex = (qDiff === 'medium' || qDiff === 'apex');
    if (normalizedDiff === 'rookie') return isRookie;
    if (normalizedDiff === 'apex') return isRookie || isApex;
    return true; // race_analyst ceiling permits all
  });

  const selectedCatSet = {};
  categoryIds.forEach(function(c) { selectedCatSet[c] = true; });

  const catPools = {};
  categoryIds.forEach(function(c) { catPools[c] = []; });
  questions.forEach(function(q) {
    if (selectedCatSet[q.categoryId]) {
      catPools[q.categoryId].push(q);
    }
  });

  // Balanced allocation up to 20 questions max
  const totalSlots = 20;
  const numCats = categoryIds.length;
  const basePerCat = Math.floor(totalSlots / numCats);
  const remainder = totalSlots % numCats;

  const chosenQuestions = [];
  categoryIds.forEach(function(catId, idx) {
    const quota = basePerCat + (idx < remainder ? 1 : 0);
    const pool = catPools[catId] || [];
    const shuffled = pool.slice().sort(function() { return 0.5 - Math.random(); });
    const selected = shuffled.slice(0, quota);
    selected.forEach(function(q) { chosenQuestions.push(q); });
  });

  const finalQuestions = chosenQuestions.sort(function() { return 0.5 - Math.random(); });
  const attemptId = 'attempt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const startedAt = new Date().toISOString();

  // Persist attempt in QuizAttempts sheet if available
  const attemptsSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  if (attemptsSheet) {
    const qIds = finalQuestions.map(function(q) { return q.questionId; });
    attemptsSheet.appendRow([
      attemptId,
      canonicalUserId,
      JSON.stringify(categoryIds),
      JSON.stringify(qIds),
      JSON.stringify({}),
      0,
      finalQuestions.length,
      0,
      'The Rookie',
      JSON.stringify({}),
      startedAt,
      '',
      'in_progress',
      normalizedDiff
    ]);
  }

  // Strictly strip correctOptionId and explanation before returning to client
  const clientQuestions = finalQuestions.map(function(q) {
    return {
      questionId: q.questionId,
      categoryId: q.categoryId,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      topic: q.topic,
      contentVersion: q.contentVersion,
      context: q.context
    };
  });

  return {
    attemptId: attemptId,
    totalQuestions: finalQuestions.length,
    selectedCategories: categoryIds,
    difficultyLevel: normalizedDiff,
    questions: clientQuestions,
    startedAt: startedAt
  };
}

function handleSubmitQuizAttempt(payload) {
  const attemptId = payload.attemptId;
  const reqUserId = payload.userId ? String(payload.userId).trim() : '';
  const answers = payload.answers || {};

  if (!reqUserId || reqUserId === 'guest_user') {
    throw new Error('Authentication required: You must be signed in to submit your quiz attempt.');
  }

  const userProfile = getUserProfile(reqUserId);
  if (!userProfile || !userProfile.userId) {
    throw new Error('User not found or session expired. Please sign in to submit your quiz attempt.');
  }
  const canonicalUserId = userProfile.userId;

  if (!attemptId) {
    throw new Error('Missing attempt ID.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const attemptsSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  let attemptRowIndex = -1;
  let attemptData = null;

  if (attemptsSheet) {
    const rows = attemptsSheet.getDataRange().getValues();
    for (let r = 1; r < rows.length; r++) {
      if (String(rows[r][0] || '').trim() === attemptId) {
        attemptRowIndex = r + 1;
        attemptData = {
          attemptId: rows[r][0],
          userId: rows[r][1],
          selectedCategories: JSON.parse(rows[r][2] || '[]'),
          questionIds: JSON.parse(rows[r][3] || '[]'),
          submittedAnswers: JSON.parse(rows[r][4] || '{}'),
          score: Number(rows[r][5]) || 0,
          totalQuestions: Number(rows[r][6]) || 0,
          percentage: Number(rows[r][7]) || 0,
          fanIdentityTier: rows[r][8],
          categoryBreakdown: JSON.parse(rows[r][9] || '{}'),
          startedAt: rows[r][10],
          completedAt: rows[r][11],
          status: rows[r][12],
          difficultyLevel: rows[r][13] || 'apex'
        };
        break;
      }
    }
  }

  // Enforce ownership: reject submission if attempt belongs to someone else
  if (attemptData && attemptData.userId && attemptData.userId !== canonicalUserId) {
    throw new Error('Unauthorized: You do not own this quiz attempt.');
  }

  // Idempotency: if already completed, return existing immutable completed result
  if (attemptData && attemptData.status === 'completed' && attemptData.completedAt) {
    return formatBackendQuizAttemptResult(attemptData);
  }

  const qBank = getBackendApprovedQuestions();
  const qMap = {};
  qBank.forEach(function(q) { qMap[q.questionId] = q; });

  const questionIds = attemptData ? attemptData.questionIds : Object.keys(answers);
  const selectedCategories = attemptData ? attemptData.selectedCategories : [];

  let totalScore = 0;
  const scoredQuestions = [];
  const categoryStats = {};

  questionIds.forEach(function(qId) {
    const q = qMap[qId];
    if (!q) return;

    const userOption = answers[qId] || null;
    const isCorrect = Boolean(userOption && userOption === q.correctOptionId);
    if (isCorrect) totalScore++;

    if (!categoryStats[q.categoryId]) {
      categoryStats[q.categoryId] = { correct: 0, total: 0, name: q.categoryId };
    }
    categoryStats[q.categoryId].total++;
    if (isCorrect) categoryStats[q.categoryId].correct++;

    scoredQuestions.push({
      questionId: q.questionId,
      categoryId: q.categoryId,
      categoryName: q.categoryId,
      question: q.question,
      options: q.options,
      selectedOptionId: userOption,
      correctOptionId: q.correctOptionId,
      isCorrect: isCorrect,
      explanation: q.explanation,
      sourceUrl: q.sourceUrl,
      context: q.context,
      contentVersion: q.contentVersion,
      difficulty: q.difficulty,
      topic: q.topic
    });
  });

  const totalQuestions = questionIds.length;
  const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  let fanIdentityTier = 'The Rookie';
  if (overallPercentage >= 95) fanIdentityTier = 'The Motorsport Oracle';
  else if (overallPercentage >= 80) fanIdentityTier = 'The Race Strategist';
  else if (overallPercentage >= 60) fanIdentityTier = 'The Paddock Insider';
  else if (overallPercentage >= 40) fanIdentityTier = 'The Enthusiast';

  const categoryBreakdown = {};
  Object.keys(categoryStats).forEach(function(catId) {
    const stat = categoryStats[catId];
    categoryBreakdown[catId] = {
      categoryId: catId,
      categoryName: stat.name,
      correct: stat.correct,
      total: stat.total,
      percentage: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
    };
  });

  const completedAt = new Date().toISOString();

  // Persist updated attempt
  if (attemptsSheet && attemptRowIndex > 0) {
    attemptsSheet.getRange(attemptRowIndex, 5).setValue(JSON.stringify(answers));
    attemptsSheet.getRange(attemptRowIndex, 6).setValue(totalScore);
    attemptsSheet.getRange(attemptRowIndex, 7).setValue(totalQuestions);
    attemptsSheet.getRange(attemptRowIndex, 8).setValue(overallPercentage);
    attemptsSheet.getRange(attemptRowIndex, 9).setValue(fanIdentityTier);
    attemptsSheet.getRange(attemptRowIndex, 10).setValue(JSON.stringify(categoryBreakdown));
    attemptsSheet.getRange(attemptRowIndex, 12).setValue(completedAt);
    attemptsSheet.getRange(attemptRowIndex, 13).setValue('completed');
  }

  // Evaluate & award quiz achievements on backend (strictly once per user)
  const newlyAwarded = evaluateBackendQuizAchievements(canonicalUserId, overallPercentage, categoryBreakdown);

  return {
    attemptId: attemptId,
    userId: canonicalUserId,
    selectedCategories: selectedCategories,
    difficultyLevel: attemptData ? (attemptData.difficultyLevel || 'apex') : 'apex',
    score: totalScore,
    totalQuestions: totalQuestions,
    percentage: overallPercentage,
    fanIdentityTier: fanIdentityTier,
    categoryBreakdown: categoryBreakdown,
    startedAt: attemptData ? attemptData.startedAt : completedAt,
    completedAt: completedAt,
    questions: scoredQuestions,
    newlyAwardedAchievements: newlyAwarded
  };
}

function evaluateBackendQuizAchievements(userId, currentPercentage, categoryBreakdown) {
  if (!userId || userId === 'guest_user') return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const achSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ACHIEVEMENTS);
  const attemptsSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  if (!achSheet || !attemptsSheet) return [];

  // 1. Get user's existing earned achievements
  const existingRows = achSheet.getDataRange().getValues();
  const existingSet = {};
  for (let i = 1; i < existingRows.length; i++) {
    if (String(existingRows[i][1] || '').trim() === userId) {
      existingSet[String(existingRows[i][2] || '').trim()] = true;
    }
  }

  // 2. Query all completed attempts for this user
  const attRows = attemptsSheet.getDataRange().getValues();
  let completedCount = 0;
  let maxScorePct = currentPercentage || 0;
  const categoriesSeen = {};
  if (categoryBreakdown) {
    Object.keys(categoryBreakdown).forEach(function(c) { categoriesSeen[c] = true; });
  }

  for (let r = 1; r < attRows.length; r++) {
    if (String(attRows[r][1] || '').trim() === userId && String(attRows[r][12] || '').trim() === 'completed') {
      completedCount++;
      const p = Number(attRows[r][7]) || 0;
      if (p > maxScorePct) maxScorePct = p;
      try {
        const cats = JSON.parse(attRows[r][2] || '[]');
        cats.forEach(function(c) { categoriesSeen[c] = true; });
      } catch (_e) {}
    }
  }

  const distinctCatCount = Object.keys(categoriesSeen).length;
  const newlyEarned = [];
  const nowIso = new Date().toISOString();

  // Rule definitions
  const rules = [
    { id: 'first-lap', title: 'First Lap', description: 'Complete your first motorsport knowledge quiz on GRDX.', icon: '🏁', color: '#10b981', qualifies: completedCount >= 1 },
    { id: 'consistent-racer', title: 'Consistent Racer', description: 'Complete five official motorsport knowledge quizzes.', icon: '⚡', color: '#00d2be', qualifies: completedCount >= 5 },
    { id: 'podium-performance', title: 'Podium Performance', description: 'Score 80% or higher on an official motorsport quiz attempt.', icon: '🏆', color: '#eab308', qualifies: maxScorePct >= 80 },
    { id: 'motorsport-oracle', title: 'Motorsport Oracle', description: 'Reach the pinnacle of motorsport knowledge with a score of 95% or higher.', icon: '🔮', color: '#b966ff', qualifies: maxScorePct >= 95 },
    { id: 'all-rounder', title: 'All-Rounder', description: 'Complete quizzes across at least three distinct motorsport categories.', icon: '🌐', color: '#f43f5e', qualifies: distinctCatCount >= 3 }
  ];

  rules.forEach(function(rule) {
    if (rule.qualifies && !existingSet[rule.id]) {
      const uAchId = 'qach_' + userId + '_' + rule.id;
      achSheet.appendRow([
        uAchId,
        userId,
        rule.id,
        rule.title,
        rule.description,
        rule.icon,
        rule.color,
        nowIso,
        1
      ]);
      existingSet[rule.id] = true;
      newlyEarned.push({
        achievementId: rule.id,
        userId: userId,
        title: rule.title,
        description: rule.description,
        badgeIcon: rule.icon,
        badgeColor: rule.color,
        earnedAt: nowIso,
        ruleVersion: 1,
        isUnlocked: true
      });
    }
  });

  return newlyEarned;
}

function handleGetUserQuizAchievements(userId) {
  if (!userId || userId === 'guest_user') return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const achSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ACHIEVEMENTS);
  if (!achSheet) return [];

  const rows = achSheet.getDataRange().getValues();
  const achievements = [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1] || '').trim() === userId) {
      achievements.push({
        userAchievementId: rows[i][0],
        userId: rows[i][1],
        achievementId: rows[i][2],
        title: rows[i][3],
        description: rows[i][4],
        badgeIcon: rows[i][5],
        badgeColor: rows[i][6],
        earnedAt: rows[i][7],
        ruleVersion: Number(rows[i][8]) || 1,
        isUnlocked: true
      });
    }
  }
  return achievements;
}

function handleGetUserQuizHistory(userId) {
  if (!userId || userId === 'guest_user') return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const history = [];

  for (let r = 1; r < rows.length; r++) {
    const rowUid = String(rows[r][1] || '').trim();
    const status = String(rows[r][12] || '').trim();
    // Strictly return only records for the authenticated userId
    if (status === 'completed' && rowUid === userId) {
      history.push({
        attemptId: rows[r][0],
        userId: rows[r][1],
        selectedCategories: JSON.parse(rows[r][2] || '[]'),
        questionIds: JSON.parse(rows[r][3] || '[]'),
        submittedAnswers: JSON.parse(rows[r][4] || '{}'),
        score: Number(rows[r][5]) || 0,
        totalQuestions: Number(rows[r][6]) || 0,
        percentage: Number(rows[r][7]) || 0,
        fanIdentityTier: rows[r][8],
        categoryBreakdown: JSON.parse(rows[r][9] || '{}'),
        startedAt: rows[r][10],
        completedAt: rows[r][11],
        status: status,
        difficultyLevel: rows[r][13] || 'apex'
      });
    }
  }

  return history.sort(function(a, b) {
    return new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime();
  });
}

function handleGetQuizAttemptResult(attemptId, requestingUserId) {
  if (!attemptId) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  if (!sheet) return null;

  const rows = sheet.getDataRange().getValues();
  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][0] || '').trim() === attemptId) {
      const record = {
        attemptId: rows[r][0],
        userId: rows[r][1],
        selectedCategories: JSON.parse(rows[r][2] || '[]'),
        questionIds: JSON.parse(rows[r][3] || '[]'),
        submittedAnswers: JSON.parse(rows[r][4] || '{}'),
        score: Number(rows[r][5]) || 0,
        totalQuestions: Number(rows[r][6]) || 0,
        percentage: Number(rows[r][7]) || 0,
        fanIdentityTier: rows[r][8],
        categoryBreakdown: JSON.parse(rows[r][9] || '{}'),
        startedAt: rows[r][10],
        completedAt: rows[r][11],
        status: rows[r][12],
        difficultyLevel: rows[r][13] || 'apex'
      };

      // Ownership enforcement: check requesting user
      if (requestingUserId && record.userId !== requestingUserId) {
        const u = getUserProfile(requestingUserId);
        if (!u || u.role !== 'admin') {
          throw new Error('Unauthorized: You do not have permission to view this quiz attempt.');
        }
      }

      return formatBackendQuizAttemptResult(record);
    }
  }
  return null;
}

function formatBackendQuizAttemptResult(record) {
  const qBank = getBackendApprovedQuestions();
  const qMap = {};
  qBank.forEach(function(q) { qMap[q.questionId] = q; });

  const scoredQuestions = [];
  (record.questionIds || []).forEach(function(qId) {
    const q = qMap[qId];
    if (!q) return;

    const userOption = (record.submittedAnswers || {})[qId] || null;
    const isCorrect = Boolean(userOption && userOption === q.correctOptionId);

    scoredQuestions.push({
      questionId: q.questionId,
      categoryId: q.categoryId,
      categoryName: q.categoryId,
      question: q.question,
      options: q.options,
      selectedOptionId: userOption,
      correctOptionId: q.correctOptionId,
      isCorrect: isCorrect,
      explanation: q.explanation,
      sourceUrl: q.sourceUrl,
      context: q.context,
      contentVersion: q.contentVersion,
      difficulty: q.difficulty,
      topic: q.topic
    });
  });

  return {
    attemptId: record.attemptId,
    userId: record.userId,
    selectedCategories: record.selectedCategories,
    difficultyLevel: record.difficultyLevel || 'apex',
    score: record.score,
    totalQuestions: record.totalQuestions,
    percentage: record.percentage,
    fanIdentityTier: record.fanIdentityTier,
    categoryBreakdown: record.categoryBreakdown,
    startedAt: record.startedAt,
    completedAt: record.completedAt || record.startedAt,
    questions: scoredQuestions
  };
}

function getBackendApprovedQuestions() {
  // Returns fallback question bank for standalone execution
  return [
    { questionId: 'f1-001', categoryId: 'formula-1', question: 'Under standard FIA Formula 1 Sporting Regulations, what is the minimum race distance for a Grand Prix (excluding the Monaco Grand Prix)?', options: [{ id: 'a', text: '260 kilometres' }, { id: 'b', text: '300 kilometres' }, { id: 'c', text: '305 kilometres' }, { id: 'd', text: '350 kilometres' }], correctOptionId: 'c', explanation: 'Article 5.4 of the FIA F1 Sporting Regulations stipulates that the scheduled race distance for all Grands Prix shall be the least number of complete laps exceeding 305 km, with the sole historical exception of Monaco (approx. 260 km).', difficulty: 'easy', topic: 'Sporting Regulations', contentVersion: 1, sourceUrl: 'https://www.fia.com/regulation/category/110', approvalStatus: 'approved' }
  ];
}

/**
 * =========================================================================
 * STRATEGY ROOM BACKEND HANDLERS
 * =========================================================================
 */

function handleGetStrategyScenarios(mode, category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_SCENARIOS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const scenarios = [];
  for (let r = 1; r < rows.length; r++) {
    const sId = rows[r][0];
    const sMode = rows[r][3];
    const sCategory = rows[r][4];
    const sStatus = rows[r][6];

    if (sStatus !== 'approved') continue;
    if (mode && sMode !== mode) continue;
    if (category && sCategory !== category) continue;

    scenarios.push({
      id: sId,
      version: Number(rows[r][1]) || 1,
      title: rows[r][2],
      mode: sMode,
      category: sCategory,
      difficulty: rows[r][5],
      status: sStatus,
      definition: rows[r][7] ? JSON.parse(rows[r][7]) : null
    });
  }

  return scenarios;
}

function handleStartStrategyAttempt(payload) {
  const attemptId = payload.attemptId || ('strat_att_' + new Date().getTime());
  const userId = payload.userId;
  if (!userId) throw new Error('userId is required');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.STRATEGY_ATTEMPTS);
    sheet.appendRow([
      'attemptId', 'userId', 'scenarioId', 'scenarioVersion', 'simulationVersion',
      'mode', 'status', 'startedAt', 'completedAt', 'score', 'maxScore', 'pointsAwarded'
    ]);
  }

  sheet.appendRow([
    attemptId,
    userId,
    payload.scenarioId,
    payload.scenarioVersion || 1,
    1,
    payload.mode || 'challenge',
    'in_progress',
    payload.startedAt || new Date().toISOString(),
    '',
    0,
    100,
    0
  ]);

  return { success: true, attemptId: attemptId };
}

function handleSubmitStrategyDecision(payload) {
  const attemptId = payload.attemptId;
  if (!attemptId) throw new Error('attemptId is required');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_DECISIONS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.STRATEGY_DECISIONS);
    sheet.appendRow([
      'decisionId', 'attemptId', 'stepIndex', 'actionId',
      'timeDeltaSeconds', 'positionDelta', 'decisionScore', 'explanation', 'submittedAt'
    ]);
  }

  const decisionId = 'dec_' + new Date().getTime();
  sheet.appendRow([
    decisionId,
    attemptId,
    payload.stepIndex || 0,
    payload.actionId,
    payload.timeDeltaSeconds || 0,
    payload.positionDelta || 0,
    payload.decisionScore || 0,
    payload.explanation || '',
    payload.submittedAt || new Date().toISOString()
  ]);

  return { success: true, decisionId: decisionId };
}

function handleCompleteStrategyAttempt(payload) {
  const attemptId = payload.attemptId;
  const userId = payload.userId;
  if (!attemptId || !userId) throw new Error('attemptId and userId are required');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Server busy: could not acquire lock for attempt completion');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.STRATEGY_ATTEMPTS);
      sheet.appendRow([
        'attemptId', 'userId', 'scenarioId', 'scenarioVersion', 'simulationVersion',
        'mode', 'status', 'startedAt', 'completedAt', 'score', 'maxScore', 'pointsAwarded'
      ]);
    }

    const rows = sheet.getDataRange().getValues();
    let targetRow = -1;
    let existingStatus = '';
    let existingPoints = 0;

    for (let r = 1; r < rows.length; r++) {
      if (String(rows[r][0] || '').trim() === attemptId) {
        targetRow = r + 1;
        existingStatus = rows[r][6];
        existingPoints = Number(rows[r][11]) || 0;
        break;
      }
    }

    // IDEMPOTENCY: If already completed, return existing without re-awarding points
    if (existingStatus === 'completed') {
      return {
        success: true,
        attemptId: attemptId,
        alreadyCompleted: true,
        pointsAwarded: existingPoints
      };
    }

    const completedAt = payload.completedAt || new Date().toISOString();
    const score = Number(payload.score) || 0;
    const maxScore = Number(payload.maxScore) || 100;
    const pointsAwarded = Number(payload.pointsAwarded) || score;

    if (targetRow > 0) {
      sheet.getRange(targetRow, 7).setValue('completed');
      sheet.getRange(targetRow, 9).setValue(completedAt);
      sheet.getRange(targetRow, 10).setValue(score);
      sheet.getRange(targetRow, 11).setValue(maxScore);
      sheet.getRange(targetRow, 12).setValue(pointsAwarded);
    } else {
      sheet.appendRow([
        attemptId,
        userId,
        payload.scenarioId || 'unknown',
        1,
        1,
        payload.mode || 'challenge',
        'completed',
        payload.startedAt || completedAt,
        completedAt,
        score,
        maxScore,
        pointsAwarded
      ]);
    }

    return {
      success: true,
      attemptId: attemptId,
      score: score,
      pointsAwarded: pointsAwarded
    };
  } finally {
    lock.releaseLock();
  }
}

function handleGetStrategyAttempt(attemptId, requestingUserId) {
  if (!attemptId) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
  if (!sheet) return null;

  const rows = sheet.getDataRange().getValues();
  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][0] || '').trim() === attemptId) {
      const record = {
        attemptId: rows[r][0],
        userId: rows[r][1],
        scenarioId: rows[r][2],
        scenarioVersion: Number(rows[r][3]) || 1,
        simulationVersion: Number(rows[r][4]) || 1,
        mode: rows[r][5],
        status: rows[r][6],
        startedAt: rows[r][7],
        completedAt: rows[r][8],
        score: Number(rows[r][9]) || 0,
        maxScore: Number(rows[r][10]) || 100,
        pointsAwarded: Number(rows[r][11]) || 0
      };

      if (requestingUserId && record.userId !== requestingUserId) {
        const u = getUserProfile(requestingUserId);
        if (!u || u.role !== 'admin') {
          throw new Error('Unauthorized: You do not have permission to view this strategy attempt.');
        }
      }

      return record;
    }
  }
  return null;
}

function handleGetStrategyHistory(userId) {
  if (!userId) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const history = [];

  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][1] || '').trim() === userId) {
      history.push({
        attemptId: rows[r][0],
        userId: rows[r][1],
        scenarioId: rows[r][2],
        scenarioVersion: Number(rows[r][3]) || 1,
        mode: rows[r][5],
        status: rows[r][6],
        startedAt: rows[r][7],
        completedAt: rows[r][8],
        score: Number(rows[r][9]) || 0,
        maxScore: Number(rows[r][10]) || 100,
        pointsAwarded: Number(rows[r][11]) || 0
      });
    }
  }

  return history.sort(function(a, b) {
    return new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime();
  });
}

function handleGetStrategyLeaderboard(periodKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_LEADERBOARD);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const entries = [];
  for (let r = 1; r < rows.length; r++) {
    const rowPeriod = rows[r][1];
    if (periodKey && periodKey !== 'all_time' && rowPeriod !== periodKey) continue;

    entries.push({
      userId: rows[r][0],
      periodKey: rowPeriod,
      totalPoints: Number(rows[r][2]) || 0,
      completedAttempts: Number(rows[r][3]) || 0,
      averageScore: Number(rows[r][4]) || 0,
      updatedAt: rows[r][5]
    });
  }

  return entries.sort(function(a, b) {
    return b.totalPoints - a.totalPoints;
  }).map(function(e, i) {
    e.rank = i + 1;
    return e;
  });
}

function handleGetStrategyPerformance(userId) {
  const history = handleGetStrategyHistory(userId);
  const completed = history.filter(function(h) { return h.status === 'completed'; });
  const scores = completed.map(function(h) { return h.score; });
  const totalPoints = completed.reduce(function(sum, h) { return sum + (h.pointsAwarded || 0); }, 0);
  const avgScore = scores.length > 0 ? (scores.reduce(function(a, b) { return a + b; }, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max.apply(null, scores) : 0;

  return {
    userId: userId,
    totalPoints: totalPoints,
    totalAttempts: history.length,
    completedScenariosCount: completed.length,
    averageScore: Math.round(avgScore * 10) / 10,
    bestScore: bestScore,
    recentAttempts: history.slice(0, 5)
  };
}

/**
 * =========================================================================
 * PRE-RACE STRATEGY BACKEND HANDLERS
 * =========================================================================
 */

function handleGetPreRaceRounds(scenarioId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ROUNDS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const list = [];
  for (let r = 1; r < rows.length; r++) {
    if (!scenarioId || rows[r][1] === scenarioId) {
      list.push({
        roundId: rows[r][0],
        scenarioId: rows[r][1],
        scenarioVersion: Number(rows[r][2]) || 1,
        openingTime: rows[r][3],
        deadlineTime: rows[r][4],
        durationMinutes: Number(rows[r][5]) || 15,
        status: rows[r][6]
      });
    }
  }
  return list;
}

function handleGetPreRaceDiscussions(roundId) {
  if (!roundId) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_DISCUSSIONS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const comments = [];
  for (let r = 1; r < rows.length; r++) {
    if (rows[r][1] === roundId) {
      comments.push({
        commentId: rows[r][0],
        roundId: rows[r][1],
        userId: rows[r][2],
        username: rows[r][3],
        displayName: rows[r][4],
        comment: rows[r][5],
        timestamp: rows[r][6],
        planPreference: rows[r][7] || 'custom'
      });
    }
  }
  return comments.sort(function(a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

function handleGetPreRaceVotes(roundId) {
  if (!roundId) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_VOTES);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const votes = [];
  for (let r = 1; r < rows.length; r++) {
    if (rows[r][1] === roundId) {
      votes.push({
        voteId: rows[r][0],
        roundId: rows[r][1],
        userId: rows[r][2],
        planId: rows[r][3],
        timestamp: rows[r][4]
      });
    }
  }
  return votes;
}

function handlePostPreRaceDiscussion(payload) {
  if (!payload.roundId || !payload.comment) {
    throw new Error('roundId and comment are required');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_DISCUSSIONS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.STRATEGY_DISCUSSIONS);
    sheet.appendRow([
      'commentId', 'roundId', 'userId', 'username', 'displayName', 'comment', 'timestamp', 'planPreference'
    ]);
  }

  const commentId = 'comm_' + new Date().getTime();
  const timestamp = new Date().toISOString();

  sheet.appendRow([
    commentId,
    payload.roundId,
    payload.userId || 'anonymous',
    payload.username || 'Strategist',
    payload.displayName || 'Strategist',
    payload.comment.trim(),
    timestamp,
    payload.planPreference || 'custom'
  ]);

  return { success: true, commentId: commentId, timestamp: timestamp };
}

function handlePostPreRaceVote(payload) {
  if (!payload.roundId || !payload.userId || !payload.planId) {
    throw new Error('roundId, userId, and planId are required');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_VOTES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.STRATEGY_VOTES);
    sheet.appendRow(['voteId', 'roundId', 'userId', 'planId', 'timestamp']);
  }

  const voteId = 'vote_' + new Date().getTime() + '_' + payload.userId;
  const timestamp = new Date().toISOString();

  sheet.appendRow([voteId, payload.roundId, payload.userId, payload.planId, timestamp]);
  return { success: true, voteId: voteId };
}

function handleCommitPreRaceStrategy(payload) {
  const attemptId = payload.attemptId;
  const userId = payload.userId;
  const scenarioId = payload.scenarioId;
  if (!attemptId || !userId || !scenarioId) {
    throw new Error('attemptId, userId, and scenarioId are required');
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error('Server busy: could not acquire lock for pre-race strategy commit');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.STRATEGY_ATTEMPTS);
      sheet.appendRow([
        'attemptId', 'userId', 'scenarioId', 'scenarioVersion', 'simulationVersion',
        'mode', 'status', 'startedAt', 'completedAt', 'score', 'maxScore', 'pointsAwarded'
      ]);
    }

    // IDEMPOTENCY CHECK
    const rows = sheet.getDataRange().getValues();
    for (let r = 1; r < rows.length; r++) {
      if (String(rows[r][0] || '').trim() === attemptId) {
        return {
          success: true,
          attemptId: attemptId,
          alreadyCommitted: true,
          score: Number(rows[r][9]) || 0
        };
      }
    }

    const timestamp = new Date().toISOString();
    const score = Number(payload.score) || 0;

    sheet.appendRow([
      attemptId,
      userId,
      scenarioId,
      1,
      1,
      'pre_race_strategy',
      'completed',
      timestamp,
      timestamp,
      score,
      100,
      score
    ]);

    return {
      success: true,
      attemptId: attemptId,
      score: score
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * ADMIN COMPETITION ANALYTICS BACKEND HANDLERS
 * =========================================================================
 */

function assertAdminPrivileges(requesterId, accessToken, authToken) {
  if (!requesterId && !accessToken && !authToken) {
    throw new Error('Unauthorized: Authentication identity required.');
  }

  // Cryptographically verified backend admin session token
  if (authToken) {
    var verifiedAdmin = verifyAdminCaller({ authToken: authToken });
    if (verifiedAdmin && verifiedAdmin.role === 'admin') {
      return true;
    }
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) throw new Error('Forbidden: Users table unavailable.');

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) throw new Error('Forbidden: No users registered.');

  var headers = rows[0];
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).trim()] = c;
  }

  var cleanReq = String(requesterId || '').trim().toLowerCase();
  if (accessToken) {
    var verified = verifyGoogleAccessToken(accessToken);
    if (!verified) {
      throw new Error('Forbidden: Invalid or expired Google OAuth credential.');
    }
    cleanReq = verified.email.trim().toLowerCase();
  }

  var uidCol = colMap['userId'] !== undefined ? colMap['userId'] : 0;
  var emailCol = colMap['email'] !== undefined ? colMap['email'] : 1;
  var usernameCol = colMap['username'] !== undefined ? colMap['username'] : 3;
  var roleCol = colMap['role'] !== undefined ? colMap['role'] : 12;

  for (var i = 1; i < rows.length; i++) {
    var uId = String(rows[i][uidCol] || '').trim().toLowerCase();
    var uEmail = String(rows[i][emailCol] || '').trim().toLowerCase();
    var uName = String(rows[i][usernameCol] || '').trim().toLowerCase();

    if (uId === cleanReq || uEmail === cleanReq || uName === cleanReq) {
      var roleVal = String(rows[i][roleCol] || '').trim().toLowerCase();
      if (roleVal === 'admin') {
        return true;
      }
      break;
    }
  }

  throw new Error('Forbidden: Administrator privileges required to access competition analytics.');
}

function getAdminCompetitionAnalytics(requesterId, accessToken, authToken, timeRange) {
  assertAdminPrivileges(requesterId, accessToken, authToken);

  var selectedRange = timeRange === '7d' || timeRange === '30d' ? timeRange : 'all';
  var nowMs = Date.now();
  var cutoffMs = selectedRange === '7d' ? nowMs - 7 * 86400 * 1000 : (selectedRange === '30d' ? nowMs - 30 * 86400 * 1000 : 0);

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Users
  var allUsers = getAllUsersInternal();
  var userMap = {};
  for (var u = 0; u < allUsers.length; u++) {
    userMap[allUsers[u].userId] = allUsers[u];
  }

  // 2. Quiz Attempts (Racing Tag)
  var quizSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  var quizRows = quizSheet ? quizSheet.getDataRange().getValues() : [];
  var quizAttempts = [];

  for (var qr = 1; qr < quizRows.length; qr++) {
    var qRow = quizRows[qr];
    if (!qRow[0]) continue;
    var qCompletedAt = qRow[11] || qRow[10] || '';
    var qTimeMs = qCompletedAt ? new Date(qCompletedAt).getTime() : 0;
    if (cutoffMs > 0 && qTimeMs > 0 && qTimeMs < cutoffMs) continue;

    quizAttempts.push({
      attemptId: String(qRow[0]),
      userId: String(qRow[1]),
      score: Number(qRow[5]) || 0,
      totalQuestions: Number(qRow[6]) || 10,
      percentage: Number(qRow[7]) || 0,
      fanIdentityTier: String(qRow[8] || 'The Rookie'),
      startedAt: String(qRow[10] || ''),
      completedAt: String(qRow[11] || qRow[10] || ''),
      status: String(qRow[12] || 'completed'),
      difficultyLevel: String(qRow[13] || 'apex')
    });
  }

  // 3. Strategy Attempts (Tactical Room & Pre-Race)
  var stratSheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
  var stratRows = stratSheet ? stratSheet.getDataRange().getValues() : [];
  var stratAttempts = [];

  for (var sr = 1; sr < stratRows.length; sr++) {
    var sRow = stratRows[sr];
    if (!sRow[0]) continue;
    var sCompletedAt = sRow[8] || sRow[7] || '';
    var sTimeMs = sCompletedAt ? new Date(sCompletedAt).getTime() : 0;
    if (cutoffMs > 0 && sTimeMs > 0 && sTimeMs < cutoffMs) continue;

    stratAttempts.push({
      attemptId: String(sRow[0]),
      userId: String(sRow[1]),
      scenarioId: String(sRow[2] || 'scenario'),
      scenarioVersion: Number(sRow[3]) || 1,
      simulationVersion: Number(sRow[4]) || 1,
      mode: String(sRow[5] || 'challenge'),
      status: String(sRow[6] || 'completed'),
      startedAt: String(sRow[7] || ''),
      completedAt: String(sRow[8] || sRow[7] || ''),
      score: Number(sRow[9]) || 0,
      maxScore: Number(sRow[10]) || 100,
      pointsAwarded: Number(sRow[11]) || 0
    });
  }

  // 4. Predictions & Scores
  var predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  var predRows = predSheet ? predSheet.getDataRange().getValues() : [];
  var scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  var scoreRows = scoreSheet ? scoreSheet.getDataRange().getValues() : [];

  var userRoundScores = {};
  for (var scr = 1; scr < scoreRows.length; scr++) {
    var scRow = scoreRows[scr];
    var scUid = String(scRow[1]);
    var scRid = String(scRow[2]);
    var scPts = Number(scRow[4]) || 0;
    if (!userRoundScores[scUid]) userRoundScores[scUid] = {};
    userRoundScores[scUid][scRid] = scPts;
  }

  var predictions = [];
  for (var pr = 1; pr < predRows.length; pr++) {
    var pRow = predRows[pr];
    if (!pRow[0]) continue;
    var pSubmittedAt = pRow[4] || '';
    var pTimeMs = pSubmittedAt ? new Date(pSubmittedAt).getTime() : 0;
    if (cutoffMs > 0 && pTimeMs > 0 && pTimeMs < cutoffMs) continue;

    var pData = {};
    try {
      pData = JSON.parse(pRow[3] || '{}');
    } catch (_e) {}

    var pUid = String(pRow[1]);
    var pRid = String(pRow[2]);
    var isScored = Boolean(userRoundScores[pUid] && userRoundScores[pUid][pRid] !== undefined);
    var pScore = isScored ? userRoundScores[pUid][pRid] : undefined;

    // Check if prediction is complete (has core podium picks)
    var isComplete = Boolean(pData.p1 && pData.p2 && pData.p3);

    predictions.push({
      predictionId: String(pRow[0]),
      userId: pUid,
      roundId: pRid,
      submittedAt: String(pSubmittedAt),
      isComplete: isComplete,
      isScored: isScored,
      score: pScore
    });
  }

  // 5. Build Aggregations
  var uniqueQuizUsers = {};
  var uniqueStratUsers = {};
  var uniquePredUsers = {};
  var allCompetitorUsers = {};
  var activePeriodUsers = {};

  // Racing Tag Metrics
  var quizCompleted = 0;
  var quizIncomplete = 0;
  var diffBreakdown = { rookie: 0, apex: 0, race_analyst: 0 };
  var tierDistribution = {
    'The Rookie': 0,
    'The Enthusiast': 0,
    'The Paddock Insider': 0,
    'The Race Strategist': 0,
    'The Motorsport Oracle': 0
  };
  var quizScoreDist = { '0-49%': 0, '50-69%': 0, '70-84%': 0, '85-100%': 0 };
  var totalQuizScore = 0;
  var totalQuizPercentage = 0;
  var bestQuizScore = 0;
  var bestQuizPercentage = 0;
  var latestQuizDate = null;

  for (var qi = 0; qi < quizAttempts.length; qi++) {
    var qa = quizAttempts[qi];
    uniqueQuizUsers[qa.userId] = true;
    allCompetitorUsers[qa.userId] = true;
    activePeriodUsers[qa.userId] = true;

    if (qa.status === 'completed') {
      quizCompleted++;
      totalQuizScore += qa.score;
      totalQuizPercentage += qa.percentage;
      if (qa.percentage > bestQuizPercentage) bestQuizPercentage = qa.percentage;
      if (qa.score > bestQuizScore) bestQuizScore = qa.score;

      if (qa.percentage < 50) quizScoreDist['0-49%']++;
      else if (qa.percentage < 70) quizScoreDist['50-69%']++;
      else if (qa.percentage < 85) quizScoreDist['70-84%']++;
      else quizScoreDist['85-100%']++;

      var tierKey = qa.fanIdentityTier || 'The Rookie';
      tierDistribution[tierKey] = (tierDistribution[tierKey] || 0) + 1;
    } else {
      quizIncomplete++;
    }

    var diffKey = qa.difficultyLevel === 'rookie' ? 'rookie' : (qa.difficultyLevel === 'race_analyst' ? 'race_analyst' : 'apex');
    diffBreakdown[diffKey] = (diffBreakdown[diffKey] || 0) + 1;

    if (qa.completedAt) {
      if (!latestQuizDate || new Date(qa.completedAt).getTime() > new Date(latestQuizDate).getTime()) {
        latestQuizDate = qa.completedAt;
      }
    }
  }

  // Strategy Room Metrics
  var stratCompleted = 0;
  var stratAbandoned = 0;
  var stratInProgress = 0;
  var roomTypeCounts = { tacticalChallenges: 0, multiStageSimulations: 0, preRaceStrategy: 0, liveRaceStrategy: 0 };
  var stratScoreDist = { '0-49': 0, '50-69': 0, '70-84': 0, '85-100': 0 };
  var scenarioStats = {};
  var totalStratScore = 0;
  var bestStratScore = 0;
  var latestStratDate = null;

  for (var si = 0; si < stratAttempts.length; si++) {
    var sa = stratAttempts[si];
    uniqueStratUsers[sa.userId] = true;
    allCompetitorUsers[sa.userId] = true;
    activePeriodUsers[sa.userId] = true;

    if (sa.status === 'completed') {
      stratCompleted++;
      totalStratScore += sa.score;
      if (sa.score > bestStratScore) bestStratScore = sa.score;

      if (sa.score < 50) stratScoreDist['0-49']++;
      else if (sa.score < 70) stratScoreDist['50-69']++;
      else if (sa.score < 85) stratScoreDist['70-84']++;
      else stratScoreDist['85-100']++;
    } else if (sa.status === 'abandoned') {
      stratAbandoned++;
    } else {
      stratInProgress++;
    }

    if (sa.mode === 'pre_race_strategy') {
      roomTypeCounts.preRaceStrategy++;
    } else if (sa.mode === 'race_simulation') {
      roomTypeCounts.multiStageSimulations++;
    } else {
      roomTypeCounts.tacticalChallenges++;
    }

    if (!scenarioStats[sa.scenarioId]) {
      scenarioStats[sa.scenarioId] = {
        scenarioId: sa.scenarioId,
        title: sa.scenarioId.replace(/[-_]/g, ' ').toUpperCase(),
        mode: sa.mode,
        attempts: 0,
        completed: 0,
        totalScore: 0,
        bestScore: 0
      };
    }
    scenarioStats[sa.scenarioId].attempts++;
    if (sa.status === 'completed') {
      scenarioStats[sa.scenarioId].completed++;
      scenarioStats[sa.scenarioId].totalScore += sa.score;
      if (sa.score > scenarioStats[sa.scenarioId].bestScore) {
        scenarioStats[sa.scenarioId].bestScore = sa.score;
      }
    }

    if (sa.completedAt) {
      if (!latestStratDate || new Date(sa.completedAt).getTime() > new Date(latestStratDate).getTime()) {
        latestStratDate = sa.completedAt;
      }
    }
  }

  var scenarioList = [];
  for (var scId in scenarioStats) {
    var item = scenarioStats[scId];
    scenarioList.push({
      scenarioId: item.scenarioId,
      title: item.title,
      mode: item.mode,
      attempts: item.attempts,
      completed: item.completed,
      avgScore: item.completed > 0 ? Math.round(item.totalScore / item.completed) : 0,
      bestScore: item.bestScore
    });
  }

  // Prediction Metrics
  var predCompleted = 0;
  var predIncomplete = 0;
  var predWeekendStats = {};
  var totalPredScore = 0;
  var scoredPredCount = 0;
  var bestPredScore = 0;
  var predScoreDist = { '0-15 pts': 0, '16-30 pts': 0, '31-45 pts': 0, '46-60 pts': 0 };
  var latestPredDate = null;

  for (var pi = 0; pi < predictions.length; pi++) {
    var prRecord = predictions[pi];
    uniquePredUsers[prRecord.userId] = true;
    allCompetitorUsers[prRecord.userId] = true;
    activePeriodUsers[prRecord.userId] = true;

    if (prRecord.isComplete) predCompleted++;
    else predIncomplete++;

    if (!predWeekendStats[prRecord.roundId]) {
      predWeekendStats[prRecord.roundId] = {
        roundId: prRecord.roundId,
        raceWeekendId: prRecord.roundId,
        grandPrixName: prRecord.roundId.replace(/_/g, ' '),
        submissionsCount: 0,
        scoredCount: 0,
        totalScore: 0,
        highestScore: 0
      };
    }
    predWeekendStats[prRecord.roundId].submissionsCount++;

    if (prRecord.isScored && prRecord.score !== undefined) {
      scoredPredCount++;
      totalPredScore += prRecord.score;
      predWeekendStats[prRecord.roundId].scoredCount++;
      predWeekendStats[prRecord.roundId].totalScore += prRecord.score;
      if (prRecord.score > predWeekendStats[prRecord.roundId].highestScore) {
        predWeekendStats[prRecord.roundId].highestScore = prRecord.score;
      }
      if (prRecord.score > bestPredScore) bestPredScore = prRecord.score;

      if (prRecord.score <= 15) predScoreDist['0-15 pts']++;
      else if (prRecord.score <= 30) predScoreDist['16-30 pts']++;
      else if (prRecord.score <= 45) predScoreDist['31-45 pts']++;
      else predScoreDist['46-60 pts']++;
    }

    if (prRecord.submittedAt) {
      if (!latestPredDate || new Date(prRecord.submittedAt).getTime() > new Date(latestPredDate).getTime()) {
        latestPredDate = prRecord.submittedAt;
      }
    }
  }

  var predWeekendList = [];
  for (var pwId in predWeekendStats) {
    var pw = predWeekendStats[pwId];
    predWeekendList.push({
      raceWeekendId: pw.raceWeekendId,
      grandPrixName: pw.grandPrixName,
      submissionsCount: pw.submissionsCount,
      scoredCount: pw.scoredCount,
      averageScore: pw.scoredCount > 0 ? Math.round(pw.totalScore / pw.scoredCount) : 0,
      highestScore: pw.highestScore
    });
  }

  // User Summaries Table
  var userSummaries = [];
  for (var uIdx = 0; uIdx < allUsers.length; uIdx++) {
    var usr = allUsers[uIdx];
    var uid = usr.userId;

    // Filter user's attempts
    var uQuiz = quizAttempts.filter(function(a) { return a.userId === uid; });
    var uStrat = stratAttempts.filter(function(a) { return a.userId === uid; });
    var uPred = predictions.filter(function(p) { return p.userId === uid; });

    var uQuizCompleted = uQuiz.filter(function(a) { return a.status === 'completed'; });
    var uStratCompleted = uStrat.filter(function(a) { return a.status === 'completed'; });

    var uQuizBestScore = 0;
    var uQuizBestPct = 0;
    var uQuizTier = null;
    for (var uqi = 0; uqi < uQuizCompleted.length; uqi++) {
      if (uQuizCompleted[uqi].percentage > uQuizBestPct) {
        uQuizBestPct = uQuizCompleted[uqi].percentage;
        uQuizBestScore = uQuizCompleted[uqi].score;
        uQuizTier = uQuizCompleted[uqi].fanIdentityTier;
      }
    }

    var uStratBestScore = 0;
    var uStratTotalScore = 0;
    for (var usi = 0; usi < uStratCompleted.length; usi++) {
      uStratTotalScore += uStratCompleted[usi].score;
      if (uStratCompleted[usi].score > uStratBestScore) {
        uStratBestScore = uStratCompleted[usi].score;
      }
    }
    var uStratAvgScore = uStratCompleted.length > 0 ? Math.round(uStratTotalScore / uStratCompleted.length) : 0;

    var uPredPoints = 0;
    var uPredBest = 0;
    for (var upi = 0; upi < uPred.length; upi++) {
      if (uPred[upi].isScored && uPred[upi].score !== undefined) {
        uPredPoints += uPred[upi].score;
        if (uPred[upi].score > uPredBest) uPredBest = uPred[upi].score;
      }
    }

    var lastActivity = null;
    var dates = [];
    uQuiz.forEach(function(a) { if (a.completedAt) dates.push(a.completedAt); });
    uStrat.forEach(function(s) { if (s.completedAt) dates.push(s.completedAt); });
    uPred.forEach(function(p) { if (p.submittedAt) dates.push(p.submittedAt); });
    if (dates.length > 0) {
      dates.sort(function(a, b) { return new Date(b).getTime() - new Date(a).getTime(); });
      lastActivity = dates[0];
    }

    var activeFeatures = (uQuiz.length > 0 ? 1 : 0) + (uStrat.length > 0 ? 1 : 0) + (uPred.length > 0 ? 1 : 0);
    var totalUserCompleted = uQuizCompleted.length + uStratCompleted.length + uPred.length;

    userSummaries.push({
      userId: usr.userId,
      username: usr.username,
      displayName: usr.displayName || usr.username,
      email: usr.email || '',
      avatarUrl: usr.avatarUrl || '',
      createdAt: usr.createdAt || '',
      lastCompetitionActivity: lastActivity,
      racingTagAttempts: uQuiz.length,
      racingTagCompleted: uQuizCompleted.length,
      racingTagBestScore: uQuizBestScore,
      racingTagBestPercentage: uQuizBestPct,
      racingTagTier: uQuizTier,
      strategyAttempts: uStrat.length,
      strategyCompleted: uStratCompleted.length,
      strategyBestScore: uStratBestScore,
      strategyAverageScore: uStratAvgScore,
      predictionSubmissions: uPred.length,
      predictionTotalPoints: uPredPoints,
      predictionBestScore: uPredBest,
      totalAttempts: uQuiz.length + uStrat.length + uPred.length,
      totalCompletedActivities: totalUserCompleted,
      activeFeaturesCount: activeFeatures
    });
  }

  // Sort user summaries by total completed activities desc
  userSummaries.sort(function(a, b) {
    if (b.totalCompletedActivities !== a.totalCompletedActivities) {
      return b.totalCompletedActivities - a.totalCompletedActivities;
    }
    return (b.predictionTotalPoints || 0) - (a.predictionTotalPoints || 0);
  });

  return {
    globalStats: {
      totalRegisteredUsers: allUsers.length,
      uniqueCompetitors: Object.keys(allCompetitorUsers).length,
      usersWithAnyParticipation: Object.keys(allCompetitorUsers).length,
      racingTagParticipants: Object.keys(uniqueQuizUsers).length,
      strategyRoomParticipants: Object.keys(uniqueStratUsers).length,
      predictionParticipants: Object.keys(uniquePredUsers).length,
      totalAttempts: quizAttempts.length + stratAttempts.length + predictions.length,
      totalSubmissionsAndAttempts: quizAttempts.length + stratAttempts.length + predictions.length,
      totalCompletedActivities: quizCompleted + stratCompleted + predCompleted,
      activeInPeriod: Object.keys(activePeriodUsers).length,
      activeParticipantsInPeriod: Object.keys(activePeriodUsers).length,
      participationRate: allUsers.length > 0 ? Math.round((Object.keys(allCompetitorUsers).length / allUsers.length) * 100) : 0,
      timeRange: selectedRange
    },
    racingTag: {
      uniqueUsers: Object.keys(uniqueQuizUsers).length,
      totalAttempts: quizAttempts.length,
      completedAttempts: quizCompleted,
      incompleteAttempts: quizIncomplete,
      difficultyBreakdown: diffBreakdown,
      byDifficulty: diffBreakdown,
      tierDistribution: tierDistribution,
      averageScore: quizCompleted > 0 ? Math.round(totalQuizScore / quizCompleted) : 0,
      averagePercentage: quizCompleted > 0 ? Math.round(totalQuizPercentage / quizCompleted) : 0,
      bestScore: bestQuizScore,
      bestScorePercentage: bestQuizPercentage,
      scoreDistribution: quizScoreDist,
      latestAttemptDate: latestQuizDate,
      recentAttempts: quizAttempts.slice(0, 15).map(function(qa) {
        var u = userMap[qa.userId];
        return {
          attemptId: qa.attemptId,
          userId: qa.userId,
          username: u ? u.username : qa.userId,
          displayName: u ? (u.displayName || u.username) : qa.userId,
          score: qa.score,
          totalQuestions: qa.totalQuestions,
          percentage: qa.percentage,
          fanIdentityTier: qa.fanIdentityTier,
          difficultyLevel: qa.difficultyLevel,
          status: qa.status,
          completedAt: qa.completedAt
        };
      })
    },
    strategyRoom: {
      uniqueUsers: Object.keys(uniqueStratUsers).length,
      totalAttempts: stratAttempts.length,
      completedAttempts: stratCompleted,
      abandonedAttempts: stratAbandoned,
      inProgressAttempts: stratInProgress,
      byRoomType: roomTypeCounts,
      scenariosAttempted: scenarioList,
      averageScore: stratCompleted > 0 ? Math.round(totalStratScore / stratCompleted) : 0,
      bestScore: bestStratScore,
      scoreDistribution: stratScoreDist,
      averageTimeDeltaSeconds: 0,
      averagePositionDelta: 0,
      planPreferences: { plan_a: 0, plan_b: 0, plan_c: 0, custom: 0 },
      latestAttemptDate: latestStratDate,
      recentAttempts: stratAttempts.slice(0, 15).map(function(sa) {
        var u = userMap[sa.userId];
        return {
          attemptId: sa.attemptId,
          userId: sa.userId,
          username: u ? u.username : sa.userId,
          displayName: u ? (u.displayName || u.username) : sa.userId,
          scenarioId: sa.scenarioId,
          scenarioTitle: sa.scenarioId.replace(/[-_]/g, ' ').toUpperCase(),
          mode: sa.mode,
          status: sa.status,
          score: sa.score,
          timeDeltaSeconds: 0,
          positionDelta: 0,
          completedAt: sa.completedAt,
          isCompetitive: true
        };
      })
    },
    predictions: {
      uniqueUsers: Object.keys(uniquePredUsers).length,
      totalSubmissions: predictions.length,
      completedSubmissions: predCompleted,
      incompleteSubmissions: predIncomplete,
      byWeekend: predWeekendList,
      averageScore: scoredPredCount > 0 ? Math.round((totalPredScore / scoredPredCount) * 10) / 10 : 0,
      bestScore: bestPredScore,
      scoreDistribution: predScoreDist,
      latestSubmissionDate: latestPredDate,
      recentSubmissions: predictions.slice(0, 15).map(function(pr) {
        var u = userMap[pr.userId];
        return {
          predictionId: pr.predictionId,
          userId: pr.userId,
          username: u ? u.username : pr.userId,
          displayName: u ? (u.displayName || u.username) : pr.userId,
          roundId: pr.roundId,
          grandPrixName: pr.roundId.replace(/_/g, ' '),
          submittedAt: pr.submittedAt,
          isScored: pr.isScored,
          score: pr.score
        };
      })
    },
    users: userSummaries
  };
}

function getAdminUserCompetitionProfile(requesterId, targetUserId, accessToken, authToken) {
  assertAdminPrivileges(requesterId, accessToken, authToken);
  if (!targetUserId) throw new Error('targetUserId is required.');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allUsers = getAllUsersInternal();
  var target = null;
  for (var u = 0; u < allUsers.length; u++) {
    if (allUsers[u].userId === targetUserId || allUsers[u].username === targetUserId) {
      target = allUsers[u];
      break;
    }
  }
  if (!target) throw new Error('User not found: ' + targetUserId);

  var uid = target.userId;

  // 1. Quiz Attempts
  var quizSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  var quizRows = quizSheet ? quizSheet.getDataRange().getValues() : [];
  var userQuiz = [];
  var quizDiff = { rookie: 0, apex: 0, race_analyst: 0 };
  var quizCompleted = 0;
  var quizBestScore = 0;
  var quizBestPct = 0;
  var quizTotalPct = 0;
  var quizTotalScore = 0;
  var quizTier = null;

  for (var qr = 1; qr < quizRows.length; qr++) {
    if (String(quizRows[qr][1]) === uid) {
      var qRow = quizRows[qr];
      var score = Number(qRow[5]) || 0;
      var totalQ = Number(qRow[6]) || 10;
      var pct = Number(qRow[7]) || 0;
      var tier = String(qRow[8] || 'The Rookie');
      var compAt = String(qRow[11] || qRow[10] || '');
      var status = String(qRow[12] || 'completed');
      var diff = String(qRow[13] || 'apex');

      if (status === 'completed') {
        quizCompleted++;
        quizTotalScore += score;
        quizTotalPct += pct;
        if (pct > quizBestPct) {
          quizBestPct = pct;
          quizBestScore = score;
          quizTier = tier;
        }
      }
      var dKey = diff === 'rookie' ? 'rookie' : (diff === 'race_analyst' ? 'race_analyst' : 'apex');
      quizDiff[dKey] = (quizDiff[dKey] || 0) + 1;

      userQuiz.push({
        attemptId: String(qRow[0]),
        score: score,
        totalQuestions: totalQ,
        percentage: pct,
        fanIdentityTier: tier,
        difficultyLevel: diff,
        completedAt: compAt,
        status: status
      });
    }
  }

  // 2. Strategy Attempts
  var stratSheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
  var stratRows = stratSheet ? stratSheet.getDataRange().getValues() : [];
  var userStrat = [];
  var stratCompleted = 0;
  var stratTotalScore = 0;
  var stratBestScore = 0;
  var tacticalCount = 0;
  var multiCount = 0;
  var preRaceCount = 0;
  var scenarioPlayedSet = {};

  for (var sr = 1; sr < stratRows.length; sr++) {
    if (String(stratRows[sr][1]) === uid) {
      var sRow = stratRows[sr];
      var scId = String(sRow[2] || 'scenario');
      var mode = String(sRow[5] || 'challenge');
      var sStatus = String(sRow[6] || 'completed');
      var sCompAt = String(sRow[8] || sRow[7] || '');
      var sScore = Number(sRow[9]) || 0;

      scenarioPlayedSet[scId] = true;
      if (sStatus === 'completed') {
        stratCompleted++;
        stratTotalScore += sScore;
        if (sScore > stratBestScore) stratBestScore = sScore;
      }
      if (mode === 'pre_race_strategy') preRaceCount++;
      else if (mode === 'race_simulation') multiCount++;
      else tacticalCount++;

      userStrat.push({
        attemptId: String(sRow[0]),
        scenarioId: scId,
        scenarioTitle: scId.replace(/[-_]/g, ' ').toUpperCase(),
        mode: mode,
        score: sScore,
        positionDelta: 0,
        timeDeltaSeconds: 0,
        completedAt: sCompAt,
        status: sStatus
      });
    }
  }

  // 3. Predictions
  var predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  var predRows = predSheet ? predSheet.getDataRange().getValues() : [];
  var scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  var scoreRows = scoreSheet ? scoreSheet.getDataRange().getValues() : [];

  var myScores = {};
  for (var scr = 1; scr < scoreRows.length; scr++) {
    if (String(scoreRows[scr][1]) === uid) {
      myScores[String(scoreRows[scr][2])] = Number(scoreRows[scr][4]) || 0;
    }
  }

  var userPreds = [];
  var predTotalPts = 0;
  var predBestScore = 0;
  var weekendsParticipated = {};

  for (var pr = 1; pr < predRows.length; pr++) {
    if (String(predRows[pr][1]) === uid) {
      var pRow = predRows[pr];
      var rId = String(pRow[2]);
      var isScored = myScores[rId] !== undefined;
      var scoreVal = isScored ? myScores[rId] : undefined;
      var subAt = String(pRow[4] || '');

      weekendsParticipated[rId] = true;
      if (scoreVal !== undefined) {
        predTotalPts += scoreVal;
        if (scoreVal > predBestScore) predBestScore = scoreVal;
      }

      var parsedPData = {};
      try { parsedPData = JSON.parse(pRow[3] || '{}'); } catch (_e) {}

      userPreds.push({
        predictionId: String(pRow[0]),
        roundId: rId,
        grandPrixName: rId.replace(/_/g, ' '),
        submittedAt: subAt,
        isScored: isScored,
        score: scoreVal,
        p1Driver: parsedPData.p1,
        p2Driver: parsedPData.p2,
        p3Driver: parsedPData.p3
      });
    }
  }

  // 4. Combined Activity Timeline
  var timeline = [];

  for (var q = 0; q < userQuiz.length; q++) {
    timeline.push({
      id: userQuiz[q].attemptId,
      type: 'RACING_TAG',
      title: 'Racing Tag — ' + (userQuiz[q].fanIdentityTier || 'Attempt'),
      detail: 'Score: ' + userQuiz[q].score + '/' + userQuiz[q].totalQuestions + ' (' + userQuiz[q].percentage + '%) • Difficulty: ' + (userQuiz[q].difficultyLevel || 'apex'),
      timestamp: userQuiz[q].completedAt,
      score: userQuiz[q].score,
      badgeText: userQuiz[q].percentage + '%',
      statusText: userQuiz[q].status
    });
  }

  for (var s = 0; s < userStrat.length; s++) {
    timeline.push({
      id: userStrat[s].attemptId,
      type: 'STRATEGY_ROOM',
      title: 'Strategy Room — ' + userStrat[s].scenarioTitle,
      detail: 'Mode: ' + userStrat[s].mode + ' • Score: ' + userStrat[s].score + '/100',
      timestamp: userStrat[s].completedAt,
      score: userStrat[s].score,
      badgeText: userStrat[s].score + ' pts',
      statusText: userStrat[s].status
    });
  }

  for (var p = 0; p < userPreds.length; p++) {
    timeline.push({
      id: userPreds[p].predictionId,
      type: 'PREDICTION',
      title: 'F1 Prediction — ' + userPreds[p].grandPrixName,
      detail: userPreds[p].isScored ? ('Scored: ' + userPreds[p].score + ' pts • Picks: ' + [userPreds[p].p1Driver, userPreds[p].p2Driver, userPreds[p].p3Driver].filter(Boolean).join(', ')) : 'Prediction locked, pending official race scoring',
      timestamp: userPreds[p].submittedAt,
      score: userPreds[p].score,
      badgeText: userPreds[p].isScored ? (userPreds[p].score + ' pts') : 'Locked',
      statusText: userPreds[p].isScored ? 'Scored' : 'Submitted'
    });
  }

  timeline.sort(function(a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  var lastQuiz = userQuiz.length > 0 ? userQuiz[0].completedAt : null;
  var lastStrat = userStrat.length > 0 ? userStrat[0].completedAt : null;
  var lastPred = userPreds.length > 0 ? userPreds[0].submittedAt : null;
  var latestActivity = timeline.length > 0 ? timeline[0].timestamp : null;

  return {
    account: {
      userId: target.userId,
      username: target.username,
      displayName: target.displayName || target.username,
      email: target.email || '',
      avatarUrl: target.avatarUrl || '',
      bio: target.bio || '',
      createdAt: target.createdAt || '',
      lastLoginAt: target.lastLoginAt || '',
      lastCompetitionActivity: latestActivity,
      role: target.role || 'user'
    },
    combined: {
      totalAttempts: userQuiz.length + userStrat.length + userPreds.length,
      totalCompletedActivities: quizCompleted + stratCompleted + userPreds.length,
      activeFeaturesCount: (userQuiz.length > 0 ? 1 : 0) + (userStrat.length > 0 ? 1 : 0) + (userPreds.length > 0 ? 1 : 0),
      lastActivityPerFeature: {
        racingTag: lastQuiz,
        strategyRoom: lastStrat,
        predictions: lastPred
      },
      activityTimeline: timeline
    },
    racingTag: {
      attemptsCount: userQuiz.length,
      completedCount: quizCompleted,
      averageScore: quizCompleted > 0 ? Math.round(quizTotalScore / quizCompleted) : 0,
      averagePercentage: quizCompleted > 0 ? Math.round(quizTotalPct / quizCompleted) : 0,
      bestScore: quizBestScore,
      bestPercentage: quizBestPct,
      earnedTier: quizTier,
      difficultyBreakdown: quizDiff,
      achievementsCount: 0,
      recentAttempts: userQuiz.slice(0, 10)
    },
    strategyRoom: {
      attemptsCount: userStrat.length,
      completedCount: stratCompleted,
      scenariosPlayedCount: Object.keys(scenarioPlayedSet).length,
      averageScore: stratCompleted > 0 ? Math.round(stratTotalScore / stratCompleted) : 0,
      bestScore: stratBestScore,
      tacticalChallengesCount: tacticalCount,
      multiStageSimulationsCount: multiCount,
      preRaceCount: preRaceCount,
      averagePositionDelta: 0,
      averageTimeDeltaSeconds: 0,
      recentAttempts: userStrat.slice(0, 10)
    },
    predictions: {
      submissionsCount: userPreds.length,
      raceWeekendsCount: Object.keys(weekendsParticipated).length,
      totalPoints: predTotalPts,
      averageScore: userPreds.length > 0 ? Math.round((predTotalPts / userPreds.length) * 10) / 10 : 0,
      bestScore: predBestScore,
      recentPredictions: userPreds.slice(0, 10)
    },
    trackingGaps: {
      liveRaceStrategy: 'Real-time telemetry and in-race tactical interventions are not currently tracked or scheduled.',
      inDepthTelemetry: 'Per-corner sector deltas and tire slip angles are modeled analytically without persistent logging.'
    }
  };
}

function getPublicCommunityReport(timeRange) {
  var selectedRange = timeRange === '7d' || timeRange === '30d' ? timeRange : 'all';
  var nowMs = Date.now();
  var cutoffMs = selectedRange === '7d' ? nowMs - 7 * 86400 * 1000 : (selectedRange === '30d' ? nowMs - 30 * 86400 * 1000 : 0);

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Users count (aggregates only, no PII)
  var userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  var totalRegistered = userSheet ? Math.max(0, userSheet.getLastRow() - 1) : 0;

  // 2. Quiz Attempts (Racing Tag)
  var quizSheet = ss.getSheetByName(SHEET_NAMES.QUIZ_ATTEMPTS);
  var quizRows = quizSheet ? quizSheet.getDataRange().getValues() : [];
  var quizUsers = {};
  var allCompetitors = {};
  var quizAttemptsCount = 0;
  var quizCompleted = 0;
  var quizTotalScore = 0;
  var quizTotalPct = 0;
  var diffBreakdown = { rookie: 0, apex: 0, race_analyst: 0 };
  var tierDistribution = {
    'The Rookie': 0,
    'The Enthusiast': 0,
    'The Paddock Insider': 0,
    'The Race Strategist': 0,
    'The Motorsport Oracle': 0
  };

  for (var qr = 1; qr < quizRows.length; qr++) {
    var qRow = quizRows[qr];
    if (!qRow[0]) continue;
    var qCompletedAt = qRow[11] || qRow[10] || '';
    var qTimeMs = qCompletedAt ? new Date(qCompletedAt).getTime() : 0;
    if (cutoffMs > 0 && qTimeMs > 0 && qTimeMs < cutoffMs) continue;

    quizAttemptsCount++;
    var uId = String(qRow[1]);
    quizUsers[uId] = true;
    allCompetitors[uId] = true;

    var status = String(qRow[12] || 'completed');
    var score = Number(qRow[5]) || 0;
    var pct = Number(qRow[7]) || 0;
    var tier = String(qRow[8] || 'The Rookie');
    var diff = String(qRow[13] || 'apex').toLowerCase();

    if (status === 'completed') {
      quizCompleted++;
      quizTotalScore += score;
      quizTotalPct += pct;
      if (tierDistribution[tier] !== undefined) {
        tierDistribution[tier]++;
      }
    }
    var dKey = diff === 'rookie' ? 'rookie' : (diff === 'race_analyst' ? 'race_analyst' : 'apex');
    diffBreakdown[dKey] = (diffBreakdown[dKey] || 0) + 1;
  }

  // 3. Strategy Attempts (Strategy Room)
  var stratSheet = ss.getSheetByName(SHEET_NAMES.STRATEGY_ATTEMPTS);
  var stratRows = stratSheet ? stratSheet.getDataRange().getValues() : [];
  var stratUsers = {};
  var stratAttemptsCount = 0;
  var stratCompleted = 0;
  var stratTotalScore = 0;
  var roomTypeCounts = { tactical: 0, multiStage: 0, preRace: 0 };
  var scenarioMap = {};

  for (var sr = 1; sr < stratRows.length; sr++) {
    var sRow = stratRows[sr];
    if (!sRow[0]) continue;
    var sCompletedAt = sRow[8] || sRow[7] || '';
    var sTimeMs = sCompletedAt ? new Date(sCompletedAt).getTime() : 0;
    if (cutoffMs > 0 && sTimeMs > 0 && sTimeMs < cutoffMs) continue;

    stratAttemptsCount++;
    var suId = String(sRow[1]);
    stratUsers[suId] = true;
    allCompetitors[suId] = true;

    var scId = String(sRow[2] || 'scenario');
    var mode = String(sRow[5] || 'challenge');
    var sStatus = String(sRow[6] || 'completed');
    var sScore = Number(sRow[9]) || 0;

    if (mode === 'pre_race_strategy') roomTypeCounts.preRace++;
    else if (mode === 'race_simulation') roomTypeCounts.multiStage++;
    else roomTypeCounts.tactical++;

    if (!scenarioMap[scId]) {
      scenarioMap[scId] = {
        scenarioId: scId,
        title: scId.replace(/[-_]/g, ' ').toUpperCase(),
        mode: mode,
        attempts: 0,
        completed: 0,
        totalScore: 0
      };
    }
    scenarioMap[scId].attempts++;
    if (sStatus === 'completed') {
      scenarioMap[scId].completed++;
      scenarioMap[scId].totalScore += sScore;
      stratCompleted++;
      stratTotalScore += sScore;
    }
  }

  // 4. Predictions
  var predSheet = ss.getSheetByName(SHEET_NAMES.PREDICTIONS);
  var predRows = predSheet ? predSheet.getDataRange().getValues() : [];
  var scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  var scoreRows = scoreSheet ? scoreSheet.getDataRange().getValues() : [];

  var allScoresMap = {};
  for (var scIdx = 1; scIdx < scoreRows.length; scIdx++) {
    var sKey = String(scoreRows[scIdx][1]) + '_' + String(scoreRows[scIdx][2]);
    allScoresMap[sKey] = Number(scoreRows[scIdx][4]) || 0;
  }

  var predUsers = {};
  var predSubmissionsCount = 0;
  var predTotalScore = 0;
  var scoredPredCount = 0;
  var weekendMap = {};

  for (var pr = 1; pr < predRows.length; pr++) {
    var pRow = predRows[pr];
    if (!pRow[0]) continue;
    var pSubAt = pRow[4] || '';
    var pTimeMs = pSubAt ? new Date(pSubAt).getTime() : 0;
    if (cutoffMs > 0 && pTimeMs > 0 && pTimeMs < cutoffMs) continue;

    predSubmissionsCount++;
    var puId = String(pRow[1]);
    predUsers[puId] = true;
    allCompetitors[puId] = true;

    var rId = String(pRow[2]);
    if (!weekendMap[rId]) {
      weekendMap[rId] = {
        raceWeekendId: rId,
        grandPrixName: rId.replace(/_/g, ' '),
        submissionsCount: 0,
        scoredCount: 0,
        totalScore: 0
      };
    }
    weekendMap[rId].submissionsCount++;

    var scoreKey = puId + '_' + rId;
    if (allScoresMap[scoreKey] !== undefined) {
      scoredPredCount++;
      predTotalScore += allScoresMap[scoreKey];
      weekendMap[rId].scoredCount++;
      weekendMap[rId].totalScore += allScoresMap[scoreKey];
    }
  }

  var popularScenarios = [];
  for (var k in scenarioMap) {
    var item = scenarioMap[k];
    popularScenarios.push({
      scenarioId: item.scenarioId,
      title: item.title,
      mode: item.mode,
      runs: item.attempts,
      completionRate: item.attempts > 0 ? Math.round((item.completed / item.attempts) * 100) : 0,
      avgScore: item.completed > 0 ? Math.round(item.totalScore / item.completed) : 0
    });
  }
  popularScenarios.sort(function(a, b) { return b.runs - a.runs; });

  var byWeekend = [];
  for (var wk in weekendMap) {
    var wItem = weekendMap[wk];
    byWeekend.push({
      raceWeekendId: wItem.raceWeekendId,
      grandPrixName: wItem.grandPrixName,
      submissionsCount: wItem.submissionsCount,
      averageScore: wItem.scoredCount > 0 ? Math.round((wItem.totalScore / wItem.scoredCount) * 10) / 10 : 0
    });
  }

  var totalActivity = quizCompleted + stratCompleted + predSubmissionsCount;
  var activeCompCount = Object.keys(allCompetitors).length;
  var participationRate = totalRegistered > 0 ? Math.round((activeCompCount / totalRegistered) * 100) : 0;

  return {
    period: selectedRange,
    periodLabel: selectedRange === '7d' ? 'Last 7 Days' : (selectedRange === '30d' ? 'Last 30 Days' : 'All Time'),
    lastUpdatedAt: new Date().toISOString(),
    headlineStats: {
      registeredMembers: totalRegistered,
      activeCompetitors: activeCompCount,
      participationRate: participationRate,
      racingTagParticipants: Object.keys(quizUsers).length,
      strategyRoomParticipants: Object.keys(stratUsers).length,
      predictionParticipants: Object.keys(predUsers).length,
      totalCompetitionActivity: totalActivity,
      activityDefinition: 'Total completed Racing Tag quizzes, finished Strategy Room simulations, and official F1 prediction submissions.'
    },
    racingTag: {
      totalAttempts: quizAttemptsCount,
      completedAttempts: quizCompleted,
      averageScore: quizCompleted > 0 ? Math.round(quizTotalScore / quizCompleted) : 0,
      averagePercentage: quizCompleted > 0 ? Math.round(quizTotalPct / quizCompleted) : 0,
      difficultyBreakdown: diffBreakdown,
      tierDistribution: tierDistribution
    },
    strategyRoom: {
      totalRuns: stratAttemptsCount,
      completedRuns: stratCompleted,
      averageScore: stratCompleted > 0 ? Math.round(stratTotalScore / stratCompleted) : 0,
      roomTypeBreakdown: roomTypeCounts,
      popularScenarios: popularScenarios
    },
    predictions: {
      totalSubmissions: predSubmissionsCount,
      activeWeekendsCount: Object.keys(weekendMap).length,
      averageScore: scoredPredCount > 0 ? Math.round((predTotalScore / scoredPredCount) * 10) / 10 : 0,
      byWeekend: byWeekend
    }
  };
}

