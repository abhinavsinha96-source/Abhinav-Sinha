import {
  User,
  Story,
  DirectMessage,
  FriendRequest,
  AppNotification,
  OfflineSyncQueueItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STORIES,
  INITIAL_MESSAGES,
  INITIAL_FRIEND_REQUESTS,
  INITIAL_NOTIFICATIONS
} from './mockData';
import { db, auth, handleFirestoreError, OperationType, FirebaseUser, logoutUser } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, getDocs } from 'firebase/firestore';

const KEYS = {
  USERS: 'haven_users_queer_v3',
  CURRENT_USER_ID: 'haven_active_user_queer_v3',
  STORIES: 'haven_stories_queer_v3',
  MESSAGES: 'haven_messages_queer_v3',
  FRIEND_REQUESTS: 'haven_friend_requests_queer_v3',
  NOTIFICATIONS: 'haven_notifications_queer_v3',
  SYNC_QUEUE: 'haven_sync_queue_queer_v3',
  DARK_MODE: 'haven_dark_mode_queer_v3',
  SIMULATED_OFFLINE: 'haven_sim_offline_queer_v3',
  FIREBASE_USER_PROFILE: 'haven_fb_profile_queer_v3'
};

// Automatic cleanup of legacy v2 storage keys to ensure fresh queer UI applies immediately
try {
  if (typeof localStorage !== 'undefined') {
    if (!localStorage.getItem(KEYS.USERS)) {
      // Clear old cached mock users and stories from prior version
      localStorage.removeItem('haven_users_v2');
      localStorage.removeItem('haven_stories_v2');
      localStorage.removeItem('haven_messages_v2');
      localStorage.removeItem('haven_friend_requests_v2');
      localStorage.removeItem('haven_active_user_v2');
      localStorage.removeItem('haven_dark_mode_v2');
    }
  }
} catch {
  // Ignore storage exceptions
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach(l => l());
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ----------------- Network & Offline State -----------------
let isSimulatedOffline = localStorage.getItem(KEYS.SIMULATED_OFFLINE) === 'true';

export function getIsOnline(): boolean {
  if (isSimulatedOffline) return false;
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function setSimulatedOffline(offline: boolean) {
  isSimulatedOffline = offline;
  localStorage.setItem(KEYS.SIMULATED_OFFLINE, String(offline));
  emitChange();
  if (!offline) {
    processOfflineSyncQueue();
  }
}

export function getIsSimulatedOffline(): boolean {
  return isSimulatedOffline;
}

// ----------------- Users -----------------
export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(raw);
    let modified = false;
    const merged = parsed.map(u => {
      const init = INITIAL_USERS.find(iu => iu.id === u.id);
      if (init && (!u.gender || !u.aboutMyself?.gender) && init.gender) {
        modified = true;
        return {
          ...u,
          gender: u.gender || init.gender,
          pronouns: u.pronouns || init.pronouns,
          genderVisibility: u.genderVisibility || init.genderVisibility || 'public',
          aboutMyself: {
            ...u.aboutMyself,
            gender: u.aboutMyself?.gender || u.gender || init.gender,
            pronouns: u.aboutMyself?.pronouns || u.pronouns || init.pronouns
          }
        };
      }
      return u;
    });
    if (modified) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  emitChange();
}

export function getActiveUserId(): string | null {
  const id = localStorage.getItem(KEYS.CURRENT_USER_ID);
  // Ensure test users are never exposed or default-logged in for the public
  if (!id || id === 'user_alex' || id === 'user_elena' || id === 'user_marcus' || id === 'user_maya') {
    return null;
  }
  return id;
}

export function setActiveUserId(userId: string | null) {
  if (!userId || userId === 'user_alex' || userId === 'user_elena' || userId === 'user_marcus' || userId === 'user_maya') {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  } else {
    localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  }
  emitChange();
}

export function clearActiveSession() {
  localStorage.removeItem(KEYS.CURRENT_USER_ID);
  emitChange();
}

export function getActiveUser(): User | null {
  const users = getUsers();
  const id = getActiveUserId();
  if (!id) return null;
  const found = users.find(u => u.id === id);
  return found || null;
}

export async function syncUserToFirestore(user: User) {
  if (!getIsOnline() || !auth.currentUser) return;
  // If the user's id is not the auth.currentUser.uid, do not attempt to write to users/user.id
  // because firestore.rules requires request.auth.uid == userId
  if (user.id !== auth.currentUser.uid) {
    return;
  }
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      userId: user.id,
      displayName: user.name,
      handle: user.handle,
      email: user.email || auth.currentUser.email || '',
      bio: user.bio,
      avatarUrl: user.avatar,
      location: user.aboutMyself?.location || '',
      occupation: user.aboutMyself?.occupation || '',
      philosophy: user.aboutMyself?.lifePhilosophy || '',
      interests: (user.aboutMyself?.interests || []).join(', '),
      gender: user.gender || user.aboutMyself?.gender || '',
      pronouns: user.pronouns || user.aboutMyself?.pronouns || '',
      genderVisibility: user.genderVisibility || 'public',
      voiceIntroUrl: user.audioIntro?.url || '',
      publicKey: user.publicKeyFingerprint || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      console.warn('Firestore sync user warning:', e);
    }
  }
}

