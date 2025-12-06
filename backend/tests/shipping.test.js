import express from 'express';
import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import db from '../config/database.config.js';
import { computeQuote } from '../modules/shipping/controllers/shipping.controller.js';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/shipping/quote', computeQuote);
  return app;
};

const ShippingSetting = db.model.ShippingSetting;

const mockFindOne = (ret) => {
  return vi.spyOn(ShippingSetting, 'findOne').mockReturnValue({
    lean: vi.fn().mockResolvedValue(ret),
  });
};
const mockFind = (ret) => {
  return vi.spyOn(ShippingSetting, 'find').mockReturnValue({
    lean: vi.fn().mockResolvedValue(ret),
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /shipping/quote', () => {
  it('uses vendor override when available; admin fallback otherwise', async () => {
    const app = makeApp();
    // Admin rate for BD is 10
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'BD', rate: 10 }] });
    // Vendor v1 has BD:7, v2 no rate
    mockFind([
      { ownerType: 'vendor', owner: 'v1', rates: [{ country: 'BD', rate: 7 }] },
      { ownerType: 'vendor', owner: 'v2', rates: [] },
    ]);

    const body = {
      country: 'BD',
      items: [
        { seller: 'v1', price: 100, quantity: 1 },
        { seller: 'v2', price: 200, quantity: 2 },
      ],
    };
    const res = await request(app).post('/shipping/quote').send(body);
    expect(res.status).toBe(200);
    // v1 -> 7 (vendor), v2 -> 10 (admin)
    expect(res.body?.data?.totalShipping).toBe(17);
    const per = res.body?.data?.perSeller;
    expect(per).toHaveLength(2);
    const map = new Map(per.map((p) => [String(p.seller), p.rate]));
    expect(map.get('v1')).toBe(7);
    expect(map.get('v2')).toBe(10);
  });

  it('falls back to admin rate when vendor not set', async () => {
    const app = makeApp();
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'US', rate: 12 }] });
    mockFind([]);
    const body = { country: 'US', items: [{ seller: 'v3', price: 100, quantity: 1 }] };
    const res = await request(app).post('/shipping/quote').send(body);
    expect(res.status).toBe(200);
    expect(res.body?.data?.totalShipping).toBe(12);
  });

  it('defaults to 5.0 when neither vendor nor admin has rate', async () => {
    const app = makeApp();
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'CA', rate: 8 }] });
    // Country requested is FR so no admin match; two vendors with no overrides
    mockFind([
      { ownerType: 'vendor', owner: 'v1', rates: [] },
      { ownerType: 'vendor', owner: 'v2', rates: [] },
    ]);
    const body = { country: 'FR', items: [{ seller: 'v1' }, { seller: 'v2' }] };
    const res = await request(app).post('/shipping/quote').send(body);
    expect(res.status).toBe(200);
    // default 5 each = 10
    expect(res.body?.data?.totalShipping).toBe(10);
  });

  it('handles no seller info by returning single fallback rate', async () => {
    const app = makeApp();
    mockFindOne({ ownerType: 'admin', rates: [{ country: 'DE', rate: 9 }] });
    mockFind([]);
    const body = { country: 'DE', items: [{ price: 1, quantity: 1 }] };
    const res = await request(app).post('/shipping/quote').send(body);
    expect(res.status).toBe(200);
    expect(res.body?.data?.totalShipping).toBe(9);
    expect(res.body?.data?.perSeller).toHaveLength(1);
  });

  it('400 when country or items missing', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/shipping/quote').send({ country: 'US' });
    expect(r1.status).toBe(400);
    const r2 = await request(app).post('/shipping/quote').send({ items: [] });
    expect(r2.status).toBe(400);
  });
});
