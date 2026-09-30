import React, { useState, useEffect } from 'react';
import {
  X,
  Film,
  Upload,
  Play,
  Download,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  startVeoVideoGeneration,
  checkVeoVideoStatus,
  downloadVeoVideoBlob
} from '../services/aiService';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachVideoToStory?: (videoUrl: string) => void;
  initialImage?: string;
}

const REASSURING_MESSAGES = [
  "Initializing veo-3.1-fast-generate-preview model...",
  "Analyzing image composition, lighting, and depth planes...",
  "Synthesizing cinematic camera trajectories and fluid motion vectors...",
  "Rendering high-fidelity frames with temporal consistency...",
  "Finalizing MP4 video encoding and preparing download..."
];

export default function VeoVideoModal({
  isOpen,
  onClose,
  onAttachVideoToStory,
  initialImage
}: VeoVideoModalProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState('Animate this photo with subtle cinematic movement and atmospheric life');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsgIndex, setProgressMsgIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
    }
  }, [initialImage]);

  // Rotate reassuring messages while generating
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let secTimer: NodeJS.Timeout;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setProgressMsgIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 5500);
      secTimer = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      clearInterval(secTimer);
    };
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgressMsgIndex(0);

    try {
      // 1. Start generation
      const operationName = await startVeoVideoGeneration(image, prompt, aspectRatio);

      // 2. Poll status
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60; // 60 * 3s = 3 minutes

      while (!isDone && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 3000));
        attempts++;

        const status = await checkVeoVideoStatus(operationName);
        if (status.error) {
          throw new Error(status.error.message || 'Video generation error from Veo service');
        }

        if (status.done) {
          isDone = true;
          // 3. Download video
          const localUrl = await downloadVeoVideoBlob(operationName);
          setVideoUrl(localUrl);
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }
    } catch (err: any) {
      console.error('Veo video generation failed:', err);
      setError(err.message || 'Failed to animate video with Veo. Please verify network and API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
                  Animate Photo to Video
                </h3>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Transform still memoirs and photographs into living cinematic clips
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {!videoUrl && (
            <form onSubmit={handleStartGeneration} className="space-y-4">
              {/* Photo Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  1. Select Photo to Animate
                </label>
                {image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-52 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
                    <img src={image} alt="To animate" className="max-h-52 object-contain" />
                    {!isGenerating && (
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors bg-stone-50 dark:bg-stone-800/40">
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Upload a photo
                    </span>
                    <span className="text-[11px] text-stone-500">JPG, PNG or WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  2. Video Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                      aspectRatio === '16:9'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>Landscape (16:9)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                      aspectRatio === '9:16'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>Portrait / Mobile (9:16)</span>
                  </button>
                </div>
              </div>

              {/* Motion Direction Prompt */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  3. Motion Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={prompt}
                  disabled={isGenerating}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Gentle wind through the pines, warm sunlight shifting..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generating Loading State with Reassuring Progress Messages */}
              {isGenerating ? (
                <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-2xl bg-purple-600 text-white animate-bounce">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-200">
                      Generating Veo Video ({elapsedSeconds}s)
                    </h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 animate-pulse">
                      {REASSURING_MESSAGES[progressMsgIndex]}
                    </p>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(95, elapsedSeconds * 2.5)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">
                    High quality neural video generation typically takes 30–60 seconds.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!image}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Video with Veo</span>
                </button>
              )}
            </form>
          )}

          {/* Generated Video Player View */}
          {videoUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                <span>Veo Generated Video Result</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Complete
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full max-h-[380px] object-contain"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {onAttachVideoToStory && (
                  <button
                    onClick={() => {
                      onAttachVideoToStory(videoUrl);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Attach Video to Story</span>
                  </button>
                )}

                <a
                  href={videoUrl}
                  download="haven_veo_animation.mp4"
                  className="py-2.5 px-4 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4</span>
                </a>

                <button
                  onClick={() => {
                    setVideoUrl(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Create Another</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
