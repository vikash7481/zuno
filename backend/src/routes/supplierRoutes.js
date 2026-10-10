import express from 'express';
import { getSuppliers, createSupplier, updateSupplier } from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.INVENTORY_MANAGER));

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

export default router;
