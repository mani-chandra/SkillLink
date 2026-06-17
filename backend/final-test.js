
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const os = require('os');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(os.tmpdir(), 'skilllink-db.sqlite'),
  logging: console.log
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  role: { type: DataTypes.STRING, defaultValue: 'customer' }
});

const Worker = sequelize.define('Worker', {
  experience: DataTypes.INTEGER,
  skills: { type: DataTypes.JSON, defaultValue: [] },
  serviceAreas: { type: DataTypes.JSON, defaultValue: [] },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  availability: { type: DataTypes.BOOLEAN, defaultValue: true },
  availabilitySlots: { type: DataTypes.JSON, defaultValue: [] },
  profileImage: DataTypes.STRING,
  idDocument: DataTypes.STRING,
  ratings: { type: DataTypes.FLOAT, defaultValue: 0 },
  completedJobs: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Service = sequelize.define('Service', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  icon: DataTypes.STRING,
  startingPrice: { type: DataTypes.FLOAT, allowNull: false },
  category: DataTypes.STRING
});

User.hasOne(Worker, { foreignKey: 'userId', as: 'Worker' });
Worker.belongsTo(User, { foreignKey: 'userId', as: 'User' });

const signAsync = promisify(jwt.sign);
const app = express();

app.use(cors());
app.use(express.json());

const seedServices = async () => {
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
};

app.post('/api/auth/register', async (req, res) => {
  console.log('Got register request');
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;
    console.log('Data:', { name, email, password: '***', phone, role });

    let user = await User.findOne({ where: { email } });
    if (user) {
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

    const payload = { user: { id: user.id, role: user.role } };
    const token = await signAsync(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = 5001;

async function startServer() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');
    await seedServices();
    console.log('Services seeded');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Test register now!
      const http = require('http');
      const postData = JSON.stringify({
        name: 'Final Test Worker',
        email: 'finaltest@test.com',
        password: 'password123',
        phone: '1112223330',
        role: 'worker'
      });
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('\n=== TEST RESULT ===');
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
          console.log('==================\n');
        });
      });
      req.on('error', e => console.error('Request error:', e.message));
      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.error('Start server error:', err);
  }
}

startServer();
