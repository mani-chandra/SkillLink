
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { Sequelize, DataTypes, Op } = require('sequelize');
require('dotenv').config();

const signAsync = promisify(jwt.sign);

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/skilllink',
  {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.DATABASE_URL ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  role: { type: DataTypes.STRING, defaultValue: 'customer' },
  loyaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 }
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
  completedJobs: { type: DataTypes.INTEGER, defaultValue: 0 },
  trustScore: { type: DataTypes.FLOAT, defaultValue: 100 },
  commissionTier: { type: DataTypes.INTEGER, defaultValue: 1 },
  maxDailyJobs: { type: DataTypes.INTEGER, defaultValue: 8 },
  maxConcurrentBookings: { type: DataTypes.INTEGER, defaultValue: 1 },
  currentDailyJobs: { type: DataTypes.INTEGER, defaultValue: 0 },
  cancellationRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  avgResponseTime: { type: DataTypes.FLOAT, defaultValue: 0 },
  lastOnlineAt: DataTypes.DATE,
});

const Service = sequelize.define('Service', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  icon: DataTypes.STRING,
  startingPrice: { type: DataTypes.FLOAT, allowNull: false },
  category: DataTypes.STRING,
  isFixedPrice: { type: DataTypes.BOOLEAN, defaultValue: true },
  taxRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  platformFee: { type: DataTypes.FLOAT, defaultValue: 0 }
});

const Booking = sequelize.define('Booking', {
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'requested',
    validate: {
      isIn: [['requested', 'slot_reserved', 'awaiting_worker', 'awaiting_interest', 'awaiting_assignment', 'worker_assigned', 'worker_accepted', 'on_the_way', 'arrived', 'in_progress', 'awaiting_completion', 'awaiting_otp', 'completed', 'payment_released', 'cancelled']]
    }
  },
  bookingType: { type: DataTypes.STRING, defaultValue: 'instant' },
  bookingWindowType: { 
    type: DataTypes.STRING, 
    defaultValue: 'instant',
    validate: {
      isIn: [['instant', 'near_future', 'long_future']]
    }
  },
  address: { type: DataTypes.TEXT, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  preferredDateTime: { type: DataTypes.DATE, allowNull: false },
  description: DataTypes.TEXT,
  totalAmount: DataTypes.FLOAT,
  taxAmount: DataTypes.FLOAT,
  platformFee: DataTypes.FLOAT,
  commissionAmount: DataTypes.FLOAT,
  workerPayout: DataTypes.FLOAT,
  warrantyDays: { type: DataTypes.INTEGER, defaultValue: 7 },
  isWarrantyValid: { type: DataTypes.BOOLEAN, defaultValue: true },
  confidenceLevel: { type: DataTypes.STRING, defaultValue: 'high' },
  estimatedDuration: { type: DataTypes.INTEGER, defaultValue: 60 },
  travelBuffer: { type: DataTypes.INTEGER, defaultValue: 30 },
  preparationBuffer: { type: DataTypes.INTEGER, defaultValue: 15 },
  capacityReserved: { type: DataTypes.BOOLEAN, defaultValue: false },
  assignmentAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastAssignmentAt: DataTypes.DATE,
  completionOTP: DataTypes.STRING,
  cancellationReason: DataTypes.TEXT,
  cancellationRequestedBy: DataTypes.STRING,
  schedulingPriority: { type: DataTypes.INTEGER, defaultValue: 0 },
  emergencyFlag: { type: DataTypes.BOOLEAN, defaultValue: false },
  finalAssignmentTime: DataTypes.DATE,
});

const Payment = sequelize.define('Payment', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  transactionId: DataTypes.STRING,
  gateway: { type: DataTypes.STRING, defaultValue: 'razorpay' }
});

const Review = sequelize.define('Review', {
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: DataTypes.TEXT
});

const Notification = sequelize.define('Notification', {
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  type: DataTypes.STRING
});

