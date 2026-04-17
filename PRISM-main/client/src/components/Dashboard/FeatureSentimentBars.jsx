import { motion } from 'framer-motion';
import clsx from 'clsx';
import useStore from '../../store';
import { FEATURE_COLORS, FEATURE_LABELS } from '../../mock/data';

export default function FeatureSentimentBars({ featureSentiment = {} }) {
  const { activeFeature, setActiveFeature } = useStore();

  const features = Object.keys(FEATURE_COLORS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Feature Sentiment</div>
        {activeFeature && (
          <button
            onClick={() => setActiveFeature(null)}
            className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {features.map((feature, idx) => {
          const data = featureSentiment[feature] || { positive: 0.5, negative: 0.5, count: 0 };
          const color = FEATURE_COLORS[feature];
          const isActive = activeFeature === feature;
          const isDimmed = activeFeature && !isActive;

          return (
            <motion.button
              key={feature}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: isDimmed ? 0.4 : 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => setActiveFeature(feature)}
              className={clsx(
                'w-full text-left rounded-lg p-2 -mx-2 transition-all feature-pill',
                isActive && 'bg-slate-700/30'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: color, boxShadow: isActive ? `0 0 6px ${color}80` : 'none' }}
                  />
                  <span className={clsx('text-xs font-medium', isActive ? 'text-white' : 'text-gray-300')}>
                    {FEATURE_LABELS[feature]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-green-400">{Math.round(data.positive * 100)}%</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-red-400">{Math.round(data.negative * 100)}%</span>
                  <span className="text-slate-500">({data.count})</span>
                </div>
              </div>

              {/* Segmented bar */}
              <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                <motion.div
                  className="h-full rounded-l-full"
                  style={{ background: color, opacity: 0.85 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.positive * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.06, ease: 'easeOut' }}
                />
                <motion.div
                  className="h-full rounded-r-full"
                  style={{ background: '#ef4444', opacity: 0.7 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.negative * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.06, ease: 'easeOut' }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
