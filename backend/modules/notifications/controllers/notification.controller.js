import db from '../../../config/database.config.js';
import errorResponse from '../../../utils/errorResponse.js';
import successResponse from '../../../utils/successResponse.js';
import { emitToUser } from '../../../lib/io.js';

const Notification = db.model.Notification;

export const listMy = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return errorResponse(401, 'FAILED', 'Unauthorized', res);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: userId }),
    ]);
    return successResponse(200, 'SUCCESS', { data: rows, pagination: { page, limit, total } }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to fetch notifications', res);
  }
};

export const unreadCount = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return errorResponse(401, 'FAILED', 'Unauthorized', res);
    const count = await Notification.countDocuments({ user: userId, read: false });
    return successResponse(200, 'SUCCESS', { count }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to fetch unread count', res);
  }
};

export const markRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return errorResponse(401, 'FAILED', 'Unauthorized', res);
    const doc = await Notification.findOneAndUpdate({ _id: id, user: userId }, { $set: { read: true } }, { new: true });
    if (!doc) return errorResponse(404, 'FAILED', 'Notification not found', res);
    emitToUser(String(userId), 'notifications:updated', { type: 'single', id });
    return successResponse(200, 'SUCCESS', { notification: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to update notification', res);
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return errorResponse(401, 'FAILED', 'Unauthorized', res);
    await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
    emitToUser(String(userId), 'notifications:updated', { type: 'all' });
    return successResponse(200, 'SUCCESS', { updated: true }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to update notifications', res);
  }
};

export const createNotification = async ({ user, title, message, type = 'general', metadata }) => {
  try {
    if (!user || !title || !message) return null;
    const created = await Notification.create({ user, title, message, type, metadata });
    emitToUser(String(user), 'notifications:new', { notification: created });
    return created;
  } catch (_err) {
    // swallow
    return null;
  }
};
