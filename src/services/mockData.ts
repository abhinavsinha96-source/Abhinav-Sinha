import { User, Story, DirectMessage, FriendRequest, AppNotification } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    handle: '@alex_pride',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Non-binary documentary artist, queer spoken-word essayist & chosen family chef in San Francisco. 🏳️‍🌈✨',
    gender: 'Non-Binary (Enby)',
    pronouns: 'they/them',
    genderVisibility: 'public',
    aboutMyself: {
      location: 'Castro District, San Francisco',
      occupation: 'Queer Archival Filmmaker & Poet',
      gender: 'Non-Binary (Enby)',
      pronouns: 'they/them',
      interests: ['Queer Ballroom', 'Spoken Memoirs', 'Analog Film', 'Pride History', 'Chosen Family Dinners'],
      lifePhilosophy: 'Queer joy is not just resistance; it is the softest, most radical celebration of being alive.',
      languages: ['English', 'Spanish']
    },
    audioIntro: {
      url: 'haven_audio_sample_intro_alex',
      durationSec: 28,
      title: 'Spoken Memoir: Finding light and chosen family in the Castro'
    },
    photos: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80'
    ],
    publicKeyFingerprint: '7A4F 9912 BC44 01FA ... ED90 4118',
    joinedDate: 'Joined Pride 2025',
    isOnline: true,
    friends: ['user_elena', 'user_marcus']
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    handle: '@elena_blush',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Lesbian ceramic artist & sapphic bookstore curator in Lisbon. Passionate about gentle ceramics & queer poetry. 🌸👭',
    gender: 'Woman / Female (Lesbian)',
    pronouns: 'she/her',
    genderVisibility: 'public',
    aboutMyself: {
      location: 'Lisbon & Barcelona',
      occupation: 'Queer Ceramicist & Studio Director',
      gender: 'Woman / Female (Lesbian)',
      pronouns: 'she/her',
      interests: ['Sapphic Poetry', 'Pastel Glazes', 'Queer Sanctuaries', 'Botanical Herbals'],
      lifePhilosophy: 'In our pottery studio, every piece is shaped with love that knows no shame.',
      languages: ['English', 'Portuguese', 'Catalan']
    },
    audioIntro: {
      url: 'haven_audio_sample_intro_elena',
      durationSec: 34,
      title: 'Audio Note: Morning light in our sapphic clay studio'
    },
    photos: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
    ],
    publicKeyFingerprint: '9B22 410A E890 331F ... 1288 9091',
    joinedDate: 'Joined June 2025',
    isOnline: true,
    friends: ['user_alex', 'user_marcus']
  },
  {
    id: 'user_marcus',
    name: 'Marcus Thorne',
    handle: '@marcus_proud',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Gay community advocate, botanical illustrator & queer choir singer in Edinburgh. Celebrating love out loud! 🌈✨',
    gender: 'Man / Male (Gay)',
    pronouns: 'he/him',
    genderVisibility: 'public',
    aboutMyself: {
      location: 'Edinburgh & Brighton',
      occupation: 'LGBTQIA+ Community Organizer & Botanist',
      gender: 'Man / Male (Gay)',
      pronouns: 'he/him',
      interests: ['Queer Choirs', 'Highland Flowers', 'Fountain Pen Love Notes', 'Gay Pride History'],
      lifePhilosophy: 'Hold your head high and your beloved closer. We paved this road with love.',
      languages: ['English', 'Gaelic']
    },
    audioIntro: {
      url: 'haven_audio_sample_intro_marcus',
      durationSec: 22,
      title: 'Spoken Love Letter: Singing with our Edinburgh Pride choir'
    },
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    publicKeyFingerprint: '38F9 1045 A198 8802 ... CC77 1249',
    joinedDate: 'Joined Pride 2025',
    isOnline: false,
    friends: ['user_alex', 'user_elena']
  },
  {
    id: 'user_maya',
    name: 'Maya Patel',
    handle: '@maya_sparkle',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Transgender woman, DJ, voguer & nightlife archivist. Curating safe dance spaces for queer & trans siblings. 🏳️‍⚧️💖',
    gender: 'Transgender Woman',
    pronouns: 'she/they',
    genderVisibility: 'public',
    aboutMyself: {
      location: 'London & New York',
      occupation: 'Trans DJ & Ballroom MC',
      gender: 'Transgender Woman',
      pronouns: 'she/they',
      interests: ['Ballroom Culture', 'Vogue Femme', 'Ambient Synth', 'Trans Joy & Resilience', 'Glitter Aesthetics'],
      lifePhilosophy: 'Never dim your shine for people who forgot how to sparkle. Trans lives are poetry.',
      languages: ['English', 'Gujarati', 'French']
    },
    audioIntro: {
      url: 'haven_audio_sample_intro_maya',
      durationSec: 41,
      title: 'Voice Note: The euphoria of walking my first ball'
    },
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    publicKeyFingerprint: '9921 EF80 4410 7823 ... BA11 0029',
    joinedDate: 'Joined Pride 2025',
    isOnline: true,
    friends: [] // Demonstrates friend request & chosen family kinship flow
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_1',
    authorId: 'user_alex',
    authorName: 'Alex Rivera',
    authorHandle: '@alex_pride',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Dancing in the Golden Light of Castro: How Chosen Family Saved Me 🏳️‍🌈',
    content: 'Growing up in a small conservative town, I spent years hiding my true self, whispering who I was into the dark. Five years ago today, I packed two bags and landed in San Francisco with trembling hands.\n\nWalking down Castro Street for the first time during Pride, surrounded by rainbow flags fluttering in the Pacific breeze and couples holding hands without fear, I cried tears of relief. That evening, Marcus and Elena invited me to their apartment for dinner. We cooked pasta, shared stories of our first crushes, and they held my hand and said: “You are home now.”\n\nFamily isn\'t just who you are born to. It is the brave souls who see your light, celebrate your colors, and say you never have to hide again.',
    timestamp: '2 hours ago',
    tags: ['Chosen Family', 'Pride', 'Queer Joy', 'Castro SF'],
    photoUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    audioClip: {
      url: 'haven_audio_sample_ridge',
      durationSec: 32,
      title: 'Spoken Memoir: The warmth of our first chosen family dinner'
    },
    privacy: 'public',
    likesCount: 38,
    isLiked: true,
    comments: [
      {
        id: 'c_1',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        text: 'I remember that night like it was yesterday, Alex! You are our forever family. 💖🏳️‍🌈',
        timestamp: '1 hour ago'
      },
      {
        id: 'c_2',
        authorId: 'user_marcus',
        authorName: 'Marcus Thorne',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        text: 'The pasta was slightly overcooked, but the love was 100% authentic! Proud of you always. 🌸',
        timestamp: '45m ago'
      }
    ],
    moderationStatus: 'approved',
    syncStatus: 'synced'
  },
  {
    id: 'story_2',
    authorId: 'user_elena',
    authorName: 'Elena Rostova',
    authorHandle: '@elena_blush',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    title: 'Rose Quartz & Sapphic Clay: Building a Queer Haven in Lisbon 🌸',
    content: 'In our ceramics studio on the hills of Lisbon, we intentionally mix pastel blush, lavender, and soft rose glazes. Many young queer women and non-binary folks come to our studio on Saturday mornings.\n\nThere is something magical about pressing your thumbs into cool clay while listening to gentle music. Nobody asks who you love or why you dress a certain way. You can wear your glitter, bring your girlfriend, drink mint tea, and make art without armor. Haven has given us the encrypted space to share these tender studio audio notes with friends around the world.',
    timestamp: '4 hours ago',
    tags: ['Sapphic Love', 'Queer Art', 'Ceramics', 'Soft Aesthetics'],
    photoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    audioClip: {
      url: 'haven_audio_sample_wheel',
      durationSec: 25,
      title: 'Studio Ambience: Throwing rose-tinted tea bowls with friends'
    },
    privacy: 'public',
    likesCount: 29,
    isLiked: false,
    comments: [
      {
        id: 'c_3',
        authorId: 'user_alex',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: 'The rose and lavender bowl you sent me sits right by my morning writing desk! ✨',
        timestamp: '2 hours ago'
      }
    ],
    moderationStatus: 'approved',
    syncStatus: 'synced'
  },
  {
    id: 'story_3',
    authorId: 'user_maya',
    authorName: 'Maya Patel',
    authorHandle: '@maya_sparkle',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Vogue Femme, Strobe Lights & The Unapologetic Power of Trans Joy 🏳️‍⚧️✨',
    content: 'When I stepped onto the ballroom floor in a custom fuchsia-and-pearl gown, my heart was racing at 140 BPM. The MC called my house name, the beat dropped, and for three minutes I wasn\'t merely surviving — I was soaring.\n\nTransgender joy is revolutionary. For centuries, society wanted us in shadows, but ballroom handed us diamonds and trophies. In this encrypted sanctuary of Haven, I love being able to record my raw thoughts right after a ball, free from trolls and algorithm feeds.',
    timestamp: 'Yesterday',
    tags: ['Trans Joy', 'Ballroom', 'Pride', 'Euphoria'],
    photoUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
    audioClip: {
      url: 'haven_audio_sample_rain',
      durationSec: 45,
      title: 'Live Audio Note: Ballroom beats & post-performance adrenaline'
    },
    privacy: 'public',
    likesCount: 52,
    isLiked: true,
    comments: [],
    moderationStatus: 'approved',
    syncStatus: 'synced'
  },
  {
    id: 'story_4',
    authorId: 'user_marcus',
    authorName: 'Marcus Thorne',
    authorHandle: '@marcus_proud',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Love Letters to My Partner Across the Heather Hills 🌈',
    content: 'Twenty years ago, when I realized I was gay in rural Aberdeenshire, there were no apps, no pride flags in windows. Love felt like a secret whispered into cold wool.\n\nToday, I write love letters with pink fountain pen ink on thick parchment to my fiancé Julian. He is down in London working on an environmental exhibit, and every night we send an end-to-end encrypted audio note on Haven. Hearing his voice before sleep is my greatest comfort.',
    timestamp: '2 days ago',
    tags: ['Gay Love', 'Queer Letters', 'Kinship', 'Poetry'],
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    audioClip: {
      url: 'haven_audio_sample_rain',
      durationSec: 36,
      title: 'Spoken Poetry: Evening wind & remembering your smile'
    },
    privacy: 'public',
    likesCount: 44,
    isLiked: false,
    comments: [],
    moderationStatus: 'approved',
    syncStatus: 'synced'
  }
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req_maya_to_alex',
    fromUserId: 'user_maya',
    toUserId: 'user_alex',
    fromUserName: 'Maya Patel',
    fromUserHandle: '@maya_sparkle',
    fromUserAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    timestamp: '15 minutes ago',
    status: 'pending'
  }
];

