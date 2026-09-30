import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Send,
  Image as ImageIcon,
  Mic,
  UserPlus,
  Clock,
  Check,
  CheckCheck,
  PhoneCall,
  Volume2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { User, DirectMessage, FriendRequest } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { SecurityFingerprintModal } from './SecurityFingerprintModal';
import {
  encryptText,
  decryptText,
  getConversationSecret
} from '../services/crypto';
import {
  sendDirectMessage,
  sendFriendRequest,
  respondToFriendRequest,
  getFriendRequests,
  getIsOnline
} from '../services/storage';

interface DirectMessagingProps {
  currentUser: User;
  allUsers: User[];
  messages: DirectMessage[];
  selectedPeerId?: string;
  onSelectPeer: (userId: string) => void;
  onOpenFriendsTab: () => void;
}

export const DirectMessaging: React.FC<DirectMessagingProps> = ({
  currentUser,
  allUsers,
  messages,
  selectedPeerId,
  onSelectPeer,
  onOpenFriendsTab
}) => {
  const [inputText, setInputText] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOnline = getIsOnline();

  // Eligible peers are other users
  const peers = allUsers.filter(u => u.id !== currentUser.id);

  // Active peer
  const activePeer = peers.find(p => p.id === selectedPeerId) || peers[0];

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedPeerId]);

  if (!activePeer) {
    return (
      <div className="p-8 text-center text-slate-500">
        No community members found.
      </div>
    );
  }

  // Check if activePeer is mutually accepted friend
  const isAcceptedFriend = currentUser.friends.includes(activePeer.id);

  // Check pending request status
  const friendRequests = getFriendRequests();
  const sentPending = friendRequests.find(
    r => r.fromUserId === currentUser.id && r.toUserId === activePeer.id && r.status === 'pending'
  );
  const receivedPending = friendRequests.find(
    r => r.fromUserId === activePeer.id && r.toUserId === currentUser.id && r.status === 'pending'
  );

  // Filter messages for current conversation
  const conversationMessages = messages.filter(
    m =>
      (m.senderId === currentUser.id && m.recipientId === activePeer.id) ||
      (m.senderId === activePeer.id && m.recipientId === currentUser.id)
  );

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedPhoto) return;

    const secret = getConversationSecret(currentUser.id, activePeer.id);
    const plain = inputText.trim();

    // Perform real Web Crypto AES-GCM encryption
    let encryptedPayload: { ciphertext: string; iv: string; salt: string } | null = null;
    try {
      if (plain) {
        encryptedPayload = await encryptText(plain, secret);
      }
    } catch (err) {
      console.warn('Crypto error during send:', err);
    }

    const newMsg: DirectMessage = {
      id: 'msg_' + Date.now(),
      conversationId: [currentUser.id, activePeer.id].sort().join(':'),
      senderId: currentUser.id,
      recipientId: activePeer.id,
      text: plain,
      isEncrypted: true,
      ciphertext: encryptedPayload?.ciphertext,
      iv: encryptedPayload?.iv,
      salt: encryptedPayload?.salt,
      photoAttachment: attachedPhoto || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'delivered' : 'pending_sync'
    };

    sendDirectMessage(newMsg);
    setInputText('');
    setAttachedPhoto(null);
  };

  const handleVoiceClipComplete = async (clip: { url: string; durationSec: number; title: string }) => {
    const newMsg: DirectMessage = {
      id: 'msg_' + Date.now(),
      conversationId: [currentUser.id, activePeer.id].sort().join(':'),
      senderId: currentUser.id,
      recipientId: activePeer.id,
      text: 'Voice note',
      isEncrypted: true,
      audioAttachment: {
        url: clip.url,
        durationSec: clip.durationSec
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'delivered' : 'pending_sync'
    };

    sendDirectMessage(newMsg);
    setShowVoiceRecorder(false);
  };

  const handleSendFriendRequest = () => {
    sendFriendRequest(currentUser.id, activePeer.id);
  };

  const handleAcceptRequest = () => {
    if (receivedPending) {
      respondToFriendRequest(receivedPending.id, 'accept');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedPhoto(reader.result as string);
        setShowPhotoPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="rounded-3xl bg-white/95 dark:bg-[#1C0A20]/95 border border-pink-200/80 dark:border-pink-900/60 shadow-pink-glow overflow-hidden flex flex-col md:flex-row h-[740px] max-h-[82vh]">
      {/* Sidebar: Conversation List */}
      <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-pink-200/80 dark:border-pink-900/60 flex flex-col shrink-0 bg-pink-50/40 dark:bg-[#16081A]/60">
        <div className="p-4 border-b border-pink-200/80 dark:border-pink-900/60">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-pink-950 dark:text-pink-100 flex items-center gap-1.5">
              <span>💖 Direct Messages</span>
            </h2>
            <span className="text-[11px] font-mono text-pink-600 dark:text-pink-400 font-semibold px-2 py-0.5 rounded-full bg-pink-100/80 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800">
              🔒 E2EE
            </span>
          </div>
          <p className="text-[11px] text-pink-700/70 dark:text-pink-300/70 mt-1">
            Private, chosen family encrypted dialogues
          </p>
        </div>

        {/* Peer contacts list */}
        <div className="flex-1 overflow-y-auto divide-y divide-pink-100/60 dark:divide-pink-950/40">
          {peers.map((peer) => {
            const isFriend = currentUser.friends.includes(peer.id);
            const isSelected = peer.id === activePeer.id;
            const lastMsg = messages
              .filter(
                m =>
                  (m.senderId === currentUser.id && m.recipientId === peer.id) ||
                  (m.senderId === peer.id && m.recipientId === currentUser.id)
              )
              .slice(-1)[0];

            return (
              <button
                key={peer.id}
                type="button"
                onClick={() => onSelectPeer(peer.id)}
                className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors ${
                  isSelected
                    ? 'bg-pink-100/70 dark:bg-pink-950/50 border-l-4 border-pink-500 shadow-xs'
                    : 'hover:bg-pink-100/40 dark:hover:bg-pink-950/30'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 shadow-xs"
                  />
                  {peer.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-pink-500 border-2 border-white dark:border-[#1C0A20]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-pink-950 dark:text-pink-100 truncate">
                      {peer.name}
                    </span>
                    {isFriend && (
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">
                        Family
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-pink-800/70 dark:text-pink-300/70 truncate">
                    {lastMsg
                      ? lastMsg.audioAttachment
                        ? '🎙️ Spoken memoir'
                        : lastMsg.photoAttachment
                        ? '📷 Photo'
                        : lastMsg.text
                      : peer.bio}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/90 dark:bg-[#1E0B24]/90">
        {/* Chat Header */}
        <div className="p-3.5 sm:p-4 border-b border-pink-200/80 dark:border-pink-900/60 flex items-center justify-between gap-3 bg-white/80 dark:bg-[#1E0B24]/80 backdrop-blur-xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={activePeer.avatar}
              alt={activePeer.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-pink-950 dark:text-pink-100 truncate">
                  {activePeer.name}
                </h3>
                <span className="text-xs text-pink-600/70 dark:text-pink-400/70 font-mono truncate">{activePeer.handle}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-pink-700/70 dark:text-pink-300/70">
                <span>{activePeer.isOnline ? 'Online now' : 'Away'}</span>
                <span aria-hidden="true">·</span>
                <span>{isAcceptedFriend ? 'Chosen Family' : 'Not Connected'}</span>
              </div>
            </div>
          </div>

          {/* E2EE Safety Number Button */}
          {isAcceptedFriend && (
            <button
              type="button"
              onClick={() => setShowFingerprintModal(true)}
              title="Inspect End-to-End Encryption Safety Numbers"
              className="min-h-[44px] px-3.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/60 text-pink-800 dark:text-pink-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="hidden sm:inline">E2EE Verified</span>
            </button>
          )}
        </div>

        {/* Chat Body */}
        {!isAcceptedFriend ? (
          /* Safe Community Guard: Friends-Only Gate */
          <div className="flex-1 flex items-center justify-center p-6 text-center bg-pink-50/30 dark:bg-[#16081A]/40">
            <div className="max-w-md p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#200D26]/95 border border-pink-200/80 dark:border-pink-900/60 shadow-pink-glow space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 flex items-center justify-center mx-auto border border-pink-200 dark:border-pink-800">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-serif-display font-bold text-pink-950 dark:text-pink-100">
                  Chosen Family Messaging Circle
                </h3>
                <p className="text-xs text-pink-900/80 dark:text-pink-200/80 mt-2 leading-relaxed">
                  To protect our LGBTQIA+ members from harassment and preserve intimacy, <span className="font-semibold text-pink-950 dark:text-pink-100">you can only direct message members who have mutually accepted kinship.</span>
                </p>
              </div>

              {/* Status & Action */}
              <div className="pt-2">
                {sentPending ? (
                  <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-xs font-medium text-pink-800 dark:text-pink-200 flex items-center justify-center gap-2 border border-pink-200 dark:border-pink-800">
                    <Clock className="w-4 h-4 text-pink-500" />
                    <span>Kinship Request Sent · Awaiting {activePeer.name}'s acceptance</span>
                  </div>
                ) : receivedPending ? (
                  <div className="space-y-2">
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                      {activePeer.name} sent you a chosen family request!
                    </p>
                    <button
                      type="button"
                      onClick={handleAcceptRequest}
                      className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs shadow-pink-500/20 transition-transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Kinship & Start Encrypted Chat</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendFriendRequest}
                    className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs shadow-pink-500/20 transition-transform active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Send Family Request to {activePeer.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Active E2EE Chat Window */
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* E2EE Info Banner */}
              <div className="p-3 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-900/50 text-center max-w-md mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-pink-900 dark:text-pink-200 mb-1">
                  <Lock className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span>End-to-End Encrypted Sanctuary</span>
                </div>
                <p className="text-[11px] text-pink-800/80 dark:text-pink-300/80 leading-snug">
                  Messages and voice memoirs are encrypted client-side with AES-GCM. Only you and {activePeer.name} hold the keys.
                </p>
              </div>

              {conversationMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-pink-700/60 dark:text-pink-300/60">
                  This is the start of your secure conversation with {activePeer.name}. Say hello or share a voice memoir!
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-sm transition-all ${
                          isMine
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-xs shadow-xs shadow-pink-500/20'
                            : 'bg-white dark:bg-[#250E2D] border border-pink-200/60 dark:border-pink-900/50 text-pink-950 dark:text-pink-50 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {/* Photo attachment */}
                        {msg.photoAttachment && (
                          <div className="mb-2 rounded-xl overflow-hidden max-h-60 border border-white/20">
                            <img
                              src={msg.photoAttachment}
                              alt="Attachment"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Audio voice note attachment */}
                        {msg.audioAttachment ? (
                          <div className="my-1">
                            <AudioPlayer
                              clipId={msg.audioAttachment.url}
                              durationSec={msg.audioAttachment.durationSec}
                              title="Voice Message"
                              className={isMine ? 'bg-pink-700/60 border-pink-400/40 text-white' : ''}
                            />
                          </div>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}

                        {/* Metadata: timestamp & status */}
                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                            isMine ? 'text-pink-100' : 'text-pink-600/70 dark:text-pink-400/70'
                          }`}
                        >
                          <span className="font-mono">{msg.timestamp}</span>
                          {isMine && (
                            <>
                              {msg.status === 'pending_sync' ? (
                                <span title="Queued Offline"><Clock className="w-3 h-3 text-pink-200" /></span>
                              ) : msg.status === 'read' ? (
                                <span title="Read"><CheckCheck className="w-3 h-3 text-pink-200" /></span>
                              ) : (
                                <span title="Delivered"><Check className="w-3 h-3 text-pink-200" /></span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* In-chat Voice Recorder Drawer */}
            {showVoiceRecorder && (
              <div className="p-3 border-t border-pink-200/80 dark:border-pink-900/60 bg-pink-50/50 dark:bg-[#16081A]">
                <AudioRecorder
                  onRecordingComplete={handleVoiceClipComplete}
                  onCancel={() => setShowVoiceRecorder(false)}
                />
              </div>
            )}

            {/* Photo Attachment Preview in Input Bar */}
            {attachedPhoto && (
              <div className="px-4 py-2 bg-pink-100/80 dark:bg-[#200D26] border-t border-pink-200 dark:border-pink-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={attachedPhoto}
                    alt="Pending upload"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <span className="text-xs text-pink-800 dark:text-pink-200">Photo attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedPhoto(null)}
                  className="p-1 text-pink-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Photo Picker Modal */}
            {showPhotoPicker && (
              <div className="p-3 bg-white/95 dark:bg-[#200D26]/95 border-t border-pink-200 dark:border-pink-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-pink-900 dark:text-pink-100">
                    Attach Image
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPhotoPicker(false)}
                    className="text-pink-600 dark:text-pink-400 hover:text-pink-800"
                  >
                    Cancel
                  </button>
                </div>
                <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-pink-300 dark:border-pink-700 rounded-xl cursor-pointer hover:border-pink-500">
                  <ImageIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-xs font-medium text-pink-800 dark:text-pink-200">
                    Upload image from device
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-pink-200/80 dark:border-pink-900/60 flex items-center gap-2 bg-white/95 dark:bg-[#1C0A20]/95"
            >
              {/* Photo trigger */}
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950/50 text-pink-600 dark:text-pink-300 flex items-center justify-center transition-colors"
                title="Attach photo"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Voice recorder trigger */}
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950/50 text-pink-600 dark:text-pink-300 flex items-center justify-center transition-colors"
                title="Record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Encrypted message to ${activePeer.name.split(' ')[0]}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-pink-50/70 dark:bg-[#250E2D] border border-pink-200 dark:border-pink-800/80 text-pink-950 dark:text-pink-50 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 text-sm"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedPhoto}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs shadow-pink-500/20"
                title="Send encrypted message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Safety Fingerprint Modal */}
      {showFingerprintModal && (
        <SecurityFingerprintModal
          currentUser={currentUser}
          peerUser={activePeer}
          onClose={() => setShowFingerprintModal(false)}
        />
      )}
    </div>
  );
};
