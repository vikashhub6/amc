const User = require('../models/User');
const Client = require('../models/Client');
const Technician = require('../models/Technician');
const generateToken = require('../utils/generateToken');

// Admin banata hai technician/admin users. Customer khud register kar sakta hai
// (ya admin unke liye bhi bana sakta hai jab client add kare).
async function register(req, res, next) {
  try {
    const { name, email, phone, password, role, zone, address, zones, specialization } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password, role: role || 'customer' });

    // Role ke hisaab se linked profile document bhi bana do
    if (user.role === 'customer') {
      const client = await Client.create({
        user: user._id,
        name,
        phone,
        email,
        address: address || 'N/A',
        zone: zone || 'GIDC Vapi',
      });
      user.client = client._id;
      await user.save();
    } else if (user.role === 'technician') {
      const technician = await Technician.create({
        user: user._id,
        name,
        phone,
        email,
        zones: zones || [],
        specialization: specialization || [],
      });
      user.technician = technician._id;
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({ success: true, user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
