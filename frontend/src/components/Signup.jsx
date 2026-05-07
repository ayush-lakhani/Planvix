import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { alertUtils } from "../utils/alertUtils";
import AuthLayout from "./auth/AuthLayout";
import AuthCard from "./auth/AuthCard";
import AnimatedButton from "./auth/AnimatedButton";
import SocialAuthButton from "./auth/SocialAuthButton";
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
      alertUtils.warning("Cancelled", "Google sign-in was cancelled or failed.");
    },
    flow: "implicit",
  });

  return (
    <AuthLayout backgroundVariant="client">
      <AuthCard className="animate-stripe-page">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            Join planvIx and build smarter AI strategies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-gray-700 text-sm sm:text-base"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-gray-700 text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-gray-700 text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <AnimatedButton type="submit" loading={authLoading}>
              Create Account
            </AnimatedButton>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 dark:bg-gray-900 px-2 text-slate-500 dark:text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <SocialAuthButton
            onClick={() => handleGoogleSignup()}
            className={authLoading ? "opacity-60 cursor-not-allowed" : ""}
          >
            {authLoading ? "Signing in…" : "Google Account"}
          </SocialAuthButton>
        </div>

        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-slate-900 dark:text-white font-bold hover:text-indigo-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
