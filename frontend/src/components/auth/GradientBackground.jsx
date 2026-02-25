import React from "react";

const GradientBackground = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-950",
    admin: "bg-slate-950",
    client: "bg-slate-950",
  };

  const accentColors = {
    default: "bg-indigo-500/10",
    admin: "bg-emerald-500/10",
    client: "bg-blue-500/10",
  };

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-[2000ms] ${variants[variant]}`}
    >
      {/* Animated Gradient Orbs - Subtler and Slower */}
      <div
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ${accentColors[variant]} blur-[120px] animate-pulse-slow pointer-events-none opacity-60`}
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse-slow pointer-events-none opacity-40"
        style={{ animationDelay: "2s", animationDuration: "10s" }}
      />

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default GradientBackground;
