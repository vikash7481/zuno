import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Rate limiter for login endpoint to protect against brute-force credential stuffing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 login attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Public authentication
router.post('/register', register);
router.post('/login', loginLimiter, login);

// Authenticated customer/user account routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

// Staff management routes (Super Admin & Admin only)
router.get('/staff', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), getStaffUsers);
router.post('/staff', protect, authorize(ROLES.SUPER_ADMIN), createStaffUser);
router.put('/staff/:id', protect, authorize(ROLES.SUPER_ADMIN), updateStaffUser);
router.delete('/staff/:id', protect, authorize(ROLES.SUPER_ADMIN), deleteStaffUser);

export default router;
