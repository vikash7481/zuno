import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Protect against privilege escalation: public registration defaults to CUSTOMER
    const assignedRole = (role && [ROLES.DELIVERY_PARTNER].includes(role)) ? role : ROLES.CUSTOMER;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: assignedRole
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        deliveryPartnerProfile: user.deliveryPartnerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Please fill all required address fields' });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      landmark: landmark || '',
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => String(a._id) !== String(addressId));
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(productId);
    let action = 'added';

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ success: true, action, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};
