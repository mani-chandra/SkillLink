'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ 
              backgroundImage: 'url(https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20workflow%20process%20illustration%20clean%20minimal%20design&image_size=landscape_16_9)'
            }}
          />
          <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <span className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full text-sm font-bold border border-white/30">
                    Simple & Easy
                  </span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                  How It Works
                </h1>
                <p className="text-xl md:text-2xl text-teal-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Getting your work done has never been easier. Follow these simple steps and let us handle the rest.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { 
                  step: 1, 
                  title: 'Choose Your Service', 
                  description: 'Browse our extensive list of professional services and select exactly what you need.',
                  icon: '🔍',
                  color: 'from-blue-500 to-blue-600'
                },
                { 
                  step: 2, 
                  title: 'Select a Worker', 
                  description: 'View profiles, ratings, and reviews to pick the perfect verified professional for your job.',
                  icon: '👨‍🔧',
                  color: 'from-purple-500 to-purple-600'
                },
                { 
                  step: 3, 
                  title: 'Book & Relax', 
                  description: 'Schedule your appointment and let our expert handle everything to perfection.',
                  icon: '✅',
                  color: 'from-green-500 to-green-600'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.25, duration: 0.7 }}
                  whileHover={{ y: -12 }}
                  className="relative"
                >
                  <div className="relative z-10 bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 h-full">
                    <div className="relative inline-block mb-8">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-2xl opacity-30`} />
                      <div className={`relative w-28 h-28 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center text-6xl mx-auto shadow-2xl`}>
                        {item.icon}
                      </div>
                      <div className="absolute -top-4 -right-4 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl font-extrabold text-gray-800 shadow-xl border-4 border-gray-100">
                        {item.step}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-6">{item.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Join thousands of happy customers who trust SkillLink for their service needs.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/services" className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-12 py-6 rounded-3xl text-2xl font-extrabold hover:from-teal-700 hover:to-teal-800 transition-all shadow-2xl hover:shadow-3xl">
                  Explore Services
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
