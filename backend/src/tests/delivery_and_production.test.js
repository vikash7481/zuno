import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Recipe from '../models/Recipe.js';
import ProductionBatch from '../models/ProductionBatch.js';
import InventoryItem from '../models/InventoryItem.js';
import Order from '../models/Order.js';

describe('Delivery Partner & Production Engine Tests', () => {
  let adminToken = '';
  let partnerToken = '';
  let partnerId = '';

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@zuno.com', password: 'Password@123' });
    adminToken = adminLogin.body.token;

    const partnerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@zuno.com', password: 'Password@123' });
    partnerToken = partnerLogin.body.token;
    partnerId = partnerLogin.body.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Delivery Workflow: Admin assigns partner, Partner updates status and delivers with OTP', async () => {
    // Find an active order or create one
    let order = await Order.findOne({ orderStatus: { $in: ['confirmed', 'ready_for_dispatch'] } });

    if (!order) {
      const allOrders = await Order.find();
      order = allOrders[0];
    }

    // 1. Admin assigns delivery partner
    const assignRes = await request(app)
      .post(`/api/orders/${order._id}/assign-delivery`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ partnerId });

    expect(assignRes.statusCode).toBe(200);
    expect(assignRes.body.order.orderStatus).toBe('assigned');
    const assignmentId = assignRes.body.assignment._id;

    // 2. Partner views assigned deliveries
    const partnerAssignmentsRes = await request(app)
      .get('/api/delivery/assignments?status=active')
      .set('Authorization', `Bearer ${partnerToken}`);

    expect(partnerAssignmentsRes.statusCode).toBe(200);
    expect(partnerAssignmentsRes.body.assignments.length).toBeGreaterThan(0);

    // 3. Partner marks picked up
    const pickUpRes = await request(app)
      .post(`/api/delivery/assignments/${assignmentId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'picked_up' });

    expect(pickUpRes.statusCode).toBe(200);
    expect(pickUpRes.body.order.orderStatus).toBe('picked_up');

    // 4. Partner tries to deliver with WRONG OTP -> should reject
    const wrongOtpRes = await request(app)
      .post(`/api/delivery/assignments/${assignmentId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'delivered', otpCode: '9999' });

    expect(wrongOtpRes.statusCode).toBe(400);
    expect(wrongOtpRes.body.message).toContain('Invalid delivery OTP');

    // 5. Partner delivers with correct OTP
    const correctOtp = assignRes.body.order.deliveryOtp;
    const deliverRes = await request(app)
      .post(`/api/delivery/assignments/${assignmentId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'delivered', otpCode: correctOtp, notes: 'Handed directly to resident' });

    expect(deliverRes.statusCode).toBe(200);
    expect(deliverRes.body.order.orderStatus).toBe('delivered');
  });

  test('Production Workflow: Plan batch, issue materials, complete with quality check', async () => {
    const recipe = await Recipe.findOne({ isActive: true });
    expect(recipe).toBeDefined();

    // 1. Plan production batch
    const planRes = await request(app)
      .post('/api/production/batches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        recipeId: recipe._id,
        plannedOutputUnits: 50
      });

    expect(planRes.statusCode).toBe(201);
    expect(planRes.body.batch.status).toBe('planned');
    const batchId = planRes.body.batch._id;

    // 2. Issue raw materials from warehouse
    const issueRes = await request(app)
      .post(`/api/production/batches/${batchId}/issue-materials`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(issueRes.statusCode).toBe(200);
    expect(issueRes.body.batch.status).toBe('materials_issued');

    // 3. Finalize batch after quality check
    const completeRes = await request(app)
      .post(`/api/production/batches/${batchId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        actualOutputUnits: 48,
        processingLossQty: 0.2,
        qualityStatus: 'passed',
        inspectionNotes: 'Crisp, perfectly seasoned, moisture < 2.3%'
      });

    expect(completeRes.statusCode).toBe(200);
    expect(completeRes.body.batch.status).toBe('completed');
    expect(completeRes.body.batch.finishedBatchNumber).toBeDefined();
  });
});
