import {
  Sparkles,
  Menu,
  User,
  LogOut,
  Home,
  Clock,
  Moon,
  Sun,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrismPlannerLogo from "./StratifyLogo";
import logoHorizontal from "../assets/branding/logo-horizontal.svg";
import Dropdown from "./ui/Dropdown";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/planner", label: "Strategic Planner", icon: Sparkles },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
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
              to={user ? "/dashboard" : "/"}
              className="flex items-center gap-3 group transition-opacity hover:opacity-90"
            >
              <PrismPlannerLogo size="md" />
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a68cff] tracking-tight hidden sm:block mt-1">
                Planvx
              </span>
            </Link>
          </div>

          {user ? (
            <>

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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ease-in-out ${
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
                    className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-200 ease-in-out transform ${
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

            {/* Tactical Menu Toggle with Dropdown */}
            <Dropdown
              placement="bottom-end"
              className="bg-slate-950/95 backdrop-blur-xl border border-white/10 p-1.5 w-52 mt-2"
              trigger={
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 border bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
                >
                  <Menu className="w-4 h-4" />
                </button>
              }
            >
              {/* Mobile Navigation Mirror */}
              <div className="md:hidden space-y-1 mb-1.5 pb-1.5 border-b border-white/5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
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
                  onClick={toggleDarkMode}
                  className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none transition-all text-sm font-bold uppercase tracking-wide"
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
                  className="h-10 flex items-center gap-3 px-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none transition-all text-sm font-bold uppercase tracking-wide"
                >
                  <User className="w-4 h-4" />
                  <span>User Profile</span>
                </Link>
                <div className="h-[1px] bg-white/5 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-rose-500 hover:bg-rose-500/10 focus:outline-none transition-all text-sm font-bold uppercase tracking-wide"
                >
                  <LogOut className="w-4 h-4" />
                  <span>System Exit</span>
                </button>
              </div>
            </Dropdown>
          </div>
          </>
        ) : (
            <div className="flex items-center gap-4">
               <button onClick={toggleDarkMode} className="text-slate-400 hover:text-white transition-colors">
                  {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
               </button>
               <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</Link>
               <Link to="/signup" className="bg-gradient-to-r from-[#6200EE] to-[#3b00a0] text-white px-5 py-2 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(98,0,238,0.5)] transition-all">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
