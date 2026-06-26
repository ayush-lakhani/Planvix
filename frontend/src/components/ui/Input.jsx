import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  label, 
  error, 
  helperText, 
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative group w-full">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#81ecff] transition-all" />
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-[#0d1321]/45 border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-white transition-all placeholder:text-slate-600 text-xs",
            Icon ? "pl-11 pr-4 py-3.5" : "px-4 py-3.5",
            error 
              ? "border-rose-500/50 focus:border-rose-500" 
              : "border-white/10 focus:border-indigo-500/50",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-semibold text-rose-400 ml-1">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-slate-500 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
