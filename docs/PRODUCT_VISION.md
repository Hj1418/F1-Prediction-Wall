# Product Vision: F1 Community Platform

## 1. Product Positioning

The F1 Community Platform is **NOT** a prediction-only gambling or hype portal.

The correct product positioning is:
> **"An interactive F1 community platform that helps fans understand Formula 1, follow race weekends, explore circuits, make predictions, and compete on community leaderboards."**

Predictions are one exciting component of the community experience, but they are anchored within a rich motorsport context: education, circuit exploration, schedule tracking, and community competition.

---

## 2. Product Hierarchy & Pillars

The platform experience is structured in 5 progressive pillars:

```
┌────────────────────────────────────────────────────────┐
│ 1. LEARN F1      │ Onboarding, regulations, strategy   │
├──────────────────┼─────────────────────────────────────┤
│ 2. EXPLORE F1    │ Circuit catalog, track DNA, stats   │
├──────────────────┼─────────────────────────────────────┤
│ 3. FOLLOW F1     │ Race weekend schedules & countdowns │
├──────────────────┼─────────────────────────────────────┤
│ 4. PREDICT       │ Podium, pole, fastest lap picks     │
├──────────────────┼─────────────────────────────────────┤
│ 5. COMPETE       │ Transparent community leaderboards  │
└────────────────────────────────────────────────────────┘
```

1. **LEARN F1**: Demystifying motorsport rules, weekend formats (Standard vs. Sprint), flags, tire compounds, and strategy so that any fan can follow a Grand Prix with confidence.
2. **EXPLORE F1**: Interactive, vector-rendered guides for all 24 championship circuits, detailing track characteristics, lap records, elevation profiles, and historical quirks.
3. **FOLLOW F1**: Precision race weekend timelines converted to the user's local timezone, countdown timers, and clear indicators of session status.
4. **PREDICT**: A clean, authenticated interface to submit predictions (Podium P1-P3, Pole Position, Fastest Lap, Driver of the Day, Safety Car) prior to the weekend lock window.
5. **COMPETE**: Live-updated community leaderboards with transparent point breakdowns, accuracy metrics, and global rankings.

---

## 3. Target Audiences

- **The New Fan (First-Year Follower)**: Attracted through Drive to Survive or social media, wanting to understand how Qualifying works, what yellow/red/blue flags mean, and why teams pit under Safety Cars.
- **The Casual Enthusiast**: Needs quick, clean answers: "When does qualifying start in my timezone?", "What circuit are they racing at this week?", and "How many laps is the race?".
- **The Weekend Predictor**: Follows every race weekend closely, submits picks before qualifying locks, and checks the leaderboard after Sunday's checkered flag.
- **The Community Competitor**: Focused on season-long points, accuracy percentages, and climbing the community leaderboard alongside fellow enthusiasts.

---

## 4. Explicit Non-Goals

To maintain high usability, speed, and reliability, the following are explicitly out of scope:
- **No gambling or monetary wagering**: All prediction competitions are purely for community bragging rights and skill.
- **No fake real-time telemetry or fake live timing**: Telemetry without official live FIA timing feeds is deceptive and low-fidelity; we focus on verified schedules, countdowns, and official session outcomes.
- **No chaotic social feeds or meme walls**: Discussion and competition remain focused around verified race data and leaderboard standings.
- **No bloated animations or heavy 3D assets**: Circuit maps are sleek, responsive SVG vector graphics designed for instant loading on any device.
- **No news CMS or article mirroring**: We do not scrape, republish, or duplicate official news articles.

---

## 5. Information Philosophy: We Explain. Official Sources Publish.

The application is **NOT** intended to replace Formula1.com or the FIA. Official websites remain the sole source of truth.

- **Our Purpose**:
  - We provide simple explanations.
  - We provide beginner-friendly context.
  - We demystify rules, procedures, and terminology.
  - We connect rules to the current race weekend.
  - We provide direct links to official articles and FIA regulations when deeper information is required.
- **The Value Equation**:
  $$\text{Value} = \text{Information} + \text{Context} + \text{Visualisation} + \text{Simplicity} + \text{Connection to Current Race}$$
  The goal is not simply to hoard more text, but to make the existing motorsport world intelligible to fans.

