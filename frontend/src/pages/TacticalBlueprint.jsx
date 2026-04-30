import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { strategyAPI } from '../api';
import { 
  ArrowLeft, Target, TrendingUp, Users, Calendar, 
  BarChart2, Shield, Activity, Zap, CheckCircle, 
  Search, Hash, FileText
} from 'lucide-react';

export default function TacticalBlueprint() {
  const { strategyId } = useParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentStage, setAgentStage] = useState(0);

  // Simulated Agent Timeline Stages
  const AGENT_STAGES = [
    { title: "Persona Intelligence", desc: "Profiling audience psychology...", icon: Users },
    { title: "Trend Sniper", desc: "Analyzing market gaps...", icon: Search },
    { title: "Traffic Architect", desc: "Extracting high-volume keywords...", icon: Activity },
    { title: "Strategy Synthesizer", desc: "Constructing tactical pillars...", icon: Target },
    { title: "ROI Predictor", desc: "Forecasting growth metrics...", icon: BarChart2 }
  ];

  // Effect for fetching data and simulating timeline
  useEffect(() => {
    let stageInterval;

    const fetchStrategy = async () => {
      try {
        setLoading(true);
        
        // Start simulated timeline progress
        setAgentStage(0);
        stageInterval = setInterval(() => {
          setAgentStage(prev => {
            if (prev < AGENT_STAGES.length - 1) return prev + 1;
            return prev;
          });
        }, 1500); // 1.5s per stage simulation

        const response = await strategyAPI.getBlueprint(strategyId);
        
        // Ensure we stop timeline when data arrives, but maybe let it finish visually?
        // For now, just set data.
        setStrategy(response.data.strategy || response.data); // Handle wrapped or direct
        
      } catch (err) {
        console.error("Failed to load strategy:", err);
        setError("Failed to load strategy. It might have been deleted or is invalid.");
      } finally {
        clearInterval(stageInterval);
        setAgentStage(AGENT_STAGES.length); // All done
        setLoading(false);
      }
    };

    if (strategyId) {
      fetchStrategy();
    }

    return () => clearInterval(stageInterval);
  }, [strategyId]);

  if (loading || (strategy && agentStage < AGENT_STAGES.length)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            <span className="animate-pulse">⚡ Orchestrating AI Agents...</span>
          </h2>
          
          <div className="space-y-6">
            {AGENT_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = index === agentStage;
              const isCompleted = index < agentStage;
              const isPending = index > agentStage;

              return (
                <div key={index} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500 scale-105' : 
                  isCompleted ? 'bg-green-50 dark:bg-green-900/10 border border-green-200' : 
                  'opacity-40 grayscale'
                }`}>
                  <div className={`p-3 rounded-full ${
                    isActive ? 'bg-primary-100 text-primary-600 animate-spin-slow' : 
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{stage.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isActive ? stage.desc : isCompleted ? "Completed" : "Waiting for context..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md">
           <div className="text-6xl mb-4">⚠️</div>
           <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Strategy Not Found</h2>
           <p className="text-gray-600 mb-6">{error || "Could not retrieve blueprint data."}</p>
           <button onClick={() => navigate('/history')} className="btn-primary">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
           </button>
        </div>
      </div>
    );
  }

  // Destructure for easier access
  const { strategic_overview, content_pillars, content_calendar, keywords, roi_prediction, metadata } = strategy;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & METADATA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/history')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                Tactical Growth Blueprint
              </h1>
              <div className="flex gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">⏱️ {(metadata?.generation_time || 0).toFixed(1)}s</span>
                <span>•</span>
                <span className="flex items-center gap-1">📊 Difficulty: {metadata?.difficulty_score}/10</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-600 font-bold">🚀 Velocity: {metadata?.growth_velocity_score}/100</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
                Download PDF
             </button>
          </div>
        </div>

        {/* 1. ROI & PREDICTION (Hero Section) */}
        {roi_prediction && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Traffic Lift</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{roi_prediction.traffic_lift_percentage}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-2"><Activity className="w-4 h-4"/> Engagement</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{roi_prediction.engagement_boost_percentage}</div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-2"><Users className="w-4 h-4"/> Reach Est.</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{roi_prediction.estimated_monthly_reach}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-amber-500">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-2"><Shield className="w-4 h-4"/> Risk Level</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{roi_prediction.risk_level}</div>
            </div>
          </div>
        )}

        {/* 2. STRATEGIC OVERVIEW */}
        {strategic_overview && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" /> Strategic Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <h3 className="font-bold text-primary-700 dark:text-primary-300 mb-2">Growth Objective</h3>
                  <p className="text-gray-700 dark:text-gray-300">{strategic_overview.growth_objective}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                   <h3 className="font-bold text-gray-900 dark:text-white mb-2">Target Persona</h3>
                   <p className="text-gray-700 dark:text-gray-300">{strategic_overview.target_persona_snapshot}</p>
                </div>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                   <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2">Competitive Edge</h3>
                   <p className="text-gray-700 dark:text-gray-300">{strategic_overview.competitive_edge}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                   <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">Positioning Angle</h3>
                   <p className="text-gray-700 dark:text-gray-300">{strategic_overview.positioning_angle}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. KEYWORDS & DISCOVERY */}
        {keywords && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" /> Discovery Engine
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Primary Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.primary?.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
               <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Hashtag Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.hashtags?.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. CONTENT PILLARS & SAMPLES */}
        {content_pillars && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <FileText className="w-6 h-6 text-indigo-500" /> Content Pillars
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {content_pillars.map((pillar, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pillar.pillar_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{pillar.why_it_works}</p>
                  </div>
                  <div className="p-4 space-y-4">
                    {pillar.sample_posts?.map((post, pIdx) => (
                      <div key={pIdx} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-sm">
                        <div className="font-bold text-primary-600 mb-1">{post.format}</div>
                        <div className="font-medium text-gray-900 dark:text-white mb-2">{post.hook}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs italic bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-600">
                          "{post.caption.substring(0, 100)}..."
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CALENDAR */}
        {content_calendar && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" /> Execution Calendar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {content_calendar.map((day, idx) => (
                <div key={idx} className="border dark:border-gray-700 rounded-xl p-4 flex flex-col h-full bg-gray-50 dark:bg-gray-700/20">
                  <span className="text-xs font-bold text-gray-400 uppercase mb-2">Day {day.day}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">{day.format}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{day.theme}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
