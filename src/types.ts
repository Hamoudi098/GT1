export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  description: string;
  hashtags: string[];
  soundName: string;
  soundAvatar: string;
  videoUrl?: string;
  fallbackBg: string; // Tailwind gradient fallback classes
  likes: number;
  comments: Comment[];
  shares: number;
  isAd: boolean;
  campaignId?: string;
  ctaText?: string;
  ctaUrl?: string;
  likedByUser?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  category: string;
  dailyBudget: number;
  spent: number;
  targetAudience: string;
  videoPreset: string; // 'beauty' | 'tech' | 'food' | 'gaming' | 'fashion'
  views: number;
  clicks: number;
  conversions: number;
  isActive: boolean;
  createdAt: string;
}

export const VIDEO_PRESETS = [
  { id: 'fashion', label: 'Noir Fashion & Youth', bgColor: 'from-neutral-950 via-neutral-900 to-neutral-800', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-taking-selfies-on-her-smartphone-41618-large.mp4' },
  { id: 'sports', label: 'Monochrome Street skating', bgColor: 'from-neutral-900 via-neutral-800 to-neutral-950', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-skating-on-a-sunny-day-42043-large.mp4' },
  { id: 'tech', label: 'Sleek Obsidian App', bgColor: 'from-neutral-800 via-neutral-950 to-black', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-displaying-a-crypto-app-43180-large.mp4' },
  { id: 'lifestyle', label: 'Minimalist Package Unboxing', bgColor: 'from-neutral-900 via-neutral-700 to-neutral-950', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-opening-a-packaged-delivery-39872-large.mp4' },
];
