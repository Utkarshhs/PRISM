// ─────────────────────────────────────────────────────────────
// PRISM Mock Data — matches backend API contracts exactly.
// When backend is ready: replace `return mockData` in api/index.js
// with real fetch() calls. Zero other changes needed.
// ─────────────────────────────────────────────────────────────

export const PRODUCTS = [
  {
    product_id: 'prod-001',
    name: 'Aether Buds Pro',
    description: 'True wireless earbuds with active noise cancellation',
    price: 4999,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    platform_prices: { amazon: 4799, flipkart: 4899, jiomart: 4999, brand: 4699 },
  },
  {
    product_id: 'prod-002',
    name: 'FlowBot Vacuum X3',
    description: 'Smart robot vacuum with LiDAR mapping',
    price: 19999,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    platform_prices: { amazon: 18999, flipkart: 19499, jiomart: 19999, brand: 18499 },
  },
  {
    product_id: 'prod-003',
    name: 'NovaCam 4K',
    description: '4K action camera with 3-axis gimbal stabilization',
    price: 12999,
    image_url: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=400',
    platform_prices: { amazon: 12499, flipkart: 12999, jiomart: 12999, brand: 12299 },
  },
  {
    product_id: 'prod-004',
    name: 'ZenCharge 65W',
    description: 'GaN charger with 4-port fast charging hub',
    price: 2999,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    platform_prices: { amazon: 2799, flipkart: 2899, jiomart: 2999, brand: 2699 },
  },
];

export const FEATURE_COLORS = {
  battery_life: '#3b82f6',
  packaging: '#f59e0b',
  build_quality: '#8b5cf6',
  customer_support: '#10b981',
  delivery_speed: '#06b6d4',
  value_for_money: '#f97316',
  performance: '#ec4899',
};

export const FEATURE_LABELS = {
  battery_life: 'Battery Life',
  packaging: 'Packaging',
  build_quality: 'Build Quality',
  customer_support: 'Customer Support',
  delivery_speed: 'Delivery Speed',
  value_for_money: 'Value for Money',
  performance: 'Performance',
};

// ── Generate 24 weeks of trend data ──
const generateWeeklyTrends = (seed = 0) => {
  const weeks = [];
  const base = {
    battery_life: 0.62 + seed * 0.05,
    packaging: 0.38 - seed * 0.03,
    build_quality: 0.71 + seed * 0.02,
    customer_support: 0.55,
    delivery_speed: 0.68,
    value_for_money: 0.59,
    performance: 0.74 + seed * 0.04,
  };

  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const year = date.getFullYear();
    const week = Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / 604800000);
    const noise = () => (Math.random() - 0.5) * 0.12;
    weeks.push({
      week: `${year}-W${String(week).padStart(2, '0')}`,
      battery_life: Math.max(0.1, Math.min(1, base.battery_life + noise())),
      packaging: Math.max(0.1, Math.min(1, base.packaging + noise())),
      build_quality: Math.max(0.1, Math.min(1, base.build_quality + noise())),
      customer_support: Math.max(0.1, Math.min(1, base.customer_support + noise())),
      delivery_speed: Math.max(0.1, Math.min(1, base.delivery_speed + noise())),
      value_for_money: Math.max(0.1, Math.min(1, base.value_for_money + noise())),
      performance: Math.max(0.1, Math.min(1, base.performance + noise())),
    });
  }
  return weeks;
};

// ── Generate D3 graph nodes & edges ──
const generateGraphData = (productId) => {
  const features = Object.keys(FEATURE_COLORS);
  const sentiments = ['positive', 'negative'];
  const nodes = [];
  const edges = [];
  const nodeCount = 45;

  for (let i = 0; i < nodeCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 168));
    nodes.push({
      id: `node-${productId}-${i}`,
      feature: features[Math.floor(Math.random() * features.length)],
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      week: `2024-W${String(Math.floor(Math.random() * 24) + 1).padStart(2, '0')}`,
      review_snippet: REVIEW_SNIPPETS[Math.floor(Math.random() * REVIEW_SNIPPETS.length)],
      cluster_type: ['systemic', 'batch', 'isolated'][Math.floor(Math.random() * 3)],
    });
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const weight =
        (nodes[i].feature === nodes[j].feature ? 0.5 : 0) +
        (nodes[i].sentiment === nodes[j].sentiment ? 0.3 : 0) +
        Math.random() * 0.3;
      if (weight > 0.5) {
        edges.push({ source: nodes[i].id, target: nodes[j].id, weight: Math.min(weight, 1) });
      }
    }
  }

  return { nodes, edges };
};

