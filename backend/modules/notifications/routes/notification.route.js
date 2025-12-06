import express from 'express';
import { protectedRoute } from '../../../middlewares/authJwt.js';
import { listMy, markRead, markAllRead } from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

notificationRouter.get('/my', protectedRoute, listMy);
notificationRouter.patch('/:id/read', protectedRoute, markRead);
notificationRouter.patch('/read-all', protectedRoute, markAllRead);

export default (app) => {
  app.use('/api/notifications', notificationRouter);
};
