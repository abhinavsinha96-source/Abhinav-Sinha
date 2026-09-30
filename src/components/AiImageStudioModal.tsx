import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Upload,
  Download,
  Check,
  Film,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { generateStoryImage, editStoryImage } from '../services/aiService';

interface AiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (imageUrl: string) => void;
  onSendToVideo?: (imageUrl: string) => void;
  initialImage?: string;
}

export default function AiImageStudioModal({
  isOpen,
  onClose,
  onSelectImage,
  onSendToVideo,
  initialImage
}: AiImageStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  
  // Create mode state
  const [createPrompt, setCreatePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit mode state
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSourceImage(reader.result as string);
        setEditedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setCreateError(null);
    try {
      const url = await generateStoryImage(createPrompt.trim(), aspectRatio);
      setGeneratedImageUrl(url);
    } catch (err: any) {
      setCreateError(err.message || 'Image generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceImage || !editPrompt.trim() || isEditing) return;

    setIsEditing(true);
    setEditError(null);
    try {
      const url = await editStoryImage(editPrompt.trim(), sourceImage);
      setEditedImageUrl(url);
    } catch (err: any) {
      setEditError(err.message || 'Image editing failed');
    } finally {
      setIsEditing(false);
    }
  };

  const promptSuggestions = [
    "A misty morning pine forest ridge at golden dawn, atmospheric film photography",
    "An open leather journal with warm coffee cup on weathered oak cafe table",
    "Artisan hands shaping warm terracotta clay in a sunlit pottery studio",
    "Soft twilight over a quiet coastal lighthouse with gentle ocean waves"
  ];

  const editSuggestions = [
    "Add warm golden hour sunlight streaming across the scene",
    "Give it a nostalgic 35mm film aesthetic with soft grain",
    "Add gentle raindrops glistening on the surfaces",
    "Transform the background into a cozy twilight ambiance"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
                  AI Image Studio
                </h3>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  gemini-3.1-flash-image-preview
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Create memoir imagery and edit personal photography with text prompts
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

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-5 pt-3 gap-6 bg-stone-50/50 dark:bg-stone-900/40">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-amber-700 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Create New Image</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'edit'
                ? 'border-amber-700 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Edit Existing Image</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'create' ? (
            /* CREATE MODE */
            <div className="space-y-4">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Text Prompt for Story Visual
                  </label>
                  <textarea
                    value={createPrompt}
                    onChange={(e) => setCreatePrompt(e.target.value)}
                    placeholder="Describe the image you want to create (e.g. A solitary wooden cabin in a pine forest at sunrise)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-stone-400 font-medium py-1">Inspirations:</span>
                  {promptSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCreatePrompt(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-600 dark:text-stone-300 transition-colors"
                    >
                      {s.slice(0, 38)}...
                    </button>
                  ))}
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                          aspectRatio === ratio
                            ? 'bg-amber-700 text-white shadow-sm'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {ratio} {ratio === '16:9' ? '(Landscape)' : ratio === '9:16' ? '(Portrait)' : ratio === '1:1' ? '(Square)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {createError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs">
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!createPrompt.trim() || isGenerating}
                  className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Image with gemini-3.1-flash-image-preview...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>
              </form>

              {/* Generated Result Preview */}
              {generatedImageUrl && (
                <div className="mt-4 p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <span>Generated Result</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/30 border border-stone-200 dark:border-stone-700 flex items-center justify-center max-h-[380px]">
                    <img
                      src={generatedImageUrl}
                      alt="AI Generated Story Art"
                      className="w-full h-full object-contain max-h-[380px]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {onSelectImage && (
                      <button
                        onClick={() => {
                          onSelectImage(generatedImageUrl);
                          onClose();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Use for Story</span>
                      </button>
                    )}

                    {onSendToVideo && (
                      <button
                        onClick={() => {
                          onSendToVideo(generatedImageUrl);
                          onClose();
                        }}
                        className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Film className="w-4 h-4" />
                        <span>Animate into Video with Veo</span>
                      </button>
                    )}

                    <a
                      href={generatedImageUrl}
                      download="haven_story_artwork.png"
                      className="py-2.5 px-4 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            <div className="space-y-4">
              {/* Image Source Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  1. Source Photo to Edit
                </label>
                {sourceImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-48 flex items-center justify-center bg-stone-100 dark:bg-stone-800 group">
                    <img src={sourceImage} alt="Source to edit" className="max-h-48 object-contain" />
                    <button
                      onClick={() => {
                        setSourceImage(null);
                        setEditedImageUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-colors bg-stone-50 dark:bg-stone-800/40">
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Upload photo to edit
                    </span>
                    <span className="text-[11px] text-stone-500">Supports PNG, JPEG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Edit Instruction Form */}
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    2. Edit Instructions
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe how to modify this image (e.g. Add golden hour light, add falling autumn leaves, make it look like a vintage painting)..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                {/* Edit suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-stone-400 font-medium py-1">Quick edits:</span>
                  {editSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditPrompt(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-600 dark:text-stone-300 transition-colors"
                    >
                      {s.slice(0, 36)}...
                    </button>
                  ))}
                </div>

                {editError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs">
                    {editError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!sourceImage || !editPrompt.trim() || isEditing}
                  className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isEditing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transforming with gemini-3.1-flash-image-preview...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Apply AI Image Edit</span>
                    </>
                  )}
                </button>
              </form>

              {/* Edited Result Comparison */}
              {editedImageUrl && (
                <div className="mt-4 p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <span>Edited Result</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Successfully Modified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-stone-400 block mb-1 font-medium">Original</span>
                      <img src={sourceImage!} alt="Original" className="rounded-xl border border-stone-200 dark:border-stone-700 max-h-48 w-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block mb-1 font-medium">Modified</span>
                      <img src={editedImageUrl} alt="Modified" className="rounded-xl border border-amber-300 dark:border-amber-700 max-h-48 w-full object-cover shadow-sm" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {onSelectImage && (
                      <button
                        onClick={() => {
                          onSelectImage(editedImageUrl);
                          onClose();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Use for Story</span>
                      </button>
                    )}

                    {onSendToVideo && (
                      <button
                        onClick={() => {
                          onSendToVideo(editedImageUrl);
                          onClose();
                        }}
                        className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Film className="w-4 h-4" />
                        <span>Animate with Veo</span>
                      </button>
                    )}

                    <a
                      href={editedImageUrl}
                      download="haven_edited_photo.png"
                      className="py-2.5 px-4 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
