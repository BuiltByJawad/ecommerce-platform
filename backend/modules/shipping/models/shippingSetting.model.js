import mongoose from "mongoose";

const RateSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingSettingSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ["admin", "vendor"], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // when ownerType==='vendor'
    rates: { type: [RateSchema], default: [] },
  },
  { collection: "shipping_settings", timestamps: true }
);

const ShippingSetting = mongoose.model("ShippingSetting", ShippingSettingSchema);
export default ShippingSetting;
