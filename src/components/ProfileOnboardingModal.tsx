import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Globe,
  MapPin,
  Briefcase,
  Quote,
  Tag,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Eye,
  Users,
  Lock,
  Upload,
  Plus,
  X,
  Volume2,
  Heart
} from 'lucide-react';
import { User } from '../types';
import { WORLDWIDE_GENDERS, findGenderByIdOrLabel } from '../data/genders';
import { GenderSelectorModal } from './GenderSelectorModal';
import { AudioRecorder } from './AudioRecorder';
import { AudioPlayer } from './AudioPlayer';

interface ProfileOnboardingModalProps {
  user: User;
  onComplete: (completedUser: User) => void;
}

const PRESET_AVATARS = [
  { label: 'Alex', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Elena', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Marcus', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Maya', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { label: 'Kai', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
  { label: 'Sora', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' }
];

const POPULAR_INTERESTS = [
  'Spoken Memoirs',
  'Photography',
  'Poetry',
  'Soundscapes',
  'Travel Notes',
  'Philosophy',
  'Acoustic Archives',
  'Visual Journaling',
  'Nature & Solitude',
  'Family History',
  'Mindfulness'
];

export const ProfileOnboardingModal: React.FC<ProfileOnboardingModalProps> = ({
  user,
  onComplete
}) => {
  // Personal Details
  const [name, setName] = useState(user.name || '');
  const [handle, setHandle] = useState(user.handle || `@${(user.name || 'storyteller').toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0].url);
  const [bio, setBio] = useState(user.bio || '');

  // Identity & Worldwide Gender
  const [gender, setGender] = useState(user.gender || user.aboutMyself?.gender || 'Non-Binary (Enby)');
  const [pronouns, setPronouns] = useState(user.pronouns || user.aboutMyself?.pronouns || 'they/them');
  const [genderVisibility, setGenderVisibility] = useState<'public' | 'friends_only' | 'private'>(
    user.genderVisibility || 'public'
  );
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);

  // About Myself Details
  const [location, setLocation] = useState(user.aboutMyself?.location || '');
  const [occupation, setOccupation] = useState(user.aboutMyself?.occupation || '');
  const [philosophy, setPhilosophy] = useState(user.aboutMyself?.lifePhilosophy || '');
  const [interests, setInterests] = useState<string[]>(
    user.aboutMyself?.interests && user.aboutMyself.interests.length > 0
      ? user.aboutMyself.interests
      : ['Spoken Memoirs', 'Photography']
  );
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Audio Voice Intro
  const [audioIntro, setAudioIntro] = useState(user.audioIntro);
  const [isRecordingIntro, setIsRecordingIntro] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const matchedGender = findGenderByIdOrLabel(gender);

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter(i => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInterestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setCustomInterestInput('');
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size should be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter your full name or storyteller moniker.');
      return;
    }
    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    if (cleanHandle.length < 2) {
      setValidationError('Please enter a valid handle (e.g. @your_name).');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    const completed: User = {
      ...user,
      name: name.trim(),
      handle: cleanHandle,
      avatar: avatar.trim() || user.avatar,
      bio: bio.trim(),
      gender,
      pronouns: pronouns.trim(),
      genderVisibility,
      audioIntro,
      isProfileComplete: true,
      aboutMyself: {
        location: location.trim(),
        occupation: occupation.trim(),
        gender,
        pronouns: pronouns.trim(),
        lifePhilosophy: philosophy.trim(),
        interests,
        languages: user.aboutMyself?.languages || ['English']
      }
    };

    setTimeout(() => {
      onComplete(completed);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C0A20]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E0B24] border border-pink-200 dark:border-pink-900/60 rounded-3xl w-full max-w-3xl shadow-2xl shadow-pink-500/10 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Pride Ribbon */}
        <div className="h-[3px] w-full bg-gradient-to-r from-pink-500 via-rose-400 via-amber-300 via-emerald-400 via-sky-400 to-purple-500" />
        
        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-pink-600 via-rose-500 via-purple-600 to-indigo-600 text-white p-6 sm:p-8">
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-pink-100 flex items-center justify-center border border-white/25 shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6 text-pink-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-pink-100 text-xs font-medium border border-white/30 mb-2">
                <Heart className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
                Step 2 of 2 • Welcome to Haven 🏳️‍🌈
              </div>
              <h2 className="text-xl sm:text-2xl font-serif-display font-bold">
                Craft Your Queer Profile & Identity
              </h2>
              <p className="text-pink-100/90 text-xs sm:text-sm mt-1 leading-relaxed max-w-xl">
                Fill in your details, pronouns, and worldwide gender expression to establish your safe encrypted identity in our LGBTQIA+ community.
              </p>
            </div>
          </div>

          {/* Decorative sphere */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Avatar Section */}
          <div className="space-y-3 pb-6 border-b border-pink-100 dark:border-pink-900/40">
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
              1. Profile Avatar & Visual Representation
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-pink-400/30 shadow-md bg-pink-50 dark:bg-[#28132D]"
                />
                <label className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white p-2 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95" title="Upload custom photo">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="text-xs text-pink-900/80 dark:text-pink-200/80">
                  Pick a portrait below, or upload a personal photo from your device:
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`relative w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                        avatar === p.url
                          ? 'border-pink-500 ring-2 ring-pink-400/40 scale-105'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).slice(2)}`)}
                    className="px-2.5 py-1.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50/60 dark:bg-[#28132D] text-[11px] font-medium text-pink-900 dark:text-pink-200 hover:bg-pink-100"
                  >
                    Randomize
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Basic Identity */}
          <div className="space-y-4 pb-6 border-b border-pink-100 dark:border-pink-900/40">
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
              2. Name, Storyteller Handle & Bio
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                  Full Name / Moniker *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Vance"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!handle || handle.startsWith('@storyteller')) {
                      setHandle(`@${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-sm outline-none focus:ring-2 focus:ring-pink-400/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                  Handle / Username (@) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="@jordan_notes"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-sm font-mono outline-none focus:ring-2 focus:ring-pink-400/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                Bio / Memoirist Introduction
              </label>
              <textarea
                rows={3}
                placeholder="Share a few words on what stories you hold, what memories you wish to preserve, or your perspective on life..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-sm outline-none focus:ring-2 focus:ring-pink-400/40 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Worldwide Gender Identity & Pronouns */}
          <div className="space-y-4 pb-6 border-b border-pink-100 dark:border-pink-900/40">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
                3. Worldwide Gender Identity & Cultural Expression
              </label>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                60+ Worldwide Catalog 🏳️‍🌈
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-[#28132D] border border-pink-200/80 dark:border-pink-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-pink-900 dark:text-pink-200 font-semibold mb-1">
                    Selected Gender Identity:
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#1E0B24] border border-pink-300 dark:border-pink-700 text-pink-900 dark:text-pink-200 font-medium text-xs shadow-xs">
                    <Globe className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    <span>{gender}</span>
                    {matchedGender?.culturalOrigin && (
                      <span className="text-[10px] text-pink-500 dark:text-pink-400 font-normal">
                        ({matchedGender.culturalOrigin})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGenderModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-pink-glow transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Choose from Worldwide Catalog</span>
                </button>
              </div>

              {matchedGender?.description && (
                <p className="text-xs text-pink-900/80 dark:text-pink-300/80 leading-relaxed bg-white/70 dark:bg-[#1C0A20]/60 p-3 rounded-xl border border-pink-200/60 dark:border-pink-800/40">
                  {matchedGender.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                    Preferred Pronouns
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. they/them, she/her, he/him, ze/zir"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white dark:bg-[#1C0A20] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                    Identity Visibility
                  </label>
                  <select
                    value={genderVisibility}
                    onChange={(e) => setGenderVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white dark:bg-[#1C0A20] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  >
                    <option value="public">Public (Visible to everyone in Haven)</option>
                    <option value="friends_only">Friends Only (Visible to accepted mutual friends)</option>
                    <option value="private">Private (Only visible in your private profile vault)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Location, Craft & Life Philosophy */}
          <div className="space-y-4 pb-6 border-b border-pink-100 dark:border-pink-900/40">
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
              4. Location, Craft & Life Philosophy
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                  Location (City / Region)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Portland, Oregon"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                  Occupation / Artistic Craft
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Acoustic Chronicler & Photographer"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                Personal Philosophy / Guiding Motto
              </label>
              <div className="relative">
                <Quote className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Every ordinary life carries an extraordinary unwritten memoir."
                  value={philosophy}
                  onChange={(e) => setPhilosophy(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                />
              </div>
            </div>
          </div>

          {/* 5. Themes & Passions (Interests) */}
          <div className="space-y-3 pb-6 border-b border-pink-100 dark:border-pink-900/40">
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
              5. Story Themes & Passions
            </label>
            <p className="text-xs text-pink-800/70 dark:text-pink-300/70">
              Select themes that reflect your storytelling craft:
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {POPULAR_INTERESTS.map((tag) => {
                const isSelected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-glow font-semibold scale-102'
                        : 'bg-pink-50 dark:bg-[#28132D] text-pink-900 dark:text-pink-200 border border-pink-200/80 dark:border-pink-900/60 hover:border-pink-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{tag}
                  </button>
                );
              })}
            </div>

            {/* Custom interest tag adder */}
            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="text"
                placeholder="Add custom theme..."
                value={customInterestInput}
                onChange={(e) => setCustomInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomInterest(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-xs text-pink-950 dark:text-pink-50 outline-none focus:ring-2 focus:ring-pink-400/40"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                className="px-3.5 py-1.5 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-200 text-xs font-semibold hover:bg-pink-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* 6. Spoken Voice Intro */}
          <div className="space-y-3 pb-6 border-b border-pink-100 dark:border-pink-900/40">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
                6. Spoken Audio Introduction (Optional)
              </label>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                🎙️ Voice Memoir
              </span>
            </div>
            <p className="text-xs text-pink-800/70 dark:text-pink-300/70">
              Record a 10-second spoken greeting to let community members hear the warmth of your voice:
            </p>

            {audioIntro ? (
              <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-pink-800 dark:text-pink-200 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-pink-600" />
                    Spoken Intro Ready ({audioIntro.durationSec}s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAudioIntro(undefined)}
                    className="text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <AudioPlayer
                  clipId={audioIntro.url}
                  durationSec={audioIntro.durationSec}
                  title={audioIntro.title}
                />
              </div>
            ) : isRecordingIntro ? (
              <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-[#28132D] border border-pink-200 dark:border-pink-900/60">
                <AudioRecorder
                  onRecordingComplete={(clip) => {
                    setAudioIntro(clip);
                    setIsRecordingIntro(false);
                  }}
                  onCancel={() => setIsRecordingIntro(false)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingIntro(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-pink-300 dark:border-pink-800 hover:border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-800 dark:text-pink-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Mic className="w-4 h-4 text-pink-500" />
                <span>Click to Record Spoken Voice Introduction</span>
              </button>
            )}
          </div>

          {/* Cryptographic Key Preview */}
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-[#28132D] border border-pink-200/80 dark:border-pink-900/60 text-xs flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-semibold text-pink-950 dark:text-pink-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pink-500" />
                Cryptographic Identity Fingerprint
              </div>
              <div className="text-[11px] font-mono text-pink-700/80 dark:text-pink-300/80">
                {user.publicKeyFingerprint}
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 font-mono">
              Auto-Provisioned
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-pink-glow active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Establishing Profile...</span>
              ) : (
                <>
                  <span>Complete Profile & Enter Haven 💖</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Gender Selector Modal */}
      <GenderSelectorModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        currentGender={gender}
        currentPronouns={pronouns}
        currentVisibility={genderVisibility}
        onSave={(data) => {
          setGender(data.gender);
          if (data.pronouns) setPronouns(data.pronouns);
          if (data.visibility) setGenderVisibility(data.visibility);
        }}
      />
    </div>
  );
};
export default ProfileOnboardingModal;
