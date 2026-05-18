import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StrategyForm from "./StrategyForm";
import StrategyResults from "./StrategyResults";
import AgentTerminal from "./AgentTerminal";
import UpgradeModal from "./UpgradeModal";
import ProfileWidget from "./ProfileWidget";
import { useAuth } from "../context/AuthContext";
import { strategyAPI } from "../api";
import { normalizeStrategy, isValidStrategy } from "../utils/strategyUtils";
import { useStrategy } from "../context/StrategyContext";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function StrategicPlanner() {
  const { user, token, updateUser } = useAuth();
  const { 
    isGenerating, 
    progress, 
    generationStatus, 
    agentLogs: wsLogs,
    startGeneration,
    completeGeneration,
    failGeneration,
    resetGeneration 
  } = useStrategy();

  const [userTier, setUserTier] = useState(user?.tier || "free");
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle strategy passed via navigation state (from Dashboard/History)
  useEffect(() => {
    if (location.state?.strategy) {
      console.log(
        "[PLANNER] Received strategy from navigation:",
        location.state.strategy,
      );
      setStrategy(location.state.strategy);
    }
  }, [location]);

  // Fetch user profile and usage on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const serverUsage = data.usage_count || 0;
        setUsageCount(serverUsage);
        setUserTier(data.tier || "free");
        if (data.tier && data.tier !== user?.tier) {
          updateUser({ tier: data.tier });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleGenerate = async (formData) => {
    setLoading(true);
    setStrategy(null);
    startGeneration(user.id || user.user_id);

    try {
      const result = await strategyAPI.generate(formData);
      console.log("[STRATEGY RESULT] Raw API response:", result);

      const normalized = normalizeStrategy(result);
      if (!isValidStrategy(normalized)) {
        throw new Error("Invalid strategy structure received from API");
      }

      setStrategy(normalized);
      completeGeneration(normalized);

      // Refresh profile to get updated usage count from server
      await fetchUserProfile();
    } catch (error) {
      console.error("[STRATEGY ERROR]", error);
      failGeneration(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStrategy(null);
    resetGeneration();
    fetchUserProfile(); // Refresh usage count
  };

  const handleUpgrade = () => {
    navigate("/upgrade");
    setShowUpgradeModal(false);
  };

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
  };

  if (strategy) {
    return <StrategyResults strategy={strategy} onReset={handleReset} />;
  }

  return (
    <div className="animate-stripe-page min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Usage Counter Widget */}
        <div className="mb-6" data-aos="fade-down">
          <ProfileWidget
            usageCount={usageCount}
            totalAllowed={3}
            tier={userTier}
            onUpgrade={handleUpgrade}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div data-aos="fade-right">
            <StrategyForm
              onGenerate={handleGenerate}
              setLoading={setLoading}
              loading={loading || isGenerating}
            />
          </div>

          {/* Right: Agent Terminal */}
          <div>
            <AgentTerminal 
              logs={wsLogs} 
              loading={loading || isGenerating} 
              progress={progress}
              status={generationStatus}
            />
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        usageCount={usageCount}
        tier={userTier}
        onClose={handleCloseModal}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
