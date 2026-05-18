import { useState } from "react";
import {
  FileText,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import ShareButtons from "./ShareButtons";

export default function StrategyResults({ strategy, onReset }) {
  // Defensive check - prevent crashes if strategy is undefined
  if (!strategy) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading strategy...</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("blueprint");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: "blueprint", label: "Strategic Overview", icon: FileText },
    { id: "keywords", label: "Keywords & SEO", icon: Search },
    { id: "calendar", label: "Content Calendar", icon: Calendar },
    { id: "posts", label: "Content Pillars", icon: FileText },
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(strategy, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content-strategy.json";
    link.click();
  };

  // Debug logging - helps diagnose data structure issues
  console.log("[STRATEGY RESULTS] Full strategy object:", strategy);
  console.log("[STRATEGY RESULTS] Strategy keys:", Object.keys(strategy));
  console.log(
    "[STRATEGY RESULTS] Has strategic_overview?",
    !!strategy?.strategic_overview,
  );
  console.log(
    "[STRATEGY RESULTS] Has content_pillars?",
    !!strategy?.content_pillars,
  );
  console.log(
    "[STRATEGY RESULTS] Has content_calendar?",
    !!strategy?.content_calendar,
  );
  console.log("[STRATEGY RESULTS] Has keywords?", !!strategy?.keywords);
  console.log(
    "[STRATEGY RESULTS] Has roi_prediction?",
    !!strategy?.roi_prediction,
  );

  return (
    <div className="animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Content Strategy
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl shadow hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl shadow hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            New Strategy
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass-card p-8">
        {/* Strategic Overview Tab */}
        {activeTab === "blueprint" && (
          <div className="animate-slide-up space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              📋 Strategic Overview
            </h3>

            {strategy?.strategic_overview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    🎯 Growth Objective
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {strategy.strategic_overview.growth_objective}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    👤 Target Persona
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {strategy.strategic_overview.target_persona_snapshot}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    ⚡ Positioning Angle
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {strategy.strategic_overview.positioning_angle}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                    ⚔️ Competitive Edge
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {strategy.strategic_overview.competitive_edge}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No strategic overview available
                </p>
              </div>
            )}

            {/* Growth Intelligence Section */}
            {strategy?.growth_intelligence && (
              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🧠 Growth Intelligence Engine
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">
                      Competitor Gaps
                    </h5>
                    <ul className="space-y-2">
                      {strategy.growth_intelligence.competitor_gaps?.map((gap, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                          <span className="text-red-500">•</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
                      Blue Oceans
                    </h5>
                    <ul className="space-y-2">
                      {strategy.growth_intelligence.blue_ocean_opportunities?.map((opp, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                          <span className="text-blue-500">•</span> {opp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wider">
                      Dopamine Triggers
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {strategy.growth_intelligence.dopamine_triggers?.map((trigger, i) => (
                        <span key={i} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-[10px] font-bold">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Narrative Section */}
            {strategy?.strategic_narrative && (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                  📖 Campaign Narrative Flow
                </h4>
                <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed italic mb-4">
                  "{strategy.strategic_narrative.campaign_narrative_flow}"
                </p>
                <div className="flex flex-wrap gap-4">
                  {strategy.strategic_narrative.psychological_transition_points?.map((point, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROI Prediction */}
            {strategy?.roi_prediction && (
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <RefreshCw className="w-32 h-32 rotate-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-2xl font-bold flex items-center gap-2">
                      💰 Strategic ROI Forecast
                    </h4>
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                      <span className="text-xs font-bold uppercase block opacity-70">Confidence Score</span>
                      <span className="text-2xl font-black">{strategy.roi_prediction.confidence_score}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                      <p className="text-white/70 text-sm mb-1 uppercase font-bold tracking-tighter">Traffic Lift</p>
                      <p className="text-3xl font-black">{strategy.roi_prediction.traffic_lift_percentage}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1 uppercase font-bold tracking-tighter">Engagement</p>
                      <p className="text-3xl font-black">{strategy.roi_prediction.engagement_boost_percentage}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1 uppercase font-bold tracking-tighter">Reach</p>
                      <p className="text-3xl font-black">{strategy.roi_prediction.estimated_monthly_reach}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1 uppercase font-bold tracking-tighter">Conversion</p>
                      <p className="text-3xl font-black">{strategy.roi_prediction.conversion_rate_estimate}</p>
                    </div>
                  </div>

                  <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <p className="text-xs font-bold uppercase text-white/60 mb-1">Strategic Reasoning</p>
                    <p className="text-sm leading-relaxed">{strategy.roi_prediction.strategic_reasoning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === "keywords" && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              SEO & Discovery Pack
            </h3>

            {strategy?.keywords ? (
              <div className="space-y-6">
                {/* Primary Keywords */}
                {strategy.keywords.primary &&
                  strategy.keywords.primary.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                        Primary Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.keywords.primary.map((kw, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Long-tail Keywords */}
                {strategy.keywords.long_tail &&
                  strategy.keywords.long_tail.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border-l-4 border-green-500">
                      <h4 className="font-bold text-green-900 dark:text-green-100 mb-3">
                        Long-tail Phrases
                      </h4>
                      <ul className="space-y-2">
                        {strategy.keywords.long_tail.map((phrase, i) => (
                          <li
                            key={i}
                            className="text-gray-700 dark:text-gray-300"
                          >
                            • {phrase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Hashtags */}
                {strategy.keywords.hashtags &&
                  strategy.keywords.hashtags.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border-l-4 border-purple-500">
                      <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-3">
                        Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.keywords.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No keyword data available
                </p>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Content Calendar
            </h3>
            {strategy?.content_calendar &&
            strategy.content_calendar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategy.content_calendar.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold">
                          {item.day}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Day
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                        item.funnel_stage === 'Awareness' ? 'bg-blue-100 text-blue-700' :
                        item.funnel_stage === 'Education' ? 'bg-purple-100 text-purple-700' :
                        item.funnel_stage === 'Trust' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.funnel_stage || 'Strategy'}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                      {item.theme}
                    </h4>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-slate-700/50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{item.format}</span>
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-primary-500 border-2 border-white dark:border-slate-800" />
                        <div className="w-4 h-4 rounded-full bg-accent-500 border-2 border-white dark:border-slate-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No calendar data available
                </p>
              </div>
            )}
          </div>
        )}

        {/* Content Pillars Tab */}
        {activeTab === "posts" && (
          <div className="animate-slide-up">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Content Pillars & Sample Posts
            </h3>

            {strategy?.content_pillars &&
            strategy.content_pillars.length > 0 ? (
              <div className="space-y-8">
                {strategy.content_pillars.map((pillar, pillarIndex) => (
                  <div key={pillarIndex} className="glass-card p-6">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {pillar.pillar_name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {pillar.why_it_works}
                    </p>

                    {pillar.sample_posts && pillar.sample_posts.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pillar.sample_posts.map((post, postIndex) => (
                          <div
                            key={postIndex}
                            className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-6 rounded-xl"
                          >
                            <div className="mb-4">
                              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                {post.format}
                              </span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                  Hook
                                </span>
                                <p className="text-gray-900 dark:text-white font-bold text-base border-l-2 border-primary-500 pl-3">
                                  {post.hook}
                                </p>
                                {post.hook_psychology && (
                                  <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-1 font-medium italic">
                                    💡 {post.hook_psychology}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-white/5">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Format</span>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{post.format}</p>
                                </div>
                                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-white/5">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pacing</span>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{post.pacing_strategy || 'Balanced'}</p>
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Structure</span>
                                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                                  {post.script_or_structure}
                                </p>
                              </div>

                              {post.visual_storytelling_angle && (
                                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Visual Storytelling</span>
                                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 italic">
                                    {post.visual_storytelling_angle}
                                  </p>
                                </div>
                              )}

                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Caption</span>
                                <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                  {post.caption}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Call to Action</span>
                                <p className="text-primary-600 dark:text-primary-400 font-black text-sm">
                                  {post.cta}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  handleCopy(
                                    `${post.hook}\n\n${post.script_or_structure}\n\n${post.caption}\n\n${post.cta}`,
                                  )
                                }
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm shadow-lg"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                                {copied ? "Copied to Clipboard!" : "Copy Full Post Script"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No content pillars available
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Buttons */}
      <ShareButtons strategy={strategy} />
    </div>
  );
}
