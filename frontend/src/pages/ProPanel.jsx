import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { strategyAPI } from '../api';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  History,
  Lock,
  Search,
  Globe
} from 'lucide-react';
import { alertUtils } from '../utils/alertUtils';

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
      setLoading(true);
      const [historyResponse, profileResponse] = await Promise.all([
        strategyAPI.getHistory(),
        fetch("/api/profile", {
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
      alertUtils.error("Error", "Failed to load Pro data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-white pt-24 pb-12 px-4 md:px-8 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12 animate-fade-in">
        
        {/* Pro Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Exclusive Pro Vault</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              Welcome back, {user?.email?.split('@')[0]}
            </h1>
            <p className="text-slate-400 text-lg mt-2">Your premium multi-agent workspace is ready.</p>
          </div>
          
          <div className="flex gap-4" data-aos="fade-left">
            <button 
              onClick={() => navigate('/planner')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] transition-all group active:scale-95"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              New Strategy
            </button>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Monthly Usage" 
            value={usage.used} 
            sub="of Unlimited" 
            icon={Zap} 
            color="indigo" 
            delay={100}
          />
          <StatCard 
            label="Total Strategies" 
            value={strategies.length} 
            sub="Managed items" 
            icon={History} 
            color="purple" 
            delay={200}
          />
          <StatCard 
            label="Avg. Growth" 
            value="+214%" 
            sub="Across strategies" 
            icon={TrendingUp} 
            color="emerald" 
            delay={300}
          />
          <StatCard 
            label="Agent Up-time" 
            value="99.9%" 
            sub="Priority queue" 
            icon={BarChart3} 
            color="amber" 
            delay={400}
          />
        </div>

        {/* Exclusive Feature Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Action Card */}
          <div className="lg:col-span-2 space-y-8">
             {/* Strategy History Quick Access */}
             <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black">Recent Deployments</h2>
                 <button onClick={() => navigate('/history')} className="text-indigo-400 font-bold flex items-center gap-1 hover:text-white transition-colors">
                   Full History <ArrowUpRight className="w-4 h-4" />
                 </button>
               </div>
               
               <div className="space-y-4">
                 {strategies.slice(0, 4).length > 0 ? (
                   strategies.slice(0, 4).map((s, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/item" onClick={() => navigate(`/blueprint/${s.id}`)}>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                             <Lock className="w-5 h-5 text-indigo-400 group-hover/item:scale-110 transition-transform" />
                           </div>
                           <div>
                             <h4 className="font-bold text-white group-hover/item:text-indigo-300 transition-colors">{s.goal || "Strategy Preview"}</h4>
                             <p className="text-xs text-slate-500">{s.platform} • {new Date(s.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 opacity-0 group-hover/item:opacity-100 transition-all text-indigo-400" />
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-12 text-slate-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No strategies found. Start creating one!</p>
                   </div>
                 )}
               </div>
             </div>

             {/* Analytics Preview Card */}
             <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/10 rounded-[2.5rem] p-8 relative group cursor-pointer" onClick={() => navigate('/analytics')}>
                <div className="absolute top-0 right-0 p-8">
                  <BarChart3 className="w-20 h-20 text-indigo-500/20" />
                </div>
                <h2 className="text-3xl font-black mb-2">Live Analytics View</h2>
                <p className="text-slate-400 max-w-sm mb-8">Access real-time engagement data and AI agent performance metrics for all strategies.</p>
                <div className="flex gap-12">
                   <div>
                     <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Reach</p>
                     <p className="text-2xl font-black">1.2M+</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Engagement</p>
                     <p className="text-2xl font-black">84.2K</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Side Panels */}
          <div className="space-y-8">
            {/* Pro Status Card */}
             <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
               <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <h3 className="text-2xl font-black mb-2">Pro Subscription</h3>
                    <p className="text-indigo-100/70 text-sm">Active Tier: Enterprise</p>
                 </div>
                 <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold">
                       <CheckCircle className="w-5 h-5" /> Unlimited Strategy Gen
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold">
                       <CheckCircle className="w-5 h-5" /> Real SEO Keywords
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold">
                       <CheckCircle className="w-5 h-5" /> Priority Agent Access
                    </div>
                 </div>
                 <button className="mt-12 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-2xl hover:scale-[1.02] transition-all">
                    Manage Billing
                 </button>
               </div>
             </div>

             {/* SEO Insights Panel */}
             <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Search className="w-5 h-5 text-indigo-400" /> SEO Trending
                </h3>
                <div className="space-y-4">
                   <TrendingTopic label="AI Content Automation" surge="+412%" />
                   <TrendingTopic label="Multi-Agent Systems" surge="+214%" />
                   <TrendingTopic label="SAAS Marketing 2026" surge="+185%" />
                   <TrendingTopic label="Content Orchestration" surge="+98%" />
                </div>
                <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 transition-all">
                  Load More Trends
                </button>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Subcomponents
function StatCard({ label, value, sub, icon: Icon, color, delay }) {
  const colorMap = {
    indigo: 'from-indigo-600/20 border-indigo-500/30 text-indigo-400',
    purple: 'from-purple-600/20 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-600/20 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-600/20 border-amber-500/30 text-amber-400'
  };

  return (
    <div 
      data-aos="fade-up" data-aos-delay={delay}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:bg-white/[0.08] transition-all`}
    >
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${colorMap[color].split(' ')[0]} blur-2xl opacity-20 group-hover:opacity-40 transition-all`}></div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${colorMap[color].split(' ')[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-slate-400 text-sm font-bold">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-white">{value}</span>
          <span className="text-xs text-slate-500 font-medium">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function TrendingTopic({ label, surge }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span className="text-xs font-black text-emerald-400">{surge}</span>
    </div>
  );
}

function CheckCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
