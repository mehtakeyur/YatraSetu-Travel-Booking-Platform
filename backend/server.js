const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yatrasetu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  preferences: {
    class: { type: String, default: 'economy' },
    meal: { type: String, default: 'veg' },
    seat: { type: String, default: 'window' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  class: { type: String, enum: ['economy', 'business', 'first'], default: 'economy' },
  status: { type: String, enum: ['scheduled', 'boarding', 'departed', 'arrived', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  amenities: [{ type: String }],
  rooms: [{
    type: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  images: [{ type: String }],
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  duration: { type: String, required: true },
  classes: [{
    type: { type: String, enum: ['SL', '3A', '2A', '1A', 'CC'], required: true },
    price: { type: Number, required: true },
    available: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  status: { type: String, enum: ['ontime', 'delayed', 'cancelled'], default: 'ontime' },
  createdAt: { type: Date, default: Date.now }
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  operator: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  duration: { type: String, required: true },
  busType: { type: String, enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'], required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  amenities: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['flight', 'hotel', 'train', 'bus'], required: true },
  bookingId: { type: String, required: true, unique: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  passengers: [{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    seatNumber: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  bookingDate: { type: Date, default: Date.now },
  travelDate: { type: Date, required: true },
  contactDetails: {
    email: { type: String, required: true },
    mobile: { type: String, required: true }
  },
  specialRequests: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Flight = mongoose.model('Flight', flightSchema);
const Hotel = mongoose.model('Hotel', hotelSchema);
const Train = mongoose.model('Train', trainSchema);
const Bus = mongoose.model('Bus', busSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Utility functions
const generateBookingId = (type) => {
  const prefix = type.toUpperCase().substring(0, 2);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Flight Routes
app.get('/api/flights/suggestions', async (req, res) => {
  try {
    const { query, field } = req.query;
    if (!query || !field || !['from', 'to'].includes(field)) {
      return res.status(400).json({ error: 'Invalid query or field' });
    }

    const regex = new RegExp(query, 'i');
    const suggestions = await Flight.find({ [field]: regex }).distinct(field);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/flights/search', async (req, res) => {
  try {
    const { from, to, departure } = req.query;
    if (!from || !to || !departure) {
      return res.status(400).json({ error: 'from, to, departure required' });
    }

    const depDate = new Date(departure);
    const nextDate = new Date(depDate);
    nextDate.setDate(depDate.getDate() + 1);

    const flights = await Flight.find({
      from: { $regex: from, $options: 'i' },
      to: { $regex: to, $options: 'i' },
      departure: { $gte: depDate, $lt: nextDate }
    });

    res.json(flights);
  } catch (err) {
    console.error('Flight search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hotel Routes
app.get('/api/hotels/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    const regex = new RegExp(query, 'i');
    const suggestions = await Hotel.find({ location: regex }).distinct('location');
    res.json(suggestions);
  } catch (error) {
    console.error('Hotel suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hotels/search', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'location required' });
    }

    const hotels = await Hotel.find({
      location: { $regex: location, $options: 'i' }
    });

    res.json(hotels);
  } catch (err) {
    console.error('Hotel search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Train Routes
app.get('/api/trains/suggestions', async (req, res) => {
  try {
    const { query, field } = req.query;
    if (!query || !field || !['from', 'to'].includes(field)) {
      return res.status(400).json({ error: 'Invalid query or field' });
    }

    const regex = new RegExp(query, 'i');
    const suggestions = await Train.find({ [field]: regex }).distinct(field);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trains/search', async (req, res) => {
  try {
    const { from, to, departure } = req.query;
    if (!from || !to || !departure) {
      return res.status(400).json({ error: 'from, to, departure required' });
    }

    const depDate = new Date(departure);
    const nextDate = new Date(depDate);
    nextDate.setDate(depDate.getDate() + 1);

    const trains = await Train.find({
      from: { $regex: from, $options: 'i' },
      to: { $regex: to, $options: 'i' },
      departure: { $gte: depDate, $lt: nextDate }
    });

    res.json(trains);
  } catch (err) {
    console.error('Train search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/trains/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }
    res.json(train);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bus Routes
app.get('/api/buses/suggestions', async (req, res) => {
  try {
    const { query, field } = req.query;
    if (!query || !field || !['from', 'to'].includes(field)) {
      return res.status(400).json({ error: 'Invalid query or field' });
    }

    const regex = new RegExp(query, 'i');
    const suggestions = await Bus.find({ [field]: regex }).distinct(field);
    res.json(suggestions.slice(0, 5));
  } catch (error) {
    console.error('Bus suggestions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/buses/search', async (req, res) => {
  try {
    const { from, to, departure } = req.query;
    if (!from || !to || !departure) {
      return res.status(400).json({ error: 'from, to, departure required' });
    }

    const depDate = new Date(departure);
    const nextDate = new Date(depDate);
    nextDate.setDate(depDate.getDate() + 1);

    const buses = await Bus.find({
      from: { $regex: from, $options: 'i' },
      to: { $regex: to, $options: 'i' },
      departure: { $gte: depDate, $lt: nextDate }
    });

    res.json(buses);
  } catch (err) {
    console.error('Bus search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Booking Routes - FIXED VERSION
// Replace the existing booking creation route with this fixed version
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const {
      bookingType,
      serviceId,
      passengers,
      totalAmount,
      travelDate,
      contactDetails,
      specialRequests
    } = req.body;

    if (!bookingType || !serviceId || !passengers || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let validBookingType = bookingType;
    const typeMapping = {
      'hotels': 'hotel',
      'flights': 'flight',
      'trains': 'train',
      'buses': 'bus'
    };
    
    if (typeMapping[bookingType]) {
      validBookingType = typeMapping[bookingType];
    }

    const validTypes = ['flight', 'hotel', 'train', 'bus'];
    if (!validTypes.includes(validBookingType)) {
      return res.status(400).json({
        error: `Invalid booking type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // FIX: Always get correct travel date from service, ignore provided travelDate
    let correctTravelDate = null;
    
    try {
      let service;
      switch (validBookingType) {
        case 'flight':
          service = await Flight.findById(serviceId);
          correctTravelDate = service?.departure ? new Date(service.departure) : null;
          break;
        case 'train':
          service = await Train.findById(serviceId);
          correctTravelDate = service?.departure ? new Date(service.departure) : null;
          break;
        case 'bus':
          service = await Bus.findById(serviceId);
          correctTravelDate = service?.departure ? new Date(service.departure) : null;
          break;
        case 'hotel':
          service = await Hotel.findById(serviceId);
          // For hotels, use the provided travelDate or tomorrow as check-in
          if (travelDate && !isNaN(new Date(travelDate).getTime())) {
            correctTravelDate = new Date(travelDate);
          } else {
            correctTravelDate = new Date();
            correctTravelDate.setDate(correctTravelDate.getDate() + 1);
          }
          break;
      }
    } catch (serviceError) {
      console.error('Error fetching service:', serviceError);
      return res.status(400).json({ error: 'Service not found' });
    }

    // If still no valid date, return error
    if (!correctTravelDate || isNaN(correctTravelDate.getTime())) {
      return res.status(400).json({ error: 'Could not determine valid travel date' });
    }

    const bookingId = generateBookingId(validBookingType);

    const booking = new Booking({
      userId: req.user.userId,
      bookingType: validBookingType, 
      bookingId,
      serviceId,
      passengers,
      totalAmount,
      travelDate: correctTravelDate, // Use the corrected travel date
      contactDetails,
      specialRequests
    });

    await booking.save();

    // Send email notification
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactDetails.email,
        subject: `Booking Confirmed - ${bookingId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Booking Confirmed!</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> ${bookingId}</p>
              <p><strong>Type:</strong> ${validBookingType.charAt(0).toUpperCase() + validBookingType.slice(1)}</p>
              <p><strong>Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
              <p><strong>Travel Date:</strong> ${correctTravelDate.toDateString()}</p>
              <p><strong>Booking Date:</strong> ${new Date().toDateString()}</p>
              <p><strong>Status:</strong> <span style="color: #16a34a;">Confirmed</span></p>
            </div>
            
            <hr style="margin: 30px 0;">
            
            <h3>Customer Details</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
              <p><strong>Name:</strong> ${contactDetails.name || passengers[0]?.firstName + ' ' + passengers[0]?.lastName || req.user?.firstName || 'N/A'}</p>
              <p><strong>Email:</strong> ${contactDetails.email}</p>
              <p><strong>Phone:</strong> ${contactDetails.mobile || contactDetails.phone || 'N/A'}</p>
            </div>
            
            ${passengers && passengers.length > 0 ? `
            <hr style="margin: 30px 0;">
            <h3>Passenger Details</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
              ${passengers.map((p, index) => `
                <p><strong>Passenger ${index + 1}:</strong> ${p.firstName} ${p.lastName}, Age: ${p.age}, Gender: ${p.gender}</p>
              `).join('')}
            </div>
            ` : ''}
            
            ${specialRequests ? `
            <hr style="margin: 30px 0;">
            <h3>Special Requests</h3>
            <p style="background: #fef3c7; padding: 10px; border-radius: 4px;">${specialRequests}</p>
            ` : ''}
            
            <hr style="margin: 30px 0;">
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <p><strong>Important:</strong> Please carry valid ID during travel.</p>
              <p><strong>Support:</strong> support@yatrasetu.com | +91-XXXX-XXXX-XX</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px; color: #6b7280;">
              Thank you for choosing YatraSetu!
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking.toObject(),
        bookingId: booking.bookingId
      }
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        error: 'Validation error',
        details: validationErrors
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate booking ID generated. Please try again.'
      });
    }
    
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('serviceId');
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('serviceId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Payment Routes
app.post('/api/payments/process', authenticateToken, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const booking = await Booking.findOneAndUpdate(
      { bookingId, userId: req.user.userId },
      { 
        paymentStatus: 'paid',
        paymentId: paymentId
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Payment processed successfully',
      paymentId,
      booking
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Profile Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, mobile, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        firstName,
        lastName,
        mobile,
        preferences,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalBookings: await Booking.countDocuments(),
      totalFlights: await Flight.countDocuments(),
      totalHotels: await Hotel.countDocuments(),
      totalTrains: await Train.countDocuments(),     
      totalBuses: await Bus.countDocuments(),
      totalRevenue: await Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    };

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email');

    res.json({
      stats,
      recentBookings: bookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Static files and React routing
const reactPath = path.join(__dirname, '../frontend/reactapp');

// Serve static files
app.use(express.static(path.join(reactPath, 'public')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(reactPath, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 YatraSetu server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = {
  User,
  Flight,
  Hotel,
  Train,
  Bus,
  Booking,
  app
};