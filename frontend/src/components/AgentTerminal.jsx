import { Terminal, Activity, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import Tooltip from "./ui/Tooltip";

export default function AgentTerminal({ logs, loading, progress, status }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-card p-6 h-[600px] flex flex-col sticky top-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Agent Terminal
          </h3>
          {loading && (
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          )}
        </div>
        {progress > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{progress}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {loading && progress > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-4 overflow-hidden relative">
          <div 
            className="bg-primary-600 h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)] relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 animate-shimmer"></div>
          </div>
        </div>
      )}

      {status && (
        <div className="mb-4 p-3 bg-primary-50/50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-lg flex items-center gap-2">
          {progress === 100 ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          )}
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {status}
          </span>
        </div>
      )}

      <div
        ref={terminalRef}
        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.08)] rounded-xl p-4 overflow-y-auto font-mono text-sm"
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">Waiting for input...</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="animate-fade-in flex items-start gap-2">
                <Tooltip content={`${log.agent} Node Context`} placement="top">
                  <span
                    className={`font-bold cursor-help shrink-0 ${
                      log.type === "error"
                        ? "text-red-500 dark:text-red-400"
                        : log.type === "success"
                          ? "text-green-500 dark:text-green-400"
                          : log.type === "agent"
                            ? "text-cyan-500 dark:text-cyan-400"
                            : log.type === "request"
                              ? "text-blue-500 dark:text-blue-400"
                              : log.agent === "HTTP" || log.agent === "SERVER"
                                ? "text-orange-500 dark:text-orange-400"
                                : "text-amber-500 dark:text-yellow-400"
                    }`}
                  >
                    [{log.agent}]
                  </span>
                </Tooltip>
                <span className="text-slate-700 dark:text-gray-300">{log.message}</span>
              </div>

            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 animate-pulse mt-2">
                <span className="animate-bounce text-[10px]">●</span>
                <span
                  className="animate-bounce text-[10px]"
                  style={{ animationDelay: "0.2s" }}
                >
                  ●
                </span>
                <span
                  className="animate-bounce text-[10px]"
                  style={{ animationDelay: "0.4s" }}
                >
                  ●
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Strategy Engine Active
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Professional Content Planning
          </p>
        </div>
        <div className="text-right">
            <p>PLANVIX V2.0</p>
            <p>NODE_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
