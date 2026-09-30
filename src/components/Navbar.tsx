import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { User, AppNotification } from '../types';
import { getIsOnline, getIsSimulatedOffline, setSimulatedOffline, syncFirebaseUserWithProfile } from '../services/storage';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged, FirebaseUser } from '../services/firebase';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  activeTab: 'stories' | 'messages' | 'friends' | 'profile';
  setActiveTab: (tab: 'stories' | 'messages' | 'friends' | 'profile') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  activeUser: User;
  allUsers: User[];
  onSwitchUser?: (userId: string) => void;
  onSignOut: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenModeration: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  activeUser,
  allUsers,
  onSwitchUser,
  onSignOut,
  notifications,
  onOpenNotifications,
  onOpenModeration
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        syncFirebaseUserWithProfile(user).then((synced) => {
          onSwitchUser?.(synced.id);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      const user = await loginWithGoogle();
      const synced = await syncFirebaseUserWithProfile(user);
      onSwitchUser?.(synced.id);
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutUser();
      setFirebaseUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isOnline = getIsOnline();
  const isSimulatedOffline = getIsSimulatedOffline();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleOfflineSimulation = () => {
    setSimulatedOffline(!isSimulatedOffline);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1C0A20]/95 backdrop-blur-md border-b border-pink-200/80 dark:border-pink-900/60 shadow-xs shadow-pink-500/10 transition-colors">
      {/* Pride Ribbon top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-pink-500 via-rose-400 via-amber-300 via-emerald-400 via-sky-400 to-purple-500" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark with Queer Pride Flag */}
        <button
          onClick={() => setActiveTab('stories')}
          className="text-xl sm:text-2xl font-serif-display font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>Haven</span>
          <span className="text-base inline-block -rotate-6 filter drop-shadow-xs" role="img" aria-label="pride flag">🏳️‍🌈</span>
          <span className="hidden sm:inline-block text-[10px] font-sans font-semibold tracking-wider uppercase text-pink-600 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">
            Queer Sanctuary
          </span>
        </button>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('stories')}
            className={`transition-all pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'stories'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-[#663A69] dark:text-pink-200/70 hover:text-pink-600 dark:hover:text-pink-300'
            }`}
          >
            <span>💖 Stories</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`transition-all pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-[#663A69] dark:text-pink-200/70 hover:text-pink-600 dark:hover:text-pink-300'
            }`}
          >
            <span>💌 Messages</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-mono font-semibold">E2EE</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`transition-all pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'friends'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-[#663A69] dark:text-pink-200/70 hover:text-pink-600 dark:hover:text-pink-300'
            }`}
          >
            <span>🌈 Chosen Family</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`transition-all pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-[#663A69] dark:text-pink-200/70 hover:text-pink-600 dark:hover:text-pink-300'
            }`}
          >
            <span>✨ Profile Vault</span>
          </button>
        </nav>

        {/* Zone 3: Primary interactive controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Sync Mode Toggle */}
          <button
            type="button"
            onClick={toggleOfflineSimulation}
            title={isOnline ? 'Online (Click to simulate offline sync queue)' : 'Offline mode active (Queued items will sync when online)'}
            className={`min-h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isOnline
                ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/60'
                : 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 animate-pulse'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {isOnline ? 'Live Online' : 'Offline Mode'}
            </span>
          </button>

          {/* Safety & Moderation Center Trigger */}
          <button
            type="button"
            onClick={onOpenModeration}
            title="Community Safety & Moderation Rules"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-pink-200 dark:border-pink-900/50 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 flex items-center justify-center transition-colors"
            aria-label="Content Moderation and Community Safety"
          >
            <ShieldCheck className="w-4 h-4 text-pink-500 dark:text-pink-400" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title="Notifications"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-pink-200 dark:border-pink-900/50 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 flex items-center justify-center relative transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center font-mono shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-pink-200 dark:border-pink-900/50 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 flex items-center justify-center transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-pink-600" />}
          </button>

          {/* Google Sign-In with Firebase Auth Button */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-pink-300 dark:border-pink-700 bg-pink-50/70 dark:bg-pink-950/40 text-pink-900 dark:text-pink-200 text-xs">
              <div className="relative">
                <img
                  src={firebaseUser.photoURL || activeUser.avatar}
                  alt={firebaseUser.displayName || 'Google User'}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500 ring-1 ring-white" />
              </div>
              <span className="hidden lg:inline text-[11px] font-medium truncate max-w-[80px]">
                {firebaseUser.displayName?.split(' ')[0] || 'Google'}
              </span>
              <button
                type="button"
                onClick={handleGoogleSignOut}
                title="Sign out of Google"
                className="p-1 hover:text-rose-500 rounded transition-colors"
                aria-label="Sign out of Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-700 bg-white dark:bg-pink-950/40 hover:bg-pink-50 dark:hover:bg-pink-900/50 text-xs font-semibold text-pink-900 dark:text-pink-100 flex items-center gap-2 shadow-xs transition-all active:scale-95"
              title="Sign in with Google, Email & Password, or Instant Guest"
            >
              <LogIn className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span>Sign In / Connect</span>
            </button>
          )}

          {/* Authenticated User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="min-h-[44px] pl-2 pr-2.5 py-1 rounded-xl border border-pink-200 dark:border-pink-900/60 hover:bg-pink-50 dark:hover:bg-pink-950/40 flex items-center gap-2 transition-colors"
              title="Account & Profile Vault"
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-pink-300 dark:border-pink-700"
              />
              <span className="text-xs font-semibold text-pink-950 dark:text-pink-100 hidden lg:inline max-w-[110px] truncate">
                {activeUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1E0F23] border border-pink-200 dark:border-pink-900/60 shadow-xl shadow-pink-500/10 z-50 py-2 animate-fadeIn">
                  {/* Active Profile Summary */}
                  <div className="px-4 py-3 border-b border-pink-100 dark:border-pink-900/40">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={activeUser.avatar}
                        alt={activeUser.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-pink-200 dark:border-pink-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-pink-950 dark:text-pink-100 truncate flex items-center gap-1">
                          <span>{activeUser.name}</span>
                          <span className="text-[10px]">🏳️‍🌈</span>
                        </div>
                        <div className="text-[11px] font-mono text-pink-600 dark:text-pink-400 truncate">
                          {activeUser.handle}
                        </div>
                      </div>
                    </div>

                    {(activeUser.gender || activeUser.pronouns) && (
                      <div className="mt-2 pt-2 border-t border-pink-100 dark:border-pink-900/40 flex items-center gap-1.5 flex-wrap text-[10px]">
                        {activeUser.pronouns && (
                          <span className="px-2 py-0.5 rounded-md bg-pink-100/70 dark:bg-pink-950/70 text-pink-800 dark:text-pink-200 font-medium">
                            {activeUser.pronouns}
                          </span>
                        )}
                        {activeUser.gender && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-medium truncate max-w-[140px]">
                            {activeUser.gender}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-2.5 text-xs text-pink-950 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                      <span>My Profile & Encrypted Vault</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of Haven</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal for Reliable Sign-In Options */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserAuthenticated={(user) => {
          onSwitchUser?.(user.id);
        }}
      />
    </header>
  );
};
