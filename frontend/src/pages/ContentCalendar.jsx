import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Cpu,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Layers,
  Clock,
  ArrowRight
} from "lucide-react";
import { strategyApi } from "../api/strategyApi";
import { Button } from "../components/ui/Button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function ContentCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real strategies from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await strategyApi.getHistory();
        setStrategies(data.history || []);
      } catch (err) {
        setError("Could not load strategies. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Build a contentMap keyed by day-of-month for the current month/year view
  const contentMap = useMemo(() => {
    const map = {};
    strategies.forEach((s) => {
      const created = new Date(s.created_at);
      if (
        created.getFullYear() === currentYear &&
        created.getMonth() === currentMonth
      ) {
        const day = created.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          id: s._id || s.id,
          type: s.industry ? "tech" : "marketing",
          title: s.goal || s.topic || "Generated Strategy",
          status: "Completed",
          raw: s,
        });
      }
    });
    return map;
  }, [strategies, currentYear, currentMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  const selectedContent = contentMap[selectedDay] || [];

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden font-sans pb-12">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-['Manrope'] tracking-tight">
              Content Calendar
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Visualize and schedule your AI strategy swarm deployments
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Month navigation controls */}
            <div className="flex bg-[#0c0f1d]/60 border border-white/5 p-1 rounded-xl backdrop-blur-md">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-1.5 text-xs font-black uppercase tracking-wider flex items-center">
                {monthNames[currentMonth]} {currentYear}
              </div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.href = "/planner"}
              className="flex items-center gap-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Swarm
            </Button>
          </div>
        </div>

        {/* Master Workspace Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Grid Area */}
          <div className="flex-1 bg-[#0c0f1d]/20 border border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col min-h-[500px]">
            
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <span className="text-xs font-semibold">Loading strategy calendar...</span>
              </div>
            )}

            {error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-rose-400">
                <AlertCircle className="w-8 h-8 mb-3" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className="flex-1 flex flex-col">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-white/5 pb-3 mb-2 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-7 gap-1 bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden"
                >
                  {/* Empty Slots */}
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="bg-[#05060b]/40 aspect-square border border-white/5 opacity-30"
                    />
                  ))}

                  {/* Days grid */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDay === day;
                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear();
                    const dayContent = contentMap[day] || [];

                    return (
                      <motion.div
                        key={day}
                        variants={cellVariants}
                        onClick={() => setSelectedDay(day)}
                        className={`aspect-square border border-white/5 p-2 relative cursor-pointer group transition-all duration-300 ${
                          isSelected
                            ? "bg-indigo-500/10 border-indigo-500/30"
                            : "bg-[#0c0f1d]/20 hover:bg-[#111428]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black ${
                              isToday
                                ? "text-indigo-400 font-extrabold"
                                : isSelected
                                ? "text-white"
                                : "text-slate-500 group-hover:text-slate-300"
                            }`}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          )}
                        </div>

                        {/* Event Tags List */}
                        <div className="mt-2 space-y-1 overflow-hidden max-h-[75%]">
                          {dayContent.map((item) => (
                            <div
                              key={item.id}
                              className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md truncate border ${
                                item.type === "tech"
                                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                              }`}
                            >
                              {item.title}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </div>

          {/* Right Inspect Drawer */}
          <div className="w-full lg:w-96 bg-[#0c0f1d]/20 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                {monthNames[currentMonth]} {selectedDay}, {currentYear}
              </div>
              <h2 className="text-xl font-black text-white font-['Manrope'] mb-6">
                Swarm Deployments
              </h2>

              <div className="space-y-6 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                {selectedContent.length > 0 ? (
                  selectedContent.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#080b15]/60 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.type === "tech"
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          }`}
                        >
                          {item.type === "tech" ? "Technology Swarm" : "Marketing Swarm"}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                          Ready
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-200 leading-snug">
                        {item.title}
                      </h4>

                      {item.raw?.industry && (
                        <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          Industry: {item.raw.industry}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white/[0.01] border border-white/5 rounded-2xl text-slate-500 text-xs">
                    No strategic swarms generated for this date.
                  </div>
                )}

                {/* AI Agents Suggestion Module */}
                <div className="bg-gradient-to-br from-indigo-500/5 via-cyan-500/5 to-transparent border border-[#6200EE]/20 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h5 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Agent Suggestion</h5>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {selectedContent.length === 0
                      ? "A vacant slot here could lower conversion momentum. Connect strategy agents now to fill."
                      : `You have ${selectedContent.length} active swarm(s) scheduled. Would you like to deploy follow-up campaigns?`}
                  </p>

                  <button
                    onClick={() => window.location.href = "/planner"}
                    className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Invoke Planner <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Workflow approval timelines */}
            {selectedContent.length > 0 && (
              <div className="mt-8 border-t border-white/5 pt-6 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Swarm Workflow Status
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Swarms Synthesized</p>
                      <p className="text-[10px] text-slate-500">Completed by AI Agent Swarm</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <div className="absolute -top-3.5 left-4 w-[1px] h-3.5 bg-white/10" />
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Ready for Execution</p>
                      <p className="text-[10px] text-slate-500">Available in strategic history logs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