const Commission = sequelize.define('Commission', {
  percentage: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 15 },
  category: DataTypes.STRING,
  workerTier: DataTypes.INTEGER,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Warranty = sequelize.define('Warranty', {
  durationDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 7 },
  description: DataTypes.TEXT,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Payout = sequelize.define('Payout', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  transactionId: DataTypes.STRING,
  notes: DataTypes.TEXT
});

const WorkerInterestResponse = sequelize.define('WorkerInterestResponse', {
  response: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      isIn: [['interested', 'not_available', 'ignored']]
    }
  },
  respondedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Invoice = sequelize.define('Invoice', {
  invoiceNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  taxAmount: DataTypes.FLOAT,
  platformFee: DataTypes.FLOAT,
  commissionAmount: DataTypes.FLOAT,
  workerPayout: DataTypes.FLOAT,
  isPaid: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Quotation = sequelize.define('Quotation', {
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  laborCharges: { type: DataTypes.FLOAT, defaultValue: 0 },
  partsCost: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  notes: DataTypes.TEXT,
  itemizedPricing: { type: DataTypes.JSON, defaultValue: [] }
});

User.hasOne(Worker, { foreignKey: 'userId', as: 'Worker' });
Worker.belongsTo(User, { foreignKey: 'userId', as: 'User' });

User.hasMany(Booking, { foreignKey: 'customerId', as: 'customerBookings' });
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

Worker.hasMany(Booking, { foreignKey: 'workerId', as: 'workerBookings' });
Booking.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

Booking.hasOne(Review, { foreignKey: 'bookingId' });
Review.belongsTo(Booking, { foreignKey: 'bookingId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Booking.hasOne(Quotation, { foreignKey: 'bookingId' });
Quotation.belongsTo(Booking, { foreignKey: 'bookingId' });

Booking.hasOne(Invoice, { foreignKey: 'bookingId' });
Invoice.belongsTo(Booking, { foreignKey: 'bookingId' });

Worker.hasMany(Payout, { foreignKey: 'workerId' });
Payout.belongsTo(Worker, { foreignKey: 'workerId' });

Worker.hasMany(WorkerInterestResponse, { foreignKey: 'workerId' });
WorkerInterestResponse.belongsTo(Worker, { foreignKey: 'workerId' });
Booking.hasMany(WorkerInterestResponse, { foreignKey: 'bookingId' });
WorkerInterestResponse.belongsTo(Booking, { foreignKey: 'bookingId' });

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.header('x-auth-token');
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return phone;
  return `XXX-XXX-${cleaned.slice(-4)}`;
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({ name, email, password: hashedPassword, phone, role });
    if (role === 'worker') {
      await Worker.create({ userId: user.id });
    }
    const payload = { user: { id: user.id, role: user.role } };
    const token = await signAsync(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone, loyaltyPoints: 0 } });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id, role: user.role } };
    const token = await signAsync(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, loyaltyPoints: user.loyaltyPoints } });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.update({
      name: name || user.name,
      phone: phone !== undefined ? phone : user.phone,
      address: address !== undefined ? address : user.address
    });
    const updatedUser = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.update({
      name: name || user.name,
      phone: phone !== undefined ? phone : user.phone,
      address: address !== undefined ? address : user.address
    });
    const updatedUser = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const findMatchingWorker = async (serviceId, address, preferredDateTime) => {
  try {
    const service = await Service.findByPk(serviceId);
    if (!service) return null;

    const allWorkers = await Worker.findAll({
      where: { isVerified: true, availability: true },
      include: [{ model: User, as: 'User' }]
    });

    let bestMatch = null;
    let maxMatchingSkills = 0;

    for (const worker of allWorkers) {
      const hasSkill = worker.skills?.includes(service.name) || false;
      const servesArea = worker.serviceAreas?.some(area => address.includes(area)) || false;
      const hasAvailableSlot = checkWorkerAvailability(worker, preferredDateTime);

      if (hasSkill && servesArea && hasAvailableSlot) {
        const matchingSkills = worker.skills?.filter(skill => service.name.includes(skill)).length || 0;
        if (matchingSkills > maxMatchingSkills) {
          maxMatchingSkills = matchingSkills;
          bestMatch = worker;
        } else if (matchingSkills === maxMatchingSkills && !bestMatch) {
          bestMatch = worker;
        }
      }
    }

    if (!bestMatch) {
      for (const worker of allWorkers) {
        const hasSkill = worker.skills?.includes(service.name) || false;
        const hasAvailableSlot = checkWorkerAvailability(worker, preferredDateTime);
        if (hasSkill && hasAvailableSlot) {
          bestMatch = worker;
          break;
        }
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error finding matching worker:', error);
    return null;
  }
};

const checkWorkerAvailability = (worker, preferredDateTime) => {
  if (!worker.availabilitySlots || !Array.isArray(worker.availabilitySlots) || worker.availabilitySlots.length === 0) {
    return worker.availability;
  }

  try {
    const date = new Date(preferredDateTime);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    let daySlots;
    if (Array.isArray(worker.availabilitySlots[0])) {
      return worker.availability;
    } else if (typeof worker.availabilitySlots[0] === 'object') {
      daySlots = worker.availabilitySlots.find(ds => ds && ds.day === dayName);
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
        if (currentTime >= start || currentTime < '00:00') {
          return true;
        }
      } else {
        if (currentTime >= start && currentTime < end) {
          return true;
        }
      }
    }
  } catch (error) {
    console.error('Error checking worker availability:', error);
    return worker.availability;
  }

  return false;
};

const calculateSlotCapacity = async (serviceId, preferredDateTime, address) => {
  try {
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return { available: false, total: 0, reserved: 0, remaining: 0 };
    }

    const workers = await Worker.findAll({
      where: { isVerified: true, availability: true },
      include: [{ model: User, as: 'User' }]
    });

    let totalAvailable = 0;
    for (const worker of workers) {
      if (worker.skills && Array.isArray(worker.skills) && worker.skills.includes(service.name)) {
        if (checkWorkerAvailability(worker, preferredDateTime)) {
          totalAvailable++;
        }
      }
    }

    const startTime = new Date(preferredDateTime);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const reservedBookings = await Booking.count({
      where: {
        serviceId: serviceId,
        status: { [Op.notIn]: ['cancelled', 'completed', 'payment_released'] },
        preferredDateTime: { [Op.between]: [startTime, endTime] }
      }
    });

    return {
      available: totalAvailable > reservedBookings,
      total: totalAvailable,
      reserved: reservedBookings,
      remaining: Math.max(0, totalAvailable - reservedBookings)
    };
  } catch (error) {
    console.error('Error calculating slot capacity:', error);
    return { available: false, total: 0, reserved: 0, remaining: 0 };
  }
};

