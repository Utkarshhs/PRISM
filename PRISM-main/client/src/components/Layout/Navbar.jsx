import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import useStore from '../../store';
import { PRODUCTS } from '../../mock/data';
import PDFExportButton from '../Dashboard/PDFExportButton';

const platforms = [
  { id: 'all', label: 'All' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'flipkart', label: 'Flipkart' },
  { id: 'jiomart', label: 'JioMart' },
  { id: 'brand', label: 'Brand' },
];

const SIM_URLS = {
  amazon: 'http://localhost:5174/amazon.html',
  flipkart: 'http://localhost:5174/flipkart.html',
  jiomart: 'http://localhost:5174/jiomart.html',
  brand: 'http://localhost:5174/brand.html',
};

export default function Navbar() {
  const {
    activeProductId,
    activePlatform,
    alerts,
    isAlertPanelOpen,
    setActiveProduct,
    setActivePlatform,
    toggleAlertPanel,
    dismissAlert,
  } = useStore();

  const [productDropdown, setProductDropdown] = useState(false);
  const [simDropdown, setSimDropdown] = useState(false);
  const activeProduct = PRODUCTS.find((p) => p.product_id === activeProductId);
  const unreadAlerts = alerts.length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-prism-border">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2.5" fill="white"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="text-white font-bold text-lg tracking-tight">PRISM</span>
            <span className="text-slate-500 text-xs ml-2">Review Intelligence</span>
          </div>
        </div>

        {/* ── Product Selector ── */}
        <div className="relative shrink-0">
          <button
            id="product-selector"
            onClick={() => { setProductDropdown(!productDropdown); setSimDropdown(false); }}
            className="flex items-center gap-2 bg-prism-card border border-prism-border rounded-lg px-3 py-2 text-sm text-slate-200 hover:border-slate-600 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-slow shrink-0" />
            <span className="max-w-[130px] truncate font-medium">{activeProduct?.name || 'Select Product'}</span>
            <svg className={clsx('w-3.5 h-3.5 text-slate-500 transition-transform duration-200', productDropdown && 'rotate-180')} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l5 5 5-5"/>
            </svg>
          </button>

          <AnimatePresence>
            {productDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-2 w-64 card shadow-2xl shadow-black/60 overflow-hidden z-50"
              >
                {PRODUCTS.map((p) => (
                  <button
                    key={p.product_id}
                    onClick={() => { setActiveProduct(p.product_id); setProductDropdown(false); }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-700/40 transition-colors text-left',
                      p.product_id === activeProductId ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300'
                    )}
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 bg-slate-800">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-slate-500">₹{p.price.toLocaleString()}</div>
                    </div>
                    {p.product_id === activeProductId && (
                      <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 8l4 4 6-6"/>
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Platform Toggle ── */}
        <div className="hidden lg:flex items-center bg-prism-card border border-prism-border rounded-lg p-1 gap-0.5 shrink-0">
          {platforms.map((p) => (
            <button
              key={p.id}
              id={`platform-${p.id}`}
              onClick={() => setActivePlatform(p.id)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                activePlatform === p.id
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">

          {/* PDF Export */}
          <div className="hidden md:block">
            <PDFExportButton />
          </div>

          {/* Simulation Pages dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => { setSimDropdown(!simDropdown); setProductDropdown(false); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 rounded-lg border border-prism-border hover:border-slate-600"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
              Sim Pages
              <svg className={clsx('w-3 h-3 transition-transform', simDropdown && 'rotate-180')} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l5 5 5-5"/>
              </svg>
            </button>

            <AnimatePresence>
              {simDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-52 card shadow-2xl shadow-black/60 overflow-hidden z-50"
                >
                  <div className="px-4 py-2 border-b border-prism-border">
                    <span className="text-xs text-slate-500 font-medium">Open Simulation Pages</span>
                  </div>
                  {[
                    { id: 'amazon', label: 'Amazon India', color: '#FF9900', emoji: '🛒' },
                    { id: 'flipkart', label: 'Flipkart', color: '#2874f0', emoji: '🛍' },
                    { id: 'jiomart', label: 'JioMart', color: '#EE3030', emoji: '🏪' },
                    { id: 'brand', label: 'Brand Store', color: '#8b5cf6', emoji: '✨' },
                  ].map((s) => (
                    <a
                      key={s.id}
                      href={SIM_URLS[s.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSimDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/40 transition-colors"
                    >
                      <span className="text-base">{s.emoji}</span>
                      <span className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
                      <svg className="w-3 h-3 text-slate-600 ml-auto" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 10L10 2M5 2h5v5" strokeLinecap="round"/>
                      </svg>
                    </a>
                  ))}
                  <div className="px-4 py-2 border-t border-prism-border">
                    <p className="text-[10px] text-slate-600">Runs on localhost:5174 · start simserver.js</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alert Bell */}
          <button
            id="alert-bell"
            onClick={() => { toggleAlertPanel(); setProductDropdown(false); setSimDropdown(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-prism-border hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1a5 5 0 0 1 5 5v2l1.5 2.5h-13L3 8V6a5 5 0 0 1 5-5z"/>
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" strokeLinecap="round"/>
            </svg>
            <AnimatePresence>
              {unreadAlerts > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {unreadAlerts}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Alert Panel ── */}
      <AnimatePresence>
        {isAlertPanelOpen && (
          <motion.div
            key="alert-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-prism-border bg-prism-surface/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="max-w-screen-2xl mx-auto px-6 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">Active Alerts</span>
                  {unreadAlerts > 0 && (
                    <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                      {unreadAlerts} active
                    </span>
                  )}
                </div>
                <button
                  onClick={toggleAlertPanel}
                  className="text-slate-600 hover:text-slate-400 transition-colors text-xs"
                >
                  Close ✕
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-500">
                    ✅ No active alerts — all features healthy
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <motion.div
                      key={alert.alert_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 bg-prism-card border border-prism-border rounded-lg px-4 py-3"
                    >
                      <div className={clsx(
                        'w-2 h-2 rounded-full mt-1 shrink-0',
                        alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200 leading-relaxed">{alert.message}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(alert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          <span className="capitalize">{alert.feature?.replace(/_/g, ' ')}</span>
                          {' · '}
                          <span className="capitalize">{alert.severity} severity</span>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.alert_id)}
                        className="text-slate-600 hover:text-slate-300 transition-colors text-sm shrink-0 px-1"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