export function updateUser(updated: User) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updated.id);
  if (index !== -1) {
    users[index] = updated;
    saveUsers(users);
  } else {
    users.push(updated);
    saveUsers(users);
  }
  syncUserToFirestore(updated);
}

export async function syncFirebaseUserWithProfile(
  fbUser: FirebaseUser,
  customProfile?: {
    name?: string;
    handle?: string;
    bio?: string;
    gender?: string;
    pronouns?: string;
    isProfileComplete?: boolean;
  }
): Promise<User> {
  const users = getUsers();
  let user = users.find(u => u.id === fbUser.uid);
  if (!user) {
    const rawName = customProfile?.name || fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Haven Member');
    const cleanHandle = customProfile?.handle?.startsWith('@')
      ? customProfile.handle
      : '@' + (customProfile?.handle || rawName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'haven_' + fbUser.uid.slice(0, 5));

    user = {
      id: fbUser.uid,
      name: rawName,
      handle: cleanHandle,
      email: fbUser.email || '',
      avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
      bio: customProfile?.bio || '',
      gender: customProfile?.gender || '',
      pronouns: customProfile?.pronouns || '',
      genderVisibility: 'public',
      isProfileComplete: customProfile?.isProfileComplete ?? false, // New users fill details in onboarding
      photos: [],
      joinedDate: 'Joined recently',
      isOnline: true,
      friends: ['user_alex', 'user_elena'],
      publicKeyFingerprint: 'HAVEN-SEC-' + fbUser.uid.slice(0, 8).toUpperCase(),
      aboutMyself: {
        location: '',
        occupation: '',
        gender: customProfile?.gender || '',
        pronouns: customProfile?.pronouns || '',
        lifePhilosophy: '',
        interests: ['Writing', 'Photography', 'Soundscapes', 'Memoirs'],
        languages: ['English']
      }
    };
    users.unshift(user);
    saveUsers(users);
  } else {
    let changed = false;
    if (customProfile?.name && user.name !== customProfile.name) {
      user.name = customProfile.name;
      changed = true;
    } else if (fbUser.displayName && user.name !== fbUser.displayName) {
      user.name = fbUser.displayName;
      changed = true;
    }
    if (fbUser.photoURL && user.avatar !== fbUser.photoURL) {
      user.avatar = fbUser.photoURL;
      changed = true;
    }
    if (fbUser.email && user.email !== fbUser.email) {
      user.email = fbUser.email;
      changed = true;
    }
    if (customProfile?.gender && user.gender !== customProfile.gender) {
      user.gender = customProfile.gender;
      if (user.aboutMyself) user.aboutMyself.gender = customProfile.gender;
      changed = true;
    }
    if (customProfile?.pronouns && user.pronouns !== customProfile.pronouns) {
      user.pronouns = customProfile.pronouns;
      if (user.aboutMyself) user.aboutMyself.pronouns = customProfile.pronouns;
      changed = true;
    }
    if (customProfile?.isProfileComplete !== undefined && user.isProfileComplete !== customProfile.isProfileComplete) {
      user.isProfileComplete = customProfile.isProfileComplete;
      changed = true;
    }
    if (changed) saveUsers(users);
  }
  setActiveUserId(user.id);
  await syncUserToFirestore(user);
  return user;
}

