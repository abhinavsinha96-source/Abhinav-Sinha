import React from 'react';
import { BookOpen, MessageSquare, Users, ShieldAlert, User as UserIcon } from 'lucide-react';
import { AppNotification } from '../types';

interface BottomNavProps {
  activeTab: 'stories' | 'messages' | 'friends' | 'profile';
  setActiveTab: (tab: 'stories' | 'messages' | 'friends' | 'profile') => void;
  notifications: AppNotification[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  notifications
}) => {
  const unreadMessagesCount = notifications.filter(
    n => !n.isRead && n.type === 'direct_message'
  ).length;

  const unreadFriendsCount = notifications.filter(
    n => !n.isRead && (n.type === 'friend_request' || n.type === 'friend_accepted')
  ).length;

  return (
    <nav
      aria-label="Mobile thumb navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1C0A20]/95 backdrop-blur-md border-t border-pink-200/80 dark:border-pink-900/60 pb-safe shadow-lg shadow-pink-500/10"
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-pink-500 via-rose-400 via-amber-300 via-emerald-400 via-sky-400 to-purple-500" />
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {/* Stories Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'stories'
              ? 'text-pink-600 dark:text-pink-400 font-bold scale-105'
              : 'text-[#734A77] dark:text-pink-200/60 hover:text-pink-600 dark:hover:text-pink-300'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">💖 Stories</span>
        </button>

        {/* Direct Messages Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-all ${
            activeTab === 'messages'
              ? 'text-pink-600 dark:text-pink-400 font-bold scale-105'
              : 'text-[#734A77] dark:text-pink-200/60 hover:text-pink-600 dark:hover:text-pink-300'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-pink-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center font-mono shadow-xs">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">💌 Messages</span>
        </button>

        {/* Friends Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-all ${
            activeTab === 'friends'
              ? 'text-pink-600 dark:text-pink-400 font-bold scale-105'
              : 'text-[#734A77] dark:text-pink-200/60 hover:text-pink-600 dark:hover:text-pink-300'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-0.5" />
            {unreadFriendsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-pink-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center font-mono shadow-xs">
                {unreadFriendsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">🌈 Family</span>
        </button>

        {/* Profile Vault Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'profile'
              ? 'text-pink-600 dark:text-pink-400 font-bold scale-105'
              : 'text-[#734A77] dark:text-pink-200/60 hover:text-pink-600 dark:hover:text-pink-300'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">✨ Vault</span>
        </button>
      </div>
    </nav>
  );
};
