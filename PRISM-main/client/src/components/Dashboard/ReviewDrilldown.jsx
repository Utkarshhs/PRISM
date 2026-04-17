import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useStore from '../../store';
import { FEATURE_COLORS, FEATURE_LABELS } from '../../mock/data';

const PLATFORM_COLORS = {
  amazon: { label: 'Amazon', color: '#FF9900', bg: 'bg-orange-500/10 text-orange-400' },
  flipkart: { label: 'Flipkart', color: '#2874f0', bg: 'bg-blue-500/10 text-blue-400' },
  jiomart: { label: 'JioMart', color: '#f0022c', bg: 'bg-red-500/10 text-red-400' },
  brand: { label: 'Brand', color: '#8b5cf6', bg: 'bg-violet-500/10 text-violet-400' },
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={clsx('w-3 h-3', s <= rating ? 'text-yellow-400' : 'text-slate-700')} viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 1l1.39 2.81L10.5 4.24l-2.25 2.19.53 3.1L6 8l-2.78 1.53.53-3.1L1.5 4.24l3.11-.43L6 1z"/>
        </svg>
      ))}
    </div>
  );
}

export default function ReviewDrilldown({ reviews = [], total = 0, page = 1, onPageChange }) {
  const { activeFeature, activePlatform } = useStore();
  const [filterSentiment, setFilterSentiment] = useState('all');

  const filtered = reviews.filter((r) => {
    if (activeFeature && !r.features?.[activeFeature]) return false;
    if (activePlatform !== 'all' && r.platform !== activePlatform) return false;
    if (filterSentiment !== 'all') {
      const vals = Object.values(r.features || {});
      if (filterSentiment === 'positive' && !vals.includes('positive')) return false;
      if (filterSentiment === 'negative' && !vals.includes('negative')) return false;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="card p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Review Drilldown</div>
          <div className="text-xs text-gray-400 mt-0.5">{total} total reviews</div>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'positive', 'negative'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSentiment(s)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-lg transition-all capitalize',
                filterSentiment === s
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  : 'text-gray-400 hover:text-gray-300 border border-transparent'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      {(activeFeature || activePlatform !== 'all') && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {activeFeature && (
            <div className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full" style={{ background: FEATURE_COLORS[activeFeature] }} />
              {FEATURE_LABELS[activeFeature]}
            </div>
          )}
          {activePlatform !== 'all' && (
            <div className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 capitalize text-gray-300 backdrop-blur-md">
              {activePlatform}
            </div>
          )}
        </div>
      )}

      {/* Review list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No reviews match current filters</div>
          ) : (
            filtered.map((review, idx) => {
              const platform = PLATFORM_COLORS[review.platform];
              return (
                <motion.div
                  key={review.review_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium', platform?.bg)}>
                        {platform?.label}
                      </span>
                      <StarRating rating={review.rating} />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(review.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed">{review.review_text}</p>

                  {/* Feature tags */}
                  {review.features && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Object.entries(review.features).map(([f, sentiment]) => (
                        <span
                          key={f}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            color: FEATURE_COLORS[f],
                            borderColor: FEATURE_COLORS[f] + '40',
                            background: FEATURE_COLORS[f] + '10',
                          }}
                        >
                          {FEATURE_LABELS[f]} · {sentiment === 'positive' ? '↑' : '↓'}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-white/20 disabled:opacity-30 transition-all"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-400">Page {page}</span>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page * 10 >= total}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-white/20 disabled:opacity-30 transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </motion.div>
  );
}
