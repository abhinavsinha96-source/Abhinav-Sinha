import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Film,
  Sparkles,
  MapPin,
  ExternalLink,
  Send
} from 'lucide-react';
import { Story, User } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface StoryCardProps {
  story: Story;
  currentUser: User;
  onToggleLike: (storyId: string) => void;
  onAddComment: (storyId: string, text: string) => void;
  onAnimatePhoto?: (imageUrl: string) => void;
  onEditPhoto?: (imageUrl: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  currentUser,
  onToggleLike,
  onAddComment,
  onAnimatePhoto,
  onEditPhoto
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isRevealed, setIsRevealed] = useState(!story.isSensitive && story.moderationStatus !== 'flagged');
  const [imageError, setImageError] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(story.id, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="rounded-3xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 p-5 sm:p-6 transition-all shadow-pink-glow hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700">
      {/* Header: Author & unboxed metadata */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={story.authorAvatar}
            alt={story.authorName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 ring-2 ring-pink-400/20"
          />
          <div>
            <div className="font-semibold text-sm text-pink-950 dark:text-pink-50 flex items-center gap-1.5">
              <span>{story.authorName}</span>
              <span className="text-xs" role="img" aria-label="pride">🏳️‍🌈</span>
              {story.privacy === 'friends_only' ? (
                <span title="Friends-Only Story" className="text-pink-500">
                  <Lock className="w-3.5 h-3.5 inline text-pink-600 dark:text-pink-400" />
                </span>
              ) : (
                <span title="Public Story" className="text-pink-400">
                  <Globe className="w-3.5 h-3.5 inline text-pink-400" />
                </span>
              )}
            </div>
            {/* Zero-Pill metadata: unboxed text with subtle dot separators */}
            <div className="flex items-center gap-1.5 text-xs text-[#7A587F] dark:text-pink-200/70">
              <span className="font-mono text-pink-600 dark:text-pink-300">{story.authorHandle}</span>
              <span aria-hidden="true">·</span>
              <span>{story.timestamp}</span>
              {story.location && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-0.5 text-pink-600 dark:text-pink-400 font-medium">
                    <MapPin className="w-3 h-3" />
                    <span>{story.location}</span>
                  </span>
                </>
              )}
              {story.syncStatus === 'pending_sync' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-pink-600 dark:text-pink-400 font-medium">
                    Queued Offline
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Moderation safety badge if flagged */}
        {story.moderationStatus === 'flagged' && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sensitive</span>
          </div>
        )}
      </div>

      {/* Sensitive Content Filter Overlay */}
      {!isRevealed ? (
        <div className="my-4 p-5 rounded-2xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/70 dark:bg-[#28132D] text-center">
          <ShieldAlert className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-pink-950 dark:text-pink-100 mb-1">
            Protected Content Notice
          </h4>
          <p className="text-xs text-pink-800/70 dark:text-pink-300/70 max-w-md mx-auto mb-3">
            {story.moderationReason ||
              'This story was flagged by Haven Safety Engine as containing sensitive or intense themes.'}
          </p>
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-pink-glow transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Uncover Story Content</span>
          </button>
        </div>
      ) : (
        <>
          {/* Story Title */}
          <h3 className="text-lg sm:text-xl font-serif font-bold text-pink-950 dark:text-pink-50 tracking-tight leading-snug mb-2.5">
            {story.title}
          </h3>

          {/* Story Prose */}
          <p className="text-sm sm:text-base text-pink-900/90 dark:text-pink-100/90 leading-relaxed font-normal mb-4 whitespace-pre-line">
            {story.content}
          </p>

          {/* Video Attachment (Veo generated video) */}
          {story.videoClipUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-900/60 bg-black max-h-[420px] relative group">
              <video
                src={story.videoClipUrl}
                controls
                playsInline
                loop
                className="w-full max-h-[420px] object-contain"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-purple-300 text-[10px] font-medium flex items-center gap-1.5 border border-purple-400/30">
                <Film className="w-3 h-3" />
                <span>Veo Animated Video (veo-3.1-fast-generate-preview)</span>
              </div>
            </div>
          )}

          {/* Story Photo Attachment */}
          {story.photoUrl && !imageError && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 max-h-96 relative group">
              <img
                src={story.photoUrl}
                alt={story.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
              />

              {/* Overlay Actions for Photo: Animate with Veo or Edit with AI */}
              <div className="absolute bottom-2.5 right-2.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1.5 rounded-xl border border-white/20">
                {onAnimatePhoto && (
                  <button
                    type="button"
                    onClick={() => onAnimatePhoto(story.photoUrl!)}
                    title="Animate into video with Veo"
                    className="p-1.5 px-2.5 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Animate with Veo</span>
                  </button>
                )}
                {onEditPhoto && (
                  <button
                    type="button"
                    onClick={() => onEditPhoto(story.photoUrl!)}
                    title="Edit with AI prompt"
                    className="p-1.5 px-2.5 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Edit Image</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Audio Clip Attachment */}
          {story.audioClip && (
            <div className="mb-4">
              <AudioPlayer
                clipId={story.audioClip.url}
                durationSec={story.audioClip.durationSec}
                title={story.audioClip.title}
              />
            </div>
          )}

          {/* Google Maps Grounded Places Cards (if attached) */}
          {story.groundedPlaces && story.groundedPlaces.length > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <MapPin className="w-3.5 h-3.5" />
                <span>Grounded Location References (Google Maps):</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {story.groundedPlaces.map((place, idx) => (
                  <a
                    key={idx}
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white dark:bg-[#1E0B24] border border-pink-200/80 dark:border-pink-800/80 hover:border-pink-500 text-xs flex items-center justify-between transition-colors group"
                  >
                    <div className="truncate mr-2">
                      <span className="font-semibold text-pink-950 dark:text-pink-50 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                        {place.title}
                      </span>
                      {place.snippet && (
                        <p className="text-[11px] text-pink-800/70 dark:text-pink-300/70 truncate mt-0.5">
                          {place.snippet}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-pink-400 group-hover:text-pink-600 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-pink-700/80 dark:text-pink-300/80 mb-4">
              {story.tags.map((tag, idx) => (
                <React.Fragment key={tag}>
                  <span className="hover:text-pink-600">#{tag}</span>
                  {idx < story.tags.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}

      {/* Story Footer Controls: Like, Comment */}
      <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-pink-900/40 text-xs text-[#7A587F] dark:text-pink-300/70">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onToggleLike(story.id)}
            className={`min-h-[44px] px-2.5 py-1 -ml-2 rounded-lg flex items-center gap-1.5 transition-colors ${
              story.isLiked
                ? 'text-pink-600 dark:text-pink-400 font-bold'
                : 'hover:text-pink-600 dark:hover:text-pink-300'
            }`}
            aria-label={story.isLiked ? 'Unlike story' : 'Like story'}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                story.isLiked
                  ? 'fill-pink-500 text-pink-500 scale-110 drop-shadow-[0_2px_8px_rgba(244,114,182,0.5)]'
                  : ''
              }`}
            />
            <span className="font-mono tabular-nums">{story.likesCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="min-h-[44px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
            aria-label="Comments"
          >
            <MessageCircle className="w-4 h-4 text-pink-500" />
            <span className="font-mono tabular-nums">{story.comments.length}</span>
          </button>
        </div>

        {story.isSensitive && isRevealed && (
          <button
            type="button"
            onClick={() => setIsRevealed(false)}
            className="text-[11px] text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide Content</span>
          </button>
        )}
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-pink-100 dark:border-pink-900/40 space-y-3">
          {story.comments.length === 0 ? (
            <p className="text-xs text-pink-400 italic py-1">
              No reflections yet. Be the first to leave a thoughtful reply. 💖
            </p>
          ) : (
            story.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 text-xs">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-pink-200 dark:border-pink-800"
                />
                <div className="flex-1 bg-pink-50/70 dark:bg-[#28132D] p-2.5 rounded-2xl border border-pink-100 dark:border-pink-900/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-pink-950 dark:text-pink-100">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-pink-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-pink-900/90 dark:text-pink-200/90">{comment.text}</p>
                </div>
              </div>
            ))
          )}

          {/* Add Comment Input Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a thoughtful reflection with love... 💖"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl bg-pink-50/60 dark:bg-[#28132D] border border-pink-200 dark:border-pink-900/60 text-pink-950 dark:text-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="min-h-[40px] px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs shadow-pink-500/20 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default StoryCard;
