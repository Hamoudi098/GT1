import { Post, Campaign } from './types';

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Elena Rostova - Haute Couture Runway',
    description: 'International high-fashion model Elena Rostova is available for exclusive brand ambassadorship and boutique luxury catwalks.',
    ctaText: 'Pesan Sekarang',
    ctaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    category: 'Fashion Model',
    dailyBudget: 500000,
    spent: 0,
    targetAudience: 'Fashion Designers, Haute Couture Houses, Luxury Brands',
    videoPreset: 'fashion',
    views: 4520,
    clicks: 684,
    conversions: 18,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'camp_2',
    name: 'Marcus Chen - Street & Sports Activewear',
    description: 'Premium fitness and urban athletic wear model, ready to shoot for global activewear campaigns and athletic digital ads.',
    ctaText: 'Pelajari Selengkapnya',
    ctaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    category: 'Sports Model',
    dailyBudget: 350000,
    spent: 0,
    targetAudience: 'Activewear Agencies, Sports Brands, Gym Campaigns',
    videoPreset: 'sports',
    views: 3120,
    clicks: 412,
    conversions: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_ORGANIC_POSTS: Post[] = [
  {
    id: 'org_1',
    username: 'sofia_runway',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    description: 'Behind-the-scenes walk at Milan Milan Fashion Week! Wearing structured dark-mesh textures or tailoring. rate this look! ✨👠',
    hashtags: ['milanfashionweek', 'runwaymodel', 'highfashion', 'bts_shoot'],
    soundName: 'Haute Couture Instrumental - FashionVibe',
    soundAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-taking-selfies-on-her-smartphone-41618-large.mp4',
    fallbackBg: 'from-neutral-950 via-neutral-900 to-neutral-800',
    likes: 245900,
    comments: [
      {
        id: 'c_1',
        username: 'vogue_enthusiast',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
        text: 'The silhouette and movement are absolutely breathtaking, pure elegance!',
        timestamp: '1 jam lalu',
        likes: 142
      },
      {
        id: 'c_2',
        username: 'designer_clara',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        text: 'Would love to collaborate for our upcoming autumn catalog shoot.',
        timestamp: '3 jam lalu',
        likes: 98
      }
    ],
    shares: 8850,
    isAd: false,
  },
  {
    id: 'org_2',
    username: 'lucas_editorial',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    description: 'New editorial studio polaroids captured under monochrome lowkey lighting setup. Finding that perfect pose 📸🖤',
    hashtags: ['modelpolaroids', 'editorialshoot', 'monochrome', 'agencybook'],
    soundName: 'Lofi Midnight Beats - StudioZone',
    soundAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=40&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-skating-on-a-sunny-day-42043-large.mp4',
    fallbackBg: 'from-neutral-900 via-neutral-850 to-neutral-950',
    likes: 172300,
    comments: [
      {
        id: 'c_3',
        username: 'casting_director_jk',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        text: 'Send your portfolio to our active casting email! Great jawline.',
        timestamp: '5 jam lalu',
        likes: 231
      },
      {
        id: 'c_4',
        username: 'stella_stylist',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        text: 'This style suits your posture so perfectly.',
        timestamp: '8 jam lalu',
        likes: 45
      }
    ],
    shares: 4120,
    isAd: false,
  }
];
