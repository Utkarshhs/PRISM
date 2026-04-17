import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import useStore from '../../store';
import { FEATURE_COLORS, FEATURE_LABELS } from '../../mock/data';

const CLUSTER_COLORS = {
  systemic: '#ef4444',
  batch: '#f59e0b',
  isolated: '#64748b',
};

export default function GraphNetwork({ graphData = { nodes: [], edges: [] } }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const { activeFeature } = useStore();
  const [tooltip, setTooltip] = useState(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!graphData.nodes.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth || 600;
    const height = 380;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Defs: arrowhead
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(255,255,255,0.15)');

    // Filter edges for performance (max 80)
    const filteredEdges = graphData.edges.slice(0, 80);
    const nodeIds = new Set(graphData.nodes.map((n) => n.id));

    // Clone nodes so D3 can mutate them
    const nodes = graphData.nodes.map((n) => ({ ...n }));
    const edges = filteredEdges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({ ...e }));

    // Force simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d) => d.id).distance(60).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(14))
      .alphaDecay(0.03);

    simulationRef.current = sim;

    // Draw edges
    const link = svg.append('g').selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke-width', (d) => Math.max(0.5, d.weight * 2.5))
      .attr('stroke', 'rgba(255,255,255,0.06)');

    // Draw nodes
    const node = svg.append('g').selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    node.append('circle')
      .attr('r', 6)
      .attr('fill', (d) => {
        const featureColor = FEATURE_COLORS[d.feature] || '#64748b';
        return d.sentiment === 'positive' ? featureColor : featureColor + '70';
      })
      .attr('stroke', (d) => FEATURE_COLORS[d.feature] || '#64748b')
      .attr('stroke-width', (d) => d.sentiment === 'positive' ? 0 : 1.5)
      .attr('opacity', (d) =>
        activeFeature ? (d.feature === activeFeature ? 1 : 0.1) : 0.85
      )
      .on('mouseenter', (event, d) => {
        setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
      })
      .on('mouseleave', () => setTooltip(null));

    // Cluster ring for systemic nodes
    node.filter((d) => d.cluster_type === 'systemic')
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'none')
      .attr('stroke', '#ef444440')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,2');

    // Simulation tick
    sim.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [graphData, activeFeature]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Issue Graph</div>
          <div className="text-xs text-slate-600 mt-0.5">Force-directed cluster visualization</div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/40 ring-1 ring-red-500/40" />Systemic</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500/40" />Batch</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500/40" />Isolated</span>
        </div>
      </div>

      <div className="relative">
        <svg ref={svgRef} className="w-full" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute glass rounded-lg border border-prism-border px-3 py-2 text-xs pointer-events-none z-10 shadow-xl max-w-[200px]"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: FEATURE_COLORS[tooltip.data.feature] }} />
              <span className="font-semibold text-slate-200 capitalize">{FEATURE_LABELS[tooltip.data.feature]}</span>
            </div>
            <div className={tooltip.data.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}>
              {tooltip.data.sentiment} · {tooltip.data.week}
            </div>
            <div className="text-slate-400 mt-1 text-[10px] line-clamp-2">{tooltip.data.review_snippet}</div>
          </div>
        )}
      </div>

      {/* Feature legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(FEATURE_COLORS).map(([f, c]) => (
          <span
            key={f}
            className="flex items-center gap-1 text-[10px] text-slate-500"
            style={{ opacity: activeFeature && activeFeature !== f ? 0.3 : 1 }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            {FEATURE_LABELS[f]}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
