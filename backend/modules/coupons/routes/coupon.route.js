import express from "express";
import * as CouponController from "../controllers/coupon.controller.js";
import { protectedRoute } from "../../../middlewares/authJwt.js";

const CouponRouter = express.Router();

CouponRouter.get("/", protectedRoute, CouponController.getCoupon);
CouponRouter.post(
  "/validate-coupon",
  protectedRoute,
  CouponController.validateCoupon
);

export default (app) => {
  app.use("/api/coupons", CouponRouter);
};