export function createLocalUser(data: {
  name: string;
  email?: string;
  handle?: string;
  bio?: string;
  avatar?: string;
  gender?: string;
  pronouns?: string;
  genderVisibility?: 'public' | 'friends_only' | 'private';
  location?: string;
  occupation?: string;
  lifePhilosophy?: string;
  interests?: string[];
  languages?: string[];
  audioIntro?: { url: string; durationSec: number; title: string };
  isProfileComplete?: boolean;
}): User {
  const users = getUsers();
  const id = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const handle = data.handle?.startsWith('@')
    ? data.handle
    : '@' + (data.handle || data.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'haven_user');

  const newUser: User = {
    id,
    name: data.name.trim() || 'New Storyteller',
    email: data.email?.trim() || '',
    handle,
    avatar: data.avatar?.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    bio: data.bio?.trim() || '',
    gender: data.gender || '',
    pronouns: data.pronouns || '',
    genderVisibility: data.genderVisibility || 'public',
    isProfileComplete: data.isProfileComplete ?? false,
    audioIntro: data.audioIntro,
    photos: [],
    joinedDate: 'Joined today',
    isOnline: true,
    friends: ['user_alex', 'user_elena'],
    publicKeyFingerprint: 'HAVEN-SEC-' + id.slice(-8).toUpperCase(),
    aboutMyself: {
      location: data.location?.trim() || '',
      occupation: data.occupation?.trim() || '',
      gender: data.gender || '',
      pronouns: data.pronouns || '',
      lifePhilosophy: data.lifePhilosophy?.trim() || '',
      interests: data.interests || ['Writing', 'Memoirs', 'Reflections'],
      languages: data.languages || ['English']
    }
  };

  users.unshift(newUser);
  saveUsers(users);
  setActiveUserId(newUser.id);
  syncUserToFirestore(newUser);
  return newUser;
}

export function completeUserProfile(
  userId: string,
  details: {
    name?: string;
    handle?: string;
    avatar?: string;
    bio?: string;
    gender?: string;
    pronouns?: string;
    genderVisibility?: 'public' | 'friends_only' | 'private';
    location?: string;
    occupation?: string;
    lifePhilosophy?: string;
    interests?: string[];
    languages?: string[];
    audioIntro?: { url: string; durationSec: number; title: string };
  }
): User {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('User not found: ' + userId);
  }
  const curr = users[index];
  const updated: User = {
    ...curr,
    name: details.name?.trim() || curr.name,
    handle: details.handle?.trim() || curr.handle,
    avatar: details.avatar?.trim() || curr.avatar,
    bio: details.bio?.trim() || curr.bio,
    gender: details.gender !== undefined ? details.gender : curr.gender,
    pronouns: details.pronouns !== undefined ? details.pronouns : curr.pronouns,
    genderVisibility: details.genderVisibility || curr.genderVisibility || 'public',
    audioIntro: details.audioIntro !== undefined ? details.audioIntro : curr.audioIntro,
    isProfileComplete: true,
    aboutMyself: {
      location: details.location?.trim() ?? curr.aboutMyself?.location ?? '',
      occupation: details.occupation?.trim() ?? curr.aboutMyself?.occupation ?? '',
      gender: details.gender !== undefined ? details.gender : (curr.aboutMyself?.gender || curr.gender),
      pronouns: details.pronouns !== undefined ? details.pronouns : (curr.aboutMyself?.pronouns || curr.pronouns),
      lifePhilosophy: details.lifePhilosophy?.trim() ?? curr.aboutMyself?.lifePhilosophy ?? '',
      interests: details.interests ?? curr.aboutMyself?.interests ?? ['Writing', 'Memoirs', 'Reflections'],
      languages: details.languages ?? curr.aboutMyself?.languages ?? ['English']
    }
  };
  users[index] = updated;
  saveUsers(users);
  setActiveUserId(updated.id);
  syncUserToFirestore(updated);
  return updated;
}

export async function signOutSession(): Promise<void> {
  try {
    await logoutUser();
  } catch (err) {
    console.warn('Sign out notice:', err);
  }
  clearActiveSession();
}

