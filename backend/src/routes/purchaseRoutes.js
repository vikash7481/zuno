import express from 'express';
import { getPurchases, createPurchase, receivePurchase } from '../controllers/purchaseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.INVENTORY_MANAGER));

router.get('/', getPurchases);
router.post('/', createPurchase);
router.post('/:id/receive', receivePurchase);

export default router;
