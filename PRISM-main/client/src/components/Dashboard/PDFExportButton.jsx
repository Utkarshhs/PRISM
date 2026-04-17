import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useStore from '../../store';
import { generateReport } from '../../api';

export default function PDFExportButton() {
  const { activeProductId, activePlatform } = useStore();
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleGenerate = useCallback(async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const data = await generateReport(activeProductId, activePlatform);
      setStatus('done');
      // If real backend returns a URL, open it
      if (data.report_url && !data.report_url.includes('mock')) {
        window.open(data.report_url, '_blank');
      }
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [activeProductId, activePlatform, status]);

  return (
    <button
      id="pdf-export-btn"
      onClick={handleGenerate}
      disabled={status === 'loading'}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
        status === 'idle' && 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-800/50',
        status === 'loading' && 'border-blue-500/30 text-blue-400 bg-blue-500/5 cursor-not-allowed',
        status === 'done' && 'border-green-500/30 text-green-400 bg-green-500/5',
        status === 'error' && 'border-red-500/30 text-red-400 bg-red-500/5',
      )}
    >
      {status === 'loading' && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
      )}
      {status === 'idle' && (
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 10v2h10v-2M7 2v7M4 6l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {status === 'done' && <span>✓</span>}
      {status === 'error' && <span>⚠</span>}
      <span>
        {status === 'idle' && 'Export PDF'}
        {status === 'loading' && 'Generating…'}
        {status === 'done' && 'Ready! (backend needed)'}
        {status === 'error' && 'Failed'}
      </span>
    </button>
  );
}
