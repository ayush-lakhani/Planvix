import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { alertUtils } from "../utils/alertUtils";
import { paymentAPI } from "../api/payment";
import { PRO_MONTHLY_PRICE } from "../constants/pricing";
import {
  CheckCircle2,
  Zap,
  Rocket,
  ShieldCheck,
  CreditCard,
  Star,
  RefreshCw,
  BarChart3,
  Clock,
  XCircle,
  Activity,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Feature item with premium styling
const FeatureItem = ({ icon, children, inactive }) => (
  <div className={`flex items-center gap-3.5 ${inactive ? "opacity-45 grayscale" : "group"}`}>
    <div className={`p-1 rounded-full transition-transform duration-300 ${!inactive && "group-hover:scale-110"} ${
      inactive ? "text-slate-600 bg-white/5" : "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
    }`}>
      {icon}
    </div>
    <span className={`text-xs font-semibold ${inactive ? "text-slate-500 line-through" : "text-slate-300"}`}>
      {children}
    </span>
  </div>
);

export default function UpgradePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const lockViewportForCheckout = () => {
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return scrollY;
  };

  const restoreViewportAfterCheckout = (scrollY) => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    window.scrollTo({ top: scrollY, behavior: "auto" });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const paymentId = params.get("payment_id");
      const subscriptionId = params.get("subscription_id");
      const signature = params.get("signature");
      
      if (paymentId && subscriptionId && signature) {
        verifyPayment(paymentId, subscriptionId, signature);
      } else if (params.get("tier") === "pro") {
        alertUtils.success("Success", "You are now a Pro member!");
      }
    }
  }, []);

  const verifyPayment = async (paymentId, subscriptionId, signature) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/verify-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_subscription_id: subscriptionId,
          razorpay_signature: signature,
        }),
      });
      
      const data = await response.json();
      if (data.status === "success") {
        alertUtils.success("Welcome aboard!", "Payment verified! You are now a Pro member.");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const data = await paymentAPI.createOrder(PRO_MONTHLY_PRICE);

      if (data.order_id && data.razorpay_key) {
        const scrollY = lockViewportForCheckout();
        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency,
          name: "planvIx",
          description: "planvIx Pro Subscription",
          image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Rocket_creative_icon.svg",
          order_id: data.order_id,
          handler: async function (response) {
            try {
              await paymentAPI.confirmUpgrade(
                response.razorpay_payment_id,
                response.razorpay_order_id
              );
            } catch (err) {
              console.warn("confirmUpgrade API call failed:", err.message);
            }
            if (updateUser) {
              updateUser({ tier: "pro" });
            }
            restoreViewportAfterCheckout(scrollY);
            alertUtils.success("Upgrade Successful!", "Thank you for joining planvIx Pro.");
            navigate("/analytics");
          },
          prefill: {
            email: user?.email || "",
          },
          theme: {
            color: "#6D28D9",
            backdrop_color: "rgba(15, 23, 42, 0.95)"
          },
          modal: {
            ondismiss: function () {
              restoreViewportAfterCheckout(scrollY);
              setUpgradeLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          restoreViewportAfterCheckout(scrollY);
          alertUtils.error("Payment Failed", "We could not process your transaction. Please try again.");
          setUpgradeLoading(false);
        });

        window.scrollTo({ top: 0, behavior: "auto" });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            rzp.open();
          });
        });
      } else {
        alertUtils.error("Checkout Failed", "Could not initialize checkout securely. Please try again.");
        setUpgradeLoading(false);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alertUtils.error("Connection Error", "Failed to contact payment server: " + error.message);
      setUpgradeLoading(false);
    }
  };

  // Pro member UI view
  if (user?.tier === "pro") {
    return (
      <div className="min-h-screen flex flex-col items-center pt-20 pb-12 px-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl w-full mx-auto text-center relative z-10 space-y-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-['Manrope']">
            You're a Pro Member!
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Your credentials have been successfully elevated. All operational limitations have been lifted from your workspace account.
          </p>

          <div className="bg-[#0c0f1d]/20 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest mb-6">Your Active Pro Benefits</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Unlimited Strategies", sub: "Generate without limits or boundaries.", icon: RefreshCw, tone: "text-indigo-400" },
                { title: "Real Live SEO Data", sub: "Direct real-time connections to SerpAPI engines.", icon: BarChart3, tone: "text-cyan-400" },
                { title: "Priority Processing", sub: "Elevated queuing priority for immediate compilation.", icon: Clock, tone: "text-pink-400" },
                { title: "Predictive Analytics", sub: "Access full account growth forecasts.", icon: Activity, tone: "text-emerald-400" }
              ].map((benefit, i) => (
                <div key={i} className="flex bg-white/[0.01] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className={`mr-4 ${benefit.tone} mt-1`}><benefit.icon className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{benefit.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{benefit.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/analytics")}
            className="flex items-center gap-2"
          >
            Launch Command Center
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Free Tier UI View
  return (
    <div className="min-h-screen pb-24 px-4 relative overflow-hidden font-sans">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto pt-20 relative z-10 space-y-16">
        
        {/* Hero title */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 font-semibold text-xs uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Zap className="w-4 h-4 text-amber-400" /> Account Limitation Reached (3/3 Swarms Used)
          </div>

          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight max-w-2xl mx-auto">
            Choose Your Operational Scale
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Elevate your AI strategy swarms to pro capacities and bypass account thresholds.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Tier Card */}
          <div className="bg-[#0c0f1d]/20 border border-white/5 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="mb-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Baseline Tier</span>
                <h3 className="text-2xl font-black text-white mt-1">Free Sandbox</h3>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-5xl font-black tracking-tight">₹0</span>
                  <span className="ml-1 text-slate-500 text-sm font-semibold">/forever</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Sandbox environment to run basic tests.</p>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>3 AI Strategy Swarms</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>Standard Keywords & Calendars</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />} inactive>SerpAPI Real-time SEO Pulse</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />} inactive>Unlimited Swarms</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />} inactive>Confidence ROI Telemetry</FeatureItem>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full mt-8 text-xs"
              onClick={() => navigate("/dashboard")}
            >
              Continue with Sandbox
            </Button>
          </div>

          {/* Pro Tier Card */}
          <div className="bg-[#0c0f1d]/40 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-4 right-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              Recommended
            </div>

            <div>
              <div className="mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enterprise Acceleration</span>
                <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  Planvix Pro <Star className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                </h3>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-5xl font-black tracking-tight">₹2,399</span>
                  <span className="ml-1 text-slate-500 text-sm font-semibold">/month</span>
                </div>
                <p className="text-xs text-indigo-300 mt-2">Perfect for creators, brands and agencies scaling campaigns.</p>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>Unlimited AI Strategy Swarms</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>SerpAPI Real-time SEO Pulse</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>Confidence ROI Telemetry Dashboard</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>High Priority Compute Speed</FeatureItem>
                <FeatureItem icon={<CheckCircle2 className="w-4 h-4" />}>Premium Integrations & Exports</FeatureItem>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full mt-8 text-xs flex items-center justify-center gap-2"
              loading={upgradeLoading}
              onClick={handleUpgrade}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              Elevate Account Node
            </Button>
          </div>

        </div>

        {/* Value Prop Row */}
        <div className="border-t border-white/5 pt-16 max-w-4xl mx-auto">
          <h3 className="text-center font-black text-xs text-slate-500 uppercase tracking-widest mb-10">Why Upgrade to Planvix Pro?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-white">Hyper Speed Nodes</span>
              <p className="text-xs text-slate-500 leading-relaxed">Pro strategies run on dedicated high-tier compute models, reducing generation lag by up to 60%.</p>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-white">Live Search Crawls</span>
              <p className="text-xs text-slate-500 leading-relaxed">Unlike the sandbox, Pro initiates live web crawlers to retrieve real-time search trends and competitor gaps.</p>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-white">ROI Mathematical Projection</span>
              <p className="text-xs text-slate-500 leading-relaxed">Unlock visual ROI analytics mapping Traffic Lift, Monthly Reach, and Engagement rates.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
