import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FEATURE_COLORS, FEATURE_LABELS } from '../../mock/data';

const ARROW = {
  up: { icon: '↑', color: 'text-green-400', bg: 'bg-green-400/10' },
  down: { icon: '↓', color: 'text-red-400', bg: 'bg-red-400/10' },
  stable: { icon: '→', color: 'text-slate-400', bg: 'bg-slate-400/10' },
};

export default function WhatChangedStrip({ changes = {} }) {
  const features = Object.keys(FEATURE_COLORS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="card p-4"
    >
      <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
        What Changed This Week
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, idx) => {
          const direction = changes[feature] || 'stable';
          const arrow = ARROW[direction];
          const color = FEATURE_COLORS[feature];

          return (
            <motion.div
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05, type: 'spring', stiffness: 300 }}
              className={clsx('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5', arrow.bg)}
              title={`${FEATURE_LABELS[feature]}: ${direction}`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-300">{FEATURE_LABELS[feature]}</span>
              <span className={clsx('text-sm font-bold', arrow.color)}>{arrow.icon}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
