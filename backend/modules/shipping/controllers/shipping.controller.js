import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";

const ShippingSetting = db.model.ShippingSetting;

export const upsertAdminRates = async (req, res) => {
  try {
    const { rates } = req.body;
    if (!Array.isArray(rates)) return errorResponse(400, "FAILED", "rates must be an array", res);
    const doc = await ShippingSetting.findOneAndUpdate(
      { ownerType: "admin" },
      { ownerType: "admin", rates },
      { upsert: true, new: true }
    );
    return successResponse(200, "SUCCESS", { settings: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to save shipping rates", res);
  }
};

export const computeQuote = async (req, res) => {
  try {
    const { country, items } = req.body || {};
    if (!country || !Array.isArray(items)) {
      return errorResponse(400, "FAILED", "country and items are required", res);
    }

    const admin = await ShippingSetting.findOne({ ownerType: "admin" }).lean();
    const adminRate = (admin?.rates || []).find((r) => String(r.country) === String(country))?.rate;

    const sellerIds = Array.from(
      new Set(
        items
          .map((it) => (it?.seller ? String(it.seller) : null))
          .filter((v) => v)
      )
    );

    const vendorSettings = await ShippingSetting.find({ ownerType: "vendor", owner: { $in: sellerIds } }).lean();
    const vendorMap = new Map();
    for (const vs of vendorSettings) {
      vendorMap.set(String(vs.owner), vs);
    }

    const perSeller = sellerIds.map((sid) => {
      const vs = vendorMap.get(String(sid));
      const vr = (vs?.rates || []).find((r) => String(r.country) === String(country))?.rate;
      const rate = vr != null ? vr : adminRate != null ? adminRate : 5.0;
      return { seller: sid, country, rate };
    });

    // If no seller info (e.g., single-vendor items missing seller), fallback to admin/default once
    if (perSeller.length === 0) {
      perSeller.push({ seller: null, country, rate: adminRate != null ? adminRate : 5.0 });
    }

    const totalShipping = perSeller.reduce((sum, s) => sum + (Number(s.rate) || 0), 0);

    return successResponse(200, "SUCCESS", { country, perSeller, totalShipping }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to compute shipping quote", res);
  }
};

export const getAdminRates = async (_req, res) => {
  try {
    const doc = await ShippingSetting.findOne({ ownerType: "admin" }).lean();
    return successResponse(200, "SUCCESS", { settings: doc || { ownerType: "admin", rates: [] } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch shipping rates", res);
  }
};

export const upsertVendorRates = async (req, res) => {
  try {
    const { rates } = req.body;
    const vendorId = req.user?._id;
    if (!vendorId) return errorResponse(401, "FAILED", "Unauthorized", res);
    if (!Array.isArray(rates)) return errorResponse(400, "FAILED", "rates must be an array", res);
    const doc = await ShippingSetting.findOneAndUpdate(
      { ownerType: "vendor", owner: vendorId },
      { ownerType: "vendor", owner: vendorId, rates },
      { upsert: true, new: true }
    );
    return successResponse(200, "SUCCESS", { settings: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to save vendor shipping rates", res);
  }
};

export const getVendorRates = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    if (!vendorId) return errorResponse(401, "FAILED", "Unauthorized", res);
    const doc = await ShippingSetting.findOne({ ownerType: "vendor", owner: vendorId }).lean();
    return successResponse(200, "SUCCESS", { settings: doc || { ownerType: "vendor", owner: vendorId, rates: [] } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch vendor shipping rates", res);
  }
};