export const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'user_alex:user_elena',
    senderId: 'user_elena',
    recipientId: 'user_alex',
    text: 'Alex darling! I just finished glazing the pink and lavender tea set for our chosen family brunch next Sunday! 🌸☕',
    isEncrypted: true,
    timestamp: '10:14 AM',
    status: 'read'
  },
  {
    id: 'msg_2',
    conversationId: 'user_alex:user_elena',
    senderId: 'user_alex',
    recipientId: 'user_elena',
    text: 'Elena! It looks absolutely divine. I recorded a 30-second spoken intro about what chosen family means to me for our gathering. Sending it over encrypted!',
    isEncrypted: true,
    audioAttachment: {
      url: 'haven_audio_sample_voice_alex',
      durationSec: 14
    },
    timestamp: '10:18 AM',
    status: 'read'
  },
  {
    id: 'msg_3',
    conversationId: 'user_alex:user_elena',
    senderId: 'user_elena',
    recipientId: 'user_alex',
    text: 'Your voice note brought happy tears to my eyes. Love you so much sibling! See you on Sunday! 💖🏳️‍🌈',
    isEncrypted: true,
    photoAttachment: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    timestamp: '10:22 AM',
    status: 'delivered'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'friend_request',
    title: 'Chosen Family Kinship Request',
    message: 'Maya Patel (@maya_sparkle 🏳️‍⚧️) sent you a chosen family request to unlock encrypted direct messaging.',
    timestamp: '15m ago',
    isRead: false,
    linkTab: 'friends',
    actorId: 'user_maya'
  },
  {
    id: 'notif_2',
    type: 'direct_message',
    title: '💖 Encrypted Message from Elena',
    message: 'Elena sent a photo and voice note in your end-to-end encrypted kinship channel.',
    timestamp: '35m ago',
    isRead: false,
    linkTab: 'messages',
    actorId: 'user_elena'
  },
  {
    id: 'notif_3',
    type: 'story_like',
    title: 'Memoir Celebrated',
    message: 'Elena Rostova celebrated your memoir "Dancing in the Golden Light of Castro".',
    timestamp: '1h ago',
    isRead: true,
    linkTab: 'stories'
  }
];
