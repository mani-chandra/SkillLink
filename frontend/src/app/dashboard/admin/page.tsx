'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import axios from 'axios';

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
  Service: { name: string; icon: string };
  customer: { name: string; phone: string };
  worker?: { User: { name: string } };
}

export default function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'workers'>('users');
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

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
          axios.get('http://localhost:5001/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5001/api/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5001/api/workers/admin/all', {
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
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                              userItem.role === 'worker' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-gray-600">
                            {new Date(userItem.createdAt).toLocaleDateString()}
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
                          <p className="text-gray-600 text-lg">Worker: {booking.worker.User.name}</p>
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
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <div className="flex flex-col gap-2">
                        <select
                          className="px-4 py-2 border-2 border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                          value={booking.workerId || ''}
                          onChange={async (e) => {
                            try {
                              const workerId = e.target.value ? Number(e.target.value) : null;
                              await axios.put(
                                `http://localhost:5001/api/bookings/${booking.id}/assign`,
                                { workerId },
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              setBookings(prev => prev.map(b => 
                                b.id === booking.id ? { ...b, workerId } : b
                              ));
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
