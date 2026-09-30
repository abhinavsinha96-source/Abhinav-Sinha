import React, { useState, useMemo } from 'react';
import {
  X,
  Image as ImageIcon,
  Mic,
  Lock,
  Globe,
  ShieldAlert,
  Sparkles,
  Upload,
  Check,
  Trash2,
  MapPin,
  Film,
  ExternalLink,
  Wand2
} from 'lucide-react';
import { Story, User, GroundedPlace } from '../types';
import { checkContentModeration } from '../services/moderation';
import { AudioRecorder } from './AudioRecorder';
import { AudioPlayer } from './AudioPlayer';
import MapsGroundingModal from './MapsGroundingModal';
import VeoVideoModal from './VeoVideoModal';
import AiImageStudioModal from './AiImageStudioModal';
import { getIsOnline } from '../services/storage';

interface CreateStoryModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (story: Story) => void;
}

const PHOTO_PRESETS = [
  {
    name: 'Mountain Dawn',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Pottery Studio',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rainy Journal',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Tea Room Quiet',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  }
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  currentUser,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('Personal, Reflections');
  const [privacy, setPrivacy] = useState<'public' | 'friends_only'>('public');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [videoClipUrl, setVideoClipUrl] = useState<string | null>(null);
  const [audioClip, setAudioClip] = useState<{ url: string; durationSec: number; title: string } | null>(null);
  const [location, setLocation] = useState<string>('');
  const [groundedPlaces, setGroundedPlaces] = useState<GroundedPlace[]>([]);
  
  const [showRecorder, setShowRecorder] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showMapsModal, setShowMapsModal] = useState(false);
  const [showVeoModal, setShowVeoModal] = useState(false);
  const [showImageStudio, setShowImageStudio] = useState(false);

  const isOnline = getIsOnline();

  // Real-time Content Moderation evaluation
  const moderationResult = useMemo(() => {
    return checkContentModeration(`${title} ${content}`);
  }, [title, content]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
        setShowPhotoPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const newStory: Story = {
      id: 'story_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      title: title.trim(),
      content: content.trim(),
      timestamp: 'Just now',
      tags: tags.length > 0 ? tags : ['Personal'],
      photoUrl: selectedPhoto || undefined,
      videoClipUrl: videoClipUrl || undefined,
      audioClip: audioClip || undefined,
      location: location.trim() || undefined,
      groundedPlaces: groundedPlaces.length > 0 ? groundedPlaces : undefined,
      privacy,
      likesCount: 0,
      isLiked: false,
      comments: [],
      moderationStatus: moderationResult.isFlagged ? 'flagged' : 'approved',
      moderationReason: moderationResult.reason,
      isSensitive: moderationResult.isFlagged,
      syncStatus: isOnline ? 'synced' : 'pending_sync'
    };

    onSubmit(newStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C0A20]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-[#1E0B24]/95 rounded-3xl border border-pink-200/80 dark:border-pink-900/60 shadow-2xl shadow-pink-500/10 p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-100 dark:border-pink-900/50">
          <div>
            <h2 className="text-xl font-serif-display font-bold text-pink-950 dark:text-pink-100">
              Share a Queer Memoir & Story
            </h2>
            <p className="text-xs text-pink-700/70 dark:text-pink-300/70 mt-0.5">
              Express your journey with written narrative, photography, and spoken voice memoirs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-w-[40px] rounded-full hover:bg-pink-100 dark:hover:bg-pink-950/60 flex items-center justify-center text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-pink-900 dark:text-pink-200 mb-1.5">
              Story Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finding my authentic voice and chosen family..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-pink-50/70 dark:bg-[#16081A] border border-pink-200 dark:border-pink-800 text-pink-950 dark:text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 text-sm font-medium"
            />
          </div>

          {/* Narrative Content */}
          <div>
            <label className="block text-xs font-semibold text-pink-900 dark:text-pink-200 mb-1.5">
              Personal Memoir & Reflections
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what moved you today, a life chapter, an encounter, or an honest thought in this safe sanctuary..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-pink-50/70 dark:bg-[#16081A] border border-pink-200 dark:border-pink-800 text-pink-950 dark:text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 text-sm leading-relaxed"
            />
          </div>

          {/* Real-Time Moderation Safety Warning */}
          {moderationResult.isFlagged && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  Community Safety Filter Flag:
                </span>{' '}
                <span className="text-amber-800 dark:text-amber-300">
                  {moderationResult.reason}
                </span>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                  Haven preserves respectful dialogue. If submitted, this story will be blurred with a sensitive content warning.
                </p>
              </div>
            </div>
          )}

          {/* Media Attachments Section (Photo & Audio) */}
          <div className="space-y-3 pt-1">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Media Attachments (Photos & Audio Clips)
            </span>

            {/* Selected Video Preview (Veo Animated or User Video) */}
            {videoClipUrl && (
              <div className="relative rounded-xl overflow-hidden border border-purple-300 dark:border-purple-800 bg-black max-h-56">
                <video src={videoClipUrl} controls playsInline className="w-full h-56 object-contain" />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-purple-300 text-[10px] font-medium flex items-center gap-1.5 border border-purple-400/30">
                  <Film className="w-3 h-3" />
                  <span>Veo Animated Video</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoClipUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Selected Photo Preview */}
            {selectedPhoto && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 group">
                <img
                  src={selectedPhoto}
                  alt="Story attachment"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowVeoModal(true)}
                    title="Animate into video with Veo"
                    className="px-2.5 py-1 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs shadow-md transition-colors"
                  >
                    <Film className="w-3 h-3" />
                    <span>Animate with Veo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageStudio(true)}
                    title="Edit with AI"
                    className="px-2.5 py-1 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs shadow-md transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Edit with AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Selected Audio Preview */}
            {audioClip && !showRecorder && (
              <div className="relative">
                <AudioPlayer
                  clipId={audioClip.url}
                  durationSec={audioClip.durationSec}
                  title={audioClip.title}
                />
                <button
                  type="button"
                  onClick={() => setAudioClip(null)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Audio Recorder Drawer */}
            {showRecorder && (
              <AudioRecorder
                onRecordingComplete={(clip) => {
                  setAudioClip(clip);
                  setShowRecorder(false);
                }}
                onCancel={() => setShowRecorder(false)}
              />
            )}

            {/* Grounded Places Preview */}
            {(groundedPlaces.length > 0 || location) && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Grounded Location: {location || 'Google Maps Verified'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setGroundedPlaces([]);
                      setLocation('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-500"
                  >
                    Clear Location
                  </button>
                </div>
                {groundedPlaces.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {groundedPlaces.map((p, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-[11px] flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.title}</span>
                        {p.uri && (
                          <a href={p.uri} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline shrink-0 ml-1">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Photo Selection Drawer */}
            {showPhotoPicker && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Choose from Curated Photos or Upload
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPhotoPicker(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                {/* Upload Custom File */}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Upload image from device
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Curated Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(preset.url);
                        setShowPhotoPicker(false);
                      }}
                      className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-20 text-left hover:ring-2 hover:ring-emerald-500"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex items-end p-1.5 text-[10px] text-white font-medium">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Media Attachment Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{selectedPhoto ? 'Change Photo' : 'Attach Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImageStudio(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>AI Image Studio</span>
              </button>

              {selectedPhoto && (
                <button
                  type="button"
                  onClick={() => setShowVeoModal(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 text-xs font-medium text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center gap-2 transition-colors"
                >
                  <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{videoClipUrl ? 'Re-Animate with Veo' : 'Animate with Veo'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowRecorder(!showRecorder)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <Mic className="w-4 h-4 text-rose-500" />
                <span>{audioClip ? 'Replace Voice Note' : 'Record Audio Note'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMapsModal(true)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                  groundedPlaces.length > 0 || location
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{groundedPlaces.length > 0 ? `Maps: ${location || 'Attached'}` : 'Anchor with Google Maps'}</span>
              </button>
            </div>
          </div>

          {/* Tags & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Solitude, Woodcraft, Memories"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Audience Privacy
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    privacy === 'public'
                      ? 'bg-pink-100 dark:bg-pink-950/60 border-pink-500 text-pink-900 dark:text-pink-100 shadow-xs'
                      : 'border-pink-200 dark:border-pink-800 text-pink-700/70 dark:text-pink-300/70'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('friends_only')}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    privacy === 'friends_only'
                      ? 'bg-pink-100 dark:bg-pink-950/60 border-pink-500 text-pink-900 dark:text-pink-100 shadow-xs'
                      : 'border-pink-200 dark:border-pink-800 text-pink-700/70 dark:text-pink-300/70'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Chosen Family Only</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-pink-100 dark:border-pink-900/50">
            <span className="text-[11px] text-pink-600/70 dark:text-pink-400/70">
              {isOnline ? 'Direct publish to Haven feed' : 'Offline: Will queue & sync when connected'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-pink-700 dark:text-pink-300 hover:text-pink-950 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim()}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-xs shadow-pink-500/20 transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Publish Memoir</span>
              </button>
            </div>
          </div>
        </form>

        {/* Google Maps Grounding Modal */}
        <MapsGroundingModal
          isOpen={showMapsModal}
          onClose={() => setShowMapsModal(false)}
          onAttachPlacesToStory={(places, locText) => {
            setGroundedPlaces(places);
            setLocation(locText);
            setShowMapsModal(false);
          }}
        />

        {/* Veo Video Generator Modal */}
        <VeoVideoModal
          isOpen={showVeoModal}
          onClose={() => setShowVeoModal(false)}
          initialImage={selectedPhoto || undefined}
          onAttachVideoToStory={(videoUrl) => {
            setVideoClipUrl(videoUrl);
            setShowVeoModal(false);
          }}
        />

        {/* AI Image Studio Modal */}
        <AiImageStudioModal
          isOpen={showImageStudio}
          onClose={() => setShowImageStudio(false)}
          initialImage={selectedPhoto || undefined}
          onSelectImage={(imgUrl) => {
            setSelectedPhoto(imgUrl);
            setShowImageStudio(false);
          }}
          onSendToVideo={(imgUrl) => {
            setSelectedPhoto(imgUrl);
            setShowImageStudio(false);
            setShowVeoModal(true);
          }}
        />
      </div>
    </div>
  );
};
