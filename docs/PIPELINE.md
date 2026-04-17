# Pipeline

All stages run in the backend (`server/pipeline/`). Triggered on every `POST /api/reviews/ingest`. Also callable stage-by-stage via `POST /api/demo/run` (SSE stream).

---

## Stage 1 — Normalize (`normalize.js`)

**Input:** Raw review JSON  
**External call:** Sarvam AI API  
**Output:** `{ normalized_text: string, detected_language: string }`

- Handles: multilingual input (English, Hindi, Hinglish, Kannada), emojis, slang, broken grammar, code-switching, incomplete sentences
- Image/video reviews: `transcript` field is used as input instead of `review_text`
- Output is clean, concise, professional-form English

---

## Stage 2 — Trust Filter (`trust.js`)

**Input:** Normalized review  
**Output:** `{ pass: boolean, reason: string | null }`

| Check | Method |
|-------|--------|
| Exact deduplication | Hash of normalized text vs DB |
| Near-duplicate clustering | Cosine similarity > 0.92 threshold |
| Bot/spam detection | Heuristics: submission velocity, generic phrasing patterns, rating anomalies |

Rejected reviews are stored with `status: "flagged"`. Flagged count is surfaced in dashboard.

---

## Stage 3 — Feature Extraction & Sentiment (`extract.js`)

**Input:** Normalized text  
**Output:** `{ features: { [feature_name]: { sentiment: "positive"|"negative", score: float } } }`

Predefined features:
- `battery_life`, `packaging`, `build_quality`, `customer_support`, `delivery_speed`, `value_for_money`, `performance`

Each review may tag 1–N features. Each tagged feature gets a sentiment polarity and a score (0–1).

---

## Stage 4 — Graph Integration (`graph.js`)

**Input:** Feature-sentiment output + review metadata  
**Output:** Graph node created in DB; edges drawn to existing nodes

Node fields: `review_id`, `features[]`, `sentiments[]`, `platform`, `week`, `product_id`

Edge weight formula:
```
weight = (feature_overlap * 0.5) + (sentiment_match * 0.3) + (week_proximity * 0.2)
```

Edge is created if `weight > 0.4`.

### Cluster Classification

Run after each new node is added:

| Cluster Type | Detection Condition |
|-------------|---------------------|
| Systemic | Dense cluster (≥8 nodes) spanning ≥3 weeks, same feature, same sentiment |
| Batch | Dense cluster (≥5 nodes) within ≤2 week window |
| Isolated | Node with no edges above threshold |

---

## Stage 5 — Time-Series Analysis (`timeseries.js`)

**Input:** All graph nodes for a product, grouped by week  
**Output:** Weekly sentiment trajectory per feature; trend direction; spike flags

- X-axis: weeks (up to 24 weeks of history)
- Detects: rising/falling sentiment, spikes, emerging issue clusters (new dense groupings forming in recent 2 weeks)
- Timeline markers: hardcoded product update events stored per product in DB, overlaid on trend charts
- `what_changed_this_week`: compares current week avg sentiment vs prior week per feature → returns `"up" | "down" | "stable"`

---

## Stage 6 — Confidence Scoring & Ranking (`confidence.js`)

**Input:** Classified cluster + time-series output  
**Output:** `{ confidence: float, confidence_level: "green"|"yellow"|"red", priority_rank: int }`

```
confidence = (frequency_score * 0.4) + (cluster_density * 0.35) + (sentiment_consistency * 0.25)
```

| Range | Level | Color |
|-------|-------|-------|
| 0.75–1.0 | High | Green — act immediately |
| 0.45–0.74 | Medium | Yellow — monitor |
| 0.0–0.44 | Low | Red — gather more data |

Issues ranked by `confidence × severity_weight`. Top issues surfaced in recommendations panel.

---

## Stage 7 — Adaptive Feedback (`feedback.js`)

**Input:** Classified issue + original review  
**External call:** Gemini API  
**Output:** Survey question(s) dispatched to user (simulated); responses stored in DB

Gemini prompt template:
> "Given this customer review and the detected issue ({feature}, {type}), generate 2 short follow-up survey questions to clarify whether this issue is general or segment-specific."

Survey responses feed back to confidence scoring — validated issues get confidence boost; contradicted ones get reduced.