// ----------------- Stories & Firestore Persistence -----------------
export function getStories(): Story[] {
  try {
    const raw = localStorage.getItem(KEYS.STORIES);
    if (!raw) {
      localStorage.setItem(KEYS.STORIES, JSON.stringify(INITIAL_STORIES));
      return INITIAL_STORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORIES;
  }
}

export function saveStories(stories: Story[]) {
  localStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
  emitChange();
}

export async function syncStoryToFirestore(story: Story) {
  if (!getIsOnline() || !auth.currentUser) return;
  const path = `stories/${story.id}`;
  try {
    await setDoc(doc(db, 'stories', story.id), {
      id: story.id,
      authorId: story.authorId,
      authorName: story.authorName,
      authorHandle: story.authorHandle,
      authorAvatar: story.authorAvatar,
      title: story.title,
      content: story.content,
      excerpt: story.content.slice(0, 200),
      tags: story.tags.join(', '),
      photoUrl: story.photoUrl || '',
      videoClipUrl: story.videoClipUrl || '',
      audioClipUrl: story.audioClip?.url || '',
      location: story.location || '',
      isFriendsOnly: story.privacy === 'friends_only',
      likesCount: story.likesCount || 0,
      commentsCount: story.comments?.length || 0,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      console.warn('Firestore story sync warning:', e);
    }
  }
}

export function addStory(story: Story) {
  const stories = getStories();
  const isOnline = getIsOnline();

  if (!isOnline) {
    story.syncStatus = 'pending_sync';
    story.isOfflineDraft = true;
    enqueueOfflineItem({
      id: 'queue_' + Date.now(),
      type: 'create_story',
      payload: story,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });
  } else {
    story.syncStatus = 'synced';
    story.isOfflineDraft = false;
  }

  stories.unshift(story);
  saveStories(stories);
  syncStoryToFirestore(story);
  return story;
}

export function toggleStoryLike(storyId: string, userId: string) {
  const stories = getStories();
  const story = stories.find(s => s.id === storyId);
  if (story) {
    story.isLiked = !story.isLiked;
    story.likesCount += story.isLiked ? 1 : -1;
    saveStories(stories);

    if (getIsOnline() && auth.currentUser) {
      const path = `stories/${storyId}`;
      updateDoc(doc(db, 'stories', storyId), {
        likesCount: story.likesCount
      }).catch(err => {
        try {
          handleFirestoreError(err, OperationType.UPDATE, path);
        } catch (e) {
          console.warn('Like sync warning:', e);
        }
      });
    }

    // If liked, notify author if not oneself
    if (story.isLiked && story.authorId !== userId) {
      const activeUser = getActiveUser();
      if (activeUser) {
        addNotification({
          id: 'notif_' + Date.now(),
          type: 'story_like',
          title: 'Story Liked',
          message: `${activeUser.name} liked your story "${story.title}".`,
          timestamp: 'Just now',
          isRead: false,
          linkTab: 'stories',
          linkId: storyId,
          actorId: activeUser.id
        });
      }
    }
  }
}

export function addStoryComment(storyId: string, commentText: string) {
  const stories = getStories();
  const story = stories.find(s => s.id === storyId);
  const activeUser = getActiveUser();

  if (story && activeUser) {
    const newComment = {
      id: 'c_' + Date.now(),
      authorId: activeUser.id,
      authorName: activeUser.name,
      authorAvatar: activeUser.avatar,
      text: commentText,
      timestamp: 'Just now'
    };
    story.comments.push(newComment);
    saveStories(stories);

    if (getIsOnline() && auth.currentUser) {
      const path = `stories/${storyId}`;
      updateDoc(doc(db, 'stories', storyId), {
        commentsCount: story.comments.length
      }).catch(err => {
        try {
          handleFirestoreError(err, OperationType.UPDATE, path);
        } catch (e) {
          console.warn('Comment sync warning:', e);
        }
      });
    }

    // Notify author
    if (story.authorId !== activeUser.id) {
      addNotification({
        id: 'notif_' + Date.now(),
        type: 'story_comment',
        title: 'New Story Comment',
        message: `${activeUser.name} commented on "${story.title}": "${commentText.slice(0, 40)}..."`,
        timestamp: 'Just now',
        isRead: false,
        linkTab: 'stories',
        linkId: storyId,
        actorId: activeUser.id
      });
    }
  }
}

// ----------------- Direct Messages & Firestore -----------------
export function getMessages(): DirectMessage[] {
  try {
    const raw = localStorage.getItem(KEYS.MESSAGES);
    if (!raw) {
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES;
  }
}

export function saveMessages(messages: DirectMessage[]) {
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  emitChange();
}

export async function syncMessageToFirestore(message: DirectMessage) {
  if (!getIsOnline() || !auth.currentUser) return;
  const path = `direct_messages/${message.id}`;
  try {
    await setDoc(doc(db, 'direct_messages', message.id), {
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      encryptedPayload: message.ciphertext || message.text,
      iv: message.iv || '',
      salt: message.salt || '',
      status: message.status,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      console.warn('Message sync warning:', e);
    }
  }
}

export function sendDirectMessage(message: DirectMessage): DirectMessage {
  const messages = getMessages();
  const isOnline = getIsOnline();

  if (!isOnline) {
    message.status = 'pending_sync';
    enqueueOfflineItem({
      id: 'queue_' + Date.now(),
      type: 'send_message',
      payload: message,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });
  } else {
    message.status = 'delivered';
  }

  messages.push(message);
  saveMessages(messages);
  syncMessageToFirestore(message);

  // Send real-time notification to recipient
  if (isOnline) {
    const activeUser = getActiveUser();
    if (activeUser) {
      addNotification({
        id: 'notif_' + Date.now(),
        type: 'direct_message',
        title: `Encrypted Message from ${activeUser.name}`,
        message: message.audioAttachment
          ? 'Sent a voice audio note 🎙️'
          : message.photoAttachment
          ? 'Sent a photo attachment 📷'
          : `${message.text.slice(0, 60)}`,
        timestamp: 'Just now',
        isRead: false,
        linkTab: 'messages',
        actorId: activeUser.id
      });
    }
  }

  return message;
}

// ----------------- Friends & Requests -----------------
export function getFriendRequests(): FriendRequest[] {
  try {
    const raw = localStorage.getItem(KEYS.FRIEND_REQUESTS);
    if (!raw) {
      localStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(INITIAL_FRIEND_REQUESTS));
      return INITIAL_FRIEND_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FRIEND_REQUESTS;
  }
}

export function saveFriendRequests(requests: FriendRequest[]) {
  localStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  emitChange();
}

export async function syncFriendRequestToFirestore(req: FriendRequest) {
  if (!getIsOnline() || !auth.currentUser) return;
  const path = `friend_requests/${req.id}`;
  try {
    await setDoc(doc(db, 'friend_requests', req.id), {
      id: req.id,
      fromUserId: req.fromUserId,
      toUserId: req.toUserId,
      fromUserName: req.fromUserName,
      status: req.status,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      console.warn('Friend request sync warning:', e);
    }
  }
}

export function sendFriendRequest(fromUserId: string, toUserId: string): FriendRequest | null {
  const users = getUsers();
  const fromUser = users.find(u => u.id === fromUserId);
  const toUser = users.find(u => u.id === toUserId);
  if (!fromUser || !toUser) return null;

  // Check if already friends
  if (fromUser.friends.includes(toUserId)) return null;

  const requests = getFriendRequests();
  const existing = requests.find(r => r.fromUserId === fromUserId && r.toUserId === toUserId && r.status === 'pending');
  if (existing) return existing;

  const newRequest: FriendRequest = {
    id: 'req_' + Date.now(),
    fromUserId,
    toUserId,
    fromUserName: fromUser.name,
    fromUserHandle: fromUser.handle,
    fromUserAvatar: fromUser.avatar,
    timestamp: 'Just now',
    status: 'pending'
  };

  const isOnline = getIsOnline();
  if (!isOnline) {
    enqueueOfflineItem({
      id: 'queue_' + Date.now(),
      type: 'send_friend_request',
      payload: newRequest,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });
  }

  requests.push(newRequest);
  saveFriendRequests(requests);
  syncFriendRequestToFirestore(newRequest);

  // Notify recipient
  addNotification({
    id: 'notif_' + Date.now(),
    type: 'friend_request',
    title: 'New Friend Request',
    message: `${fromUser.name} (${fromUser.handle}) requested to connect as friends so you can direct message.`,
    timestamp: 'Just now',
    isRead: false,
    linkTab: 'friends',
    actorId: fromUserId
  });

  return newRequest;
}

export function respondToFriendRequest(requestId: string, action: 'accept' | 'decline') {
  const requests = getFriendRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return;

  req.status = action === 'accept' ? 'accepted' : 'declined';
  saveFriendRequests(requests);
  syncFriendRequestToFirestore(req);

  if (action === 'accept') {
    const users = getUsers();
    const userA = users.find(u => u.id === req.fromUserId);
    const userB = users.find(u => u.id === req.toUserId);

    if (userA && userB) {
      if (!userA.friends.includes(userB.id)) userA.friends.push(userB.id);
      if (!userB.friends.includes(userA.id)) userB.friends.push(userA.id);
      saveUsers(users);
      syncUserToFirestore(userA);
      syncUserToFirestore(userB);

      // Notify the requester
      addNotification({
        id: 'notif_' + Date.now(),
        type: 'friend_accepted',
        title: 'Friend Request Accepted! 🎉',
        message: `${userB.name} accepted your friend request. You can now exchange direct encrypted messages.`,
        timestamp: 'Just now',
        isRead: false,
        linkTab: 'messages',
        actorId: userB.id
      });
    }
  }
}

// ----------------- Notifications -----------------
export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  emitChange();
}

export function addNotification(notification: AppNotification) {
  const list = getNotifications();
  list.unshift(notification);
  saveNotifications(list);
}

export function markNotificationAsRead(id: string) {
  const list = getNotifications();
  const item = list.find(n => n.id === id);
  if (item) {
    item.isRead = true;
    saveNotifications(list);
  }
}

export function markAllNotificationsAsRead() {
  const list = getNotifications();
  list.forEach(n => (n.isRead = true));
  saveNotifications(list);
}

export function clearAllNotifications() {
  saveNotifications([]);
}

// ----------------- Offline Sync Queue -----------------
export function getSyncQueue(): OfflineSyncQueueItem[] {
  try {
    const raw = localStorage.getItem(KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineItem(item: OfflineSyncQueueItem) {
  const queue = getSyncQueue();
  queue.push(item);
  localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
  emitChange();
}

export function processOfflineSyncQueue(): number {
  const queue = getSyncQueue();
  if (queue.length === 0) return 0;

  const count = queue.length;
  // Mark stories as synced
  const stories = getStories();
  stories.forEach(s => {
    if (s.syncStatus === 'pending_sync') {
      s.syncStatus = 'synced';
      s.isOfflineDraft = false;
      syncStoryToFirestore(s);
    }
  });
  saveStories(stories);

  // Mark messages as delivered
  const messages = getMessages();
  messages.forEach(m => {
    if (m.status === 'pending_sync') {
      m.status = 'delivered';
      syncMessageToFirestore(m);
    }
  });
  saveMessages(messages);

  // Clear queue
  localStorage.removeItem(KEYS.SYNC_QUEUE);

  // Dispatch sync notification
  addNotification({
    id: 'notif_sync_' + Date.now(),
    type: 'sync_complete',
    title: 'Offline Sync Complete',
    message: `Successfully synchronized ${count} queued items (stories & messages) with Firestore cloud.`,
    timestamp: 'Just now',
    isRead: false
  });

  emitChange();
  return count;
}

// Attach Firestore realtime listener if online
export function initFirestoreSync() {
  if (typeof window === 'undefined') return;
  const pathForOnSnapshot = 'stories';
  try {
    onSnapshot(collection(db, pathForOnSnapshot), (snapshot) => {
      if (snapshot.empty) return;
      const remoteStories: Story[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (d && d.title) {
          remoteStories.push({
            id: d.id || docSnap.id,
            authorId: d.authorId || '',
            authorName: d.authorName || 'Haven Member',
            authorHandle: d.authorHandle || '@haven',
            authorAvatar: d.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            title: d.title,
            content: d.content || '',
            timestamp: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Recently',
            tags: d.tags ? d.tags.split(',').map((t: string) => t.trim()) : [],
            photoUrl: d.photoUrl || undefined,
            videoClipUrl: d.videoClipUrl || undefined,
            audioClip: d.audioClipUrl ? { url: d.audioClipUrl, durationSec: 30, title: 'Audio Reflection' } : undefined,
            location: d.location || undefined,
            privacy: d.isFriendsOnly ? 'friends_only' : 'public',
            likesCount: d.likesCount || 0,
            comments: [],
            moderationStatus: 'approved',
            syncStatus: 'synced'
          });
        }
      });
      if (remoteStories.length > 0) {
        // Merge with local stories keeping local updates
        const currentLocal = getStories();
        const merged = [...currentLocal];
        remoteStories.forEach(remote => {
          const idx = merged.findIndex(l => l.id === remote.id);
          if (idx === -1) {
            merged.push(remote);
          }
        });
        saveStories(merged);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });
  } catch (e) {
    console.warn('Realtime listener note:', e);
  }
}

// Listen to browser network changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (!isSimulatedOffline) {
      processOfflineSyncQueue();
    }
  });
  window.addEventListener('offline', () => {
    emitChange();
  });
}
