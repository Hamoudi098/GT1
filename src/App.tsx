import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, Campaign, VIDEO_PRESETS } from './types';
import { INITIAL_ORGANIC_POSTS, INITIAL_CAMPAIGNS } from './data';
import { TRANSLATIONS, LANGUAGES, LanguageValue } from './translations';
import TikTokFeed from './components/TikTokFeed';
import CampaignManager from './components/CampaignManager';
import { Tv, Sparkles, Layers, Sliders, Play, Smartphone, BarChart3, Radio, Globe, Zap } from 'lucide-react';

export default function App() {
  // Navigation Layout Tabs
  // 'dual' (sideby-side simulator) | 'viewer' (just TikTok phone) | 'studio' (just Ad dashboard)
  const [activeTab, setActiveTab] = useState<'dual' | 'viewer' | 'studio'>('dual');

  // High Refresh Rate state (144 Hz)
  const [is144Hz, setIs144Hz] = useState<boolean>(true);

  // Multi-Language localization state
  const [lang, setLang] = useState<LanguageValue>('ar');
  const t = TRANSLATIONS[lang];

  // Core App states
  const [organicPosts, setOrganicPosts] = useState<Post[]>(INITIAL_ORGANIC_POSTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [activePostIndex, setActivePostIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global Toast notifier
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Dynamic Ad Insertion Engine
  // Interleaves organic trending posts with advertiser's active campaigns
  const allPosts = useMemo(() => {
    const list: Post[] = [];
    let oIdx = 0;
    let cIdx = 0;
    const activeCampaigns = campaigns.filter((c) => c.isActive);

    // Alternate posts:
    // 1st Organic, 1st Ad, 2nd Organic, 2nd Ad, then rest of organic & ads
    while (oIdx < organicPosts.length || cIdx < activeCampaigns.length) {
      if (oIdx < organicPosts.length) {
        list.push(organicPosts[oIdx]);
        oIdx++;
      }
      if (cIdx < activeCampaigns.length) {
        const camp = activeCampaigns[cIdx];
        const preset = VIDEO_PRESETS.find((p) => p.id === camp.videoPreset) || VIDEO_PRESETS[0];

        list.push({
          id: `ad_${camp.id}`,
          username: camp.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') + '_promo',
          avatar: `https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=150&q=80`,
          description: camp.description,
          hashtags: [camp.category.toLowerCase(), 'discount', 'gt1', 'sponsored'],
          soundName: `Sponsor Music - ${camp.name}`,
          soundAvatar: `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=40&q=80`,
          videoUrl: preset.videoUrl,
          fallbackBg: preset.bgColor,
          likes: Math.max(12, Math.floor(camp.views * 0.15) + camp.clicks * 2), // derived simulated likes
          comments: [
            {
              id: `ad_cmt_init_${camp.id}`,
              username: 'gt1_community',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
              text: 'Wah, keliatan menarik nih promonya! Kepo pengen liat detailnya.',
              timestamp: 'Baru saja',
              likes: 18,
            },
          ],
          shares: Math.floor(camp.views * 0.05),
          isAd: true,
          campaignId: camp.id,
          ctaText: camp.ctaText,
          ctaUrl: camp.ctaUrl,
        });
        cIdx++;
      }
    }
    return list;
  }, [organicPosts, campaigns]);

  // 2. Interactive user actions
  const handleLike = (postId: string) => {
    // If it is organic post
    if (!postId.startsWith('ad_')) {
      setOrganicPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const liked = !post.likedByUser;
            return {
              ...post,
              likedByUser: liked,
              likes: liked ? post.likes + 1 : post.likes - 1,
            };
          }
          return post;
        })
      );
    } else {
      // If it is an ad, we can simulate an ad engagement click or visual heart,
      // and we dynamically update derived likes directly in useMemo via views/clicks,
      // let's play a simple toast
      triggerToast('Iklan disukai! Menambah skor relevansi kampanye.');
    }
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const newComment = {
      id: `cmt_${Date.now()}`,
      username: 'anda_penonton',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      text: commentText,
      timestamp: '1 dtk lalu',
      likes: 0,
    };

    if (!postId.startsWith('ad_')) {
      setOrganicPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [newComment, ...p.comments],
            };
          }
          return p;
        })
      );
    } else {
      // For ad comments, since they are derived, we can mock adding comment
      // or append to the campaign statistics for an interactive preview
      triggerToast('Komentar sponsor terkirim! Meningkatkan keterlibatan pengiklan.');
    }
  };

  // Increment ad views
  const handleAdClick = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            views: c.views + 1,
          };
        }
        return c;
      })
    );
  };

  // Click landing CTA / checkout conversion
  const handleAdCTA = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            clicks: c.clicks + 1,
          };
        }
        return c;
      })
    );
    triggerToast('Simulasi klik CTA Berhasil! Pengunjung diarahkan ke Landing Page Toko.');
  };

  // Convert order inside target landing store
  const handleAdConversion = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            conversions: c.conversions + 1,
          };
        }
        return c;
      })
    );
    triggerToast('🎯 Simulasi Konversi Sukses! 1 Penjualan tercatat di Dashboard.');
  };

  // 3. Advertiser Studio handlers
  const handleCreateCampaign = (newCamp: Partial<Campaign>) => {
    const campaignId = `camp_${Date.now()}`;
    const freshCampaign: Campaign = {
      id: campaignId,
      name: newCamp.name || 'Kampanye Iklan Baru',
      description: newCamp.description || '',
      ctaText: newCamp.ctaText || 'Beli Sekarang',
      ctaUrl: newCamp.ctaUrl || 'https://github.com',
      category: newCamp.category || 'Tech',
      dailyBudget: newCamp.dailyBudget || 100000,
      spent: 0,
      targetAudience: newCamp.targetAudience || 'Pengguna Umum',
      videoPreset: newCamp.videoPreset || 'fashion',
      views: 0,
      clicks: 0,
      conversions: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [freshCampaign, ...prev]);
    triggerToast('🎉 Kampanye berhasil diaktifkan dan dimasukkan ke sela feed TikTok!');
  };

  const handleToggleCampaignActive = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isActive;
          triggerToast(nextState ? 'Kampanye diaktifkan!' : 'Kampanye dijeda sementara.');
          return { ...c, isActive: nextState };
        }
        return c;
      })
    );
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    triggerToast('Kampanye berhasil dihapus dari sistem.');
  };

  // 4. Advanced Traffic Simulator
  // Automatically updates views, clicks, and conversions on active campaigns
  // simulating organic swipes and interactions by 15 mock web viewers.
  const handleSimulateTraffic = () => {
    triggerToast('🚀 Memulai simulasi traffic penonton TikTok (swipes & clicks)...');
    
    // Simulate multiple small increments over 2 seconds to make it look live
    let runs = 0;
    const interval = setInterval(() => {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (!c.isActive) return c;
          
          // Generate realistic spikes
          const viewsDelta = Math.floor(Math.random() * 8) + 4; // 4 to 11 views
          // Calculate clicks using realistic CTR (e.g. 5% - 15%)
          const clicksDelta = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0;
          // Calculate conversions as safe percentage of clicks
          const conversionsDelta = clicksDelta > 0 && Math.random() > 0.7 ? 1 : 0;

          return {
            ...c,
            views: c.views + viewsDelta,
            clicks: c.clicks + clicksDelta,
            conversions: c.conversions + conversionsDelta,
          };
        })
      );
      
      runs++;
      if (runs >= 5) {
        clearInterval(interval);
        triggerToast('✅ Simulasi penonton aktif selesai! Data laporan diupdate.');
      }
    }, 450);
  };

  // Ensure index remains in bounds if list reconstructs
  const safeActiveIndex = Math.min(activePostIndex, Math.max(0, allPosts.length - 1));

  return (
    <div id="app-root-container" className="min-h-screen bg-neutral-950 font-sans text-neutral-100 flex flex-col antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black select-none">
      
      {/* Toast Notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-55 bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-700/60 text-white rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-md flex items-center space-x-3 text-xs font-semibold select-none text-center"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header navigation */}
      <header className="border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-lg sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-neutral-700 flex items-center justify-center shadow-md">
              <span className="font-sans font-black text-xs text-neutral-950 tracking-tighter">
                GT1
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-extrabold text-white tracking-tight">
                  {t.appName}
                </h1>
                <span className="text-[9px] bg-white text-neutral-950 border border-neutral-200 py-0.5 px-2 rounded-full font-black uppercase">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Action Zone: Layout Tabs & Language Selection list */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* View Toggles Tab Buttons */}
            <div className="bg-neutral-900 p-1 rounded-2xl border border-neutral-800 flex items-center space-x-1 w-full sm:w-auto justify-center">
              <button
                id="layout-tab-dual"
                onClick={() => setActiveTab('dual')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dual'
                    ? 'bg-white text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.dualTab}</span>
              </button>
              <button
                id="layout-tab-viewer"
                onClick={() => setActiveTab('viewer')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'viewer'
                    ? 'bg-white text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.viewerTab}</span>
              </button>
              <button
                id="layout-tab-studio"
                onClick={() => setActiveTab('studio')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'studio'
                    ? 'bg-white text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t.studioTab}</span>
              </button>
            </div>

            {/* 144 Hz Mode Toggle Button */}
            <button
              id="hz-mode-toggle"
              onClick={() => {
                const nextState = !is144Hz;
                setIs144Hz(nextState);
                triggerToast(nextState ? '⚡ 144 Hz Ultra-Smooth Refresh Rate enabled!' : '🐢 60 Hz Standard Mode active.');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border w-full sm:w-auto justify-center cursor-pointer ${
                is144Hz
                  ? 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-400 border-white/5'
              }`}
              title="Toggle Refresh Rate: 144 Hz vs 60 Hz"
            >
              <Zap className={`w-3.5 h-3.5 ${is144Hz ? 'text-emerald-400 animate-bounce' : 'text-neutral-500'}`} style={{ animationDuration: '1s' }} />
              <span className="font-mono">{is144Hz ? '144 Hz Mode' : '60 Hz Mode'}</span>
            </button>

            {/* Premium Language Down-list Selector (transparent glassmorphism) */}
            <div className="flex items-center space-x-2 bg-neutral-900/95 border border-white/10 px-3 py-1.5 rounded-2xl w-full sm:w-auto justify-center text-xs">
              <Globe className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
              <select
                id="language-selector"
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value as LanguageValue);
                  triggerToast(`Language switched to ${LANGUAGES.find(l => l.code === e.target.value)?.name}!`);
                }}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                {LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-neutral-950 text-white font-sans font-medium text-xs">
                    {item.flag} {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col justify-center">
        
        {/* Responsive Content switch blocks */}
        <div className="w-full">
          {activeTab === 'dual' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column: Emulator TikTok Viewport */}
              <div className="xl:col-span-5 flex flex-col items-center space-y-4">
                <div className="sticky top-28 flex flex-col items-center space-y-3">
                  <div className="flex items-center space-x-2 text-neutral-400 font-sans text-xs uppercase tracking-wider mb-1">
                    <Smartphone className="w-3.5 h-3.5 text-red-500" />
                    <span>{t.feedHint}</span>
                  </div>
                  
                  <TikTokFeed
                    posts={allPosts}
                    activePostIndex={safeActiveIndex}
                    setActivePostIndex={setActivePostIndex}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    onAdClick={handleAdClick}
                    onAdConversion={handleAdConversion}
                    t={t}
                    is144Hz={is144Hz}
                    lang={lang}
                  />
                  
                  <p className="text-[10px] text-neutral-500 text-center max-w-[300px]">
                    {t.doubleTapHint}
                  </p>
                </div>
              </div>

              {/* Right Column: Campaigns and Studio Panel */}
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-neutral-950/20 backdrop-blur-sm p-2 rounded-[32px]">
                  <CampaignManager
                    campaigns={campaigns}
                    onCreateCampaign={handleCreateCampaign}
                    onToggleCampaignActive={handleToggleCampaignActive}
                    onDeleteCampaign={handleDeleteCampaign}
                    onSimulateTraffic={handleSimulateTraffic}
                    t={t}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viewer' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="flex items-center space-x-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{t.viewerTab}</span>
              </div>
              
              <TikTokFeed
                posts={allPosts}
                activePostIndex={safeActiveIndex}
                setActivePostIndex={setActivePostIndex}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onAdClick={handleAdClick}
                onAdConversion={handleAdConversion}
                t={t}
                is144Hz={is144Hz}
                lang={lang}
              />
              
              <p className="text-[10px] text-neutral-600 text-center max-w-sm">
                {t.doubleTapHint}
              </p>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="max-w-4xl mx-auto py-4">
              <div className="flex items-center space-x-2 text-neutral-400 text-xs font-bold uppercase tracking-widest mb-6 justify-center">
                <Tv className="w-4 h-4 text-emerald-400" />
                <span>{t.studioTab}</span>
              </div>
              
              <CampaignManager
                campaigns={campaigns}
                onCreateCampaign={handleCreateCampaign}
                onToggleCampaignActive={handleToggleCampaignActive}
                onDeleteCampaign={handleDeleteCampaign}
                onSimulateTraffic={handleSimulateTraffic}
                t={t}
              />
            </div>
          )}
        </div>
      </main>

      {/* Aesthetic Footer rail and info */}
      <footer className="border-t border-neutral-850 bg-neutral-950 py-5 text-center text-[10px] text-neutral-500 font-mono tracking-normal leading-relaxed mt-auto">
        <p>© 2026 GT1 Studio Inc. Built using React, Tailwind CSS, & Motion layout components.</p>
        <p className="text-[9px] text-neutral-600 mt-1">This application simulates dynamic organic views, user actions, and conversion pipelines for advertising dashboards.</p>
      </footer>
    </div>
  );
}
