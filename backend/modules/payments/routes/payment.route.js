import express from "express";
import * as PaymentController from "../controllers/payment.controller.js";
import { protectedRoute, adminRoute } from "../../../middlewares/authJwt.js";
import rateLimit from "express-rate-limit";

const PaymentRouter = express.Router();

PaymentRouter.post(
  "/create-checkout-session",
  protectedRoute,
  PaymentController.createCheckoutSession
);
PaymentRouter.post(
  "/checkout-success",
  protectedRoute,
  PaymentController.checkoutSuccess
);
PaymentRouter.post(
  "/initiate-ssl-commerz",
  PaymentController.initiateSslCommerzPayment
);
PaymentRouter.post("/payment/success", PaymentController.paymentSuccess);
PaymentRouter.post("/ipn", PaymentController.sslCommerzIpn);
PaymentRouter.post("/payment/cancel", PaymentController.paymentCancel);

export default (app) => {
  app.use("/api/payments", PaymentRouter);
};

// Admin payments listing
PaymentRouter.get(
  "/admin/list",
  protectedRoute,
  adminRoute,
  PaymentController.listPayments
);

// Admin payments CSV export (rate limited)
const exportLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
PaymentRouter.get(
  "/admin/export",
  exportLimiter,
  protectedRoute,
  adminRoute,
  PaymentController.exportPaymentsCsv
);
