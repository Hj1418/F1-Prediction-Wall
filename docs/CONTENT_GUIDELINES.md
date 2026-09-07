# Content & Tone Guidelines

This document outlines the voice, tone, terminology standards, anti-patterns, and data & content governance rules across the platform.

---

## 1. Tone of Voice

- **Professional & Knowledgeable**: We speak like seasoned motorsport commentators and engineers—insightful, clear, and precise.
- **Welcoming to Newcomers**: Explanations demystify jargon without talking down to the reader. Technical terms (Parc Fermé, DRS, Undercut) are clearly defined in context.
- **Restrained & Trustworthy**: We let the drama of racing speak for itself. We avoid clickbait, exaggerated claims, or artificial urgency.
- **Core Principle**: **WE EXPLAIN. THE OFFICIAL SOURCES PUBLISH.**

---

## 2. Motorsport Terminology Standards

Always adhere to official Formula 1 naming conventions:

| Correct Term | Avoid |
| :--- | :--- |
| **Grand Prix** (or **GP**) | Race match, event round |
| **Race Weekend** | Game weekend, tournament |
| **Free Practice 1, 2, 3 (FP1, FP2, FP3)** | Practice round, training session |
| **Qualifying (Q1, Q2, Q3)** | Prelims, qualifiers, heats |
| **Sprint** / **Sprint Qualifying** | Mini-race, short race |
| **Pole Position** | First place start, #1 seed |
| **Podium (P1, P2, P3)** | Top 3 winners, medalists |
| **Constructor** | Team owner, car brand |
| **Safety Car (SC)** / **Virtual Safety Car (VSC)** | Pace car, caution flag |
| **Chequered Flag** | Finish line flag |
| **Parc Fermé** | Impound, lock room |
| **DRS (Drag Reduction System)** | Boost button, speed zone |

---

## 3. Copy Anti-Patterns (What NOT to Do)

1. **No Gambling / Betting Lingo**:
   - ❌ "Bet on the race", "High stakes", "Odds", "Payout", "Win cash"
   - ✅ "Submit predictions", "Pick the podium", "Climb the leaderboard", "Earn points"
2. **No Meme Culture or Excessive Emojis**:
   - ❌ "🏎️💨 FASTEST CAR GO VROOM 🚀🔥", "Who will choke this Sunday? 💀"
   - ✅ "Track characteristics demand high aerodynamic efficiency and top-speed stability."
3. **No Fake Telemetry / Live Feeds**:
   - ❌ "Live tyre temperature: 104°C (Simulated)"
   - ✅ Official session timing, verified schedule, and historical lap records only.
4. **No Emojis in Section Headers**:
   - ❌ "🏁 NEXT RACE", "🏆 LEADERBOARD", "📖 LEARN F1"
   - ✅ "NEXT RACE", "LEADERBOARD", "LEARN F1"

---

## 4. Data & Content Governance

### 1. Source of Truth Hierarchy
- **Formula 1 (Formula1.com)**: Authoritative for official editorial articles, news announcements, beginner guides, and official circuit previews.
- **FIA (FIA.com)**: Authoritative for sporting regulations, technical regulations, steward decisions, penalty bulletins, and the International Sporting Code (e.g. Appendix H for flags).
- **Jolpica-F1**: Authoritative structured API for race calendar schedules, sessions, drivers, constructors, and qualifying/race outcomes.
- **F1DB / Local Verified Asset Registry**: Authoritative for historical lap records, all 24 verified circuit vector SVGs, and track geometry metrics.
- **Our Application**: Authoritative for beginner explanations, the 3-question pedagogical framework, UI presentation, community predictions, scoring, and connections between concepts.

### 2. Why Official Sources Are Linked Rather Than Copied
We do **not** scrape, mirror, or copy full articles or FIA regulatory PDFs into our database:
- **Respect for Intellectual Property**: Official publishers own editorial content.
- **Data Freshness**: Regulation amendments and technical directives are continually published by the FIA; linking directly ensures users always access the live, uncorrupted source document.
- **Anti-Bloat**: Maintaining an article CMS adds unnecessary database complexity and infrastructure overhead.

### 3. Why Our Application Maintains Its Own Simplified Explanations
Official regulations are written in legalistic, dense language designed for team principals and scrutineers. Newcomers need immediate clarity:
- Every educational topic is broken down into:
  1. **WHAT IS IT?**
  2. **HOW DOES IT WORK?**
  3. **WHY DOES IT MATTER?**
  4. **OFFICIAL INFORMATION →** (Direct link to authoritative source).

### 4. How Regulation-Sensitive Content Is Handled
Rules evolve between seasons (qualifying nuances, sprint procedures, tyre rules, weight limits). Every regulation-sensitive topic must carry explicit governance metadata:
- **Season**: (e.g., 2026)
- **Source**: (e.g., FIA Formula One Sporting Regulations, Article 39)
- **Verification Date**: (e.g., March 2026)
- **Direct Official URL**: (e.g., `https://www.fia.com/regulation/category/110`)
Automatic AI rewriting of regulatory changes is strictly prohibited. Changes must be reviewed against official FIA publications before updating simplified text.

### 5. How Current F1 Data Is Obtained
Dynamic race schedules, session start times, drivers, and constructor standings are consumed directly from structured provider APIs (Jolpica-F1 / mock fallback) rather than maintaining duplicate manually written arrays.

### 6. How Historical Information Is Handled
Historical records (first Grand Prix year, all-time race lap records with driver and year) are stored in structured registries (`circuitRegistry.ts`) and verified against official timing databases.

### 7. How Official Articles Are Presented
Presented inside clean, structured resource cards:
- Source Badge (`Formula 1` or `FIA`)
- Publication or Verification Date
- Category tag (`Regulations`, `Race Weekend`, `Technical`, `Circuits`)
- Clear, unembellished title
- Short contextual description explaining why the document matters
- Explicit external link (`"READ OFFICIAL ARTICLE →"` or `"READ OFFICIAL REGULATIONS →"`) opening in a new tab.

---

## 5. Documenting the "WHY" for Features

When introducing content or educational features, the following format must be recorded:

### Feature: Official F1 Updates Discovery
- **WHAT**: A lightweight component displaying curated, verified official F1 and FIA publications.
- **WHY**: Users who have grasped our basic explanation often seek deeper technical or editorial insight.
- **WHY HERE**: It bridges the beginner explanation with the primary source of truth without forcing the user to leave and search blindly.
- **SOURCE**: Official `Formula1.com` and `FIA.com`.
- **BOUNDARY**: We display metadata, category, and context only. We do NOT mirror full article bodies or build a news CMS.

### Feature: Contextual Circuit Learning Bridge
- **WHAT**: Contextual badges on the Homepage and Circuit pages connecting the active Grand Prix venue to specific Learn F1 topics (e.g., Monza low-downforce aero, heavy braking).
- **WHY**: Abstract rules become immediately memorable when seen in the context of this weekend's race.
- **WHY HERE**: It transforms a static calendar into an active learning environment.
- **SOURCE**: Circuit telemetry registry and Learn F1 educational modules.
- **BOUNDARY**: Avoids fake live telemetry; relies strictly on verified circuit layout characteristics and official session schedules.
