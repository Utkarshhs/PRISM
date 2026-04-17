// ─────────────────────────────────────────────────────────────
// PRISM API Layer
// Currently uses mock data. To connect to real backend:
// 1. Set BASE_URL = 'http://localhost:5000/api'
// 2. Replace each `return simulateResponse(...)` with a fetch() call
// ─────────────────────────────────────────────────────────────

import {
  DASHBOARD_DATA,
  ALL_PRODUCTS_LEADERBOARD,
  MOCK_ALERTS,
  MOCK_REVIEWS,
  PRODUCTS,
} from '../mock/data';

const BASE_URL = 'http://localhost:5000/api';
const USE_MOCK = true; // flip to false when backend is ready

const simulateResponse = (data, delay = 80) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// ── GET /dashboard/:productId ──
export async function getDashboard(productId, { platform = 'all', week_range = 24 } = {}) {
  if (USE_MOCK) {
    const data = DASHBOARD_DATA[productId] || DASHBOARD_DATA['prod-001'];
    if (platform !== 'all') {
      const platformData = data.platform_comparison[platform];
      return simulateResponse({
        ...data,
        health_score: platformData?.health_score ?? data.health_score,
        feature_sentiment: platformData?.feature_sentiment ?? data.feature_sentiment,
      });
    }
    return simulateResponse(data);
  }
  const params = new URLSearchParams({ platform, week_range });
  const res = await fetch(`${BASE_URL}/dashboard/${productId}?${params}`);
  return res.json();
}

// ── GET /dashboard/all ──
export async function getAllProducts() {
  if (USE_MOCK) return simulateResponse(ALL_PRODUCTS_LEADERBOARD);
  const res = await fetch(`${BASE_URL}/dashboard/all`);
  return res.json();
}

// ── GET /alerts ──
export async function getAlerts() {
  if (USE_MOCK) return simulateResponse(MOCK_ALERTS);
  const res = await fetch(`${BASE_URL}/alerts`);
  return res.json();
}

// ── GET /reviews/:productId ──
export async function getReviews(productId, { page = 1, limit = 10, feature = null, sentiment = null, platform = null } = {}) {
  if (USE_MOCK) {
    let reviews = MOCK_REVIEWS.filter((r) => r.product_id === productId);
    if (feature) reviews = reviews.filter((r) => r.features?.[feature]);
    if (sentiment) reviews = reviews.filter((r) => r.features && Object.values(r.features).includes(sentiment));
    if (platform) reviews = reviews.filter((r) => r.platform === platform);
    const total = reviews.length;
    const paginated = reviews.slice((page - 1) * limit, page * limit);
    return simulateResponse({ reviews: paginated, total, page });
  }
  const params = new URLSearchParams({ page, limit, ...(feature && { feature }), ...(sentiment && { sentiment }), ...(platform && { platform }) });
  const res = await fetch(`${BASE_URL}/reviews/${productId}?${params}`);
  return res.json();
}

// ── POST /reviews/ingest ──
export async function ingestReview(reviewData) {
  if (USE_MOCK) {
    return simulateResponse({
      review_id: `rev-${Date.now()}`,
      status: 'queued',
      pipeline_triggered: true,
    }, 300);
  }
  const res = await fetch(`${BASE_URL}/reviews/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  return res.json();
}

// ── POST /reports/generate ──
export async function generateReport(productId, platform = 'all') {
  if (USE_MOCK) {
    return simulateResponse({ report_url: '/reports/mock-report.pdf' }, 2000);
  }
  const res = await fetch(`${BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, platform }),
  });
  return res.json();
}

// ── POST /demo/run (SSE) ──
// Returns an EventSource when real backend is ready.
// In mock mode, returns a fake async iterator that emits events with delays.
export function runDemoStream(reviewData, onStage, onDone) {
  if (USE_MOCK) {
    const mockStages = [
      { stage: 1, name: 'Validation & Ingestion', status: 'pass', detail: 'Not duplicate. Schema valid. Review ID assigned.' },
      { stage: 2, name: 'Normalization', status: 'pass', result: 'Cleaned and normalized to English.' },
      { stage: 3, name: 'Trust Filter', status: 'pass', detail: 'Passed dedup and spam checks.' },
      { stage: 4, name: 'Feature Extraction', status: 'pass', features: { packaging: 'negative', build_quality: 'positive' } },
      { stage: 5, name: 'Graph Integration', status: 'pass', detail: 'Node created. 3 edges drawn (weight > 0.4).' },
      { stage: 6, name: 'Time-Series Analysis', status: 'pass', detail: 'Weekly trend updated. Packaging trending down.' },
      { stage: 7, name: 'Confidence Scoring', status: 'pass', detail: 'Confidence: 0.87 (High). Priority rank: #1.' },
      { stage: 8, name: 'Adaptive Feedback', status: 'pass', detail: 'Gemini generated 2 follow-up survey questions.' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < mockStages.length) {
        onStage(mockStages[i]);
        i++;
      } else {
        clearInterval(interval);
        onDone({ insight_delta: { health_score: 74, new_issue: null } });
      }
    }, 600);

    return () => clearInterval(interval); // cleanup function
  }

  const source = new EventSource(`${BASE_URL}/demo/run`);
  source.addEventListener('stage', (e) => onStage(JSON.parse(e.data)));
  source.addEventListener('done', (e) => {
    onDone(JSON.parse(e.data));
    source.close();
  });
  return () => source.close();
}

export { PRODUCTS };
