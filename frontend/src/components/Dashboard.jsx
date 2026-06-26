import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProPanel from "../pages/ProPanel";
import { 
  Sparkles, TrendingUp, Zap, ArrowRight, Calendar, 
  BarChart3, Trophy, AlertCircle, RefreshCw, CheckCircle, Clock
} from "lucide-react";
import { strategyAPI } from "../api";
import { safeDate } from "../utils/dateUtils";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  useEffect(() => {
    loadStrategies();
    fetchUsage();
  }, []);

  const loadStrategies = async () => {
    try {
      const data = await strategyAPI.getHistory();
      const strategiesArray = Array.isArray(data)
        ? data
        : data?.history || data?.strategies || [];
      setStrategies(strategiesArray);
    } catch (error) {
      console.error("Failed to load strategies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMonthlyUsage(data.usage_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    }
  };

  const stats = {
    total: strategies.length,
    thisMonth: monthlyUsage,
    limit: user?.tier === "pro" ? "Unlimited" : 3,
  };

  const successRate = useMemo(() => {
    if (strategies.length === 0) return 0;
    const ratedStrategies = strategies.filter(s => s.feedback || s.feedback_rating);
    if (ratedStrategies.length === 0) return 0;
    const successful = ratedStrategies.filter(s => {
      if (s.feedback && typeof s.feedback.rating === 'number') {
        return s.feedback.rating >= 3;
      }
      if (s.feedback_rating) {
        return s.feedback_rating === 'up';
      }
      return false;
    }).length;
    return Math.round((successful / ratedStrategies.length) * 100);
  }, [strategies]);

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

  if (user?.tier === "pro") {
    return <ProPanel />;
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Personalized Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-[#81ecff]">{user?.email?.split("@")[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Deploy your autonomous agents and audit your content calendars.
          </p>
        </div>
        <Button
          onClick={() => navigate("/planner")}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Strategy Swarm</span>
        </Button>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Swarms", value: stats.total, icon: Zap, glow: "indigo" },
          { label: "Usage This Month", value: `${stats.thisMonth} / ${stats.limit}`, icon: Calendar, glow: "emerald" },
          { label: "Success Rate", value: `${successRate}%`, icon: Trophy, glow: "amber" },
          { label: "Subscription", value: user?.tier?.toUpperCase() || "FREE", icon: TrendingUp, glow: "cyan" }
        ].map((item, i) => {
          const Icon = item.icon;
          const glowColors = {
            indigo: "indigo-500/10 border-indigo-500/10 text-indigo-400 bg-indigo-500/5",
            emerald: "emerald-500/10 border-emerald-500/10 text-emerald-400 bg-emerald-500/5",
            amber: "amber-500/10 border-amber-500/10 text-amber-400 bg-amber-500/5",
            cyan: "cyan-500/10 border-cyan-500/10 text-cyan-400 bg-cyan-500/5"
          };
          return (
            <div
              key={i}
              className="bg-[#090d16]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all duration-300"
            >
              {/* Subtle background glow effect */}
              <div className={`absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity bg-${item.glow}-500/10`} />

              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${glowColors[item.glow]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  {item.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Strategies Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Recent Deployments
            </h2>
            {strategies.length > 0 && (
              <button
                onClick={() => navigate("/history")}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
              >
                <span>View history</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {strategies.length > 0 ? (
              strategies.slice(0, 3).map((strategy, i) => (
                <div
                  key={strategy.id || i}
                  onClick={() => navigate(strategy.id ? `/blueprint/${strategy.id}` : "/history")}
                  className="bg-[#090d16]/50 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                        {strategy.title || "Untitled Strategy Swarm"}
                      </h3>
                      <Badge variant={strategy.platform === "LinkedIn" ? "primary" : "cyan"}>
                        {strategy.platform || "Multi-Channel"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {strategy.objective || "No objectives defined"}
                    </p>
                    <div className="flex items-center gap-4 text-[9px] uppercase font-black text-slate-600 tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {safeDate(strategy.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button className="p-3 bg-white/5 group-hover:bg-[#6200EE] rounded-xl text-slate-400 group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-[#090d16]/30 border border-dashed border-white/5 rounded-3xl p-12 text-center">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <h3 className="font-bold text-white text-sm">No Strategy Deployments Yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">Create your first AI multi-agent strategy campaign.</p>
                <Button onClick={() => navigate("/planner")} size="sm">
                  Create first strategy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            Workspace Hub
          </h2>

          {/* Pro Tip Card */}
          <div className="bg-gradient-to-br from-[#0c1224] to-[#080b13] border border-[#6200EE]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 blur-2xl rounded-full" />
            <Sparkles className="w-8 h-8 text-indigo-400 mb-6" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">Deploy Bold Mode</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
              Use "Bold Engine Mode" in the Strategic Planner to generate highly visionary hook concepts and maximize organic audience click-throughs.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/planner")}
              className="w-full text-xs font-bold"
            >
              Open Planner Swarm
            </Button>
          </div>

          {/* Analytics quick status */}
          <div className="bg-[#090d16]/50 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-slate-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Analytics Index</h4>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Post-publish audits</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unlock real-time reach data, click audits, and conversion KPIs for your strategies.
            </p>
            <button
              onClick={() => navigate("/analytics")}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
            >
              <span>View Analytics dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>

      {/* Recent Activity Logs */}
      {strategies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            Activity Timelines
          </h2>
          <div className="bg-[#090d16]/30 border border-white/5 rounded-2xl divide-y divide-white/5">
            {strategies.slice(0, 3).map((strategy, idx) => (
              <div
                key={strategy.id || idx}
                onClick={() => navigate("/history")}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-bold">
                    Strategy swarms compiled for: <span className="text-white">"{strategy.title}"</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {safeDate(strategy.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
