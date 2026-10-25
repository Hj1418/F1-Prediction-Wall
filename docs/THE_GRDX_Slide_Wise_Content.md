# THE GRDX — Product, Architecture, and Roadmap Presentation

**Slide-wise content blueprint**  
**Recommended length:** 12 slides  
**Design:** Simple, professional light theme

This document defines the content to include on each slide of the THE GRDX presentation. It accompanies the architecture and workflow diagrams already prepared.

The presentation should tell one continuous story:

**The problem → The product → How it works → How it is built → How it protects data → Where it is going → What it looks like.**

---

## Slide 1 — Introduction: What Is THE GRDX?

**Title:** THE GRDX — F1 Prediction & Community Platform

Introduce the product in one slide.

### Include
- **What it is:** A motorsport-focused platform where Formula 1 fans can make race predictions, follow race weekends, and engage with competitive community features.
- **Problem it solves:** F1 fans often follow races through separate sources and discuss predictions informally. THE GRDX aims to bring prediction participation, results, and competitive engagement into one dedicated experience.
- **Target audience:** F1 fans, race-weekend prediction enthusiasts, motorsport communities, and users who enjoy friendly competition.
- **Core objective:** Make following Formula 1 more interactive by giving fans a structured way to predict outcomes, track performance, and compare results.
- **Vision:** Build a focused digital home for F1 prediction, learning, and community engagement.

**Main visual:** THE GRDX logo and a small preview of the platform.  
**Key message:** *Turn every Grand Prix weekend into an interactive experience.*

Note: Present the problem and vision as the platform's intended purpose, rather than claiming market-wide results or user impact that hasn't been measured.

---

## Slide 2 — System Architecture at a Glance

**Title:** How THE GRDX Works

Include a simplified version of the C4 Container Diagram.

### Include
- A high-level view of the frontend, backend, data store, and external services.
- Frontend hosting and user access through GitHub Pages.
- Backend request handling through Google Apps Script.
- Google Sheets as the persistent data store.
- Browser storage and backend caching where applicable.
- Integrations with Google Identity Services, Jolpica F1 API, and Google MailApp.

**Main visual:** A simplified container diagram showing:

`User → Web Frontend → Apps Script Backend → Google Sheets`

Add supporting connections to external services and caching/storage.

**Key message:** A lightweight web platform connects the user experience to server-side business logic, structured application data, and external services.

---

## Slide 3 — Core Workflow: Race Weekend and Predictions

**Title:** From Race Weekend to Prediction

Use the prediction lifecycle workflow.

### Include the workflow
1. Race calendar and session information.
2. Opening the relevant prediction round.
3. Selecting predicted outcomes.
4. Validating inputs and submission deadlines.
5. Saving predictions.
6. Viewing results and scores when results are available.

**Main visual:** A horizontal workflow or simple numbered sequence.  
**Key message:** Predictions are organized around race sessions rather than being isolated, free-form entries.

---

## Slide 4 — Backend and Data Architecture

**Title:** What Happens Behind the Scenes?

Combine the most relevant parts of the backend component diagram and ERD.

### Include
- Request handling through `doGet(e)` and `doPost(e)`.
- Application services for predictions, scoring, and related features.
- Google Sheets as the persistent data store.
- Cache and locking mechanisms where applicable.
- Connections between users, race weekends, prediction rounds, predictions, results, and scores.

Keep the ERD simplified here. The detailed data relationships can remain in the architecture reference material if they would make this slide too dense.

**Main visual:** A simplified backend component diagram with a compact data-relationship view.  
**Key message:** The backend coordinates business rules, data persistence, and processing across the platform.

---

## Slide 5 — Scoring and Competitive Workflow

**Title:** How Predictions Become Points

Show the scoring workflow from submitted predictions to calculated scores and leaderboard updates.

### Include
- Exact podium-position predictions.
- Correct podium driver in a different position.
- Perfect podium bonus.
- Fastest lap.
- Driver of the Day.
- Wildcard prediction.

### Documented scoring model

| Prediction outcome | Documented points |
|---|---:|
| Exact P1 | 15 |
| Exact P2 | 10 |
| Exact P3 | 10 |
| Correct podium driver, wrong position | 5 |
| Perfect 1–2–3 podium bonus | +10 |
| Fastest lap | 10 |
| Driver of the Day | 10 |
| Wildcard | 15 |

