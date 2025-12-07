import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    f_name: { type: String, required: [true, "First name is required"] },
    l_name: { type: String, required: [true, "Last name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    cartItems: [
      {
        quantity: { type: Number, default: 1 },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin", "company"],
      default: "customer",
    },
    // Company-specific fields (only for company role)
    company_name: {
      type: String,
      required: function () {
        return this.role === "company";
      },
    },
    tax_id: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    business_type: {
      type: String,
      enum: [
        "retail",
        "wholesale",
        "manufacturer",
        "distributor",
        "service_provider",
        "other",
        "",
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    vendorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    permissions: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
