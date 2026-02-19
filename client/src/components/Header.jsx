import React, { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[var(--color-background)] border-b border-[var(--color-secondary)] fixed w-full z-20 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
        {/* Logo - On click, goes to Home */}
        <a href="/" className="flex items-center space-x-3">
          <span className="self-center text-2xl font-bold whitespace-nowrap text-[var(--color-primary)]">
            FitAI
          </span>
        </a>

        {/* Auth Buttons */}
        <div className="flex md:order-2 space-x-3 md:space-x-2">
          <button 
            type="button" 
            className="text-[var(--color-text)] hover:bg-[var(--color-secondary)] hover:text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
          >
            Sign In
          </button>
          <button 
            type="button" 
            className="text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:ring-4 focus:outline-none focus:ring-[var(--color-secondary)] font-medium rounded-lg text-sm px-4 py-2 transition-all shadow-sm"
          >
            Sign Up
          </button>
          
        
        </div>

        {/* Navigation Links */}
        <div className={`${isOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-[var(--color-secondary)] rounded-lg md:space-x-8 md:flex-row md:mt-0 md:border-0">
            <li>
              <a href="/" className="block py-2 px-3 text-[var(--color-primary)] font-bold md:p-0" aria-current="page">Home</a>
            </li>
            <li>
              <a href="/about" className="block py-2 px-3 text-[var(--color-text)] rounded hover:text-[var(--color-accent)] md:p-0 transition-colors">About</a>
            </li>
            <li>
              <a href="/contact" className="block py-2 px-3 text-[var(--color-text)] rounded hover:text-[var(--color-accent)] md:p-0 transition-colors">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;