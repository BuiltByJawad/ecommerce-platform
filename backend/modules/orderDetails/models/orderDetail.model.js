import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [
        true,
        "First name is required",
      ],
      trim: true,
    },
    lastName: {
      type: String,
      required: [
        true,
        "Last name is required",
      ],
      trim: true,
    },
    address: {
      type: String,
      required: [
        true,
        "Street address is required",
      ],
      trim: true,
    },
    city: {
      type: String,
      required: [
        true,
        "Town / City is required",
      ],
      trim: true,
    },
    country: {
      type: String,
      required: [
        true,
        "Country is required",
      ],
      trim: true,
    },
    phone: {
      type: String,
      required: [
        true,
        "Phone number is required",
      ],
    },
    email: {
      type: String,
      required: [
        true,
        "Email is required",
      ],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    orderNotes: {
      type: String,
      trim: true,
    },
    orderItems: [OrderItemSchema],
    orderSummary: {
      itemsSubtotal: {
        type: Number,
        required: true,
      },
      shipping: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      required: [
        true,
        "Payment method is required",
      ],
      enum: [
        "cod",
        "card",
        "sslcommerz",
      ],
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Complete",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    transactionId: {
      type: String,
    },
    couponCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const OrderDetails = mongoose.model(
  "OrderDetails",
  OrderSchema
);

export default OrderDetails;
