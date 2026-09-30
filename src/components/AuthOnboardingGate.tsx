import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  LogIn,
  UserPlus,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Users,
  Compass,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  getAuthErrorMessage
} from '../services/firebase';
import { syncFirebaseUserWithProfile, createLocalUser, updateUser } from '../services/storage';
import { User } from '../types';
import { WORLDWIDE_GENDERS, COMMON_PRONOUNS, findGenderByIdOrLabel } from '../data/genders';
import { GenderSelectorModal } from './GenderSelectorModal';

interface AuthOnboardingGateProps {
  onComplete: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
];

export const AuthOnboardingGate: React.FC<AuthOnboardingGateProps> = ({ onComplete }) => {
  // Step 1 = Auth (Sign Up or Sign In), Step 2 = Complete Profile Details
  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [initialName, setInitialName] = useState('');

  // Profile detail fields (Step 2)
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [gender, setGender] = useState('Non-Binary (Enby)');
  const [pronouns, setPronouns] = useState('they/them');
  const [genderVisibility, setGenderVisibility] = useState<'public' | 'friends_only' | 'private'>('public');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [philosophy, setPhilosophy] = useState('');

  // Modals and UI state
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Handle successful authentication
  const handleAuthSuccess = (user: User) => {
    // If the user already has full details filled in, enter directly!
    if (user.isProfileComplete && user.bio && (user.gender || user.aboutMyself?.gender)) {
      onComplete(user);
      return;
    }

    // Otherwise, transition to Step 2: Fill profile details
    setAuthenticatedUser(user);
    setName(user.name || initialName || '');
    setHandle(user.handle || '@' + (user.name || initialName || 'member').toLowerCase().replace(/[^a-z0-9]/g, '_'));
    setAvatar(user.avatar || PRESET_AVATARS[0]);
    setBio(user.bio || '');
    setGender(user.gender || user.aboutMyself?.gender || 'Non-Binary (Enby)');
    setPronouns(user.pronouns || user.aboutMyself?.pronouns || 'they/them');
    setLocation(user.aboutMyself?.location || '');
    setOccupation(user.aboutMyself?.occupation || '');
    setPhilosophy(user.aboutMyself?.lifePhilosophy || '');
    setStep('profile');
  };

  // Google One-Tap
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const fbUser = await loginWithGoogle();
      const user = await syncFirebaseUserWithProfile(fbUser);
      handleAuthSuccess(user);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }
    if (authMode === 'signup' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (authMode === 'signup') {
        const fbUser = await registerWithEmail(email, password, initialName.trim() || undefined);
        const user = await syncFirebaseUserWithProfile(fbUser, {
          name: initialName.trim() || undefined
        });
        handleAuthSuccess(user);
      } else {
        const fbUser = await loginWithEmail(email, password);
        const user = await syncFirebaseUserWithProfile(fbUser);
        handleAuthSuccess(user);
      }
    } catch (err: any) {
      console.error('Email authentication failed:', err);
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Guest Mode for new visitors
  const handleInstantGuest = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const fbUser = await loginAnonymously();
      const user = await syncFirebaseUserWithProfile(fbUser, {
        name: initialName.trim() || 'New Storyteller'
      });
      handleAuthSuccess(user);
    } catch (err: any) {
      // Local guest fallback if anonymous auth not enabled in Firebase
      const localUser = createLocalUser({
        name: initialName.trim() || 'New Storyteller',
        bio: '',
        gender: 'Non-Binary (Enby)',
        pronouns: 'they/them'
      });
      handleAuthSuccess(localUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save Profile Details
  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name or pen name.');
      return;
    }

    const cleanHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : '@' + (handle.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));

    const updatedUser: User = {
      ...(authenticatedUser || createLocalUser({ name })),
      name: name.trim(),
      handle: cleanHandle,
      avatar: avatar.trim() || PRESET_AVATARS[0],
      bio: bio.trim(),
      gender: gender.trim() || undefined,
      pronouns: pronouns.trim() || undefined,
      genderVisibility,
      isProfileComplete: true,
      aboutMyself: {
        location: location.trim(),
        occupation: occupation.trim(),
        gender: gender.trim() || undefined,
        pronouns: pronouns.trim() || undefined,
        lifePhilosophy: philosophy.trim(),
        interests: ['Writing', 'Memoirs', 'Storytelling'],
        languages: ['English']
      }
    };

    updateUser(updatedUser);
    onComplete(updatedUser);
  };

  const copyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const matchedGender = findGenderByIdOrLabel(gender);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Stories & Private Memoirs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif-display font-bold tracking-tight text-white">
            Haven
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            A sanctuary for personal memoirs, spoken voice reflections, and intimate end-to-end encrypted messaging.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* STEP 1: AUTHENTICATION GATE */}
          {step === 'auth' && (
            <div className="space-y-6">
              {/* Segmented Sign-Up / Sign-In Switch */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    authMode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    authMode === 'signin'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="leading-relaxed">{errorMsg}</p>
                    {errorMsg.includes('Authorized Domains') && (
                      <div className="pt-2 border-t border-rose-900/60 flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-slate-900 px-2 py-1 rounded border border-rose-800">
                          {currentHostname}
                        </span>
                        <button
                          type="button"
                          onClick={copyDomain}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-900 text-rose-200 flex items-center gap-1"
                        >
                          {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedDomain ? 'Copied' : 'Copy Domain'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Primary: Google One-Tap */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg active:scale-98 transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>
                  {isLoading
                    ? 'Connecting to Google...'
                    : authMode === 'signup'
                    ? 'Sign Up with Google'
                    : 'Sign In with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex-1 h-px bg-slate-800" />
                <span>or continue with email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Name / Pen Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={initialName}
                        onChange={e => setInitialName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={authMode === 'signup' ? 'Create a secure password (min. 6 chars)' : 'Enter your password'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[46px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {authMode === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>
                    {isLoading
                      ? 'Authenticating...'
                      : authMode === 'signup'
                      ? 'Create Haven Account'
                      : 'Sign In to Haven'}
                  </span>
                </button>
              </form>

              {/* Instant Guest / Explore Button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Want to test without an email?</span>
                <button
                  type="button"
                  onClick={handleInstantGuest}
                  disabled={isLoading}
                  className="font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Guest Access</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COMPLETE PROFILE & FILL DETAILS */}
          {step === 'profile' && (
            <form onSubmit={handleSaveProfileDetails} className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Step 2 of 2: Profile Setup
                </span>
                <h2 className="text-xl font-serif-display font-bold text-white mt-1">
                  Create Your Haven Profile & Identity
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Fill in your details to set up your encrypted identity. You can change these details anytime in your profile settings.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose an Avatar
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                  {PRESET_AVATARS.map((avUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(avUrl)}
                      className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                        avatar === avUrl
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} alt={`Avatar ${i}`} className="w-12 h-12 object-cover" />
                      {avatar === avUrl && (
                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name / Pen Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Jordan Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Handle (Unique ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    placeholder="@jordan_notes"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Worldwide Gender & Identity Picker */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-400" />
                      Worldwide Gender Identity
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Choose from all 60+ known genders worldwide, cultural traditions, or self-describe.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGenderModalOpen(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Browse All Genders</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-purple-900/60">
                  <div>
                    <div className="text-sm font-semibold text-purple-200">
                      {gender}
                    </div>
                    {matchedGender?.culturalOrigin && (
                      <div className="text-[11px] font-mono text-purple-400">
                        {matchedGender.culturalOrigin}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200">
                    Selected
                  </span>
                </div>

                {/* Pronouns & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={e => setPronouns(e.target.value)}
                      placeholder="e.g. they/them, she/her, he/him"
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gender Privacy
                    </label>
                    <select
                      value={genderVisibility}
                      onChange={e => setGenderVisibility(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-purple-500"
                    >
                      <option value="public">Public on Profile</option>
                      <option value="friends_only">Friends Only</option>
                      <option value="private">Private (Only Me)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio & Story */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Bio & Personal Memoir Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share a short introduction about your stories, craft, or reflections..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Location & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Occupation / Craft
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="Writer, Ceramicist, etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <span>Complete Profile & Enter Haven</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Worldwide Gender Directory Modal */}
      <GenderSelectorModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        currentGender={gender}
        currentPronouns={pronouns}
        currentVisibility={genderVisibility}
        onSave={data => {
          setGender(data.gender);
          if (data.pronouns) setPronouns(data.pronouns);
          setGenderVisibility(data.visibility);
        }}
      />
    </div>
  );
};
