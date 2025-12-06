import express from "express";
import { protectedRoute } from "../../../middlewares/authJwt.js";
import { listProductReviews, createOrUpdateReview } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

// Public: list reviews and summary for a product
reviewRouter.get("/product/:productId", listProductReviews);

// Authenticated: create or update own review for a product
reviewRouter.post("/product/:productId", protectedRoute, createOrUpdateReview);

export default (app) => {
  app.use("/api/reviews", reviewRouter);
};
