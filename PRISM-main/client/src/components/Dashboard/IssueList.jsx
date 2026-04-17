import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FEATURE_COLORS, FEATURE_LABELS } from '../../mock/data';

function ConfidenceMeter({ confidence, level }) {
  const color = level === 'green' ? '#22c55e' : level === 'yellow' ? '#eab308' : '#ef4444';
  const label = level === 'green' ? 'High Confidence' : level === 'yellow' ? 'Medium Confidence' : 'Low — More Data Needed';

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-400">Confidence</span>
        <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="text-right text-[10px] text-gray-400 mt-0.5">{Math.round(confidence * 100)}%</div>
    </div>
  );
}

const TYPE_BADGE = {
  systemic: { label: 'Systemic', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  batch: { label: 'Batch Issue', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  isolated: { label: 'Isolated', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const SEVERITY_BADGE = {
  high: 'bg-red-500/10 text-red-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  low: 'bg-blue-500/10 text-blue-400',
};

export default function IssueList({ issues = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="card p-5"
    >
      <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
        Prioritized Issues
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No issues detected — all features look healthy 🎉
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {issues.map((issue, idx) => {
            const color = FEATURE_COLORS[issue.feature];
            const typeBadge = TYPE_BADGE[issue.type];
            return (
              <motion.div
                key={issue.issue_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors stage-card"
                style={{ '--accent': color }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-sm font-semibold text-white">
                      {FEATURE_LABELS[issue.feature]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', typeBadge?.class)}>
                      {typeBadge?.label}
                    </span>
                    <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', SEVERITY_BADGE[issue.severity])}>
                      {issue.severity}
                    </span>
                  </div>
                </div>

                {/* Impact */}
                <div className="mt-2 text-xs text-gray-400">
                  <span className="text-gray-200 font-medium">{Math.round(issue.affected_pct * 100)}%</span> of reviewers affected
                </div>

                {/* Recommendation */}
                <p className="mt-2 text-xs text-gray-300 leading-relaxed">{issue.recommendation}</p>

                {/* Confidence meter */}
                <ConfidenceMeter confidence={issue.confidence} level={issue.confidence_level} />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
