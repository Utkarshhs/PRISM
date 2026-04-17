# PRISM — Frontend Development Progress

> **Last Updated:** April 17, 2026 (Evening)
> **Status:** ✅ Frontend Complete — Integration-Ready
> **Author:** Antigravity AI (Frontend Developer)

---

## 📌 Project Overview

**PRISM** (Product Review Intelligence & Sentiment Monitor) is an AI-powered customer review analytics platform built for a hackathon. The system ingests reviews from multiple e-commerce platforms, processes them through an 8-stage AI pipeline, and displays real-time insights on a professional analytics dashboard.

This document tracks every piece of frontend work completed — what was built, why it was built that way, and how it connects to the rest of the system.

---

## 🗓️ What Was Done — Session-by-Session

---

### Phase 1 — Project Bootstrap & Design System

**Goal:** Create the React project from scratch with a professional design foundation.

#### ✅ Vite + React Project Initialized (`client/`)
- Used `npm create vite@latest` to scaffold a React 19 project inside the `client/` folder
- This gives us blazing-fast Hot Module Replacement (HMR) during development — the browser updates in <100ms when you change a file, with no full page refresh

#### ✅ Dependencies Installed
The following packages were added to `client/package.json`:

| Package | Purpose |
|---------|---------|
| `tailwindcss@3` | Utility-first CSS framework for rapid styling |
| `framer-motion` | Smooth, physics-based animations (entry animations, counters, panel slides) |
| `recharts` | React-native chart library for the 16-week trend line chart |
| `d3` | Low-level data visualization library for the force-directed graph network |
| `zustand` | Lightweight global state management (cross-panel filtering) |
| `socket.io-client` | Real-time WebSocket support for live review ingestion |
| `clsx` | Conditional CSS class merging utility |

#### ✅ Tailwind Design System Configured (`tailwind.config.js`)
We didn't use default Tailwind colors. Instead, a custom dark-enterprise color palette was defined:

```js
colors: {
  'prism-bg': '#080d14',       // Page background — near-black navy
  'prism-card': '#0f1923',     // Card surfaces
  'prism-surface': '#111c27',  // Elevated panels
  'prism-border': '#1e2d3d',   // Subtle borders
}
```

**Feature-to-color mapping** was also defined and kept consistent across ALL components. This means the color for "Battery Life" is always the same blue dot on the sentiment bars, the trend chart, the graph nodes, and the issue cards:

```js
battery_life:     '#3b82f6'  // blue
packaging:        '#f59e0b'  // amber
build_quality:    '#8b5cf6'  // violet
customer_support: '#10b981'  // green
delivery_speed:   '#06b6d4'  // cyan
value_for_money:  '#f97316'  // orange
performance:      '#ec4899'  // pink
```

#### ✅ Global CSS Foundation (`src/index.css`)
- Imported **Inter** font from Google Fonts for a modern, professional typeface
- Defined `.card` utility class: dark background, border, border-radius, subtle hover effect
- Defined `.glass` class for frosted-glass tooltips and overlays
- Defined `.skeleton` class: animated shimmer effect that shows while data is loading
- Defined custom scrollbar styles (thin, dark, matching the dark theme)
- Defined `.animate-pulse-slow` for the live green indicator dots

---

### Phase 2 — Mock Data Layer & API Wrapper

**Goal:** Make the entire frontend fully testable without a backend, while being trivially easy to switch to real API calls.

#### ✅ Mock Data (`src/mock/data.js`)
This file contains realistic fake data that mirrors exactly what the real backend API will return. It includes:

- **4 Products:** Aether Buds Pro (earbuds), FlowBot Vacuum X3 (robot vacuum), NovaCam 4K (action camera), ZenCharge 65W (GaN charger)
- **Dashboard Data per Product:** health score (0-100), review count, flagged count, product summary string, feature sentiment breakdown for all 7 features, weekly trend data for 24 weeks, graph nodes and edges, and a list of prioritized issues
- **24 weeks of trend data:** Each week has sentiment values (0.0–1.0) for each of the 7 features, with realistic fluctuation to produce visible chart lines
- **Graph data:** 30 review nodes with cluster type (Systemic / Batch / Isolated) and feature category, plus edge connections representing similarity between reviews
- **Issues list:** 3 prioritized issues per product with feature, cluster type, severity, affected reviewer percentage, confidence score, and recommended action
- **57 seed reviews:** Real-sounding reviews in English and Hinglish (Hindi + English mix), spread across 4 products and 4 platforms, covering positive, negative, and neutral sentiments
- **8 Pipeline stages:** Names, descriptions, and progress data for the Demo Center animation
- **Alerts:** 3 active alerts with severity levels and triggered-at timestamps

