import express from "express";
import * as taxController from "../controllers/tax.controller.js";
import { protectedRoute, adminRoute, companyRoute, requirePermission } from "../../../middlewares/authJwt.js";

const taxRouter = express.Router();

// Admin
taxRouter.get("/admin", protectedRoute, adminRoute, taxController.getAdminRates);
taxRouter.put("/admin", protectedRoute, adminRoute, taxController.upsertAdminRates);

// Vendor
taxRouter.get("/vendor/mine", protectedRoute, companyRoute, taxController.getVendorRates);

// Reuse MANAGE_PRODUCTS to gate vendor tax updates
taxRouter.put(
  "/vendor/mine",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_PRODUCTS"),
  taxController.upsertVendorRates
);

// Compute tax for a cart
taxRouter.post("/compute", protectedRoute, taxController.computeTax);

export default (app) => {
  app.use("/api/taxes", taxRouter);
};
