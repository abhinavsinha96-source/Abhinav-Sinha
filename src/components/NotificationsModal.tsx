import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Users,
  Heart,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateToTab: (tab: 'stories' | 'messages' | 'friends' | 'profile', linkId?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'direct_message':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'friend_request':
      case 'friend_accepted':
        return <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'story_like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'story_comment':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'moderation_flag':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleItemClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    if (notif.linkTab) {
      onNavigateToTab(notif.linkTab, notif.linkId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Real-Time Notifications
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700 text-white font-mono">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Encrypted messages, friend requests & story reactions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between py-2.5 px-1 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:no-underline font-medium"
          >
            Mark all read
          </button>
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="text-slate-400 hover:text-rose-600 disabled:opacity-40 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear notifications
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-500">
                You're all caught up with community updates.
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.isRead
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-xs border border-slate-200 dark:border-slate-700">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 self-center" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsModal;
