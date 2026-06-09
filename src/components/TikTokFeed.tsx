import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Music, ShoppingBag, Volume2, VolumeX, Send, Plus, Check, Play, Pause, ChevronUp, ChevronDown, Zap, Settings } from 'lucide-react';
import { Post, Comment } from '../types';
import { TranslationDictionary } from '../translations';

interface TikTokFeedProps {
  posts: Post[];
  activePostIndex: number;
  setActivePostIndex: (index: number) => void;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAdClick: (campaignId: string) => void;
  onAdConversion: (campaignId: string) => void;
  t: TranslationDictionary;
  is144Hz: boolean;
  lang?: string;
}

export default function TikTokFeed({
  posts,
  activePostIndex,
  setActivePostIndex,
  onLike,
  onAddComment,
  onAdClick,
  onAdConversion,
  t,
  is144Hz,
  lang = 'ar',
}: TikTokFeedProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [showShareFor, setShowShareFor] = useState<string | null>(null);
  const [showCampaignLandingFor, setShowCampaignLandingFor] = useState<Post | null>(null);
  const [followState, setFollowState] = useState<Record<string, boolean>>({});
  const [likedAnim, setLikedAnim] = useState<{ id: number; x: number; y: number }[]>([]);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Advanced TikTok preference settings
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(true);
  const [loopVideo, setLoopVideo] = useState<boolean>(true);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [videoFilters, setVideoFilters] = useState<string>('normal');
  const [doubleTapToLike, setDoubleTapToLike] = useState<boolean>(true);
  const [simulateDataSaver, setSimulateDataSaver] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Captions word chunk state
  const [captionWordIndex, setCaptionWordIndex] = useState<number>(0);

  // High rate screen performance simulation telemetry
  const [fps, setFps] = useState<number>(144);
  const [frameTime, setFrameTime] = useState<number>(6.94);

  // Dynamic frame telemetry loop
  useEffect(() => {
    let active = true;
    const updateRate = () => {
      if (!active) return;
      const baseHz = is144Hz ? 144 : 60;
      const variation = (Math.random() - 0.5) * 0.4;
      const currentFps = parseFloat((baseHz + variation).toFixed(1));
      setFps(currentFps);
      setFrameTime(parseFloat((1000 / currentFps).toFixed(2)));
      setTimeout(updateRate, is144Hz ? 180 : 400);
    };
    updateRate();
    return () => {
      active = false;
    };
  }, [is144Hz]);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const currentPost = posts[activePostIndex];

  // Filters mapping
  const getFilterClass = () => {
    switch (videoFilters) {
      case 'retro':
        return 'sepia brightness-95 contrast-105 saturate-110 hue-rotate-15';
      case 'cyber':
        return 'contrast-125 saturate-150 brightness-90 hue-rotate-[220deg]';
      case 'noir':
        return 'grayscale brightness-90 contrast-125';
      case 'dreamy':
        return 'blur-[0.5px] saturate-125 brightness-110 contrast-105';
      case 'normal':
      default:
        return '';
    }
  };

  const filterClass = `${getFilterClass()} ${simulateDataSaver ? 'blur-[1.2px] contrast-[0.9] saturate-75' : ''}`;

  // Auto Captions dynamic generator
  const captionChunks = currentPost?.description?.split(' ') || [];
  useEffect(() => {
    setCaptionWordIndex(0);
  }, [activePostIndex]);

  useEffect(() => {
    if (!showCaptions || captionChunks.length === 0 || !isPlaying) return;
    const interval = setInterval(() => {
      setCaptionWordIndex((prev) => (prev + 2 >= captionChunks.length ? 0 : prev + 2));
    }, 1600);
    return () => clearInterval(interval);
  }, [showCaptions, currentPost, isPlaying, captionChunks.length]);

  const activeCaption = captionChunks.slice(captionWordIndex, captionWordIndex + 2).join(' ');

  // Control video play/pause on post change
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const vid = videoRefs.current[id];
      if (vid) {
        if (id === currentPost?.id && isPlaying) {
          vid.play().catch(() => {});
          vid.playbackRate = playbackSpeed;
        } else {
          vid.pause();
        }
      }
    });

    // Automatically trigger visual ad view count increment when an ad comes into focus
    if (currentPost?.isAd && currentPost.campaignId) {
      // Simulate slight delay to represent natural visual stay/view
      const timer = setTimeout(() => {
        // Trigger view tracking callback
        onAdClick(currentPost.campaignId!); // First triggers a view; we handle views in App.tsx dynamically
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activePostIndex, isPlaying, posts]);

  // Sync volume state to active video
  useEffect(() => {
    const vid = videoRefs.current[currentPost?.id];
    if (vid) {
      vid.muted = isMuted;
    }
  }, [isMuted, activePostIndex]);

  // Playback Rate changes Live Sync
  useEffect(() => {
    const vid = videoRefs.current[currentPost?.id];
    if (vid) {
      vid.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, activePostIndex, isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCommentsFor !== null || showCampaignLandingFor !== null || showSettingsModal) return;
      if (e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePostIndex, isPlaying, showCommentsFor, showCampaignLandingFor, showSettingsModal]);

  const handleNext = () => {
    if (activePostIndex < posts.length - 1) {
      setActivePostIndex(activePostIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (activePostIndex > 0) {
      setActivePostIndex(activePostIndex - 1);
      setIsPlaying(true);
    }
  };

  // Video Ended callback
  const handleVideoFinished = () => {
    if (autoplayEnabled) {
      if (activePostIndex < posts.length - 1) {
        handleNext();
      } else {
        // Return to start
        setActivePostIndex(0);
        setIsPlaying(true);
      }
    } else {
      // Replay
      const vid = videoRefs.current[currentPost?.id];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  };

  // Capture double taps / double clicks for like action
  const lastTapRef = useRef<number>(0);
  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (doubleTapToLike && (now - lastTapRef.current < DOUBLE_PRESS_DELAY)) {
      // Is double click/tap
      onLike(currentPost.id);
      
      // Spawn floating heart
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setLikedAnim((prev) => [...prev, { id: Date.now(), x, y }]);
      setTimeout(() => {
        setLikedAnim((prev) => prev.filter((item) => Date.now() - item.id < 1000));
      }, 1000);
    } else if (!doubleTapToLike || (now - lastTapRef.current >= DOUBLE_PRESS_DELAY)) {
      // Is single click/tap (toggle play/pause)
      setIsPlaying(!isPlaying);
    }
    lastTapRef.current = now;
  };

  const handleFollowToggle = (username: string) => {
    setFollowState((prev) => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handleShareClick = (p: Post) => {
    setShowShareFor(p.id);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(currentPost.id, commentInput.trim());
    setCommentInput('');
  };

  // Handle mock purchase / lead capture in the Ad Landing Modal
  const handleInitiateOrder = () => {
    setOrderProcessing(true);
    setTimeout(() => {
      setOrderProcessing(false);
      setOrderSuccess(true);
      if (currentPost.campaignId) {
        onAdConversion(currentPost.campaignId);
      }
    }, 1500);
  };

  const resetOrderModal = () => {
    setShowCampaignLandingFor(null);
    setOrderSuccess(false);
    setOrderQuantity(1);
    setOrderProcessing(false);
  };

  return (
    <div className="w-full max-w-[420px] aspect-[9/18] h-[780px] bg-neutral-950 border border-neutral-800 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col items-center ring-[12px] ring-neutral-900 justify-center">
      {/* Phone Notch */}
      <div className="absolute top-2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center space-x-1 border-b border-neutral-800 pointer-events-none">
        <div className="w-2.5 h-2.5 bg-neutral-850 rounded-full"></div>
        <div className="w-12 h-1 bg-neutral-850 rounded-full"></div>
      </div>

      {/* Screen Interface */}
      <div className="w-full h-full relative overflow-hidden flex flex-col bg-black">
        {/* Top Header controls */}
        <div className="absolute top-10 left-0 right-0 z-30 flex justify-between items-center px-6 text-white pointer-events-none">
          <div className="flex items-center space-x-1 bg-black/40 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-tight border border-white/10 select-none">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0"></span>
            <span className="font-bold">LIVE</span>
            {simulateDataSaver && (
              <span className="text-[7px] text-amber-400 bg-amber-400/10 border border-amber-500/20 px-1 py-0.2 rounded font-mono shrink-0">480p</span>
            )}
            {playbackSpeed !== 1.0 && (
              <span className="text-[7px] text-sky-450 bg-sky-400/10 border border-sky-500/20 px-1 py-0.2 rounded font-mono shrink-0">{playbackSpeed}x</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1.5 pointer-events-auto">
            {/* FPS and Frame Times Diagnostic badge */}
            <div id="fps-diagnostic-badge" className={`hidden flex-col items-end px-2 py-0.5 rounded-xl bg-black/60 backdrop-blur-md border font-mono text-[8px] font-bold select-none leading-none justify-center ${is144Hz ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-neutral-400'}`}>
              <div className="flex items-center space-x-1">
                <span className={`w-1 h-1 rounded-full ${is144Hz ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                <span>{fps} FPS</span>
              </div>
              <span className="text-[6.5px] text-neutral-500 mt-0.5">{frameTime} ms</span>
            </div>

            <button
              id="volume-toggle-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/10 text-white transition-all duration-200"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              id="tiktok-settings-trigger-btn"
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-full bg-gradient-to-tr from-rose-600/30 to-violet-600/35 backdrop-blur-md hover:scale-105 active:scale-95 border border-white/15 text-white transition-all duration-200"
              title="TikTok Settings"
            >
              <Settings className="w-3.5 h-3.5 text-white animate-spin-slow" style={{ animationDuration: '8s' }} />
            </button>
          </div>
        </div>

        {/* Swipe Animation Holder */}
        <div ref={containerRef} className="w-full h-full relative cursor-pointer">
          <AnimatePresence mode="wait">
            {currentPost && (
              <motion.div
                key={currentPost.id}
                initial={{ y: 200, opacity: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -200, opacity: 0.8 }}
                transition={is144Hz ? { type: 'spring', damping: 14, stiffness: 420 } : { type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full h-full relative flex flex-col justify-between"
                onClick={handleVideoAreaClick}
                id={`post-slide-${currentPost.id}`}
              >
                {/* Background Video or Beautiful CSS Pattern Fallback */}
                <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center overflow-hidden z-0">
                  {currentPost.videoUrl ? (
                    <video
                      id={`video-player-${currentPost.id}`}
                      ref={(el) => (videoRefs.current[currentPost.id] = el)}
                      src={currentPost.videoUrl}
                      className={`w-full h-full object-cover transition-all duration-300 ${filterClass}`}
                      loop={loopVideo}
                      muted={isMuted}
                      onEnded={handleVideoFinished}
                      playsInline
                      autoPlay={isPlaying}
                      onError={(e) => {
                        console.log("Video source load failed, displaying canvas backup gradient pattern.");
                        // Force hide video to let gradient display
                        const videoEl = e.currentTarget;
                        videoEl.style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* High Quality Backdrop Fallback Gradient Animation */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${currentPost.fallbackBg} opacity-80 mix-blend-multiply flex flex-col justify-center items-center p-8 text-center transition-all duration-300 ${filterClass}`}
                  >
                    {!currentPost.videoUrl && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto border border-white/10 backdrop-blur-sm shadow-xl">
                          <ShoppingBag className="w-8 h-8 text-white animate-bounce" />
                        </div>
                        <p className="font-mono text-xs text-white/50 tracking-wider">PRESET PLAYBACK ACTIVE</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10 pointer-events-none" />

                {/* Pause Cover Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 z-20 transition-all pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-md">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Double click Tap Flying Hearts */}
                {likedAnim.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ scale: 0, opacity: 1, y: heart.y, x: heart.x }}
                    animate={{ scale: [1, 1.4, 0.8], opacity: [1, 1, 0], y: heart.y - 120 }}
                    transition={{ duration: is144Hz ? 0.45 : 0.8, ease: 'easeOut' }}
                    className="absolute z-30 pointer-events-none"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    <Heart className="w-16 h-16 text-red-500 fill-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  </motion.div>
                ))}

                {/* Vertical Navigator Chevrons (Desktop Helper Overlay) */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-25 flex flex-col space-y-2">
                  <button
                    id="prev-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    disabled={activePostIndex === 0}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white leading-none border border-white/10 disabled:opacity-20 z-10 pointer-events-auto shadow-lg"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    id="next-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    disabled={activePostIndex === posts.length - 1}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white leading-none border border-white/10 disabled:opacity-20 z-10 pointer-events-auto shadow-lg"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Top/Middle View: Spacer */}
                <div className="h-20" />

                {/* Side Action Panel & Bottom Info Grid */}
                <div className="flex w-full items-end justify-between px-3 pb-4 relative z-20">
                  {/* Left Bottom Data */}
                  <div className="flex-1 pr-6 flex flex-col text-white select-none">
                    <span className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm self-start px-2 py-0.5 rounded-md text-[10px] text-white font-bold border border-white/30 mb-1">
                      {currentPost.isAd ? t.sponsoredTag.toUpperCase() : t.organicTag.toUpperCase()}
                    </span>
 
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="font-bold text-sm tracking-tight">@{currentPost.username}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(currentPost.username);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-200 pointer-events-auto ${
                          followState[currentPost.username]
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-white text-black hover:bg-neutral-200'
                        }`}
                      >
                        {followState[currentPost.username] ? <span className="flex items-center"><Check className="w-3 h-3 mr-0.5" /> {t.followingLabel}</span> : t.followLabel}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-100 mb-2 leading-relaxed line-clamp-3">
                      {currentPost.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {currentPost.hashtags.map((tag) => (
                        <span key={tag} className="text-xs font-semibold text-sky-400 hover:underline">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-neutral-300 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full self-start max-w-[200px] overflow-hidden">
                      <Music className="w-3.5 h-3.5 text-neutral-400 shrink-0 animate-spin" style={{ animationDuration: is144Hz ? '2s' : '6s' }} />
                      <span className="truncate whitespace-nowrap">{currentPost.soundName}</span>
                    </div>
                  </div>

                  {/* Right Side Control Bar */}
                  <div className="flex flex-col items-center space-y-4 shrink-0 text-white select-none pointer-events-auto">
                    {/* Creator Avatar with mini follow plus */}
                    <div className="relative mb-2">
                      <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg bg-neutral-900">
                        <img src={currentPost.avatar} alt={currentPost.username} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      {!followState[currentPost.username] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(currentPost.username);
                          }}
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 text-black hover:scale-110 active:scale-95 transition-transform border border-neutral-300"
                        >
                          <Plus className="w-3 h-3 font-black" />
                        </button>
                      )}
                    </div>

                    {/* Like button */}
                    <button
                      id={`like-btn-${currentPost.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(currentPost.id);
                      }}
                      className="flex flex-col items-center group active:scale-90 transition-transform duration-100"
                    >
                      <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                        <Heart
                          className={`w-6 h-6 transition-colors ${
                            currentPost.likedByUser ? 'text-red-500 fill-red-500 scale-110' : 'text-neutral-200'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold mt-1 tracking-tight">
                        {currentPost.likes >= 1000 ? `${(currentPost.likes / 1000).toFixed(1)}k` : currentPost.likes}
                      </span>
                    </button>

                    {/* Comments button */}
                    <button
                      id={`comment-btn-${currentPost.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCommentsFor(currentPost.id);
                      }}
                      className="flex flex-col items-center group"
                    >
                      <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                        <MessageCircle className="w-6 h-6 text-neutral-200" />
                      </div>
                      <span className="text-[11px] font-semibold mt-1 tracking-tight">
                        {currentPost.comments.length}
                      </span>
                    </button>

                    {/* Share button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareClick(currentPost);
                      }}
                      className="flex flex-col items-center group"
                    >
                      <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                        <Share2 className="w-6 h-6 text-neutral-200" />
                      </div>
                      <span className="text-[11px] font-semibold mt-1 tracking-tight">
                        {currentPost.shares >= 1000 ? `${(currentPost.shares / 1000).toFixed(1)}k` : currentPost.shares}
                      </span>
                    </button>

                    {/* Spinning disk track */}
                    <div className={`w-9 h-9 rounded-full bg-neutral-900 border-4 flex items-center justify-center animate-spin transition-colors duration-300 ${is144Hz ? 'border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-neutral-700/60'}`} style={{ animationDuration: is144Hz ? '1.5s' : '4s' }}>
                      <img src={currentPost.soundAvatar} alt="Disk" referrerPolicy="no-referrer" className="w-5 h-5 rounded-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Static Call To Action (Banner) - Ads Exclusive */}
                {currentPost.isAd && (
                  <div className="w-full px-3 pb-3 relative z-20 shrink-0 pointer-events-auto">
                    <button
                      id={`ad-cta-btn-${currentPost.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdClick(currentPost.campaignId || 'campaign_custom');
                        setShowCampaignLandingFor(currentPost);
                      }}
                      className="w-full text-center flex justify-between items-center bg-white hover:bg-neutral-100 text-neutral-950 font-black py-3.5 px-5 rounded-2xl shadow-xl transition-all border border-white/20 relative overflow-hidden group border-b-4 border-neutral-300"
                    >
                      {/* Interactive shine highlight */}
                      <span className="absolute inset-y-0 left-0 w-12 bg-black/5 skew-x-[45deg] -translate-x-20 group-hover:translate-x-96 transition-transform duration-1000 ease-out" />
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-4 h-4 animate-bounce text-neutral-950" />
                        <span className="text-xs tracking-wider uppercase text-neutral-950">{currentPost.ctaText || t.viewDetails}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-neutral-550">
                        <span className="text-[11px] text-neutral-600">{t.viewDetails}</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="font-bold text-base text-neutral-950 line-height-none"
                        >
                          →
                        </motion.span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Auto Captions display overlay */}
                {showCaptions && activeCaption && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[140px] bg-black/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold px-3.5 py-2.5 rounded-2xl pointer-events-none z-30 select-none shadow-2xl tracking-tight max-w-[280px] text-center">
                    <span className="text-rose-505 mr-1 animate-pulse">💬</span> "{activeCaption}..."
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Drawer Slide-up: Comments Drawer --- */}
        <AnimatePresence>
          {showCommentsFor && (
            <>
              <div
                className="absolute inset-0 bg-black/60 z-30"
                onClick={() => setShowCommentsFor(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute bottom-0 left-0 right-0 h-[60%] bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-4 flex flex-col z-40"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-2">
                  <span className="text-white text-xs font-bold tracking-tight">{t.commentsCount} ({currentPost?.comments?.length || 0})</span>
                  <button
                    onClick={() => setShowCommentsFor(null)}
                    className="text-neutral-400 hover:text-white font-semibold text-xs py-1 px-2.5 hover:bg-neutral-800 rounded-md"
                  >
                    {t.modalClose}
                  </button>
                </div>

                {/* Comments Scroll area */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 scrollbar-thin scrollbar-thumb-neutral-800">
                  {currentPost?.comments?.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-neutral-500 py-8">
                      <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-xs">{t.noComments}</p>
                      <p className="text-[10px]">{t.firstCommentHand}</p>
                    </div>
                  ) : (
                    currentPost?.comments?.map((comment) => (
                      <div key={comment.id} className="flex space-x-3 items-start">
                        <div className="w-8 h-8 rounded-full border border-neutral-700 shrink-0 overflow-hidden bg-neutral-850">
                          <img src={comment.avatar} alt={comment.username} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-neutral-300">@{comment.username}</span>
                            <span className="text-[9px] text-neutral-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-xs text-neutral-200 font-sans break-words pr-2">
                            {comment.text}
                          </p>
                          <div className="flex items-center space-x-1.5 text-[9px] text-neutral-500 pt-1">
                            <button className="hover:text-neutral-300 flex items-center space-x-1">
                              <Heart className="w-2.5 h-2.5" /> <span>{comment.likes}</span>
                            </button>
                            <span>•</span>
                            <button className="hover:text-neutral-300">Balas</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input box */}
                <form onSubmit={submitComment} className="pt-3 border-t border-neutral-800 flex items-center space-x-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={t.commentPlaceholder}
                    className="flex-1 bg-neutral-800 text-white rounded-full text-xs px-3.5 py-2.5 outline-none border border-neutral-700/50 focus:border-white transition-colors placeholder:text-neutral-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 transition-colors flex items-center justify-center shrink-0 shadow-lg active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Drawer Slide-up: Share Drawer --- */}
        <AnimatePresence>
          {showShareFor && (
            <>
              <div
                className="absolute inset-0 bg-black/60 z-30"
                onClick={() => setShowShareFor(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-5 z-40"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                  <span className="text-white text-xs font-bold tracking-tight">{t.shareTitle}</span>
                  <button
                    onClick={() => setShowShareFor(null)}
                    className="text-neutral-400 hover:text-white font-semibold text-xs py-1"
                  >
                    {t.modalClose}
                  </button>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-4 gap-3 text-center mb-6">
                  {[
                    { label: t.copyLinkLabel, icon: '🔗', color: 'bg-neutral-800' },
                    { label: 'WhatsApp', icon: '💬', color: 'bg-emerald-600/30' },
                    { label: 'Instagram', icon: '📸', color: 'bg-pink-600/30' },
                    { label: 'E-mail', icon: '✉️', color: 'bg-indigo-600/30' }
                  ].map((app, i) => (
                    <button
                      key={i}
                      onClick={i === 0 ? copyShareLink : undefined}
                      className="flex flex-col items-center space-y-1.5 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <div className={`w-11 h-11 rounded-full ${app.color} flex items-center justify-center text-xl shadow`}>
                        {app.icon}
                      </div>
                      <span className="text-[10px] text-neutral-300 font-medium">{app.label}</span>
                    </button>
                  ))}
                </div>

                {copiedNotification && (
                  <div className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 px-3 rounded-xl text-center text-[11px] font-medium mb-2 animate-pulse">
                    {t.copiedToast}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Drawer Slide-up: Ad Landing Page Store Overlay (Simulated Conversion) --- */}
        <AnimatePresence>
          {showCampaignLandingFor && (
            <>
              <div
                className="absolute inset-0 bg-black/60 z-30"
                onClick={resetOrderModal}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 h-[80%] bg-neutral-950 border-t-2 border-neutral-800 rounded-t-[32px] overflow-hidden flex flex-col z-40"
              >
                {/* Store Header */}
                <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/5 text-[10px] text-sky-400">
                      Ad
                    </div>
                    <span className="text-white text-xs font-bold tracking-tight">{t.secureConnection}</span>
                  </div>
                  <button
                    onClick={resetOrderModal}
                    className="text-neutral-400 hover:text-white font-semibold text-xs py-1 px-2 hover:bg-neutral-800 rounded"
                  >
                    {t.exitStore}
                  </button>
                </div>

                {/* Landing Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {orderSuccess ? (
                    <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-8">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shadow-lg text-emerald-400 font-bold mb-2">
                        ✓
                      </div>
                      <h3 className="text-white text-sm font-bold">{t.successOrderTitle}</h3>
                      <p className="text-[11px] text-neutral-400 px-6 leading-relaxed">
                        {t.successOrderDesc}
                      </p>
                      <button
                        onClick={resetOrderModal}
                        className="bg-neutral-800 text-white font-semibold text-[11px] py-2 px-5 rounded-full hover:bg-neutral-700 transition"
                      >
                        {t.modalClose}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Product View */}
                      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">{t.bestSeller}</span>
                            <h4 className="text-white text-sm font-bold mt-1.5">{showCampaignLandingFor.ctaText || t.viewDetails}</h4>
                            <p className="text-[11px] text-neutral-400 mt-1">{showCampaignLandingFor.description}</p>
                          </div>
                        </div>

                        {/* Price Details */}
                        <div className="flex items-baseline space-x-2 pt-2 border-t border-neutral-800/60">
                          <span className="text-lg font-extrabold text-white">Rp 249.000</span>
                          <span className="text-[11px] text-neutral-500 line-through">Rp 499.000</span>
                          <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 px-1.5 py-0.5 rounded">SAVE 50%</span>
                        </div>
                      </div>

                      {/* Campaign details cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-850">
                          <span className="text-[9px] text-neutral-500 block">{t.categoryCard}</span>
                          <span className="text-[11px] text-neutral-300 font-semibold">{t.categoryCardDetail}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-850">
                          <span className="text-[9px] text-neutral-500 block">{t.pmCard}</span>
                          <span className="text-[11px] text-neutral-300 font-semibold">{t.pmCardDetail}</span>
                        </div>
                      </div>

                      {/* Order Quantity Form */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">{t.buyQuantity}</label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800">
                            <button
                              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                              className="px-3 py-1.5 text-neutral-400 hover:text-white font-bold transition"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs text-white font-semibold">{orderQuantity}</span>
                            <button
                              onClick={() => setOrderQuantity(orderQuantity + 1)}
                              className="px-3 py-1.5 text-neutral-400 hover:text-white font-bold transition"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-neutral-400">Total: <b className="text-white">Rp {(249000 * orderQuantity).toLocaleString('id-ID')}</b></span>
                        </div>
                      </div>

                      {/* Campaign Target Disclaimer */}
                      <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/20 text-indigo-300 space-y-1 text-[10px]">
                        <p className="font-semibold block opacity-90">{t.securityDisclaimerTitle}</p>
                        <p className="opacity-75 leading-relaxed">
                          {t.securityDisclaimer}
                        </p>
                      </div>

                      {/* Checkout Action Button */}
                      <div className="pt-2">
                        <button
                          onClick={handleInitiateOrder}
                          disabled={orderProcessing}
                          className="w-full bg-white hover:bg-neutral-100 disabled:opacity-50 text-neutral-950 font-black text-xs py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                        >
                          {orderProcessing ? (
                            <>
                              <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                              <span>{t.processingOrder}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4 text-neutral-950" />
                              <span>{t.btnSuccessOrder}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Drawer Slide-up: TikTok Settings Drawer --- */}
        <AnimatePresence>
          {showSettingsModal && (
            <>
              <div
                className="absolute inset-0 bg-black/60 z-30"
                onClick={() => setShowSettingsModal(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className="absolute bottom-0 left-0 right-0 h-[74%] bg-neutral-900 border-t border-neutral-800 rounded-t-[32px] p-5 flex flex-col z-40 select-none text-white pointer-events-auto shadow-2xl"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4 shrink-0">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="text-white text-xs font-bold tracking-tight">{t.settingsTitle}</span>
                  </div>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-neutral-400 hover:text-white font-semibold text-xs py-1 px-2.5 hover:bg-neutral-800 rounded-md"
                  >
                    {t.modalClose}
                  </button>
                </div>

                {/* Settings Scroll area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin scrollbar-thumb-neutral-800">
                  {/* Category 1: Playback Controls */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-rose-400 tracking-wider uppercase font-mono">{t.playbackAdjustments}</span>
                    
                    {/* Autoplay Switch */}
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5 text-[11px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-200">{t.autoplayNext}</span>
                        <span className="text-[9px] text-neutral-500">{t.autoplayNextSub}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const next = !autoplayEnabled;
                          setAutoplayEnabled(next);
                        }}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${autoplayEnabled ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-transform duration-200 ${autoplayEnabled ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Infinite Video Loop */}
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5 text-[11px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-200">{t.forceLoop}</span>
                        <span className="text-[9px] text-neutral-500">{t.forceLoopSub}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const next = !loopVideo;
                          setLoopVideo(next);
                          if (next) setAutoplayEnabled(false); // mutually exclusive helper
                        }}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${loopVideo ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-transform duration-200 ${loopVideo ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Playback rate speed selector */}
                    <div className="py-1.5 space-y-1.5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-neutral-200">{t.speedLabel}</span>
                        <span className="text-[9px] text-neutral-500">{t.speedDesc}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setPlaybackSpeed(rate)}
                            className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                              playbackSpeed === rate 
                                ? 'bg-emerald-500 text-black shadow-md' 
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                            }`}
                          >
                            {rate === 1.0 ? (lang === 'ar' ? 'عادي' : lang === 'fa' ? 'طبیعی' : 'Normal') : `${rate}x`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Aesthetic Filters */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] font-bold text-rose-400 tracking-wider uppercase font-mono">{t.streamVisualEffects}</span>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {[
                        { code: 'normal', name: lang === 'ar' ? 'عادي ١٠٠٪' : lang === 'fa' ? 'طبیعی ۱۰۰٪' : 'Normal 100%' },
                        { code: 'retro', name: lang === 'ar' ? 'ريترو دافئ' : lang === 'fa' ? 'رترو گرم' : 'Warm Retro' },
                        { code: 'cyber', name: lang === 'ar' ? 'سايبر نيون' : lang === 'fa' ? 'سایبر نئون' : 'Cyber Neon' },
                        { code: 'noir', name: lang === 'ar' ? 'أسود وأبيض' : lang === 'fa' ? 'نوآر تاریک' : 'Noir Gray' },
                        { code: 'dreamy', name: lang === 'ar' ? 'حالم ناعم' : lang === 'fa' ? 'رویایی ملایم' : 'Dreamy Soft' }
                      ].map((fil) => (
                        <button
                          key={fil.code}
                          onClick={() => setVideoFilters(fil.code)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all text-center leading-tight truncate ${
                            videoFilters === fil.code
                              ? 'bg-gradient-to-tr from-rose-500 to-indigo-500 text-white font-bold border border-white/20 shadow-md'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750 border border-transparent'
                          }`}
                        >
                          {fil.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: Interaction & Utilities */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] font-bold text-rose-400 tracking-wider uppercase font-mono">{t.behaviorAndDataPrefs}</span>

                    {/* Show automated Live Captions toggles */}
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5 text-[11px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-200">{t.liveCaptionsLabel}</span>
                        <span className="text-[9px] text-neutral-500">{t.liveCaptionsDesc}</span>
                      </div>
                      <button 
                        onClick={() => setShowCaptions(!showCaptions)}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${showCaptions ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-transform duration-200 ${showCaptions ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Double-Tap to register Suka */}
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5 text-[11px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-200">{t.doubleTapLikeLabel}</span>
                        <span className="text-[9px] text-neutral-500">{t.doubleTapLikeDesc}</span>
                      </div>
                      <button 
                        onClick={() => setDoubleTapToLike(!doubleTapToLike)}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${doubleTapToLike ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-transform duration-200 ${doubleTapToLike ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Low rate savings - Data Saver simulated */}
                    <div className="flex items-center justify-between py-1.5 text-[11px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-200">{t.dataSaverLabel}</span>
                        <span className="text-[9px] text-neutral-500">{t.dataSaverDesc}</span>
                      </div>
                      <button 
                        onClick={() => setSimulateDataSaver(!simulateDataSaver)}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${simulateDataSaver ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-transform duration-200 ${simulateDataSaver ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
