import express from "express";
import * as orderDetailsController from "../controllers/orderDetail.controller.js";
import rateLimit from "express-rate-limit";

import {
  adminRoute,
  companyRoute,
  protectedRoute,
  requirePermission,
} from "../../../middlewares/authJwt.js";

const orderDetailsRouter = express.Router();

orderDetailsRouter.post("/create", orderDetailsController.createOrderDetails);
orderDetailsRouter.get("/findall", orderDetailsController.findAllOrderDetails);
const exportLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
orderDetailsRouter.get(
  "/admin/export",
  exportLimiter,
  protectedRoute,
  adminRoute,
  orderDetailsController.exportOrdersCsv
);
orderDetailsRouter.get("/:id", orderDetailsController.findOneOrderDetails);
orderDetailsRouter.get("/my", protectedRoute, orderDetailsController.getMyOrders);
orderDetailsRouter.get(
  "/vendor/my",
  protectedRoute,
  companyRoute,
  requirePermission("VIEW_VENDOR_ORDERS"),
  orderDetailsController.getVendorOrders
);
orderDetailsRouter.post(
  "/update-status/:orderId",
  orderDetailsController.updateOrderDetails
);
export default (app) => {
  app.use("/api/order-details", orderDetailsRouter);
};
