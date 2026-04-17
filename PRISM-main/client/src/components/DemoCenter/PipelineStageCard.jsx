import { motion } from 'framer-motion';
import clsx from 'clsx';

const STATUS_CONFIG = {
  pass: { label: 'Pass', class: 'text-green-400 bg-green-400/10' },
  processing: { label: 'Running...', class: 'text-blue-400 bg-blue-400/10' },
  fail: { label: 'Failed', class: 'text-red-400 bg-red-400/10' },
  pending: { label: 'Waiting', class: 'text-slate-500 bg-slate-500/10' },
};

export default function PipelineStageCard({ stage, isActive, isComplete, result }) {
  const status = isComplete ? 'pass' : isActive ? 'processing' : 'pending';
  const statusConfig = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{
        opacity: isActive || isComplete ? 1 : 0.35,
        scale: isActive ? 1.01 : 1,
      }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'rounded-xl border p-4 stage-card transition-all',
        isActive ? 'border-blue-500/40 bg-blue-500/5' : isComplete ? 'border-prism-border bg-prism-surface' : 'border-prism-border bg-prism-surface'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        {/* Stage number with animated ring */}
        <div className="relative">
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all',
              isComplete ? 'bg-green-500/20 text-green-400' : isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-prism-border/50 text-slate-600'
            )}
          >
            {isComplete ? (
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l4 4 6-6" strokeLinecap="round"/>
              </svg>
            ) : (
              stage.stage
            )}
          </div>
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={clsx('text-sm font-semibold', isComplete || isActive ? 'text-slate-100' : 'text-slate-600')}>
            {stage.name}
          </div>
          <div className="text-xs text-slate-600 truncate">{stage.description}</div>
        </div>

        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0', statusConfig.class)}>
          {statusConfig.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-prism-border rounded-full overflow-hidden mt-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: stage.color }}
          initial={{ width: '0%' }}
          animate={{ width: isComplete ? '100%' : isActive ? '60%' : '0%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Result detail */}
      {isComplete && result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-xs text-slate-400 bg-prism-bg rounded-lg px-3 py-2 font-mono"
        >
          {result.detail || result.result || (result.features ? `Features: ${Object.entries(result.features).map(([k, v]) => `${k}:${v}`).join(', ')}` : 'Completed')}
        </motion.div>
      )}
    </motion.div>
  );
}
