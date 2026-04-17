import { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';
import { getDashboard, getAllProducts, getReviews } from '../api';

import HealthScoreCard from '../components/Dashboard/HealthScoreCard';
import ProductLeaderboard from '../components/Dashboard/ProductLeaderboard';
import ProductSummaryBanner from '../components/Dashboard/ProductSummaryBanner';
import FeatureSentimentBars from '../components/Dashboard/FeatureSentimentBars';
import WhatChangedStrip from '../components/Dashboard/WhatChangedStrip';
import TrendChart from '../components/Charts/TrendChart';
import GraphNetwork from '../components/Graph/GraphNetwork';
import IssueList from '../components/Dashboard/IssueList';
import ReviewDrilldown from '../components/Dashboard/ReviewDrilldown';
import DemoPipeline from '../components/DemoCenter/DemoPipeline';

// ── Section header ──
function SectionHeader({ id, badge, badgeColor = 'text-blue-400', title, subtitle }) {
  return (
    <div id={id} className="mb-6 scroll-mt-24">
      <div className={`text-xs font-semibold uppercase tracking-widest mb-1.5 ${badgeColor}`}>{badge}</div>
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-gray-200 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Skeleton shimmer ──
function Skeleton({ className = '' }) {
  return <div className={`card skeleton ${className}`} />;
}

// ── Divider ──
function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-prism-border to-transparent" />
    </div>
  );
}

export default function MainPage() {
  const {
    activeProductId,
    activePlatform,
    dashboardData,
    allProducts,
    reviews,
    reviewsTotal,
    reviewsPage,
    isLoadingDashboard,
    setDashboardData,
    setAllProducts,
    setReviews,
    setIsLoadingDashboard,
  } = useStore();

  // Scroll to top when product changes
  const mainRef = useRef(null);

  // Load all products once
  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  // Load dashboard when product or platform changes
  useEffect(() => {
    setIsLoadingDashboard(true);
    getDashboard(activeProductId, { platform: activePlatform }).then(setDashboardData);
  }, [activeProductId, activePlatform]);

  // Load reviews when product or platform changes
  const loadReviews = useCallback((page = 1) => {
    getReviews(activeProductId, { page, platform: activePlatform !== 'all' ? activePlatform : null }).then(
      (data) => setReviews(data.reviews, data.total, data.page)
    );
  }, [activeProductId, activePlatform]);

  useEffect(() => { loadReviews(1); }, [activeProductId, activePlatform]);

  const d = dashboardData;
  const loading = isLoadingDashboard || !d;

  return (
    <div className="min-h-screen pt-16" ref={mainRef}>

      {/* ── Live stats strip ── */}
      <div className="sticky top-16 z-40 border-b border-prism-border bg-prism-surface/90 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-2.5 flex items-center gap-6 overflow-x-auto scrollbar-none">
          {[
            { label: 'Reviews Analyzed', value: d ? d.review_count.toLocaleString() : '…', color: 'text-blue-300' },
            { label: 'Platforms', value: '4', color: 'text-violet-300' },
            { label: 'Flagged', value: d ? d.flagged_count.toString() : '…', color: 'text-red-300' },
            { label: 'Features Tracked', value: '7', color: 'text-green-300' },
            { label: 'Pipeline Stages', value: '8', color: 'text-amber-300' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 shrink-0">
              <span className={`text-lg font-black leading-none ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-300 leading-tight max-w-[60px]">{s.label}</span>
              {i < 4 && <span className="text-prism-border ml-3">·</span>}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-300 shrink-0 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-8 space-y-14">

        {/* ══════════════════════════════════════════
            SECTION 1 — Overview
        ══════════════════════════════════════════ */}
        <section>
          <SectionHeader
            id="overview"
            badge="Overview"
            title="Product Health Dashboard"
            subtitle={loading ? 'Loading analysis…' : d.product_summary}
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="lg:col-span-1">
              {loading
                ? <Skeleton className="h-80" />
                : <HealthScoreCard score={d.health_score} reviewCount={d.review_count} flaggedCount={d.flagged_count} />
              }
            </div>
            {/* Summary + Leaderboard */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {loading ? (
                <><Skeleton className="h-14" /><Skeleton className="h-60" /></>
              ) : (
                <>
                  <ProductSummaryBanner summary={d.product_summary} />
                  <ProductLeaderboard products={allProducts} />
                </>
              )}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            SECTION 2 — Feature Analysis
        ══════════════════════════════════════════ */}
        <section>
          <SectionHeader
            id="features"
            badge="Feature Analysis"
            title="Sentiment by Feature"
            subtitle="Click any feature to filter all panels simultaneously — graph, trends, and reviews update instantly"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              <><Skeleton className="h-80" /><Skeleton className="h-48" /></>
            ) : (
              <>
                <FeatureSentimentBars featureSentiment={d.feature_sentiment} />
                <WhatChangedStrip changes={d.what_changed_this_week} />
              </>
            )}
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            SECTION 3 — Trend Chart
        ══════════════════════════════════════════ */}
        <section>
          <SectionHeader
            id="trends"
            badge="Time Series"
            title="Sentiment Trends"
            subtitle="16-week rolling history with product event markers — hover a feature in the legend to highlight its line"
          />
          {loading ? <Skeleton className="h-96" /> : (
            <TrendChart weeklyTrends={d.weekly_trends} productId={activeProductId} />
          )}
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            SECTION 4 — AI Intelligence (Graph + Issues)
        ══════════════════════════════════════════ */}
        <section>
          <SectionHeader
            id="intelligence"
            badge="AI Intelligence"
            badgeColor="text-violet-500"
            title="Issue Intelligence"
            subtitle="Graph-based cluster analysis (D3 force simulation) · drag nodes, hover for review snippets"
          />
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-3">
              {loading ? <Skeleton className="h-[420px]" /> : <GraphNetwork graphData={d.graph_data} />}
            </div>
            <div className="xl:col-span-2">
              {loading ? <Skeleton className="h-[420px]" /> : <IssueList issues={d.issues} />}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            SECTION 5 — Review Drilldown
        ══════════════════════════════════════════ */}
        <section>
          <SectionHeader
            id="reviews"
            badge="Raw Data"
            badgeColor="text-cyan-500"
            title="Review Drilldown"
            subtitle="Paginated reviews filtered by active feature, platform, and sentiment"
          />
          <ReviewDrilldown
            reviews={reviews}
            total={reviewsTotal}
            page={reviewsPage}
            onPageChange={loadReviews}
          />
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            SECTION 6 — Demo Center
        ══════════════════════════════════════════ */}
        <section id="demo" className="scroll-mt-24">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1.5">Demo Center</div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Live Pipeline Demo</h2>
              <p className="text-sm text-gray-200 mt-1">
                Submit a review and watch all 8 AI pipeline stages fire in real time — powered by SSE streaming
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs bg-violet-500/20 border border-violet-400/40 rounded-xl px-3 py-1.5 text-violet-300">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                SSE Stream
              </div>
              <div className="flex items-center gap-2 text-xs bg-blue-500/20 border border-blue-400/40 rounded-xl px-3 py-1.5 text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                8 Stages
              </div>
            </div>
          </div>
          <DemoPipeline />
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-prism-border pt-10 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="8" cy="8" r="2.5" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-white">PRISM</div>
                <div className="text-xs text-gray-300">Customer Review Intelligence Platform</div>
              </div>
            </div>
            <div className="text-xs text-gray-300">
              Built for Hackathon 2026 · React + D3 + Recharts + Framer Motion
            </div>
            <div className="flex items-center gap-3">
              <a href="http://localhost:5174/amazon.html" target="_blank" rel="noreferrer" className="text-xs text-gray-300 hover:text-orange-300 transition-colors">Amazon Sim</a>
              <a href="http://localhost:5174/flipkart.html" target="_blank" rel="noreferrer" className="text-xs text-gray-300 hover:text-blue-300 transition-colors">Flipkart Sim</a>
              <a href="http://localhost:5174/jiomart.html" target="_blank" rel="noreferrer" className="text-xs text-gray-300 hover:text-red-300 transition-colors">JioMart Sim</a>
              <a href="http://localhost:5174/brand.html" target="_blank" rel="noreferrer" className="text-xs text-gray-300 hover:text-violet-300 transition-colors">Brand Sim</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
