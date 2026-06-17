const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { User, Worker } = require('./models');

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@example.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'customer'
    });
    console.log('Created customer:', customer.email);

    const workerUser = await User.create({
      name: 'Jane Worker',
      email: 'worker@example.com',
      password: hashedPassword,
      phone: '0987654321',
      role: 'worker'
    });
    await Worker.create({
      userId: workerUser.id,
      experience: 5,
      skills: ['Plumbing', 'Electrical'],
      serviceAreas: ['Downtown', 'Westside'],
      isVerified: true
    });
    console.log('Created worker:', workerUser.email);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '1122334455',
      role: 'admin'
    });
    console.log('Created admin:', admin.email);

    console.log('\nSample users created successfully!');
    console.log('Use these credentials to log in:');
    console.log('Customer: customer@example.com / password123');
    console.log('Worker: worker@example.com / password123');
    console.log('Admin: admin@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
