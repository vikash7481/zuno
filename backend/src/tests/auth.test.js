import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';

describe('Authentication & RBAC Test Suite', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const testEmail = `test_${Date.now()}@zuno.com`;
  let customerToken = '';
  let adminToken = '';

  test('POST /api/auth/register - Should register a new customer with hashed password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Automated Test Customer',
        email: testEmail,
        password: 'Password@123',
        phone: '+919999888800'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('customer');

    customerToken = res.body.token;

    // Verify password is not saved in plaintext
    const dbUser = await User.findOne({ email: testEmail });
    expect(dbUser.password).not.toBe('Password@123');
    expect(dbUser.password.startsWith('$2')).toBe(true);
  });

  test('POST /api/auth/login - Should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Password@123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login - Should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/reports/overview - Customer token should be rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/reports/overview')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  test('GET /api/reports/overview - Admin token should access successfully', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'superadmin@zuno.com',
        password: 'Password@123'
      });

    expect(loginRes.statusCode).toBe(200);
    adminToken = loginRes.body.token;

    const res = await request(app)
      .get('/api/reports/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.overview.financials).toBeDefined();
  });
});
