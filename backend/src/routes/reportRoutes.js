import express from 'express';
import { getOverview, exportOrdersCSV } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/overview', getOverview);
router.get('/export/orders', exportOrdersCSV);

export default router;
