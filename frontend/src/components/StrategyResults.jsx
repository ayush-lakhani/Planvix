import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Copy,
  Check,
  Target,
  Users,
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  Shield,
  ArrowUpRight,
  ChevronRight,
  Eye,
  Award,
  Zap,
  Flame,
  MousePointerClick
} from "lucide-react";
import ShareButtons from "./ShareButtons";
import { Button } from "./ui/Button";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function StrategyResults({ strategy, onReset }) {
  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400">Loading your marketing swarm strategy...</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("blueprint");
  const [copiedId, setCopiedId] = useState(null);

  const tabs = [
    { id: "blueprint", label: "Strategic Overview", icon: FileText },
    { id: "keywords", label: "Keywords & SEO", icon: Search },
    { id: "calendar", label: "Content Calendar", icon: Calendar },
    { id: "posts", label: "Content Pillars", icon: Sparkles },
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(strategy, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `planvix-strategy-${strategy.industry || "output"}.json`;
    link.click();
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-16"
    >
      {/* Upper Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Swarm Complete
            </span>
            {strategy.industry && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                {strategy.industry}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight">
            AI Content Strategy Swarm
          </h1>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-xs text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            Export Schema
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Swarm
          </Button>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="bg-[#070b19]/60 border border-white/5 p-1 rounded-2xl flex flex-wrap gap-1 relative z-10 backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative ${
                isActive ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "blueprint" && (
            <div className="space-y-8">
              {/* Main Pillars Grid */}
              {strategy.strategic_overview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Growth Objective</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {strategy.strategic_overview.growth_objective}
                    </p>
                  </div>

                  <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Target Persona</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {strategy.strategic_overview.target_persona_snapshot}
                    </p>
                  </div>

                  <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Positioning Angle</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {strategy.strategic_overview.positioning_angle}
                    </p>
                  </div>

                  <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Competitive Edge</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {strategy.strategic_overview.competitive_edge}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl text-center text-slate-500 text-sm">
                  Strategic blueprint summary unavailable.
                </div>
              )}

              {/* Growth Intelligence Engine details */}
              {strategy.growth_intelligence && (
                <div className="bg-[#070b15] border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#6200EE]/10 border border-[#6200EE]/20 rounded-xl text-[#a68cff]">
                      <Brain className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white font-['Manrope'] tracking-tight">Growth Intelligence Engine</h4>
                      <p className="text-xs text-slate-500">Unveiling competitor blind spots and psychological hooks</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                      <h5 className="text-[10px] font-black text-rose-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" /> Competitor Gaps
                      </h5>
                      <ul className="space-y-2.5">
                        {strategy.growth_intelligence.competitor_gaps?.map((gap, i) => (
                          <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                      <h5 className="text-[10px] font-black text-cyan-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Blue Oceans
                      </h5>
                      <ul className="space-y-2.5">
                        {strategy.growth_intelligence.blue_ocean_opportunities?.map((opp, i) => (
                          <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                            <span className="text-cyan-500 font-bold">•</span>
                            <span>{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                      <h5 className="text-[10px] font-black text-indigo-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5" /> Dopamine Triggers
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {strategy.growth_intelligence.dopamine_triggers?.map((trig, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold">
                            {trig}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign Narrative */}
              {strategy.strategic_narrative && (
                <div className="bg-gradient-to-br from-indigo-500/5 via-cyan-500/5 to-transparent border border-white/5 p-6 rounded-3xl">
                  <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" /> Psychological Narrative Flow
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic mb-4">
                    "{strategy.strategic_narrative.campaign_narrative_flow}"
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {strategy.strategic_narrative.psychological_transition_points?.map((pt, i) => (
                      <span key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ROI Dashboard Forecast */}
              {strategy.roi_prediction && (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/40 via-[#070b15] to-[#070b15] p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    <div>
                      <h4 className="text-2xl font-black text-white font-['Manrope'] tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-400" /> Predictive Growth ROI Forecast
                      </h4>
                      <p className="text-xs text-slate-500">Live forecast based on competitive difficulty and agent simulations</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Confidence</span>
                        <span className="text-2xl font-black text-white">{strategy.roi_prediction.confidence_score}%</span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10" />
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center text-xs font-black text-indigo-400 animate-spin-slow">
                        <Zap className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>
                  </div>

                  {/* ROI Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Traffic Lift", val: strategy.roi_prediction.traffic_lift_percentage, sub: "Direct Search & Referral" },
                      { label: "Engagement Boost", val: strategy.roi_prediction.engagement_boost_percentage, sub: "Click-Through & Replies" },
                      { label: "Est. Monthly Reach", val: strategy.roi_prediction.estimated_monthly_reach, sub: "Impression Pool" },
                      { label: "Conversion Rate", val: strategy.roi_prediction.conversion_rate_estimate, sub: "Pipeline Completion" }
                    ].map((card, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors duration-300">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{card.label}</span>
                        <span className="text-3xl font-black text-white tracking-tight">{card.val}</span>
                        <span className="text-[10px] text-slate-600 block mt-1">{card.sub}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Strategic Logic</span>
                    <p className="text-xs text-slate-400 leading-relaxed">{strategy.roi_prediction.strategic_reasoning}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "keywords" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white font-['Manrope']">Keywords & Discovery Swarm</h3>
              </div>

              {strategy.keywords ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Keywords */}
                  {strategy.keywords.primary && strategy.keywords.primary.length > 0 && (
                    <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl">
                      <h4 className="font-bold text-slate-200 text-sm mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
                        Primary Search Targets
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.keywords.primary.map((kw, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                            onClick={() => handleCopy(kw, `kw-${i}`)}
                          >
                            {kw}
                            {copiedId === `kw-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {strategy.keywords.hashtags && strategy.keywords.hashtags.length > 0 && (
                    <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl">
                      <h4 className="font-bold text-slate-200 text-sm mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
                        Discovery Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.keywords.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                            onClick={() => handleCopy(tag, `tag-${i}`)}
                          >
                            {tag}
                            {copiedId === `tag-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Long Tail Phrases */}
                  {strategy.keywords.long_tail && strategy.keywords.long_tail.length > 0 && (
                    <div className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl md:col-span-2">
                      <h4 className="font-bold text-slate-200 text-sm mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
                        Long-Tail Discovery Phrases
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {strategy.keywords.long_tail.map((phrase, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-all group cursor-pointer"
                            onClick={() => handleCopy(phrase, `phrase-${i}`)}
                          >
                            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors pr-2">
                              {phrase}
                            </span>
                            <button className="text-slate-500 hover:text-white p-1 rounded bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {copiedId === `phrase-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl text-center text-slate-500 text-sm">
                  SEO and Search metrics not computed.
                </div>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white font-['Manrope']">Interactive Content Calendar</h3>
              </div>

              {strategy.content_calendar && strategy.content_calendar.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {strategy.content_calendar.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ y: -4, borderColor: "rgba(98, 0, 238, 0.2)" }}
                      className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-black">
                              {item.day}
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Day
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            item.funnel_stage === "Awareness" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            item.funnel_stage === "Education" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                            item.funnel_stage === "Trust" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          }`}>
                            {item.funnel_stage || "Awareness"}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors mb-3 leading-snug">
                          {item.theme}
                        </h4>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          {item.format}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                          View details <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl text-center text-slate-500 text-sm">
                  Calendar schedules unavailable for this output.
                </div>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white font-['Manrope']">Content Pillars & Scripts</h3>
              </div>

              {strategy.content_pillars && strategy.content_pillars.length > 0 ? (
                <div className="space-y-8">
                  {strategy.content_pillars.map((pillar, pillarIndex) => (
                    <div
                      key={pillarIndex}
                      className="bg-[#0c0f1d]/40 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="border-b border-white/5 pb-4 mb-6">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                          Pillar {pillarIndex + 1}
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tight font-['Manrope'] mb-2">
                          {pillar.pillar_name}
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                          {pillar.why_it_works}
                        </p>
                      </div>

                      {pillar.sample_posts && pillar.sample_posts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {pillar.sample_posts.map((post, postIndex) => {
                            const postFullText = `${post.hook}\n\n${post.script_or_structure}\n\n${post.caption}\n\n${post.cta}`;
                            const isCopied = copiedId === `post-${pillarIndex}-${postIndex}`;

                            return (
                              <div
                                key={postIndex}
                                className="bg-[#080b15]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/10 transition-colors"
                              >
                                <div className="space-y-5">
                                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                      {post.format}
                                    </span>
                                    {post.pacing_strategy && (
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        Pacing: {post.pacing_strategy}
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block mb-1">Hook Target</span>
                                    <p className="text-white font-bold text-sm border-l-2 border-indigo-500 pl-3 leading-relaxed">
                                      {post.hook}
                                    </p>
                                    {post.hook_psychology && (
                                      <p className="text-[10px] text-slate-500 mt-1.5 italic">
                                        💡 {post.hook_psychology}
                                      </p>
                                    )}
                                  </div>

                                  {post.visual_storytelling_angle && (
                                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                                      <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider block mb-1">Visual Storyboard</span>
                                      <p className="text-[11px] text-slate-300 leading-relaxed italic">
                                        {post.visual_storytelling_angle}
                                      </p>
                                    </div>
                                  )}

                                  <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Structure / Prompt</span>
                                    <p className="text-xs text-slate-400 leading-relaxed bg-[#04060d]/50 p-3 rounded-xl border border-white/5 font-mono overflow-x-auto max-h-[120px] scrollbar-thin">
                                      {post.script_or_structure}
                                    </p>
                                  </div>

                                  <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Caption copy</span>
                                    <p className="text-xs text-slate-400 leading-relaxed bg-[#04060d]/50 p-3 rounded-xl border border-white/5 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                      {post.caption}
                                    </p>
                                  </div>

                                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block mb-1">Primary CTA</span>
                                    <p className="text-xs font-bold text-slate-200">
                                      {post.cta}
                                    </p>
                                  </div>
                                </div>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleCopy(postFullText, `post-${pillarIndex}-${postIndex}`)}
                                  className="w-full mt-6 flex items-center justify-center gap-2 border-white/10 hover:border-white/20 text-xs"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      Copied Swarm Script
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy Swarm Script
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          No sample posts for this pillar.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl text-center text-slate-500 text-sm">
                  Content pillars not found.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Share Section Wrapper */}
      <div className="border-t border-white/5 pt-8">
        <ShareButtons strategy={strategy} />
      </div>
    </motion.div>
  );
}
