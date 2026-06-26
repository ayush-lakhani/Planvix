import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Settings,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Zap,
  Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProfileHero from "../components/profile/ProfileHero";
import UsageCharts from "../components/profile/UsageCharts";
import ActivityTimeline from "../components/profile/ActivityTimeline";
import BillingCard from "../components/profile/BillingCard";
import ErrorBoundary from "../components/ErrorBoundary";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Profile() {
  const { token, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "intelligence"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [heroData, setHeroData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [billingData, setBillingData] = useState(null);

  // Unified Data Fetcher
  const fetchAllDashboardData = useCallback(
    async (isAutoRefresh = false) => {
      if (!token) return;
      if (!isAutoRefresh) setLoading(true);
      else setRefreshing(true);

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [heroRes, analyticsRes, activityRes, billingRes] =
          await Promise.all([
            axios.get(`${API_BASE}/api/profile`, { headers }),
            axios.get(`${API_BASE}/api/analytics/profile`, { headers }),
            axios.get(`${API_BASE}/api/profile/activity`, { headers }),
            axios.get(`${API_BASE}/api/profile/billing`, { headers }),
          ]);

        setHeroData(heroRes.data);
        setAnalyticsData(analyticsRes.data);
        setActivityData(activityRes.data);
        setBillingData(billingRes.data);
      } catch (error) {
        console.error("[DASHBOARD] Sync Error:", error);
        if (!isAutoRefresh) toast.error("Failed to sync intelligence data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  // Initial Load + 30s Polling
  useEffect(() => {
    fetchAllDashboardData();
    const interval = setInterval(() => fetchAllDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAllDashboardData]);

  const tabs = [
    { id: "intelligence", label: "Intelligence Hub", icon: TrendingUp },
    { id: "billing", label: "Usage & Quota", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden font-sans pb-16">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight flex items-center gap-3">
              Intelligence Settings
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Manage your credentials, limits, billing details, and live activity metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllDashboardData()}
              disabled={refreshing}
              className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all ${
                refreshing ? "animate-spin text-indigo-400 border-indigo-500/30" : "hover:scale-105 active:scale-95"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/25 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Hero Banner Component */}
        <ProfileHero data={heroData} loading={loading} />

        {/* Sliding Tabs Controller */}
        <div className="bg-[#0c0f1d]/60 border border-white/5 p-1 rounded-2xl flex flex-wrap gap-1 relative z-10 backdrop-blur-md w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeProfileTabGlow"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main tabs panels rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "intelligence" && (
              <div className="space-y-8">
                <ErrorBoundary>
                  <UsageCharts analytics={analyticsData} loading={loading} />
                </ErrorBoundary>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ActivityTimeline activity={activityData} loading={loading} />
                  <BillingCard billing={billingData} loading={loading} />
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BillingCard billing={billingData} loading={loading} />
                <div className="bg-[#0c0f1d]/20 border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 font-['Manrope']">
                    Secure Billing Pulses
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Our subscription pipelines use Razorpay's end-to-end encrypted tunnels, keeping checkout flows and payment nodes highly secure.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <SettingsPanel user={heroData} logout={logout} token={token} />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

// Modular settings config panel
function SettingsPanel({ user, logout, token }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="max-w-3xl space-y-8 font-sans">
      <div className="bg-[#0c0f1d]/20 border border-white/5 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 font-['Manrope']">
          <Settings className="w-5 h-5 text-indigo-400" /> Identity Credentials
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5">
            <div>
              <p className="text-[10px] font-black text-slate-500 tracking-wider uppercase mb-1">
                Account Email
              </p>
              <p className="text-sm font-bold text-slate-200">
                {user?.email}
              </p>
            </div>
            <span className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" /> Verified Node
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5 opacity-40 cursor-not-allowed">
            <div>
              <p className="text-[10px] font-black text-slate-500 tracking-wider uppercase mb-1">
                Password Node
              </p>
              <p className="text-sm font-bold text-slate-400">
                ••••••••••••
              </p>
            </div>
            <button
              disabled
              className="text-[9px] font-black uppercase text-slate-500"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-rose-950/5 border border-rose-500/10 p-8 rounded-3xl">
        <h3 className="text-lg font-black text-rose-400 mb-4 flex items-center gap-2 font-['Manrope']">
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h3>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Deleting your profile node wipes all strategic swarms, calendar schedules, computed tokens, and payment ledger files. This pipeline is irreversible.
        </p>

        {!confirmDelete ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account Node
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 animate-slide-up">
            <button
              onClick={async () => {
                if (deleting) return;
                setDeleting(true);
                try {
                  const headers = { Authorization: `Bearer ${token}` };
                  await axios.delete(`${API_BASE}/api/auth/delete`, { headers });
                  toast.success("Account permanently deleted.");
                  logout();
                } catch (error) {
                  console.error("Deletion error:", error);
                  const msg =
                    error.response?.data?.detail ||
                    error.response?.data?.error ||
                    "Failed to delete account. Please try again.";
                  toast.error(msg);
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className={`w-full sm:w-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                deleting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Wiping Node...
                </>
              ) : (
                "Confirm Wiping Data"
              )}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
