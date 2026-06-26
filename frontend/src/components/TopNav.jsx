import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { CommandPalette } from "./ui/CommandPalette";
import { 
  Sun, Moon, Bell, Sparkles, Search, ChevronDown, User, 
  Settings, LogOut, Command, Send, MessageSquare, CheckCircle2 
} from "lucide-react";
import Dropdown from "./ui/Dropdown";

export default function TopNav({ darkMode, toggleDarkMode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dialog / Command Palette States
  const [cmdOpen, setCmdOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "Hello! I am your planvIx AI strategy assistant. How can I help you refine your content swarms today?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Tech Researcher: Crawled developer communities for 'AI Swarms' vectors.", read: false, time: "2m ago" },
    { id: 2, text: "Master Copywriter: Draft hook completed for strategy #42.", read: false, time: "15m ago" },
    { id: 3, text: "SEO Analyst: Re-indexing keywords: density rating 98%.", read: true, time: "1h ago" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Listen for Ctrl/Cmd + K shortcut keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "personal / dashboard";
    if (path === "/planner") return "personal / AI planner";
    if (path === "/calendar") return "personal / Calendar blueprint";
    if (path === "/analytics") return "personal / Growth metrics";
    if (path === "/history") return "personal / Strategy history";
    if (path === "/profile") return "personal / profile settings";
    if (path === "/upgrade") return "personal / subscriptions";
    if (path.startsWith("/blueprint")) return "personal / blueprint viewer";
    return "personal / strategy suite";
  };

  const handleAiSend = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", text: userText }]);
    setAiInput("");
    setAiThinking(true);

    setTimeout(() => {
      let reply = "I've analyzed that request. Swarm configuration parameters have been optimized to target higher conversion thresholds.";
      
      const lower = userText.toLowerCase();
      if (lower.includes("hook") || lower.includes("write")) {
        reply = 'Here is a custom visionary hook for LinkedIn:\n\n"LLMs are bottlenecked. When you force one model to handle research, copywriting, and SEO simultaneously, quality fractures. Here is the swarm approach..."';
      } else if (lower.includes("keywords") || lower.includes("seo")) {
        reply = "Recommended high-intent keyword vectors to inject: #multiagent, #aiagents, #agenticworkflows, #developerops (+280% organic volume MoM).";
      } else if (lower.includes("pricing") || lower.includes("pro")) {
        reply = "Pro Tier licenses unlock priority worker scheduling queues, unlimited compiles, and live Google Search crawler integrations.";
      }

      setAiMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setAiThinking(false);
    }, 1200);
  };

  return (
    <>
      <header className="h-16 border-b border-white/5 bg-[#090d16]/40 backdrop-blur-md px-6 flex items-center justify-between relative z-30 select-none">
        
        {/* Route breadcrumbs tracker */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#81ecff] bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
            {getPageTitle()}
          </span>
        </div>

        {/* Global actions elements */}
        <div className="flex items-center gap-4">
          
          {/* Global Search shortcut button (triggers command palette) */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-6 px-3.5 py-1.5 bg-white/5 border border-white/5 hover:border-white/10 text-slate-500 hover:text-slate-300 rounded-xl transition-all duration-300 text-[11px]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search actions...</span>
            </div>
            <div className="flex items-center gap-0.5 opacity-60">
              <Command className="w-3 h-3" />
              <span className="font-mono">K</span>
            </div>
          </button>

          {/* AI assistant launcher button */}
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 flex items-center justify-center transition-colors focus:outline-none"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
          </button>

          {/* Notifications Center with Dropdown */}
          <Dropdown
            placement="bottom-end"
            className="bg-[#090d16] border border-white/10 p-2 w-72 mt-2"
            trigger={
              <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all relative focus:outline-none">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            }
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 px-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">System notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300">
                  Mark all read
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className={`p-2.5 rounded-xl text-[11px] leading-relaxed transition-all ${n.read ? 'text-slate-500 bg-transparent' : 'text-slate-200 bg-white/5 border border-white/5'}`}>
                  <p>{n.text}</p>
                  <span className="text-[9px] text-slate-600 mt-1 block">{n.time}</span>
                </div>
              ))}
            </div>
          </Dropdown>

          {/* Theme switcher toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all focus:outline-none"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* Global command palette keyboard trigger */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* AI Assistant Dialogue Modal */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiAssistantOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-[#090d16]/95 border border-white/10 rounded-3xl w-full max-w-lg h-[500px] flex flex-col justify-between shadow-2xl backdrop-blur-xl overflow-hidden z-10 text-white"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#06090f]">
                <div className="flex items-center gap-2 text-[#81ecff]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">planvIx AI Strategy Assistant</span>
                </div>
                <button onClick={() => setAiAssistantOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 select-none ${
                      msg.role === 'user' ? 'bg-[#6200EE] text-white' : 'bg-indigo-500/10 border border-indigo-500/20 text-[#81ecff]'
                    }`}>
                      {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-100' : 'bg-white/5 border border-white/5 text-slate-300'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiThinking && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[#81ecff] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-1.5 text-slate-500 text-xs">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <form onSubmit={handleAiSend} className="p-4 border-t border-white/5 bg-[#06090f] flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask for custom hooks, keyword ideas, or platform tips..."
                  className="flex-1 bg-[#0d1321]/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#6200EE] transition-colors"
                />
                <button
                  type="submit"
                  className="p-3 rounded-xl bg-gradient-to-r from-[#6200EE] to-[#3b00a0] hover:shadow-[0_0_15px_rgba(98,0,238,0.4)] text-white flex items-center justify-center transition-all focus:outline-none"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Minimal X close icon inline helper component
function X(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
