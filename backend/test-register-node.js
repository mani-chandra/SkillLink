
const axios = require('axios');

async function test() {
  try {
    console.log('Testing register with axios...');
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'Node Test Worker',
      email: 'nodetest@test.com',
      password: 'password123',
      phone: '9998887777',
      role: 'worker'
    });
    console.log('SUCCESS!', response.data);
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  }
}

test();
