import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  TrendingUp,
  Users,
  Zap,
  Search,
  Globe,
  RefreshCw,
  CreditCard,
  Activity,
  ArrowUpRight,
  Sparkles,
  Play
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { safeDate } from "../utils/dateUtils";
import Skeleton from "../components/ui/skeleton";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "";
const RANGE_OPTIONS = [7, 30];
const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

function formatCompactNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function formatAxisDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function filterUsageHistory(history, days) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  return history.filter((item) => {
    const parsed = new Date(item.date);
    return !Number.isNaN(parsed.getTime()) && parsed >= cutoff;
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const formattedLabel = safeDate(label);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#070b15]/90 px-4 py-3 shadow-2xl backdrop-blur-xl transition-colors duration-300">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        {formattedLabel === "—" ? label || "Data point" : formattedLabel}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs font-bold text-slate-300">
          <span className="text-slate-500">{entry.name}</span>
          <span className="font-semibold text-white">
            {entry.value?.toLocaleString?.() ?? entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState(30);
  const [heroData, setHeroData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [billingData, setBillingData] = useState(null);

  const hasAnalyticsAccess = user?.tier === "pro" || user?.tier === "enterprise";

  useEffect(() => {
    if (hasAnalyticsAccess && token) {
      fetchAnalytics();
    }
  }, [hasAnalyticsAccess, token]);

  const fetchAnalytics = async (isRefresh = false) => {
    if (!token) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [heroRes, analyticsRes, billingRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile`, { headers }),
        fetch(`${API_BASE}/api/analytics/profile`, { headers }),
        fetch(`${API_BASE}/api/profile/billing`, { headers }),
      ]);

      if (!heroRes.ok || !analyticsRes.ok || !billingRes.ok) {
        throw new Error("Failed to load analytics data");
      }

      const [hero, analytics, billing] = await Promise.all([
        heroRes.json(),
        analyticsRes.json(),
        billingRes.json(),
      ]);

      setHeroData(hero);
      setAnalyticsData(analytics);
      setBillingData(billing);
    } catch (fetchError) {
      console.error("[ANALYTICS] Failed to load analytics:", fetchError);
      setError("Could not load your analytics right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const usageHistory = useMemo(
    () => filterUsageHistory(analyticsData?.usage_history || [], selectedRange),
    [analyticsData, selectedRange],
  );

  const topIndustries = useMemo(
    () => (analyticsData?.top_industries || []).slice(0, 6),
    [analyticsData],
  );

  const totalStrategies = heroData?.total_strategies || analyticsData?.total_strategies || 0;
  const tokensThisMonth = heroData?.tokens_used_month || 0;
  const totalTokens = analyticsData?.total_tokens || 0;
  const activeDays = usageHistory.filter((item) => item.strategies > 0).length;
  const totalWindowStrategies = usageHistory.reduce(
    (sum, item) => sum + (item.strategies || 0),
    0,
  );
  const averagePerActiveDay = activeDays
    ? (totalWindowStrategies / activeDays).toFixed(1)
    : "0.0";
  const usagePercent =
    billingData?.monthly_limit && billingData.monthly_limit < 999
      ? Math.min(
          100,
          Math.round((billingData.used_this_month / billingData.monthly_limit) * 100),
        )
      : 0;

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background glow pools */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse-slow" />

        <div className="max-w-xl w-full text-center relative z-10">
          <div className="bg-[#0c0f1d]/30 border border-indigo-500/20 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
              <Lock className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(129,236,255,0.6)]" />
            </div>

            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight mb-4">
              Intelligence Command Center Locked
            </h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Unlock full telemetry of your strategy swarms, compute tokens, and monthly limits with Planvix Pro.
            </p>

            <Button
              variant="primary"
              onClick={() => navigate("/upgrade")}
              className="w-full flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden font-sans pb-16 space-y-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Live Swarm Telemetry
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight">
            Analytics Command Center
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Monitor strategy outputs, computed AI tokens, and overall performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0c0f1d]/60 border border-white/5 p-1 rounded-xl flex text-xs font-bold text-slate-400 shadow-xl backdrop-blur-md">
            {RANGE_OPTIONS.map((days) => (
              <button
                key={days}
                onClick={() => setSelectedRange(days)}
                className={`px-4 py-2 rounded-lg transition-all uppercase tracking-wider ${
                  selectedRange === days
                    ? "bg-white/10 text-white shadow-lg"
                    : "hover:text-white hover:bg-white/5"
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            className="flex items-center gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync Telemetry
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-6 py-4 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl h-32 space-y-4">
                <Skeleton variant="avatar" className="w-10 h-10 rounded-xl" />
                <Skeleton variant="title" className="w-1/2 h-5" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl h-80 space-y-6">
                <Skeleton variant="title" className="w-48 h-6" />
                <Skeleton variant="rect" className="w-full h-44" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Strategies"
              value={totalStrategies.toLocaleString()}
              helper={`${totalWindowStrategies} in last ${selectedRange} days`}
              icon={Activity}
              tone="emerald"
            />
            <StatCard
              title="Tokens Computed"
              value={formatCompactNumber(tokensThisMonth)}
              helper={`${formatCompactNumber(totalTokens)} total all-time`}
              icon={Zap}
              tone="indigo"
            />
            <StatCard
              title="Active Swarms"
              value={activeDays.toLocaleString()}
              helper={`${averagePerActiveDay} avg strategies/day`}
              icon={TrendingUp}
              tone="purple"
            />
            <StatCard
              title="Top Industry"
              value={analyticsData?.most_active_industry || "N/A"}
              helper={`${topIndustries.length} tracked industries`}
              icon={Globe}
              tone="amber"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PanelCard
              title="Strategy Swarm Pulse"
              subtitle={`Volume of campaigns generated in the last ${selectedRange} days`}
              icon={<Activity className="w-4 h-4 text-emerald-400" />}
            >
              {usageHistory.length === 0 ? (
                <EmptyState message="No strategy activity recorded in this window." />
              ) : (
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#64748b" }}
                        tickFormatter={formatAxisDate}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#64748b" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="strategies" name="Strategies" radius={[4, 4, 0, 0]}>
                        {usageHistory.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PanelCard>

            <PanelCard
              title="Compute Token Consumption"
              subtitle={`Daily token consumption levels in the last ${selectedRange} days`}
              icon={<Zap className="w-4 h-4 text-pink-400" />}
            >
              {usageHistory.length === 0 ? (
                <EmptyState message="Compute token statistics will populate on swarm generation." />
              ) : (
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageHistory}>
                      <defs>
                        <linearGradient id="tokenGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#64748b" }}
                        tickFormatter={formatAxisDate}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="tokens"
                        name="Tokens"
                        stroke="#ec4899"
                        strokeWidth={2}
                        fill="url(#tokenGlow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PanelCard>
          </div>

          {/* Industry breakdown & Billing */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <PanelCard
              title="Industry Specialization"
              subtitle="Breakdown of sectors targeted by generated strategies"
              icon={<Search className="w-4 h-4 text-cyan-400" />}
              className="xl:col-span-2"
            >
              {topIndustries.length === 0 ? (
                <EmptyState message="Generate a few strategies to build industry-level insights." />
              ) : (
                <div className="h-[260px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topIndustries}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="industry"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                        width={90}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="count" name="Strategies" radius={[0, 4, 4, 0]}>
                        {topIndustries.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PanelCard>

            <PanelCard
              title="Usage Billing Snapshot"
              subtitle="Plan status and account quotas"
              icon={<CreditCard className="w-4 h-4 text-amber-400" />}
            >
              <div className="space-y-4 mt-4">
                <InfoRow label="Active Tier" value={billingData?.plan || user?.tier?.toUpperCase() || "-"} />
                <InfoRow
                  label="Monthly Swarm Quota"
                  value={billingData?.monthly_limit >= 999 ? "Unlimited" : `${billingData?.monthly_limit || 0}`}
                />
                <InfoRow
                  label="Used This Month"
                  value={`${billingData?.used_this_month || 0}`}
                />
                <InfoRow
                  label="Renewal Schedule"
                  value={billingData?.renewal_date ? safeDate(billingData.renewal_date) : "-"}
                />

                {billingData?.monthly_limit < 999 && (
                  <div className="pt-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Quota Consumption</span>
                      <span>{usagePercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5 border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </PanelCard>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, helper, icon: Icon, tone }) {
  const toneClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0c0f1d]/20 p-6 flex flex-col justify-between hover:border-white/10 transition-colors backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-3xl font-black tracking-tight text-white">{value}</p>
        </div>
        <div className={`rounded-xl border p-2.5 ${toneClasses[tone] || toneClasses.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-[10px] font-semibold text-slate-500">{helper}</p>
    </div>
  );
}

function PanelCard({ title, subtitle, icon, children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/5 bg-[#0c0f1d]/20 p-6 backdrop-blur-xl relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

      <div className="mb-4 flex items-center gap-3">
        {icon && <div className="p-2 bg-white/5 rounded-xl border border-white/5">{icon}</div>}
        <div>
          <h2 className="text-base font-black text-white font-['Manrope']">{title}</h2>
          {subtitle && <p className="text-[10px] text-slate-500 font-semibold">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3">
      <span className="text-xs text-slate-500 font-bold">{label}</span>
      <span className="text-xs font-bold text-slate-200 text-right">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01] px-6 text-center text-xs text-slate-500">
      {message}
    </div>
  );
}
