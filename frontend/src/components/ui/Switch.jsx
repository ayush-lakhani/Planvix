import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

function Switch({ checked, onChange, disabled = false, className, label, ...props }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-indigo-600" : "bg-white/10",
          className
        )}
        {...props}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
      {label && (
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide cursor-pointer" onClick={() => !disabled && onChange && onChange(!checked)}>
          {label}
        </span>
      )}
    </div>
  );
}

export { Switch };
