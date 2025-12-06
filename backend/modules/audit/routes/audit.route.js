import express from 'express';
import { protectedRoute, adminRoute } from '../../../middlewares/authJwt.js';
import { adminListAudits, exportAuditsCsv, logClientErrorEvent } from '../controllers/audit.controller.js';
import rateLimit from 'express-rate-limit';

const auditRouter = express.Router();

const exportLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const clientErrorLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

auditRouter.get('/admin', protectedRoute, adminRoute, adminListAudits);
auditRouter.get('/admin/export', exportLimiter, protectedRoute, adminRoute, exportAuditsCsv);
auditRouter.post('/client-error', clientErrorLimiter, logClientErrorEvent);

export default (app) => {
  app.use('/api/audits', auditRouter);
};
