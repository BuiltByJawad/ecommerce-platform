import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";

const Coupon = db.model.Coupon;

// Helper: basic payload validation for coupons
const validateCouponPayload = (payload, isUpdate = false) => {
  const errors = [];
  const { discount_type, value, minOrderValue, maxDiscountValue, validFrom, validTo } = payload || {};

  if (!isUpdate) {
    if (!payload?.code) errors.push("Code is required");
    if (value == null) errors.push("Value is required");
  }

  if (discount_type && !["percent", "fixed"].includes(discount_type)) {
    errors.push("discount_type must be 'percent' or 'fixed'");
  }
  if (value != null) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      errors.push("value must be a non-negative number");
    }
    if ((discount_type || payload?.discount_type) === "percent" && value > 100) {
      errors.push("percent value cannot exceed 100");
    }
  }
  if (minOrderValue != null && (minOrderValue < 0 || Number.isNaN(Number(minOrderValue)))) {
    errors.push("minOrderValue must be >= 0");
  }
  if (maxDiscountValue != null && (maxDiscountValue < 0 || Number.isNaN(Number(maxDiscountValue)))) {
    errors.push("maxDiscountValue must be >= 0");
  }
  if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
    errors.push("validFrom cannot be after validTo");
  }
  return errors;
};

export const createCoupon = async (userId) => {
  const coupon = await Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discount_percentage: 10,
    expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    user_id: userId,
  });
  await coupon.save();
  return coupon;
};

export const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return errorResponse(404, 'FAILED', 'Coupon not found', res);
    return successResponse(200, 'SUCCESS', { deletedId: id }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to delete coupon', res);
  }
};

export const vendorDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findOneAndDelete({ _id: id, seller: req.user._id, ownerType: 'vendor' });
    if (!deleted) return errorResponse(404, 'FAILED', 'Coupon not found', res);
    return successResponse(200, 'SUCCESS', { deletedId: id }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to delete coupon', res);
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, items } = req.body;
    if (!code || !Array.isArray(items)) {
      return errorResponse(400, 'FAILED', 'Code and items are required', res);
    }
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return errorResponse(404, 'FAILED', 'Invalid coupon code', res);

    const now = new Date();
    if ((coupon.validFrom && coupon.validFrom > now) || (coupon.validTo && coupon.validTo < now)) {
      return errorResponse(400, 'FAILED', 'Coupon not currently valid', res);
    }

    // Enforce per-user usage limit
    const OrderDetails = db.model.OrderDetails;
    const userEmail = req.user?.email;
    if (coupon.usageLimitPerUser && userEmail) {
      const usedByUser = await OrderDetails.countDocuments({
        couponCode: code,
        email: userEmail,
        status: { $ne: 'Cancelled' },
      });
      if (usedByUser >= (coupon.usageLimitPerUser || 0)) {
        return errorResponse(400, 'FAILED', 'Coupon usage limit reached for this user', res);
      }
    }

    // Compute eligible subtotal depending on scope/ownerType
    let eligibleSubtotal = 0;
    for (const it of items) {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      const lineTotal = price * qty;
      if (coupon.ownerType === 'vendor') {
        if (String(it.seller) === String(coupon.seller)) {
          eligibleSubtotal += lineTotal;
        }
      } else {
        eligibleSubtotal += lineTotal;
      }
    }

    if (eligibleSubtotal <= 0) {
      return errorResponse(400, 'FAILED', 'Coupon does not apply to these items', res);
    }
    if (coupon.minOrderValue && eligibleSubtotal < coupon.minOrderValue) {
      return errorResponse(400, 'FAILED', 'Order value below minimum for this coupon', res);
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (eligibleSubtotal * (coupon.value || 0)) / 100;
    } else {
      discount = Math.min(coupon.value || 0, eligibleSubtotal);
    }
    if (coupon.maxDiscountValue) {
      discount = Math.min(discount, coupon.maxDiscountValue);
    }

    return successResponse(200, 'SUCCESS', {
      code: coupon.code,
      ownerType: coupon.ownerType,
      seller: coupon.seller,
      discount_type: coupon.discount_type,
      value: coupon.value,
      discount: Number(discount.toFixed(2)),
    }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to apply coupon', res);
  }
};

