import {
  Sparkles,
  Menu,
  User,
  LogOut,
  Home,
  Clock,
  Moon,
  Sun,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logoHorizontal from "../assets/branding/logo-horizontal.svg";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/planner", label: "Strategic Planner", icon: Sparkles },
    { path: "/history", label: "History", icon: Clock },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 h-14 bg-slate-950/70 backdrop-blur-md border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full w-full">
          {/* Logo Section - Elite Compact */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
                Planvix
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center Aligned */}
          <div className="hidden md:flex items-center gap-1.5 h-full">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 h-full transition-all duration-200 group overflow-hidden`}
                >
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                      active
                        ? "bg-white/5 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${active ? "text-primary-400" : "group-hover:text-primary-400"}`}
                    />
                    <span className="text-sm font-semibold tracking-wide">
                      {link.label}
                    </span>
                  </div>

                  {/* Subtle Linear Indicator Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 transform ${
                      active
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* User Menu & Actions - Right Aligned */}
          <div className="flex items-center gap-4">
            {/* User Credentials - High End Tier Display */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-semibold text-slate-200 leading-none mb-1">
                {user?.email}
              </span>
              {user?.tier === "pro" ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    Enterprise Pro
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Standard Layer
                  </span>
                </div>
              )}
            </div>

            {/* Tactical Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 border ${
                menuOpen
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Menu
                className={`w-4 h-4 transition-transform duration-300 ${menuOpen ? "rotate-90" : "rotate-0"}`}
              />
            </button>

            {/* Elite Glass Dropdown */}
            {menuOpen && (
              <div className="absolute top-[3.75rem] right-0 bg-slate-950/95 backdrop-blur-xl border border-white/10 p-1.5 w-52 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl animate-fade-in-up z-50">
                {/* Mobile Navigation Mirror */}
                <div className="md:hidden space-y-1 mb-1.5 pb-1.5 border-b border-white/5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          active
                            ? "bg-white/5 text-primary-400"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wide">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setMenuOpen(false);
                    }}
                    className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-sm font-bold uppercase tracking-wide"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    <span>{darkMode ? "Day Phase" : "Night Phase"}</span>
                  </button>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="h-10 flex items-center gap-3 px-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-sm font-bold uppercase tracking-wide"
                  >
                    <User className="w-4 h-4" />
                    <span>User Profile</span>
                  </Link>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all text-sm font-bold uppercase tracking-wide"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>System Exit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background Mask for Interaction Safety */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}
