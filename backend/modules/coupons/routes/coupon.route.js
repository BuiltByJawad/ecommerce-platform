import express from "express";
import * as CouponController from "../controllers/coupon.controller.js";
import {
  protectedRoute,
  adminRoute,
  companyRoute,
  requirePermission,
} from "../../../middlewares/authJwt.js";

const CouponRouter = express.Router();

// Customer endpoints
CouponRouter.get("/", protectedRoute, CouponController.getCoupon);
CouponRouter.post("/validate-coupon", protectedRoute, CouponController.validateCoupon);
CouponRouter.post("/apply", protectedRoute, CouponController.applyCoupon);

// Admin endpoints
CouponRouter.get(
  "/admin/list",
  protectedRoute,
  adminRoute,
  CouponController.adminListCoupons
);
CouponRouter.post(
  "/admin",
  protectedRoute,
  adminRoute,
  CouponController.adminCreateCoupon
);
CouponRouter.put(
  "/admin/:id",
  protectedRoute,
  adminRoute,
  CouponController.adminUpdateCoupon
);
CouponRouter.patch(
  "/admin/:id/toggle",
  protectedRoute,
  adminRoute,
  CouponController.adminToggleCouponActive
);
CouponRouter.delete(
  "/admin/:id",
  protectedRoute,
  adminRoute,
  CouponController.adminDeleteCoupon
);

// Vendor endpoints
CouponRouter.get(
  "/vendor/mine",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_COUPONS"),
  CouponController.vendorListCoupons
);
CouponRouter.post(
  "/vendor",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_COUPONS"),
  CouponController.vendorCreateCoupon
);
CouponRouter.put(
  "/vendor/:id",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_COUPONS"),
  CouponController.vendorUpdateCoupon
);
CouponRouter.patch(
  "/vendor/:id/toggle",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_COUPONS"),
  CouponController.vendorToggleCouponActive
);
CouponRouter.delete(
  "/vendor/:id",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_COUPONS"),
  CouponController.vendorDeleteCoupon
);

export default (app) => {
  app.use("/api/coupons", CouponRouter);
};
