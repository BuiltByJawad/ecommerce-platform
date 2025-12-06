import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String },
    action: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    correlationId: { type: String },
  },
  { timestamps: true }
);

// TTL retention for audit logs (default 365 days)
const auditTtlDays = parseInt(process.env.AUDIT_TTL_DAYS || '365');
if (!Number.isNaN(auditTtlDays) && auditTtlDays > 0) {
  AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: auditTtlDays * 24 * 60 * 60 });
}

// Performance indexes for admin audit views
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AuditLog", AuditLogSchema);
