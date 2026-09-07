# Frontend Design System & Motorsport UI

The visual identity of the F1 Community Platform is built around precision, high legibility, and restrained motorsport aesthetics.

---

## 1. Color System

The color palette reflects official motorsport timing towers and carbon-composite vehicle textures.

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--bg-base` | `#080a0f` | Main viewport background |
| `--bg-surface` | `#0d1117` | Standard card surface |
| `--bg-elevated` | `#161b22` | Hovered cards, modals, popovers |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Dividers, card borders |
| `--border-focus` | `rgba(225, 6, 0, 0.5)` | Active inputs, selected states |
| `--accent-red` | `#e10600` | Official F1 red; CTAs, lock badges, active indicators |
| `--accent-hover` | `#ff1801` | Interactive hover state for primary red actions |
| `--text-primary` | `#f0f6fc` | High-contrast body text and titles |
| `--text-secondary` | `#8b949e` | Labels, subtitles, metadata |
| `--text-tertiary` | `#484f58` | Inactive placeholders, disabled hints |
| `--status-live` | `#238636` | Active live session badge |
| `--status-upcoming` | `#1f6feb` | Scheduled sessions |
| `--status-completed`| `#6e7681` | Finished sessions |

---

## 2. Typography

- **Display & Headings**: `Outfit`, system sans-serif (clean geometric proportions).
- **Body & Controls**: `Inter`, system sans-serif (crisp readability at standard sizes).
- **Timers, Lap Records & Delays**: `JetBrains Mono`, `Consolas`, monospace (zero layout shift during live countdowns).

---

## 3. UI Component Standards

### Status Badges
- Strict uppercase, compact padding (`px-2 py-0.5`).
- Visual variants:
  - `LIVE`: Pulsing emerald indicator (`#238636`).
  - `UPCOMING`: Subtle slate/blue border (`#1f6feb`).
  - `COMPLETED`: Muted gray (`#6e7681`).
  - `LOCKED`: Restrained red pill with lock icon.

### Cards & Surfaces
- Sharp, subtle border radius (`rounded-lg` / `8px` or `12px`).
- Deep dark backgrounds with 1px border (`border-subtle`).
- Zero gratuitous glows or heavy drop shadows.

### Circuit Visuals
- High-contrast SVG paths rendered on neutral dark backgrounds.
- Key telemetry overlays (Length, Turns, Lap Record, DRS Zones) formatted in structured tabular or pill displays.
- "Why is this track different?" callout box with key corner cards and official F1 track guide links.

### Official Source Cards & Governance Tags
- Source badges: `FIA` rendered in subtle blue pill (`rgba(31, 111, 235, 0.15)`), `Formula 1` rendered in subtle red pill (`rgba(225, 6, 0, 0.15)`).
- Governance tags: Monospace metadata pill (`Season 2026 • Verified: March 2026`) signaling strict verification.
- Outbound links: Explicit uppercase action (`READ OFFICIAL ARTICLE →` or `READ OFFICIAL REGULATION →`) accompanied by `ExternalLink` icon and secure `target="_blank" rel="noopener noreferrer"`.

---

## 4. Accessibility & Responsiveness

- All interactive controls feature minimum touch target sizes (44x44px on mobile).
- Proper semantic HTML (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`).
- High-contrast ratio compliant with WCAG AA standards (minimum 4.5:1 for body copy).
- Smooth responsive drawer for mobile navigation, with desktop navigation displaying primary pillars prominently.

---

## 5. Circuit Asset Reliability

- **WHAT**: Current calendar circuits must resolve to authentic local circuit assets (`public/circuits/*.svg`).
- **WHY**: Circuit maps are an important visual component of the product and must never appear broken, empty, or distorted.
- **HOW**: Calendar session sync → Normalized circuit ID → Circuit registry (`CIRCUIT_SOURCE_MAPPING` & `F1_CIRCUITS_REGISTRY`) → Local SVG path resolved via `import.meta.env.BASE_URL` → `<CircuitMap />` rendering.
- **BOUNDARY**: Do NOT use random external images, hotlinked CDN assets, or manually approximated SVG paths. If an asset cannot load, render the uniform application fallback:
  ```
  CIRCUIT MAP UNAVAILABLE
  Circuit layout is currently unavailable.
  ```

---

## 6. Authentication Navigation Hierarchy

- **WHAT**: Logged-out users see lightweight, compact secondary authentication actions alongside the prominent primary contextual action.
- **WHY**: "Sign In" and "Join the League" should never compete visually with the primary race/prediction CTA (`NEXT PREDICTION` / `PREDICT NOW`), nor should they cause horizontal overflow or clipped text labels.
- **HOW**:
  - **PRIMARY CTA**: `PredictionCTA` with bold red background (`--f1-red`), 36px height, uppercase monospace typography, and luminous glow.
  - **SECONDARY ACTIONS**:
    - `SIGN IN`: Subtle ghost button (transparent background, `--text-secondary`, compact 30px height, subtle hover highlight).
    - `JOIN THE LEAGUE`: Compact outlined action (`1px solid rgba(255, 255, 255, 0.2)`), collapsing to responsive `JOIN` label on viewports `< 1280px`.
- **BOUNDARY**: Do NOT remove authentication actions, do NOT hide them arbitrarily without accessible alternatives, and do NOT make them visually dominate the navigation bar.

