import PurchaseOrder from '../models/PurchaseOrder.js';
import Supplier from '../models/Supplier.js';
import { inventoryService } from '../services/inventoryService.js';
import { logAudit } from '../utils/auditLogger.js';

export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await PurchaseOrder.find()
      .populate('supplier', 'name companyName phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, purchases });
  } catch (error) {
    next(error);
  }
};

export const createPurchase = async (req, res, next) => {
  try {
    const { supplierId, items, invoiceRef, notes } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    let subtotal = 0;
    let taxAmount = 0;

    const formattedItems = (items || []).map(i => {
      const lineCost = Number(i.quantity) * Number(i.unitCost);
      const lineTax = (lineCost * (Number(i.taxPercent) || 5)) / 100;
      subtotal += lineCost;
      taxAmount += lineTax;
      return {
        ...i,
        itemSku: i.itemSku.toUpperCase(),
        totalCost: lineCost + lineTax
      };
    });

    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const purchaseCode = `PO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const purchase = await PurchaseOrder.create({
      purchaseCode,
      supplier: supplier._id,
      supplierName: supplier.name,
      items: formattedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount,
      invoiceRef: invoiceRef || '',
      notes: notes || '',
      createdBy: req.user._id
    });

    // Update supplier outstanding balance
    supplier.outstandingBalance = (supplier.outstandingBalance || 0) + totalAmount;
    await supplier.save();

    await logAudit({
      action: 'PURCHASE_ORDER_CREATED',
      user: req.user,
      entityType: 'PurchaseOrder',
      entityId: purchase._id,
      details: { purchaseCode, totalAmount, supplier: supplier.name },
      req
    });

    res.status(201).json({ success: true, purchase });
  } catch (error) {
    next(error);
  }
};

export const receivePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    const updatedPurchase = await inventoryService.receivePurchaseOrder(purchase, req.user);

    await logAudit({
      action: 'PURCHASE_GOODS_RECEIVED',
      user: req.user,
      entityType: 'PurchaseOrder',
      entityId: purchase._id,
      details: { purchaseCode: purchase.purchaseCode },
      req
    });

    res.json({
      success: true,
      purchase: updatedPurchase,
      message: 'Goods received and added to inventory balances'
    });
  } catch (error) {
    next(error);
  }
};
