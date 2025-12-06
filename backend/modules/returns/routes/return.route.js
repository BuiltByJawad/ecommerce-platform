import express from "express";
import * as ReturnController from "../controllers/return.controller.js";
import { protectedRoute, adminRoute, companyRoute, requirePermission } from "../../../middlewares/authJwt.js";

const returnRouter = express.Router();

// Customer
returnRouter.post("/customer", protectedRoute, ReturnController.customerCreateReturn);
returnRouter.get("/customer/my", protectedRoute, ReturnController.customerListReturns);

// Admin
returnRouter.get("/admin", protectedRoute, adminRoute, ReturnController.adminListReturns);
returnRouter.patch("/admin/:id", protectedRoute, adminRoute, ReturnController.adminUpdateReturnStatus);

// Vendor
returnRouter.get(
  "/vendor/my",
  protectedRoute,
  companyRoute,
  requirePermission("VIEW_VENDOR_ORDERS"),
  ReturnController.vendorListReturns
);
returnRouter.patch(
  "/vendor/:id",
  protectedRoute,
  companyRoute,
  requirePermission("VIEW_VENDOR_ORDERS"),
  ReturnController.vendorUpdateReturnStatus
);

export default (app) => {
  app.use("/api/returns", returnRouter);
};
