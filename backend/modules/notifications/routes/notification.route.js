import express from 'express';
import { protectedRoute } from '../../../middlewares/authJwt.js';
import { listMy, markRead, markAllRead, unreadCount } from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

notificationRouter.get('/my', protectedRoute, listMy);
notificationRouter.patch('/:id/read', protectedRoute, markRead);
notificationRouter.patch('/read-all', protectedRoute, markAllRead);
notificationRouter.get('/unread-count', protectedRoute, unreadCount);

export default (app) => {
  app.use('/api/notifications', notificationRouter);
};
