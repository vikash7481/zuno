import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Theme from '../models/Theme.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import { ROLES } from '../config/constants.js';

describe('Zuno Theme Studio & Festive Header Backend Suite', () => {
  let adminToken = '';
  let customerToken = '';

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    // Login as admin for protected mutations
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@zuno.com', password: 'Password@123' });

    if (adminRes.statusCode === 200 && adminRes.body.token) {
      adminToken = adminRes.body.token;
    } else {
      // Fallback create admin
      const admin = await User.findOneAndUpdate(
        { email: 'theme_test_admin@zuno.com' },
        { name: 'Theme Admin', role: ROLES.ADMIN, password: 'Password@123' },
        { upsert: true, new: true }
      );
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'theme_test_admin@zuno.com', password: 'Password@123' });
      adminToken = loginRes.body.token;
    }

    // Customer token
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Theme Customer',
        email: `theme_cust_${Date.now()}@zuno.com`,
        password: 'Password@123'
      });
    customerToken = custRes.body.token;
  }, 60000);

  afterAll(async () => {
    // Clean up test themes created during test
    await Theme.deleteMany({ slug: /test-suite-/ });
  });

  test('GET /api/themes/active - Public customer header endpoint returns eligible theme', async () => {
    const res = await request(app).get('/api/themes/active');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.theme).toBeDefined();
    expect(res.body.theme.name).toBeDefined();
    expect(res.body.serverTime).toBeDefined();
  });

  test('GET /api/coupons/active - Returns currently eligible promotional coupons for header strip', async () => {
    // Create an active test coupon
    await Coupon.findOneAndUpdate(
      { code: 'FESTIVE25' },
      {
        description: '25% off festive roasted makhana',
        discountType: 'percentage',
        discountValue: 25,
        minOrderValue: 299,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 86400000),
        isActive: true
      },
      { upsert: true, new: true }
    );

    const res = await request(app).get('/api/coupons/active');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.coupons)).toBe(true);
    const hasFestive = res.body.coupons.some(c => c.code === 'FESTIVE25');
    expect(hasFestive).toBe(true);
  });

  test('POST /api/themes - RBAC blocks unauthenticated or customer attempts', async () => {
    const payload = {
      name: 'Unauthorized Theme',
      slug: 'test-suite-unauth',
      occasion: 'diwali'
    };

    const unauthRes = await request(app).post('/api/themes').send(payload);
    expect(unauthRes.statusCode).toBe(401);

    const custRes = await request(app)
      .post('/api/themes')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);
    expect(custRes.statusCode).toBe(403);
  });

  test('POST /api/themes & Priority Resolution - Higher priority theme activates over lower priority', async () => {
    // Create lower priority theme
    await Theme.create({
      name: 'Test Lower Priority Theme',
      slug: `test-suite-low-${Date.now()}`,
      occasion: 'custom',
      status: 'active',
      priority: 2,
      greeting: 'Lower Priority Greeting'
    });

    // Create high priority theme
    const highTheme = await Theme.create({
      name: 'Test High Priority Theme',
      slug: `test-suite-high-${Date.now()}`,
      occasion: 'diwali',
      status: 'active',
      priority: 99,
      greeting: 'High Priority Diwali Greeting'
    });

    const activeRes = await request(app).get('/api/themes/active');
    expect(activeRes.statusCode).toBe(200);
    expect(activeRes.body.theme.slug).toBe(highTheme.slug);
    expect(activeRes.body.theme.greeting).toBe('High Priority Diwali Greeting');
  });

  test('Scheduling - Scheduled theme in the future is NOT selected as active theme', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days in future
    const endFuture = new Date(Date.now() + 14 * 24 * 3600 * 1000);

    const futureTheme = await Theme.create({
      name: 'Test Future Festive Theme',
      slug: `test-suite-future-${Date.now()}`,
      occasion: 'new_year',
      status: 'scheduled',
      priority: 999, // Highest priority, but start date is in the future
      startDate: futureDate,
      endDate: endFuture
    });

    const activeRes = await request(app).get('/api/themes/active');
    expect(activeRes.statusCode).toBe(200);
    // Should NOT be the future theme
    expect(activeRes.body.theme.slug).not.toBe(futureTheme.slug);
  });
});
