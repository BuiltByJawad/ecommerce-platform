import express from 'express';
import { protectedRoute } from '../../../middlewares/authJwt.js';
import rateLimit from 'express-rate-limit';
import { listMy, markRead, markAllRead, unreadCount } from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

// Rate limits (per IP): adjust as needed
const readLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

notificationRouter.get('/my', readLimiter, protectedRoute, listMy);
notificationRouter.patch('/:id/read', writeLimiter, protectedRoute, markRead);
notificationRouter.patch('/read-all', writeLimiter, protectedRoute, markAllRead);
notificationRouter.get('/unread-count', readLimiter, protectedRoute, unreadCount);

export default (app) => {
  app.use('/api/notifications', notificationRouter);
};
