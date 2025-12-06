import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "general" },
    metadata: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL for notifications (default 90 days)
const ttlDays = parseInt(process.env.NOTIFICATION_TTL_DAYS || '90');
if (!Number.isNaN(ttlDays) && ttlDays > 0) {
  NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });
}

// Performance compound index for listing unread by user
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
