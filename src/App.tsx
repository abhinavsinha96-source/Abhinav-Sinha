import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  ShieldCheck,
  Radio,
  X,
  Heart,
  Volume2,
  MapPin,
  Film,
  Bot,
  Wand2
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { StoryCard } from './components/StoryCard';
import { CreateStoryModal } from './components/CreateStoryModal';
import { DirectMessaging } from './components/DirectMessaging';
import { FriendsView } from './components/FriendsView';
import { ProfileView } from './components/ProfileView';
import { NotificationsModal } from './components/NotificationsModal';
import { ModerationInspectorModal } from './components/ModerationInspectorModal';
import MapsGroundingModal from './components/MapsGroundingModal';
import VeoVideoModal from './components/VeoVideoModal';
import AiImageStudioModal from './components/AiImageStudioModal';
import GeminiChatbotModal from './components/GeminiChatbotModal';
import { WelcomeAuthView } from './components/WelcomeAuthView';
import { ProfileOnboardingModal } from './components/ProfileOnboardingModal';

import { User, Story, DirectMessage, FriendRequest, AppNotification } from './types';
import {
  getUsers,
  getActiveUser,
  setActiveUserId,
  completeUserProfile,
  signOutSession,
  getStories,
  addStory,
  toggleStoryLike,
  addStoryComment,
  getMessages,
  getFriendRequests,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  subscribeToStore,
  getIsOnline,
  getIsSimulatedOffline,
  processOfflineSyncQueue,
  getSyncQueue,
  initFirestoreSync
} from './services/storage';

