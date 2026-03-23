import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, TrendingUp, Users, Zap, FileText, ArrowUpRight } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Subscription Wall
  if (user?.tier !== 'pro') {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0e12] flex items-center justify-center p-6 relative overflow-hidden font-sans">
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0e12] text-white p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6200EE]/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#81ecff]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10 space-y-8 animate-fade-in">
        
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent font-['Manrope'] tracking-tight mb-2">Analytics</h1>
            <p className="text-gray-400 font-medium">Real-time engagement & agent performance.</p>
          </div>
          <div className="bg-[#18191e]/80 backdrop-blur-md rounded-xl p-1 border border-white/5 flex text-sm font-semibold text-gray-400">
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg shadow-sm">30 Days</button>
            <button className="px-4 py-2 hover:text-white transition-colors">90 Days</button>
            <button className="px-4 py-2 hover:text-white transition-colors">1 Year</button>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Content ROI" value="384%" trend="+12%" icon={TrendingUp} color="from-[#81ecff] to-[#005762]" />
          <KpiCard title="Audience Growth" value="12.4k" trend="+4.2%" icon={Users} color="from-[#a68cff] to-[#591adc]" />
          <KpiCard title="Agent Efficiency" value="98.2%" trend="+1.1%" icon={Zap} color="from-[#81ecff] to-[#6200EE]" />
          <KpiCard title="Total Posts" value="1,402" trend="+84" icon={FileText} color="from-[#591adc] to-[#25006b]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-[#121318]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative group">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold font-['Manrope'] text-white">Engagement Over Time</h2>
              <button className="text-sm font-bold text-[#81ecff] flex items-center gap-1 hover:text-white transition-colors">
                Detailed Report <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Elegant Line Chart Representation */}
            <div className="h-[300px] w-full flex items-end justify-between relative px-4">
              {/* Soft Gradient Bloom behind chart */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#6200EE]/10 to-transparent bottom-[10%] opacity-50 pointer-events-none"></div>
              
              {/* Fake Data Lines/Points */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M 0 250 Q 150 200 300 230 T 600 150 T 900 80" stroke="url(#lineGradient)" strokeWidth="4" fill="none" className="drop-shadow-[0_0_10px_rgba(98,0,238,0.5)]" />
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#81ecff" />
                    <stop offset="50%" stopColor="#a68cff" />
                    <stop offset="100%" stopColor="#6200EE" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Tooltip Dot */}
              <div className="absolute bottom-[80px] right-[0%] w-4 h-4 bg-white rounded-full border-4 border-[#6200EE] shadow-[0_0_20px_#81ecff] animate-pulse"></div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#121318]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
             <h2 className="text-xl font-bold font-['Manrope'] text-white mb-6">Top Performing Agents</h2>
             
             <div className="space-y-6">
               <LeaderboardItem name="Tech Writer Alpha" niche="Software Engineering" score={98} color="bg-[#81ecff]" />
               <LeaderboardItem name="Marketing Pro" niche="SEO & Growth" score={92} color="bg-[#a68cff]" />
               <LeaderboardItem name="Social Media Guru" niche="Twitter/X Viral" score={85} color="bg-[#6200EE]" />
               <LeaderboardItem name="UX Researcher" niche="Design Trends" score={76} color="bg-[#00d4ec]" />
               <LeaderboardItem name="Data Analyst" niche="Industry Reports" score={68} color="bg-[#591adc]" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents
function KpiCard({ title, value, trend, icon: Icon, color }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-[#121318]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg relative overflow-hidden group">
      {/* Glow on hover */}
      <div className={`absolute -inset-10 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#18191e] border border-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold ${isPositive ? 'bg-[#003840] text-[#81ecff]' : 'bg-[#490013] text-[#ffb2b9]'}`}>
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function LeaderboardItem({ name, niche, score, color }) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-[#18191e] border border-white/10 flex items-center justify-center font-bold text-gray-400 group-hover:text-white transition-colors">
             {name.charAt(0)}
           </div>
           <div>
             <p className="text-sm font-bold text-white group-hover:text-[#81ecff] transition-colors">{name}</p>
             <p className="text-xs text-gray-500">{niche}</p>
           </div>
        </div>
        <span className="text-xs font-bold text-white">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#18191e] rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${color} rounded-full shadow-[0_0_10px_currentColor]`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}
