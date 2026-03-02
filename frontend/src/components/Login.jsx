import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./auth/AuthLayout";
import AuthCard from "./auth/AuthCard";
import AnimatedButton from "./auth/AnimatedButton";
import SocialAuthButton from "./auth/SocialAuthButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backgroundVariant="client">
      <AuthCard className="animate-stripe-page">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Please enter your details to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white transition-all placeholder:text-gray-700"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
                Password
              </label>
              <Link
                to="#"
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white transition-all placeholder:text-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500/20 transition-all"
            />
            <label
              htmlFor="remember"
              className="text-[11px] font-bold text-gray-500 cursor-pointer uppercase tracking-wider"
            >
              Remember for 30 days
            </label>
          </div>

          <AnimatedButton type="submit" loading={loading}>
            Sign In
          </AnimatedButton>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialAuthButton>Google Account</SocialAuthButton>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          New to Planvix?{" "}
          <Link
            to="/signup"
            className="text-white font-bold hover:text-indigo-400 transition-colors"
          >
            Create account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
