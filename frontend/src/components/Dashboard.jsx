import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProPanel from "../pages/ProPanel";
import {
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  Calendar,
  BarChart3,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { strategyAPI } from "../api";
import { safeDate } from "../utils/dateUtils";
import Skeleton from "./ui/skeleton";

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
      const data = await strategyAPI.getHistory(); // Already returns response.data
      console.log("[DASHBOARD] API response:", data);

      // Normalize response - backend may return array or {history: [...]}
      const strategiesArray = Array.isArray(data)
        ? data
        : data?.history || data?.strategies || [];

      console.log("[DASHBOARD] Extracted strategies:", strategiesArray);
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
    thisMonth: monthlyUsage, // Server-authoritative usage count
    limit: user?.tier === "pro" ? "Unlimited" : 3,
  };

  // Calculate success rate from feedback data
  const successRate = useMemo(() => {
    if (strategies.length === 0) return 0;

    // Count strategies that have positive feedback (rating >= 3, or "up" rating)
    const ratedStrategies = strategies.filter(s => s.feedback || s.feedback_rating);
    if (ratedStrategies.length === 0) return 0;

    // Handle both numeric rating (1-5) and string "up"/"down"
    const successful = ratedStrategies.filter(s => {
      if (s.feedback && typeof s.feedback.rating === 'number') {
        return s.feedback.rating >= 3; // 3+ out of 5 is success
      }
      if (s.feedback_rating) {
        return s.feedback_rating === 'up';
      }
      return false;
    }).length;

    return Math.round((successful / ratedStrategies.length) * 100);
  }, [strategies]);

  if (user?.tier === "pro") {
    return <ProPanel />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div data-aos="fade-right">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Welcome back, <span className="text-primary-600">{user?.email?.split("@")[0]}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Here's what's happening with your content strategies.
            </p>
          </div>
          <button
            onClick={() => navigate("/planner")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-1 active:scale-95"
            data-aos="fade-left"
          >
            <Sparkles className="w-5 h-5" />
            Create New Strategy
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Total Strategies",
              value: stats.total,
              icon: Zap,
              color: "text-blue-600",
              bg: "bg-blue-100 dark:bg-blue-900/30",
            },
            {
              label: "Usage This Month",
              value: stats.thisMonth,
              limit: `/${stats.limit}`,
              icon: Calendar,
              color: "text-emerald-600",
              bg: "bg-emerald-100 dark:bg-emerald-900/30",
            },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              icon: Trophy,
              color: "text-amber-600",
              bg: "bg-amber-100 dark:bg-amber-900/30",
            },
            {
              label: "Active Plan",
              value: user?.tier?.toUpperCase() || "FREE",
              icon: TrendingUp,
              color: "text-purple-600",
              bg: "bg-purple-100 dark:bg-purple-900/30",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                {loading ? (
                  <Skeleton variant="title" className="w-20" />
                ) : (
                  <>
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                    {stat.limit && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {stat.limit}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Strategies List */}
          <div className="lg:col-span-2 space-y-6" data-aos="fade-right">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recent Strategies
              </h2>
              <button
                onClick={() => navigate("/history")}
                className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-6 rounded-2xl">
                    <Skeleton variant="title" className="mb-4" />
                    <Skeleton variant="text" className="w-1/2" />
                  </div>
                ))
              ) : strategies.length > 0 ? (
                strategies.slice(0, 3).map((strategy, i) => (
                  <div
                    key={strategy.id || i}
                    className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5 hover:border-primary-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                          {strategy.title || "Untitled Strategy"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                          {strategy.objective || "No objective defined"}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {safeDate(strategy.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            {strategy.platform || "Multi-Platform"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/history")}
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-12 rounded-2xl text-center border-2 border-dashed border-gray-300 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No strategies yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start by creating your first AI-powered content strategy.
                  </p>
                  <button
                    onClick={() => navigate("/planner")}
                    className="text-primary-600 font-bold hover:underline"
                  >
                    Create your first strategy →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Tips */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl shadow-primary-600/20" data-aos="fade-left">
              <Sparkles className="w-10 h-10 mb-6 opacity-50" />
              <h3 className="text-2xl font-black mb-2">Pro Tip</h3>
              <p className="text-primary-100 mb-6 font-medium leading-relaxed">
                Try using the "Deep Research" mode for more comprehensive strategy insights and detailed content blueprints.
              </p>
              <button
                onClick={() => navigate("/planner")}
                className="w-full py-3 bg-white text-primary-700 rounded-xl font-bold hover:bg-primary-50 transition-colors"
              >
                Try it now
              </button>
            </div>

            {/* Analytics (Coming Soon) */}
            <div className="glass-card p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 opacity-60" data-aos="fade-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-200 dark:bg-gray-800 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track performance metrics and ROI for your content strategies
              </p>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - If strategies exist */}
        {strategies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" data-aos="fade-up">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {strategies.slice(0, 3).map((strategy, index) => (
                <button
                  key={strategy.id || index}
                  onClick={() => navigate("/history")}
                  className="w-full glass-card p-4 rounded-xl transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5 group flex items-center justify-between"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {strategy.title || "Untitled Strategy"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {safeDate(strategy.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
