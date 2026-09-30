import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { playSynthesizedClip, stopCurrentAudio } from '../services/audioSynthesizer';

interface AudioPlayerProps {
  clipId: string;
  durationSec: number;
  title?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  clipId,
  durationSec,
  title,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopCurrentAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSynthesizedClip(
        clipId,
        durationSec,
        (elapsed) => setProgress(elapsed),
        () => {
          setIsPlaying(false);
          setProgress(0);
        }
      );
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percent = durationSec > 0 ? (progress / durationSec) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/40 ${className}`}
    >
      {/* Play/Pause Button - min 44x44 hitbox */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio clip' : 'Play audio clip'}
        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center hover:from-pink-400 hover:to-rose-400 transition-all shadow-md shadow-pink-500/25 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        {title && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-950 dark:text-pink-100 truncate mb-1">
            <Volume2 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
            <span className="truncate">{title}</span>
          </div>
        )}

        {/* Waveform / Progress bar */}
        <div className="flex items-center gap-2">
          {/* Animated sound bars */}
          <div className="flex items-center gap-0.5 h-5 px-1 py-0.5 bg-pink-100/70 dark:bg-pink-950/60 rounded">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((h, i) => (
              <div
                key={i}
                style={{ height: `${isPlaying ? Math.max(15, (h * (progress % 2 ? 0.9 : 1.1))) : 25}%` }}
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  (i / 12) * 100 <= percent
                    ? 'bg-pink-600 dark:bg-pink-400'
                    : 'bg-pink-200 dark:bg-pink-800/60'
                }`}
              />
            ))}
          </div>

          {/* Progress track */}
          <div className="flex-1 h-1.5 bg-pink-200/80 dark:bg-pink-900/50 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 transition-all duration-300 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Tabular time */}
          <span className="text-[11px] font-mono tabular-nums text-pink-900/60 dark:text-pink-300/60 shrink-0">
            {formatTime(progress)} / {formatTime(durationSec)}
          </span>
        </div>
      </div>
    </div>
  );
};
