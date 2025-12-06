import db from '../../../config/database.config.js';
import errorResponse from '../../../utils/errorResponse.js';
import successResponse from '../../../utils/successResponse.js';
import { v4 as uuidv4 } from 'uuid';

const AuditLog = db.model.AuditLog;

export const logAudit = async ({ req, action, resourceType, resourceId, before, after, metadata }) => {
  try {
    const actor = req?.user?._id || null;
    const actorRole = req?.user?.role || null;
    const ip = req?.ip || (req?.headers?.['x-forwarded-for'] || '').toString();
    const userAgent = req?.headers?.['user-agent'];
    const correlationId = req?.headers?.['x-correlation-id'] || uuidv4();
    await AuditLog.create({
      actor,
      actorRole,
      action,
      resourceType,
      resourceId,
      before,
      after,
      metadata,
      ip,
      userAgent,
      correlationId,
    });
  } catch (_err) {
    // best-effort; do not throw
  }
};

const buildFilter = (q) => {
  const { action, resourceType, actorRole, actor, resourceId, from, to } = q || {};
  const filter = {};
  if (action) filter.action = action;
  if (resourceType) filter.resourceType = resourceType;
  if (actorRole) filter.actorRole = actorRole;
  if (actor) filter.actor = actor;
  if (resourceId) filter.resourceId = resourceId;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  return filter;
};

const toCsv = (rows) => {
  const headers = [
    'createdAt',
    'action',
    'resourceType',
    'resourceId',
    'actor',
    'actorRole',
    'ip',
    'correlationId',
  ];
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
      r.action,
      r.resourceType || '',
      r.resourceId || '',
      r.actor || '',
      r.actorRole || '',
      r.ip || '',
      r.correlationId || '',
    ].map(escape).join(','));
  }
  return lines.join('\n');
};

export const exportAuditsCsv = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const limit = Math.min(parseInt(req.query.limit) || 5000, 20000);
    const rows = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const csv = toCsv(rows || []);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to export audit logs', res);
  }
};

export const adminListAudits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { action, resourceType, actorRole, actor, resourceId } = req.query || {};
    const filter = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (actorRole) filter.actorRole = actorRole;
    if (actor) filter.actor = actor;
    if (resourceId) filter.resourceId = resourceId;

    const [rows, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    return successResponse(200, 'SUCCESS', { data: rows, pagination: { page, limit, total } }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to fetch audit logs', res);
  }
};

export const logClientErrorEvent = async (req, res) => {
  try {
    const { message, name, stack, componentStack, url, userAgent: ua, extra } = req.body || {};
    if (!message) {
      return errorResponse(400, 'ERROR', 'Missing error message', res);
    }
    const trim = (value, max = 2000) =>
      typeof value === 'string' ? value.slice(0, max) : undefined;
    const metadata = {
      source: 'frontend',
      name: name || 'Error',
      message: trim(message, 500),
      stack: trim(stack),
      componentStack: trim(componentStack, 1000),
      url: trim(url, 1000),
      userAgent: trim(ua, 500),
      extra: extra && typeof extra === 'object' ? extra : undefined,
    };
    await logAudit({
      req,
      action: 'CLIENT_ERROR',
      resourceType: 'frontend',
      resourceId: null,
      before: null,
      after: null,
      metadata,
    });
    return successResponse(201, 'SUCCESS', { logged: true }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', 'Failed to log client error', res);
  }
};
