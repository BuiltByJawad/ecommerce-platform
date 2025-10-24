import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";

const Coupon = db.model.Coupon;

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
