import InventoryItem from '../models/InventoryItem.js';
import InventoryMovement from '../models/InventoryMovement.js';
import Batch from '../models/Batch.js';
import { inventoryService } from '../services/inventoryService.js';
import { logAudit } from '../utils/auditLogger.js';

export const getInventoryItems = async (req, res, next) => {
  try {
    const { type, search, lowStock } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    let items = await InventoryItem.find(query).sort({ type: 1, name: 1 });

    if (lowStock === 'true') {
      items = items.filter(item => (item.physicalStock - item.reservedStock) <= item.reorderThreshold);
    }

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const { sku, name, type, unit, physicalStock, reorderThreshold, costPerUnit, warehouseLocation } = req.body;

    const existing = await InventoryItem.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Inventory item with SKU '${sku}' already exists` });
    }

    const item = await InventoryItem.create({
      sku: sku.toUpperCase(),
      name,
      type,
      unit,
      physicalStock: Number(physicalStock) || 0,
      reorderThreshold: Number(reorderThreshold) || 10,
      costPerUnit: Number(costPerUnit) || 0,
      warehouseLocation: warehouseLocation || 'Main Warehouse - Bay A'
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { sku, quantityChange, adjustmentType, reason } = req.body;

    const updatedItem = await inventoryService.adjustStock({
      sku: sku.toUpperCase(),
      quantityChange,
      adjustmentType,
      reason,
      performedBy: req.user
    });

    await logAudit({
      action: 'STOCK_ADJUSTMENT',
      user: req.user,
      entityType: 'InventoryItem',
      entityId: updatedItem._id,
      details: { sku, quantityChange, adjustmentType, reason },
      req
    });

    res.json({ success: true, item: updatedItem, message: 'Stock successfully adjusted' });
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req, res, next) => {
  try {
    const { sku, movementType, limit = 50 } = req.query;
    const query = {};

    if (sku) query.sku = sku.toUpperCase();
    if (movementType) query.movementType = movementType;

    const movements = await InventoryMovement.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, movements });
  } catch (error) {
    next(error);
  }
};

export const getBatches = async (req, res, next) => {
  try {
    const { sku, type, expiringSoon } = req.query;
    const query = {};

    if (sku) query.sku = sku.toUpperCase();
    if (type) query.type = type;

    // FEFO: sort by expiryDate ascending
    let batches = await Batch.find(query).sort({ expiryDate: 1 }).populate('supplier', 'name companyName');

    if (expiringSoon === 'true') {
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      batches = batches.filter(b => b.expiryDate <= thirtyDaysLater);
    }

    res.json({ success: true, batches });
  } catch (error) {
    next(error);
  }
};
