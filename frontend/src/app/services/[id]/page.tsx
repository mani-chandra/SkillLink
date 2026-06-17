'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import axios from 'axios';

const PREDEFINED_CITIES = [
  'Jagtial',
  'Karimnagar',
  'Korutla',
  'Metpally',
  'Hyderabad',
  'Warangal',
  'Nizamabad',
  'Khammam'
];

const serviceImages: Record<string, string> = {
  'Plumbing': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200',
  'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
  'Drivers': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200',
  'Home Repair': 'https://images.unsplash.com/photo-1581858619704-7b95b6be8be5?auto=format&fit=crop&q=80&w=1200',
  'AC Service': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=1200',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e9e6b3470b36?auto=format&fit=crop&q=80&w=1200',
  'Cooking': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1200'
};

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  startingPrice: number;
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    phone: '',
    preferredDateTime: '',
    description: ''
  });
  const [capacity, setCapacity] = useState<{
    available: boolean;
    total: number;
    reserved: number;
    remaining: number;
  } | null>(null);
  const [checkingCapacity, setCheckingCapacity] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const checkCapacity = async (newDateTime: string, newCity: string, newStreet: string) => {
    if (!newDateTime || !newCity || !token) return;
    setCheckingCapacity(true);
    setErrorMessage('');
    try {
      const address = `${formData.houseNo}, ${newStreet}, ${formData.landmark ? formData.landmark + ', ' : ''}${newCity}`;
      const res = await axios.post('http://localhost:5001/api/bookings/check-capacity', {
        serviceId: id,
        preferredDateTime: newDateTime,
        address: address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCapacity(res.data);
    } catch (error: any) {
      console.error('Error checking capacity:', error);
    } finally {
      setCheckingCapacity(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    if (field === 'preferredDateTime' || field === 'city' || field === 'street') {
      checkCapacity(
        field === 'preferredDateTime' ? value : formData.preferredDateTime,
        field === 'city' ? value : formData.city,
        field === 'street' ? value : formData.street
      );
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/services/${id}`);
        setService(res.data);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };
    if (id) {
      fetchService();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    const address = `${formData.houseNo}, ${formData.street}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}`;
    try {
      await axios.post('http://localhost:5001/api/bookings', {
        serviceId: id,
        address,
        phone: formData.phone,
        preferredDateTime: formData.preferredDateTime,
        description: formData.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/dashboard/customer');
    } catch (error: any) {
      console.error('Error booking service:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to book service');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (!service) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <div>
              <div className="rounded-3xl overflow-hidden shadow-xl mb-8">
                <img 
                  src={serviceImages[service.name] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200'} 
                  alt={service.name}
                  className="w-full h-[300px] lg:h-[400px] object-cover"
                />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{service.name}</h1>
              <p className="text-lg text-slate-600 mb-6">{service.description}</p>
              <div className="text-3xl font-bold text-orange-500 mb-8">₹{service.startingPrice} onwards</div>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">FAQs</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900">How long does it take?</h4>
                    <p className="text-slate-600">Most services are completed within 1-2 hours.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Are the workers verified?</h4>
                    <p className="text-slate-600">Yes, all our workers go through a thorough verification process.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Book Now</h2>
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {errorMessage}
                </div>
              )}
              
              {capacity && (
                <div className={`mb-6 p-4 rounded-xl ${
                  capacity.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-semibold ${capacity.available ? 'text-green-800' : 'text-red-800'}`}>
                    {capacity.available ? '✓ Slot Available' : '✗ Slot Full'}
                  </div>
                  <div className="text-sm">
                    Total Workers: {capacity.total} | Booked: {capacity.reserved} | Remaining: {capacity.remaining}
                  </div>
                </div>
              )}
              
              {checkingCapacity && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6">
                  Checking availability...
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">House No / Flat No</label>
                    <input
                      type="text"
                      required
                      value={formData.houseNo}
                      onChange={(e) => handleChange('houseNo', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder:text-slate-500"
                      placeholder="House / Flat number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Street / Colony</label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder:text-slate-500"
                      placeholder="Street / Colony name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => handleChange('landmark', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder:text-slate-500"
                    placeholder="Near school, park, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select your city</option>
                    {PREDEFINED_CITIES.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder:text-slate-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.preferredDateTime}
                    onChange={(e) => handleChange('preferredDateTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder:text-slate-500"
                    placeholder="Describe the issue"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!capacity?.available && capacity !== null}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Service
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
