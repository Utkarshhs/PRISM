import { motion } from 'framer-motion';
import clsx from 'clsx';
import useStore from '../../store';

export default function ProductLeaderboard({ products = [] }) {
  const { activeProductId, setActiveProduct } = useStore();

  const sorted = [...products].sort((a, b) => b.health_score - a.health_score);

  const scoreColor = (s) =>
    s >= 70 ? '#22c55e' : s >= 45 ? '#eab308' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card p-5"
    >
      <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
        Product Leaderboard
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map((product, idx) => {
          const isActive = product.product_id === activeProductId;
          const color = scoreColor(product.health_score);

          return (
            <motion.button
              key={product.product_id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => setActiveProduct(product.product_id)}
              className={clsx(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left',
                isActive
                  ? 'bg-blue-500/10 border border-blue-500/30'
                  : 'hover:bg-slate-700/30 border border-transparent'
              )}
            >
              {/* Rank badge */}
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400'
                  : idx === 1 ? 'bg-slate-500/20 text-slate-300'
                  : 'bg-prism-surface text-slate-500'
                )}
              >
                {idx + 1}
              </div>

              {/* Product image */}
              <div className="w-7 h-7 rounded-md overflow-hidden shrink-0">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className={clsx('text-xs font-medium truncate', isActive ? 'text-blue-300' : 'text-gray-200')}>
                  {product.name}
                </div>
                <div className="mt-1 h-1 bg-prism-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${product.health_score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>

              {/* Score */}
              <div className="text-sm font-bold shrink-0" style={{ color }}>
                {product.health_score}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
