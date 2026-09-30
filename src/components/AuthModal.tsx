import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Globe,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  getAuthErrorMessage,
  auth
} from '../services/firebase';
import { syncFirebaseUserWithProfile, createLocalUser } from '../services/storage';
import { User } from '../types';
import { WORLDWIDE_GENDERS } from '../data/genders';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAuthenticated: (user: User) => void;
  initialMode?: 'signin' | 'signup' | 'guest';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserAuthenticated,
  initialMode = 'signin'
}) => {
  const [tab, setTab] = useState<'google' | 'email' | 'guest' | 'profile'>('google');
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGender, setSelectedGender] = useState('Non-Binary (Enby)');
  const [selectedPronouns, setSelectedPronouns] = useState('they/them');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const fbUser = await loginWithGoogle();
      const syncedUser = await syncFirebaseUserWithProfile(fbUser);
      setSuccessMsg(`Welcome, ${syncedUser.name}! Securely connected.`);
      setTimeout(() => {
        onUserAuthenticated(syncedUser);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      const friendly = getAuthErrorMessage(err);
      setErrorMsg(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const fbUser = await registerWithEmail(email, password, displayName.trim() || undefined);
        const syncedUser = await syncFirebaseUserWithProfile(fbUser, {
          name: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          gender: selectedGender,
          pronouns: selectedPronouns
        });
        setSuccessMsg(`Account created successfully! Welcome, ${syncedUser.name}.`);
        setTimeout(() => {
          onUserAuthenticated(syncedUser);
          onClose();
        }, 1200);
      } else {
        const fbUser = await loginWithEmail(email, password);
        const syncedUser = await syncFirebaseUserWithProfile(fbUser);
        setSuccessMsg(`Signed in successfully! Welcome back, ${syncedUser.name}.`);
        setTimeout(() => {
          onUserAuthenticated(syncedUser);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Email Auth failed:', err);
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Attempt Firebase anonymous authentication
      const fbUser = await loginAnonymously();
      const syncedUser = await syncFirebaseUserWithProfile(fbUser, {
        name: displayName.trim() || 'Guest Storyteller',
        bio: bio.trim() || 'Exploring memoirs as an anonymous member.',
        gender: selectedGender,
        pronouns: selectedPronouns
      });
      setSuccessMsg('Signed in as Guest with cloud persistence enabled!');
      setTimeout(() => {
        onUserAuthenticated(syncedUser);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.warn('Anonymous Firebase auth failed, falling back to local guest profile:', err);
      // Fallback: create high-fidelity local guest profile
      const localUser = createLocalUser({
        name: displayName.trim() || 'Guest Storyteller',
        bio: 'Visiting storyteller exploring private memoirs and direct messaging.',
        gender: selectedGender,
        pronouns: selectedPronouns
      });
      setSuccessMsg('Guest profile ready! Welcome to Haven.');
      setTimeout(() => {
        onUserAuthenticated(localUser);
        onClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLocalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Please provide a display name.');
      return;
    }

    const newUser = createLocalUser({
      name: displayName.trim(),
      handle: handle.trim() || undefined,
      bio: bio.trim() || undefined,
      gender: selectedGender,
      pronouns: selectedPronouns
    });

    setSuccessMsg(`Profile for "${newUser.name}" created and activated!`);
    setTimeout(() => {
      onUserAuthenticated(newUser);
      onClose();
    }, 1000);
  };

  const copyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C0A20]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 rounded-3xl w-full max-w-lg shadow-2xl shadow-pink-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-pink-100 dark:border-pink-900/50 flex items-center justify-between bg-pink-50/70 dark:bg-[#16081A]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 dark:bg-pink-500/25 text-pink-600 dark:text-pink-300 flex items-center justify-center border border-pink-300/60 dark:border-pink-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif-display font-bold text-pink-950 dark:text-white">
                Haven Sanctuary Authentication
              </h2>
              <p className="text-xs text-pink-800/70 dark:text-pink-300/70 mt-0.5">
                Connect your account to sync memoirs, messages, and profile data securely.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 hover:bg-pink-100/60 dark:hover:bg-pink-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-pink-100/60 dark:bg-[#16081A]/80 border-b border-pink-200/80 dark:border-pink-900/60 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('google'); setErrorMsg(''); }}
            className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'google'
                ? 'bg-white dark:bg-[#1E0B24] text-pink-950 dark:text-white shadow-xs'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-950 dark:hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('email'); setErrorMsg(''); }}
            className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'email'
                ? 'bg-white dark:bg-[#1E0B24] text-pink-950 dark:text-white shadow-xs'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-950 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Pass</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('guest'); setErrorMsg(''); }}
            className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'guest'
                ? 'bg-white dark:bg-[#1E0B24] text-pink-950 dark:text-white shadow-xs'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-950 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Guest</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('profile'); setErrorMsg(''); }}
            className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'profile'
                ? 'bg-white dark:bg-[#1E0B24] text-pink-950 dark:text-white shadow-xs'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-950 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Profile</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="leading-relaxed">{errorMsg}</p>
                {errorMsg.includes('Authorized Domains') && (
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-rose-200 dark:border-rose-800">
                        {currentHostname}
                      </span>
                      <button
                        type="button"
                        onClick={copyDomain}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-1"
                      >
                        {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copied' : 'Copy Domain'}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('guest')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Or Click Here to Sign In Instantly via Guest Mode
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Google One-Tap */}
          {tab === 'google' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Continue with Google Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Sign in instantly with your verified Google email. Automatically restores your memoirs, cryptographic key pairs, and accepted friendships from Cloud Firestore.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>Want to use email or sign in without Google? </span>
                <button
                  type="button"
                  onClick={() => setTab('email')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Use Email & Password
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Email & Password */}
          {tab === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isSignUp ? 'Create a New Account' : 'Sign in to Your Account'}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isSignUp ? 'Already registered? Sign In' : 'New to Haven? Register'}
                </button>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name / Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="e.g. Jordan River"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Gender Identity
                    </label>
                    <select
                      value={selectedGender}
                      onChange={e => setSelectedGender(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="Non-Binary (Enby)">Non-Binary</option>
                      <option value="Woman / Female">Woman / Female</option>
                      <option value="Man / Male">Man / Male</option>
                      <option value="Two-Spirit (Niizh Manidoowag)">Two-Spirit</option>
                      <option value="Muxe / Muxhe">Muxe</option>
                      <option value="Hijra / Kinnar / Aravani">Hijra / Kinnar</option>
                      <option value="Genderfluid">Genderfluid</option>
                      <option value="Agender (Genderless)">Agender</option>
                      <option value="Transgender Woman (Trans Woman)">Transgender Woman</option>
                      <option value="Transgender Man (Trans Man)">Transgender Man</option>
                      <option value="Prefer Not to Say / Private">Prefer Not to Say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      value={selectedPronouns}
                      onChange={e => setSelectedPronouns(e.target.value)}
                      placeholder="e.g. they/them"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {isLoading
                    ? 'Processing...'
                    : isSignUp
                    ? 'Create Haven Account'
                    : 'Sign In to Haven'}
                </span>
              </button>
            </form>
          )}

          {/* TAB 3: Instant Guest */}
          {tab === 'guest' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Instant Frictionless Sign-In
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  Sign in immediately with one click. Generates a secure session with zero passwords required, letting you post stories, test encrypted direct messaging, and experience all features instantly!
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Guest Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Quiet Traveler"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender Identity
                  </label>
                  <select
                    value={selectedGender}
                    onChange={e => setSelectedGender(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Non-Binary (Enby)">Non-Binary</option>
                    <option value="Woman / Female">Woman / Female</option>
                    <option value="Man / Male">Man / Male</option>
                    <option value="Two-Spirit (Niizh Manidoowag)">Two-Spirit</option>
                    <option value="Muxe / Muxhe">Muxe</option>
                    <option value="Genderfluid">Genderfluid</option>
                    <option value="Agender (Genderless)">Agender</option>
                    <option value="Prefer Not to Say / Private">Prefer Not to Say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pronouns
                  </label>
                  <input
                    type="text"
                    value={selectedPronouns}
                    onChange={e => setSelectedPronouns(e.target.value)}
                    placeholder="e.g. they/them"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={isLoading}
                className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isLoading ? 'Creating Guest Session...' : 'Enter Haven as Guest'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: Create Local Profile */}
          {tab === 'profile' && (
            <form onSubmit={handleCreateLocalProfile} className="space-y-3.5 py-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Pen Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Robin Solis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Unique Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  placeholder="@robin_solis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Memoir Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Quiet chronicler of soundscapes and personal observations..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender Identity
                  </label>
                  <select
                    value={selectedGender}
                    onChange={e => setSelectedGender(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Non-Binary (Enby)">Non-Binary</option>
                    <option value="Woman / Female">Woman / Female</option>
                    <option value="Man / Male">Man / Male</option>
                    <option value="Two-Spirit (Niizh Manidoowag)">Two-Spirit</option>
                    <option value="Muxe / Muxhe">Muxe</option>
                    <option value="Fa'afafine">Fa'afafine</option>
                    <option value="Hijra / Kinnar / Aravani">Hijra / Kinnar</option>
                    <option value="Genderfluid">Genderfluid</option>
                    <option value="Agender (Genderless)">Agender</option>
                    <option value="Transgender Woman (Trans Woman)">Transgender Woman</option>
                    <option value="Transgender Man (Trans Man)">Transgender Man</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pronouns
                  </label>
                  <input
                    type="text"
                    value={selectedPronouns}
                    onChange={e => setSelectedPronouns(e.target.value)}
                    placeholder="e.g. they/them"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create & Switch to This Persona</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
