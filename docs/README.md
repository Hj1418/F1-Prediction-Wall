# F1 Community Platform Documentation Suite

Welcome to the official technical and product documentation for the **F1 Community Platform** (formerly F1 Prediction Wall).

This documentation suite serves as the single source of truth for the platform's vision, design principles, architecture, workflows, and implementation rules.

---

## Documentation Index

| Document | Description |
| :--- | :--- |
| **[PRODUCT_VISION.md](PRODUCT_VISION.md)** | Product positioning, core pillars, target audiences, and non-goals. |
| **[PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md)** | Architectural and UX decision logs, tradeoffs, and rationale. |
| **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** | System topology, data flow, Google Sheets data model, API endpoints, and sync mechanisms. |
| **[USER_WORKFLOWS.md](USER_WORKFLOWS.md)** | Detailed user journeys from onboarding and learning to predicting and competing. |
| **[FRONTEND_DESIGN.md](FRONTEND_DESIGN.md)** | Design tokens, motorsport visual aesthetic, component specs, typography, and accessibility. |
| **[CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md)** | Tone of voice, motorsport terminology, copy standards, and anti-patterns. |
| **[IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md)** | Engineering constraints, dependency hygiene, backward compatibility, and testing rules. |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Existing technical architecture reference for sync and scoring engines. |
| **[CHANGELOG.md](CHANGELOG.md)** | Complete version history and record of alignments and improvements. |

---

## Core Philosophy

1. **Understand First**: We prioritize making Formula 1 accessible and clear to fans of all experience levels through high-density educational and circuit guides.
2. **Follow with Precision**: Accurate calendar tracking, local countdowns, and session schedules without distracting noise or fake telemetry.
3. **Compete with Integrity**: Deterministic scoring, transparent community leaderboards, and rock-solid prediction locks at qualifying start.
4. **Restrained Engineering**: No unnecessary infrastructure, third-party bloat, or complex servers. Everything runs on a sleek client, Google Apps Script serverless backend, and Google Sheets database.
