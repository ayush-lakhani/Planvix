import React from 'react';

/**
 * Premium Skeleton Loader Component
 * Supports various shapes and custom sizing via Tailwind classes
 */
export default function Skeleton({ className = "", variant = "rect" }) {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-800/50";
  
  const variants = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-lg h-4 w-full",
    title: "rounded-lg h-8 w-3/4",
    avatar: "rounded-full h-12 w-12",
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant] || variants.rect} ${className}`}
      aria-hidden="true"
    />
  );
}
