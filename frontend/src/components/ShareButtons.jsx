import { Share2, Mail, Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ShareButtons({ strategy }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform) => {
    const shareText = `Check out this AI-generated content strategy from planvIx! 🚀\n\nGenerated ${strategy.content_calendar?.length || 30} days of content in 30 seconds.`;
    const shareUrl = window.location.href;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
          "_blank"
        );
        break;
      case "email":
        window.open(
          `mailto:?subject=AI Content Strategy from planvIx&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case "pdf":
        alert("PDF export is being compiled. Ready soon!");
        break;
    }
  };

  const shareOptions = [
    { id: "whatsapp", label: "WhatsApp", icon: Share2, color: "hover:border-emerald-500/30 hover:text-emerald-400" },
    { id: "email", label: "Email Link", icon: Mail, color: "hover:border-blue-500/30 hover:text-blue-400" },
    { id: "copy", label: "Copy Link", icon: Copy, color: "hover:border-indigo-500/30 hover:text-indigo-400" },
    { id: "pdf", label: "Export PDF", icon: Download, color: "hover:border-amber-500/30 hover:text-amber-400" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0c0f1d]/30 p-8 backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <h3 className="font-black text-xl mb-2 text-white font-['Manrope'] tracking-tight flex items-center gap-2">
        <Share2 className="w-5 h-5 text-indigo-400" /> Share Strategy Swarm
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Distribute this intelligence swarm with your team or download the schema.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shareOptions.map((opt) => {
          const Icon = opt.icon;
          const isCopyAction = opt.id === "copy";
          return (
            <motion.button
              key={opt.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleShare(opt.id)}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-bold text-xs uppercase tracking-wider text-slate-400 transition-all duration-300 ${opt.color}`}
            >
              {isCopyAction && copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span>{isCopyAction && copied ? "Copied!" : opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
