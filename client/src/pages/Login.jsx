import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/Api";
import { MdOutlineFitnessCenter } from "react-icons/md";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      toast.success("Welcome back to FitAI!");
      localStorage.setItem("token", res.data.token);

      // Auto-clear form on success
      setFormData({ email: "", password: "" });

      // Redirect logic (e.g., window.location.href = "/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-10   bg-slate-100">
        {" "}
        <div className="min-h-screen w-full flex font-sans overflow-hidden rounded-2xl">
          {/* LEFT SIDE: Brand Branding Section */}
          <div className="hidden lg:flex lg:w-[55%] bg-[#5D38F0] relative items-center justify-center p-12 overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10 max-w-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <span className="text-white text-xl font-bold">
                    <MdOutlineFitnessCenter />
                  </span>
                </div>
                <span className="text-3xl font-black text-white tracking-tighter uppercase">
                  FitAI
                </span>
              </div>

              <h1 className="text-6xl font-bold text-white leading-tight mb-6">
                Your Personal <br />{" "}
                <span className="text-purple-200">AI Fitness Coach</span>
              </h1>

              <p className="text-indigo-100 text-lg leading-relaxed mb-12 opacity-80">
                Adaptive intelligence that learns your body, tracks your
                progress, and evolves with your fitness journey.
              </p>

              <div className="space-y-4">
                <FeatureItem
                  title="AI-Powered Plans"
                  desc="Personalized workouts & nutrition"
                  icon="🧠"
                />
                <FeatureItem
                  title="Smart Progress Tracking"
                  desc="Real-time metrics & insights"
                  icon="📈"
                />
                <FeatureItem
                  title="Adaptive Training"
                  desc="Adjusts based on fatigue & recovery"
                  icon="⚡"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Login Form Section */}
          <div className="w-full lg:w-[50%] flex items-center justify-center ">
            <div className="bg-white w-full max-w-[420px] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 transition-all border border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome back
                </h2>
                <p className="text-slate-400 text-sm">
                  Sign in to continue your fitness journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-tighter"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#7C3AED] text-white text-sm font-bold rounded-2xl hover:bg-[#6D28D9] transition-all active:scale-[0.98] shadow-lg shadow-indigo-200 mt-2 disabled:bg-slate-300"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign up for free
                  </a>
                </p>
              </div>

              <p className="mt-12 text-[11px] text-slate-300 text-center italic">
                "Transform your body, elevate your mind"
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Sub-component for Feature items on the left side
const FeatureItem = ({ title, desc, icon }) => (
  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-default">
    <div className="w-10 h-10 bg-indigo-500/30 rounded-lg flex items-center justify-center text-xl">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-bold text-sm">{title}</h4>
      <p className="text-indigo-200/60 text-xs">{desc}</p>
    </div>
  </div>
);

export default Login;
