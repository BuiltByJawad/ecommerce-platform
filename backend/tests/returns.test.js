import express from 'express';
import request from 'supertest';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import db from '../config/database.config.js';
import {
  customerCreateReturn,
  adminUpdateReturnStatus,
  vendorUpdateReturnStatus,
} from '../modules/returns/controllers/return.controller.js';
import { companyRoute, requirePermission } from '../middlewares/authJwt.js';
import * as notif from '../modules/notifications/controllers/notification.controller.js';
import * as mailer from '../utils/sendEmail.js';

const ReturnRequest = db.model.ReturnRequest;
const OrderDetails = db.model.OrderDetails;
const Product = db.model.Product;

const makeApp = () => {
  const app = express();
  app.use(express.json());
  return app;
};

const injectUser = (user) => (req, _res, next) => {
  req.user = user;
  next();
};

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  // Best-effort async side-effects: speed up tests by stubbing
  vi.spyOn(notif, 'createNotification').mockResolvedValue(null);
  vi.spyOn(mailer, 'sendEmailSimple').mockResolvedValue();
  // DB lookups used by notifications hooks
  vi.spyOn(db.model.User, 'findOne').mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
  });
  vi.spyOn(db.model.User, 'find').mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
  });
  // AuditLog create to avoid mongoose DB calls in tests
  vi.spyOn(db.model.AuditLog, 'create').mockResolvedValue({ _id: 'ax' });
});

describe('Returns: customer create', () => {
  it('creates a return when payload valid and order belongs to customer', async () => {
    const app = makeApp();
    app.post('/returns/customer', injectUser({ email: 'c@example.com', _id: 'c1' }), customerCreateReturn);

    vi.spyOn(OrderDetails, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue({
      _id: 'o1',
      email: 'c@example.com',
      orderItems: [{ productId: 'p1', quantity: 2 }],
    }) });
    vi.spyOn(Product, 'findById').mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: 'p1', name: 'Prod1', seller: 'v1' }) }) });
    const created = { _id: 'r1', status: 'Requested' };
    vi.spyOn(ReturnRequest, 'create').mockResolvedValue(created);

    const body = { orderId: 'o1', items: [{ productId: 'p1', quantity: 1, reason: 'defect' }], notes: 'pls' };
    const res = await request(app).post('/returns/customer').send(body);
    expect(res.status).toBe(201);
    expect(res.body?.data?.request?._id).toBe('r1');
  });

  it('403 when order does not belong to customer email', async () => {
    const app = makeApp();
    app.post('/returns/customer', injectUser({ email: 'other@example.com', _id: 'c1' }), customerCreateReturn);
    vi.spyOn(OrderDetails, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: 'o1', email: 'c@example.com', orderItems: [] }) });
    const res = await request(app).post('/returns/customer').send({ orderId: 'o1', items: [{ productId: 'p1', quantity: 1 }] });
    expect(res.status).toBe(403);
  });

  it('404 when order not found', async () => {
    const app = makeApp();
    app.post('/returns/customer', injectUser({ email: 'c@example.com', _id: 'c1' }), customerCreateReturn);
    vi.spyOn(OrderDetails, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
    const res = await request(app).post('/returns/customer').send({ orderId: 'missing', items: [{ productId: 'p1', quantity: 1 }] });
    expect(res.status).toBe(404);
  });

  it('400 when requested quantity exceeds ordered', async () => {
    const app = makeApp();
    app.post('/returns/customer', injectUser({ email: 'c@example.com', _id: 'c1' }), customerCreateReturn);
    vi.spyOn(OrderDetails, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue({
      _id: 'o1', email: 'c@example.com', orderItems: [{ productId: 'p1', quantity: 1 }],
    }) });
    const res = await request(app).post('/returns/customer').send({ orderId: 'o1', items: [{ productId: 'p1', quantity: 2 }] });
    expect(res.status).toBe(400);
  });
});

describe('Returns: admin update status', () => {
  it('400 on invalid status', async () => {
    const app = makeApp();
    app.patch('/returns/admin/:id', injectUser({ role: 'admin', _id: 'a1' }), adminUpdateReturnStatus);
    const res = await request(app).patch('/returns/admin/r1').send({ status: 'Bad' });
    expect(res.status).toBe(400);
  });

  it('404 when return not found', async () => {
    const app = makeApp();
    app.patch('/returns/admin/:id', injectUser({ role: 'admin', _id: 'a1' }), adminUpdateReturnStatus);
    vi.spyOn(ReturnRequest, 'findByIdAndUpdate').mockResolvedValue(null);
    const res = await request(app).patch('/returns/admin/r1').send({ status: 'Approved' });
    expect(res.status).toBe(404);
  });

  it('200 on success', async () => {
    const app = makeApp();
    app.patch('/returns/admin/:id', injectUser({ role: 'admin', _id: 'a1' }), adminUpdateReturnStatus);
    const updated = { _id: 'r1', status: 'Approved' };
    vi.spyOn(ReturnRequest, 'findByIdAndUpdate').mockResolvedValue(updated);
    const res = await request(app).patch('/returns/admin/r1').send({ status: 'Approved', note: 'ok' });
    expect(res.status).toBe(200);
    expect(res.body?.data?.request?.status).toBe('Approved');
  });
});

describe('Returns: vendor update status', () => {
  it('403 when items include other vendors products', async () => {
    const app = makeApp();
    app.patch('/returns/vendor/:id', injectUser({ role: 'company', _id: 'v1' }), vendorUpdateReturnStatus);
    vi.spyOn(ReturnRequest, 'findById').mockResolvedValue({ _id: 'r1', items: [{ seller: 'v1' }, { seller: 'v2' }] });
    const res = await request(app).patch('/returns/vendor/r1').send({ status: 'Approved' });
    expect(res.status).toBe(403);
  });

  it('200 when vendor owns all items and status updated', async () => {
    const app = makeApp();
    app.patch('/returns/vendor/:id', injectUser({ role: 'company', _id: 'v1' }), vendorUpdateReturnStatus);
    const doc = { _id: 'r1', status: 'Requested', items: [{ seller: 'v1' }], history: [], save: vi.fn().mockResolvedValue(true) };
    vi.spyOn(ReturnRequest, 'findById').mockResolvedValue(doc);
    const res = await request(app).patch('/returns/vendor/r1').send({ status: 'Approved', note: 'ok' });
    expect(res.status).toBe(200);
    expect(doc.status).toBe('Approved');
    expect(doc.save).toHaveBeenCalled();
  });

  it('RBAC: 403 when missing VIEW_VENDOR_ORDERS permission', async () => {
    const app = makeApp();
    app.patch(
      '/returns/vendor/:id',
      injectUser({ role: 'company', _id: 'v1', vendorStatus: 'approved', permissions: [] }),
      companyRoute,
      requirePermission('VIEW_VENDOR_ORDERS'),
      // Will never reach controller because of requirePermission
      vendorUpdateReturnStatus
    );
    const res = await request(app).patch('/returns/vendor/abc').send({ status: 'Approved' });
    expect(res.status).toBe(403);
  });
});
