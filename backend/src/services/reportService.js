import Order from '../models/Order.js';
import Expense from '../models/Expense.js';
import InventoryItem from '../models/InventoryItem.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

export const reportService = {
  /**
   * Get financial analytics overview for date range
   */
  async getFinancialOverview({ startDate, endDate }) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Orders aggregation
    const orders = await Order.find(dateFilter);

    let grossSales = 0;
    let totalDiscounts = 0;
    let totalTax = 0;
    let totalDeliveryFee = 0;
    let netSales = 0;
    let refunds = 0;
    let paidOrdersCount = 0;
    let totalOrdersCount = orders.length;

    const ordersByStatus = {};
    const ordersByPaymentMethod = { cod: 0, razorpay: 0 };

    for (const order of orders) {
      ordersByStatus[order.orderStatus] = (ordersByStatus[order.orderStatus] || 0) + 1;
      if (ordersByPaymentMethod[order.paymentMethod] !== undefined) {
        ordersByPaymentMethod[order.paymentMethod]++;
      }

      if (order.orderStatus !== ORDER_STATUS.CANCELLED) {
        grossSales += (order.subtotal || 0);
        totalDiscounts += (order.discountAmount || 0);
        totalTax += (order.taxAmount || 0);
        totalDeliveryFee += (order.deliveryFee || 0);
      }

      if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        paidOrdersCount++;
        netSales += (order.totalAmount || 0);
      } else if (order.paymentStatus === PAYMENT_STATUS.REFUNDED) {
        refunds += (order.totalAmount || 0);
      }
    }

    // Operating expenses
    const expenseDateFilter = {};
    if (startDate || endDate) {
      expenseDateFilter.date = {};
      if (startDate) expenseDateFilter.date.$gte = new Date(startDate);
      if (endDate) expenseDateFilter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(expenseDateFilter);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const expensesByCategory = {};
    for (const exp of expenses) {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + (exp.amount || 0);
    }

    // Inventory Valuation
    const inventoryItems = await InventoryItem.find({ isActive: true });
    let totalInventoryValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of inventoryItems) {
      const value = (item.physicalStock || 0) * (item.costPerUnit || 0);
      totalInventoryValuation += value;
      const available = item.physicalStock - item.reservedStock;
      if (available <= 0) {
        outOfStockCount++;
      } else if (available <= item.reorderThreshold) {
        lowStockCount++;
      }
    }

    // Estimated Profit Calculation: Net Sales - Total Operating Expenses (or rough COGS estimate)
    const estimatedProfit = Math.round((netSales - totalExpenses) * 100) / 100;

    return {
      financials: {
        grossSales: Math.round(grossSales * 100) / 100,
        discounts: Math.round(totalDiscounts * 100) / 100,
        taxCollected: Math.round(totalTax * 100) / 100,
        deliveryFeeCollected: Math.round(totalDeliveryFee * 100) / 100,
        netSales: Math.round(netSales * 100) / 100,
        refunds: Math.round(refunds * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        estimatedProfit,
        profitNotice: 'Calculated as Net Realized Sales minus recorded Operating & Raw Material Expenses'
      },
      orders: {
        totalOrdersCount,
        paidOrdersCount,
        byStatus: ordersByStatus,
        byPaymentMethod: ordersByPaymentMethod
      },
      inventory: {
        totalSKUs: inventoryItems.length,
        totalValuation: Math.round(totalInventoryValuation * 100) / 100,
        lowStockCount,
        outOfStockCount
      },
      expensesByCategory
    };
  },

  /**
   * Generate CSV export string for orders or inventory
   */
  async exportOrdersCSV({ startDate, endDate }) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(dateFilter).sort({ createdAt: -1 });

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'City',
      'Pincode',
      'Items Count',
      'Subtotal',
      'Discount',
      'Tax',
      'Delivery Fee',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status'
    ];

    const rows = orders.map(o => [
      o.orderNumber,
      o.createdAt.toISOString().slice(0, 10),
      `"${o.customerDetails?.name || ''}"`,
      o.customerDetails?.email || '',
      o.customerDetails?.phone || '',
      `"${o.shippingAddress?.city || ''}"`,
      o.shippingAddress?.pincode || '',
      o.items?.length || 0,
      o.subtotal,
      o.discountAmount,
      o.taxAmount,
      o.deliveryFee,
      o.totalAmount,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.orderStatus.toUpperCase()
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