**Main visual:** Prediction-to-scoring workflow with the scoring table beside or below it.  
**Key message:** The scoring system turns individual race predictions into a measurable competitive experience.

**Validation note:** Treat these as documented values and verify them against the current implementation before presenting them as confirmed production rules.

---

## Slide 6 — Features and Platform Capabilities

**Title:** The Features That Power THE GRDX

Organize features into four visual groups.

### Race Weekend
- Race sessions.
- Circuit information.
- Prediction rounds.
- Schedule access.

### Competition
- Prediction scoring.
- Results.
- Leaderboards.
- Achievements.

### Learning and Engagement
- Motorsport quizzes.
- Interactive knowledge-based activities.

### Personal Experience
- User profiles.
- Notifications.
- Personalized participation.

**Main visual:** A four-part feature map or clean grid of feature groups.  
**Key message:** THE GRDX combines race information, prediction, competition, and engagement in one focused experience.

**Note:** Include only implemented features or clearly label upcoming functionality as planned.

---

## Slide 7 — Technology Stack

**Title:** Built With a Lightweight, Serverless-Oriented Stack

Show the technology stack in three or more layers.

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, React Router | User interface, application state, navigation, and build tooling |
| Backend | Google Apps Script V8 | API handling and application logic |
| Data | Google Sheets, `CacheService`, browser `LocalStorage` | Persistent records, backend caching, and client-side persistence |
| Integrations | Google Identity Services, Jolpica F1 API, Google MailApp | Authentication, motorsport data, and email delivery |
| Hosting and delivery | GitHub Pages, GitHub Actions | Frontend hosting and automated build/deployment workflow |

**Main visual:** A layered technology stack diagram.  
**Key message:** The platform uses familiar web technologies and managed Google services to keep infrastructure relatively lightweight.

**Accuracy note:** Do not describe this as a fully serverless architecture without qualification. Explain specifically that the backend runs on Google Apps Script.

---

## Slide 8 — What Makes THE GRDX Different?

**Title:** Beyond a Basic Prediction Website

Focus on the product's distinctive capabilities and design direction.

- **F1-focused experience:** A platform designed specifically around Formula 1 race weekends.
- **Session-aware predictions:** Predictions are structured around relevant sessions and their deadlines.
- **Circuit-centered identity:** Circuit SVG assets and venue-specific information help connect the experience to real tracks.
- **Competitive progression:** Scoring, leaderboards, and achievements give users a way to track performance over time.
- **Multiple engagement modes:** Prediction participation can sit alongside quizzes and other motorsport knowledge activities.
- **Community-first direction:** The platform is intended to support shared participation and friendly competition among fans.

**Main visual:** A feature map or small collection of genuine UI screenshots highlighting different areas of the product.  
**Key message:** The goal is to make F1 prediction more structured, immersive, and community-oriented.

Avoid claiming these capabilities are unique across the entire market unless comparative research supports that claim.

---

## Slide 9 — Product Vision and Future Roadmap

**Title:** Where THE GRDX Goes Next

Divide the roadmap into three phases. These are suggested planning categories, not confirmed delivery commitments.

### Phase 1 — Foundation: Reliability and Core Experience
- Verify prediction submission and scoring end to end.
- Improve handling of unavailable APIs and stale data.
- Strengthen consistency across race weekends, results, and leaderboards.
- Refine the desktop and mobile user experience.

### Phase 2 — Engagement: Community and Competition
- Improve achievements and season-long progression.
- Expand quiz and motorsport learning experiences.
- Improve notification preferences and race-weekend reminders.
- Introduce more community interaction where appropriate.

### Phase 3 — Long-Term Vision: A More Complete F1 Community Platform
- Develop richer circuit and race analytics.
- Explore historical prediction performance and insights.
- Improve community participation tools.
- Evaluate scalability and data-storage options as usage grows.

**Main visual:** A three-phase roadmap timeline.  
**Key message:** Build a reliable prediction platform first, deepen user engagement next, and expand into a richer F1 community experience over time.

Only include roadmap items that align with actual plans. Label each item as proposed, planned, or in progress according to its real status.

---

## Slide 10 — Security, Privacy, and Data Integrity

**Title:** Protecting User Data and Platform Integrity

Place this slide immediately before the product screenshots.

