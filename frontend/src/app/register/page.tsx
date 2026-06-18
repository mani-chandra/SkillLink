'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';

function RegisterContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: roleParam || 'customer'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.phone, formData.role);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="inline-block mb-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-2xl">
                  🎉
                </div>
              </motion.div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                {formData.role === 'worker' ? 'Join as a Worker' : 'Create Account'}
              </h1>
              <p className="text-gray-600 text-lg">
                {formData.role === 'worker' ? 'Start your journey with SkillLink' : 'Join thousands of happy customers'}
              </p>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center font-semibold"
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">👤</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">📱</span>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">📧</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔒</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      formData.role === 'customer'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">🧑‍💼</div>
                    <div className="font-bold">Customer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'worker' })}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      formData.role === 'worker'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">👨‍🔧</div>
                    <div className="font-bold">Worker</div>
                  </button>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-5 rounded-2xl text-xl font-extrabold hover:from-teal-700 hover:to-teal-800 transition-all shadow-xl hover:shadow-2xl mt-4"
              >
                {formData.role === 'worker' ? 'Join SkillLink' : 'Create Account'}
              </motion.button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-center text-gray-700 text-lg">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 font-extrabold hover:text-teal-700 transition-colors hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
