import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
    <div className="rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        {formattedLabel === "—" ? label || "Data point" : formattedLabel}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-400">{entry.name}</span>
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
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0e12] flex items-center justify-center p-6 relative overflow-hidden font-sans pt-24">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6200EE]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#81ecff]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-xl w-full text-center relative z-10 animate-fade-in">
          <div className="bg-[#121318]/60 backdrop-blur-2xl border border-[#a68cff]/20 rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(98,0,238,0.2)]">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1e1f25] to-[#0d0e12] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5 relative group">
              <div className="absolute inset-0 bg-[#6200EE]/20 rounded-2xl blur-md group-hover:blur-xl transition-all" />
              <Lock className="w-10 h-10 text-[#81ecff] relative z-10 drop-shadow-[0_0_10px_rgba(129,236,255,0.8)]" />
            </div>

            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a68cff] mb-4 font-['Manrope'] tracking-tight">
              Pro Analytics Locked
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Upgrade to Pro to unlock your live strategy activity, token usage, and account analytics.
            </p>

            <button
              onClick={() => navigate("/upgrade")}
              className="w-full relative group bg-gradient-to-r from-[#6200EE] to-[#3b00a0] py-4 rounded-xl text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(98,0,238,0.5)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#81ecff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-[#81ecff]" />
                Upgrade to Pro
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-white p-6 md:p-12 relative overflow-hidden font-sans pt-24">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6200EE]/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#81ecff]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10 space-y-8 animate-fade-in">
        <header className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Live Pro Analytics
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent font-['Manrope'] tracking-tight mb-2">
              Analytics Command Center
            </h1>
            <p className="text-gray-400 font-medium text-lg">
              Real account activity from your strategies, token usage, and billing profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#18191e]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 flex text-sm font-bold text-gray-400 shadow-2xl">
              {RANGE_OPTIONS.map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedRange(days)}
                  className={`px-5 py-2.5 rounded-xl transition-all ${
                    selectedRange === days
                      ? "bg-white/10 text-white shadow-lg"
                      : "hover:text-white hover:bg-white/5"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchAnalytics(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 rounded-[2rem] border border-white/5 bg-white/[0.04] animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[380px] rounded-[2rem] border border-white/5 bg-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Total Strategies"
                value={totalStrategies.toLocaleString()}
                helper={`${totalWindowStrategies} in last ${selectedRange} days`}
                icon={Activity}
                tone="emerald"
              />
              <StatCard
                title="Tokens This Month"
                value={formatCompactNumber(tokensThisMonth)}
                helper={`${formatCompactNumber(totalTokens)} total all-time`}
                icon={Zap}
                tone="indigo"
              />
              <StatCard
                title="Active Days"
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PanelCard
                title="Strategy Activity"
                subtitle={`Daily strategy generation for the last ${selectedRange} days`}
                icon={<Activity className="w-4 h-4 text-emerald-400" />}
              >
                {usageHistory.length === 0 ? (
                  <EmptyState message="No strategy activity recorded in the selected window yet." />
                ) : (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usageHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415533" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickFormatter={formatAxisDate}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
                        <Bar dataKey="strategies" name="Strategies" radius={[6, 6, 0, 0]}>
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
                title="Token Consumption"
                subtitle={`Daily token usage for the last ${selectedRange} days`}
                icon={<Zap className="w-4 h-4 text-pink-400" />}
              >
                {usageHistory.length === 0 ? (
                  <EmptyState message="Token usage will appear here after you generate strategies." />
                ) : (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={usageHistory}>
                        <defs>
                          <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415533" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickFormatter={formatAxisDate}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="tokens"
                          name="Tokens"
                          stroke="#ec4899"
                          strokeWidth={3}
                          fill="url(#tokenGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </PanelCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <PanelCard
                title="Industry Breakdown"
                subtitle="Top industries across your saved strategies"
                icon={<Search className="w-4 h-4 text-cyan-400" />}
                className="xl:col-span-2"
              >
                {topIndustries.length === 0 ? (
                  <EmptyState message="Generate a few strategies to unlock industry-level analytics." />
                ) : (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={topIndustries}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#33415533" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="industry"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                          width={110}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
                        <Bar dataKey="count" name="Strategies" radius={[0, 6, 6, 0]}>
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
                title="Billing Snapshot"
                subtitle="Your current plan and monthly usage"
                icon={<CreditCard className="w-4 h-4 text-amber-400" />}
              >
                <div className="space-y-4">
                  <InfoRow label="Plan" value={billingData?.plan || user?.tier?.toUpperCase() || "-"} />
                  <InfoRow
                    label="Monthly Limit"
                    value={billingData?.monthly_limit >= 999 ? "Unlimited" : `${billingData?.monthly_limit || 0}`}
                  />
                  <InfoRow
                    label="Used This Month"
                    value={`${billingData?.used_this_month || 0}`}
                  />
                  <InfoRow
                    label="Renews On"
                    value={billingData?.renewal_date ? safeDate(billingData.renewal_date) : "-"}
                  />
                  <InfoRow
                    label="Member Since"
                    value={heroData?.member_since ? safeDate(heroData.member_since) : "-"}
                  />

                  {billingData?.monthly_limit < 999 && (
                    <div className="pt-2">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>Quota usage</span>
                        <span>{usagePercent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
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
    <div className="rounded-[2rem] border border-white/10 bg-[#121318]/40 p-8 shadow-xl backdrop-blur-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-4xl font-black tracking-tight text-white break-words">{value}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${toneClasses[tone] || toneClasses.indigo}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function PanelCard({ title, subtitle, icon, children, className = "" }) {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-[#121318]/40 p-8 shadow-xl backdrop-blur-3xl ${className}`}>
      <div className="mb-6 flex items-center gap-3">
        {icon && <div>{icon}</div>}
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white text-right">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
