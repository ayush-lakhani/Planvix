import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PrismPlannerLogo from "./planvIxLogo";
import { 
  Home, Calendar, Sparkles, BarChart3, Clock, User, LogOut, 
  ChevronLeft, ChevronRight, Layers, Settings, Bell, Search 
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Sidebar({ className }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Collapse State
  const [collapsed, setCollapsed] = useState(false);
  const [workspace, setWorkspace] = useState("personal");

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "AI Planner", path: "/planner", icon: Sparkles },
    { label: "Calendar", path: "/calendar", icon: Calendar },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "History", path: "/history", icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "hidden md:flex flex-col justify-between h-screen bg-[#090d16]/80 backdrop-blur-xl border-r border-white/5 relative z-40 p-4 shrink-0 overflow-hidden select-none",
        className
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-5 h-10 bg-[#090d16] border border-white/5 hover:border-white/10 rounded-l-lg flex items-center justify-center text-slate-500 hover:text-white transition-colors z-50 focus:outline-none"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2 h-10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <PrismPlannerLogo size="sm" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-lg font-black tracking-tight text-white mt-0.5"
                >
                  planvIx
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Workspace Switcher */}
        <div className="px-1">
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
              <Layers className="w-4 h-4" />
            </div>
          ) : (
            <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-wider text-slate-300 w-full focus:ring-0 cursor-pointer"
              >
                <option value="personal" className="bg-[#0b0f19] text-white">Personal workspace</option>
                <option value="enterprise" className="bg-[#0b0f19] text-white">Enterprise Team</option>
              </select>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 group overflow-hidden text-xs font-bold uppercase tracking-wider",
                  active ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 z-10 transition-colors", active ? "text-[#81ecff]" : "group-hover:text-white")} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {active && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 bg-white/5 border border-white/5 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Actions Footer */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        {/* User Card */}
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center px-1" : "px-2")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs shrink-0 select-none text-white shadow-inner">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="truncate min-w-0">
              <h4 className="text-[11px] font-bold text-slate-300 truncate leading-none mb-1">
                {user?.email?.split("@")[0]}
              </h4>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">
                {user?.tier === "pro" ? "Pro Member" : "Standard Tier"}
              </span>
            </div>
          )}
        </div>

        {/* Settings & Logout triggers */}
        <div className="space-y-1">
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors",
              collapsed ? "justify-center" : ""
            )}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Exit App</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
