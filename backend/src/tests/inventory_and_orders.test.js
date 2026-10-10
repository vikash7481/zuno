import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Product from '../models/Product.js';
import InventoryItem from '../models/InventoryItem.js';
import Order from '../models/Order.js';

describe('Inventory Engine & Order Processing Tests', () => {
  let customerToken = '';
  let testProduct = null;
  let testVariant = null;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    // Login customer
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@zuno.com', password: 'Password@123' });
    customerToken = loginRes.body.token;

    // Fetch existing product
    testProduct = await Product.findOne({ 'variants.sku': 'ZUNO-CL-SALT-100G' });
    testVariant = testProduct.variants.find(v => v.sku === 'ZUNO-CL-SALT-100G');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /api/orders/validate-checkout - Server must recalculate authoritative prices', async () => {
    const res = await request(app)
      .post('/api/orders/validate-checkout')
      .send({
        items: [{ productId: testProduct._id, variantSku: testVariant.sku, quantity: 3 }],
        couponCode: 'FIRST50',
        shippingPincode: '560001'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const summary = res.body.summary;
    expect(summary.subtotal).toBe(testVariant.sellingPrice * 3);
    expect(summary.discountAmount).toBe(50);
    expect(summary.totalAmount).toBe(summary.subtotal - 50 + summary.deliveryFee);
  });

  test('POST /api/orders - Creates order and atomically reserves inventory', async () => {
    const initialItem = await InventoryItem.findOne({ sku: testVariant.sku });
    const initialReserved = initialItem.reservedStock;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: testProduct._id, variantSku: testVariant.sku, quantity: 1 }],
        shippingAddress: {
          fullName: 'Priya Iyer',
          phone: '+919876543215',
          addressLine1: 'Flat 402, Lotus Orchid Apartments',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        },
        paymentMethod: 'cod'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderNumber).toBeDefined();

    // Verify database reservedStock incremented atomically
    const afterItem = await InventoryItem.findOne({ sku: testVariant.sku });
    expect(afterItem.reservedStock).toBe(initialReserved + 1);
  });

  test('Concurrency Test: Prevents overselling when two requests compete for last unit', async () => {
    // Create an isolated test SKU with exactly 1 available stock
    const concurrencySku = `CONCUR-TEST-${Date.now()}`;
    const testInvItem = await InventoryItem.create({
      sku: concurrencySku,
      name: 'Concurrency Test Item',
      type: 'finished_goods',
      unit: 'packet',
      physicalStock: 1,
      reservedStock: 0,
      costPerUnit: 50
    });

    // Add variant to testProduct
    testProduct.variants.push({
      sku: concurrencySku,
      packSize: '100g',
      weightGrams: 100,
      flavor: 'Concurrency Flavour',
      mrp: 150,
      sellingPrice: 120,
      isActive: true
    });
    await testProduct.save();

    const orderPayload = {
      items: [{ productId: testProduct._id, variantSku: concurrencySku, quantity: 1 }],
      shippingAddress: {
        fullName: 'Priya Iyer',
        phone: '+919876543215',
        addressLine1: 'Test Address',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentMethod: 'cod'
    };

    // Fire 2 simultaneous order creation requests concurrently
    const [res1, res2] = await Promise.all([
      request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`).send(orderPayload),
      request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`).send(orderPayload)
    ]);

    const successCount = (res1.statusCode === 201 ? 1 : 0) + (res2.statusCode === 201 ? 1 : 0);
    const failureCount = (res1.statusCode !== 201 ? 1 : 0) + (res2.statusCode !== 201 ? 1 : 0);

    // Exactly one must succeed, and exactly one must fail with insufficient stock
    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    // Verify physicalStock and reservedStock in DB never became negative or oversubscribed
    const finalItem = await InventoryItem.findOne({ sku: concurrencySku });
    expect(finalItem.physicalStock).toBe(1);
    expect(finalItem.reservedStock).toBe(1);
    expect(finalItem.availableStock).toBe(0);
  });

  test('POST /api/orders/:id/cancel - Releases reserved stock exactly once', async () => {
    // Create an order to cancel
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: testProduct._id, variantSku: testVariant.sku, quantity: 2 }],
        shippingAddress: {
          fullName: 'Priya Iyer',
          phone: '+919876543215',
          addressLine1: 'Cancellation Test Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        },
        paymentMethod: 'cod'
      });

    expect(orderRes.statusCode).toBe(201);
    const orderId = orderRes.body.order._id;

    const beforeItem = await InventoryItem.findOne({ sku: testVariant.sku });
    const reservedBefore = beforeItem.reservedStock;

    // Cancel order
    const cancelRes = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Found alternative' });

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.order.orderStatus).toBe('cancelled');

    const afterItem = await InventoryItem.findOne({ sku: testVariant.sku });
    expect(afterItem.reservedStock).toBe(reservedBefore - 2);

    // Attempt second cancellation: should reject or safely avoid double releasing
    const secondCancel = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Duplicate cancel' });

    expect(secondCancel.statusCode).toBe(400); // Cannot cancel in 'cancelled' status
    const itemAfterSecond = await InventoryItem.findOne({ sku: testVariant.sku });
    expect(itemAfterSecond.reservedStock).toBe(afterItem.reservedStock); // Unchanged!
  });
});
