import express from 'express';
import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import db from '../config/database.config.js';
import { findAllOrderDetails, exportOrdersCsv } from '../modules/orderDetails/controllers/orderDetail.controller.js';

const OrderDetails = db.model.OrderDetails;

const makeAppList = () => {
  const app = express();
  app.use(express.json());
  app.get('/order-details/findall', findAllOrderDetails);
  return app;
};

const makeAppExport = () => {
  const app = express();
  app.use(express.json());
  const injectAdmin = (req, _res, next) => {
    req.user = { role: 'admin', _id: 'a1' };
    next();
  };
  app.get('/order-details/admin/export', injectAdmin, exportOrdersCsv);
  return app;
};

const chainFind = (rows) => ({
  sort: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue(rows),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Orders list - filters & pagination', () => {
  it('applies status/email filters and returns paginated data', async () => {
    const app = makeAppList();
    const rows = [
      { _id: 'o1', email: 'foo@example.com', status: 'Pending', orderSummary: { total: 10 } },
      { _id: 'o2', email: 'foo@example.com', status: 'Pending', orderSummary: { total: 20 } },
    ];
    let receivedFilter = null;
    vi.spyOn(OrderDetails, 'find').mockImplementation((arg) => {
      receivedFilter = arg;
      return chainFind(rows);
    });
    vi.spyOn(OrderDetails, 'countDocuments').mockResolvedValue(2);

    const res = await request(app)
      .get('/order-details/findall')
      .query({ status: 'Pending', email: 'foo', page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body?.data?.data?.length).toBe(2);
    expect(res.body?.data?.pagination?.total).toBe(2);
    expect(receivedFilter).toMatchObject({ status: 'Pending' });
    expect(receivedFilter?.email?.$regex).toBeDefined();
  });

  it('supports date range filter and pagination', async () => {
    const app = makeAppList();
    const rows = [{ _id: 'o3', email: 'bar@example.com', status: 'Complete', orderSummary: { total: 30 } }];
    vi.spyOn(OrderDetails, 'find').mockReturnValue(chainFind(rows));
    vi.spyOn(OrderDetails, 'countDocuments').mockResolvedValue(3);
    const res = await request(app)
      .get('/order-details/findall')
      .query({ from: '2025-01-01', to: '2025-12-31', page: 2, limit: 1 });
    expect(res.status).toBe(200);
    expect(res.body?.data?.data?.length).toBe(1);
    expect(res.body?.data?.pagination?.total).toBe(3);
  });
});

describe('Orders CSV export', () => {
  it('returns CSV with expected columns and data', async () => {
    const app = makeAppExport();
    const exportRows = [
      {
        _id: 'o9',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: '123 Main',
        city: 'NYC',
        country: 'US',
        orderSummary: { itemsSubtotal: 80, shipping: 10, discount: 0, tax: 5, total: 95 },
        status: 'Pending',
        paymentMethod: 'card',
        transactionId: 'txn1',
      },
    ];
    vi.spyOn(OrderDetails, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(exportRows),
    });

    const res = await request(app)
      .get('/order-details/admin/export')
      .query({ status: 'Pending', limit: 1000 });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    const text = res.text;
    expect(text.split('\n')[0]).toContain('itemsSubtotal');
    expect(text).toContain('john@example.com');
    expect(text).toContain('95');
  });
});
