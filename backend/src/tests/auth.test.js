import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

describe('Authentication, Security & RBAC Test Suite', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }
  }, 60000);

  const testEmail = `test_cust_${Date.now()}@zuno.com`;
  let customerToken = '';
  let superAdminToken = '';

  test('POST /api/auth/register - Should register a new customer and strictly force customer role', async () => {
    // Attempt privilege escalation by passing role: 'super_admin'
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Automated Test Customer',
        email: testEmail,
        password: 'Password@123',
        phone: '+919999888800',
        role: 'super_admin'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    // Must be assigned customer role, ignoring the attempted elevation
    expect(res.body.user.role).toBe(ROLES.CUSTOMER);

    customerToken = res.body.token;

    // Verify password is encrypted with bcrypt
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

  test('POST /api/auth/staff - Customer must be forbidden from creating staff accounts (403)', async () => {
    const res = await request(app)
      .post('/api/auth/staff')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Malicious Staff',
        email: 'malicious@zuno.com',
        password: 'Password@123',
        role: ROLES.ADMIN
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/auth/staff - Super Admin can create staff accounts with designated roles', async () => {
    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'superadmin@zuno.com',
        password: 'Password@123'
      });

    expect(superAdminLogin.statusCode).toBe(200);
    superAdminToken = superAdminLogin.body.token;

    const newStaffEmail = `staff_inv_${Date.now()}@zuno.com`;
    const res = await request(app)
      .post('/api/auth/staff')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Test Inventory Manager',
        email: newStaffEmail,
        password: 'Password@123',
        phone: '+919988776655',
        role: ROLES.INVENTORY_MANAGER
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe(ROLES.INVENTORY_MANAGER);
  });
});
