import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

/**
 * Public customer registration.
 * Role elevation is strictly forbidden: all public registrations are assigned ROLES.CUSTOMER.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Strictly enforce customer role for public registration
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: (phone || '').trim(),
      role: ROLES.CUSTOMER
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

/**
 * User login with credential validation.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
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

/**
 * Current user profile.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    next(error);
  }
};

/**
 * Change account password.
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Add shipping address.
 */
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
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: (landmark || '').trim(),
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete shipping address.
 */
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

/**
 * Toggle wishlist item.
 */
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

/**
 * STAFF MANAGEMENT ENDPOINTS (Strictly gated to Super Admin and Admin)
 */

export const getStaffUsers = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $ne: ROLES.CUSTOMER } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

export const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, deliveryPartnerProfile } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    const validStaffRoles = [
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.ORDER_MANAGER,
      ROLES.DELIVERY_MANAGER,
      ROLES.DELIVERY_PARTNER,
      ROLES.SUPPORT_STAFF
    ];

    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid staff role '${role}'` });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newStaff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: (phone || '').trim(),
      role,
      deliveryPartnerProfile: role === ROLES.DELIVERY_PARTNER ? (deliveryPartnerProfile || {}) : undefined
    });

    res.status(201).json({
      success: true,
      user: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaffUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, role, isActive } = req.body;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff user not found' });
    }

    if (name) staff.name = name.trim();
    if (phone !== undefined) staff.phone = phone.trim();
    if (role && Object.values(ROLES).includes(role)) staff.role = role;
    if (isActive !== undefined) staff.isActive = Boolean(isActive);

    await staff.save();
    res.json({ success: true, user: { id: staff._id, name: staff.name, email: staff.email, role: staff.role, isActive: staff.isActive } });
  } catch (error) {
    next(error);
  }
};

export const deleteStaffUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff user not found' });
    }

    staff.isActive = false;
    await staff.save();

    res.json({ success: true, message: 'Staff account successfully deactivated' });
  } catch (error) {
    next(error);
  }
};
