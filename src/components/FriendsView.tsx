import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { User, FriendRequest } from '../types';
import {
  sendFriendRequest,
  respondToFriendRequest
} from '../services/storage';

interface FriendsViewProps {
  currentUser: User;
  allUsers: User[];
  friendRequests: FriendRequest[];
  onOpenChatWith: (userId: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  allUsers,
  friendRequests,
  onOpenChatWith
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. My accepted friends
  const myFriends = allUsers.filter(u => currentUser.friends.includes(u.id));

  // 2. Incoming and outgoing requests
  const incomingRequests = friendRequests.filter(
    r => r.toUserId === currentUser.id && r.status === 'pending'
  );
  const outgoingRequests = friendRequests.filter(
    r => r.fromUserId === currentUser.id && r.status === 'pending'
  );

  // 3. Discover candidates (other users not yet friends)
  const discoverCandidates = allUsers.filter(
    u => u.id !== currentUser.id && !currentUser.friends.includes(u.id)
  );

  const handleSendRequest = (targetUserId: string) => {
    sendFriendRequest(currentUser.id, targetUserId);
  };

  const handleAccept = (reqId: string) => {
    respondToFriendRequest(reqId, 'accept');
  };

  const handleDecline = (reqId: string) => {
    respondToFriendRequest(reqId, 'decline');
  };

  const filteredFriends = myFriends.filter(
    f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Privacy Model Rationale */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 shadow-pink-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="pride rainbow">🌈</span>
            <h2 className="text-base sm:text-lg font-serif-display font-bold text-pink-950 dark:text-pink-100">
              Chosen Family & Queer Kinship
            </h2>
          </div>
          <p className="text-xs text-pink-800/70 dark:text-pink-300/70 mt-1 max-w-2xl leading-relaxed">
            Direct messaging is exclusively reserved for mutual chosen family. Connect with members across our LGBTQIA+ community by sending a request. Once accepted, end-to-end encrypted messaging is unlocked.
          </p>
        </div>

        {/* Tab Switcher - Interactive segmented control */}
        <div className="flex items-center gap-1 p-1 bg-pink-100/70 dark:bg-[#2D1333] border border-pink-200/70 dark:border-pink-900/60 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('friends')}
            className={`min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'friends'
                ? 'bg-white dark:bg-[#1C0A20] text-pink-600 dark:text-pink-300 shadow-xs font-bold'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>💖 Friends ({myFriends.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1.5 relative ${
              activeSubTab === 'requests'
                ? 'bg-white dark:bg-[#1C0A20] text-pink-600 dark:text-pink-300 shadow-xs font-bold'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>💌 Requests</span>
            {incomingRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('discover')}
            className={`min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'discover'
                ? 'bg-white dark:bg-[#1C0A20] text-pink-600 dark:text-pink-300 shadow-xs font-bold'
                : 'text-pink-800/70 dark:text-pink-300/70 hover:text-pink-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>✨ Discover</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Accepted Friends */}
      {activeSubTab === 'friends' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chosen family by name, handle, or passions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1E0B24] border border-pink-200 dark:border-pink-900/60 text-xs text-pink-950 dark:text-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-xs"
            />
          </div>

          {filteredFriends.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 shadow-pink-glow">
              <Users className="w-10 h-10 text-pink-300 dark:text-pink-700 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-pink-950 dark:text-pink-100">
                No chosen family found
              </h3>
              <p className="text-xs text-pink-800/70 dark:text-pink-300/70 mt-1 max-w-sm mx-auto">
                Explore queer community members in the Discover tab and send friend requests to build your trusted kinship circle.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('discover')}
                className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium inline-flex items-center gap-2 shadow-xs shadow-pink-500/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Discover Queer Community</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-5 rounded-3xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 shadow-pink-glow flex flex-col justify-between hover:border-pink-300 dark:hover:border-pink-700 transition-all"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-pink-950 dark:text-pink-100 truncate">
                          {friend.name}
                        </h4>
                        <span className="text-[10px] font-mono text-pink-600 dark:text-pink-400 font-semibold px-2 py-0.5 rounded-full bg-pink-100/80 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800">
                          🔒 Encrypted
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-pink-700/70 dark:text-pink-300/70 mb-1.5">
                        <span className="font-mono text-[11px]">{friend.handle}</span>
                        {(friend.pronouns || friend.aboutMyself?.pronouns) && (
                          <span className="text-[11px] font-medium text-pink-600 dark:text-pink-300">
                            • ({friend.pronouns || friend.aboutMyself?.pronouns})
                          </span>
                        )}
                        {(friend.gender || friend.aboutMyself?.gender) && friend.genderVisibility !== 'private' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                            🏳️‍🌈 {friend.gender || friend.aboutMyself?.gender}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-pink-900/80 dark:text-pink-200/80 line-clamp-2 leading-relaxed">
                        {friend.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-pink-900/50 text-xs text-pink-700/70 dark:text-pink-300/70">
                    <span>{friend.aboutMyself.location || 'Global Citizen'}</span>
                    <button
                      type="button"
                      onClick={() => onOpenChatWith(friend.id)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-pink-500/20 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Direct Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Requests (Incoming & Outgoing) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming */}
          <div>
            <h3 className="text-sm font-semibold text-pink-950 dark:text-pink-100 mb-3 flex items-center gap-2">
              <span>Incoming Friend Requests</span>
              <span className="text-xs text-pink-600 dark:text-pink-400 font-mono">({incomingRequests.length})</span>
            </h3>

            {incomingRequests.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 text-xs text-pink-700/70 dark:text-pink-300/70">
                No pending incoming requests.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200 dark:border-pink-900/60 shadow-pink-glow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.fromUserAvatar}
                        alt={req.fromUserName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-pink-300 dark:border-pink-700"
                      />
                      <div>
                        <div className="text-sm font-semibold text-pink-950 dark:text-pink-100">
                          {req.fromUserName}
                        </div>
                        <div className="text-xs text-pink-700/70 dark:text-pink-300/70 font-mono">
                          {req.fromUserHandle} · {req.timestamp}
                        </div>
                        <p className="text-xs text-pink-900/80 dark:text-pink-200/80 mt-0.5">
                          Requests to join your chosen family circle for private end-to-end encrypted messaging.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.id)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-pink-500/20 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Family</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(req.id)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/50 text-xs font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div>
            <h3 className="text-sm font-semibold text-pink-950 dark:text-pink-100 mb-3 flex items-center gap-2">
              <span>Outgoing Requests (Awaiting Confirmation)</span>
              <span className="text-xs text-pink-600 dark:text-pink-400 font-mono">({outgoingRequests.length})</span>
            </h3>

            {outgoingRequests.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 text-xs text-pink-700/70 dark:text-pink-300/70">
                No outgoing requests pending.
              </div>
            ) : (
              <div className="space-y-2">
                {outgoingRequests.map((req) => {
                  const targetUser = allUsers.find(u => u.id === req.toUserId);
                  return (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span>
                          Pending kinship request to{' '}
                          <span className="font-semibold text-pink-950 dark:text-pink-100">
                            {targetUser?.name || 'Community Member'}
                          </span>
                        </span>
                      </div>
                      <span className="text-pink-600/70 dark:text-pink-400/70">{req.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: Discover Members */}
      {activeSubTab === 'discover' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoverCandidates.map((member) => {
              const hasSentPending = friendRequests.some(
                r => r.fromUserId === currentUser.id && r.toUserId === member.id && r.status === 'pending'
              );

              return (
                <div
                  key={member.id}
                  className="p-5 rounded-3xl bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 shadow-pink-glow flex flex-col justify-between hover:border-pink-300 dark:hover:border-pink-700 transition-all"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-pink-950 dark:text-pink-100 truncate">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-pink-700/70 dark:text-pink-300/70 mb-1.5">
                        <span className="font-mono text-[11px]">{member.handle}</span>
                        {(member.pronouns || member.aboutMyself?.pronouns) && (
                          <span className="text-[11px] font-medium text-pink-600 dark:text-pink-300">
                            • ({member.pronouns || member.aboutMyself?.pronouns})
                          </span>
                        )}
                        {(member.gender || member.aboutMyself?.gender) && member.genderVisibility === 'public' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                            🏳️‍🌈 {member.gender || member.aboutMyself?.gender}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-pink-900/80 dark:text-pink-200/80 line-clamp-2 leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.aboutMyself.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                        className="text-[10px] text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 border border-pink-200/60 dark:border-pink-800/60 px-2.5 py-0.5 rounded-full"
                      >
                        ✨ {interest}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-pink-900/50">
                    <span className="text-xs text-pink-700/70 dark:text-pink-300/70">
                      {member.aboutMyself.location || 'Global'}
                    </span>

                    {hasSentPending ? (
                      <span className="text-xs text-pink-600 dark:text-pink-400 flex items-center gap-1 font-medium bg-pink-50 dark:bg-pink-950/60 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Request Sent</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendRequest(member.id)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-pink-500/20 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add to Family</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
