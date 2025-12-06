import express from 'express';
import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import db from '../config/database.config.js';
import { logAudit, adminListAudits } from '../modules/audit/controllers/audit.controller.js';

const AuditLog = db.model.AuditLog;

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

describe('Audit logging', () => {
  it('logAudit writes an audit record', async () => {
    const req = {
      user: { _id: 'u1', role: 'admin' },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'vitest', 'x-correlation-id': 'cid-1' },
    };
    const spy = vi.spyOn(AuditLog, 'create').mockResolvedValue({ _id: 'a1' });
    await logAudit({
      req,
      action: 'test.action',
      resourceType: 'Thing',
      resourceId: 't1',
      before: { a: 1 },
      after: { a: 2 },
      metadata: { note: 'ok' },
    });
    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    expect(arg.action).toBe('test.action');
    expect(arg.resourceType).toBe('Thing');
  });

  it('adminListAudits returns paginated results', async () => {
    const app = makeApp();
    app.get('/api/audits/admin', injectUser({ role: 'admin', _id: 'a1' }), adminListAudits);

    vi.spyOn(AuditLog, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ _id: 'ax', action: 'x' }]),
    });
    vi.spyOn(AuditLog, 'countDocuments').mockResolvedValue(1);

    const res = await request(app).get('/api/audits/admin');
    expect(res.status).toBe(200);
    expect(res.body?.data?.data?.length || res.body?.data?.data?.length === 0).toBeTruthy();
  });
});
