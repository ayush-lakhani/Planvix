import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
} from "lucide-react";
import { strategyAPI } from "../api";
import { safeDate } from "../utils/dateUtils";
import StrategyResults from "./StrategyResults";
import { alertUtils } from "../utils/alertUtils";
import Dropdown from "./ui/Dropdown";
import Skeleton from "./ui/Skeleton";

export default function History() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await strategyAPI.getHistory();
      console.log("[HISTORY] API response:", data);

      // Normalize response - backend may return array or {history: [...]}
      let strategiesArray = Array.isArray(data) ? data : data?.history || [];

      // Normalize feedback field
      strategiesArray = strategiesArray.map(strategy => {
        if (strategy.feedback_rating) return strategy;
        if (strategy.feedback && typeof strategy.feedback.rating === 'number') {
          const ratingNum = strategy.feedback.rating;
          return {
            ...strategy,
            feedback_rating: ratingNum >= 3 ? 'up' : 'down',
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
        `Reason: ${error.response?.data?.detail || error.message}`,
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
          (s.id === id || s._id === id) ? { ...s, feedback_rating: rating, feedback: { rating: numericRating } } : s,
        ),
      );
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-stripe-page min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton variant="avatar" className="w-10 h-10" />
            <div>
              <Skeleton variant="title" className="w-48 mb-2" />
              <Skeleton variant="text" className="w-32" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-6 rounded-2xl h-48">
                <Skeleton variant="title" className="mb-4" />
                <Skeleton variant="text" className="mb-2" />
                <Skeleton variant="text" className="w-2/3 mb-6" />
                <div className="flex justify-between items-center">
                  <Skeleton variant="avatar" className="w-20 h-8" />
                  <Skeleton variant="avatar" className="w-8 h-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedStrategy) {
    return (
      <div className="animate-stripe-page min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedStrategy(null)}
            className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to History
          </button>
          <StrategyResults
            key={selectedStrategy.id || selectedStrategy._id}
            strategy={selectedStrategy}
            onReset={() => setSelectedStrategy(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-stripe-page min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8" data-aos="fade-down">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-smooth"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Strategy History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {strategies.length} strategies generated
            </p>
          </div>
        </div>

        {strategies.length === 0 ? (
          <div className="glass-card p-12 text-center" data-aos="zoom-in">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No strategies yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate your first content strategy to see it here
            </p>
            <button onClick={() => navigate("/generate")} className="btn-gradient">
              Create Strategy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy, index) => (
              <div
                key={strategy.id || strategy._id}
                className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5"
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 100, 500)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {strategy.industry && strategy.platform
                        ? `${strategy.industry} - ${strategy.platform} Strategy`
                        : strategy.industry || strategy.platform || "Content Strategy"}
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {strategy.audience && <span className="flex items-center gap-1">👥 {strategy.audience}</span>}
                      {strategy.industry && <span className="flex items-center gap-1">🏢 {strategy.industry}</span>}
                      {strategy.platform && <span className="flex items-center gap-1">📱 {strategy.platform}</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Generated {safeDate(strategy.created_at, "datetime")}
                      {strategy.generation_time && ` • ${strategy.generation_time}s`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFeedback(strategy.id || strategy._id, "up")}
                        className={`p-2 rounded-lg transition-colors ${
                          strategy.feedback_rating === "up"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(strategy.id || strategy._id, "down")}
                        className={`p-2 rounded-lg transition-colors ${
                          strategy.feedback_rating === "down"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    <Dropdown
                      placement="bottom-end"
                      className="p-1 min-w-[140px] mt-2"
                      trigger={
                        <button className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleView(strategy)}
                          className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                        <button
                          onClick={() => handleDelete(strategy)}
                          className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </Dropdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
