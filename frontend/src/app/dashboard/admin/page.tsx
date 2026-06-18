'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '@/lib/api';

interface UserType {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  Worker?: any;
}

interface BookingType {
  id: number;
  status: string;
  preferredDateTime: string;
  address: string;
  phone: string;
  description: string | null;
  Service: { name: string; icon: string };
  customer: { name: string; phone: string; id: number };
  worker?: { User: { name: string }; id: number | null };
  workerId?: number | null;
}

export default function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'workers'>('users');
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // User editing states
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUserPassword, setEditingUserPassword] = useState('');
  const [editingUserRole, setEditingUserRole] = useState('');

  // Booking editing states
  const [editingBooking, setEditingBooking] = useState<BookingType | null>(null);
  const [editBookingAddress, setEditBookingAddress] = useState('');
  const [editBookingPhone, setEditBookingPhone] = useState('');
  const [editBookingDateTime, setEditBookingDateTime] = useState('');
  const [editBookingDescription, setEditBookingDescription] = useState('');
  const [editBookingStatus, setEditBookingStatus] = useState('');
  const [editBookingWorkerId, setEditBookingWorkerId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isWorkerAvailableNow = (worker: any) => {
    try {
      if (!worker.availabilitySlots || !Array.isArray(worker.availabilitySlots) || worker.availabilitySlots.length === 0) {
        return worker.availability;
      }

      const now = currentTime;
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[now.getDay()];
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      let daySlots;
      if (Array.isArray(worker.availabilitySlots[0])) {
        return worker.availability;
      } else if (typeof worker.availabilitySlots[0] === 'object') {
        daySlots = worker.availabilitySlots.find((ds: any) => ds && ds.day === dayName);
      } else {
        return worker.availability;
      }

      if (!daySlots || !daySlots.slots || !Array.isArray(daySlots.slots)) {
        return false;
      }

      for (const slot of daySlots.slots) {
        if (!slot || typeof slot !== 'string') continue;
        const [start, end] = slot.split('-');
        if (!start || !end) continue;
        
        if (end === '00:00') {
          if (currentTimeStr >= start || currentTimeStr < '00:00') {
            return true;
          }
        } else {
          if (currentTimeStr >= start && currentTimeStr < end) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking worker availability:', error);
      return worker.availability;
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [usersRes, bookingsRes, workersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/workers/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUsers(usersRes.data);
        setBookings(bookingsRes.data);
        setAllWorkers(workersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (user && token) {
      fetchData();
    }
  }, [user, token, loading, router]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 3000);
  };

  // User management functions
  const startEditUser = (userItem: UserType) => {
    setEditingUserId(userItem.id);
    setEditingUserRole(userItem.role);
    setEditingUserPassword('');
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditingUserPassword('');
    setEditingUserRole('');
  };

  const saveUserPassword = async (userId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/password`, 
        { newPassword: editingUserPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess('Password updated successfully!');
      cancelEditUser();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update password');
    }
  };

  const saveUserRole = async (userId: number) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/role`, 
        { role: editingUserRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.id === userId ? { ...u, role: res.data.user.role } : u));
      showSuccess('Role updated successfully!');
      
      // Refresh workers list if role changed
      const [workersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/workers/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAllWorkers(workersRes.data);
      
      cancelEditUser();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update role');
    }
  };

  // Booking management functions
  const startEditBooking = (booking: BookingType) => {
    setEditingBooking(booking);
    setEditBookingAddress(booking.address);
    setEditBookingPhone(booking.phone);
    setEditBookingDateTime(new Date(booking.preferredDateTime).toISOString().slice(0, 16));
    setEditBookingDescription(booking.description || '');
    setEditBookingStatus(booking.status);
    setEditBookingWorkerId(booking.workerId || null);
  };

  const cancelEditBooking = () => {
    setEditingBooking(null);
  };

  const saveEditBooking = async () => {
    if (!editingBooking) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/bookings/${editingBooking.id}`, {
        address: editBookingAddress,
        phone: editBookingPhone,
        preferredDateTime: editBookingDateTime,
        description: editBookingDescription,
        status: editBookingStatus,
        workerId: editBookingWorkerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings.map(b => b.id === editingBooking.id ? res.data.booking : b));
      showSuccess('Booking updated successfully!');
      cancelEditBooking();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const cancelBookingAsAdmin = async (bookingId: number) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      showSuccess('Booking cancelled successfully!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <div>Loading...</div>;

  const stats = [
    { label: 'Total Users', value: users.length, color: 'bg-blue-500' },
    { label: 'Active Workers', value: users.filter(u => u.role === 'worker').length, color: 'bg-green-500' },
    { label: 'Total Bookings', value: bookings.length, color: 'bg-purple-500' },
    { label: 'Completed Jobs', value: bookings.filter(b => b.status === 'completed').length, color: 'bg-teal-500' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Admin Dashboard</h1>
            
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-xl"
                >
                  <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-4`}>
                    📊
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Users Management
              </button>
              <button
                onClick={() => setActiveTab('workers')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'workers'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Workers Management
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bookings Management
              </button>
            </div>

            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">User</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">Role</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">Joined</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((userItem, index) => (
                        <motion.tr
                          key={userItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-8 py-6">
                            <div className="font-bold text-gray-900">{userItem.name}</div>
                            {userItem.phone && <div className="text-sm text-gray-500">{userItem.phone}</div>}
                          </td>
                          <td className="px-8 py-6 text-gray-700">{userItem.email}</td>
                          <td className="px-8 py-6">
                            {editingUserId === userItem.id ? (
                              <select
                                value={editingUserRole}
                                onChange={(e) => setEditingUserRole(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg"
                              >
                                <option value="admin">Admin</option>
                                <option value="customer">Customer</option>
                                <option value="worker">Worker</option>
                              </select>
                            ) : (
                              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                                userItem.role === 'worker' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-gray-600">
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6">
                            {editingUserId === userItem.id ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="password"
                                  placeholder="New password"
                                  value={editingUserPassword}
                                  onChange={(e) => setEditingUserPassword(e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveUserPassword(userItem.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                                  >
                                    Save Password
                                  </button>
                                  <button
                                    onClick={() => saveUserRole(userItem.id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                                  >
                                    Save Role
                                  </button>
                                  <button
                                    onClick={cancelEditUser}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditUser(userItem)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="grid gap-6">
                {editingBooking && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-xl mb-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Booking</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Address</label>
                        <textarea
                          value={editBookingAddress}
                          onChange={(e) => setEditBookingAddress(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Phone</label>
                        <input
                          type="tel"
                          value={editBookingPhone}
                          onChange={(e) => setEditBookingPhone(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Date & Time</label>
                        <input
                          type="datetime-local"
                          value={editBookingDateTime}
                          onChange={(e) => setEditBookingDateTime(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Status</label>
                        <select
                          value={editBookingStatus}
                          onChange={(e) => setEditBookingStatus(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                        >
                          <option value="requested">Requested</option>
                          <option value="slot_reserved">Slot Reserved</option>
                          <option value="awaiting_worker">Awaiting Worker</option>
                          <option value="awaiting_interest">Awaiting Interest</option>
                          <option value="awaiting_assignment">Awaiting Assignment</option>
                          <option value="worker_assigned">Worker Assigned</option>
                          <option value="worker_accepted">Worker Accepted</option>
                          <option value="on_the_way">On The Way</option>
                          <option value="arrived">Arrived</option>
                          <option value="in_progress">In Progress</option>
                          <option value="awaiting_completion">Awaiting Completion</option>
                          <option value="awaiting_otp">Awaiting OTP</option>
                          <option value="completed">Completed</option>
                          <option value="payment_released">Payment Released</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-3">Description</label>
                        <textarea
                          value={editBookingDescription}
                          onChange={(e) => setEditBookingDescription(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Assign Worker</label>
                        <select
                          value={editBookingWorkerId || ''}
                          onChange={(e) => setEditBookingWorkerId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg"
                        >
                          <option value="">Unassigned</option>
                          {allWorkers.map(worker => (
                            <option key={worker.id} value={worker.id}>
                              {worker.User?.name || `Worker ${worker.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
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
                        onClick={cancelEditBooking}
                        className="bg-gray-300 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-400 transition shadow-lg"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-5xl">{booking.Service.icon}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{booking.Service.name}</h3>
                          <p className="text-gray-600 text-lg">
                            {new Date(booking.preferredDateTime).toLocaleString()}
                          </p>
                          <p className="text-gray-600 text-lg">Customer: {booking.customer.name}</p>
                          <p className="text-gray-600 text-lg">Phone: {booking.customer.phone}</p>
                          {booking.worker && (
                            <p className="text-gray-600 text-lg">Worker: {booking.worker.User?.name || 'Unknown'}</p>
                          )}
                          {!booking.worker && (
                            <p className="text-yellow-600 text-lg font-semibold">No worker assigned yet</p>
                          )}
                          <p className="text-gray-600 text-lg">Address: {booking.address}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 items-end">
                        <span className={`px-6 py-3 rounded-2xl text-sm font-bold ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace(/_/g, ' ')}
                        </span>
                        <div className="flex gap-2">
                          <select
                            className="px-4 py-2 border-2 border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                            value={booking.workerId || ''}
                            onChange={async (e) => {
                              try {
                                const workerId = e.target.value ? Number(e.target.value) : null;
                                const res = await axios.put(
                                  `${API_BASE_URL}/api/admin/bookings/${booking.id}`,
                                  { workerId },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setBookings(prev => prev.map(b => 
                                  b.id === booking.id ? res.data.booking : b
                                ));
                                showSuccess('Worker updated successfully!');
                              } catch (error) {
                                console.error('Error reassigning worker:', error);
                              }
                            }}
                          >
                            <option value="">-- Select Worker --</option>
                            {allWorkers.map(worker => (
                              <option key={worker.id} value={worker.id}>
                                {worker.User?.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => startEditBooking(booking)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelBookingAsAdmin(booking.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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

            {activeTab === 'workers' && (
              <div className="grid gap-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Workers by Skill</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(() => {
                      const skillCounts: Record<string, number> = {};
                      allWorkers.forEach(worker => {
                        if (worker.skills && Array.isArray(worker.skills)) {
                          worker.skills.forEach((skill: string) => {
                            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                          });
                        }
                      });
                      return Object.entries(skillCounts).map(([skill, count]) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-2xl border border-teal-200"
                        >
                          <div className="text-3xl font-extrabold text-teal-700">{count}</div>
                          <div className="text-lg font-semibold text-gray-800 mt-2">{skill}</div>
                        </motion.div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="grid gap-8">
                  {allWorkers.map((worker, index) => (
                    <motion.div
                      key={worker.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition"
                    >
                      <div className="flex flex-wrap gap-6 items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {worker.User?.name || 'Unknown'}
                          </h3>
                          <p className="text-gray-600 mb-2">Email: {worker.User?.email}</p>
                          {worker.User?.phone && <p className="text-gray-600 mb-2">Phone: {worker.User.phone}</p>}
                          
                          {worker.experience && (
                            <p className="text-gray-700 font-semibold mb-2">
                              Experience: {worker.experience} years
                            </p>
                          )}

                          {worker.skills && worker.skills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-gray-700 font-semibold mb-2">Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {worker.skills.map((skill: string, i: number) => (
                                  <span
                                    key={i}
                                    className="bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-sm font-semibold"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          <span className={`px-6 py-2 rounded-2xl text-sm font-bold ${
                            isWorkerAvailableNow(worker) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isWorkerAvailableNow(worker) ? 'Available ✅' : 'Unavailable ❌'}
                          </span>
                          <span className={`px-6 py-2 rounded-2xl text-sm font-bold ${
                            worker.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {worker.isVerified ? 'Verified ✓' : 'Not Verified'}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-6 py-2 rounded-2xl text-sm font-bold">
                            Ratings: {worker.ratings} ⭐
                          </span>
                          <span className="bg-orange-100 text-orange-800 px-6 py-2 rounded-2xl text-sm font-bold">
                            Jobs: {worker.completedJobs}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {allWorkers.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
                      <p className="text-2xl text-gray-600">No workers yet</p>
                    </div>
                  )}
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
