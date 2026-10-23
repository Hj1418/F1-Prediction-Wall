# THE GRDX — Documentation Suite Index

Welcome to the official technical and product documentation suite for **THE GRDX** (formerly *F1 Prediction Wall*), the open-source motorsport intelligence, dynamic prediction bench, and fan education platform.

This documentation suite serves as the definitive engineering and product reference.

---

## 📑 Master Documentation Index

| Document | Primary Focus | Key Contents |
| :--- | :--- | :--- |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | **Master Technical Architecture** | **C1, C2, C3, and C4 Diagrams**, Physical Cloud Topology (Frontend, Backend, Database), Security Architecture, Complete 15-Table Relational Schema, Workflows, Tech Stack Rationale, and Strategic Roadmap. |
| **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** | **Runtime System Architecture** | Request-response topology, Google Apps Script API endpoints, Google Identity Services OAuth 2.0 flow, LockService concurrency, and asynchronous email queue. |
| **[USER_WORKFLOWS.md](USER_WORKFLOWS.md)** | **End-to-End User Journeys** | Step-by-step user journeys covering guest browsing, registration, prediction lock, race result scoring, leaderboard exploration, and race control administration. |
| **[PRODUCT_VISION.md](PRODUCT_VISION.md)** | **Product Strategy & Positioning** | Platform mission, core product pillars, target personas (casual fans, sim racers, engineers), and non-goals. |
| **[PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md)** | **Architecture Decision Records (ADRs)** | Technical tradeoff analysis, historical architectural decisions, and alternatives evaluated. |
| **[FRONTEND_DESIGN.md](FRONTEND_DESIGN.md)** | **Design System & Visual Language** | Pit wall telemetry dark theme tokens, monospace timing typography (`JetBrains Mono`, `Outfit`), component specifications, and accessibility standards. |
| **[CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md)** | **Motorsport Content & Copy Standards** | Tone of voice, authentic motorsport terminology, copy standards, and forbidden anti-patterns. |
| **[IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md)** | **Engineering Constraints** | Coding conventions, strict dependency hygiene, zero-cost infrastructure rules, backward compatibility, and test coverage requirements. |
| **[CHANGELOG.md](CHANGELOG.md)** | **Release & Version History** | Comprehensive release logs across all engineering phases and product milestones. |

---

## 🏎️ Core Architectural Principles

1. **Physical Decoupling & Zero-Cost Infrastructure**:
   * **Frontend:** Static React 19 Single Page Application hosted on **GitHub Pages Edge CDN** ($0/mo).
   * **Backend:** Serverless V8 JavaScript API hosted on **Google Apps Script / Google Cloud** ($0/mo).
   * **Database:** Human-auditable relational database hosted on **Google Sheets** (15 tables, $0/mo).
2. **Understand First**: Making Formula 1, Feeder series (F2/F3), WEC, and MotoGP accessible through high-density educational guides, interactive circuit vectors, and a 120-question fan identity quiz engine.
3. **Follow with Precision**: Accurate calendar tracking, local countdowns, and session timelines with automatic schedule drift detection from the Jolpica F1 API mirror.
4. **Compete with Integrity**: Deterministic scoring mathematics, server-controlled deadline verification, mutual exclusion driver selection, and script-locked concurrency defense.
