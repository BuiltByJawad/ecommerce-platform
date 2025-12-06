import mongoose from "mongoose";

const SystemSettingsSchema = new mongoose.Schema(
  {
    website_name: { type: String, default: "" },
    tag_line: { type: String, default: "" },
    short_name: { type: String, default: "" },
    address: { type: String, default: "" },
    mobile: { type: String, default: "" },
    logo_image: { type: String, default: "" },
    fav_image: { type: String, default: "" },
    days_of_week: { type: String, default: "" },
    point: { type: Number, default: 0 },
    vat_type: { type: Number, default: 0 },
    copyright: { type: String, default: "" },
    status: { type: Number, default: 1 },
  },
  {
    collection: "system_settings",
    timestamps: true,
  }
);

const SystemSettings = mongoose.model("SystemSettings", SystemSettingsSchema);
export default SystemSettings;
