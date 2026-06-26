import React, { useEffect, useRef } from "react";
import { Terminal, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import Tooltip from "./ui/Tooltip";

export default function AgentTerminal({ logs, loading, progress, status }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#090d16]/50 border border-white/5 rounded-[2rem] p-6 h-[600px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Agent Swarm Console
            </h3>
            {loading && (
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            )}
          </div>
          {progress > 0 && (
            <span className="text-xs font-black text-[#81ecff] bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
              {progress}%
            </span>
          )}
        </div>

        {/* Progress Bar with Shimmer */}
        {loading && progress > 0 && (
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-4 overflow-hidden relative border border-white/5">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-[#81ecff] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(129,236,255,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Action Status banner */}
        {status && (
          <div className="mb-4 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2.5 animate-fade-in">
            {progress === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-2 h-2 bg-[#81ecff] rounded-full animate-pulse shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-300">
              {status}
            </span>
          </div>
        )}
      </div>

      {/* Terminal Log Console */}
      <div
        ref={terminalRef}
        className="flex-1 bg-[#050811] border border-white/5 rounded-2xl p-4 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-2 mb-4 scrollbar-thin"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">Console idle. Awaiting planner submission query...</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="animate-fade-in flex items-start gap-2 leading-relaxed">
                <span
                  className={`font-black uppercase tracking-wider shrink-0 select-none ${
                    log.type === "error"
                      ? "text-rose-400"
                      : log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "agent"
                          ? "text-[#81ecff]"
                          : log.type === "request"
                            ? "text-indigo-400"
                            : log.agent === "HTTP" || log.agent === "SERVER"
                              ? "text-amber-400"
                              : "text-indigo-300"
                  }`}
                >
                  [{log.agent}]
                </span>
                <span className="text-slate-300 whitespace-pre-wrap">{log.message}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-slate-500 animate-pulse mt-2 ml-1">
                <span className="w-1.5 h-3 bg-emerald-400" />
                <span>swarm working...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Telemetry Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-4 font-bold uppercase tracking-wider">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Swarms Online</span>
          </p>
          <p className="flex items-center gap-2 text-slate-600">
            <span>Lat: 42ms • SLA 99.9%</span>
          </p>
        </div>
        <div className="text-right text-slate-600">
          <p>PLANVIX SWARM ENGINE</p>
          <p>LOAD: 18%</p>
        </div>
      </div>

    </div>
  );
}
