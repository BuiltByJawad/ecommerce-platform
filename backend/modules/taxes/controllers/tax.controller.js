import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { logAudit } from "../../audit/controllers/audit.controller.js";

const TaxSetting = db.model.TaxSetting;

export const getAdminRates = async (_req, res) => {
  try {
    const doc = await TaxSetting.findOne({ ownerType: "admin" }).lean();
    return successResponse(200, "SUCCESS", { settings: doc || { ownerType: "admin", rates: [] } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch tax rates", res);
  }
};

export const upsertAdminRates = async (req, res) => {
  try {
    const { rates } = req.body || {};
    if (!Array.isArray(rates)) return errorResponse(400, "FAILED", "rates must be an array", res);
    const cleaned = (rates || [])
      .filter(
        (r) =>
          r &&
          r.country &&
          r.percent !== undefined &&
          r.percent !== null &&
          !Number.isNaN(Number(r.percent))
      )
      .map((r) => ({ country: r.country, percent: Math.max(0, Math.min(100, Number(r.percent))) }));
    if (rates.length > 0 && cleaned.length === 0) {
      return errorResponse(400, "FAILED", "No valid tax rates to save. Provide country and percent between 0 and 100 or remove empty rows.", res);
    }
    const doc = await TaxSetting.findOneAndUpdate(
      { ownerType: "admin" },
      { ownerType: "admin", rates: cleaned },
      { upsert: true, new: true }
    );
    await logAudit({
      req,
      action: "taxes.upsert",
      resourceType: "TaxSetting",
      resourceId: doc?._id,
      before: null,
      after: { ownerType: "admin", ratesCount: cleaned.length },
      metadata: { ownerType: "admin" },
    });
    return successResponse(200, "SUCCESS", { settings: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to save tax rates", res);
  }
};

export const getVendorRates = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    if (!vendorId) return errorResponse(401, "FAILED", "Unauthorized", res);
    const doc = await TaxSetting.findOne({ ownerType: "vendor", owner: vendorId }).lean();
    return successResponse(200, "SUCCESS", { settings: doc || { ownerType: "vendor", owner: vendorId, rates: [] } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch vendor tax rates", res);
  }
};

export const upsertVendorRates = async (req, res) => {
  try {
    const { rates } = req.body || {};
    const vendorId = req.user?._id;
    if (!vendorId) return errorResponse(401, "FAILED", "Unauthorized", res);
    if (!Array.isArray(rates)) return errorResponse(400, "FAILED", "rates must be an array", res);
    const cleaned = (rates || [])
      .filter(
        (r) =>
          r &&
          r.country &&
          r.percent !== undefined &&
          r.percent !== null &&
          !Number.isNaN(Number(r.percent))
      )
      .map((r) => ({ country: r.country, percent: Math.max(0, Math.min(100, Number(r.percent))) }));
    if (rates.length > 0 && cleaned.length === 0) {
      return errorResponse(400, "FAILED", "No valid tax rates to save. Provide country and percent between 0 and 100 or remove empty rows.", res);
    }
    const doc = await TaxSetting.findOneAndUpdate(
      { ownerType: "vendor", owner: vendorId },
      { ownerType: "vendor", owner: vendorId, rates: cleaned },
      { upsert: true, new: true }
    );
    await logAudit({
      req,
      action: "taxes.upsert",
      resourceType: "TaxSetting",
      resourceId: doc?._id,
      before: null,
      after: { ownerType: "vendor", owner: vendorId, ratesCount: cleaned.length },
      metadata: { ownerType: "vendor", owner: vendorId },
    });
    return successResponse(200, "SUCCESS", { settings: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to save vendor tax rates", res);
  }
};

export const computeTax = async (req, res) => {
  try {
    const { country, items, discount = 0 } = req.body || {};
    if (!country || !Array.isArray(items)) {
      return errorResponse(400, "FAILED", "country and items are required", res);
    }

    const admin = await TaxSetting.findOne({ ownerType: "admin" }).lean();
    const adminPercent = (admin?.rates || []).find((r) => String(r.country) === String(country))?.percent ?? 0;

    const sellerMap = new Map();
    for (const it of items) {
      const seller = it?.seller ? String(it.seller) : "_none";
      const line = (Number(it.price) || 0) * (Number(it.quantity) || 0);
      sellerMap.set(seller, (sellerMap.get(seller) || 0) + line);
    }

    const sellerIds = Array.from(new Set(items.map((it) => (it?.seller ? String(it.seller) : null)).filter(Boolean)));
    const vendorSettings = await TaxSetting.find({ ownerType: "vendor", owner: { $in: sellerIds } }).lean();
    const vendorMap = new Map();
    for (const vs of vendorSettings) vendorMap.set(String(vs.owner), vs);

    let totalTax = 0;
    for (const [sellerId, sellerSubtotal] of sellerMap.entries()) {
      const vs = vendorMap.get(sellerId);
      const vendorPercent = (vs?.rates || []).find((r) => String(r.country) === String(country))?.percent;
      const percent = vendorPercent != null ? vendorPercent : adminPercent;
      totalTax += (Number(sellerSubtotal) || 0) * (Number(percent) || 0) / 100;
    }

    // subtract discount from taxable base proportionally (simple approach)
    const itemsSubtotal = Array.from(sellerMap.values()).reduce((a, b) => a + b, 0);
    const effectiveSubtotal = Math.max(0, itemsSubtotal - Number(discount || 0));
    const scale = itemsSubtotal > 0 ? effectiveSubtotal / itemsSubtotal : 1;
    totalTax = Number((totalTax * scale).toFixed(2));

    return successResponse(200, "SUCCESS", { country, totalTax }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to compute tax", res);
  }
};