#### ✅ API Wrapper (`src/api/index.js`)
The API wrapper has a **single flag** at the top:

```js
const USE_MOCK = true;
```

When `USE_MOCK = true`, every function returns mock data with a small artificial delay (200-400ms) to simulate real network latency. When switched to `false`, the same functions make real `fetch()` calls to `http://localhost:5000/api/...`.

**Functions implemented:**
- `getDashboard(productId, options)` → fetches the full dashboard payload
- `getAllProducts()` → fetches the product list for the navbar dropdown
- `getReviews(productId, options)` → fetches paginated reviews
- `getAlerts()` → fetches active alerts
- `generateReport(productId, platform)` → triggers PDF report generation
- `runDemoStream(reviewData, onStage, onComplete)` → simulates the SSE stream for the Demo Center (fires one stage callback every ~700ms, then calls onComplete with the final delta)

---

### Phase 3 — Global State Management

**Goal:** All dashboard panels must stay in sync. When you click "Packaging" on the sentiment bars, the graph should highlight Packaging nodes, the trend chart should highlight the Packaging line, and the review list should filter to Packaging reviews — without passing props through 6 levels of components.

#### ✅ Zustand Store (`src/store/index.js`)
Zustand was chosen over Redux because it's much simpler — no boilerplate, no reducers, no dispatch. The store holds:

| State | Type | Purpose |
|-------|------|---------|
| `activeProductId` | string | Currently selected product |
| `activePlatform` | string | `'all'` or `'amazon'` / `'flipkart'` / etc. |
| `activeFeature` | string or null | Currently highlighted feature (e.g. `'packaging'`) |
| `dashboardData` | object | Full API response for the active product |
| `allProducts` | array | All products for the navbar dropdown |
| `reviews` | array | Current page of reviews |
| `reviewsTotal` | number | Total review count for pagination |
| `reviewsPage` | number | Current page number |
| `alerts` | array | Active alerts |
| `isAlertPanelOpen` | boolean | Whether the alert panel is visible |
| `isLoadingDashboard` | boolean | Controls skeleton shimmer visibility |

---

### Phase 4 — Navigation Bar

#### ✅ Navbar (`src/components/Layout/Navbar.jsx`)

The navbar is **sticky** (always visible at the top while scrolling) and contains:

1. **PRISM Logo** — hex icon + "PRISM Review Intelligence" wordmark
2. **Product Selector Dropdown** — shows all 4 products with thumbnail images and prices. Clicking one updates `activeProductId` in the store, which triggers every component on the page to re-fetch and re-render
3. **Platform Toggle** — pill buttons: `All | Amazon | Flipkart | JioMart | Brand`. Clicking one filters all dashboard data to that platform's reviews only
4. **Export PDF Button** — triggers `generateReport()` API call. Shows loading spinner → success checkmark. (Backend stub — fully wired up, just needs the real endpoint)
5. **Simulation Pages Dropdown** — opens links to all 4 simulation pages on `localhost:5174`. Shows each platform's brand color and an external link indicator
6. **Alert Bell** — shows a red badge with unread alert count. Click to toggle the slide-down alert panel
7. **Alert Panel** — animated panel that slides out below the navbar showing all active alerts with severity-coded dots. Each alert is individually dismissible

---

### Phase 5 — Dashboard Components (6 Sections)

All components are animated with Framer Motion entry transitions (fade + slide up, staggered by delay so panels appear one by one as the page loads).

---

#### ✅ Section 1: Product Health Overview

**`HealthScoreCard.jsx`**
- Displays the product's overall health score (0–100) as an animated **circular ring gauge**
- The ring is drawn with SVG — the `stroke-dashoffset` animates from full (empty ring) to the correct percentage over 1.2 seconds
- A number counter animates from 0 to the score value simultaneously
- Color is dynamic: green (≥70), yellow (50–69), red (<50)
- Shows two stat boxes below: total reviews and flagged/excluded review count

