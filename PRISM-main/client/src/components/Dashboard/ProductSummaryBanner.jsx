import { motion } from 'framer-motion';
import clsx from 'clsx';

const sentimentConfig = {
  'Overwhelmingly Positive': { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', dot: 'bg-green-500' },
  'Mostly Positive': { color: '#86efac', bg: 'rgba(134,239,172,0.08)', border: 'rgba(134,239,172,0.2)', dot: 'bg-green-400' },
  'Moderately Positive': { color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', dot: 'bg-yellow-500' },
  'Mixed': { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', dot: 'bg-slate-400' },
  'Mostly Negative': { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', dot: 'bg-red-500' },
};

function getSentimentLabel(summary = '') {
  return Object.keys(sentimentConfig).find((k) => summary.startsWith(k)) || 'Mixed';
}

export default function ProductSummaryBanner({ summary = '' }) {
  const label = getSentimentLabel(summary);
  const config = sentimentConfig[label];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl border p-4 backdrop-filter backdrop-blur-md"
      style={{ 
        background: `rgba(26, 34, 53, 0.6)`,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={clsx('w-2 h-2 rounded-full animate-pulse-slow', config.dot)} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.color }}>
          Sentiment Analysis
        </span>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{summary}</p>
    </motion.div>
  );
}
