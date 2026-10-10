import express from 'express';
import {
  getRecipes,
  createRecipe,
  getProductionBatches,
  createProductionBatch,
  issueMaterials,
  completeProductionBatch
} from '../controllers/productionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.PRODUCTION_MANAGER));

router.get('/recipes', getRecipes);
router.post('/recipes', createRecipe);
router.get('/batches', getProductionBatches);
router.post('/batches', createProductionBatch);
router.post('/batches/:id/issue-materials', issueMaterials);
router.post('/batches/:id/complete', completeProductionBatch);

export default router;
