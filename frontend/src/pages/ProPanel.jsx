import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { strategyAPI } from '../api';
import { 
  Zap, TrendingUp, BarChart3, Calendar, Sparkles, 
  ShieldCheck, ArrowUpRight, History, Lock, Search, Globe, Clock
} from 'lucide-react';
import { alertUtils } from '../utils/alertUtils';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ProPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ used: 0, limit: "Unlimited" });

  useEffect(() => {
    loadProData();
  }, []);

  const loadProData = async () => {
    try {
      const [historyResponse, profileResponse] = await Promise.all([
        strategyAPI.getHistory(),
        fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then(res => res.json())
      ]);

      const history = Array.isArray(historyResponse) 
        ? historyResponse 
        : historyResponse?.history || [];
      
      setStrategies(history);
      setUsage({
        used: profileResponse.usage_count || 0,
        limit: "Unlimited"
      });
    } catch (error) {
      console.error("Pro Panel load error:", error);
      alertUtils.error("Error", "Failed to load Pro workspace data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-3xl border border-white/5" />
          <div className="h-96 bg-white/5 rounded-3xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Pro Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Exclusive Pro Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">Your premium multi-agent workspace is online.</p>
        </div>
        
        <Button 
          onClick={() => navigate('/planner')}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Strategy Swarm</span>
        </Button>
      </header>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Monthly Usage" 
          value={usage.used} 
          sub="of Unlimited" 
          icon={Zap} 
          glow="indigo" 
        />
        <StatCard 
          label="Total Strategies" 
          value={strategies.length} 
          sub="Managed items" 
          icon={History} 
          glow="purple" 
        />
        <StatCard 
          label="Avg. Growth" 
          value="+214%" 
          sub="Across strategies" 
          icon={TrendingUp} 
          glow="emerald" 
        />
        <StatCard 
          label="Agent Up-time" 
          value="99.9%" 
          sub="Priority queue" 
          icon={BarChart3} 
          glow="amber" 
        />
      </div>

      {/* Exclusive Feature Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Action Card */}
        <div className="lg:col-span-2 space-y-8">
           {/* Strategy History Quick Access */}
           <div className="bg-[#090d16]/50 border border-white/5 rounded-[2rem] p-6 space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-lg font-black text-white uppercase tracking-wider">Recent Deployments</h2>
               <button onClick={() => navigate('/history')} className="text-xs font-bold text-indigo-400 hover:text-[#81ecff] flex items-center gap-1 group">
                 <span>Full history</span>
                 <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
               </button>
             </div>
             
             <div className="space-y-4">
               {strategies.slice(0, 4).length > 0 ? (
                 strategies.slice(0, 4).map((s, i) => (
                   <div 
                     key={i} 
                     className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer group" 
                     onClick={() => navigate(`/blueprint/${s.id}`)}
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                           <Lock className="w-4 h-4" />
                         </div>
                         <div>
                           <h4 className="font-bold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">
                             {s.goal || "Strategy Preview"}
                           </h4>
                           <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                             {s.platform} • {new Date(s.created_at || s.createdAt).toLocaleDateString()}
                           </p>
                         </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                   </div>
                 ))
               ) : (
                 <div className="text-center py-12 text-slate-500">
                    <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-xs">No strategy deployments found. Start creating one!</p>
                 </div>
               )}
             </div>
           </div>

           {/* Analytics Preview Card */}
           <div 
             className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-[2rem] p-6 relative group cursor-pointer hover:border-indigo-500/30 transition-all" 
             onClick={() => navigate('/analytics')}
           >
              <div className="absolute top-4 right-4 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <BarChart3 className="w-16 h-16" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-1">Live Analytics View</h2>
              <p className="text-slate-500 text-xs max-w-sm mb-6">Access real-time engagement data and AI agent performance metrics for all strategies.</p>
              <div className="flex gap-12">
                 <div>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Reach</p>
                   <p className="text-2xl font-black text-white">1.2M+</p>
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Engagement</p>
                   <p className="text-2xl font-black text-white">84.2K</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Pro Status Card */}
           <div className="bg-gradient-to-b from-[#6200EE] to-[#3b00a0] rounded-[2rem] p-6 relative overflow-hidden shadow-2xl">
             <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
             <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Pro Subscription</h3>
                  <p className="text-indigo-100/60 text-xs font-semibold">Active Tier: Enterprise Pro</p>
               </div>
               <div className="my-8 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                     <CheckCircle className="w-4 h-4 text-emerald-400" /> <span>Unlimited Strategy Gen</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                     <CheckCircle className="w-4 h-4 text-emerald-400" /> <span>Real SEO Keywords</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                     <CheckCircle className="w-4 h-4 text-emerald-400" /> <span>Priority Agent Access</span>
                  </div>
               </div>
               <Button 
                 onClick={() => navigate('/profile')}
                 className="w-full bg-white hover:bg-slate-100 text-indigo-600 border-none font-bold text-xs"
               >
                  Manage Billing
               </Button>
             </div>
           </div>

           {/* SEO Insights Panel */}
           <div className="bg-[#090d16]/50 border border-white/5 rounded-[2rem] p-6 space-y-6">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400 animate-pulse" /> SEO Trending
              </h3>
              <div className="space-y-4">
                 <TrendingTopic label="AI Content Automation" surge="+412%" />
                 <TrendingTopic label="Multi-Agent Systems" surge="+214%" />
                 <TrendingTopic label="SAAS Marketing 2026" surge="+185%" />
                 <TrendingTopic label="Content Orchestration" surge="+98%" />
              </div>
              <button 
                onClick={() => navigate('/planner')}
                className="w-full py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
              >
                Plan Trending Swarm
              </button>
           </div>
        </div>

      </div>

    </div>
  );
}

// Subcomponents
function StatCard({ label, value, sub, icon: Icon, glow }) {
  const glowColors = {
    indigo: "indigo-500/10 border-indigo-500/10 text-indigo-400",
    purple: "purple-500/10 border-purple-500/10 text-purple-400",
    emerald: "emerald-500/10 border-emerald-500/10 text-emerald-400",
    amber: "amber-500/10 border-amber-500/10 text-amber-400"
  };
  return (
    <div className="bg-[#090d16]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-20 h-24 blur-2xl rounded-full opacity-35 bg-${glow}-500/10`} />
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${glowColors[glow]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-[10px] font-medium text-slate-500">{sub}</span>
      </div>
    </div>
  );
}

function TrendingTopic({ label, surge }) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold py-1">
      <span className="text-slate-400">{label}</span>
      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-black">
        {surge}
      </span>
    </div>
  );
}

function CheckCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