export default function App() {
  // Store snapshot state (typed User | null so new visitors are not prematurely logged in)
  const [activeUser, setActiveUser] = useState<User | null>(() => getActiveUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => getUsers());
  const [stories, setStories] = useState<Story[]>(() => getStories());
  const [messages, setMessages] = useState<DirectMessage[]>(() => getMessages());
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => getFriendRequests());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());
  const [isOnline, setIsOnline] = useState<boolean>(() => getIsOnline());
  const [isSimulatedOffline, setIsSimOffline] = useState<boolean>(() => getIsSimulatedOffline());
  const [syncQueue, setSyncQueue] = useState(() => getSyncQueue());

  // UI Navigation
  const [activeTab, setActiveTab] = useState<'stories' | 'messages' | 'friends' | 'profile'>('stories');
  const [selectedDirectPeerId, setSelectedDirectPeerId] = useState<string | undefined>(undefined);

  // Light Pink Queer Mode default (user can switch to night velvet dark mode if desired)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('haven_dark_mode_queer_v3');
    if (saved !== null) return saved === 'true';
    return false; // Default to gorgeous, joyous light pink aesthetic!
  });

  // Modal States
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [activePhotoForVeo, setActivePhotoForVeo] = useState<string | null>(null);
  const [activePhotoForEdit, setActivePhotoForEdit] = useState<string | null>(null);

  // Search and Tag Filter for Stories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Syncing state & Toast feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const syncFromStore = () => {
      setActiveUser(getActiveUser());
      setAllUsers(getUsers());
      setStories(getStories());
      setMessages(getMessages());
      setFriendRequests(getFriendRequests());
      setNotifications(getNotifications());
      setIsOnline(getIsOnline());
      setIsSimOffline(getIsSimulatedOffline());
      setSyncQueue(getSyncQueue());
    };

    const unsubscribe = subscribeToStore(syncFromStore);
    initFirestoreSync();

    const handleWindowOnline = () => {
      setIsOnline(true);
      showToast('Back online! Syncing encrypted changes...');
      handleTriggerSync();
    };

    const handleWindowOffline = () => {
      setIsOnline(false);
      showToast('Offline mode active. All stories & messages preserved locally.');
    };

    window.addEventListener('online', handleWindowOnline);
    window.addEventListener('offline', handleWindowOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleWindowOnline);
      window.removeEventListener('offline', handleWindowOffline);
    };
  }, []);

  // Sync Dark Mode class with HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('haven_dark_mode_queer_v3', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('haven_dark_mode_queer_v3', 'false');
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleTriggerSync = useCallback(async () => {
    setIsSyncing(true);
    await processOfflineSyncQueue();
    setTimeout(() => {
      setIsSyncing(false);
      showToast('All local changes synchronized successfully');
    }, 700);
  }, []);

  // Periodic heartbeat simulating real-time community engagement
  useEffect(() => {
    const timer = setInterval(() => {
      if (getIsOnline()) {
        // Run any background synchronization tasks
        processOfflineSyncQueue();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Handlers for switching personas
  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
    const user = getUsers().find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      showToast(`Switched active user to ${user.name}`);
    }
  };

  const handleSignOut = async () => {
    await signOutSession();
    setActiveUser(null);
    showToast('Signed out of Haven');
  };

  // Story filters
  const allTags = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    stories.forEach(s => s.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [stories]);

  const filteredStories = useMemo(() => {
    if (!activeUser) return [];
    return stories.filter(story => {
      // Privacy filter: if friends_only, only author or friends can view
      if (story.privacy === 'friends_only') {
        const isAuthor = story.authorId === activeUser.id;
        const isFriend = activeUser.friends.includes(story.authorId);
        if (!isAuthor && !isFriend) return false;
      }

      const matchesSearch =
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || story.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [stories, searchQuery, selectedTag, activeUser]);

  // 1. Unauthenticated Gate: First-time or signed-out visitors MUST sign up or sign in
  if (!activeUser) {
    return (
      <WelcomeAuthView
        onAuthenticated={(user) => {
          setActiveUser(user);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  // 2. Profile Onboarding Gate: New users MUST complete their profile and fill details
  if (!activeUser.isProfileComplete) {
    return (
      <ProfileOnboardingModal
        user={activeUser}
        onComplete={(completedUser) => {
          completeUserProfile(completedUser.id, completedUser);
          setActiveUser(completedUser);
          showToast(`Profile created! Welcome to Haven, ${completedUser.name}.`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5]/80 dark:bg-[#150917] text-[#2E152F] dark:text-[#FDF2F7] flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-pink-300 selection:text-pink-900 dark:selection:bg-pink-800 dark:selection:text-pink-100">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'messages') setSelectedDirectPeerId(undefined);
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        activeUser={activeUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onSignOut={handleSignOut}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenModeration={() => setIsModerationOpen(true)}
      />

      {/* Floating Offline / Sync Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-pink-950/90 dark:bg-white/95 text-pink-100 dark:text-pink-950 text-xs font-semibold rounded-full shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce border border-pink-500/30">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-pink-400 dark:text-pink-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Sync Banner if pending items */}
      {syncQueue.length > 0 && (
        <div className="bg-pink-500/10 border-b border-pink-500/20 py-2 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-pink-900 dark:text-pink-200">
            <span className="flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {syncQueue.length} offline {syncQueue.length === 1 ? 'action' : 'actions'} queued locally for sync
            </span>
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing || !isOnline}
              className="font-bold underline hover:opacity-80 disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}

      {/* Primary Application Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* TAB 1: STORIES FEED */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            {/* Ambient Queer Pride & Spoken Memoirs Header */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-600 via-rose-500 via-purple-600 to-indigo-600 text-white p-6 sm:p-10 shadow-xl shadow-pink-500/10 border border-pink-300/30">
              <div className="max-w-2xl relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-pink-100 text-xs font-semibold border border-white/30">
                  <Heart className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
                  <span>Spoken Queer Memoirs & Authentic Photography • Proud Haven 🏳️‍🌈</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif-display font-bold tracking-tight leading-tight">
                  Authentic Stories, Spoken & Loved Out Loud.
                </h1>
                <p className="text-pink-100/90 text-xs sm:text-sm leading-relaxed">
                  Listen to voices across the LGBTQIA+ and worldwide spectrum, share photographs and personal voice memoirs, and connect in end-to-end encrypted direct channels with your chosen family.
                </p>
                <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setIsCreateStoryOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-pink-50 text-pink-700 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-black/10 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-pink-600" />
                    <span>Share Your Story</span>
                  </button>
                  <button
                    onClick={() => setIsMapsModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
                    title="Ground stories in real world locations using Google Maps"
                  >
                    <MapPin className="w-4 h-4 text-pink-200" />
                    <span>Google Maps Places</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePhotoForVeo(null);
                      setIsVeoModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
                    title="Animate photo into cinematic video with Veo"
                  >
                    <Film className="w-4 h-4 text-pink-200" />
                    <span>Veo Animator</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePhotoForEdit(null);
                      setIsImageStudioOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
                    title="Generate or edit images with Gemini"
                  >
                    <Wand2 className="w-4 h-4 text-pink-200" />
                    <span>AI Image Studio</span>
                  </button>
                  <button
                    onClick={() => setIsChatbotOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
                    title="Reflect and brainstorm with Gemini Story Companion"
                  >
                    <Bot className="w-4 h-4 text-pink-200" />
                    <span>Story Companion</span>
                  </button>
                  <button
                    onClick={() => setIsModerationOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 font-medium text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-pink-200" />
                    <span>Community Safety</span>
                  </button>
                </div>
              </div>

              {/* Decorative prism aura spheres */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-10 bottom-0 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/90 dark:bg-[#1E0F23]/90 p-4 rounded-2xl border border-pink-200/80 dark:border-pink-900/40 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search spoken stories, queer memoirs, voices, reflections..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-pink-50/60 dark:bg-[#28132D] text-[#2E152F] dark:text-[#FDF2F7] text-xs sm:text-sm outline-none border border-pink-100 dark:border-pink-900/50 focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedTag === tag
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                        : 'bg-pink-100/70 dark:bg-pink-950/40 text-pink-900 dark:text-pink-300 hover:bg-pink-200/80 dark:hover:bg-pink-900/50'
                    }`}
                  >
                    {tag === 'All' ? '🌈 All Voices' : tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Stories Feed Stream */}
            <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
              {filteredStories.length === 0 ? (
                <div className="text-center py-16 bg-white/95 dark:bg-[#1E0F23]/95 rounded-3xl border border-pink-200/80 dark:border-pink-900/50 p-8 shadow-pink-glow">
                  <div className="text-3xl mb-2">🏳️‍🌈</div>
                  <h3 className="font-serif-display font-bold text-pink-950 dark:text-pink-100 text-base">
                    No memoirs found matching this theme
                  </h3>
                  <p className="text-pink-800/70 dark:text-pink-300/70 text-xs mt-1">
                    Try another search term or tag filter, or be the first to share an authentic voice reflection! 💖
                  </p>
                </div>
              ) : (
                filteredStories.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    currentUser={activeUser}
                    onToggleLike={storyId => toggleStoryLike(storyId, activeUser.id)}
                    onAddComment={addStoryComment}
                    onAnimatePhoto={(imgUrl) => {
                      setActivePhotoForVeo(imgUrl);
                      setIsVeoModalOpen(true);
                    }}
                    onEditPhoto={(imgUrl) => {
                      setActivePhotoForEdit(imgUrl);
                      setIsImageStudioOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT MESSAGES (E2EE FRIENDS ONLY) */}
        {activeTab === 'messages' && (
          <DirectMessaging
            currentUser={activeUser}
            allUsers={allUsers}
            messages={messages}
            selectedPeerId={selectedDirectPeerId}
            onSelectPeer={peerId => setSelectedDirectPeerId(peerId)}
            onOpenFriendsTab={() => setActiveTab('friends')}
          />
        )}

        {/* TAB 3: FRIENDS & CONNECTION REQUESTS */}
        {activeTab === 'friends' && (
          <FriendsView
            currentUser={activeUser}
            allUsers={allUsers}
            friendRequests={friendRequests}
            onOpenChatWith={userId => {
              setSelectedDirectPeerId(userId);
              setActiveTab('messages');
            }}
          />
        )}

        {/* TAB 4: PROFILE & ENCRYPTED VAULT */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={activeUser}
            allUsers={allUsers}
            onSwitchUser={handleSwitchUser}
            onSignOut={handleSignOut}
            onToggleLike={storyId => toggleStoryLike(storyId, activeUser.id)}
            onAddComment={addStoryComment}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile only) */}
      {activeTab === 'stories' && (
        <button
          onClick={() => setIsCreateStoryOpen(true)}
          className="md:hidden fixed right-5 bottom-20 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-pink-300/40"
          title="Share new story"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'messages') setSelectedDirectPeerId(undefined);
        }}
        notifications={notifications}
      />

      {/* Create Story Modal */}
      {isCreateStoryOpen && (
        <CreateStoryModal
          currentUser={activeUser}
          onClose={() => setIsCreateStoryOpen(false)}
          onSubmit={story => {
            addStory(story);
            setIsCreateStoryOpen(false);
            showToast('Story published successfully! 💖');
          }}
        />
      )}

      {/* Real-Time Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onClearAll={clearAllNotifications}
        onNavigateToTab={(tab, linkId) => {
          setActiveTab(tab);
          if (tab === 'messages' && linkId) {
            setSelectedDirectPeerId(linkId);
          }
        }}
      />

      {/* Content Moderation Inspector Modal */}
      <ModerationInspectorModal
        isOpen={isModerationOpen}
        onClose={() => setIsModerationOpen(false)}
      />

      {/* Google Maps Grounding Explorer Modal */}
      <MapsGroundingModal
        isOpen={isMapsModalOpen}
        onClose={() => setIsMapsModalOpen(false)}
      />

      {/* Veo Video Generator Modal */}
      <VeoVideoModal
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
        initialImage={activePhotoForVeo || undefined}
        onAttachVideoToStory={() => {
          setIsVeoModalOpen(false);
          showToast('Veo video clip synthesized successfully!');
        }}
      />

      {/* AI Image Studio Modal */}
      <AiImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        initialImage={activePhotoForEdit || undefined}
        onSendToVideo={(imgUrl) => {
          setIsImageStudioOpen(false);
          setActivePhotoForVeo(imgUrl);
          setIsVeoModalOpen(true);
        }}
      />

      {/* Gemini Chatbot Story Companion Modal */}
      <GeminiChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onInsertIntoStory={() => {
          setIsChatbotOpen(false);
          setIsCreateStoryOpen(true);
        }}
      />

      {/* Floating Story Companion Trigger Button (Desktop & Mobile) */}
      <button
        type="button"
        onClick={() => setIsChatbotOpen(true)}
        className="fixed left-5 bottom-20 md:bottom-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-pink-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-pink-300/40 text-xs font-semibold backdrop-blur-md"
        title="Open Haven Queer Story Companion (Powered by Gemini)"
      >
        <Sparkles className="w-4 h-4 text-pink-200" />
        <span className="hidden sm:inline">Story Companion 💖</span>
      </button>
    </div>
  );
}
