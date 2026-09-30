export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  email?: string;
  gender?: string; // Worldwide gender identity
  pronouns?: string; // e.g. they/them, she/her, he/him, etc.
  genderVisibility?: 'public' | 'friends_only' | 'private';
  isProfileComplete?: boolean;
  aboutMyself: {
    location?: string;
    occupation?: string;
    gender?: string;
    pronouns?: string;
    interests: string[];
    lifePhilosophy?: string;
    languages?: string[];
  };
  audioIntro?: {
    url: string;
    durationSec: number;
    title: string;
  };
  photos: string[];
  publicKeyFingerprint: string;
  joinedDate: string;
  isOnline: boolean;
  friends: string[]; // User IDs of mutually accepted friends
}

export interface EncryptedVaultData {
  privateJournal: string;
  confidentialContact: string;
  personalNotes: string;
  encryptionKeyHint: string;
  updatedAt: string;
}

export interface GroundedPlace {
  title: string;
  uri: string;
  snippet?: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  photoUrl?: string;
  videoClipUrl?: string; // Veo generated or user video
  audioClip?: {
    url: string;
    durationSec: number;
    title: string;
  };
  location?: string;
  groundedPlaces?: GroundedPlace[]; // Google Maps grounded location references
  privacy: 'public' | 'friends_only';
  likesCount: number;
  isLiked?: boolean;
  comments: Comment[];
  moderationStatus: 'approved' | 'flagged' | 'under_review';
  moderationReason?: string;
  isSensitive?: boolean;
  isOfflineDraft?: boolean;
  syncStatus: 'synced' | 'pending_sync';
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserHandle: string;
  fromUserAvatar: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface DirectMessage {
  id: string;
  conversationId: string; // sorted composite of userA:userB
  senderId: string;
  recipientId: string;
  text: string; // Plaintext when decrypted
  isEncrypted: boolean;
  ciphertext?: string; // Base64 encrypted payload
  iv?: string; // Initialization vector for AES-GCM
  salt?: string;
  audioAttachment?: {
    url: string;
    durationSec: number;
  };
  photoAttachment?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'pending_sync';
}

export interface AppNotification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'direct_message' | 'story_like' | 'story_comment' | 'moderation_flag' | 'sync_complete';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkTab?: 'stories' | 'messages' | 'friends' | 'profile';
  linkId?: string;
  actorId?: string;
}

export interface ModerationResult {
  isFlagged: boolean;
  score: number; // 0 to 1
  category?: 'harassment' | 'hate_speech' | 'profanity' | 'pii_leak' | 'spam';
  reason?: string;
  highlightedTerms?: string[];
  suggestedAction?: 'blur' | 'warn' | 'block';
}

export interface OfflineSyncQueueItem {
  id: string;
  type: 'create_story' | 'send_message' | 'send_friend_request' | 'accept_friend_request';
  payload: any;
  createdAt: string;
  retryCount: number;
}

// Gemini Chatbot Types
export type GeminiModelId = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundedPlaces?: GroundedPlace[];
  modelUsed?: GeminiModelId;
}

export interface ChatRolePreset {
  id: string;
  name: string;
  description: string;
  model: GeminiModelId;
  systemInstruction: string;
  avatarIcon: string;
  badge: string;
}
