import { useState, useEffect } from "react";
import { PRO_MONTHLY_PRICE } from "../constants/pricing";
import {
  X,
  Zap,
  RefreshCw,
  BarChart3,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function UpgradeModal({ usageCount, tier = "free", onClose, onUpgrade }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isPaidTier = tier !== "free";

  useEffect(() => {
    if (isPaidTier) {
      setShow(false);
      return;
    }

    // Check if user already dismissed this session
    const sessionDismissed = sessionStorage.getItem("upgradeModalDismissed");
    if (sessionDismissed) {
      setDismissed(true);
      return;
    }

    // Trigger at 2/3 usage (only if not dismissed)
    if (usageCount >= 2 && !dismissed) {
      setShow(true);
    }

    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !show && !dismissed && usageCount >= 1) {
        setShow(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [usageCount, show, dismissed, isPaidTier]);

  const handleClose = () => {
    setShow(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem("upgradeModalDismissed", "true");
    if (onClose) onClose();
  };

  const handleUpgradeClick = () => {
    if (onUpgrade) onUpgrade();
  };

  if (!show || isPaidTier) return null;

  const strategiesLeft = 3 - usageCount;
  const formattedProPrice = `₹${PRO_MONTHLY_PRICE.toLocaleString()}`;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-[2rem] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-2xl animate-modal">
        <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.16),transparent_30%)]" />
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Header */}
        <div className="relative border-b border-slate-200/70 p-8 dark:border-slate-800/80 md:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
            <Zap className="h-4 w-4 text-amber-500" />
            {strategiesLeft === 1
              ? "1 free strategy remaining"
              : `Only ${Math.max(strategiesLeft, 0)} free strategies left`}
          </div>
          <h2 className="mb-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {strategiesLeft === 1
              ? "Last free strategy this month"
              : "Free strategy limit almost reached"}
          </h2>
          <p className="max-w-xl text-base font-medium text-slate-600 dark:text-slate-300 md:text-lg">
            You've used {usageCount}/3 free strategies this month
          </p>
          <div className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-950/40 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                planvIx Pro
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                  {formattedProPrice}
                </span>
                <span className="pb-2 text-base font-bold text-slate-500 dark:text-slate-400">
                  / mo
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Unlock the same premium plan from the full upgrade page.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
              Unlimited generation
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="relative p-8 md:p-10">
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Unlimited Strategies
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Generate without the 3-strategy monthly cap.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Live SEO and ROI Analytics
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Access premium keyword data and predictive insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Priority Processing
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Move faster with the premium queue and support.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Secure Razorpay Checkout
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Upgrade in one step and continue in the full Pro flow.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleUpgradeClick}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-4 text-base font-black text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl dark:bg-white dark:text-slate-900"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Unlock Pro {formattedProPrice}/mo
              </span>
            </button>
            <button
              onClick={handleClose}
              className="rounded-2xl border-2 border-slate-200 bg-white/80 px-6 py-4 text-base font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              {strategiesLeft > 0
                ? `Continue Free (${strategiesLeft} left)`
                : "Maybe Later"}
            </button>
          </div>

          {/* Trust Badge */}
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Join the same premium plan and pricing shown on the full upgrade page.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
