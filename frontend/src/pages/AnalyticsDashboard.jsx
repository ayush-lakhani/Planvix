import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, TrendingUp, Users, Zap, FileText, ArrowUpRight, MousePointer2, Share2, MessageSquare, Target, Search, Globe } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Subscription Wall
  if (user?.tier !== 'pro') {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0e12] flex items-center justify-center p-6 relative overflow-hidden font-sans pt-24">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6200EE]/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#81ecff]/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-xl w-full text-center relative z-10 animate-fade-in">
          <div className="bg-[#121318]/60 backdrop-blur-2xl border border-[#a68cff]/20 rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(98,0,238,0.2)]">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1e1f25] to-[#0d0e12] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5 relative group">
              <div className="absolute inset-0 bg-[#6200EE]/20 rounded-2xl blur-md group-hover:blur-xl transition-all"></div>
              <Lock className="w-10 h-10 text-[#81ecff] relative z-10 drop-shadow-[0_0_10px_rgba(129,236,255,0.8)]" />
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a68cff] mb-4 font-['Manrope'] tracking-tight">
              Pro Analytics Locked
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Unlock the Ethereal Analytics engine. See real-time ROI, agent efficiency metrics, and deep audience engagement charts.
            </p>

            <button
              onClick={() => navigate('/upgrade')}
              className="w-full relative group bg-gradient-to-r from-[#6200EE] to-[#3b00a0] py-4 rounded-xl text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(98,0,238,0.5)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#81ecff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-[#81ecff]" />
                Upgrade to Pro
              </span>
            </button>
            <p className="text-[#abaab0] text-sm mt-6">Only available for Enterprise Pro users.</p>
          </div>
        </div>
      </div>
    );
  }

  // Analytics Dashboard for Pro Users
  return (
    <div className="min-h-screen bg-[#06070a] text-white p-6 md:p-12 relative overflow-hidden font-sans pt-24">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6200EE]/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#81ecff]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10 space-y-10 animate-fade-in">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Agent Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent font-['Manrope'] tracking-tight mb-2">Ethereal Analytics</h1>
            <p className="text-gray-400 font-medium text-lg">Predictive growth models & multi-agent efficiency tracking.</p>
          </div>
          <div className="bg-[#18191e]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 flex text-sm font-bold text-gray-400 shadow-2xl">
            {['7 Days', '30 Days', '90 Days', '1 Year'].map((label, idx) => (
              <button key={idx} className={`px-5 py-2.5 rounded-xl transition-all ${idx === 1 ? 'bg-white/10 text-white shadow-lg' : 'hover:text-white hover:bg-white/5'}`}>
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Projected ROI" value="412%" trend="+24%" icon={TrendingUp} color="emerald" delay={100} />
          <KpiCard title="Network Reach" value="2.4M" trend="+8.2%" icon={Users} color="indigo" delay={200} />
          <KpiCard title="Agent Precision" value="99.4%" trend="+0.8%" icon={Target} color="purple" delay={300} />
          <KpiCard title="Strategy Velocity" value="3.4x" trend="+1.2x" icon={Zap} color="amber" delay={400} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-[#121318]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
               <TrendingUp className="w-64 h-64 text-indigo-500" />
            </div>
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Growth Trajectory</h2>
                <p className="text-sm text-gray-500">Comparing manual vs Agent-powered cycles.</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div> pro cycle
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-gray-700"></div> manual
                 </div>
              </div>
            </div>
            
            {/* Elegant Line Chart Representation */}
            <div className="h-[350px] w-full flex items-end justify-between relative px-4">
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent bottom-[10%] opacity-30 pointer-events-none"></div>
              
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 350">
                <defs>
                   <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#81ecff" />
                      <stop offset="50%" stopColor="#6200EE" />
                      <stop offset="100%" stopColor="#ff0080" />
                   </linearGradient>
                </defs>
                {/* Manual Path */}
                <path d="M 0 300 Q 250 280 500 290 T 1000 240" stroke="#374151" strokeWidth="2" strokeDasharray="8,8" fill="none" />
                {/* Pro Path */}
                <path d="M 0 320 Q 200 250 400 200 T 800 80 T 1000 20" stroke="url(#lineGradient)" strokeWidth="6" fill="none" className="drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              </svg>
              
              {/* Animated Tooltip Point */}
              <div className="absolute top-[80px] right-[20%] w-6 h-6 bg-white rounded-full border-[6px] border-indigo-600 shadow-[0_0_30px_#6366f1] animate-bounce-slow">
                 <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1.5 rounded-lg font-black text-sm whitespace-nowrap">
                   +412% Peak Reach
                 </div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="space-y-6">
             <div className="bg-[#121318]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8">
                <h2 className="text-xl font-black mb-8 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Interaction Heatmap
                </h2>
                <div className="space-y-6">
                   <MetricRow label="Click Through Rate" value="12.4%" color="bg-indigo-500" progress={85} />
                   <MetricRow label="Share Velocity" value="84/hr" color="bg-purple-500" progress={65} />
                   <MetricRow label="Retention Rate" value="92.1%" color="bg-emerald-500" progress={92} />
                   <MetricRow label="Conversion Prob." value="8.4%" color="bg-amber-500" progress={45} />
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer">
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
                <h3 className="text-2xl font-black mb-2">Priority Agent Queue</h3>
                <p className="text-indigo-100/70 text-sm mb-6">Your requests are processed by Tier-1 logic nodes, bypassing the standard waitlist.</p>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest bg-white/10 p-4 rounded-2xl">
                   <span>Status: Active</span>
                   <span className="text-emerald-300">0ms Delay</span>
                </div>
             </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <DetailedMetricCard title="Persona Matches" icon={Users} value="98/100" desc="Audience alignment precision" />
           <DetailedMetricCard title="Keyword Density" icon={Search} value="Optimal" desc="Search engine readability score" />
           <DetailedMetricCard title="Platform Adapt" icon={Globe} value="Tier-A" desc="Cross-platform content compatibility" />
        </div>

      </div>
    </div>
  );
}

// Subcomponents
function KpiCard({ title, value, trend, icon: Icon, color, delay }) {
  const colorStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-black',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-black'
  };

  return (
    <div 
      style={{ animationDelay: `${delay}ms` }}
      className="bg-[#121318]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:bg-white/[0.08] transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <div className={`px-3 py-1 rounded-full text-xs ${colorStyles[color]}`}>
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color, progress }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function DetailedMetricCard({ title, icon: Icon, value, desc }) {
  return (
    <div className="bg-[#121318]/20 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-indigo-500/30 transition-all group">
      <div className="flex items-center gap-4 mb-3">
         <Icon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
         <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">{title}</h4>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-gray-600 font-medium">{desc}</p>
    </div>
  );
}