**`ProductSummaryBanner.jsx`**
- Styled like a Steam game review banner (e.g., "Mostly Positive")
- Background is tinted green/yellow/red based on health score
- Shows the AI-generated sentiment summary string (e.g., *"Mostly Positive (72% positive, 347 reviews), with Packaging (25%) and Customer Support (18%) needing attention"*)

**`ProductLeaderboard.jsx`**
- Ranked list of all 4 products by health score
- Currently active product is highlighted with a blue background
- Animated progress bars expand from 0 to the score width on mount
- Rank #1 has a gold medal icon, #2 silver, #3 bronze
- Clicking a product in the leaderboard switches the active product in the navbar

---

#### ✅ Section 2: Feature Analysis

**`FeatureSentimentBars.jsx`** ← *The most interactive component*
- Shows all 7 features as clickable dual-bar rows
- Each row: feature color dot + name, then a positive bar (green) and negative bar (red) side by side showing the % split, plus a review count in parentheses
- **Clicking any feature sets `activeFeature` in the Zustand store**, which causes:
  - The trend chart to highlight that feature's line and dim all others
  - The D3 graph to highlight nodes belonging to that feature cluster
  - The review drilldown to filter to reviews mentioning that feature
  - A small "filter active" chip to appear in the navbar
- Clicking the same feature again clears the filter (toggle behavior)

**`WhatChangedStrip.jsx`**
- Shows week-over-week sentiment change for each feature
- Each feature chip shows: color dot + feature name + directional arrow + delta %
- `↑` green for improvement, `↓` red for deterioration, `→` gray for stable
- Sorted by magnitude of change so the biggest movers appear first

---

#### ✅ Section 3: Sentiment Trends

**`TrendChart.jsx`**
- A Recharts `LineChart` wrapped in `ResponsiveContainer` (takes 100% parent width)
- Shows **16 weeks** of rolling data (most recent 16 of the 24 stored weeks)
- 7 lines, one per feature, each using its assigned brand color
- **Line thickness:** 2px default, increases to 3px when hovered or when that feature's filter is active
- **Hover behavior:** Hovering a feature in the legend dims all other lines to 30% opacity, highlighting only the hovered one — no clicking required
- **Custom tooltip:** Sorted by value (highest score first), each entry shows color dot + feature name + value as a percentage
- **Product event markers:** Dashed vertical `ReferenceLine` markers for product events (firmware updates, hardware revisions, price drops) pulled from a static lookup table
- **Interactive legend:** The legend items at the bottom are real buttons, not just colored labels. Hover = highlight, Framer Motion border appearance

---

#### ✅ Section 4: AI Intelligence (Graph + Issues)

**`GraphNetwork.jsx`** (D3.js)
- **Force-directed graph** using D3's `forceSimulation`
- Nodes represent individual reviews. Node color = feature category color. Node size = review rating (larger = higher rating)
- Node border ring = cluster type: `Systemic` (red), `Batch` (amber), `Isolated` (gray)
- **Edges** connect reviews that are similar (near-duplicate language or same feature cluster)
- **Draggable:** Click and drag any node. The simulation continues to run and other nodes react to the movement
- **Hover tooltip:** Shows the review text snippet, feature, and cluster type
- **Active feature filter:** When `activeFeature` is set in the store, nodes matching that feature stay full opacity, all others dim to 15%
- Implemented entirely inside a `useEffect` with a `useRef` to avoid React re-render loops — D3 owns the DOM inside the SVG, React only controls the container and data

**`IssueList.jsx`**
- Shows the top 3 prioritized issues detected by the AI pipeline
- Each card shows: feature color dot + feature name + cluster type badge + severity badge
- "X% of reviewers affected" shown prominently
- Recommended action text (AI-generated)
- **Confidence meter:** An animated bar showing the AI's confidence in this issue (87% = High Confidence in green, 61% = Medium in yellow, etc.)
- Cards are sorted by severity (High → Medium → Low)

---

#### ✅ Section 5: Review Drilldown

**`ReviewDrilldown.jsx`**
- **Paginated review browser** — shows 10 reviews per page
- Filtering is automatic based on Zustand state:
  - If `activeFeature` is set → shows only reviews that mention that feature
  - If `activePlatform` is not 'all' → shows only reviews from that platform
  - Additional **sentiment filter** buttons (All / Positive / Negative) are built into the component header
