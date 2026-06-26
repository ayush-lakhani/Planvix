import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Search,
  Filter,
  Download,
  Calendar,
  Globe,
  Monitor
} from "lucide-react";
import { strategyAPI } from "../api";
import { safeDate } from "../utils/dateUtils";
import StrategyResults from "./StrategyResults";
import { alertUtils } from "../utils/alertUtils";
import Dropdown from "./ui/Dropdown";
import Skeleton from "./ui/skeleton";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function History() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await strategyAPI.getHistory();
      console.log("[HISTORY] API response:", data);

      let strategiesArray = Array.isArray(data) ? data : data?.history || [];

      // Normalize feedback rating field
      strategiesArray = strategiesArray.map((strategy) => {
        if (strategy.feedback_rating) return strategy;
        if (strategy.feedback && typeof strategy.feedback.rating === "number") {
          const ratingNum = strategy.feedback.rating;
          return {
            ...strategy,
            feedback_rating: ratingNum >= 3 ? "up" : "down",
          };
        }
        return strategy;
      });

      setStrategies(strategiesArray);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (strategy) => {
    const strategyId = strategy.id || strategy._id;
    if (!strategyId) {
      alertUtils.error("Invalid ID", "Invalid strategy ID");
      return;
    }

    const isConfirmed = await alertUtils.confirmDelete("strategy");
    if (!isConfirmed) return;

    try {
      await strategyAPI.delete(strategyId);
      await loadHistory();
      alertUtils.success("Deleted", "Strategy deleted successfully!");
    } catch (error) {
      console.error("Failed to delete strategy:", error);
      alertUtils.error(
        "Failed to delete",
        `Reason: ${error.response?.data?.detail || error.message}`
      );
    }
  };

  const handleView = async (strategy) => {
    const strategyId = strategy.id || strategy._id;
    if (!strategyId) {
      alertUtils.error("Invalid ID", "Invalid strategy ID");
      return;
    }

    try {
      const response = await strategyAPI.getById(strategyId);
      setSelectedStrategy(response);
    } catch (error) {
      console.error("Failed to load strategy:", error);
      alertUtils.error("Error", "Failed to load strategy details.");
    }
  };

  const handleFeedback = async (id, rating) => {
    const numericRating = rating === "up" ? 5 : 1;
    try {
      await strategyAPI.submitFeedback(id, numericRating);
      setStrategies(
        strategies.map((s) =>
          s.id === id || s._id === id
            ? { ...s, feedback_rating: rating, feedback: { rating: numericRating } }
            : s
        )
      );
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  // Extract unique platforms for filtering
  const platformsList = useMemo(() => {
    const platforms = new Set();
    strategies.forEach((s) => {
      if (s.platform) platforms.add(s.platform.toLowerCase());
    });
    return ["all", ...Array.from(platforms)];
  }, [strategies]);

  // Filter strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter((s) => {
      const matchesSearch =
        (s.industry && s.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.platform && s.platform.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.audience && s.audience.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform =
        selectedPlatform === "all" ||
        (s.platform && s.platform.toLowerCase() === selectedPlatform);

      return matchesSearch && matchesPlatform;
    });
  }, [strategies, searchQuery, selectedPlatform]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton variant="avatar" className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton variant="title" className="w-48 h-6" />
            <Skeleton variant="text" className="w-32 h-4" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl h-44 space-y-4">
              <Skeleton variant="title" className="w-3/4 h-5" />
              <Skeleton variant="text" className="w-1/2 h-4" />
              <div className="flex justify-between items-center pt-4">
                <Skeleton variant="text" className="w-20 h-6" />
                <Skeleton variant="avatar" className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedStrategy) {
    return (
      <div className="min-h-screen p-6 md:p-8 space-y-6">
        <button
          onClick={() => setSelectedStrategy(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Strategy History
        </button>
        <StrategyResults
          key={selectedStrategy.id || selectedStrategy._id}
          strategy={selectedStrategy}
          onReset={() => setSelectedStrategy(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight">
              Strategy History
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {strategies.length} generated swarms stored in cloud
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/planner")}
          className="flex items-center gap-2 text-xs"
        >
          Create Strategy Swarm
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0c0f1d]/30 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 relative z-20 backdrop-blur-xl">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search industry or audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#04060d]/50 border border-white/5 focus:border-indigo-500/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Platform filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto md:ml-auto">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter Platform:
          </span>
          {platformsList.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                selectedPlatform === platform
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                  : "bg-white/[0.01] border-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {filteredStrategies.length === 0 ? (
        <div className="border border-white/5 bg-[#0c0f1d]/20 p-12 rounded-3xl text-center flex flex-col items-center justify-center">
          <Clock className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-1">No strategies found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {strategies.length === 0
              ? "You haven't generated any content strategies yet."
              : "No strategies match your search or filter configuration."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredStrategies.map((strategy) => (
              <motion.div
                key={strategy.id || strategy._id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0c0f1d]/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {safeDate(strategy.created_at, "datetime")}
                    </span>

                    {strategy.generation_time && (
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {strategy.generation_time}s Swarm
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors mb-3 leading-snug">
                    {strategy.industry && strategy.platform
                      ? `${strategy.industry} Strategy`
                      : strategy.industry || strategy.platform || "Content Strategy"}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {strategy.platform && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> {strategy.platform}
                      </span>
                    )}
                    {strategy.audience && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {strategy.audience}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleFeedback(strategy.id || strategy._id, "up")}
                      className={`p-2 rounded-lg border transition-colors ${
                        strategy.feedback_rating === "up"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(strategy.id || strategy._id, "down")}
                      className={`p-2 rounded-lg border transition-colors ${
                        strategy.feedback_rating === "down"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Dropdown
                    placement="bottom-end"
                    className="p-1 min-w-[130px] bg-[#070b15] border border-white/10 rounded-xl"
                    trigger={
                      <button className="p-2 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg transition-colors">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleView(strategy)}
                        className="w-full flex items-center justify-start gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Swarm
                      </button>
                      <button
                        onClick={() => handleDelete(strategy)}
                        className="w-full flex items-center justify-start gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </Dropdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
