import mongoose from "mongoose";

const RateSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const TaxSettingSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ["admin", "vendor"], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // when ownerType==='vendor'
    rates: { type: [RateSchema], default: [] },
  },
  { collection: "tax_settings", timestamps: true }
);

const TaxSetting = mongoose.model("TaxSetting", TaxSettingSchema);
export default TaxSetting;
