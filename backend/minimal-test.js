
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sequelize = require('./config/database');
const { User, Worker, Service } = require('./models');
require('dotenv').config();

const signAsync = promisify(jwt.sign);
const app = express();

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

app.post('/register', async (req, res) => {
  console.log('Got register request! Body:', req.body);
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;
    console.log('Data:', { name, email, password: '***', phone, role });

    let user = await User.findOne({ where: { email } });
    if (user) {
      console.log('User exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    console.log('User created');

    if (role === 'worker') {
      await Worker.create({ userId: user.id });
      console.log('Worker created');
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = await signAsync(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('Token created');

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('ERROR:', error);
    console.error('STACK:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

async function start() {
  try {
    await sequelize.sync({ force: true });
    console.log('DB synced');
    await seedServices();
    console.log('Services seeded');
    app.listen(5002, () => console.log('Test server on 5002'));
  } catch (err) {
    console.error(err);
  }
}

start();
