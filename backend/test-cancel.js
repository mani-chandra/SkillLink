const axios = require('axios');

const API_URL = 'http://localhost:5001';

async function testCancelBooking() {
  try {
    console.log('1. Logging in as customer...');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'customer@skilllink.com',
      password: 'customer123'
    });
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Logged in');

    console.log('\n2. Creating a test booking...');
    const bookingRes = await axios.post(`${API_URL}/api/bookings`, {
      serviceId: 1,
      address: '123 Test Street',
      phone: '9876543210',
      preferredDateTime: new Date(Date.now() + 86400000).toISOString(),
      description: 'Test booking'
    }, { headers: authHeaders });
    const bookingId = bookingRes.data.id;
    console.log('✅ Booking created, ID:', bookingId);

    console.log('\n3. Cancelling the booking...');
    await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`, {}, { headers: authHeaders });
    console.log('✅ Booking cancelled successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCancelBooking();
