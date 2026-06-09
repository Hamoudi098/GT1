import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Campaign, VIDEO_PRESETS } from '../types';
import { Plus, BarChart2, TrendingUp, Users, DollarSign, Activity, Play, Pause, Trash2, Sliders, Globe, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { TranslationDictionary } from '../translations';

interface CampaignManagerProps {
  campaigns: Campaign[];
  onCreateCampaign: (newCampaign: Partial<Campaign>) => void;
  onToggleCampaignActive: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onSimulateTraffic: () => void;
  t: TranslationDictionary;
}

export default function CampaignManager({
  campaigns,
  onCreateCampaign,
  onToggleCampaignActive,
  onDeleteCampaign,
  onSimulateTraffic,
  t,
}: CampaignManagerProps) {
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [ctaText, setCtaText] = useState('Beli Sekarang');
  const [ctaUrl, setCtaUrl] = useState('https://github.com');
  const [targetAudience, setTargetAudience] = useState('');
  const [dailyBudget, setDailyBudget] = useState<number>(100000);
  const [selectedPreset, setSelectedPreset] = useState('fashion');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // AI Copilot States
  const [aiModel, setAiModel] = useState('gemini-3.5-flash');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModelCategory, setAiModelCategory] = useState('Fashion Model');
  const [aiGender, setAiGender] = useState('Female');
  const [aiVibe, setAiVibe] = useState('Parisian Haute Couture');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInfo, setAiInfo] = useState('');

  // AI copywriting generator handler
  const handleAiGenerate = async () => {
    setIsGenerating(true);
    setAiInfo('');
    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiModel,
          prompt: aiPrompt,
          modelCategory: aiModelCategory,
          gender: aiGender,
          targetVibe: aiVibe
        })
      });
      const data = await res.json();
      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.targetAudience) setTargetAudience(data.targetAudience);
      if (data.videoPreset) setSelectedPreset(data.videoPreset);
      if (data.ctaText) setCtaText(data.ctaText);
      if (data.dailyBudget) setDailyBudget(data.dailyBudget);
      setCategory(data.category || 'Fashion Model');
      setAiInfo(`Berhasil dibuat! Model AI: ${data.generatedBy || aiModel}`);
    } catch (e: any) {
      console.error(e);
      setAiInfo('Kehabisan waktu, mengaktifkan parameter mockup model terpercaya.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Nama Kampanye dan Deskripsi wajib diisi!');
      return;
    }
    onCreateCampaign({
      name,
      description,
      category,
      ctaText,
      ctaUrl,
      targetAudience: targetAudience || 'Target Umum, Gen-Z',
      dailyBudget,
      videoPreset: selectedPreset,
    });
    // Reset form
    setName('');
    setDescription('');
    setCategory('Fashion');
    setCtaText('Beli Sekarang');
    setCtaUrl('https://github.com');
    setTargetAudience('');
    setDailyBudget(100000);
    setSelectedPreset('fashion');
    setShowCreateModal(false);
  };

  // KPI Calculations
  const activeCampaignsCount = campaigns.filter(c => c.isActive).length;
  const totalViews = campaigns.reduce((acc, c) => acc + c.views, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  
  // Calculate Spent (e.g. Rp 1.500 per click + Rp 200 per view representing cost structure)
  const calculatedTotalSpent = campaigns.reduce((acc, c) => {
    const cost = (c.views * 150) + (c.clicks * 850) + (c.conversions * 2500);
    return acc + Math.min(cost, c.dailyBudget * 10); // cap is reached if over budget
  }, 0);

  // Click-through rate
  const averageCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  // Conversion rate
  const averageCVR = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  // Run a quick mock animation for traffic simulation
  const triggerTrafficSimulation = () => {
    setIsSimulating(true);
    onSimulateTraffic();
    setTimeout(() => {
      setIsSimulating(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 select-none bg-neutral-950/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl text-white">
      {/* Dynamic Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-5 rounded-3xl border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            <h2 className="text-white text-lg font-bold tracking-tight">{t.studioDashboardTitle}</h2>
          </div>
          <p className="text-neutral-300 text-xs mt-1">
            {t.studioDashboardDesc}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="simulate-traffic-btn"
            onClick={triggerTrafficSimulation}
            disabled={isSimulating || campaigns.length === 0}
            className={`flex items-center space-x-1.5 font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 text-white bg-white/10 hover:bg-white/15 active:scale-95 transition-all ${
              isSimulating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'text-white animate-spin' : 'text-neutral-300'}`} />
            <span>{isSimulating ? t.simulateTrafficLoading : t.simulateTrafficBtn}</span>
          </button>

          <button
            id="open-campaign-create-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-transform shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-950" />
            <span>{t.placeNewAdBtn}</span>
          </button>
        </div>
      </div>

      {campaigns.length === 0 && (
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start space-x-3 text-neutral-300 shadow-sm animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-white" />
          <div className="text-xs">
            <p className="font-bold text-white">{t.emptyStateTitle}</p>
            <p className="opacity-90">
              {t.emptyStateText}
            </p>
          </div>
        </div>
      )}

      {/* KPI Overviews Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white/5 p-3 rounded-[24px] border border-white/10">
        {/* KPI 1 */}
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-center text-neutral-300">
            <span className="text-[10px] font-semibold tracking-wider uppercase">{t.kpiActiveCampaigns}</span>
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white tracking-tight">{activeCampaignsCount}</span>
            <span className="text-[10px] text-neutral-400 ml-1 font-mono">/ {campaigns.length} total</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-center text-neutral-300">
            <span className="text-[10px] font-semibold tracking-wider uppercase">{t.kpiViews}</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white tracking-tight">{(totalViews).toLocaleString('id-ID')}</span>
            <span className="text-[10px] text-neutral-400 ml-1 font-semibold">{t.kpiViewsSub}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-center text-neutral-300">
            <span className="text-[10px] font-semibold tracking-wider uppercase">{t.kpiClicksCTR}</span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white tracking-tight">{totalClicks}</span>
            <span className="text-[10px] bg-white/10 border border-white/10 text-white px-1.5 py-0.5 rounded ml-1 font-semibold">
              {averageCTR.toFixed(1)}% CTR
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-center text-neutral-300">
            <span className="text-[10px] font-semibold tracking-wider uppercase">{t.kpiConversions}</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-white block truncate">Rp {Math.floor(calculatedTotalSpent).toLocaleString('id-ID')}</span>
            <span className="text-[10px] text-white/90 font-bold block mt-0.5">
               {totalConversions} {t.kpiConversionsSub} ({averageCVR.toFixed(1)}% CVR)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Dashboard Performance Charts - Multi Bar representation for campaign comparisons */}
      {campaigns.length > 0 && (
        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-xs font-bold uppercase tracking-wider">{t.chartTitle}</h3>
              <p className="text-[10px] text-neutral-300">{t.chartSubtitle}</p>
            </div>
            <BarChart2 className="w-4 h-4 text-white" />
          </div>

          <div className="space-y-4 pt-1">
            {campaigns.map((camp) => {
              // Calculate proportion scales for chart
              const maxVal = Math.max(...campaigns.map(c => c.views), 10);
              const viewsPct = Math.max((camp.views / maxVal) * 100, 3);
              const clicksPct = Math.max((camp.clicks / maxVal) * 100, 3);
              const convsPct = Math.max((camp.conversions / maxVal) * 100, 3);

              return (
                <div key={camp.id} className="space-y-1.5 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1">
                    <div className="flex items-center space-x-2">
                       <span className={`w-2 h-2 rounded-full ${camp.isActive ? 'bg-rose-400 animate-pulse' : 'bg-white/20'}`}></span>
                      <span className="font-bold text-white">{camp.name}</span>
                      <span className="text-[9px] bg-white/10 border border-white/10 text-neutral-200 px-2 py-0.5 rounded">{camp.category}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-neutral-300">
                      <span>👁 <b>{camp.views}</b></span>
                      <span>🖱 <b>{camp.clicks}</b></span>
                      <span>💰 <b>{camp.conversions}</b></span>
                      <span className="text-neutral-400">|</span>
                      <span className="text-white font-bold">Spent: Rp {Math.floor((camp.views * 150) + (camp.clicks * 850) + (camp.conversions * 2500)).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Multi-layered bar slider */}
                  <div className="space-y-1">
                    {/* Views bar */}
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                      <div
                        style={{ width: `${viewsPct}%` }}
                        className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                      />
                    </div>
                    {/* Clicks bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                      <div
                        style={{ width: `${clicksPct}%` }}
                        className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      />
                    </div>
                    {/* Conversions bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                      <div
                        style={{ width: `${convsPct}%` }}
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campaigns Listing Details Area */}
      <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex justify-between items-center">
          <span className="text-white text-xs font-bold uppercase tracking-wider">{t.listTitle}</span>
          <span className="text-[10px] bg-white/10 border border-white/10 text-white py-1 px-2.5 rounded-full font-bold">
            {campaigns.length} {t.listUnit}
          </span>
        </div>

        <div className="divide-y divide-white/5 bg-transparent">
          {campaigns.map((camp) => {
            const cost = (camp.views * 150) + (camp.clicks * 850) + (camp.conversions * 2500);
            return (
              <div key={camp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition duration-150">
                <div className="space-y-1 md:max-w-md">
                   <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <h4 className="text-white text-sm font-bold">{camp.name}</h4>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                      camp.isActive 
                        ? 'bg-emerald-500 text-neutral-950 border border-emerald-400 font-extrabold' 
                        : 'bg-white/10 text-neutral-400 border border-white/5'
                    }`}>
                      {camp.isActive ? t.campActive : t.campPaused}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-355 font-sans leading-relaxed line-clamp-2">
                    {camp.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-neutral-400 pt-1">
                    <span>{t.campTarget}: <b className="text-white font-semibold">{camp.targetAudience}</b></span>
                    <span>•</span>
                    <span>{t.campPreset}: <b className="text-white font-semibold capitalize">{camp.videoPreset}</b></span>
                    <span>•</span>
                    <span>{t.campBudget}: <b className="text-white font-extrabold">Rp {camp.dailyBudget.toLocaleString('id-ID')}/{t.campDaily}</b></span>
                  </div>
                </div>

                {/* Operations & Metrik */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  {/* Play Pause button */}
                  <button
                    onClick={() => onToggleCampaignActive(camp.id)}
                    className={`p-2.5 rounded-xl border transition active:scale-95 flex items-center justify-center ${
                      camp.isActive
                        ? 'border-white/10 hover:bg-white/10 text-white bg-white/5'
                        : 'border-white/20 text-white bg-white/20 hover:bg-white/30'
                    }`}
                    title={camp.isActive ? t.campPaused : t.campActive}
                  >
                     {camp.isActive ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 fill-white text-white" />}
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={() => onDeleteCampaign(camp.id)}
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-rose-400 transition active:scale-95 flex items-center justify-center"
                    title="Remove / Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900/90 backdrop-blur-3xl border border-white/25 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-8 text-white"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-white" />
                <h3 className="text-white text-sm font-extrabold uppercase tracking-tight">{t.modalTitle}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white font-extrabold text-xs p-1"
              >
                {t.modalClose}
              </button>
            </div>

            {/* Campaign form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-white/10">
              {/* ✨ AI PILOT GENERATOR WORKBENCH FOR LLM MODELS & MODEL PEERS */}
              <div className="bg-white/5 border border-white/15 p-4 rounded-2xl space-y-3 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">{t.aiTitle}</span>
                  </div>
                  <span className="text-[8px] bg-white/10 text-rose-300 font-mono px-1.5 py-0.5 rounded">{t.aiBadge}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* LLM AI Model selector */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t.aiModelLabel}</label>
                    <select
                      type="button"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 text-[11px] py-1.5 px-2 rounded-lg text-white"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
                    </select>
                  </div>

                  {/* Physical Model Category */}
                  <div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t.aiCategoryLabel}</label>
                    <select
                      value={aiModelCategory}
                      onChange={(e) => setAiModelCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 text-[11px] py-1.5 px-2 rounded-lg text-white"
                    >
                      <option value="Fashion Model">Fashion Model</option>
                      <option value="Runway Model">Runway Model</option>
                      <option value="Fitness Model">Fitness Model</option>
                      <option value="Editorial Model">Editorial Model</option>
                      <option value="Commercial Actor">Commercial Actor</option>
                    </select>
                  </div>

                  {/* Gender bias preset */}
                  <div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t.aiGenderLabel}</label>
                    <select
                      value={aiGender}
                      onChange={(e) => setAiGender(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 text-[11px] py-1.5 px-2 rounded-lg text-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="All Genders">All Genders</option>
                    </select>
                  </div>

                  {/* Vibe selection */}
                  <div className="col-span-2">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t.aiVibeLabel}</label>
                    <input
                      type="text"
                      value={aiVibe}
                      onChange={(e) => setAiVibe(e.target.value)}
                      placeholder="Parisian Haute Couture, Cyberpunk, Casual"
                      className="w-full bg-neutral-900 border border-white/10 text-[11px] py-1.5 px-2.5 rounded-lg text-white placeholder:text-neutral-500"
                    />
                  </div>

                  {/* Extra Prompt context */}
                  <div className="col-span-2">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t.aiExtraLabel}</label>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="..."
                      className="w-full bg-neutral-900 border border-white/10 text-[11px] py-1.5 px-2.5 rounded-lg text-white placeholder:text-neutral-500"
                    />
                  </div>
                </div>

                {/* Synthesis trigger button */}
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleAiGenerate}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-90 active:scale-98 transition text-white font-extrabold text-[11px] flex items-center justify-center space-x-1 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? t.aiButtonLoading : t.aiButtonLabel}</span>
                </button>

                {aiInfo && (
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-[9px] font-semibold text-rose-300 font-mono tracking-tight text-center leading-tight">
                    {aiInfo}
                  </div>
                )}
              </div>

              {/* Campaign name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formNameLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="Campaign name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs py-2.5 px-3 text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition placeholder:text-neutral-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formDescLabel}</label>
                <textarea
                  required
                  rows={2}
                  placeholder="..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs py-2.5 px-3 text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition resize-none placeholder:text-neutral-500"
                />
              </div>

              {/* Preset select visual background */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formPresetLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {VIDEO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`p-3 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                        selectedPreset === preset.id
                          ? 'border-white bg-white/15 shadow-inner'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-white text-xs font-bold block z-10">{preset.label}</span>
                      <span className="text-[9px] text-neutral-300 block mt-1 z-10 capitalize">Type: {preset.id}</span>
                      <div className={`absolute right-1 bottom-1 w-6 h-6 rounded-md bg-gradient-to-tr ${preset.bgColor} opacity-60 z-0`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category, Target, and CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formCategoryLabel}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl text-xs py-2.5 px-2 text-white outline-none focus:border-white cursor-pointer"
                  >
                    {['Fashion', 'Tech', 'Food', 'Gaming', 'FinTech', 'Sports', 'Cosmetics'].map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formCtaLabel}</label>
                  <select
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl text-xs py-2.5 px-2 text-white outline-none focus:border-white cursor-pointer"
                  >
                    {['Beli Sekarang / Buy Now', 'Daftar Gratis / Sign Up', 'Pesan Sekarang / Order Now', 'Pelajari Selengkapnya / Learn More', 'Unduh Aplikasi / Download'].map((label) => (
                      <option key={label} value={label} className="bg-neutral-900 text-white">{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formCtaLinkLabel}</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="url"
                    required
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl text-xs py-2.5 pl-9 pr-3 text-white outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Target Audience keywords */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-355 uppercase tracking-wide block">{t.formDemographicsLabel}</label>
                <input
                  type="text"
                  placeholder="..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs py-2.5 px-3 text-white outline-none focus:border-white transition placeholder:text-neutral-500"
                />
              </div>

              {/* Daily Budget Slider */}
              <div className="space-y-2 pt-1 border-t border-white/10 mt-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-neutral-355 uppercase">
                  <span>{t.formBudgetLabel}</span>
                  <span className="text-white font-extrabold">Rp {dailyBudget.toLocaleString('id-ID')}</span>
                </div>
                <input
                  type="range"
                  min={25000}
                  max={2000000}
                  step={25000}
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
                />
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>Rp 25.000</span>
                  <span>Rp 1.000.000</span>
                  <span>Rp 2.000.000</span>
                </div>
              </div>

              {/* Button Submit block */}
              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 text-center bg-white/5 hover:bg-white/10 text-neutral-200 font-bold text-xs py-3 rounded-xl transition"
                >
                  {t.formCancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 text-center bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs py-3 rounded-xl shadow-md transition"
                >
                  {t.formSubmit}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
