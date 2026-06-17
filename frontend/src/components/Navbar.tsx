'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileDropdownOptions = [
    { label: 'Dashboard', href: user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'worker' ? '/dashboard/worker' : '/dashboard/customer' },
    { label: 'Edit Profile', href: user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'worker' ? '/dashboard/worker' : '/dashboard/customer' },
    { label: 'Change Password', href: user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'worker' ? '/dashboard/worker' : '/dashboard/customer' }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-slate-900">
              SkillLink
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link href="/services" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors rounded-lg">
              Services
            </Link>
            <Link href="/how-it-works" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors rounded-lg">
              How It Works
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-3 ml-6">
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-slate-700 font-medium hidden lg:block">
                      {user.name}
                    </span>
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-500 font-medium mb-1">Signed in as</p>
                        <p className="text-lg font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {profileDropdownOptions.map((option, idx) => (
                          <Link
                            key={idx}
                            href={option.href}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
                          >
                            {option.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                            router.push('/');
                          }}
                          className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors mt-2"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-6">
                <Link href="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors rounded-lg">
                  Login
                </Link>
                <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white border-t border-slate-200 shadow-md"
        >
          <div className="px-6 py-5 space-y-2">
            <Link 
              href="/services" 
              className="block px-4 py-3 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/how-it-works" 
              className="block px-4 py-3 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            
            {user ? (
              <>
                {profileDropdownOptions.map((option, idx) => (
                  <Link
                    key={idx}
                    href={option.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {option.label}
                  </Link>
                ))}
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    router.push('/');
                  }} 
                  className="block w-full text-left px-4 py-3 text-red-600 hover:text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors mt-3"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <Link 
                  href="/login" 
                  className="block px-4 py-3 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
