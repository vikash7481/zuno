import express from 'express';
import {
  getInventoryItems,
  createInventoryItem,
  adjustStock,
  getStockMovements,
  getBatches
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PRODUCTION_MANAGER));

router.get('/items', getInventoryItems);
router.post('/items', createInventoryItem);
router.post('/adjust', adjustStock);
router.get('/movements', getStockMovements);
router.get('/batches', getBatches);

export default router;
