import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Product from '../models/Product.js';
import InventoryItem from '../models/InventoryItem.js';
import Order from '../models/Order.js';

describe('Inventory Engine, Orders & IDOR Security Tests', () => {
  let customerToken = '';
  let customer2Token = '';
  let testProduct = null;
  let testVariant = null;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    // Login primary test customer
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@zuno.com', password: 'Password@123' });
    customerToken = loginRes.body.token;

    // Register a secondary customer for IDOR testing
    const cust2Email = `cust2_${Date.now()}@zuno.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Secondary Customer',
        email: cust2Email,
        password: 'Password@123',
        phone: '+919876500000'
      });
    customer2Token = regRes.body.token;

    // Fetch existing product
    testProduct = await Product.findOne({ 'variants.sku': 'ZUNO-CL-SALT-100G' });
    if (!testProduct) {
      testProduct = await Product.findOne();
    }
    testVariant = testProduct.variants[0];
  }, 60000);

  test('POST /api/orders/validate-checkout - Server must recalculate authoritative prices', async () => {
    const res = await request(app)
      .post('/api/orders/validate-checkout')
      .send({
        items: [{ productId: testProduct._id, variantSku: testVariant.sku, quantity: 3 }],
        couponCode: 'WELCOME10',
        shippingPincode: '560001'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const summary = res.body.summary;
    expect(summary.subtotal).toBe(testVariant.sellingPrice * 3);
    expect(summary.totalAmount).toBeDefined();
  });

  test('POST /api/orders - Creates order and atomically reserves inventory', async () => {
    const initialItem = await InventoryItem.findOne({ sku: testVariant.sku });
    const initialReserved = initialItem ? initialItem.reservedStock : 0;

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

    if (initialItem) {
      const afterItem = await InventoryItem.findOne({ sku: testVariant.sku });
      expect(afterItem.reservedStock).toBe(initialReserved + 1);
    }
  });

  test('IDOR Protection: Customer B cannot access Customer A order', async () => {
    // 1. Customer A creates an order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: testProduct._id, variantSku: testVariant.sku, quantity: 1 }],
        shippingAddress: {
          fullName: 'Priya Iyer',
          phone: '+919876543215',
          addressLine1: 'Test Address Customer A',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        },
        paymentMethod: 'cod'
      });

    expect(orderRes.statusCode).toBe(201);
    const orderAId = orderRes.body.order._id;

    // 2. Customer B attempts to retrieve Customer A's order by ID
    const unauthorizedRes = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set('Authorization', `Bearer ${customer2Token}`);

    // Must be rejected with 403 Forbidden
    expect(unauthorizedRes.statusCode).toBe(403);
    expect(unauthorizedRes.body.success).toBe(false);

    // 3. Customer B attempts to cancel Customer A's order
    const cancelAttackRes = await request(app)
      .post(`/api/orders/${orderAId}/cancel`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ reason: 'Malicious cancellation' });

    expect(cancelAttackRes.statusCode).toBe(400); // Or 403 / unhandled error caught by error handler
    expect(cancelAttackRes.body.success).toBe(false);
  });

  test('Concurrency Test: Prevents overselling when two requests compete for last unit', async () => {
    const concurrencySku = `CONCUR-TEST-${Date.now()}`;
    await InventoryItem.create({
      sku: concurrencySku,
      name: 'Concurrency Test Item',
      type: 'finished_goods',
      unit: 'packet',
      physicalStock: 1,
      reservedStock: 0,
      costPerUnit: 50
    });

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

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    const finalItem = await InventoryItem.findOne({ sku: concurrencySku });
    expect(finalItem.physicalStock).toBe(1);
    expect(finalItem.reservedStock).toBe(1);
  });

  test('POST /api/orders/:id/cancel - Releases reserved stock exactly once', async () => {
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
    const reservedBefore = beforeItem ? beforeItem.reservedStock : 0;

    const cancelRes = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Found alternative' });

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.order.orderStatus).toBe('cancelled');

    if (beforeItem) {
      const afterItem = await InventoryItem.findOne({ sku: testVariant.sku });
      expect(afterItem.reservedStock).toBe(reservedBefore - 2);
    }
  });
});
