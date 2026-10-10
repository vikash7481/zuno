import Recipe from '../models/Recipe.js';
import ProductionBatch from '../models/ProductionBatch.js';
import { productionService } from '../services/productionService.js';
import { logAudit } from '../utils/auditLogger.js';

export const getRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ isActive: true }).populate('product', 'name slug variants');
    res.json({ success: true, recipes });
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    const {
      name,
      product,
      variantSku,
      targetPackSize,
      batchSizeYieldUnits,
      rawMaterials,
      ingredients,
      flavours,
      packagingMaterials,
      expectedProcessingLossPercent,
      instructions
    } = req.body;

    const recipe = await Recipe.create({
      name,
      product,
      variantSku: variantSku.toUpperCase(),
      targetPackSize,
      batchSizeYieldUnits: Number(batchSizeYieldUnits) || 100,
      rawMaterials: rawMaterials || [],
      ingredients: ingredients || [],
      flavours: flavours || [],
      packagingMaterials: packagingMaterials || [],
      expectedProcessingLossPercent: Number(expectedProcessingLossPercent) || 4.5,
      instructions: instructions || '',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, recipe });
  } catch (error) {
    next(error);
  }
};

export const getProductionBatches = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const batches = await ProductionBatch.find(query)
      .populate('recipe', 'name')
      .populate('product', 'name')
      .populate('operator', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, batches });
  } catch (error) {
    next(error);
  }
};

export const createProductionBatch = async (req, res, next) => {
  try {
    const { recipeId, plannedOutputUnits } = req.body;
    const batch = await productionService.createBatch({
      recipeId,
      plannedOutputUnits: Number(plannedOutputUnits),
      operatorUser: req.user
    });

    await logAudit({
      action: 'PRODUCTION_BATCH_CREATED',
      user: req.user,
      entityType: 'ProductionBatch',
      entityId: batch._id,
      details: { batchCode: batch.batchCode, plannedOutputUnits },
      req
    });

    res.status(201).json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

export const issueMaterials = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await productionService.issueMaterials({ batchId: id, user: req.user });

    await logAudit({
      action: 'PRODUCTION_MATERIALS_ISSUED',
      user: req.user,
      entityType: 'ProductionBatch',
      entityId: batch._id,
      details: { batchCode: batch.batchCode },
      req
    });

    res.json({ success: true, batch, message: 'Raw materials successfully issued and deducted from inventory' });
  } catch (error) {
    next(error);
  }
};

export const completeProductionBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actualOutputUnits, processingLossQty, qualityStatus, inspectionNotes } = req.body;

    const batch = await productionService.completeBatch({
      batchId: id,
      actualOutputUnits,
      processingLossQty,
      qualityStatus,
      inspectionNotes,
      user: req.user
    });

    await logAudit({
      action: 'PRODUCTION_BATCH_COMPLETED',
      user: req.user,
      entityType: 'ProductionBatch',
      entityId: batch._id,
      details: { batchCode: batch.batchCode, actualOutputUnits, qualityStatus },
      req
    });

    res.json({
      success: true,
      batch,
      message: 'Production batch finalized and finished goods added to inventory'
    });
  } catch (error) {
    next(error);
  }
};
