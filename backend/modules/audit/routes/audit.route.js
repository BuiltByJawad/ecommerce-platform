import express from 'express';
import { protectedRoute, adminRoute } from '../../../middlewares/authJwt.js';
import { adminListAudits, exportAuditsCsv } from '../controllers/audit.controller.js';
import rateLimit from 'express-rate-limit';

const auditRouter = express.Router();

const exportLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
auditRouter.get('/admin', protectedRoute, adminRoute, adminListAudits);
auditRouter.get('/admin/export', exportLimiter, protectedRoute, adminRoute, exportAuditsCsv);

export default (app) => {
  app.use('/api/audits', auditRouter);
};
