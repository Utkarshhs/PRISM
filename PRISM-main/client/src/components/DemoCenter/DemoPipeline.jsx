import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import PipelineStageCard from './PipelineStageCard';
import { PIPELINE_STAGES } from '../../mock/data';
import { runDemoStream } from '../../api';

const SAMPLE_REVIEWS = [
  { text: 'Packaging was completely ruined. Product inside was fine but box was crushed.', rating: 2, platform: 'amazon' },
  { text: 'Battery thik hai lekin build quality meh lag rahi hai yaar honestly', rating: 3, platform: 'flipkart' },
  { text: 'Excellent performance! Best purchase I\'ve made this year. Very fast delivery too.', rating: 5, platform: 'brand' },
  { text: 'Customer support took 6 days to reply. Not acceptable for a premium product.', rating: 2, platform: 'jiomart' },
];

export default function DemoPipeline() {
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [activeStage, setActiveStage] = useState(null);
  const [completedStages, setCompletedStages] = useState({});
  const [finalDelta, setFinalDelta] = useState(null);
  const [selectedReview, setSelectedReview] = useState(0);
  const [customReview, setCustomReview] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [cleanup, setCleanup] = useState(null);

  const handleRun = useCallback(() => {
    if (isRunning) return;

    // Reset
    setIsRunning(true);
    setIsDone(false);
    setActiveStage(null);
    setCompletedStages({});
    setFinalDelta(null);

    const reviewText = useCustom
      ? customReview
      : SAMPLE_REVIEWS[selectedReview].text;

    const cleanupFn = runDemoStream(
      { review_text: reviewText, rating: useCustom ? 3 : SAMPLE_REVIEWS[selectedReview].rating },
      (stageResult) => {
        setActiveStage(stageResult.stage);
        setTimeout(() => {
          setCompletedStages((prev) => ({ ...prev, [stageResult.stage]: stageResult }));
        }, 400);
      },
      (delta) => {
        setIsRunning(false);
        setIsDone(true);
        setActiveStage(null);
        setFinalDelta(delta);
      }
    );

    setCleanup(() => cleanupFn);
  }, [isRunning, useCustom, customReview, selectedReview]);

  const handleReset = () => {
    cleanup?.();
    setIsRunning(false);
    setIsDone(false);
    setActiveStage(null);
    setCompletedStages({});
    setFinalDelta(null);
  };

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="card p-5">
        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Input Review
        </div>

        {/* Sample review selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SAMPLE_REVIEWS.map((r, i) => (
            <button
              key={i}
              onClick={() => { setSelectedReview(i); setUseCustom(false); }}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-lg border transition-all',
                !useCustom && selectedReview === i
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'border-prism-border text-slate-500 hover:text-slate-300'
              )}
            >
              Sample {i + 1} · {r.platform}
            </button>
          ))}
          <button
            onClick={() => setUseCustom(true)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-lg border transition-all',
              useCustom
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                : 'border-prism-border text-slate-500 hover:text-slate-300'
            )}
          >
            Custom ✏️
          </button>
        </div>

        {/* Review preview / input */}
        <div className="bg-prism-bg rounded-xl border border-prism-border p-4 mb-4">
          {useCustom ? (
            <textarea
              value={customReview}
              onChange={(e) => setCustomReview(e.target.value)}
              placeholder="Type any review in English, Hindi, or Hinglish..."
              rows={3}
              className="w-full bg-transparent text-sm text-slate-300 resize-none outline-none placeholder-slate-600"
            />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{SAMPLE_REVIEWS[selectedReview].text}"
            </p>
          )}
        </div>

        {/* Run button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning || (useCustom && !customReview.trim())}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              isRunning || (useCustom && !customReview.trim())
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
            )}
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processing...
              </>
            ) : (
              <>▶ Run Pipeline</>
            )}
          </button>

          {(isRunning || isDone) && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 border border-prism-border rounded-lg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineStageCard
            key={stage.stage}
            stage={stage}
            isActive={activeStage === stage.stage}
            isComplete={!!completedStages[stage.stage]}
            result={completedStages[stage.stage]}
          />
        ))}
      </div>

      {/* Final delta result */}
      <AnimatePresence>
        {isDone && finalDelta && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="card p-5 border-green-500/30 bg-green-500/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l4 4 6-6" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-green-400">Pipeline Complete</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-prism-surface rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-slate-100">{finalDelta.insight_delta?.health_score}</div>
                <div className="text-xs text-slate-500 mt-0.5">Updated Health Score</div>
              </div>
              <div className="bg-prism-surface rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-green-400">8/8</div>
                <div className="text-xs text-slate-500 mt-0.5">Stages Completed</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
