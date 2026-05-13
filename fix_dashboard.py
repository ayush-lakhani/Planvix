filepath = r"G:\MCA\sem 4\multi Ai G+Agent content planner\frontend\src\pages\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

print(f"Current total lines: {len(lines)}")

# Find where {/* WS indicator */} starts — that's where we splice in
ws_line = None
for i, line in enumerate(lines):
    if '{/* WS indicator */}' in line:
        ws_line = i
        print(f"Found WS indicator at line {i+1}: {repr(line[:60])}")
        break

if ws_line is None:
    print("ERROR: Could not find WS indicator line")
    exit(1)

original_header = """\
/**
 * Enterprise SaaS Admin Intelligence System
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, LogOut, Bell, Search, Settings, Users, DollarSign,
  Zap, Activity, Database, Cpu, BarChart3, TrendingUp, TrendingDown,
  Download, Filter, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Clock, Brain, Globe,
  ArrowUpRight, ArrowDownRight, Layers, Hash, IndianRupee,
} from "lucide-react";
import { KPICard } from "../components/kpi/KPICard";
import {
  RevenueLineChart,
  UserGrowthAreaChart,
} from "../components/charts/RevenueAndUserCharts";
import {
  TierDistributionPieChart,
  IndustryBarChart,
  AITokenTrendChart,
} from "../components/charts/PieAndBarCharts";
import { AnalyticsService } from "../services/AnalyticsService";
import { HealthService } from "../services/HealthService";
import { WebSocketService } from "../services/WebSocketService";
import {
  PRO_MONTHLY_PRICE,
  ENTERPRISE_MONTHLY_PRICE,
} from "../constants/pricing";
import { safeDate } from "../utils/dateUtils";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "revenue", label: "Revenue", icon: IndianRupee },
  { id: "ai", label: "AI Intelligence", icon: Brain },
  { id: "activity", label: "Live Activity", icon: Activity },
  { id: "health", label: "System Health", icon: Database },
];

const EVENT_COLORS = {
  user_signup: { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "👤", label: "User Signup" },
  strategy_generated: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: "⚡", label: "Strategy Generated" },
  strategy_deleted: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: "🗑️", label: "Strategy Deleted" },
  payment_received: { dot: "bg-violet-500", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20", icon: "💰", label: "Payment" },
  tier_upgrade: { dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", icon: "⭐", label: "Tier Upgrade" },
  admin_login: { dot: "bg-rose-500", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: "🔒", label: "Admin Login" },
  default: { dot: "bg-slate-500", badge: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: "📌", label: "System Event" },
};

export default function EnterpriseAdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [logs, setLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const activityEndRef = useRef(null);
  const navigate = useNavigate();
  const env = import.meta.env.MODE === "production" ? "PROD" : "DEV";

  const secret = sessionStorage.getItem("adminSecret");
  useEffect(() => {
    if (!secret) { navigate("/admin-login"); return; }
    loadAnalytics();
    loadHealth();
    loadLogs();
    const hi = setInterval(loadHealth, 30000);
    return () => clearInterval(hi);
  }, []);

  useEffect(() => {
    if (!secret) return;
    WebSocketService.connect((evt) => {
      setWsConnected(true);
      if (evt.type === "pong") return;
      setActivities((prev) => [evt, ...prev].slice(0, 200));
      setNotifications((n) => n + 1);
      if (evt.type === "payment_received") loadAnalytics();
    });
    return () => WebSocketService.disconnect();
  }, []);

  useEffect(() => {
    if (tab === "activity") activityEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activities, tab]);

  useEffect(() => {
    if (tab === "users") loadUsers();
  }, [tab, page, tierFilter]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try { setAnalytics(await AnalyticsService.getAnalytics()); }
    catch (e) { if (e.response?.status === 401) logout(); }
    finally { setLoading(false); }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try { setHealth(await HealthService.getHealth()); }
    catch (_) {}
    finally { setHealthLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await AnalyticsService.getUsers({ search, tier: tierFilter, page, limit: 15 });
      setUsers(data);
    } catch (e) { if (e.response?.status === 401) logout(); }
    finally { setUsersLoading(false); }
  }, [search, tierFilter, page]);

  const loadLogs = useCallback(async () => {
    try { const data = await AnalyticsService.getAdminLogs(100); setLogs(data.logs || []); }
    catch (_) {}
  }, []);

  const logout = () => {
    sessionStorage.removeItem("adminSecret");
    WebSocketService.disconnect();
    navigate("/admin-login");
  };

  const kpi = analytics?.kpis || {};
  const sparkRevenue = (analytics?.revenue_trend || []).slice(-7).map((r) => ({ v: r.revenue }));
  const sparkUsers = (analytics?.user_growth || []).slice(-7).map((r) => ({ v: r.users }));

  return (
    <div className="animate-stripe-page min-h-screen text-white font-sans" style={{ background: "linear-gradient(135deg, #020817 0%, #0a1628 40%, #040d1a 100%)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60" style={{ background: "rgba(2,8,23,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">planvIx Admin</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">Intelligence System</p>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ml-1 ${env === "PROD" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
              {env}
            </span>
          </div>
          {/* Global Search */}
          <div className="relative flex-1 max-w-sm hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search users, strategies..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(e.target.value); setTab("users"); loadUsers(); } }}
            />
          </div>
          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0">
"""

# Append everything from WS indicator onwards
good_lines = lines[ws_line:]
print(f"Appending {len(good_lines)} lines from WS indicator onwards")
print(f"First good line: {repr(good_lines[0][:60])}")

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(original_header)
    f.writelines(good_lines)

# Verify
with open(filepath, 'r', encoding='utf-8') as f:
    result = f.readlines()
print(f"\nRestored file has {len(result)} lines")
print("Done!")
