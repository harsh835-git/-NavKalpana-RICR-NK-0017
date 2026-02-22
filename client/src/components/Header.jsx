import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdOutlineFitnessCenter } from "react-icons/md";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Use Link for internal navigation to avoid page refreshes
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header 
      className={`fixed w-full z-[100] top-0 transition-all duration-300 ${
        scrolled 
        ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100/50 py-3" 
        : "bg-white md:bg-transparent py-5" // Added white background for mobile initial state
      }`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-6">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
            <span className="text-white text-lg font-bold"><MdOutlineFitnessCenter/></span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            FitAI
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-slate-500 rounded-lg md:hidden hover:bg-slate-100"
        >
          <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
        </button>

        {/* NAVIGATION LINKS */}
        <div className={`${isOpen ? "block" : "hidden"} w-full md:block md:w-auto transition-all`}>
          <ul className="flex flex-col md:flex-row p-4 md:p-0 mt-4 md:mt-0 font-bold md:space-x-10 rounded-2xl bg-slate-50 md:bg-transparent border border-slate-100 md:border-0 text-sm">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 px-3 transition-colors ${
                    location.pathname === link.path
                      ? "text-[#7C3AED]"
                      : "text-slate-600 hover:text-[#7C3AED]"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* AUTH BUTTONS */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-bold text-slate-700 hover:text-[#7C3AED] px-4 py-2 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#7C3AED] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#6D28D9] transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;