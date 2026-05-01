import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Activity
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Reusable animated feature item
const FeatureItem = ({ icon, children, inactive }) => (
  <div className={`flex items-center gap-4 ${inactive ? 'opacity-50 grayscale' : 'group'}`}>
    <div className={`p-1 rounded-full transition-transform duration-300 ${!inactive && 'group-hover:scale-110'} ${inactive ? 'text-gray-400 bg-gray-200/50 dark:bg-gray-700/50' : 'text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40'}`}>
      {icon}
    </div>
    <span className={`font-medium ${inactive ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
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
      // 1. Create Demo Order (₹2,399)
      const data = await paymentAPI.createOrder(PRO_MONTHLY_PRICE);

      if (data.order_id && data.razorpay_key) {
        const scrollY = lockViewportForCheckout();
        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency,
          name: "planvIx",
          description: "planvIx Pro Subscription",
          image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Rocket_creative_icon.svg", // Sleek premium logo
          order_id: data.order_id,
          handler: async function (response) {
            try {
              // 1. Persist tier upgrade to MongoDB + trigger admin WebSocket broadcast
              await paymentAPI.confirmUpgrade(
                response.razorpay_payment_id,
                response.razorpay_order_id
              );
            } catch (err) {
              // Non-fatal: log but continue — local state still updates for demo
              console.warn("confirmUpgrade API call failed:", err.message);
            }
            // 2. Update local AuthContext so UI reflects 'pro' immediately
            if (updateUser) {
              updateUser({ tier: "pro" });
            }
            restoreViewportAfterCheckout(scrollY);
            alertUtils.success("Upgrade Successful!", "Thank you for joining planvIx Pro.");
            // 3. Redirect to Analytics page
            navigate("/analytics");
          },
          prefill: {
            email: user?.email || "",
          },
          theme: {
            color: "#6D28D9", // Vibrant Purple
            backdrop_color: "rgba(15, 23, 42, 0.95)" // Premium dark backdrop
          },
          modal: {
            ondismiss: function () {
              restoreViewportAfterCheckout(scrollY);
              setUpgradeLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
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

  // PRO USER - Show success dashboard access
  if (user?.tier === "pro") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Abstract Background for Premium Feel */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-600/10 dark:to-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl w-full mx-auto text-center relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] animate-bounce-soft">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            You're a Pro Member!
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
            Your account is fully upgraded with unrestricted access to all features.
          </p>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl">
            <h3 className="text-left font-bold text-lg text-slate-800 dark:text-slate-200 mb-8 uppercase tracking-wider">Your Active Benefits</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-left shrink-0">
              <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                <div className="mr-5 text-indigo-500 mt-1"><RefreshCw className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Unlimited Strategies</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Generate without artificial limits.</p>
                </div>
              </div>
              <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                <div className="mr-5 text-purple-500 mt-1"><BarChart3 className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Real Live SEO Data</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Direct integration with SerpAPI.</p>
                </div>
              </div>
              <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                <div className="mr-5 text-pink-500 mt-1"><Clock className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Priority Processing</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Skip the queue on Generation.</p>
                </div>
              </div>
              <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                <div className="mr-5 text-orange-500 mt-1"><Activity className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Predictive Analytics</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">ROI dashboards unlocked.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/analytics")}
            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-5 px-10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Launch Analytics Dashboard <Rocket className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // FREE USER - Show upgrade
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 px-4 overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto pt-24 relative z-10 font-sans">
        
        {/* HERO SECTION */}
        <div className="text-center mb-20 animate-fade-in relative">
          
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-full text-slate-800 dark:text-slate-200 font-medium text-sm mb-8 backdrop-blur-md shadow-sm">
            <Zap className="w-4 h-4 text-amber-500" /> Usage Limit Reached (3/3 Free Strategies)
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Level up your <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Content Strategy</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful creators who are automating their content pipelines and predicting ROI with absolute precision.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto items-center">
          
          {/* FREE PLAN */}
          <div className="lg:col-span-2 rounded-[2.5rem] p-8 md:p-10 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-xl dark:shadow-none flex flex-col relative transition-all duration-300 h-[90%]">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Starter</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-5xl font-black text-slate-900 dark:text-white">₹0</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Basic access to explore planvIx platform.</p>
            </div>

            <div className="space-y-6 mb-10 flex-grow">
              <FeatureItem icon={<CheckCircle2 className="w-5 h-5"/>}>3 strategies per month</FeatureItem>
              <FeatureItem icon={<CheckCircle2 className="w-5 h-5"/>}>Standard AI generation</FeatureItem>
              <FeatureItem icon={<XCircle className="w-5 h-5"/>} inactive>Live Google SEO Keywords</FeatureItem>
              <FeatureItem icon={<XCircle className="w-5 h-5"/>} inactive>Predictive ROI Analytics</FeatureItem>
              <FeatureItem icon={<XCircle className="w-5 h-5"/>} inactive>Priority queue rendering</FeatureItem>
            </div>

            <div className="mt-auto">
              <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-4 px-6 rounded-2xl text-center border-2 border-transparent cursor-default">
                Current Active Plan
              </div>
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="lg:col-span-3 relative group rounded-[2.5rem] p-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.6)] transition-all duration-500 z-10 shadow-2xl lg:-my-2">
            <div className="absolute -top-5 right-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-5 py-2 rounded-full shadow-lg uppercase tracking-widest z-20">
              Most Popular
            </div>
            
            <div className="h-full bg-white dark:bg-slate-900 rounded-[2.4rem] px-8 py-10 md:p-12 flex flex-col relative">
              {/* Internal Glow overlay */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="mb-10 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <Rocket className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">Pro Plan</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">₹2,399</span>
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-lg">/ mo</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-lg">Everything you need to scale content fast.</p>
              </div>

              <div className="space-y-6 mb-12 flex-grow relative z-10">
                <FeatureItem icon={<RefreshCw className="w-5 h-5"/>}>
                  <span className="text-slate-900 dark:text-white font-bold">Unlimited</span> automated strategies
                </FeatureItem>
                <FeatureItem icon={<BarChart3 className="w-5 h-5"/>}>
                  Access <span className="text-slate-900 dark:text-white font-bold">Live SerpAPI Keywords</span>
                </FeatureItem>
                <FeatureItem icon={<Clock className="w-5 h-5"/>}>
                  <span className="text-slate-900 dark:text-white font-bold">0 Wait time</span> in priority queue
                </FeatureItem>
                <FeatureItem icon={<Activity className="w-5 h-5"/>}>
                  Full predictive <span className="text-slate-900 dark:text-white font-bold">ROI Analytics</span>
                </FeatureItem>
                <FeatureItem icon={<Star className="w-5 h-5"/>}>
                  24/7 dedicated support team
                </FeatureItem>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full relative group/btn overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-5 px-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center z-10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <span className="relative z-10 flex items-center gap-2 text-lg">
                  {upgradeLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Securely Connecting...
                    </>
                  ) : (
                    <>Upgrade to Pro Focus</>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* TRUST INDICATORS */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-8 items-center text-sm relative z-10">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">Secure Razorpay Checkout</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">All Major Cards Accepted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
