# Architecture

## Three Distinct Parts

```
┌──────────────────────────────────────────────────┐
│           SIMULATION PAGES (Static HTML)         │
│  amazon.html / flipkart.html / jiomart.html /    │
│  brand.html                                      │
│  - Display 4 products with preloaded ~400 reviews│
│  - Timestamps spread from "just now" → 6 months  │
│  - User can add a review → shows as "just now"   │
│  - POSTs to backend API on every review add      │
└───────────────────┬──────────────────────────────┘
                    │ POST /api/reviews/ingest
┌───────────────────▼──────────────────────────────┐
│              BACKEND (Node.js/Python)            │
│  Receives reviews → runs full pipeline:          │
│  Normalize → Trust → Extract → Graph → Score     │
│  → Insights → Alerts → Recommendations           │
│  Persists to DB, exposes REST API to frontend    │
└───────────────────┬──────────────────────────────┘
                    │ REST API
┌───────────────────▼──────────────────────────────┐
│           MAIN WEB APP (React Frontend)          │
│  Fetches from backend, renders dashboard:        │
│  Health scores, trends, graph viz, alerts,       │
│  recommendations, Demo Center, PDF export        │
└──────────────────────────────────────────────────┘
```

## Key Boundaries

| Part | Tech | Role |
|------|------|------|
| Simulation pages | Static HTML + Vanilla JS | Simulate e-commerce platforms. No framework needed. |
| Backend | Node.js (Express) + Python microservice option | All intelligence logic lives here. Heavy processing. |
| Main frontend | React + Recharts/D3 | Visualization, animations, dashboard UX only. No business logic. |

## Data Flow

1. Simulation page loads → renders ~400 seed reviews from static JSON with distributed timestamps
2. User adds a review on simulation page → instantly shown as "just now" locally → POSTed to `POST /api/reviews/ingest`
3. Backend ingests → runs full 7-stage pipeline → stores result in DB
4. React frontend polls `GET /api/dashboard/:productId` → re-renders affected panels
5. WebSocket (or SSE) pushes real-time alert events to frontend when thresholds crossed
6. Demo Center calls `POST /api/demo/run` → backend streams pipeline stages back step-by-step

## Why Backend is Central

All intelligence lives in the backend — normalization (Sarvam AI), trust filtering, NLP feature extraction, graph clustering, time-series analysis, confidence scoring, Gemini survey generation, and PDF rendering. The frontend is purely presentation.
