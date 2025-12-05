import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    // legacy support
    discount_percentage: { type: Number, min: 0, max: 100 },
    expiration_date: { type: Date },
    isActive: { type: Boolean, default: true },
    // loyalty (optional, legacy single-user coupon). Not unique to allow multiple coupons per user.
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // RBAC-aware fields for multi-vendor
    ownerType: { type: String, enum: ["admin", "vendor", "system"], default: "system" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // when ownerType === 'vendor'
    discount_type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, min: 0 }, // percent or fixed amount depending on discount_type
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountValue: { type: Number },
    usageLimitTotal: { type: Number, default: 0 }, // 0 = unlimited
    usageLimitPerUser: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    stackable: { type: Boolean, default: false },
    // scoping options (future use)
    scope: { type: String, enum: ["global", "vendor", "product", "category"], default: "global" },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  {
    collection: "coupons",
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", CouponSchema);
export default Coupon;
