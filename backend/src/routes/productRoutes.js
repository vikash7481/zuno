import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getCategories,
  createCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { getProductReviews, addReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);
router.get('/:productId/reviews', getProductReviews);

// Customer protected review submission
router.post('/:productId/reviews', protect, addReview);

// Admin protected routes
router.post('/categories', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createCategory);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createProduct);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateProduct);
router.delete('/:id', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteProduct);

export default router;
