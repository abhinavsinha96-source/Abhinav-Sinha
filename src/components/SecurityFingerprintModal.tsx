import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Copy, Check, X } from 'lucide-react';
import { User } from '../types';
import { generateSafetyFingerprint } from '../services/crypto';

interface SecurityFingerprintModalProps {
  currentUser: User;
  peerUser: User;
  onClose: () => void;
}

export const SecurityFingerprintModal: React.FC<SecurityFingerprintModalProps> = ({
  currentUser,
  peerUser,
  onClose
}) => {
  const [fingerprint, setFingerprint] = useState<string>('Generating cryptographic keys...');
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    generateSafetyFingerprint(currentUser.id, peerUser.id).then(fp => {
      setFingerprint(fp);
    });
  }, [currentUser.id, peerUser.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verify E2EE Safety Numbers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end encrypted channel with {peerUser.name}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          To verify that direct messages and audio recordings are end-to-end encrypted and uncompromised, compare the security fingerprint below with the numbers on {peerUser.name}'s device.
        </p>

        {/* Cryptographic Key Blocks */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-4 text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2">
            Safety Numbers
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-wider py-1 break-words">
            {fingerprint}
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to clipboard' : 'Copy safety numbers'}</span>
          </button>
        </div>

        {/* Technical Cryptographic Invariant details */}
        <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between">
            <span>Cipher:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">AES-GCM (256-bit)</span>
          </div>
          <div className="flex justify-between">
            <span>Key Derivation:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">PBKDF2 SHA-256 (100k rounds)</span>
          </div>
          <div className="flex justify-between">
            <span>Client Vault Isolation:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Strictly Local Keys</span>
          </div>
        </div>

        {/* Verified checkbox */}
        <div className="pt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/30"
            />
            <span>Mark contact as verified</span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
