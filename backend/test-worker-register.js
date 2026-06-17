
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Worker } = require('./models');
require('dotenv').config();

async function testWorkerRegister() {
  try {
    console.log('Starting worker test...');
    
    const name = 'Test Worker';
    const email = 'worker@test.com';
    const password = 'password123';
    const role = 'worker';

    console.log('Checking existing user...');
    let user = await User.findOne({ where: { email } });
    if (user) {
      console.log('User already exists, deleting...');
      await user.destroy();
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating user...');
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: '1234567890',
      role
    });

    console.log('User created:', user.toJSON());

    console.log('Creating worker record...');
    const worker = await Worker.create({ 
      userId: user.id,
      experience: 2,
      skills: ['Plumbing', 'Electrical'],
      serviceAreas: ['Downtown', 'Suburbs']
    });

    console.log('Worker created:', worker.toJSON());

    console.log('Generating token...');
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        console.log('Token:', token);
      }
    );

    console.log('Worker test completed successfully!');
  } catch (error) {
    console.error('WORKER TEST ERROR:', error);
    console.error('STACK:', error.stack);
  }
  process.exit();
}

testWorkerRegister();
