import express from "express";
import * as shippingController from "../controllers/shipping.controller.js";
import { protectedRoute, adminRoute, companyRoute, requirePermission } from "../../../middlewares/authJwt.js";

const shippingRouter = express.Router();

// Admin platform default rates
shippingRouter.get("/admin", protectedRoute, adminRoute, shippingController.getAdminRates);
shippingRouter.put("/admin", protectedRoute, adminRoute, shippingController.upsertAdminRates);

// Vendor-specific rates
shippingRouter.get(
  "/vendor/mine",
  protectedRoute,
  companyRoute,
  shippingController.getVendorRates
);
shippingRouter.put(
  "/vendor/mine",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_PRODUCTS"),
  shippingController.upsertVendorRates
);

// Quote shipping for a given country and items (per unique seller)
shippingRouter.post("/quote", protectedRoute, shippingController.computeQuote);

export default (app) => {
  app.use("/api/shipping", shippingRouter);
};
