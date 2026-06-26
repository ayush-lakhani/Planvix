import * as React from "react";
import { Dialog } from "./Dialog";
import { Search, Sparkles, Home, Calendar, BarChart3, Clock, User, ShieldAlert, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const items = [
    { label: "Dashboard", category: "Navigation", icon: Home, action: () => navigate("/dashboard") },
    { label: "Strategic Planner", category: "Navigation", icon: Sparkles, action: () => navigate("/planner") },
    { label: "Content Calendar", category: "Navigation", icon: Calendar, action: () => navigate("/calendar") },
    { label: "Analytics Dashboard", category: "Navigation", icon: BarChart3, action: () => navigate("/analytics") },
    { label: "History Log", category: "Navigation", icon: Clock, action: () => navigate("/history") },
    { label: "User Profile Settings", category: "Navigation", icon: User, action: () => navigate("/profile") },
    { label: "Billing & Subscriptions", category: "Navigation", icon: Zap, action: () => navigate("/upgrade") },
    { label: "Admin Console", category: "Navigation", icon: ShieldAlert, action: () => navigate("/admin") },
  ];

  const filtered = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action) => {
    action();
    onClose();
    setQuery("");
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="p-0 overflow-hidden max-w-xl">
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions, pages, and shortcuts..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-600 text-xs"
          autoFocus
        />
        <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-500 font-mono">
          ESC
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 font-mono">No actions matched your search query</p>
        ) : (
          filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(item.action)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-left text-xs font-semibold text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#81ecff] transition-colors" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-slate-400 transition-colors">
                  {item.category}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="bg-[#06090f] border-t border-white/5 px-4 py-2.5 flex items-center justify-between text-[10px] text-slate-600 font-medium">
        <span>Use arrow keys to navigate</span>
        <span>Press enter to select</span>
      </div>
    </Dialog>
  );
}

export { CommandPalette };
