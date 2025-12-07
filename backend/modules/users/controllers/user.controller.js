import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { updateProfile, updatePassword } from "./userSettings.controller.js";
import { sendVendorStatusEmail } from "../../../utils/sendEmail.js";

const User = db.model.User;
const Product = db.model.Product;

export const findAll = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 50, 1), 100);
    const q = (req.query.q || '').toString().trim();
    const role = (req.query.role || '').toString().trim();

    const filter = {};
    if (role) (filter).role = role;
    if (q) {
      (filter).$or = [
        { email: { $regex: q, $options: 'i' } },
        { f_name: { $regex: q, $options: 'i' } },
        { l_name: { $regex: q, $options: 'i' } },
        { company_name: { $regex: q, $options: 'i' } },
      ];
    }

    const [data, count] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      User.countDocuments(filter),
    ]);

    successResponse(200, 'SUCCESS', { data, totalRows: count, page, pageSize }, res);
  } catch (err) {
    errorResponse(500, 'ERROR', err.message || 'Some error occurred while Finding User', res);
  }
};
 

export const adminGetVendorPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findOne({ _id: id, role: "company" })
      .select("permissions company_name email vendorStatus")
      .lean();

    if (!vendor) {
      return errorResponse(404, "FAILED", "Vendor not found", res);
    }

    return successResponse(200, "SUCCESS", { vendor }, res);
  } catch (err) {
    return errorResponse(
      500,
      "ERROR",
      err.message || "Failed to fetch vendor permissions",
      res
    );
  }
};

export const adminUpdateVendorPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return errorResponse(400, "FAILED", "Permissions must be an array of strings", res);
    }

    const vendor = await User.findOneAndUpdate(
      { _id: id, role: "company" },
      { permissions },
      { new: true }
    )
      .select("permissions company_name email vendorStatus")
      .lean();

    if (!vendor) {
      return errorResponse(404, "FAILED", "Vendor not found", res);
    }

    return successResponse(200, "SUCCESS", { vendor }, res);
  } catch (err) {
    return errorResponse(
      500,
      "ERROR",
      err.message || "Failed to update vendor permissions",
      res
    );
  }
};

export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).send({ message: `Cannot find User with id=${id}.` });
    }
    successResponse(200, "SUCCESS", { user }, res);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while Finding User",
      res
    );
  }
};

export const deleteOne = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.send({ message: `Cannot delete User with id=${id}. Maybe User was not found!` });
    }
    return res.send({ data: result, message: "User deleted Successfully!" });
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while Deleting the User.",
      res
    );
  }
};

export const uploadImage = async (req, res) => {
  try {
    let imageFiles = req.file;
    res.send(imageFiles);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while uploading the image.",
      res
    );
  }
};

export const listVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const filter = {
      role: "company",
      isVerified: true,
      vendorStatus: "approved",
    };

    const [vendors, count] = await Promise.all([
      User.find(filter)
        .select(
          "company_name business_type address phone isVerified vendorStatus createdAt"
        )
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      User.countDocuments(filter),
    ]);

    successResponse(
      200,
      "SUCCESS",
      { data: vendors, totalRows: count, page, pageSize },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Failed to fetch vendors",
      res
    );
  }
};

export const getVendorStore = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findOne({
      _id: id,
      role: "company",
      isVerified: true,
      vendorStatus: "approved",
    }).select(
      "company_name business_type address phone isVerified vendorStatus createdAt"
    );

    if (!vendor) {
      return errorResponse(404, "FAILED", "Vendor not found", res);
    }

    const products = await Product.find({
      seller: id,
      status: "approved",
    }).lean();

    successResponse(
      200,
      "SUCCESS",
      {
        vendor,
        products,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Failed to fetch vendor store",
      res
    );
  }
};

export const adminListVendors = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20, q } = req.query;

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    const filter = { role: "company" };

    const allowedStatuses = ["pending", "approved", "rejected", "suspended"];
    if (status && allowedStatuses.includes(status)) {
      filter.vendorStatus = status;
    }

    if (q) {
      filter.$or = [
        { company_name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { tax_id: { $regex: q, $options: "i" } },
      ];
    }

    const [vendors, count] = await Promise.all([
      User.find(filter)
        .select(
          "f_name l_name email company_name tax_id phone address business_type isVerified vendorStatus createdAt"
        )
        .skip((pageNum - 1) * pageSizeNum)
        .limit(pageSizeNum),
      User.countDocuments(filter),
    ]);

    successResponse(
      200,
      "SUCCESS",
      {
        data: vendors,
        totalRows: count,
        page: pageNum,
        pageSize: pageSizeNum,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Failed to fetch vendors for admin",
      res
    );
  }
};

export const adminUpdateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "approved", "rejected", "suspended"];
    if (!status || !allowedStatuses.includes(status)) {
      return errorResponse(400, "FAILED", "Invalid vendor status", res);
    }

    const vendor = await User.findOneAndUpdate(
      { _id: id, role: "company" },
      { vendorStatus: status },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return errorResponse(404, "FAILED", "Vendor not found", res);
    }

    // Adjust products for this vendor based on new vendorStatus to match
    // common multi-vendor marketplace behavior.
    // - approved: leave products as-is (product-level moderation still applies)
    // - pending: move approved products back to pending for re-review
    // - rejected/suspended: mark all products as rejected so they are no longer public
    if (status === "pending") {
      await Product.updateMany(
        { seller: id, status: "approved" },
        { status: "pending", rejectionReason: undefined, approvedBy: undefined, approvedAt: undefined }
      );
    } else if (status === "rejected" || status === "suspended") {
      await Product.updateMany(
        { seller: id },
        { status: "rejected" }
      );
    }

    // Fire-and-forget email notification; errors are logged inside helper
    if (vendor.email) {
      sendVendorStatusEmail(vendor.email, status).catch(() => {});
    }

    successResponse(
      200,
      "SUCCESS",
      { vendor },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Failed to update vendor status",
      res
    );
  }
};

// Export the settings controller methods

 

export const adminUpdateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const allowed = ["customer", "company", "admin"];
    if (!role || !allowed.includes(role)) {
      return errorResponse(400, "FAILED", "Invalid role", res);
    }
    if (String(req.user?._id) === String(id)) {
      return errorResponse(400, "FAILED", "You cannot change your own role", res);
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) {
      return errorResponse(404, "FAILED", "User not found", res);
    }
    return successResponse(200, "SUCCESS", { user }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to update user role", res);
  }
};

export const adminUpdateUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body || {};
    if (typeof active !== 'boolean') {
      return errorResponse(400, "FAILED", "Invalid active flag", res);
    }
    if (String(req.user?._id) === String(id) && active === false) {
      return errorResponse(400, "FAILED", "You cannot disable your own account", res);
    }
    const user = await User.findByIdAndUpdate(id, { active }, { new: true }).select("-password");
    if (!user) {
      return errorResponse(404, "FAILED", "User not found", res);
    }
    return successResponse(200, "SUCCESS", { user }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to update user active status", res);
  }
};

export { updateProfile, updatePassword };


