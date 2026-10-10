import ProductionBatch from '../models/ProductionBatch.js';
import Recipe from '../models/Recipe.js';
import InventoryItem from '../models/InventoryItem.js';
import InventoryMovement from '../models/InventoryMovement.js';
import Batch from '../models/Batch.js';
import { MOVEMENT_TYPES, PRODUCTION_STATUS } from '../config/constants.js';

export const productionService = {
  /**
   * Plan a new production batch from a Recipe
   */
  async createBatch({ recipeId, plannedOutputUnits, operatorUser }) {
    const recipe = await Recipe.findById(recipeId).populate('product');
    if (!recipe || !recipe.isActive) {
      throw new Error('Valid active recipe is required');
    }

    const ratio = plannedOutputUnits / recipe.batchSizeYieldUnits;

    // Calculate required raw materials and packaging
    const materialsIssued = [
      ...recipe.rawMaterials.map(m => ({
        sku: m.itemSku,
        name: m.itemName,
        unit: m.unit,
        issuedQty: Math.round(m.requiredQty * ratio * 100) / 100,
        actualUsedQty: 0
      })),
      ...recipe.ingredients.map(m => ({
        sku: m.itemSku,
        name: m.itemName,
        unit: m.unit,
        issuedQty: Math.round(m.requiredQty * ratio * 100) / 100,
        actualUsedQty: 0
      })),
      ...recipe.flavours.map(m => ({
        sku: m.itemSku,
        name: m.itemName,
        unit: m.unit,
        issuedQty: Math.round(m.requiredQty * ratio * 100) / 100,
        actualUsedQty: 0
      }))
    ];

    const packagingIssued = recipe.packagingMaterials.map(m => ({
      sku: m.itemSku,
      name: m.itemName,
      unit: m.unit,
      issuedQty: Math.ceil(m.requiredQty * ratio),
      actualUsedQty: 0
    }));

    const batchCode = `PROD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const batch = await ProductionBatch.create({
      batchCode,
      recipe: recipe._id,
      product: recipe.product._id,
      variantSku: recipe.variantSku,
      plannedOutputUnits,
      expectedYieldPercent: 100 - recipe.expectedProcessingLossPercent,
      materialsIssued,
      packagingIssued,
      status: PRODUCTION_STATUS.PLANNED,
      operator: operatorUser?._id,
      startDate: new Date()
    });

    return batch;
  },

  /**
   * Issue raw materials and packaging out of warehouse stock for production
   */
  async issueMaterials({ batchId, user }) {
    const batch = await ProductionBatch.findById(batchId);
    if (!batch) throw new Error('Production batch not found');

    if (batch.status !== PRODUCTION_STATUS.PLANNED) {
      throw new Error(`Cannot issue materials for batch in '${batch.status}' status`);
    }

    // Verify stock availability for all materials
    for (const mat of [...batch.materialsIssued, ...batch.packagingIssued]) {
      const invItem = await InventoryItem.findOne({ sku: mat.sku });
      if (!invItem) {
        throw new Error(`Material with SKU '${mat.sku}' does not exist in inventory`);
      }
      const available = invItem.physicalStock - invItem.reservedStock;
      if (available < mat.issuedQty) {
        throw new Error(`Insufficient stock for material '${mat.name}' (${mat.sku}). Required: ${mat.issuedQty}, Available: ${available}`);
      }
    }

    // Deduct raw materials from physical stock
    for (const mat of [...batch.materialsIssued, ...batch.packagingIssued]) {
      const invItem = await InventoryItem.findOneAndUpdate(
        { sku: mat.sku },
        { $inc: { physicalStock: -mat.issuedQty } },
        { new: true }
      );

      mat.actualUsedQty = mat.issuedQty;

      await InventoryMovement.create({
        inventoryItem: invItem._id,
        sku: mat.sku,
        movementType: MOVEMENT_TYPES.PRODUCTION_ISSUE,
        quantityChange: -mat.issuedQty,
        previousPhysicalStock: invItem.physicalStock + mat.issuedQty,
        newPhysicalStock: invItem.physicalStock,
        unit: mat.unit,
        referenceType: 'production_batch',
        referenceId: batch.batchCode,
        reason: `Materials issued for Production Batch #${batch.batchCode}`,
        performedBy: user?._id,
        performedByName: user?.name || 'Production Supervisor'
      });
    }

    batch.status = PRODUCTION_STATUS.MATERIALS_ISSUED;
    await batch.save();

    return batch;
  },

  /**
   * Complete batch after roasting, seasoning, quality inspection, and packaging.
   * Receives finished goods into sellable inventory.
   */
  async completeBatch({
    batchId,
    actualOutputUnits,
    processingLossQty = 0,
    qualityStatus = 'passed',
    inspectionNotes = 'Aroma, crispness, and moisture levels meet premium Zuno standards',
    user
  }) {
    const batch = await ProductionBatch.findById(batchId);
    if (!batch) throw new Error('Production batch not found');

    if (batch.status === PRODUCTION_STATUS.COMPLETED) {
      throw new Error('Batch has already been completed');
    }

    const outputQty = parseInt(actualOutputUnits, 10);
    if (isNaN(outputQty) || outputQty <= 0) {
      throw new Error('Valid actual output units count is required');
    }

    const yieldPercent = Math.round((outputQty / batch.plannedOutputUnits) * 100 * 10) / 10;
    const finishedBatchNumber = `ZB-${batch.variantSku}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;

    batch.actualOutputUnits = outputQty;
    batch.actualYieldPercent = yieldPercent;
    batch.processingLossQty = processingLossQty;
    batch.finishedBatchNumber = finishedBatchNumber;
    batch.qualityInspection = {
      status: qualityStatus,
      inspectedBy: user?._id,
      notes: inspectionNotes,
      inspectionDate: new Date()
    };
    batch.completedDate = new Date();

    if (qualityStatus === 'passed') {
      batch.status = PRODUCTION_STATUS.COMPLETED;

      // Increase finished product inventory
      let finishedItem = await InventoryItem.findOne({ sku: batch.variantSku });
      if (!finishedItem) {
        finishedItem = await InventoryItem.create({
          sku: batch.variantSku,
          name: `Finished Makhana Pack - ${batch.variantSku}`,
          type: 'finished_goods',
          unit: 'packet',
          physicalStock: 0
        });
      }

      const prevStock = finishedItem.physicalStock;
      finishedItem.physicalStock += outputQty;
      await finishedItem.save();

      // Create finished batch record with 9 months shelf life
      await Batch.create({
        batchNumber: finishedBatchNumber,
        sku: batch.variantSku,
        itemName: finishedItem.name,
        type: 'finished_goods',
        quantityReceived: outputQty,
        quantityRemaining: outputQty,
        unit: 'packet',
        mfgDate: new Date(),
        expiryDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000), // 9 months
        productionBatchId: batch.batchCode,
        qualityStatus: 'passed'
      });

      // Audit movement
      await InventoryMovement.create({
        inventoryItem: finishedItem._id,
        sku: batch.variantSku,
        movementType: MOVEMENT_TYPES.PRODUCTION_RECEIPT,
        quantityChange: outputQty,
        previousPhysicalStock: prevStock,
        newPhysicalStock: finishedItem.physicalStock,
        unit: 'packet',
        referenceType: 'production_batch',
        referenceId: batch.batchCode,
        reason: `Finished goods receipt from Production Batch #${batch.batchCode}`,
        batchNumber: finishedBatchNumber,
        performedBy: user?._id,
        performedByName: user?.name || 'Production Manager'
      });
    } else {
      batch.status = PRODUCTION_STATUS.QUALITY_CHECK;
    }

    await batch.save();
    return batch;
  }
};
