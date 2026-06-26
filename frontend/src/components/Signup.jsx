import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, UserPlus } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { alertUtils } from "../utils/alertUtils";
import AuthLayout from "./auth/AuthLayout";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import PasswordStrengthMeter from "./auth/PasswordStrengthMeter";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loading: authLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alertUtils.warning("Invalid Password", "Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alertUtils.warning("Password Mismatch", "Passwords do not match");
      return;
    }

    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      alertUtils.error("Signup Failed", err.message || "Please try again.");
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        await loginWithGoogle(credentialResponse);
        navigate("/dashboard");
      } catch (err) {
        console.error("Google signup error:", err);
        alertUtils.error("Google Sign-In Failed", err.message || "Please try again.");
      }
    },
    onError: () => {
      alertUtils.warning("Cancelled", "Google sign-in was cancelled.");
    },
    flow: "implicit",
  });

  return (
    <AuthLayout>
      <div className="bg-[#090d16]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in w-full">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1.5">
            Deploy your strategies. Orchestrate swarms of content agents.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            required
            label="Security Email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Security Password
            </label>
            <Input
              type="password"
              required
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <Input
            type="password"
            required
            label="Confirm Password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
            loading={authLoading}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </Button>
        </form>

        {/* Google Authentication divider */}
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-[#090d16]/95 px-3 text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google button */}
        <div className="mt-6">
          <button
            onClick={() => handleGoogleSignup()}
            disabled={authLoading}
            className="w-full py-3.5 bg-white/5 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus:outline-none"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* Link to Login */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white font-black hover:text-indigo-400 transition-colors uppercase tracking-wider"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
