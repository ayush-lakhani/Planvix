import React from "react";

const AuthCard = ({ children, className = "" }) => {
  return (
    <div className={`relative group animate-fade-in-up ${className}`}>
      {/* Card Body with Border Gradient */}
      <div className="relative bg-slate-900/40 backdrop-blur-3xl border-gradient rounded-3xl p-8 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10">
        {/* Subtle inner reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none opacity-30" />

        {children}
      </div>
    </div>
  );
};

export default AuthCard;
