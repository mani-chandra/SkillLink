'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  startingPrice: number;
  category: string;
}

const serviceImages: Record<string, string> = {
  'Plumbing': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
  'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
  'Drivers': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
  'Home Repair': 'https://images.unsplash.com/photo-1581858619704-7b95b6be8be5?auto=format&fit=crop&q=80&w=800',
  'AC Service': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e9e6b3470b36?auto=format&fit=crop&q=80&w=800',
  'Cooking': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800'
};

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/services');
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  Trusted by thousands
                </span>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Home services made
                  <span className="text-orange-500"> simple</span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed">
                  Book verified professionals for all your home needs. From plumbing to cleaning, 
                  we&apos;ve got you covered with reliable service you can count on.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/services"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
                  >
                    Explore Services
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
                  >
                    How It Works
                  </Link>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
                    alt="Happy family at home"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                  <div className="text-4xl font-bold text-orange-500">10,000+</div>
                  <div className="text-slate-600">Happy Customers</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Our Services
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Wide range of professional services to keep your home running smoothly
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <Link href={`/services/${service.id}`} className="block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-300 transition-all h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={serviceImages[service.name] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'} 
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">
                          {service.name}
                        </h3>
                        <p className="text-slate-600 mb-6 flex-grow">
                          {service.description}
                        </p>
                        <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
                          <div>
                            <span className="text-2xl font-bold text-orange-500">
                              ₹{service.startingPrice}
                            </span>
                            <span className="text-sm font-normal text-slate-500 ml-1">starting</span>
                          </div>
                          <div className="w-full">
                            <div className="block w-full bg-orange-500 hover:bg-orange-600 text-center text-white px-6 py-3 rounded-xl font-medium transition-colors">
                              Book Now
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="rounded-3xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1000" 
                    alt="Professional working"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                  How It Works
                </h2>
                <div className="space-y-8">
                  {[
                    {
                      number: 1,
                      title: 'Choose a Service',
                      description: 'Browse our services and select what you need for your home'
                    },
                    {
                      number: 2,
                      title: 'Book Your Slot',
                      description: 'Pick a convenient date and time that works best for you'
                    },
                    {
                      number: 3,
                      title: 'Relax & Get It Done',
                      description: 'Our verified professional will arrive and complete the job'
                    }
                  ].map((step, index) => (
                    <div key={index} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-slate-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to get started?
              </h2>
              <p className="text-lg text-slate-300 mb-10">
                Join thousands of happy customers who trust SkillLink for their home service needs
              </p>
              <Link
                href="/register"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors"
              >
                Create an Account
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
