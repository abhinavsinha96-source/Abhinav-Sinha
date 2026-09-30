import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  Mic,
  Camera,
  Mail,
  Key,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  LogIn,
  Zap,
  Copy,
  Check,
  Heart
} from 'lucide-react';
import { User } from '../types';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  getAuthErrorMessage
} from '../services/firebase';
import {
  syncFirebaseUserWithProfile,
  createLocalUser,
  getUsers,
  setActiveUserId
} from '../services/storage';

interface WelcomeAuthViewProps {
  onAuthenticated: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const WelcomeAuthView: React.FC<WelcomeAuthViewProps> = ({
  onAuthenticated,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [method, setMethod] = useState<'google' | 'email' | 'instant'>('google');

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const fbUser = await loginWithGoogle();
      const synced = await syncFirebaseUserWithProfile(fbUser);
      setSuccessMessage(`Welcome, ${synced.name}!`);
      setTimeout(() => {
        onAuthenticated(synced);
      }, 700);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      const friendly = getAuthErrorMessage(err);
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }
    if (authMode === 'signup' && !displayName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (authMode === 'signup') {
        const fbUser = await registerWithEmail(email, password, displayName.trim());
        const synced = await syncFirebaseUserWithProfile(fbUser, {
          name: displayName.trim(),
          isProfileComplete: false // Take them to profile details onboarding
        });
        setSuccessMessage(`Account created! Now let's fill your profile details.`);
        setTimeout(() => {
          onAuthenticated(synced);
        }, 800);
      } else {
        const fbUser = await loginWithEmail(email, password);
        const synced = await syncFirebaseUserWithProfile(fbUser);
        setSuccessMessage(`Signed in as ${synced.name}!`);
        setTimeout(() => {
          onAuthenticated(synced);
        }, 700);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      const friendly = getAuthErrorMessage(err);
      
      // If Firebase email provider is not enabled in Firebase Console (operation-not-allowed)
      // or unauthorized domain, offer smooth instant fallback so the user is never stuck!
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          `${friendly} Alternatively, you can use "Instant Safe Pass" below to enter immediately without email restrictions.`
        );
      } else {
        setErrorMessage(friendly);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantSafePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Please enter your name or pseudonym.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const newUser = createLocalUser({
        name: displayName.trim(),
        email: email.trim() || undefined,
        isProfileComplete: false // Triggers Profile Onboarding
      });
      setSuccessMessage(`Welcome, ${newUser.name}! Let's create your profile.`);
      setTimeout(() => {
        onAuthenticated(newUser);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize account.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] dark:bg-[#16081A] text-[#331435] dark:text-[#FDF2F8] flex flex-col font-sans selection:bg-pink-400 selection:text-white transition-colors duration-200">
      {/* Pride Ribbon top accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-pink-500 via-rose-400 via-amber-300 via-emerald-400 via-sky-400 to-purple-500" />

      {/* Top Welcome Header Bar */}
      <header className="w-full border-b border-pink-200/80 dark:border-pink-900/60 bg-white/80 dark:bg-[#1C0A20]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center font-serif-display font-bold text-lg shadow-pink-glow">
            H
          </div>
          <span className="text-xl sm:text-2xl font-serif-display font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            Haven
          </span>
          <span className="text-lg inline-block -rotate-6" role="img" aria-label="pride flag">🏳️‍🌈</span>
          <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-semibold border border-pink-200 dark:border-pink-800 ml-2">
            Queer Sanctuary
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleDarkMode}
          className="text-xs px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-900/60 hover:bg-pink-100/60 dark:hover:bg-pink-950/60 text-pink-800 dark:text-pink-200 transition-colors font-medium"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Night Velvet'}
        </button>
      </header>

      {/* Main Sanctuary Hero & Auth Gate */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Product Value & Sanctuary Intro */}
        <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 dark:bg-pink-500/20 text-pink-800 dark:text-pink-200 text-xs font-semibold border border-pink-300 dark:border-pink-800 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>A Safe, Queer & LGBTQIA+ Community Space 🏳️‍🌈</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif-display font-bold tracking-tight text-pink-950 dark:text-pink-50 leading-tight">
            Authentic Stories, Loved & Celebrated Out Loud.
          </h1>

          <p className="text-sm sm:text-base text-pink-900/80 dark:text-pink-200/80 leading-relaxed">
            Haven is a warm, queer-affirming sanctuary for spoken memoirs, curated photography, and heartfelt chosen family connections. Zero tracking, zero harassment—just our authentic lives preserved in end-to-end encrypted privacy.
          </p>

          {/* Pillars List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#200D26]/90 border border-pink-200/80 dark:border-pink-900/50 shadow-pink-glow flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-pink-950 dark:text-pink-100">Spoken Memoirs</div>
                <div className="text-[11px] text-pink-800/70 dark:text-pink-300/70 leading-snug mt-0.5">
                  Record real voice reflections with warm acoustics.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#200D26]/90 border border-pink-200/80 dark:border-pink-900/50 shadow-pink-glow flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-pink-950 dark:text-pink-100">Worldwide Identities</div>
                <div className="text-[11px] text-pink-800/70 dark:text-pink-300/70 leading-snug mt-0.5">
                  60+ gender identities, cultural terms & pronouns.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#200D26]/90 border border-pink-200/80 dark:border-pink-900/50 shadow-pink-glow flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-pink-950 dark:text-pink-100">Chosen Family Only</div>
                <div className="text-[11px] text-pink-800/70 dark:text-pink-300/70 leading-snug mt-0.5">
                  Mutual friend requests protect you from harassment.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#200D26]/90 border border-pink-200/80 dark:border-pink-900/50 shadow-pink-glow flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-pink-950 dark:text-pink-100">Encrypted Channels</div>
                <div className="text-[11px] text-pink-800/70 dark:text-pink-300/70 leading-snug mt-0.5">
                  E2EE verified direct messages & encrypted vault.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Required Sign-Up & Sign-In Card */}
        <div className="w-full max-w-md bg-white/95 dark:bg-[#200D26]/95 border border-pink-200/90 dark:border-pink-900/60 rounded-3xl shadow-xl shadow-pink-500/10 p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-pink-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-pink-100/70 dark:bg-[#2D1333] border border-pink-200/80 dark:border-pink-900/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-[#1C0A20] text-pink-600 dark:text-pink-300 shadow-xs font-bold'
                  : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-600 dark:hover:text-pink-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-[#1C0A20] text-pink-600 dark:text-pink-300 shadow-xs font-bold'
                  : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-600 dark:hover:text-pink-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl font-serif-display font-bold text-pink-950 dark:text-pink-50 flex items-center gap-2">
              <span>{authMode === 'signup' ? 'Join Our Queer Haven' : 'Welcome Home to Haven'}</span>
              <span>💖</span>
            </h2>
            <p className="text-xs text-pink-800/70 dark:text-pink-300/70 mt-1">
              {authMode === 'signup'
                ? 'Sign up to create your storyteller profile and fill in your pronouns & identity.'
                : 'Enter your credentials to access your memoirs, friends and encrypted vault.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {errorMessage.includes('Authorized Domains') && (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-rose-200 dark:border-rose-800 truncate">
                      {currentHostname}
                    </span>
                    <button
                      type="button"
                      onClick={copyDomain}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-1 shrink-0"
                    >
                      {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMethod('instant')}
                    className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> Switch to Instant Safe Pass (No Domain Restrictions)
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-pink-100/70 dark:bg-pink-950/50 border border-pink-300 dark:border-pink-800 text-pink-800 dark:text-pink-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-pink-600 dark:text-pink-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Primary Quick Option: Google Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-pink-50/50 dark:bg-[#28132D] dark:hover:bg-[#321738] text-pink-950 dark:text-pink-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 border border-pink-200 dark:border-pink-800/80 shadow-xs active:scale-98 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-pink-200 dark:border-pink-900/60 w-full" />
              <span className="bg-white dark:bg-[#200D26] px-3 text-[11px] text-pink-400 uppercase tracking-wider font-mono">
                or with email / safe pass
              </span>
            </div>
          </div>

          {/* Sub-Methods: Email vs Instant Safe Pass */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-pink-200 dark:border-pink-900/60 pb-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`pb-1 border-b-2 transition-all ${
                  method === 'email'
                    ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                    : 'border-transparent text-pink-800/60 dark:text-pink-300/60 hover:text-pink-600'
                }`}
              >
                💌 Email & Password
              </button>

              <button
                type="button"
                onClick={() => setMethod('instant')}
                className={`pb-1 border-b-2 flex items-center gap-1 transition-all ${
                  method === 'instant'
                    ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                    : 'border-transparent text-pink-800/60 dark:text-pink-300/60 hover:text-pink-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-pink-500" />
                <span>⚡ Instant Safe Pass</span>
              </button>
            </div>

            {/* Form A: Email & Password */}
            {method === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                      Full Name / Moniker
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Vance"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-pink-950 dark:text-pink-200">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-pink-400 hover:text-pink-600 dark:hover:text-pink-300"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-pink-glow active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : authMode === 'signup' ? (
                    <>
                      <span>Sign Up & Fill Profile Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Sign In to Haven 💖</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form B: Instant Safe Pass */}
            {method === 'instant' && (
              <form onSubmit={handleInstantSafePass} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-pink-100/60 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-[11px] text-pink-900 dark:text-pink-200 leading-relaxed">
                  Instant Safe Pass lets you sign up immediately in any environment without email verification. You'll complete your profile details and pronouns on the next screen.
                </div>

                <div>
                  <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                    Your Name or Storyteller Moniker *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rowan Miller"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-pink-950 dark:text-pink-200 mb-1">
                    Optional Email (for identity recovery)
                  </label>
                  <input
                    type="email"
                    placeholder="optional@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-[#28132D] text-pink-950 dark:text-pink-50 text-xs outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-pink-glow active:scale-95 transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-pink-200" />
                  <span>Enter & Fill Profile Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-pink-200/80 dark:border-pink-900/50 py-6 text-center text-xs text-pink-400">
        <p>Haven Sanctuary • Queer & LGBTQIA+ Community • End-to-End Cryptography • Worldwide Pride 🏳️‍🌈</p>
      </footer>
    </div>
  );
};
export default WelcomeAuthView;