// Admin: list all coupons with optional filters
export const adminListCoupons = async (req, res) => {
  try {
    const { ownerType, seller, isActive, q, page = 1, pageSize = 20 } = req.query;
    const filter = {};
    if (ownerType) filter.ownerType = ownerType;
    if (seller) filter.seller = seller;
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    if (q) filter.code = { $regex: q, $options: 'i' };
    const p = parseInt(page);
    const ps = parseInt(pageSize);
    const [data, count] = await Promise.all([
      Coupon.find(filter).skip((p - 1) * ps).limit(ps).sort({ createdAt: -1 }),
      Coupon.countDocuments(filter),
    ]);
    return successResponse(200, 'SUCCESS', { data, totalRows: count, page: p, pageSize: ps }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to list coupons', res);
  }
};

// Admin: create a coupon (global or vendor-scoped)
export const adminCreateCoupon = async (req, res) => {
  try {
    const {
      code,
      ownerType = 'admin',
      seller,
      discount_type = 'percent',
      value,
      validFrom,
      validTo,
      minOrderValue = 0,
      maxDiscountValue,
      usageLimitTotal = 0,
      usageLimitPerUser = 0,
      stackable = false,
      scope = 'global',
      productIds = [],
      categoryIds = [],
      isActive = true,
    } = req.body;

    if (!code || !value) {
      return errorResponse(400, 'FAILED', 'Code and value are required', res);
    }
    if (ownerType === 'vendor' && !seller) {
      return errorResponse(400, 'FAILED', 'Seller is required for vendor coupons', res);
    }
    const errors = validateCouponPayload({ discount_type, value, minOrderValue, maxDiscountValue, validFrom, validTo });
    if (errors.length) return errorResponse(400, 'FAILED', errors.join(', '), res);
    const normalizedCode = String(code).toUpperCase();
    const doc = await Coupon.create({
      code: normalizedCode,
      ownerType,
      seller,
      discount_type,
      value,
      validFrom,
      validTo,
      minOrderValue,
      maxDiscountValue,
      usageLimitTotal,
      usageLimitPerUser,
      stackable,
      scope,
      productIds,
      categoryIds,
      isActive,
    });
    return successResponse(201, 'SUCCESS', { coupon: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to create coupon', res);
  }
};

export const adminUpdateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (updates.code) updates.code = String(updates.code).toUpperCase();
    const errors = validateCouponPayload(updates, true);
    if (errors.length) return errorResponse(400, 'FAILED', errors.join(', '), res);
    const doc = await Coupon.findByIdAndUpdate(id, updates, { new: true });
    if (!doc) return errorResponse(404, 'FAILED', 'Coupon not found', res);
    return successResponse(200, 'SUCCESS', { coupon: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to update coupon', res);
  }
};

export const adminToggleCouponActive = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Coupon.findById(id);
    if (!doc) return errorResponse(404, 'FAILED', 'Coupon not found', res);
    doc.isActive = !doc.isActive;
    await doc.save();
    return successResponse(200, 'SUCCESS', { coupon: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to toggle coupon', res);
  }
};

// Vendor: list own coupons
export const vendorListCoupons = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, q, isActive } = req.query;
    const p = parseInt(page);
    const ps = parseInt(pageSize);
    const filter = { ownerType: 'vendor', seller: req.user._id };
    if (q) filter.code = { $regex: q, $options: 'i' };
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    const [data, count] = await Promise.all([
      Coupon.find(filter).skip((p - 1) * ps).limit(ps).sort({ createdAt: -1 }),
      Coupon.countDocuments(filter),
    ]);
    return successResponse(200, 'SUCCESS', { data, totalRows: count, page: p, pageSize: ps }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to list vendor coupons', res);
  }
};

export const vendorCreateCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type = 'percent',
      value,
      validFrom,
      validTo,
      minOrderValue = 0,
      maxDiscountValue,
      usageLimitTotal = 0,
      usageLimitPerUser = 0,
      stackable = false,
      scope = 'global',
      productIds = [],
      categoryIds = [],
      isActive = true,
    } = req.body;
    if (!code || !value) {
      return errorResponse(400, 'FAILED', 'Code and value are required', res);
    }
    const errors = validateCouponPayload({ discount_type, value, minOrderValue, maxDiscountValue, validFrom, validTo });
    if (errors.length) return errorResponse(400, 'FAILED', errors.join(', '), res);
    const normalizedCode = String(code).toUpperCase();
    const doc = await Coupon.create({
      code: normalizedCode,
      ownerType: 'vendor',
      seller: req.user._id,
      discount_type,
      value,
      validFrom,
      validTo,
      minOrderValue,
      maxDiscountValue,
      usageLimitTotal,
      usageLimitPerUser,
      stackable,
      scope,
      productIds,
      categoryIds,
      isActive,
    });
    return successResponse(201, 'SUCCESS', { coupon: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to create vendor coupon', res);
  }
};

export const vendorUpdateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (updates.code) updates.code = String(updates.code).toUpperCase();
    const errors = validateCouponPayload(updates, true);
    if (errors.length) return errorResponse(400, 'FAILED', errors.join(', '), res);
    const doc = await Coupon.findOneAndUpdate(
      { _id: id, seller: req.user._id, ownerType: 'vendor' },
      updates,
      { new: true }
    );
    if (!doc) return errorResponse(404, 'FAILED', 'Coupon not found', res);
    return successResponse(200, 'SUCCESS', { coupon: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to update vendor coupon', res);
  }
};

export const vendorToggleCouponActive = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Coupon.findOne({ _id: id, seller: req.user._id, ownerType: 'vendor' });
    if (!doc) return errorResponse(404, 'FAILED', 'Coupon not found', res);
    doc.isActive = !doc.isActive;
    await doc.save();
    return successResponse(200, 'SUCCESS', { coupon: doc }, res);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to toggle vendor coupon', res);
  }
};

export const getCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.findOne({
      user_id: req.user._id,
      isActive: true,
    });
    successResponse(
      200,
      "SUCCESS",
      {
        coupons,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while getting the coupon",
      res
    );
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      user_id: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return errorResponse(404, "ERROR", "Coupon not found", res);
    }
    if (coupon.expiration_date < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return errorResponse(404, "ERROR", "Coupon expired", res);
    }
    successResponse(
      200,
      "SUCCESS",
      {
        message: "Coupon is valid",
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while validating the coupon",
      res
    );
  }
};