const REVIEW_SNIPPETS = [
  'Battery life is incredible, lasts 2 days easily',
  'Packaging was damaged on arrival, very disappointing',
  'Sound quality is outstanding for the price',
  'Customer support took 5 days to respond',
  'Delivery was faster than expected!',
  'Build quality feels premium and sturdy',
  'Worth every penny, great value for money',
  'Performance is top notch, no lag at all',
  'The packaging needs improvement, box was crushed',
  'Amazing product, highly recommend!',
  'Stopped working after 2 weeks, very poor quality',
  'Support team was helpful and resolved my issue quickly',
  'Delivery was delayed by 3 days without notification',
  'Battery drains too fast, not as advertised',
  'Feels cheap but works perfectly fine',
];

// ── Dashboard responses per product ──
const createDashboardResponse = (productId, idx) => {
  const scores = [72, 61, 84, 68];
  const reviewCounts = [347, 289, 412, 203];
  const flaggedCounts = [14, 22, 9, 17];

  return {
    product_id: productId,
    health_score: scores[idx],
    review_count: reviewCounts[idx],
    flagged_count: flaggedCounts[idx],
    feature_sentiment: {
      battery_life: { positive: 0.72, negative: 0.28, count: 87 + idx * 10 },
      packaging: { positive: 0.31, negative: 0.69, count: 64 + idx * 5 },
      build_quality: { positive: 0.81, negative: 0.19, count: 102 + idx * 8 },
      customer_support: { positive: 0.55, negative: 0.45, count: 48 + idx * 3 },
      delivery_speed: { positive: 0.68, negative: 0.32, count: 76 + idx * 6 },
      value_for_money: { positive: 0.59, negative: 0.41, count: 93 + idx * 7 },
      performance: { positive: 0.77, negative: 0.23, count: 118 + idx * 9 },
    },
    product_summary:
      scores[idx] >= 80
        ? `Overwhelmingly Positive (${scores[idx]}% positive, ${reviewCounts[idx]} reviews), driven by Performance (28%) and Build Quality (22%) strengths`
        : scores[idx] >= 65
        ? `Mostly Positive (${scores[idx]}% positive, ${reviewCounts[idx]} reviews), with Packaging (25%) and Customer Support (18%) needing attention`
        : `Moderately Positive (${scores[idx]}% positive, ${reviewCounts[idx]} reviews), driven by Battery Life (42%) and Packaging (25%) issues`,
    issues: [
      {
        issue_id: `issue-${productId}-1`,
        feature: 'packaging',
        type: 'batch',
        severity: 'high',
        confidence: 0.87,
        confidence_level: 'green',
        affected_pct: 0.42,
        recommendation: 'Investigate packaging process for recent batches — 42% of reviewers report damage on arrival',
      },
      {
        issue_id: `issue-${productId}-2`,
        feature: 'customer_support',
        type: 'systemic',
        severity: 'medium',
        confidence: 0.61,
        confidence_level: 'yellow',
        affected_pct: 0.28,
        recommendation: 'Reduce average response time — customers consistently report 4–7 day delays',
      },
      {
        issue_id: `issue-${productId}-3`,
        feature: 'battery_life',
        type: 'isolated',
        severity: 'low',
        confidence: 0.34,
        confidence_level: 'red',
        affected_pct: 0.12,
        recommendation: 'Monitor battery drain reports — small cluster emerging, gather more data before action',
      },
    ],
    weekly_trends: generateWeeklyTrends(idx),
    what_changed_this_week: {
      battery_life: 'up',
      packaging: 'down',
      build_quality: 'stable',
      customer_support: 'down',
      delivery_speed: 'up',
      value_for_money: 'stable',
      performance: 'up',
    },
    graph_data: generateGraphData(productId),
    platform_comparison: {
      amazon: {
        health_score: scores[idx] + 4,
        feature_sentiment: {
          battery_life: { positive: 0.75, negative: 0.25, count: 32 },
          packaging: { positive: 0.28, negative: 0.72, count: 28 },
          build_quality: { positive: 0.84, negative: 0.16, count: 41 },
          customer_support: { positive: 0.58, negative: 0.42, count: 19 },
          delivery_speed: { positive: 0.71, negative: 0.29, count: 30 },
          value_for_money: { positive: 0.62, negative: 0.38, count: 35 },
          performance: { positive: 0.79, negative: 0.21, count: 44 },
        },
      },
      flipkart: {
        health_score: scores[idx] - 6,
        feature_sentiment: {
          battery_life: { positive: 0.68, negative: 0.32, count: 28 },
          packaging: { positive: 0.35, negative: 0.65, count: 22 },
          build_quality: { positive: 0.78, negative: 0.22, count: 33 },
          customer_support: { positive: 0.51, negative: 0.49, count: 15 },
          delivery_speed: { positive: 0.64, negative: 0.36, count: 24 },
          value_for_money: { positive: 0.55, negative: 0.45, count: 29 },
          performance: { positive: 0.74, negative: 0.26, count: 36 },
        },
      },
      jiomart: {
        health_score: scores[idx] - 2,
        feature_sentiment: {
          battery_life: { positive: 0.71, negative: 0.29, count: 15 },
          packaging: { positive: 0.33, negative: 0.67, count: 8 },
          build_quality: { positive: 0.80, negative: 0.20, count: 18 },
          customer_support: { positive: 0.54, negative: 0.46, count: 8 },
          delivery_speed: { positive: 0.66, negative: 0.34, count: 13 },
          value_for_money: { positive: 0.58, negative: 0.42, count: 18 },
          performance: { positive: 0.76, negative: 0.24, count: 21 },
        },
      },
      brand: {
        health_score: scores[idx] + 8,
        feature_sentiment: {
          battery_life: { positive: 0.78, negative: 0.22, count: 12 },
          packaging: { positive: 0.42, negative: 0.58, count: 6 },
          build_quality: { positive: 0.88, negative: 0.12, count: 10 },
          customer_support: { positive: 0.62, negative: 0.38, count: 6 },
          delivery_speed: { positive: 0.75, negative: 0.25, count: 9 },
          value_for_money: { positive: 0.65, negative: 0.35, count: 11 },
          performance: { positive: 0.82, negative: 0.18, count: 17 },
        },
      },
    },
  };
};

