import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

describe('Role Permission Matrix Enforcement Test Suite', () => {
  let tokens = {};

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    const testAccounts = [
      { role: ROLES.SUPER_ADMIN, email: 'superadmin@zuno.com' },
      { role: ROLES.ADMIN, email: 'admin@zuno.com' },
      { role: ROLES.INVENTORY_MANAGER, email: 'inventory@zuno.com' },
      { role: ROLES.PRODUCTION_MANAGER, email: 'production@zuno.com' },
      { role: ROLES.DELIVERY_PARTNER, email: 'partner@zuno.com' },
      { role: ROLES.CUSTOMER, email: 'customer@zuno.com' }
    ];

    for (const acc of testAccounts) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: acc.email, password: 'Password@123' });
      tokens[acc.role] = res.body.token;
    }
  }, 60000);

  test('Customer: Denied from all administrative and operational endpoints (403)', async () => {
    const custToken = tokens[ROLES.CUSTOMER];

    const [rep, inv, prod, del] = await Promise.all([
      request(app).get('/api/reports/overview').set('Authorization', `Bearer ${custToken}`),
      request(app).get('/api/inventory/items').set('Authorization', `Bearer ${custToken}`),
      request(app).get('/api/production/batches').set('Authorization', `Bearer ${custToken}`),
      request(app).get('/api/delivery/assignments').set('Authorization', `Bearer ${custToken}`)
    ]);

    expect(rep.statusCode).toBe(403);
    expect(inv.statusCode).toBe(403);
    expect(prod.statusCode).toBe(403);
    expect(del.statusCode).toBe(403);
  });

  test('Delivery Partner: Accesses only delivery assignments; denied from inventory & reports (403)', async () => {
    const delToken = tokens[ROLES.DELIVERY_PARTNER];

    const delRes = await request(app).get('/api/delivery/assignments').set('Authorization', `Bearer ${delToken}`);
    expect(delRes.statusCode).toBe(200);

    const [inv, prod, rep] = await Promise.all([
      request(app).get('/api/inventory/items').set('Authorization', `Bearer ${delToken}`),
      request(app).get('/api/production/batches').set('Authorization', `Bearer ${delToken}`),
      request(app).get('/api/reports/overview').set('Authorization', `Bearer ${delToken}`)
    ]);

    expect(inv.statusCode).toBe(403);
    expect(prod.statusCode).toBe(403);
    expect(rep.statusCode).toBe(403);
  });

  test('Inventory Manager: Accesses inventory items; denied from executive reports & staff creation (403)', async () => {
    const invToken = tokens[ROLES.INVENTORY_MANAGER];

    const invRes = await request(app).get('/api/inventory/items').set('Authorization', `Bearer ${invToken}`);
    expect(invRes.statusCode).toBe(200);

    const [repRes, staffRes] = await Promise.all([
      request(app).get('/api/reports/overview').set('Authorization', `Bearer ${invToken}`),
      request(app).post('/api/auth/staff').set('Authorization', `Bearer ${invToken}`).send({ name: 'Fail', email: 'fail@zuno.com', password: 'Password@123', role: 'admin' })
    ]);

    expect(repRes.statusCode).toBe(403);
    expect(staffRes.statusCode).toBe(403);
  });

  test('Production Manager: Accesses production batches; denied from executive reports & staff creation (403)', async () => {
    const prodToken = tokens[ROLES.PRODUCTION_MANAGER];

    const prodRes = await request(app).get('/api/production/batches').set('Authorization', `Bearer ${prodToken}`);
    expect(prodRes.statusCode).toBe(200);

    const [repRes, staffRes] = await Promise.all([
      request(app).get('/api/reports/overview').set('Authorization', `Bearer ${prodToken}`),
      request(app).post('/api/auth/staff').set('Authorization', `Bearer ${prodToken}`).send({ name: 'Fail', email: 'fail@zuno.com', password: 'Password@123', role: 'admin' })
    ]);

    expect(repRes.statusCode).toBe(403);
    expect(staffRes.statusCode).toBe(403);
  });

  test('Admin: Accesses operations and reports; but staff creation is reserved for Super Admin (403)', async () => {
    const adminToken = tokens[ROLES.ADMIN];

    const repRes = await request(app).get('/api/reports/overview').set('Authorization', `Bearer ${adminToken}`);
    expect(repRes.statusCode).toBe(200);

    // Creating staff is strictly reserved for Super Admin
    const staffRes = await request(app)
      .post('/api/auth/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Unauthorized Staff By Admin',
        email: `unauth_${Date.now()}@zuno.com`,
        password: 'Password@123',
        role: ROLES.INVENTORY_MANAGER
      });

    expect(staffRes.statusCode).toBe(403);
  });

  test('Super Admin: Universal permission across executive, operational, and staff creation endpoints', async () => {
    const superToken = tokens[ROLES.SUPER_ADMIN];

    const [repRes, invRes, prodRes] = await Promise.all([
      request(app).get('/api/reports/overview').set('Authorization', `Bearer ${superToken}`),
      request(app).get('/api/inventory/items').set('Authorization', `Bearer ${superToken}`),
      request(app).get('/api/production/batches').set('Authorization', `Bearer ${superToken}`)
    ]);

    expect(repRes.statusCode).toBe(200);
    expect(invRes.statusCode).toBe(200);
    expect(prodRes.statusCode).toBe(200);

    // Super Admin can create staff
    const staffRes = await request(app)
      .post('/api/auth/staff')
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        name: 'Permitted Staff by Super Admin',
        email: `permitted_staff_${Date.now()}@zuno.com`,
        password: 'Password@123',
        role: ROLES.DELIVERY_MANAGER
      });

    expect(staffRes.statusCode).toBe(201);
  });
});
