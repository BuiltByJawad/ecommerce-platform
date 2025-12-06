import mongoose from "mongoose";

const ReturnItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, default: "" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const HistorySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    byRole: { type: String, enum: ["customer", "vendor", "admin"], required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const ReturnRequestSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "OrderDetails", required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    items: { type: [ReturnItemSchema], required: true },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Received", "Refunded"],
      default: "Requested",
    },
    notes: { type: String },
    history: { type: [HistorySchema], default: [] },
  },
  { collection: "return_requests", timestamps: true }
);

const ReturnRequest = mongoose.model("ReturnRequest", ReturnRequestSchema);
export default ReturnRequest;
