import InventoryItem from '../models/InventoryItem.js';
import InventoryMovement from '../models/InventoryMovement.js';
import InventoryReservation from '../models/InventoryReservation.js';
import Batch from '../models/Batch.js';
import { MOVEMENT_TYPES } from '../config/constants.js';

export const inventoryService = {
  /**
   * Atomically reserve stock for items in an order.
   * Prevents overselling using atomic conditional updates.
   */
  async reserveStock(orderItems, orderId, orderNumber, user = null, session = null) {
    const reservedItems = [];

    try {
      for (const item of orderItems) {
        const { variantSku, quantity } = item;

        // Atomically increment reservedStock ONLY IF (physicalStock - reservedStock) >= quantity
        const updateQuery = {
          sku: variantSku,
          $expr: {
            $gte: [
              { $subtract: ['$physicalStock', '$reservedStock'] },
              quantity
            ]
          }
        };

        const options = { new: true };
        if (session) options.session = session;

        const updatedItem = await InventoryItem.findOneAndUpdate(
          updateQuery,
          { $inc: { reservedStock: quantity } },
          options
        );

        if (!updatedItem) {
          // Fetch current available stock to give informative error message
          const currentItem = await InventoryItem.findOne({ sku: variantSku });
          const available = currentItem ? Math.max(0, currentItem.physicalStock - currentItem.reservedStock) : 0;
          throw new Error(
            `Insufficient available stock for SKU '${variantSku}'. Requested: ${quantity}, Available: ${available}`
          );
        }

        // Create reservation record
        const reservationRecord = await InventoryReservation.create([{
          orderId,
          orderNumber,
          sku: variantSku,
          quantity,
          status: 'active'
        }], session ? { session } : {});

        // Log inventory movement
        await InventoryMovement.create([{
          inventoryItem: updatedItem._id,
          sku: variantSku,
          movementType: MOVEMENT_TYPES.ORDER_RESERVATION,
          quantityChange: quantity,
          previousPhysicalStock: updatedItem.physicalStock,
          newPhysicalStock: updatedItem.physicalStock,
          previousReservedStock: updatedItem.reservedStock - quantity,
          newReservedStock: updatedItem.reservedStock,
          unit: updatedItem.unit,
          referenceType: 'order',
          referenceId: String(orderId),
          reason: `Stock reserved for Order #${orderNumber}`,
          performedBy: user?._id,
          performedByName: user?.name || 'Customer Checkout'
        }], session ? { session } : {});

        reservedItems.push({ sku: variantSku, quantity, reservationId: reservationRecord[0]._id });
      }

      return { success: true, reservedItems };
    } catch (error) {
      // Rollback already reserved items if any item in the order failed
      for (const res of reservedItems) {
        await InventoryItem.updateOne(
          { sku: res.sku },
          { $inc: { reservedStock: -res.quantity } },
          session ? { session } : {}
        );
        await InventoryReservation.updateOne(
          { _id: res.reservationId },
          { status: 'released' },
          session ? { session } : {}
        );
      }
      throw error;
    }
  },

  /**
   * Release stock reservations when an order is cancelled or expires.
   */
  async releaseReservation(orderId, orderNumber, reason = 'Order cancelled', user = null, session = null) {
    const activeReservations = await InventoryReservation.find({
      orderId,
      status: 'active'
    });

    if (!activeReservations.length) {
      return { success: true, releasedCount: 0 };
    }

    for (const res of activeReservations) {
      const item = await InventoryItem.findOneAndUpdate(
        { sku: res.sku },
        { $inc: { reservedStock: -res.quantity } },
        { new: true, session }
      );

      res.status = 'released';
      await res.save({ session });

      if (item) {
        await InventoryMovement.create([{
          inventoryItem: item._id,
          sku: res.sku,
          movementType: MOVEMENT_TYPES.ORDER_CANCELLATION_RELEASE,
          quantityChange: -res.quantity,
          previousPhysicalStock: item.physicalStock,
          newPhysicalStock: item.physicalStock,
          previousReservedStock: item.reservedStock + res.quantity,
          newReservedStock: item.reservedStock,
          unit: item.unit,
          referenceType: 'order',
          referenceId: String(orderId),
          reason: `Reservation released for Order #${orderNumber}: ${reason}`,
          performedBy: user?._id,
          performedByName: user?.name || 'System'
        }], session ? { session } : {});
      }
    }

    return { success: true, releasedCount: activeReservations.length };
  },

  /**
   * Finalize order fulfillment upon dispatch/delivery:
   * Deducts both physical stock and reserved stock.
   */
  async fulfillOrderStock(orderId, orderNumber, user = null, session = null) {
    const activeReservations = await InventoryReservation.find({
      orderId,
      status: 'active'
    });

    for (const res of activeReservations) {
      const item = await InventoryItem.findOneAndUpdate(
        { sku: res.sku },
        {
          $inc: {
            physicalStock: -res.quantity,
            reservedStock: -res.quantity
          }
        },
        { new: true, session }
      );

      res.status = 'fulfilled';
      await res.save({ session });

      if (item) {
        await InventoryMovement.create([{
          inventoryItem: item._id,
          sku: res.sku,
          movementType: MOVEMENT_TYPES.ORDER_FULFILLMENT,
          quantityChange: -res.quantity,
          previousPhysicalStock: item.physicalStock + res.quantity,
          newPhysicalStock: item.physicalStock,
          previousReservedStock: item.reservedStock + res.quantity,
          newReservedStock: item.reservedStock,
          unit: item.unit,
          referenceType: 'order',
          referenceId: String(orderId),
          reason: `Stock fulfilled for Order #${orderNumber}`,
          performedBy: user?._id,
          performedByName: user?.name || 'Fulfillment Officer'
        }], session ? { session } : {});
      }
    }

    return { success: true };
  },

  /**
   * Manual stock adjustment with mandatory audit reason and tracking
   */
  async adjustStock({ sku, quantityChange, adjustmentType = 'physical', reason, performedBy }) {
    if (!sku || quantityChange === undefined || !reason) {
      throw new Error('SKU, quantityChange, and reason are strictly required for stock adjustment');
    }

    const item = await InventoryItem.findOne({ sku });
    if (!item) {
      throw new Error(`Inventory item with SKU '${sku}' not found`);
    }

    const prevPhysical = item.physicalStock;
    let newPhysical = prevPhysical;

    if (adjustmentType === 'physical') {
      newPhysical = prevPhysical + Number(quantityChange);
      if (newPhysical < 0) {
        throw new Error(`Physical stock cannot become negative (Current: ${prevPhysical}, Change: ${quantityChange})`);
      }
      item.physicalStock = newPhysical;
    } else if (adjustmentType === 'damage') {
      // Moving units to damaged stock
      const qty = Math.abs(Number(quantityChange));
      if (item.physicalStock < qty) {
        throw new Error(`Cannot write off more than available physical stock`);
      }
      item.physicalStock -= qty;
      item.damagedStock += qty;
      newPhysical = item.physicalStock;
    } else if (adjustmentType === 'expired') {
      const qty = Math.abs(Number(quantityChange));
      if (item.physicalStock < qty) {
        throw new Error(`Cannot write off more than available physical stock`);
      }
      item.physicalStock -= qty;
      item.expiredStock += qty;
      newPhysical = item.physicalStock;
    }

    await item.save();

    await InventoryMovement.create({
      inventoryItem: item._id,
      sku: item.sku,
      movementType: adjustmentType === 'damage' ? MOVEMENT_TYPES.DAMAGED_WRITEOFF :
                    adjustmentType === 'expired' ? MOVEMENT_TYPES.EXPIRED_WRITEOFF :
                    MOVEMENT_TYPES.MANUAL_ADJUSTMENT,
      quantityChange: Number(quantityChange),
      previousPhysicalStock: prevPhysical,
      newPhysicalStock: newPhysical,
      previousReservedStock: item.reservedStock,
      newReservedStock: item.reservedStock,
      unit: item.unit,
      referenceType: 'manual_adjustment',
      reason,
      performedBy: performedBy?._id,
      performedByName: performedBy?.name || 'Administrator'
    });

    return item;
  },

  /**
   * Receive goods from a Purchase Order into physical inventory
   */
  async receivePurchaseOrder(purchaseOrder, performedBy) {
    if (purchaseOrder.stockReceived) {
      throw new Error('Stock for this purchase order has already been received');
    }

    for (const item of purchaseOrder.items) {
      let invItem = await InventoryItem.findOne({ sku: item.itemSku });
      if (!invItem) {
        invItem = await InventoryItem.create({
          sku: item.itemSku,
          name: item.itemName,
          type: item.itemType,
          unit: item.unit,
          physicalStock: 0,
          costPerUnit: item.unitCost
        });
      }

      const prevStock = invItem.physicalStock;
      invItem.physicalStock += Number(item.quantity);
      invItem.costPerUnit = item.unitCost; // Update unit cost
      await invItem.save();

      // If batch info provided, create or update batch
      if (item.batchNumber) {
        await Batch.create({
          batchNumber: item.batchNumber,
          sku: item.itemSku,
          itemName: item.itemName,
          type: item.itemType,
          quantityReceived: item.quantity,
          quantityRemaining: item.quantity,
          unit: item.unit,
          mfgDate: item.mfgDate || new Date(),
          expiryDate: item.expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          supplier: purchaseOrder.supplier,
          qualityStatus: 'passed'
        });
      }

      await InventoryMovement.create({
        inventoryItem: invItem._id,
        sku: item.itemSku,
        movementType: MOVEMENT_TYPES.PURCHASE_RECEIPT,
        quantityChange: Number(item.quantity),
        previousPhysicalStock: prevStock,
        newPhysicalStock: invItem.physicalStock,
        previousReservedStock: invItem.reservedStock,
        newReservedStock: invItem.reservedStock,
        unit: item.unit,
        referenceType: 'purchase',
        referenceId: purchaseOrder.purchaseCode,
        reason: `Goods receipt from PO #${purchaseOrder.purchaseCode} (${purchaseOrder.supplierName})`,
        batchNumber: item.batchNumber || '',
        performedBy: performedBy?._id,
        performedByName: performedBy?.name || 'Warehouse Staff'
      });
    }

    purchaseOrder.stockReceived = true;
    purchaseOrder.status = 'received';
    purchaseOrder.receivedAt = new Date();
    await purchaseOrder.save();

    return purchaseOrder;
  }
};
