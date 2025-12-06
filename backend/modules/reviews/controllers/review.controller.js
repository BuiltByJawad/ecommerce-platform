import mongoose from "mongoose";
import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { logAudit } from "../../audit/controllers/audit.controller.js";

const Review = db.model.Review;

export const listProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(400, "FAILED", "Invalid product id", res);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [rows, total, summaryAgg] = await Promise.all([
      Review.find({ product: productId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments({ product: productId }),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    let totalRatings = 0;
    let sum = 0;
    const distributionMap = new Map();
    for (const g of summaryAgg) {
      const star = g._id;
      const count = g.count || 0;
      distributionMap.set(star, count);
      totalRatings += count;
      sum += (star || 0) * count;
    }

    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => distributionMap.get(star) || 0);

    return successResponse(
      200,
      "SUCCESS",
      {
        reviews: rows,
        summary: {
          averageRating,
          totalRatings,
          distribution,
        },
        pagination: { page, limit, total },
      },
      res
    );
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch reviews", res);
  }
};

export const createOrUpdateReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;
    if (!userId) return errorResponse(401, "FAILED", "Unauthorized", res);
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(400, "FAILED", "Invalid product id", res);
    }

    const { rating, comment } = req.body || {};
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return errorResponse(400, "FAILED", "Rating must be between 1 and 5", res);
    }
    if (!comment || String(comment).trim().length === 0) {
      return errorResponse(400, "FAILED", "Comment is required", res);
    }

    const reviewerName = [req.user.f_name, req.user.l_name].filter(Boolean).join(" ") || req.user.email;

    const before = await Review.findOne({ product: productId, user: userId }).lean();

    const doc = await Review.findOneAndUpdate(
      { product: productId, user: userId },
      { product: productId, user: userId, rating: numericRating, comment, reviewerName },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logAudit({
      req,
      action: "reviews.upsert",
      resourceType: "Review",
      resourceId: doc?._id,
      before,
      after: doc?.toObject ? doc.toObject() : doc,
      metadata: { product: productId, user: userId },
    });

    return successResponse(201, "SUCCESS", { review: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to submit review", res);
  }
};
