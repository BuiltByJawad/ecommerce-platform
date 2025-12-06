import express from 'express';
import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import db from '../config/database.config.js';
import { listMy, markRead, markAllRead, unreadCount } from '../modules/notifications/controllers/notification.controller.js';

const Notification = db.model.Notification;

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

describe('Notifications controllers', () => {
  it('listMy returns paginated results', async () => {
    const app = makeApp();
    app.get('/api/notifications/my', injectUser({ _id: 'u1' }), listMy);

    const findMock = vi.spyOn(Notification, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ _id: 'n1', user: 'u1', title: 'a', message: 'b' }]),
    });
    const countMock = vi.spyOn(Notification, 'countDocuments').mockResolvedValue(1);

    const res = await request(app).get('/api/notifications/my');
    expect(res.status).toBe(200);
    expect(res.body?.data?.data?.length || res.body?.data?.data?.length === 0).toBeTruthy();
    expect(countMock).toHaveBeenCalled();
    expect(findMock).toHaveBeenCalled();
  });

  it('markRead updates a single notification', async () => {
    const app = makeApp();
    app.patch('/api/notifications/:id/read', injectUser({ _id: 'u1' }), markRead);

    vi.spyOn(Notification, 'findOneAndUpdate').mockResolvedValue({ _id: 'n1', user: 'u1', read: true });

    const res = await request(app).patch('/api/notifications/n1/read').send({});
    expect(res.status).toBe(200);
    expect(res.body?.data?.notification?.read).toBe(true);
  });

  it('markAllRead updates many', async () => {
    const app = makeApp();
    app.patch('/api/notifications/read-all', injectUser({ _id: 'u1' }), markAllRead);

    vi.spyOn(Notification, 'updateMany').mockResolvedValue({ acknowledged: true });

    const res = await request(app).patch('/api/notifications/read-all').send({});
    expect(res.status).toBe(200);
  });

  it('unreadCount returns count for authorized user', async () => {
    const app = makeApp();
    app.get('/api/notifications/unread-count', injectUser({ _id: 'u1' }), unreadCount);
    const Notification = db.model.Notification;
    vi.spyOn(Notification, 'countDocuments').mockResolvedValue(5);
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.status).toBe(200);
    expect(res.body?.data?.count).toBe(5);
  });

  it('unreadCount returns 401 when unauthorized', async () => {
    const app = makeApp();
    app.get('/api/notifications/unread-count', unreadCount);
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.status).toBe(401);
  });
});
