import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, animate } from 'framer-motion';
import clsx from 'clsx';

function AnimatedScore({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.34, 1.56, 0.64, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [value]);

  return <span>{display}</span>;
}

export default function HealthScoreCard({ score = 72, reviewCount = 0, flaggedCount = 0 }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 70 ? '#22c55e' : score >= 45 ? '#eab308' : '#ef4444';

  const label =
    score >= 80 ? 'Excellent'
    : score >= 70 ? 'Good'
    : score >= 55 ? 'Moderate'
    : score >= 40 ? 'Needs Work'
    : 'Critical';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card p-6 flex flex-col items-center gap-4"
    >
      <div className="text-sm font-semibold text-gray-300 tracking-wide uppercase">Health Score</div>

      {/* Circular ring */}
      <div className="relative w-40 h-40">
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ background: scoreColor }}
        />

        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          {/* Progress */}
          <motion.circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${scoreColor}80)` }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-black leading-none" style={{ color: scoreColor }}>
            <AnimatedScore value={score} />
          </div>
          <div className="text-slate-400 text-xs mt-1">/100</div>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <div className="font-semibold text-lg" style={{ color: scoreColor }}>{label}</div>
        <div className="text-xs text-gray-400 mt-1">Overall product sentiment</div>
      </motion.div>

      {/* Mini stats */}
      <div className="w-full grid grid-cols-2 gap-2">
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 text-center border border-white/10">
          <div className="text-xl font-bold text-white">{reviewCount.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Reviews</div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 text-center border border-white/10">
          <div className="text-xl font-bold text-red-400">{flaggedCount}</div>
          <div className="text-xs text-gray-400">Flagged</div>
        </div>
      </div>
    </motion.div>
  );
}
