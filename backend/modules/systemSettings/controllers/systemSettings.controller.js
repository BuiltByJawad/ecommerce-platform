import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { logAudit } from "../../audit/controllers/audit.controller.js";

const SystemSettings = db.model.SystemSettings;

export const getSystemSettings = async (_req, res) => {
  try {
    const doc = await SystemSettings.findOne({}).lean();
    return successResponse(200, "SUCCESS", { settings: doc || null }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch system settings", res);
  }
};

export const getPublicSystemSettings = async (_req, res) => {
  try {
    const doc = await SystemSettings.findOne({}).lean();
    if (!doc) {
      return successResponse(200, "SUCCESS", { settings: null }, res);
    }

    const {
      website_name,
      short_name,
      tag_line,
      logo_image,
      fav_image,
      copyright,
    } = doc;

    const safeSettings = {
      website_name: website_name || "",
      short_name: short_name || "",
      tag_line: tag_line || "",
      logo_image: logo_image || "",
      fav_image: fav_image || "",
      copyright: copyright || "",
    };

    return successResponse(200, "SUCCESS", { settings: safeSettings }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch system settings", res);
  }
};

export const upsertSystemSettings = async (req, res) => {
  try {
    const {
      website_name,
      tag_line,
      short_name,
      address,
      mobile,
      logo_image,
      fav_image,
      days_of_week,
      point,
      vat_type,
      copyright,
      status,
    } = req.body || {};

    const updatePayload = {
      website_name,
      tag_line,
      short_name,
      address,
      mobile,
      logo_image,
      fav_image,
      days_of_week,
    };

    if (point !== undefined && point !== "") {
      updatePayload.point = Number(point) || 0;
    }
    if (vat_type !== undefined && vat_type !== "") {
      updatePayload.vat_type = Number(vat_type) || 0;
    }
    if (status !== undefined && status !== "") {
      updatePayload.status = Number(status) || 0;
    }
    if (copyright !== undefined) {
      updatePayload.copyright = copyright;
    }

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const before = await SystemSettings.findOne({}).lean();

    const doc = await SystemSettings.findOneAndUpdate({}, updatePayload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    await logAudit({
      req,
      action: "systemSettings.upsert",
      resourceType: "SystemSettings",
      resourceId: doc?._id,
      before,
      after: doc?.toObject ? doc.toObject() : doc,
      metadata: {},
    });

    return successResponse(200, "SUCCESS", { settings: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to save system settings", res);
  }
};