export const DASHBOARD_DATA = {
  'prod-001': createDashboardResponse('prod-001', 0),
  'prod-002': createDashboardResponse('prod-002', 1),
  'prod-003': createDashboardResponse('prod-003', 2),
  'prod-004': createDashboardResponse('prod-004', 3),
};

export const ALL_PRODUCTS_LEADERBOARD = PRODUCTS.map((p, i) => ({
  product_id: p.product_id,
  name: p.name,
  health_score: DASHBOARD_DATA[p.product_id].health_score,
  image_url: p.image_url,
  review_count: DASHBOARD_DATA[p.product_id].review_count,
}));

export const MOCK_ALERTS = [
  {
    alert_id: 'alert-001',
    product_id: 'prod-001',
    feature: 'packaging',
    triggered_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    severity: 'high',
    message: 'Packaging negative sentiment crossed 60% threshold this week (69%)',
  },
  {
    alert_id: 'alert-002',
    product_id: 'prod-002',
    feature: 'customer_support',
    triggered_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    severity: 'medium',
    message: 'Customer support satisfaction dropped 18% week-over-week',
  },
  {
    alert_id: 'alert-003',
    product_id: 'prod-003',
    feature: 'delivery_speed',
    triggered_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    severity: 'low',
    message: 'Delivery speed complaints spiking — emerging cluster detected',
  },
];

