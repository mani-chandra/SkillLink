
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sequelize = require('./config/database');
const { User, Worker, Service } = require('./models');
require('dotenv').config();

const signAsync = promisify(jwt.sign);

const app = express();

app.use(cors());
app.use(express.json());

async function seedServices() {
  const services = [
    { name: 'Plumbing', description: 'Fix leaks, unclog drains, install fixtures', icon: '🔧', startingPrice: 299, category: 'Home Repair' },
    { name: 'Electrical', description: 'Wiring, installations, repairs', icon: '⚡', startingPrice: 399, category: 'Home Repair' },
    { name: 'Cleaning', description: 'Home, office, deep cleaning', icon: '🧹', startingPrice: 199, category: 'Cleaning' },
    { name: 'Drivers', description: 'Personal drivers for hire', icon: '🚗', startingPrice: 499, category: 'Transport' },
    { name: 'Home Repair', description: 'General home repairs and maintenance', icon: '🏠', startingPrice: 349, category: 'Home Repair' },
    { name: 'AC Service', description: 'AC repair, maintenance, installation', icon: '❄️', startingPrice: 449, category: 'Home Repair' },
    { name: 'Painting', description: 'Interior and exterior painting', icon: '🎨', startingPrice: 799, category: 'Home Improvement' },
    { name: 'Cooking', description: 'Personal chefs and cooks', icon: '🍳', startingPrice: 599, category: 'Food' }
  ];

  for (const service of services) {
    await Service.findOrCreate({ where: { name: service.name }, defaults: service });
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Received register request:', req.body);
    const { name, email, password, phone, role = 'customer' } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Creating user...');
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });
    console.log('User created:', user.id);

    if (role === 'worker') {
      console.log('Creating worker...');
      await Worker.create({ userId: user.id });
      console.log('Worker created');
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    console.log('Generating token...');
    const token = await signAsync(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    console.log('Token generated');

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    console.log('Response sent');
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    console.error('STACK:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

async function startServer() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');
    await seedServices();
    console.log('Services seeded');
    
    const server = app.listen(5001, () => {
      console.log('Server running on port 5001');
      
      const axios = require('axios');
      setTimeout(async () => {
        try {
          console.log('Testing register...');
          const response = await axios.post('http://localhost:5001/api/auth/register', {
            name: 'Complete Test Worker',
            email: 'completetest@test.com',
            password: 'password123',
            phone: '1112223333',
            role: 'worker'
          });
          console.log('SUCCESS! Register response:', response.data);
          server.close();
          process.exit(0);
        } catch (err) {
          console.error('FAILED! Register error:', err.response ? err.response.data : err.message);
          server.close();
          process.exit(1);
        }
      }, 1000);
    });
  } catch (err) {
    console.error('Start server error:', err);
    process.exit(1);
  }
}

startServer();

