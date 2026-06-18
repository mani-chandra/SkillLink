'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '@/lib/api';

interface Booking {
  id: number;
  status: string;
  preferredDateTime: string;
  address: string;
  phone: string;
  description?: string;
  Service: { name: string; icon: string };
  worker?: { User: { name: string } };
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export default function CustomerDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'password'>('bookings');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPreferredDateTime, setEditPreferredDateTime] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'customer') {
      router.push('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/bookings/customer`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setBookings(bookingsRes.data);
        setProfile(profileRes.data);
        setName(profileRes.data.name);
        setPhone(profileRes.data.phone || '');
        setAddress(profileRes.data.address || '');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (user && token) {
      fetchData();
    }
  }, [user, token, loading, router]);

  const saveProfile = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, 
        { name, phone, address }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setSuccessMessage('Profile updated successfully!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
      setSuccessMessage('');
    }
  };

  const changePassword = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/auth/change-password`, 
        { currentPassword, newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Password changed successfully!');
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to change password');
      setSuccessMessage('');
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      setSuccessMessage('Booking cancelled successfully!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to cancel booking');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const startEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditAddress(booking.address);
    setEditPhone(booking.phone);
    setEditPreferredDateTime(new Date(booking.preferredDateTime).toISOString().slice(0, 16));
    setEditDescription(booking.description || '');
  };

  const saveEditBooking = async () => {
    if (!editingBooking) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/api/bookings/${editingBooking.id}`, {
        address: editAddress,
        phone: editPhone,
        preferredDateTime: editPreferredDateTime,
        description: editDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings.map(b => b.id === editingBooking.id ? res.data : b));
      setEditingBooking(null);
      setSuccessMessage('Booking updated successfully!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update booking');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">My Dashboard</h1>

            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'password'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Change Password
              </button>
            </div>

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-300 text-green-800 px-8 py-4 rounded-2xl mb-6 font-semibold"
              >
                {successMessage}
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-300 text-red-800 px-8 py-4 rounded-2xl mb-6 font-semibold"
              >
                {errorMessage}
              </motion.div>
            )}

            {editingBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-xl mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Booking</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Address</label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Phone</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Preferred Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editPreferredDateTime}
                      onChange={(e) => setEditPreferredDateTime(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveEditBooking}
                      className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingBooking(null)}
                      className="bg-gray-300 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-400 transition shadow-lg"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <div className="grid gap-6">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-5xl">{booking.Service.icon}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{booking.Service.name}</h3>
                          <p className="text-gray-600 text-lg">
                            {new Date(booking.preferredDateTime).toLocaleString()}
                          </p>
                          {booking.worker && (
                            <p className="text-gray-600 text-lg">Assigned to: {booking.worker.User.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-6 py-3 rounded-2xl text-sm font-bold ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => startEditBooking(booking)}
                              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
                            >
                              Modify
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => cancelBooking(booking.id)}
                              className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-700 transition"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
                    <p className="text-2xl text-gray-600">No bookings yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl shadow-xl p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                      rows={4}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveProfile}
                    className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl shadow-xl p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Change Password</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={changePassword}
                    className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                  >
                    Change Password
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
