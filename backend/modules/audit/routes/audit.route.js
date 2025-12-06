import express from 'express';
import { protectedRoute, adminRoute } from '../../../middlewares/authJwt.js';
import { adminListAudits, exportAuditsCsv } from '../controllers/audit.controller.js';

const auditRouter = express.Router();

auditRouter.get('/admin', protectedRoute, adminRoute, adminListAudits);
auditRouter.get('/admin/export', protectedRoute, adminRoute, exportAuditsCsv);

export default (app) => {
  app.use('/api/audits', auditRouter);
};
