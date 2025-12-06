import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reviewerName: { type: String },
  },
  {
    collection: "reviews",
    timestamps: true,
  }
);

ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
