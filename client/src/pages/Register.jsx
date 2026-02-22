import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/Api";
import { MdOutlineFitnessCenter } from "react-icons/md";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic Validation
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;

      // 2. Call your API
      const res = await api.post("/auth/register", submitData);

      // 3. Show Success Message
      toast.success(res.data.message || "Registration successful!");

      // 4. AUTO-CLEAR FORM (This triggers after success)
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      // 5. Handle Errors (e.g., Email already exists)
      const errorMsg = error?.response?.data?.message || "Registration Failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-10 rounded-2xl bg-[#F3F4F6]">
        {" "}
        <div className="min-h-screen w-full flex  font-sans rounded-2xl">
          {/* LEFT SECTION: COMPACT FORM */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[400px] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 transition-all">
              <div className="text-center mb-8">
                <span className="text-2xl block mb-1">✨</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Start Your Journey
                </h1>
                <p className="text-gray-400 text-xs font-medium">
                  Create your account and unlock AI-powered fitness
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#7C3AED] text-white text-sm font-bold rounded-xl hover:bg-[#6D28D9] transition-all active:scale-[0.98] shadow-md shadow-purple-100 mt-4 disabled:bg-gray-400"
                >
                  {isLoading ? "Please wait..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs font-medium text-gray-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-purple-600 font-bold hover:underline"
                >
                  Sign in
                </a>
              </p>

              <p className="mt-8 text-[12px] text-gray-400 text-center leading-relaxed">
                By signing up, you agree to our{" "}
                <span className="underline cursor-pointer">Terms</span> and{" "}
                <span className="underline cursor-pointer">Privacy</span>
              </p>
            </div>
          </div>

          {/* RIGHT SECTION: BRANDING */}
          <div className="hidden lg:flex lg:w-1/2 bg-[#5D38F0] p-12 flex-col justify-center text-white relative overflow-hidden rounded-r-2xl">
            <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-12">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <span className="text-white text-xl font-bold">
                    <MdOutlineFitnessCenter />
                  </span>
                </div>
                <span className="text-3xl font-black text-white tracking-tighter uppercase">
                  FitAI
                </span>
              </div>
              <h2 className="text-5xl font-bold leading-[1.1] mb-6">
                Join Thousands Transforming Daily
              </h2>
              <p className="text-lg text-purple-100/80 leading-relaxed mb-12">
                Experience the future of fitness with AI adapted to your body.
              </p>
              <div className="space-y-8">
                <Feature
                  title="Personalized AI Plans"
                  desc="Custom workout and diet plans tailored to you."
                />
                <Feature
                  title="Real-Time Insights"
                  desc="Track every metric as your progress unfolds."
                />
                <Feature
                  title="24/7 AI Coach"
                  desc="Instant answers from your personal fitness coach."
                />
              </div>
            </div>
          </div>
        </div>
        ;
      </div>
    </>
  );
};

const Feature = ({ title, desc }) => (
  <div className="flex gap-4 items-start">
    <div className="w-2 h-2 mt-2 bg-purple-300 rounded-full shadow-[0_0_10px_#A78BFA]" />
    <div>
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="text-purple-100/60 text-xs">{desc}</p>
    </div>
  </div>
);

export default Register;
