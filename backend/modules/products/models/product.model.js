import mongoose from "mongoose";
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    category_name: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      required: false,
      min: [0, "Original Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    brand: {
      type: String,
      required: true,
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (value) {
          if (!value || value.size === 0) return false;
          for (const val of value.values()) {
            if (Array.isArray(val)) {
              if (!val.every((item) => typeof item === "string")) return false;
            } else if (typeof val !== "string") {
              return false;
            }
          }
          return true;
        },
        message:
          "Attributes must be a non-empty map with string or string array values",
      },
    },
    features: {
      type: [String],
      required: true,
    },
    imageUrls: {
      type: [String],
      required: true,
    },
    isInStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    cloudinaryPublicIds: {
      type: [String],
    },

    // Marketplace fields
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // required for company-created products
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
