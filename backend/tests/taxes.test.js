import express from 'express';
import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import db from '../config/database.config.js';
import { computeTax } from '../modules/taxes/controllers/tax.controller.js';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/taxes/compute', computeTax);
  return app;
};

const TaxSetting = db.model.TaxSetting;

const mockFindOne = (ret) => {
  return vi.spyOn(TaxSetting, 'findOne').mockReturnValue({
    lean: vi.fn().mockResolvedValue(ret),
  });
};
const mockFind = (ret) => {
  return vi.spyOn(TaxSetting, 'find').mockReturnValue({
    lean: vi.fn().mockResolvedValue(ret),
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /taxes/compute', () => {
  it('uses vendor override percent when present, admin otherwise', async () => {
    const app = makeApp();
    // Admin US 8%
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'US', percent: 8 }] });
    // Vendor v1 US 12%, v2 none
    mockFind([
      { ownerType: 'vendor', owner: 'v1', rates: [{ country: 'US', percent: 12 }] },
      { ownerType: 'vendor', owner: 'v2', rates: [] },
    ]);
    const body = {
      country: 'US',
      items: [
        { seller: 'v1', price: 100, quantity: 2 }, // 200 @12% = 24
        { seller: 'v2', price: 50, quantity: 3 }, // 150 @8% = 12
      ],
    };
    const res = await request(makeApp()).post('/taxes/compute').send(body);
    expect(res.status).toBe(200);
    expect(Number(res.body?.data?.totalTax)).toBeCloseTo(36, 5);
  });

  it('applies admin percent when no vendor overrides', async () => {
    const app = makeApp();
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'GB', percent: 15 }] });
    mockFind([]);
    const body = { country: 'GB', items: [{ seller: 'x', price: 100, quantity: 2 }] }; // 200 * 15% = 30
    const res = await request(app).post('/taxes/compute').send(body);
    expect(res.status).toBe(200);
    expect(Number(res.body?.data?.totalTax)).toBeCloseTo(30, 5);
  });

  it('reduces taxable base proportionally by discount', async () => {
    const app = makeApp();
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'CA', percent: 10 }] });
    mockFind([]);
    const body = {
      country: 'CA',
      items: [{ price: 20, quantity: 5 }], // subtotal 100
      discount: 20, // effective subtotal 80
    };
    const res = await request(app).post('/taxes/compute').send(body);
    expect(res.status).toBe(200);
    // base tax 10 on 100 -> 10, scaled by 0.8 => 8
    expect(Number(res.body?.data?.totalTax)).toBeCloseTo(8, 5);
  });

  it('returns 0 when no admin or vendor rates found', async () => {
    const app = makeApp();
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'MX', percent: 5 }] });
    mockFind([]);
    const body = { country: 'FR', items: [{ seller: 'a', price: 10, quantity: 1 }] }; // country mismatch
    const res = await request(app).post('/taxes/compute').send(body);
    expect(res.status).toBe(200);
    expect(Number(res.body?.data?.totalTax)).toBe(0);
  });

  it('400 when missing country or items', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/taxes/compute').send({ country: 'US' });
    expect(r1.status).toBe(400);
    const r2 = await request(app).post('/taxes/compute').send({ items: [] });
    expect(r2.status).toBe(400);
  });
});
