import React from "react";

const AnimatedButton = ({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative group w-full overflow-hidden rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/40 ${className}`}
    >
      {/* Background Gradient - Enhanced Purple to Blue */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 bg-[length:200%_auto] group-hover:bg-[right_center] transition-all duration-500" />

      {/* Content */}
      <div className="relative py-3 flex items-center justify-center space-x-2 z-10">
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          children
        )}
      </div>

      {/* Inner reflection */}
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:animate-shine" />
    </button>
  );
};

export default AnimatedButton;
