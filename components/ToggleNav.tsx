'use client';
import Link from 'next/link';
import { useState } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

const ToggleNav = () => {
  const { t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-card text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* <Link href="/" className="text-xl font-bold">
          Logo
        </Link> */}

        {/* Mobile menu button */}
        <button
          className="md:hidden block text-white focus:outline-none z-50"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop menu */}
        {/* <div className="hidden md:flex space-x-4">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <Link href="/login" className="hover:text-gray-300">Login</Link>
          <Link href="/register" className="hover:text-gray-300">Register</Link>
        </div> */}

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 left-0 right-0 bg-card border-b p-4 shadow-lg z-10
        `}>
          <div className="flex flex-col space-y-4">
            <Link href="/" className="hover:text-gray-300" onClick={handleLinkClick}>Home</Link>
            <Link href="/dashboard" className="hover:text-gray-300" onClick={handleLinkClick}>Dashboard</Link>
            <Link href="/products/listing" className="hover:text-gray-300" onClick={handleLinkClick}>shop</Link>
            <Link href="/auth/login" className="hover:text-gray-300" onClick={handleLinkClick}>Login</Link>
            <Link href="/auth/register" className="hover:text-gray-300" onClick={handleLinkClick}>Register</Link>
          </div>
        </div>
      </div>
      {/* <LanguageToggle /> */}
    </nav>
  );
};

export default ToggleNav;
