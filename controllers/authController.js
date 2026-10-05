const User = require('../models/User');
const Company = require('../models/Company');
const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'homecare_hub_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new User
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role, address, city, pincode, companyName, ownerName, serviceArea, experienceYears } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const assignedRole = role && ['ADMIN', 'PROVIDER'].includes(role) ? role : 'USER';

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: assignedRole,
      address: address || '',
      city: city || '',
      pincode: pincode || '',
    });

    // If registering as Admin/Company, create linked Company document
    if (assignedRole === 'ADMIN') {
      await Company.create({
        userId: user._id,
        companyName: companyName || `${name}'s Store`,
        ownerName: ownerName || name,
        mobile: mobile,
        email: email,
        address: address || 'Main City Store',
        city: city || 'Chennai',
        state: 'Tamil Nadu',
        pincode: pincode || '600001',
        description: 'Authorized Appliance Sales & Service Partner',
      });
    }

    // If registering as Local Provider, create linked Provider document
    if (assignedRole === 'PROVIDER') {
      await Provider.create({
        userId: user._id,
        name: name,
        mobile: mobile,
        email: email,
        address: address || '',
        city: city || 'Chennai',
        pincode: pincode || '600001',
        serviceArea: serviceArea || city || 'Chennai Metro',
        experienceYears: experienceYears || 2,
        description: 'Certified Local Appliance Technician',
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      let companyId = null;
      let providerId = null;

      if (user.role === 'ADMIN') {
        const comp = await Company.findOne({ userId: user._id });
        if (comp) companyId = comp._id;
      } else if (user.role === 'PROVIDER') {
        const prov = await Provider.findOne({ userId: user._id });
        if (prov) providerId = prov._id;
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        companyId,
        providerId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      let extra = {};
      if (user.role === 'ADMIN') {
        extra.company = await Company.findOne({ userId: user._id });
      } else if (user.role === 'PROVIDER') {
        extra.provider = await Provider.findOne({ userId: user._id });
      }
      res.json({ ...user.toObject(), ...extra });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