const classifyBookingWindow = (preferredDateTime) => {
  const now = new Date();
  const bookingDate = new Date(preferredDateTime);
  const timeDiffMs = bookingDate - now;
  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
  
  if (timeDiffHours < 1) {
    return 'instant';
  } else if (timeDiffHours <= 24) {
    return 'near_future';
  } else {
    return 'long_future';
  }
};

app.post('/api/bookings/check-capacity', authMiddleware, async (req, res) => {
  try {
    const { serviceId, preferredDateTime, address } = req.body;
    const capacity = await calculateSlotCapacity(serviceId, preferredDateTime, address);
    res.json(capacity);
  } catch (error) {
    console.error('Error checking capacity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const { serviceId, address, phone, preferredDateTime, description, bookingType = 'instant' } = req.body;
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const capacity = await calculateSlotCapacity(serviceId, preferredDateTime, address);
    if (!capacity.available) {
      return res.status(400).json({ 
        message: 'No available capacity for this time slot',
        capacity 
      });
    }
    
    const bookingWindowType = classifyBookingWindow(preferredDateTime);
    
    const commission = await Commission.findOne({ where: { isActive: true, category: service.category } }) || await Commission.findOne({ where: { isActive: true } });
    const commissionPercent = commission ? commission.percentage : 15;
    const taxAmount = (service.startingPrice * (service.taxRate / 100)) || 0;
    const platformFee = service.platformFee || 0;
    const totalAmount = service.startingPrice + taxAmount + platformFee;
    const commissionAmount = (totalAmount * commissionPercent) / 100;
    const workerPayout = totalAmount - commissionAmount;

    let workerId = null;
    let status = 'requested';
    let confidenceLevel = 'high';

    if (bookingWindowType === 'instant') {
      const matchedWorker = await findMatchingWorker(serviceId, address, preferredDateTime);
      workerId = matchedWorker ? matchedWorker.id : null;
      status = workerId ? 'worker_assigned' : 'awaiting_worker';
      confidenceLevel = workerId ? 'high' : 'medium';
      
      if (matchedWorker) {
        await Notification.create({
          userId: matchedWorker.userId,
          message: `You've been assigned an instant ${service.name} booking!`,
          type: 'booking_assigned'
        });
      }
    } else if (bookingWindowType === 'near_future') {
      status = 'awaiting_interest';
      confidenceLevel = capacity.total >= 3 ? 'high' : (capacity.total >= 1 ? 'medium' : 'low');
      
      const eligibleWorkers = await Worker.findAll({
        where: { isVerified: true, availability: true },
        include: [{ model: User, as: 'User' }]
      });
      
      for (const worker of eligibleWorkers) {
        if (worker.skills && Array.isArray(worker.skills) && worker.skills.includes(service.name)) {
          if (checkWorkerAvailability(worker, preferredDateTime)) {
            await Notification.create({
              userId: worker.userId,
              message: `${service.name} job available! Estimated payout ₹${workerPayout.toFixed(0)}. Tap to show interest.`,
              type: 'booking_interest_request'
            });
          }
        }
      }
    } else {
      status = 'slot_reserved';
      confidenceLevel = capacity.total >= 3 ? 'high' : (capacity.total >= 1 ? 'medium' : 'low');
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      workerId,
      address,
      phone,
      preferredDateTime,
      description,
      totalAmount,
      taxAmount,
      platformFee,
      commissionAmount,
      workerPayout,
      warrantyDays: 7,
      isWarrantyValid: true,
      bookingType: bookingWindowType === 'instant' ? 'instant' : 'scheduled',
      status,
      confidenceLevel,
      capacityReserved: true,
      estimatedDuration: 60,
      travelBuffer: 30,
      preparationBuffer: 15,
      bookingWindowType,
    });
    
    await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      bookingId: booking.id,
      totalAmount,
      taxAmount,
      platformFee,
      commissionAmount,
      workerPayout
    });
    
    await Notification.create({
      userId: req.user.id,
      message: `Your ${service.name} booking has been ${workerId ? 'confirmed with a worker!' : 'placed and we are finding a worker for you!'}`,
      type: 'booking_created'
    });
    
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id/assign', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { workerId } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (workerId) {
      const worker = await Worker.findByPk(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
    }
    await booking.update({ workerId });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/customer', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { customerId: req.user.id },
      include: [
        { model: Service },
        { model: Worker, as: 'worker', include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }] }
      ]
    });
    const bookingsWithMaskedPhone = bookings.map(booking => {
      const bookingData = booking.toJSON();
      if (bookingData.worker && bookingData.worker.User) {
        bookingData.worker.User.phone = maskPhoneNumber(bookingData.worker.User.phone);
      }
      return bookingData;
    });
    res.json(bookingsWithMaskedPhone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/worker', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    const bookings = await Booking.findAll({
      where: { workerId: worker.id },
      include: [
        { model: Service },
        { model: User, as: 'customer', attributes: { exclude: ['password'] } }
      ]
    });
    const bookingsWithMaskedPhone = bookings.map(booking => {
      const bookingData = booking.toJSON();
      if (bookingData.customer) {
        bookingData.customer.phone = maskPhoneNumber(bookingData.customer.phone);
      }
      return bookingData;
    });
    res.json(bookingsWithMaskedPhone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Service },
        { model: User, as: 'customer', attributes: { exclude: ['password'] } },
        { model: Worker, as: 'worker', include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }] },
        { model: Invoice },
        { model: Quotation }
      ]
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    booking.status = status;
    if (status === 'completed') {
      const worker = await Worker.findOne({ where: { id: booking.workerId } });
      if (worker) {
        await worker.update({ completedJobs: worker.completedJobs + 1 });
      }
      const customer = await User.findByPk(booking.customerId);
      if (customer) {
        await customer.update({ loyaltyPoints: customer.loyaltyPoints + 100 });
      }
    }
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await booking.update({ status: 'cancelled' });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { address, phone, preferredDateTime, description } = req.body;
    await booking.update({
      address: address || booking.address,
      phone: phone || booking.phone,
      preferredDateTime: preferredDateTime || booking.preferredDateTime,
      description: description !== undefined ? description : booking.description
    });
    const updatedBooking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Service },
        { model: Worker, as: 'worker', include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }] }
      ]
    });
    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/bookings/:id/interest', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can respond to interest requests' });
    }
    
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    const booking = await Booking.findByPk(req.params.id, {
      include: [Service]
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'awaiting_interest') {
      return res.status(400).json({ message: 'Booking is not accepting interest responses' });
    }
    
    const existingResponse = await WorkerInterestResponse.findOne({
      where: { workerId: worker.id, bookingId: booking.id }
    });
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already responded' });
    }
    
    const { response } = req.body;
    if (!['interested', 'not_available', 'ignored'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response' });
    }
    
    await WorkerInterestResponse.create({
      workerId: worker.id,
      bookingId: booking.id,
      response
    });
    
    if (response === 'interested') {
      const matchedWorker = await findMatchingWorker(
        booking.serviceId, 
        booking.address, 
        booking.preferredDateTime
      );
      
      if (matchedWorker && matchedWorker.id === worker.id) {
        await booking.update({
          workerId: worker.id,
          status: 'worker_assigned',
          finalAssignmentTime: new Date()
        });
        
        await Notification.create({
          userId: booking.customerId,
          message: `A worker has been assigned to your ${booking.Service?.name} booking!`,
          type: 'worker_assigned'
        });
        
        await Notification.create({
          userId: req.user.id,
          message: `You've been assigned the ${booking.Service?.name} booking!`,
          type: 'booking_assigned'
        });
      }
    }
    
    const interestedResponses = await WorkerInterestResponse.count({
      where: { bookingId: booking.id, response: 'interested' }
    });
    
    let newConfidenceLevel = 'low';
    if (interestedResponses >= 3) {
      newConfidenceLevel = 'high';
    } else if (interestedResponses >= 1) {
      newConfidenceLevel = 'medium';
    }
    
    await booking.update({ confidenceLevel: newConfidenceLevel });
    
    res.json({ success: true, response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.findAll({
      where: { isVerified: true, availability: true },
      include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }]
    });
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workers/admin/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const workers = await Worker.findAll({
      include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }]
    });
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workers/me', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ 
      where: { userId: req.user.id },
      include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }]
    });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workers/:id', async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }]
    });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workers/profile', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    const { experience, skills, serviceAreas, profileImage, idDocument, availability, availabilitySlots } = req.body;
    await worker.update({ experience, skills, serviceAreas, profileImage, idDocument, availability, availabilitySlots });
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workers/skills', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    const { skills } = req.body;
    await worker.update({ skills });
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workers/availability', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    const { availability } = req.body;
    await worker.update({ availability });
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workers/slots', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    const { availabilitySlots } = req.body;
    await worker.update({ availabilitySlots });
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workers/documents', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    const { profileImage, idDocument } = req.body;
    await worker.update({ 
      profileImage: profileImage || worker.profileImage,
      idDocument: idDocument || worker.idDocument
    });
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workers/:id/verify', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    await worker.update({ isVerified: true });
    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/analytics', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const totalBookings = await Booking.count();
    const completedBookings = await Booking.count({ where: { status: 'completed' } });
    const totalUsers = await User.count();
    const totalWorkers = await Worker.count();
    const verifiedWorkers = await Worker.count({ where: { isVerified: true } });
    const totalRevenue = await Booking.sum('totalAmount', { where: { status: 'completed' } });
    const totalCommission = await Booking.sum('commissionAmount', { where: { status: 'completed' } });
    res.json({
      totalBookings,
      completedBookings,
      totalUsers,
      totalWorkers,
      verifiedWorkers,
      totalRevenue: totalRevenue || 0,
      totalCommission: totalCommission || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bookings = await Booking.findAll({
      include: [
        { model: Service },
        { model: User, as: 'customer', attributes: { exclude: ['password'] } },
        { model: Worker, as: 'worker', include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }] }
      ]
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

async function startServer() {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced');
    
    const existingCommission = await Commission.findOne({ where: { isActive: true } });
    if (!existingCommission) {
      await Commission.create({ percentage: 15, isActive: true });
    }
    
    const services = [
      { name: 'Plumbing', description: 'Professional plumbing services for all your needs', icon: '🔧', startingPrice: 499, category: 'Home Repair', taxRate: 5, platformFee: 29 },
      { name: 'Electrical', description: 'Expert electrical repairs and installations', icon: '⚡', startingPrice: 399, category: 'Home Repair', taxRate: 5, platformFee: 29 },
      { name: 'Cleaning', description: 'Thorough home and office cleaning services', icon: '🧹', startingPrice: 299, category: 'Cleaning', taxRate: 5, platformFee: 19 },
      { name: 'Drivers', description: 'Reliable drivers for your travel needs', icon: '🚗', startingPrice: 199, category: 'Drivers', taxRate: 5, platformFee: 19 },
      { name: 'Home Repair', description: 'General home repair and maintenance', icon: '🏠', startingPrice: 599, category: 'Home Repair', taxRate: 5, platformFee: 39 },
      { name: 'AC Service', description: 'Professional AC repair and servicing', icon: '❄️', startingPrice: 799, category: 'Appliance Repair', taxRate: 5, platformFee: 49 },
      { name: 'Painting', description: 'Quality painting services for your space', icon: '🎨', startingPrice: 1499, category: 'Home Repair', taxRate: 5, platformFee: 99 },
      { name: 'Cooking', description: 'Tasty home-cooked meals by expert chefs', icon: '👨‍🍳', startingPrice: 399, category: 'Cooking', taxRate: 5, platformFee: 29 }
    ];
    
    for (const service of services) {
      await Service.findOrCreate({ where: { name: service.name }, defaults: service });
    }
    
    console.log('Services seeded');
    
    const existingAdmin = await User.findOne({ where: { email: 'admin@skilllink.com' } });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@skilllink.com',
        password: await bcrypt.hash('admin123', salt),
        phone: '9876543210',
        role: 'admin'
      });
      
      const existingCustomer = await User.findOne({ where: { email: 'customer@skilllink.com' } });
      if (!existingCustomer) {
        await User.create({
          name: 'Customer User',
          email: 'customer@skilllink.com',
          password: await bcrypt.hash('customer123', salt),
          phone: '8765432109',
          address: '123 Main Street, Jagtial',
          role: 'customer'
        });
      }
      
      const existingWorkerUser = await User.findOne({ where: { email: 'worker@skilllink.com' } });
      let workerUser;
      if (!existingWorkerUser) {
        workerUser = await User.create({
          name: 'Worker User',
          email: 'worker@skilllink.com',
          password: await bcrypt.hash('worker123', salt),
          phone: '7654321098',
          address: '456 Oak Avenue, Karimnagar',
          role: 'worker'
        });
      } else {
        workerUser = existingWorkerUser;
      }
      
      const existingWorker = await Worker.findOne({ where: { userId: workerUser.id } });
      if (!existingWorker) {
        await Worker.create({
          userId: workerUser.id,
          experience: 5,
          skills: ['Plumbing', 'Electrical', 'Home Repair'],
          serviceAreas: ['Jagtial', 'Karimnagar'],
          isVerified: true,
          availability: true,
          availabilitySlots: [
            { day: 'Monday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
            { day: 'Tuesday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
            { day: 'Wednesday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
            { day: 'Thursday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
            { day: 'Friday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
            { day: 'Saturday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
            { day: 'Sunday', slots: [] }
          ],
          trustScore: 100,
          completedJobs: 25,
          ratings: 4.8,
          commissionTier: 1
        });
      }
      
      console.log('Test accounts created!');
      console.log('Admin: admin@skilllink.com / admin123');
      console.log('Customer: customer@skilllink.com / customer123');
      console.log('Worker: worker@skilllink.com / worker123');
    }
    
    console.log('Starting automated booking lifecycle management...');
    
    setInterval(async () => {
      try {
        const now = new Date();
        
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
        
        const longFutureBookingsToActivate = await Booking.findAll({
          where: {
            bookingWindowType: 'long_future',
            status: 'slot_reserved',
            preferredDateTime: { [Op.lte]: twentyFourHoursFromNow }
          },
          include: [Service]
        });
        
        for (const booking of longFutureBookingsToActivate) {
          await booking.update({
            bookingWindowType: 'near_future',
            status: 'awaiting_interest'
          });
          
          const eligibleWorkers = await Worker.findAll({
            where: { isVerified: true, availability: true },
            include: [{ model: User, as: 'User' }]
          });
          
          for (const worker of eligibleWorkers) {
            if (worker.skills && Array.isArray(worker.skills) && worker.skills.includes(booking.Service?.name)) {
              if (checkWorkerAvailability(worker, booking.preferredDateTime)) {
                await Notification.create({
                  userId: worker.userId,
                  message: `${booking.Service?.name} job available! Estimated payout ₹${booking.workerPayout?.toFixed(0)}. Tap to show interest.`,
                  type: 'booking_interest_request'
                });
              }
            }
          }
          
          console.log(`Activated long-future booking ${booking.id} to near-future`);
        }
        
        const bookingsToAssignOneHourBefore = await Booking.findAll({
          where: {
            status: { [Op.in]: ['slot_reserved', 'awaiting_interest', 'awaiting_worker'] },
            preferredDateTime: { [Op.between]: [oneHourFromNow, new Date(oneHourFromNow.getTime() + 10 * 60 * 1000)] }
          },
          include: [Service, { model: User, as: 'customer' }]
        });
        
        for (const booking of bookingsToAssignOneHourBefore) {
          if (booking.Service) {
            const matchedWorker = await findMatchingWorker(
              booking.serviceId, 
              booking.address, 
              booking.preferredDateTime
            );
            
            if (matchedWorker) {
              await booking.update({
                workerId: matchedWorker.id,
                status: 'worker_assigned',
                lastAssignmentAt: now,
                assignmentAttempts: booking.assignmentAttempts + 1
              });
              
              await Notification.create({
                userId: matchedWorker.userId,
                message: `You've been assigned a new ${booking.Service.name} booking starting in 1 hour!`,
                type: 'booking_assigned'
              });
              
              await Notification.create({
                userId: booking.customerId,
                message: `A worker has been assigned to your ${booking.Service.name} booking!`,
                type: 'worker_assigned'
              });
              
              console.log(`Automatically assigned booking ${booking.id} to worker ${matchedWorker.id} 1 hour before service`);
            }
          }
        }
        
        const bookingsForReminders = await Booking.findAll({
          where: {
            status: { [Op.notIn]: ['cancelled', 'completed', 'payment_released'] },
            preferredDateTime: { 
              [Op.or]: [
                { [Op.between]: [oneHourFromNow, new Date(oneHourFromNow.getTime() + 15 * 60 * 1000)] },
                { [Op.between]: [fifteenMinutesFromNow, new Date(fifteenMinutesFromNow.getTime() + 10 * 60 * 1000)] }
              ]
            }
          },
          include: [{ model: User, as: 'customer' }, Service]
        });
        
        for (const booking of bookingsForReminders) {
          const timeDiffMs = booking.preferredDateTime - now;
          const timeDiffMinutes = Math.round(timeDiffMs / (1000 * 60));
          
          let reminderMessage = '';
          if (timeDiffMinutes <= 65 && timeDiffMinutes >= 55) {
            reminderMessage = `Reminder: Your ${booking.Service?.name} service is in 1 hour!`;
          } else if (timeDiffMinutes <= 20 && timeDiffMinutes >= 10) {
            reminderMessage = `Reminder: Your ${booking.Service?.name} service is in 15 minutes!`;
          }
          
          if (reminderMessage) {
            await Notification.create({
              userId: booking.customerId,
              message: reminderMessage,
              type: 'booking_reminder'
            });
          }
        }
        
      } catch (error) {
        console.error('Error in automated booking management:', error);
      }
    }, 60 * 1000);
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
}

startServer();
