# System Architecture

## 1. System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  React 19 + TypeScript + Vite + Vanilla CSS System          │
│  State: AuthContext, ScheduleContext, Offline Caching       │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS JSON / Fetch API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Google Apps Script Web App (API Gateway)          │
│  Code.gs: doGet (Read queries), doPost (Mutations & Auth)   │
│  LockService (Concurrency control)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ Google Apps Script SpreadsheetApp
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Sheets Database                      │
│  11 Structured Relational Sheets:                           │
│  - Users                 - UserPredictions                  │
│  - RaceWeekends          - ActualResults                    │
│  - Sessions              - Leaderboard                      │
│  - Drivers               - NotificationQueue                │
│  - Constructors          - NotificationLog                  │
│  - Circuits                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Google Sheets Relational Schema (11 Sheets)

### 1. `Users`
- **Columns**: `userId`, `email`, `displayName`, `photoUrl`, `authProvider`, `passwordHash`, `createdAt`, `lastLoginAt`, `isAdmin`
- **Key**: `userId` (Primary), `email` (Unique)

### 2. `RaceWeekends`
- **Columns**: `id`, `season`, `round`, `name`, `circuitId`, `country`, `startDate`, `endDate`, `hasSprint`, `status`, `lockTime`
- **Key**: `id` / `round`

### 3. `Sessions`
- **Columns**: `id`, `raceWeekendId`, `sessionType`, `sessionName`, `startTimeUtc`, `endTimeUtc`, `status`
- **Key**: `id`

### 4. `Drivers`
- **Columns**: `id`, `code`, `number`, `firstName`, `lastName`, `constructorId`, `country`, `headshotUrl`, `isActive`
- **Key**: `id`

### 5. `Constructors`
- **Columns**: `id`, `name`, `fullTeamName`, `colorHex`, `logoUrl`, `country`, `isActive`
- **Key**: `id`

### 6. `Circuits`
- **Columns**: `id`, `name`, `city`, `country`, `lengthKm`, `turns`, `lapRecordTime`, `lapRecordDriver`, `lapRecordYear`, `svgAssetPath`
- **Key**: `id`

### 7. `UserPredictions`
- **Columns**: `id`, `userId`, `raceWeekendId`, `poleDriverId`, `p1DriverId`, `p2DriverId`, `p3DriverId`, `fastestLapDriverId`, `dotdDriverId`, `safetyCar`, `submittedAt`, `pointsEarned`, `breakdownJson`
- **Key**: `id` (Composite Unique: `userId + raceWeekendId`)

### 8. `ActualResults`
- **Columns**: `id`, `raceWeekendId`, `poleDriverId`, `p1DriverId`, `p2DriverId`, `p3DriverId`, `fastestLapDriverId`, `dotdDriverId`, `safetyCar`, `isFinal`, `publishedAt`
- **Key**: `id` / `raceWeekendId`

### 9. `Leaderboard`
- **Columns**: `userId`, `displayName`, `totalPoints`, `predictionsCount`, `podiumExactHits`, `poleHits`, `fastestLapHits`, `rank`, `previousRank`, `lastCalculatedAt`
- **Key**: `userId`

### 10. `NotificationQueue`
- **Columns**: `id`, `recipientEmail`, `recipientName`, `notificationType`, `subject`, `templateDataJson`, `status`, `idempotencyKey`, `attempts`, `queuedAt`, `sentAt`, `errorMessage`
- **Key**: `id`, `idempotencyKey` (Unique to prevent duplicate sends)

### 11. `NotificationLog`
- **Columns**: `id`, `queueId`, `recipientEmail`, `notificationType`, `idempotencyKey`, `sentAt`, `status`, `deliveryMetadata`
- **Key**: `id`

---

## 3. Data Flow & Scoring Engine

1. **Schedule Ingestion**: Synchronized using official schedule endpoints with Ergast / OpenF1 fallback, stored in `RaceWeekends` and `Sessions`.
2. **Prediction Submission**:
   - Client sends prediction payload to Apps Script endpoint before session lock time.
   - Apps Script checks `lockTime` vs `new Date()`. If locked, rejects with HTTP 403.
   - Stores record in `UserPredictions`.
   - Adds a confirmation entry into `NotificationQueue` with `idempotencyKey = "PREDICTION:" + roundId + ":" + userId`.
3. **Race Result Publication & Scoring**:
   - Admin or automated worker commits `ActualResults`.
   - Scoring engine evaluates each user prediction using standardized points:
     - Exact P1/P2/P3: 10 pts each
     - Podium in incorrect position: 5 pts each
     - Exact Pole: 5 pts
     - Exact Fastest Lap: 5 pts
     - Exact Safety Car: 3 pts
     - Driver of the Day: 3 pts
   - Updates `Leaderboard` standings and queues result notification emails with `idempotencyKey = "RESULT:" + roundId + ":" + userId`.

---

## 4. Educational & Official Sources Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        External Official Sources                       │
│  - Formula1.com (Editorial articles, beginners' guides, track previews)│
│  - FIA.com (Sporting/Technical Regulations, Stewards' bulletins)        │
│  - Jolpica-F1 (Live calendar, sessions, drivers, standings)             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Direct External Linking (No CMS)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Client Educational Architecture                      │
│  - officialContent.ts (Structured metadata, governance & verification) │
│  - circuitRegistry.ts (Track DNA, key corners, official track guides)  │
│  - LearnPage.tsx (3-Part Pedagogical: What / How / Why / Official)     │
│  - OfficialUpdatesSection.tsx (Discovery widget for official sources)  │
│  - Contextual Educational Bridges (Connecting active GP to rules)      │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Lightweight Governance Registry**: Managed via typed TypeScript definitions (`OfficialResource`, `GovernanceMetadata`) without database overhead.
2. **Deterministic Verification**: Every regulatory topic is pinned to a specific verified season and verification date.
3. **Zero Scraping / Zero Mirroring**: Zero backend bandwidth or storage used for external article content.
