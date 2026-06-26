import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { RefreshCw } from "lucide-react";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  loading = false, 
  disabled = false, 
  children, 
  type = "button",
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#6200EE] to-[#3b00a0] hover:from-[#7314ff] hover:to-[#4500bf] text-white shadow-[0_4px_20px_rgba(98,0,238,0.35)] hover:shadow-[0_0_30px_rgba(129,236,255,0.4)]",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20",
    outline: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-white/20",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-lg",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm rounded-2xl"
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
          <span>Processing...</span>
        </>
      ) : children}
    </motion.button>
  );
});

Button.displayName = "Button";

export { Button };
