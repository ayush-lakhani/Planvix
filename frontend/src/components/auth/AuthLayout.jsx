import React from "react";
import { Link } from "react-router-dom";
import { Bot, Sparkles, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children, leftPanel }) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex relative overflow-hidden font-sans select-none antialiased">
      
      {/* Background Mesh Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-cyan-500/10 to-indigo-500/5 blur-[120px] mix-blend-screen" />
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')] opacity-[0.025]" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        
        {/* Left Panel: High-End SaaS Value Card (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden border-r border-white/5 bg-[#050811]/40 backdrop-blur-xl">
          
          {/* Header Branding */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6200EE] to-[#81ecff] flex items-center justify-center shadow-[0_0_15px_rgba(98,0,238,0.4)] group-hover:scale-105 transition-transform duration-300">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white mt-0.5">
                planvIx
              </span>
            </Link>
          </div>

          {/* Main Visual Callout */}
          <div className="max-w-lg space-y-8">
            {leftPanel || (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" /> Autonomous strategy OS
                  </div>
                  <h1 className="text-5xl font-black tracking-tight leading-[1.1] text-white">
                    Deploy Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81ecff] via-white to-[#a68cff] drop-shadow-[0_0_30px_rgba(129,236,255,0.25)]">
                      AI Agent Swarm
                    </span>
                  </h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Collaborate with specialized agents conducting deep competitor web crawling, visionary brand-voice copy writing, and semantic SEO analysis in parallel.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    "Multi-Agent Swarm Orchestrator",
                    "Factual Competitor Web Ingestion",
                    "Real SEO Semantic Keyword Checking",
                    "Integrated Strategy Calendar Blueprint"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* SLA Badge */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span>SLA Uptime: 99.99%</span>
            <span>•</span>
            <span>Priority Queue Status: Online</span>
          </div>

        </div>

        {/* Right Panel: Form view */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            
            {/* Mobile Header Branding */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6200EE] to-[#81ecff] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-white mt-0.5">
                  planvIx
                </span>
              </Link>
            </div>

            {children}
          </div>
        </div>

      </div>

    </div>
  );
}
