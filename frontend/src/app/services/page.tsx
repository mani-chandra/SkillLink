'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import API_BASE_URL from '@/lib/api';

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/services`);
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Our Services
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Wide range of professional services to keep your home running smoothly
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                          {service.name}
                        </h2>
                        <p className="text-slate-600 mb-8 flex-grow">
                          {service.description}
                        </p>
                        <div className="flex flex-col gap-6 pt-6 border-t border-slate-100">
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
      </main>
      <Footer />
    </div>
  );
}
