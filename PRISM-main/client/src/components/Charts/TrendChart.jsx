import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import useStore from '../../store';
import { FEATURE_COLORS, FEATURE_LABELS } from '../../mock/data';

const PRODUCT_EVENTS = {
  'prod-001': [
    { week: '2024-W08', label: 'Firmware 2.1' },
    { week: '2024-W18', label: 'HW Revision' },
  ],
  'prod-002': [{ week: '2024-W12', label: 'App Update' }],
  'prod-003': [{ week: '2024-W15', label: 'Price Drop' }],
  'prod-004': [],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl border border-white/20 px-4 py-3 shadow-2xl min-w-[180px] bg-white/10 backdrop-blur-md">
      <div className="text-xs text-gray-300 mb-2 font-semibold">{label}</div>
      {payload
        .filter(e => e.value != null)
        .sort((a, b) => b.value - a.value)
        .map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
              <span className="text-gray-400">{FEATURE_LABELS[entry.dataKey]}</span>
            </div>
            <span className="font-bold" style={{ color: entry.color }}>
              {Math.round(entry.value * 100)}%
            </span>
          </div>
        ))}
    </div>
  );
};

export default function TrendChart({ weeklyTrends = [], productId = 'prod-001' }) {
  const { activeFeature } = useStore();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const features = Object.keys(FEATURE_COLORS);
  const events = PRODUCT_EVENTS[productId] || [];

  const formatted = weeklyTrends.map((w) => ({
    ...w,
    label: w.week.replace(/\d{4}-W/, 'W'),
  })).slice(-16);

  const getLineOpacity = (feature) => {
    if (activeFeature) return activeFeature === feature ? 1 : 0.15;
    if (hoveredFeature) return hoveredFeature === feature ? 1 : 0.3;
    return 1;
  };

  const getStrokeWidth = (feature) => {
    if (activeFeature === feature || hoveredFeature === feature) return 3;
    if (activeFeature || hoveredFeature) return 1;
    return 2;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Sentiment Trends
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Last 16 weeks — hover legend to highlight</div>
        </div>
        {activeFeature && (
          <div className="flex items-center gap-1.5 text-xs bg-blue-500/20 border border-blue-400/40 rounded-lg px-2.5 py-1">
            <span className="w-2 h-2 rounded-full" style={{ background: FEATURE_COLORS[activeFeature] }} />
            <span className="text-blue-300">{FEATURE_LABELS[activeFeature]} filter active</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            interval={1}
          />
          <YAxis
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
            domain={[0.1, 1]}
            ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />

          {events.map((e) => {
            const weekLabel = e.week.replace(/\d{4}-W/, 'W');
            return (
              <ReferenceLine
                key={e.week}
                x={weekLabel}
                stroke="#475569"
                strokeDasharray="4 2"
                strokeWidth={1}
                label={{ value: e.label, fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }}
              />
            );
          })}

          {features.map((feature) => (
            <Line
              key={feature}
              type="monotone"
              dataKey={feature}
              stroke={FEATURE_COLORS[feature]}
              strokeWidth={getStrokeWidth(feature)}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: FEATURE_COLORS[feature], fill: '#0f172a' }}
              opacity={getLineOpacity(feature)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Interactive feature legend */}
      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10">
        {features.map((f) => {
          const isActive = activeFeature === f || hoveredFeature === f;
          const isDimmed = (activeFeature && activeFeature !== f) || (hoveredFeature && hoveredFeature !== f);
          return (
            <button
              key={f}
              onMouseEnter={() => setHoveredFeature(f)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={clsx(
                'flex items-center gap-1.5 text-[11px] rounded-lg px-2.5 py-1 transition-all border',
                isActive
                  ? 'text-white bg-white/10'
                  : isDimmed
                  ? 'text-gray-500 border-transparent'
                  : 'text-gray-400 border-transparent hover:border-white/20 hover:text-gray-300'
              )}
              style={{ borderColor: isActive ? FEATURE_COLORS[f] + '60' : undefined }}
            >
              <span
                className="w-3 h-0.5 rounded-full inline-block"
                style={{ background: FEATURE_COLORS[f], opacity: isDimmed ? 0.3 : 1 }}
              />
              {FEATURE_LABELS[f]}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
