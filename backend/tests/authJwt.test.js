import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as jwt from 'jsonwebtoken';
// Hoisted by Vitest: replace jsonwebtoken with a mock module exposing both default.verify and named verify
vi.mock('jsonwebtoken', () => {
  const verify = vi.fn();
  return { default: { verify }, verify };
});
import db from '../config/database.config.js';
import {
  protectedRoute,
  adminRoute,
  companyRoute,
  requirePermission,
} from '../middlewares/authJwt.js';

const okHandler = (req, res) => res.status(200).json({ ok: true });

const makeApp = (middlewares = []) => {
  const app = express();
  app.use(express.json());
  app.get('/test', ...middlewares, okHandler);
  return app;
};

describe('RBAC middlewares', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // reset mocked verify between tests
    if (jwt?.default?.verify?.mockReset) jwt.default.verify.mockReset();
    if (jwt?.verify?.mockReset) jwt.verify.mockReset();
  });

  describe('adminRoute', () => {
    it('allows admin', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { role: 'admin' };
        next();
      };
      const app = makeApp([injectUser, adminRoute]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('denies non-admin', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { role: 'company' };
        next();
      };
      const app = makeApp([injectUser, adminRoute]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(403);
    });
  });

  describe('companyRoute', () => {
    it('allows approved vendor', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { role: 'company', vendorStatus: 'approved' };
        next();
      };
      const app = makeApp([injectUser, companyRoute]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
    });

    it('denies non-approved vendor', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { role: 'company', vendorStatus: 'pending' };
        next();
      };
      const app = makeApp([injectUser, companyRoute]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(403);
    });

    it('denies non-company roles', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { role: 'customer' };
        next();
      };
      const app = makeApp([injectUser, companyRoute]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(403);
    });
  });

  describe('requirePermission', () => {
    const PERM = 'MANAGE_COUPONS';
    it('allows when permission present', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { permissions: [PERM] };
        next();
      };
      const app = makeApp([injectUser, requirePermission(PERM)]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
    });

    it('denies when permission missing', async () => {
      const injectUser = (req, _res, next) => {
        req.user = { permissions: [] };
        next();
      };
      const app = makeApp([injectUser, requirePermission(PERM)]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(403);
    });
  });

  describe('protectedRoute (verifyToken)', () => {
    it('401 when no token', async () => {
      const app = makeApp([protectedRoute]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(401);
    });

    it('401 when token expired', async () => {
      const app = makeApp([protectedRoute]);
      (jwt.default.verify).mockImplementation(() => {
        const err = new Error('expired');
        // @ts-ignore
        err.name = 'TokenExpiredError';
        throw err;
      });
      const res = await request(app).get('/test').set('Authorization', 'Bearer abc');
      expect(jwt.default.verify).toHaveBeenCalled();
      expect(res.status).toBe(401);
    });

    it('200 when token valid and user found', async () => {
      const app = makeApp([protectedRoute]);
      (jwt.default.verify).mockReturnValue({ userId: 'u1' });
      const mockUser = { _id: 'u1', role: 'admin', permissions: [] };
      // Mock User.findById().select()
      vi.spyOn(db.model.User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });
      const res = await request(app).get('/test').set('Authorization', 'Bearer valid');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('401 when user not found', async () => {
      const app = makeApp([protectedRoute]);
      (jwt.default.verify).mockReturnValue({ userId: 'uX' });
      vi.spyOn(db.model.User, 'findById').mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
      const res = await request(app).get('/test').set('Authorization', 'Bearer valid');
      expect(res.status).toBe(401);
    });
  });
});
