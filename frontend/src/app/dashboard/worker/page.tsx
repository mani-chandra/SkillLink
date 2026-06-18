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
  Service: { name: string; icon: string };
  customer: { name: string; phone: string };
}

interface WorkerProfile {
  id: number;
  experience: number | null;
  skills: string[];
  serviceAreas: string[];
  isVerified: boolean;
}

const PREDEFINED_SKILLS = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Driving',
  'Home Repair',
  'AC Service',
  'Painting',
  'Cooking',
  'Carpentry',
  'Gardening',
  'Pest Control',
  'Moving Help'
];

const PREDEFINED_AREAS = [
  'Jagtial',
  'Karimnagar',
  'Korutla',
  'Metpally'
];

const PREDEFINED_TIME_SLOTS = [
  { id: '00:00-01:00', label: '12:00 AM - 1:00 AM' },
  { id: '01:00-02:00', label: '1:00 AM - 2:00 AM' },
  { id: '02:00-03:00', label: '2:00 AM - 3:00 AM' },
  { id: '03:00-04:00', label: '3:00 AM - 4:00 AM' },
  { id: '04:00-05:00', label: '4:00 AM - 5:00 AM' },
  { id: '05:00-06:00', label: '5:00 AM - 6:00 AM' },
  { id: '06:00-07:00', label: '6:00 AM - 7:00 AM' },
  { id: '07:00-08:00', label: '7:00 AM - 8:00 AM' },
  { id: '08:00-09:00', label: '8:00 AM - 9:00 AM' },
  { id: '09:00-10:00', label: '9:00 AM - 10:00 AM' },
  { id: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
  { id: '11:00-12:00', label: '11:00 AM - 12:00 PM' },
  { id: '12:00-13:00', label: '12:00 PM - 1:00 PM' },
  { id: '13:00-14:00', label: '1:00 PM - 2:00 PM' },
  { id: '14:00-15:00', label: '2:00 PM - 3:00 PM' },
  { id: '15:00-16:00', label: '3:00 PM - 4:00 PM' },
  { id: '16:00-17:00', label: '4:00 PM - 5:00 PM' },
  { id: '17:00-18:00', label: '5:00 PM - 6:00 PM' },
  { id: '18:00-19:00', label: '6:00 PM - 7:00 PM' },
  { id: '19:00-20:00', label: '7:00 PM - 8:00 PM' },
  { id: '20:00-21:00', label: '8:00 PM - 9:00 PM' },
  { id: '21:00-22:00', label: '9:00 PM - 10:00 PM' },
  { id: '22:00-23:00', label: '10:00 PM - 11:00 PM' },
  { id: '23:00-00:00', label: '11:00 PM - 12:00 AM' }
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkerDashboard() {
  const { user, token, loading, setUser } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile' | 'skills' | 'slots' | 'password' | 'documents'>('jobs');
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<{ day: string; slots: string[] }[]>([]);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [documentMessage, setDocumentMessage] = useState('');
  const [skillsMessage, setSkillsMessage] = useState('');
  const [slotsMessage, setSlotsMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'worker') {
      router.push('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [bookingsRes, workerRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/bookings/worker`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/workers/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setBookings(bookingsRes.data);
        setWorkerProfile(workerRes.data);
        setSkills(workerRes.data.skills || []);
        setExperience(workerRes.data.experience?.toString() || '');
        setServiceAreas(workerRes.data.serviceAreas || []);
        setProfileImageUrl(workerRes.data.profileImage || '');
        setIdDocumentUrl(workerRes.data.idDocument || '');
        
        const savedSlots = workerRes.data.availabilitySlots || [];
        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
          if (typeof savedSlots[0] === 'object' && 'day' in savedSlots[0] && 'slots' in savedSlots[0]) {
            setAvailabilitySlots(savedSlots);
          } else {
            setAvailabilitySlots(days.map(day => ({ day, slots: [] })));
          }
        } else {
          setAvailabilitySlots(days.map(day => ({ day, slots: [] })));
        }
        
        if (user) {
          setUserName(user.name || '');
          setUserPhone(user.phone || '');
          setUserAddress(user.address || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAvailabilitySlots(days.map(day => ({ day, slots: [] })));
      }
    };
    
    if (user && token) {
      fetchData();
    }
  }, [user, token, loading, router]);

  const updateStatus = async (bookingId: number, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const toggleSlot = (day: string, slotId: string) => {
    const updatedSlots = availabilitySlots.map(daySlots => {
      if (daySlots.day === day) {
        const isSelected = daySlots.slots.includes(slotId);
        return {
          ...daySlots,
          slots: isSelected 
            ? daySlots.slots.filter(s => s !== slotId)
            : [...daySlots.slots, slotId]
        };
      }
      return daySlots;
    });
    setAvailabilitySlots(updatedSlots);
  };

  const saveSkillsAndAreas = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/workers/profile`, { 
        skills, 
        serviceAreas, 
        experience: experience ? parseInt(experience) : null,
        availabilitySlots
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkillsMessage('Skills and areas updated successfully!');
      setTimeout(() => setSkillsMessage(''), 3000);
    } catch (error) {
      console.error('Error saving skills and areas:', error);
      setSkillsMessage('Failed to update skills and areas');
      setTimeout(() => setSkillsMessage(''), 3000);
    }
  };

  const saveSlots = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/workers/slots`, { availabilitySlots: availabilitySlots }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlotsMessage('Availability slots updated successfully!');
      setTimeout(() => setSlotsMessage(''), 3000);
    } catch (error) {
      console.error('Error saving slots:', error);
      setSlotsMessage('Failed to update availability slots');
      setTimeout(() => setSlotsMessage(''), 3000);
    }
  };

  const saveProfile = () => {
    axios.put(`${API_BASE_URL}/api/workers/profile`, { 
      skills, 
      serviceAreas, 
      experience: experience ? parseInt(experience) : null,
      availabilitySlots
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const saveUserProfile = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, {
        name: userName,
        phone: userPhone,
        address: userAddress
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (setUser) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage('Failed to update profile');
      setTimeout(() => setProfileMessage(''), 3000);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error: any) {
      setPasswordMessage(error.response?.data?.message || 'Failed to change password');
      setTimeout(() => setPasswordMessage(''), 3000);
    }
  };

  const saveDocuments = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/workers/documents`, {
        profileImage: profileImageUrl,
        idDocument: idDocumentUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentMessage('Documents saved successfully!');
      setTimeout(() => setDocumentMessage(''), 3000);
    } catch (error) {
      console.error('Error saving documents:', error);
      setDocumentMessage('Failed to save documents');
      setTimeout(() => setDocumentMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-teal-50 via-white to-teal-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900">Worker Dashboard</h1>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'jobs'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Worker Profile
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'skills'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Skills & Areas
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'slots'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Availability Slots
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
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'documents'
                    ? 'bg-teal-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Documents
              </button>
            </div>

            {activeTab === 'jobs' && (
              <div className="bg-white rounded-3xl shadow-xl p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6">📋</div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">No bookings yet</h3>
                    <p className="text-gray-500 text-lg">You'll see your bookings here once customers book you</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-4xl">
                              {booking.Service.icon}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">{booking.Service.name}</h3>
                              <p className="text-gray-600 mt-1">
                                {booking.customer.name} • {booking.customer.phone}
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                {new Date(booking.preferredDateTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-6 py-2 rounded-2xl font-bold text-sm ${
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(booking.id, 'confirmed')}
                                  className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateStatus(booking.id, 'cancelled')}
                                  className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-700 transition"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateStatus(booking.id, 'completed')}
                                className="bg-teal-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-teal-700 transition"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-xl p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Personal Information</h2>
                  {profileMessage && (
                    <div className={`mb-6 p-4 rounded-2xl ${profileMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {profileMessage}
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Full Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Phone Number</label>
                      <input
                        type="text"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Address</label>
                      <textarea
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                        placeholder="Your address"
                        rows={3}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveUserProfile}
                      className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                    >
                      Save Personal Info
                    </motion.button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Worker Details</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Experience (years)</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                        placeholder="Enter years of experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Verification Status</label>
                      <div className={`px-6 py-4 rounded-2xl font-semibold ${workerProfile?.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {workerProfile?.isVerified ? 'Verified ✓' : 'Not Verified'}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveProfile}
                      className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                    >
                      Save Worker Details
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Change Password</h2>
                {passwordMessage && (
                  <div className={`mb-6 p-4 rounded-2xl ${passwordMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {passwordMessage}
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                      placeholder="Confirm new password"
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

            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-xl p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Skills</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {PREDEFINED_SKILLS.map((skill, index) => (
                      <label key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={skills.includes(skill)}
                          onChange={(e) => {
                            let updatedSkills;
                            if (e.target.checked) {
                              updatedSkills = [...skills, skill];
                            } else {
                              updatedSkills = skills.filter(s => s !== skill);
                            }
                            setSkills(updatedSkills);
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-semibold text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-teal-100 text-teal-800 px-6 py-3 rounded-2xl font-semibold flex items-center gap-3"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            const updatedSkills = skills.filter(s => s !== skill);
                            setSkills(updatedSkills);
                          }}
                          className="text-teal-600 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Areas</h2>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-3">Select Area</label>
                    <select
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900"
                      onChange={(e) => {
                        const area = e.target.value;
                        if (area && !serviceAreas.includes(area)) {
                          const updatedAreas = [...serviceAreas, area];
                          setServiceAreas(updatedAreas);
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="">Select an area...</option>
                      {PREDEFINED_AREAS.map((area, index) => (
                        <option key={index} value={area} disabled={serviceAreas.includes(area)} className="text-gray-900">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {serviceAreas.map((area, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-purple-100 text-purple-800 px-6 py-3 rounded-2xl font-semibold flex items-center gap-3"
                      >
                        {area}
                        <button
                          onClick={() => {
                            const updatedAreas = serviceAreas.filter(a => a !== area);
                            setServiceAreas(updatedAreas);
                          }}
                          className="text-purple-600 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  {skillsMessage && (
                    <div className={`mb-6 p-4 rounded-2xl ${skillsMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {skillsMessage}
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveSkillsAndAreas}
                    className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                  >
                    Save Skills & Areas
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'slots' && (
              <div className="bg-white rounded-3xl shadow-xl p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Availability Slots</h2>
                {slotsMessage && (
                  <div className={`mb-6 p-4 rounded-2xl ${slotsMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {slotsMessage}
                  </div>
                )}
                <div className="space-y-6 mb-8">
                  {days.map((day) => {
                    const daySlots = availabilitySlots.find(ds => ds.day === day) || { day, slots: [] };
                    return (
                      <div key={day} className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{day}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {PREDEFINED_TIME_SLOTS.map((slot) => (
                            <label key={slot.id} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                              <input
                                type="checkbox"
                                checked={daySlots.slots.includes(slot.id)}
                                onChange={() => toggleSlot(day, slot.id)}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{slot.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveSlots}
                  className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                >
                  Save Availability Slots
                </motion.button>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-xl p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Profile Image</h2>
                  {documentMessage && (
                    <div className={`mb-6 p-4 rounded-2xl ${documentMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {documentMessage}
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Profile Image URL</label>
                      <input
                        type="text"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                        placeholder="https://example.com/profile.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">ID Document</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">ID Document URL</label>
                      <input
                        type="text"
                        value={idDocumentUrl}
                        onChange={(e) => setIdDocumentUrl(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all text-lg text-gray-900 placeholder:text-gray-500"
                        placeholder="https://example.com/id-document.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveDocuments}
                    className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg"
                  >
                    Save Documents
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
