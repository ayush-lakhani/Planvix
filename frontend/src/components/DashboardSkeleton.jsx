import React from 'react';
import Skeleton from './ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 w-full md:w-1/2">
            <Skeleton variant="title" className="w-2/3 h-12 bg-slate-200 dark:bg-slate-800/50" />
            <Skeleton variant="text" className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800/50" />
          </div>
          <Skeleton variant="rect" className="w-48 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800/50 shadow-lg" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="rect" className="w-12 h-12 rounded-xl bg-slate-300/50 dark:bg-slate-800/80" />
                <Skeleton variant="text" className="w-24 h-4 bg-slate-200 dark:bg-slate-800/50" />
              </div>
              <Skeleton variant="title" className="w-16 h-10 bg-slate-300/50 dark:bg-slate-800/80" />
            </div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <Skeleton variant="title" className="w-48 h-8 bg-slate-200 dark:bg-slate-800/50" />
              <Skeleton variant="text" className="w-24 h-4 bg-slate-200 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 w-full">
                      <Skeleton variant="title" className="w-1/3 h-6 bg-slate-300/50 dark:bg-slate-800/80" />
                      <Skeleton variant="text" className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800/50" />
                      <div className="flex gap-4 pt-2">
                        <Skeleton variant="text" className="w-24 h-3 bg-slate-200 dark:bg-slate-800/50" />
                        <Skeleton variant="text" className="w-24 h-3 bg-slate-200 dark:bg-slate-800/50" />
                      </div>
                    </div>
                    <Skeleton variant="rect" className="w-10 h-10 rounded-xl bg-slate-300/50 dark:bg-slate-800/80 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <Skeleton variant="rect" className="w-full h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/50 shadow-xl" />
            <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 space-y-6">
              <Skeleton variant="title" className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800/50" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rect" className="w-full h-12 rounded-xl bg-slate-300/30 dark:bg-slate-800/40" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