- Each review card shows:
  - **Platform badge** (color-coded — orange for Amazon, blue for Flipkart, etc.)
  - **Star rating** (5 custom SVG stars, yellow fill up to rating value)
  - **Relative timestamp** ("2 days ago", "3 weeks ago")
  - **Review text** in readable 14px body font
  - **Feature tags** — small colored pills showing which features were detected in this review, with ↑ or ↓ sentiment indicator
- Empty state message when no reviews match the current filters
- Prev/Next pagination buttons (disabled when at the boundary)

---

#### ✅ Section 6: Demo Center (Live Pipeline)

**`DemoPipeline.jsx`**
- Select one of 4 pre-written sample reviews (covering Amazon, Flipkart, Brand, JioMart — including a Hinglish review)
- OR type/paste any custom review in the text area (English, Hindi, or Hinglish)
- Click **▶ Run Pipeline** — the mock SSE stream fires:
  - Each of the 8 stages lights up sequentially (~700ms apart)
  - Active stage shows a pulsing animated blue ring around its number
  - Completed stages show a green checkmark
  - A thin colored progress bar fills inside each card
  - The result detail text appears (e.g., "language: hinglish, normalized: ...") with a slide-in animation
- After all 8 stages complete, a **Pipeline Complete** result card appears showing the updated health score
- Reset button clears everything back to initial state
- While running, the "Run Pipeline" button shows a spinner and is disabled to prevent double-submission

**`PipelineStageCard.jsx`**
- Individual card for each of the 8 pipeline stages
- Animates between 3 visual states: Waiting (dim, 35% opacity) → Processing (full opacity, blue ring pulse) → Complete (green checkmark, full opacity)
- Progress bar inside each card fills with the stage's brand color on completion

---

### Phase 6 — PDF Export Button

**`PDFExportButton.jsx`**
- Calls `generateReport(productId, platform)` from the API layer
- 4 visual states: idle (download icon), loading (spinner), done (checkmark), error (warning)
- All state transitions are styled with matching border and background color
- When the backend returns a `report_url`, it opens the PDF in a new tab automatically
- Currently shows "Ready! (backend needed)" in done state since the backend isn't connected yet

---

### Phase 7 — Simulation Pages (4 Mock E-Commerce Sites)

**Goal:** Provide realistic e-commerce pages where a judge or user can submit a review and watch it get processed by PRISM in real time.

#### ✅ `simulation/seed-reviews.json`
- **57 realistic reviews** spread across 4 products × 4 platforms
- Covers a wide range of sentiments — packaging complaints, battery life praise, customer support frustration, build quality appreciation, Hinglish language reviews
- Used by all 4 simulation pages to pre-populate the review sections

#### ✅ `simulation/simulation.js` (Shared Logic)
A single JavaScript file shared by all 4 HTML pages. Contains:
- `loadSeedReviews(productId, platform, containerId)` — loads JSON and renders matching reviews into the container
- `renderReview(review, isNew)` — creates a styled review card DOM element
- `initReviewForm(formId, ...)` — attaches submit handler to the review form
- `initStarRating(containerId, inputName)` — creates 5 interactive star buttons with hover highlight effects
- `renderAllProducts(platform, containerId, onSelect)` — renders the 4-product grid with click handlers
- `updateCounter(count)` — updates the live "X reviews analyzed" counter in the PRISM banner

On form submit:
1. The review card is inserted at the top of the list **immediately** (optimistic UI — no waiting)
2. The review counter increments instantly
3. The form is cleared
4. A `POST` is sent to `http://localhost:5000/api/reviews/ingest` with the full review payload
5. Status banner shows "⏳ Sending to PRISM..." → "✓ Pipeline triggered (review_id...)" or "⚠ Backend offline — review saved locally" if the server isn't running

