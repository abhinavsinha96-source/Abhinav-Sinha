import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Save,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Briefcase,
  Globe,
  Tag,
  Mic,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  HelpCircle,
  FileText,
  LogIn,
  LogOut,
  Database,
  Eye,
  Users,
  BookOpen,
  Info
} from 'lucide-react';
import { User, Story, EncryptedVaultData } from '../types';
import { encryptText, decryptText, generateUserFingerprint } from '../services/crypto';
import { updateUser, getStories, getIsOnline, syncFirebaseUserWithProfile, clearActiveSession } from '../services/storage';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged, FirebaseUser } from '../services/firebase';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { StoryCard } from './StoryCard';
import { GenderSelectorModal } from './GenderSelectorModal';
import { AuthModal } from './AuthModal';
import { findGenderByIdOrLabel } from '../data/genders';

interface ProfileViewProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser?: (userId: string) => void;
  onSignOut?: () => void;
  onToggleLike: (storyId: string) => void;
  onAddComment: (storyId: string, text: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onSignOut,
  onToggleLike,
  onAddComment
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.aboutMyself?.location || '');
  const [occupation, setOccupation] = useState(currentUser.aboutMyself?.occupation || '');
  const [philosophy, setPhilosophy] = useState(currentUser.aboutMyself?.lifePhilosophy || '');
  const [interestsText, setInterestsText] = useState(currentUser.aboutMyself?.interests?.join(', ') || '');
  const [languagesText, setLanguagesText] = useState(currentUser.aboutMyself?.languages?.join(', ') || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Worldwide Gender & Identity state
  const [gender, setGender] = useState(currentUser.gender || currentUser.aboutMyself?.gender || '');
  const [pronouns, setPronouns] = useState(currentUser.pronouns || currentUser.aboutMyself?.pronouns || '');
  const [genderVisibility, setGenderVisibility] = useState<'public' | 'friends_only' | 'private'>(
    currentUser.genderVisibility || 'public'
  );
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);

  // Audio intro recording
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [audioIntro, setAudioIntro] = useState(currentUser.audioIntro);

  // Fingerprint state
  const [fingerprint, setFingerprint] = useState(currentUser.publicKeyFingerprint);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  // Secure Encrypted Profile Vault State
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isEncryptingVault, setIsEncryptingVault] = useState(false);
  const [vaultError, setVaultError] = useState('');
  const [vaultSuccess, setVaultSuccess] = useState('');

  // Unlocked vault plaintext data
  const [vaultData, setVaultData] = useState<EncryptedVaultData>({
    privateJournal: '',
    confidentialContact: '',
    personalNotes: '',
    encryptionKeyHint: '',
    updatedAt: new Date().toISOString()
  });

  // Stored encrypted vault in localStorage per user
  const vaultStorageKey = `haven_vault_${currentUser.id}`;

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
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

  const handleAppSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setFirebaseUser(null);
    clearActiveSession();
    onSignOut?.();
  };

  useEffect(() => {
    setName(currentUser.name);
    setBio(currentUser.bio);
    setLocation(currentUser.aboutMyself?.location || '');
    setOccupation(currentUser.aboutMyself?.occupation || '');
    setPhilosophy(currentUser.aboutMyself?.lifePhilosophy || '');
    setInterestsText(currentUser.aboutMyself?.interests?.join(', ') || '');
    setLanguagesText(currentUser.aboutMyself?.languages?.join(', ') || '');
    setAvatar(currentUser.avatar);
    setAudioIntro(currentUser.audioIntro);
    setGender(currentUser.gender || currentUser.aboutMyself?.gender || '');
    setPronouns(currentUser.pronouns || currentUser.aboutMyself?.pronouns || '');
    setGenderVisibility(currentUser.genderVisibility || 'public');

    generateUserFingerprint(currentUser.id, currentUser.handle).then(fp => setFingerprint(fp));

    // Reset vault unlock state on user switch
    setIsVaultUnlocked(false);
    setVaultPassphrase('');
    setVaultError('');
    setVaultSuccess('');
  }, [currentUser]);

  // Worldwide gender metadata for currently active user
  const activeGenderValue = currentUser.gender || currentUser.aboutMyself?.gender;
  const matchedGender = findGenderByIdOrLabel(activeGenderValue);

  const handleGenderModalSave = (data: {
    gender: string;
    pronouns?: string;
    visibility: 'public' | 'friends_only' | 'private';
  }) => {
    setGender(data.gender);
    if (data.pronouns !== undefined) setPronouns(data.pronouns);
    setGenderVisibility(data.visibility);

    const updated: User = {
      ...currentUser,
      gender: data.gender || undefined,
      pronouns: data.pronouns || undefined,
      genderVisibility: data.visibility,
      aboutMyself: {
        ...currentUser.aboutMyself,
        gender: data.gender || undefined,
        pronouns: data.pronouns || undefined
      }
    };
    updateUser(updated);
  };

  // Load vault encrypted envelope from storage
  const getStoredVaultEnvelope = (): { ciphertext: string; iv: string; salt: string; hint?: string } | null => {
    try {
      const raw = localStorage.getItem(vaultStorageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const storedEnvelope = getStoredVaultEnvelope();

  // Unlock and Decrypt Vault with Passphrase
  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultPassphrase.trim()) {
      setVaultError('Please enter your vault encryption passphrase');
      return;
    }
    setVaultError('');

    try {
      if (!storedEnvelope) {
        // First time initialization: initialize empty vault with this passphrase
        const initialData: EncryptedVaultData = {
          privateJournal: `Personal confidential reflections for ${currentUser.name}. Only decrypted with your master passphrase.`,
          confidentialContact: 'Trusted Friend / Emergency Contact: contact@privacy-mesh.net',
          personalNotes: 'Medical allergy note: Penicillin sensitive. Blood group: O+.',
          encryptionKeyHint: 'Default demo passphrase is "haven2026"',
          updatedAt: new Date().toISOString()
        };

        const encrypted = await encryptText(JSON.stringify(initialData), vaultPassphrase);
        localStorage.setItem(
          vaultStorageKey,
          JSON.stringify({ ...encrypted, hint: initialData.encryptionKeyHint })
        );

        setVaultData(initialData);
        setIsVaultUnlocked(true);
        setVaultSuccess('New encrypted profile vault initialized with AES-GCM 256-bit');
        setTimeout(() => setVaultSuccess(''), 4000);
        return;
      }

      // Decrypt existing stored envelope
      const plaintextJson = await decryptText(
        storedEnvelope.ciphertext,
        storedEnvelope.iv,
        storedEnvelope.salt,
        vaultPassphrase
      );

      const parsed: EncryptedVaultData = JSON.parse(plaintextJson);
      setVaultData(parsed);
      setIsVaultUnlocked(true);
      setVaultSuccess('Encrypted vault unlocked and decrypted successfully');
      setTimeout(() => setVaultSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setVaultError('Incorrect passphrase. Cryptographic integrity check failed.');
    }
  };

  // Re-encrypt and Save Vault Data
  const handleSaveVault = async () => {
    if (!vaultPassphrase) {
      setVaultError('Passphrase required to encrypt vault payload');
      return;
    }

    setIsEncryptingVault(true);
    setVaultError('');

    try {
      const payload: EncryptedVaultData = {
        ...vaultData,
        updatedAt: new Date().toISOString()
      };

      const encrypted = await encryptText(JSON.stringify(payload), vaultPassphrase);
      localStorage.setItem(
        vaultStorageKey,
        JSON.stringify({ ...encrypted, hint: payload.encryptionKeyHint })
      );

      setVaultSuccess('Vault re-encrypted and persisted securely via AES-GCM-256');
      setTimeout(() => setVaultSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setVaultError('Failed to encrypt vault data');
    } finally {
      setIsEncryptingVault(false);
    }
  };

  // Save General Profile Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      bio: bio.trim(),
      avatar: avatar.trim() || currentUser.avatar,
      gender: gender.trim() || undefined,
      pronouns: pronouns.trim() || undefined,
      genderVisibility,
      audioIntro,
      aboutMyself: {
        location: location.trim(),
        occupation: occupation.trim(),
        gender: gender.trim() || undefined,
        pronouns: pronouns.trim() || undefined,
        lifePhilosophy: philosophy.trim(),
        interests: interestsText
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        languages: languagesText
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }
    };

    updateUser(updated);
    setIsEditingProfile(false);
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(fingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  // Get stories by current user
  const allStories = getStories();
  const userStories = allStories.filter(s => s.authorId === currentUser.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Firebase Cloud Authentication & Persistence Card */}
      <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-rose-950/40 border border-pink-300/80 dark:border-pink-800/60 rounded-3xl p-5 sm:p-6 shadow-pink-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/15 dark:bg-pink-500/25 text-pink-600 dark:text-pink-300 flex items-center justify-center border border-pink-300/60 dark:border-pink-800/60 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-pink-950 dark:text-white">
                  Firebase Authentication & Firestore Cloud Sync
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-800">
                  {firebaseUser ? 'Cloud Connected' : 'Ready'}
                </span>
              </div>
              <p className="text-xs text-pink-900/80 dark:text-pink-200/80 mt-0.5 max-w-xl leading-relaxed">
                {firebaseUser
                  ? `Signed in as ${firebaseUser.displayName || 'Google Account'} (${firebaseUser.email}). Stories, profile data, and accepted friendships are synchronized to your Firestore database.`
                  : 'Sign in with your Google account to secure your memoirs, enable cloud Firestore persistence, and seamlessly sync your stories across all devices.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {firebaseUser ? (
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-pink-950 dark:text-white truncate max-w-[140px]">
                  {firebaseUser.displayName || 'Google Account'}
                </div>
                <div className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">
                  {firebaseUser.email || 'Cloud Synced'}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:flex min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 dark:border-pink-800/80 text-xs font-medium text-pink-800 dark:text-pink-200 hover:bg-pink-50 dark:hover:bg-pink-950/50 items-center gap-1.5 transition-colors"
                title="Connect Cloud Account"
              >
                <LogIn className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Link Cloud Auth</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAppSignOut}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-colors active:scale-95"
              title="Sign out of Haven session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 rounded-3xl p-6 sm:p-8 shadow-pink-glow relative overflow-hidden">
        {/* Subtle decorative mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-pink-200/80 dark:ring-pink-800/80 shadow-md"
              />
              <div
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white dark:border-[#1E0B24]"
                title="ECDH / AES-GCM Encrypted Identity"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-pink-950 dark:text-white">
                  {currentUser.name}
                </h1>
                {currentUser.pronouns && (
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    ({currentUser.pronouns})
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 font-medium">
                  ✨ Verified Identity
                </span>
                {currentUser.gender ? (
                  <button
                    type="button"
                    onClick={() => setIsGenderModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/60 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/60 transition-all shadow-xs"
                    title="Click to view or change worldwide gender identity"
                  >
                    <Globe className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    <span>🏳️‍🌈 {currentUser.gender}</span>
                    {matchedGender?.category === 'cultural_indigenous' && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-normal">
                        Cultural
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsGenderModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-dashed border-pink-300 dark:border-pink-700 hover:border-pink-500 hover:text-pink-600 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-pink-600" />
                    <span>+ Set Gender Identity</span>
                  </button>
                )}
              </div>
              <p className="text-sm font-mono text-pink-700/70 dark:text-pink-300/70 mt-0.5">
                {currentUser.handle} • Joined {currentUser.joinedDate}
              </p>
              <p className="text-sm text-pink-950/90 dark:text-pink-100/90 mt-2 max-w-xl leading-relaxed">
                {currentUser.bio}
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-pink-700/70 dark:text-pink-300/70 flex-wrap">
                {currentUser.aboutMyself?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    {currentUser.aboutMyself.location}
                  </span>
                )}
                {currentUser.aboutMyself?.occupation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-pink-500" />
                    {currentUser.aboutMyself.occupation}
                  </span>
                )}
                <span className="text-pink-600 dark:text-pink-400 font-semibold">
                  💖 {currentUser.friends.length} Chosen Family Friends
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/60 text-pink-900 dark:text-pink-100 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors shadow-xs"
            >
              {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Spoken Voice Introduction */}
        {currentUser.audioIntro && (
          <div className="mt-6 pt-6 border-t border-pink-100 dark:border-pink-900/40">
            <div className="text-xs font-semibold uppercase tracking-wider text-pink-700/80 dark:text-pink-300/80 mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              Spoken Audio Memoir
            </div>
            <AudioPlayer
              clipId={currentUser.audioIntro.url}
              durationSec={currentUser.audioIntro.durationSec}
              title={currentUser.audioIntro.title}
            />
          </div>
        )}

        {/* Cryptographic Key Fingerprint Card */}
        <div className="mt-6 pt-6 border-t border-pink-100 dark:border-pink-900/40">
          <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-[#16081A]/60 border border-pink-200/80 dark:border-pink-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
                <Key className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                End-to-End Cryptographic Safety Fingerprint
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-pink-950 dark:text-pink-100 tracking-wide select-all">
                {fingerprint}
              </div>
              <p className="text-[11px] text-pink-700/70 dark:text-pink-300/70">
                Generated from your identity public key. Friends compare this fingerprint out-of-band to verify channel authenticity.
              </p>
            </div>
            <button
              onClick={copyFingerprint}
              className="px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-800 text-xs font-medium text-pink-900 dark:text-pink-200 hover:bg-white dark:hover:bg-[#1E0B24] flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              {copiedFingerprint ? (
                <>
                  <Check className="w-3.5 h-3.5 text-pink-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-pink-600" /> Copy Fingerprint
                </>
              )}
            </button>
          </div>
        </div>

        {/* About Myself Details: Philosophy, Interests, Languages */}
        {currentUser.aboutMyself && (
          <div className="mt-6 pt-6 border-t border-pink-100 dark:border-pink-900/40 grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.aboutMyself.lifePhilosophy && (
              <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-[#16081A]/40 border border-pink-200/60 dark:border-pink-900/40">
                <div className="text-xs font-semibold text-pink-800 dark:text-pink-300 mb-1">
                  Life Philosophy
                </div>
                <p className="text-sm font-serif italic text-pink-950 dark:text-pink-100">
                  "{currentUser.aboutMyself.lifePhilosophy}"
                </p>
              </div>
            )}

            {currentUser.aboutMyself.interests && currentUser.aboutMyself.interests.length > 0 && (
              <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-[#16081A]/40 border border-pink-200/60 dark:border-pink-900/40">
                <div className="text-xs font-semibold text-pink-800 dark:text-pink-300 mb-2">
                  Interests & Passions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.aboutMyself.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-[#1E0B24] border border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200"
                    >
                      ✨ {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dedicated Worldwide Gender & Cultural Expression Card */}
        <div className="mt-6 pt-6 border-t border-pink-100 dark:border-pink-900/40">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-rose-950/40 border border-pink-300/80 dark:border-pink-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">
                  Worldwide Gender & Cultural Expression
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-[#1E0B24] border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300">
                  {currentUser.genderVisibility === 'friends_only' ? 'Friends Only' : currentUser.genderVisibility === 'private' ? 'Private' : 'Public'}
                </span>
                {matchedGender?.category === 'cultural_indigenous' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                    Cultural Tradition
                  </span>
                )}
              </div>

              {activeGenderValue ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-serif-display font-bold text-pink-950 dark:text-white">
                      🏳️‍🌈 {activeGenderValue}
                    </span>
                    {currentUser.pronouns && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200">
                        {currentUser.pronouns}
                      </span>
                    )}
                    {matchedGender?.culturalOrigin && (
                      <span className="text-xs text-pink-700/70 dark:text-pink-300/70 font-mono">
                        • {matchedGender.culturalOrigin}
                      </span>
                    )}
                  </div>
                  {matchedGender?.description ? (
                    <p className="text-xs text-pink-900/80 dark:text-pink-200/80 max-w-2xl leading-relaxed">
                      {matchedGender.description}
                    </p>
                  ) : (
                    <p className="text-xs text-pink-700/70 dark:text-pink-300/70">
                      Self-described personalized identity.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-pink-700/70 dark:text-pink-300/70 max-w-xl">
                  No gender identity set yet. Choose from our comprehensive global directory of 60+ cultural traditions, indigenous identities, non-binary spectrums, or describe your own identity.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsGenderModalOpen(true)}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-2 shadow-xs shadow-pink-500/20 transition-all active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span>{activeGenderValue ? 'Explore / Change Gender' : 'Choose Worldwide Gender'}</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-serif-display font-bold text-slate-900 dark:text-white">
              Edit About Myself
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Occupation / Craft
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Avatar Photo URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio & Story
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Worldwide Gender Identity & Expression Section */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Worldwide Gender Identity
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose from all known genders across global cultures, indigenous traditions, and expansive spectrums.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGenderModalOpen(true)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{gender ? 'Change Identity' : 'Select Gender'}</span>
                </button>
              </div>

              {gender ? (
                <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                      {gender}
                    </div>
                    {findGenderByIdOrLabel(gender)?.culturalOrigin && (
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                        {findGenderByIdOrLabel(gender)?.culturalOrigin}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setGender('')}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No gender currently selected. Click "Select Gender" to open the worldwide directory.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pronouns
                  </label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={e => setPronouns(e.target.value)}
                    placeholder="e.g. they/them, she/her, he/him, ze/zir"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender Visibility
                  </label>
                  <select
                    value={genderVisibility}
                    onChange={e => setGenderVisibility(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  >
                    <option value="public">Public on Profile</option>
                    <option value="friends_only">Friends Only (Accepted Friends)</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Life Philosophy
              </label>
              <input
                type="text"
                value={philosophy}
                onChange={e => setPhilosophy(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Audio Intro Recorder */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Spoken Voice Introduction
              </label>
              {showAudioRecorder ? (
                <AudioRecorder
                  onRecordingComplete={clip => {
                    setAudioIntro(clip);
                    setShowAudioRecorder(false);
                  }}
                  onCancel={() => setShowAudioRecorder(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAudioRecorder(true)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Mic className="w-4 h-4 text-emerald-600" />
                  {audioIntro ? 'Re-record Spoken Audio Introduction' : 'Record Audio Introduction'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shadow-pink-500/20"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECURE ENCRYPTED PROFILE VAULT SECTION */}
      <div className="bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 rounded-3xl p-6 sm:p-8 shadow-pink-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-pink-100 dark:border-pink-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold border border-pink-200 dark:border-pink-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif-display font-bold text-pink-950 dark:text-white">
                  Secure Encrypted Personal Vault
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-semibold border border-pink-200 dark:border-pink-800">
                  🔒 AES-GCM-256
                </span>
              </div>
              <p className="text-xs text-pink-800/70 dark:text-pink-300/70 mt-0.5">
                Zero-knowledge personal vault. Kept locally in encrypted storage and decrypted only inside your browser session.
              </p>
            </div>
          </div>

          {isVaultUnlocked && (
            <button
              onClick={() => {
                setIsVaultUnlocked(false);
                setVaultPassphrase('');
                setVaultSuccess('Vault locked securely');
                setTimeout(() => setVaultSuccess(''), 2500);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-800 dark:text-pink-200 transition-colors flex items-center gap-1.5 border border-pink-200 dark:border-pink-800 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" /> Lock Vault Now
            </button>
          )}
        </div>

        {vaultSuccess && (
          <div className="mt-4 p-3.5 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {vaultSuccess}
          </div>
        )}

        {vaultError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {vaultError}
          </div>
        )}

        {!isVaultUnlocked ? (
          /* Vault Locked View */
          <div className="mt-6 space-y-4 max-w-xl">
            <p className="text-xs text-pink-900/80 dark:text-pink-200/80 leading-relaxed">
              Enter your master encryption passphrase to decrypt your personal journal, emergency health notes, and confidential contacts.
            </p>

            <form onSubmit={handleUnlockVault} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter vault passphrase..."
                    value={vaultPassphrase}
                    onChange={e => setVaultPassphrase(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-[#16081A] text-sm text-pink-950 dark:text-white outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs shadow-pink-500/20 transition-colors"
                >
                  <Unlock className="w-4 h-4" /> Decrypt & Open Vault
                </button>
              </div>

              {storedEnvelope?.hint && (
                <div className="flex items-center gap-1.5 text-xs text-pink-700/70 dark:text-pink-300/70">
                  <HelpCircle className="w-3.5 h-3.5 text-pink-500" />
                  <span>Passphrase Hint: {storedEnvelope.hint}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-mono">
                Tip for testing: Try passphrase <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-600 font-bold">haven2026</code>
              </p>
            </form>
          </div>
        ) : (
          /* Vault Unlocked View */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Private Journal (Confidential Thoughts)
                </label>
                <textarea
                  value={vaultData.privateJournal}
                  onChange={e => setVaultData({ ...vaultData, privateJournal: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Personal & Emergency Notes (Health, Allergies)
                </label>
                <textarea
                  value={vaultData.personalNotes}
                  onChange={e => setVaultData({ ...vaultData, personalNotes: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Confidential Contact / Emergency Proxy
                </label>
                <input
                  type="text"
                  value={vaultData.confidentialContact}
                  onChange={e => setVaultData({ ...vaultData, confidentialContact: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Passphrase Recovery Hint
                </label>
                <input
                  type="text"
                  value={vaultData.encryptionKeyHint}
                  onChange={e => setVaultData({ ...vaultData, encryptionKeyHint: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Last encrypted: {new Date(vaultData.updatedAt).toLocaleString()}
              </span>

              <button
                type="button"
                onClick={handleSaveVault}
                disabled={isEncryptingVault}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                {isEncryptingVault ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Encrypting Payload...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save & Re-Encrypt Vault
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stories Authored by this User */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif-display font-bold text-pink-950 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            My Published Stories ({userStories.length})
          </h2>
          <span className="text-xs text-pink-700/70 dark:text-pink-300/70">
            Audio memoirs & photography
          </span>
        </div>

        {userStories.length === 0 ? (
          <div className="text-center py-12 bg-white/95 dark:bg-[#1E0B24]/95 rounded-3xl border border-pink-200/80 dark:border-pink-900/60 p-8 shadow-pink-glow">
            <Sparkles className="w-10 h-10 text-pink-300 dark:text-pink-700 mx-auto mb-3" />
            <p className="text-pink-950 dark:text-pink-100 text-sm font-medium">
              You haven't published any stories yet.
            </p>
            <p className="text-pink-700/70 dark:text-pink-300/70 text-xs mt-1">
              Share your audio memoir and photography in the Stories sanctuary tab.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {userStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                currentUser={currentUser}
                onToggleLike={onToggleLike}
                onAddComment={onAddComment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Worldwide Gender Selector Modal */}
      <GenderSelectorModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        currentGender={currentUser.gender || currentUser.aboutMyself?.gender}
        currentPronouns={currentUser.pronouns || currentUser.aboutMyself?.pronouns}
        currentVisibility={currentUser.genderVisibility || 'public'}
        onSave={handleGenderModalSave}
      />

      {/* Auth Modal for Sign-In, Email/Password, and Guest options */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserAuthenticated={(user) => {
          onSwitchUser?.(user.id);
        }}
      />
    </div>
  );
};
export default ProfileView;
