"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";
import { getApiUrl } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Create Account | Open Job";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both entries.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setUserAlreadyExists(false);

      const cleanEmail = email.trim();

      const res = await fetch(
        `${getApiUrl()}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        const detail = err.detail || "Registration failed. Account may already exist.";
        if (detail.toLowerCase().includes("already exists")) {
          setUserAlreadyExists(true);
          throw new Error("This email is already registered. Please sign in instead.");
        }
        throw new Error(detail);
      }

      setSuccessMsg("Account created! Signing you in...");

      // Automatically sign in upon successful registration
      try {
        const formData = new FormData();
        formData.append("username", cleanEmail);
        formData.append("password", password);

        const loginRes = await fetch(`${getApiUrl()}/auth/login`, {
          method: "POST",
          body: formData,
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem("token", loginData.access_token);
          document.cookie = `oj_session=${loginData.access_token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `access_token=${loginData.access_token}; path=/; max-age=604800; SameSite=Lax`;
          // Direct entrance into dashboard
          window.location.href = "/dashboard";
          return;
        }
      } catch (loginErr) {
        console.warn("Auto-login error, falling back to signin page", loginErr);
      }

      // Fallback: redirect cleanly to Sign In page with email pre-filled
      setSuccessMsg("Account created! Redirecting to Sign In...");
      setTimeout(() => {
        window.location.href = `/login?registered=true&email=${encodeURIComponent(cleanEmail)}`;
      }, 400);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden select-none font-sans">
      {/* Background Cybernetic AI Visual */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-screen">
        <Image
          src="/about-ai-core.jpg"
          alt="Open Job AI Core"
          fill
          priority
          className="object-cover object-center scale-105 animate-cyber-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950" />
      </div>

      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/20 to-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Bordered Brand Emblem */}
          <Link href="/" className="inline-block group">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[2px] shadow-[0_0_30px_rgba(6,182,212,0.45)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.65)] group-hover:scale-105 transition-all duration-300 mx-auto mb-3">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-3 shadow-inner">
                <OpenCodeLogo className="w-9 h-9" glow animated />
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              Agent Onboarding
            </span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Deploy your dedicated personal AI job search &amp; application assistant
          </p>
        </div>

        {/* Ultra-Premium Glass Card with Holographic Gradient Border */}
        <div className="relative p-[1.5px] rounded-3xl bg-gradient-to-b from-cyan-400/40 via-blue-500/20 to-purple-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[23px] p-8 sm:p-9 space-y-5 border border-white/5">
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-medium flex flex-col gap-2 shadow-lg shadow-rose-950/40">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
                {userAlreadyExists && (
                  <Link
                    href={`/login?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-bold underline text-xs pl-6"
                  >
                    Go to Sign In page →
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@openjob.ai"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && confirmPassword && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_25px_rgba(59,130,246,0.35)] text-sm font-bold tracking-wide"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account &amp; Setup Agent
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              Already have an agent account?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-bold underline ml-1"
              >
                Sign In →
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Integrity Footnote */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            AES-256 Encrypted
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Rule 2 Truth Enforced
          </span>
        </div>
      </div>
    </div>
  );
}