export const MOCK_REVIEWS = [
  {
    review_id: 'rev-001',
    product_id: 'prod-001',
    platform: 'amazon',
    review_text: 'Absolutely love the noise cancellation! Battery lasts all day even with ANC on. The packaging was a bit bent but the product is fine.',
    rating: 5,
    user_id: 'user-1234',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    features: { battery_life: 'positive', packaging: 'negative' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-002',
    product_id: 'prod-001',
    platform: 'flipkart',
    review_text: 'Sound quality thik hai par delivery mein 5 din extra lag gaye. Support se baat ki toh koi help nahi mili.',
    rating: 3,
    user_id: 'user-5678',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 18).toISOString(),
    features: { delivery_speed: 'negative', customer_support: 'negative' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-003',
    product_id: 'prod-001',
    platform: 'amazon',
    review_text: 'Build quality is outstanding, feels very premium. Performance is snappy and responsive.',
    rating: 5,
    user_id: 'user-9012',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 36).toISOString(),
    features: { build_quality: 'positive', performance: 'positive' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-004',
    product_id: 'prod-001',
    platform: 'jiomart',
    review_text: 'Packaging was completely damaged. Product seems ok but unboxing experience was terrible.',
    rating: 2,
    user_id: 'user-3456',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    features: { packaging: 'negative' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-005',
    product_id: 'prod-001',
    platform: 'brand',
    review_text: 'Great value for money. Performance exceeds expectations for this price range.',
    rating: 4,
    user_id: 'user-7890',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 72).toISOString(),
    features: { value_for_money: 'positive', performance: 'positive' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-006',
    product_id: 'prod-001',
    platform: 'amazon',
    review_text: 'Battery drains fast when using multiple features simultaneously. Disappointed.',
    rating: 3,
    user_id: 'user-2345',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 96).toISOString(),
    features: { battery_life: 'negative' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-007',
    product_id: 'prod-001',
    platform: 'flipkart',
    review_text: 'Excellent product! Customer support was very helpful when I had a connectivity issue.',
    rating: 5,
    user_id: 'user-6789',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 120).toISOString(),
    features: { customer_support: 'positive' },
    pipeline_status: 'processed',
  },
  {
    review_id: 'rev-008',
    product_id: 'prod-001',
    platform: 'amazon',
    review_text: 'Delivery was superfast, arrived next day! Build quality feels solid and premium.',
    rating: 5,
    user_id: 'user-1122',
    media_type: 'none',
    timestamp: new Date(Date.now() - 1000 * 3600 * 144).toISOString(),
    features: { delivery_speed: 'positive', build_quality: 'positive' },
    pipeline_status: 'processed',
  },
];

export const PIPELINE_STAGES = [
  {
    stage: 1,
    name: 'Validation & Ingestion',
    description: 'Validates schema, checks required fields, assigns review_id',
    icon: '✓',
    color: '#3b82f6',
  },
  {
    stage: 2,
    name: 'Normalization (Sarvam AI)',
    description: 'Detects language, normalizes multilingual text to clean English',
    icon: '🌐',
    color: '#8b5cf6',
  },
  {
    stage: 3,
    name: 'Trust Filter',
    description: 'Exact dedup hash check, near-duplicate cosine similarity, spam/bot detection',
    icon: '🛡',
    color: '#06b6d4',
  },
  {
    stage: 4,
    name: 'Feature Extraction & Sentiment',
    description: 'Tags 7 product features with sentiment polarity and confidence score',
    icon: '🔍',
    color: '#10b981',
  },
  {
    stage: 5,
    name: 'Graph Integration',
    description: 'Creates graph node, calculates edge weights, classifies cluster type',
    icon: '🕸',
    color: '#f59e0b',
  },
  {
    stage: 6,
    name: 'Time-Series Analysis',
    description: 'Aggregates weekly trends, detects spikes, computes what_changed_this_week',
    icon: '📈',
    color: '#f97316',
  },
  {
    stage: 7,
    name: 'Confidence Scoring & Ranking',
    description: 'Computes confidence formula, maps to green/yellow/red, ranks issues',
    icon: '⚡',
    color: '#ec4899',
  },
  {
    stage: 8,
    name: 'Adaptive Feedback (Gemini AI)',
    description: 'Generates follow-up survey questions to validate and refine issue confidence',
    icon: '🤖',
    color: '#22c55e',
  },
];
