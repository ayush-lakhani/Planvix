import * as React from "react";
import { cn } from "../../lib/utils";

function Badge({ className, variant = "primary", children, ...props }) {
  const baseStyles = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border select-none w-max";
  
  const variants = {
    primary: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    neutral: "bg-white/5 border-white/10 text-slate-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export { Badge };