#### ✅ `simulation/amazon.html` — Amazon India
- Dark navy navbar with **orange** Amazon.in branding
- Full category subnav bar (Today's Deals, Electronics, Fashion, etc.)
- PRISM simulation banner with purple badge
- 4-product grid (earbuds, vacuum, camera, charger) with Unsplash product images
- Platform-specific prices (Amazon charges ₹4,799 for Aether Buds vs ₹4,699 on Brand)
- Review form with star rating input
- Seeded with 10 Amazon-platform reviews

#### ✅ `simulation/flipkart.html` — Flipkart
- Blue Flipkart branding (navbar, search button, buttons, active borders)
- "Explore Plus" tagline in the logo
- White subnav with hover-underline category links
- Seeded with 8 Flipkart-platform reviews

#### ✅ `simulation/jiomart.html` — JioMart
- Navy/red JioMart branding (`#002D62` navy, `#EE3030` red)
- Red subnav bar with white links
- JioMart-specific product prices

#### ✅ `simulation/brand.html` — Nexus Brand Store
- **Premium dark theme** — pure black background, gradient purple logo
- Hero section: "Engineered for Perfection" headline
- Larger product cards with taller images
- Dark form inputs with violet focus glow
- Brand-lowest prices (best prices since it's direct)
- Seeded with 5 brand-platform reviews

---

### Phase 8 — Simulation Server

#### ✅ `simserver.js` (Root-level Node.js server)
- A simple Node.js `http` module static file server (no dependencies needed)
- Serves everything inside the `simulation/` folder on **port 5174**
- CORS headers added so the simulation pages can fetch `seed-reviews.json`
- Shows a startup banner listing all 4 URLs
- Includes a 404 page with navigation links to all 4 simulation pages
- Run with: `node simserver.js`

---

### Phase 9 — Polish & Final Integration

#### ✅ Sticky Stats Strip (in `MainPage.jsx`)
A second sticky bar below the navbar that always shows:
- **347** Reviews Analyzed · **4** Platforms · **14** Flagged · **7** Features Tracked · **8** Pipeline Stages · 🟢 Live

#### ✅ Section Dividers
Gradient horizontal rules (`from-transparent via-border to-transparent`) between each of the 6 dashboard sections for visual breathing room.

#### ✅ Grid Layout Improvements
- Overview: 1-col health score + 3-col summary/leaderboard (4-col grid)
- Feature Analysis: 2-col equal split
- Trend Chart: full width
- AI Intelligence: 3-col graph + 2-col issue list (5-col grid) — gives the graph more space to breathe
- Review Drilldown: full width
- Demo Center: full width

#### ✅ Root `package.json`
Added a root-level `package.json` with convenience scripts:
```bash
npm run dev          # starts both the dashboard and sim server
npm run dev:client   # starts only the dashboard
npm run sim          # starts only the simulation server
npm run build        # builds the production bundle
```

---

### Phase 10 — Marketplace UX Upgrade (Latest)

**Goal:** Make simulation storefronts feel closer to real e-commerce journey: listing-first, then full product page, then purchase actions.

#### ✅ Listing → PDP Flow Standardized
- Moved review-heavy UI off listing pages and into product detail flow for a cleaner storefront-first experience
- Product listing pages now prioritize image, price, and product selection, similar to real marketplaces

#### ✅ Shared Commerce Experience Upgraded (`simulation/simulation.js`)
- Added full PDP shell with gallery, price/offer blocks, variant controls, buy box, and checkout interactions
- Added star-based rating UX in PDP (display + review submission)
- Added cart drawer + checkout form flow, including default delivery address prefill
- Added shared address display in buy flow: **PESITM Shivamogga, NH206 Sagar Road, Shivamogga 577204, Karnataka**

#### ✅ Amazon Page Replaced with New Template (`simulation/amazon.html`)
- Replaced prior Amazon simulation page with a dedicated large-appliances style Amazon layout
- Includes product picker (4 appliance cards), per-product detailed view, buy box, variant controls, and built-in review panel
- Retains review ingest API call path (`/api/reviews/ingest`) for hackathon backend wiring

#### ✅ Hammer Catalog Expanded (`simulation/brand.html`)
- Added 4 additional dummy products to increase storefront depth
- Updated catalog count and card metadata accordingly

---

## 📊 Build Output

```
✓ 1346 modules transformed
dist/assets/index.css    26.07 kB (gzip: 6.34 kB)
dist/assets/index.js    778.53 kB (gzip: 237 kB)
✓ built in 2.05s — 0 errors, 0 warnings
```

---

## 🔌 Backend Integration — One-Line Switch

Everything in the frontend is decoupled from the backend. When the backend is ready:

**Step 1:** Open `client/src/api/index.js`

**Step 2:** Change line 1 from:
```js
const USE_MOCK = true;
```
to:
```js
const USE_MOCK = false;
```

**Step 3:** Ensure your backend is running at `http://localhost:5000`

**That's it.** All 6 API calls (`getDashboard`, `getAllProducts`, `getReviews`, `getAlerts`, `generateReport`, `runDemoStream`) will automatically switch to real `fetch()` calls. No component-level changes needed.

The SSE stream for the Demo Center uses `EventSource` in real mode — the backend just needs to emit events in the format `{ stage: 1, result: {...} }` and PRISM will animate them in sequence.

---

## 📁 Complete File Inventory

```
PRISM-main/
├── package.json                        ← Root scripts (start all servers)
├── simserver.js                        ← Static server for simulation pages (port 5174)
│
├── simulation/
│   ├── amazon.html                     ← Amazon India mock site
│   ├── flipkart.html                   ← Flipkart mock site
│   ├── jiomart.html                    ← JioMart mock site
│   ├── brand.html                      ← Premium brand store mock site
│   ├── simulation.js                   ← Shared JS logic for all 4 pages
│   └── seed-reviews.json              ← 57 seed reviews across 4 products × 4 platforms
│
└── client/
    ├── index.html                      ← HTML entry (Inter font preload, SEO meta)
    ├── package.json                    ← npm dependencies
    ├── tailwind.config.js              ← Dark design system + feature color tokens
    ├── vite.config.js                  ← Vite build config with React plugin
    └── src/
        ├── main.jsx                    ← React app entry point
        ├── App.jsx                     ← Root component (Navbar + MainPage)
        ├── index.css                   ← Global styles, .card, .skeleton, .glass
        │
        ├── api/
        │   └── index.js               ← USE_MOCK flag + all API functions
        │
        ├── mock/
        │   └── data.js                ← Complete mock API responses + constants
        │
        ├── store/
        │   └── index.js               ← Zustand global state
        │
        ├── pages/
        │   └── MainPage.jsx           ← Full 6-section page assembly
        │
        └── components/
            ├── Layout/
            │   └── Navbar.jsx         ← Sticky nav with all controls
            │
            ├── Dashboard/
            │   ├── HealthScoreCard.jsx
            │   ├── ProductLeaderboard.jsx
            │   ├── ProductSummaryBanner.jsx
            │   ├── FeatureSentimentBars.jsx
            │   ├── WhatChangedStrip.jsx
            │   ├── IssueList.jsx
            │   ├── ReviewDrilldown.jsx
            │   └── PDFExportButton.jsx
            │
            ├── Charts/
            │   └── TrendChart.jsx     ← Recharts 16-week multi-line chart
            │
            ├── Graph/
            │   └── GraphNetwork.jsx   ← D3 force-directed graph
            │
            └── DemoCenter/
                ├── DemoPipeline.jsx   ← 8-stage animated pipeline runner
                └── PipelineStageCard.jsx
```

---

## 🧪 How to Test Everything

### Dashboard
```bash
cd client
npm run dev
# Open http://localhost:5173
```

### Simulation Pages
```bash
# From project root:
node simserver.js
# Open any of:
# http://localhost:5174/amazon.html
# http://localhost:5174/flipkart.html
# http://localhost:5174/jiomart.html
# http://localhost:5174/brand.html
```

### Test the Review Pipeline Flow
1. Open `http://localhost:5174/amazon.html`
2. Select a product and open the product detail view
3. Scroll to the reviews area and submit a star-rated review
4. Watch the review appear instantly (optimistic UI)
5. Status shows "⏳ Sending to PRISM..." (when backend is running: "✓ Pipeline triggered")
6. Switch to `http://localhost:5173` → check Demo Center for pipeline visualization

### Test Cross-Panel Filtering
1. Open `http://localhost:5173`
2. In the **Feature Analysis** section, click the **Packaging** bar
3. Watch simultaneously:
   - Packaging bar gets a highlight border
   - Trend Chart highlights only the amber Packaging line, all others dim
   - D3 Graph dims all non-Packaging nodes
   - Review Drilldown automatically filters to packaging-related reviews only
4. Click Packaging again to clear the filter