### Include
- **Authentication:** Google sign-in and the native credential-related flow documented by the project.
- **Authorization:** Server-side permission checks for privileged operations, where implemented.
- **Prediction integrity:** Input validation, deadline enforcement, and concurrency protection where verified.
- **Data and notification handling:** Google Sheets access, privacy-conscious responses, and notification processing controls.

**Main visual:** A security diagram showing the user, identity verification, backend authorization, validated business operations, and protected data storage.

### Security considerations
Identify any controls still requiring verification instead of claiming complete security. Do not expose credentials, tokens, API keys, private user information, or internal secrets.

**Key message:** Security depends on backend enforcement and data-integrity controls, not just the authentication interface.

---

## Slide 11 — Product Showcase: Desktop Experience

**Title:** THE GRDX — Desktop Experience

Use actual screenshots of the website rather than architecture diagrams.

### Include
- One large screenshot of the desktop homepage or main dashboard.
- One or two smaller screenshots showing important areas, such as the race-weekend page, prediction interface, or leaderboard.
- Short labels identifying each screenshot.
- A one-line caption describing the desktop experience.

**Layout:** One dominant screenshot with two smaller supporting screenshots, if available.  
**Key message:** Show how the architecture translates into a usable, cohesive product experience.

Use genuine screenshots from the running application. Do not invent a redesigned interface or generate mock screenshots that do not match the actual product.

---

## Slide 12 — Product Showcase: Mobile Experience

**Title:** THE GRDX — Mobile Experience

Show the actual website as it appears on a mobile device.

### Include
- A screenshot of the mobile homepage or dashboard.
- A screenshot of the mobile prediction interface.
- A screenshot of the mobile leaderboard or race-weekend page, if available.
- Brief labels explaining what each view demonstrates.

**Layout:** Two or three mobile screenshots side by side, with consistent sizing and spacing.  
**Key message:** Demonstrate how users can access the prediction experience and key platform features on smaller screens.

Use actual mobile screenshots. If the mobile interface is not fully responsive or has known limitations, do not imply that those issues have already been resolved.

---

## Recommended Presentation Flow

| Slide | Title | Main purpose |
|---:|---|---|
| 1 | Introduction to THE GRDX | Explain the product, problem, audience, aim, and vision |
| 2 | System Architecture at a Glance | Introduce the overall architecture |
| 3 | Race Weekend and Prediction Workflow | Explain the main user journey |
| 4 | Backend and Data Architecture | Show internal processing and data relationships |
| 5 | Scoring and Competitive Workflow | Explain how predictions become points |
| 6 | Features and Platform Capabilities | Present what users can do |
| 7 | Technology Stack | Explain the technologies and their roles |
| 8 | What Makes THE GRDX Different? | Highlight product strengths and differentiators |
| 9 | Product Vision and Future Roadmap | Explain future plans |
| 10 | Security, Privacy, and Data Integrity | Address trust and engineering controls |
| 11 | Desktop Experience | Show actual desktop screenshots |
| 12 | Mobile Experience | Show actual mobile screenshots |

---

## Design Guidelines

Use a simple, professional light theme throughout.

- **Background:** White or very light gray.
- **Main text:** Dark charcoal or black.
- **Accent:** Restrained racing red.
- **Secondary colors:** Muted blue, soft green, light amber, and light purple for diagrams.
- **Typography:** Clean sans-serif fonts such as Aptos, Arial, or Inter.
- **Layout:** Consistent 16:9 widescreen format, aligned margins, and generous whitespace.
- **Diagrams:** Clean boxes, thin borders, clear arrows, and readable labels.
- **Footer:** Consistent project name and slide number.

Avoid dark backgrounds, gradients, glow effects, 3D styling, excessive animations, decorative racing imagery, and unnecessary visual effects.

The presentation should look like a formal product and engineering review, not a flashy motorsport advertisement.

---

## Final Recommendations

- Do not make every slide an architecture slide. Use the first slide to establish the product's purpose and Slides 2–5 to explain its architecture and workflows.
- Keep the feature and technology slides separate: features explain what the platform does, while the tech stack explains how it is built.
- Make the roadmap realistic and distinguish implemented functionality from future plans.
- Use actual desktop and mobile screenshots for Slides 11 and 12.
- Keep the security slide immediately before the screenshots.
- Preserve technical caveats and avoid unsupported claims about implementation, uniqueness, security, or impact.

The presentation should tell a coherent story:

**The problem → The product → How it works → How it is built → How it protects data → Where it is going → What it looks like.**
