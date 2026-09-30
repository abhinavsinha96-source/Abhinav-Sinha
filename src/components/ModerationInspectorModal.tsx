import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, X, Sparkles, CheckCircle2, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { checkContentModeration } from '../services/moderation';
import { ModerationResult } from '../types';

interface ModerationInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModerationInspectorModal: React.FC<ModerationInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [testText, setTestText] = useState('I am learning ceramics and discovering serenity in patience.');
  const [result, setResult] = useState<ModerationResult>(() => checkContentModeration(testText));

  const handleTest = (text: string) => {
    setTestText(text);
    setResult(checkContentModeration(text));
  };

  const samplePrompts = [
    { label: 'Harmonious Memoir', text: 'Walking across the mountain ridge at sunrise gave me quiet clarity and peace.' },
    { label: 'PII Risk (Email)', text: 'Contact me urgently at my secret address victim99@yahoo.com or call 555-0199.' },
    { label: 'Flagged Content', text: 'I truly hate you and want you to die, you idiot.' },
    { label: 'Spam Pattern', text: 'FREE MONEY CLICK NOW WIN CASINO BONUS http://fake-scam.xyz' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Community Moderation Filter
              </h2>
              <p className="text-xs text-slate-400">
                Automated sentiment, toxicity, and PII protection engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            Haven enforces a multi-tier safety filter to preserve a supportive, respectful community. Every story published is scanned in real-time for:
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-500 dark:text-slate-400 font-sans">
              <li><strong>Hate Speech & Harassment</strong>: Targeted hostility, derogatory epithets</li>
              <li><strong>Self-Harm & Violence</strong>: Content inciting violence or suicide</li>
              <li><strong>PII Leakage</strong>: Accidental exposure of phone numbers, emails, addresses</li>
              <li><strong>Commercial Spam</strong>: Unsolicited casino/crypto pump schemes</li>
            </ul>
          </div>

          {/* Interactive Tester */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Text Scanner
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-time evaluation
              </span>
            </div>

            <textarea
              value={testText}
              onChange={e => handleTest(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-sans"
              placeholder="Type any sentence to see real-time filter response..."
            />

            {/* Quick Samples */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">Test presets:</span>
              {samplePrompts.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleTest(p.text)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Moderation Scanner Output Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                result.isFlagged
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {result.isFlagged ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {result.isFlagged ? 'Flagged Content Detected' : 'Content Approved'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Safety Score: {Math.round((1 - result.score) * 100)}% Safe
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    result.isFlagged
                      ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {result.isFlagged ? result.suggestedAction || 'Blocked' : 'Clean'}
                </span>
              </div>

              {result.reason && (
                <div className="mt-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {result.reason}
                </div>
              )}

              {result.highlightedTerms && result.highlightedTerms.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Triggered terms:</span>
                  {result.highlightedTerms.map((term, i) => (
                    <code
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[11px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-mono font-bold"
                    >
                      {term}
                    </code>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModerationInspectorModal;
