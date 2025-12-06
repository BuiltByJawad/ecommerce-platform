import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { createNotification } from "../../notifications/controllers/notification.controller.js";
import { sendEmailSimple } from "../../../utils/sendEmail.js";
import { logAudit } from "../../audit/controllers/audit.controller.js";

const ReturnRequest = db.model.ReturnRequest;
const OrderDetails = db.model.OrderDetails;
const Product = db.model.Product;
const User = db.model.User;

const validStatuses = ["Requested", "Approved", "Rejected", "Received", "Refunded"];

export const customerCreateReturn = async (req, res) => {
  try {
    const { orderId, items = [], notes = "" } = req.body || {};
    const email = req.user?.email;
    if (!orderId || !Array.isArray(items) || items.length === 0) {
      return errorResponse(400, "FAILED", "orderId and items are required", res);
    }
    const order = await OrderDetails.findById(orderId).lean();
    if (!order) return errorResponse(404, "FAILED", "Order not found", res);
    if (!email || String(order.email).toLowerCase() !== String(email).toLowerCase()) {
      return errorResponse(403, "FORBIDDEN", "You can only return your own orders", res);
    }

    // Build map of ordered quantities by productId
    const qtyMap = new Map();
    for (const it of order.orderItems || []) {
      qtyMap.set(String(it.productId), (qtyMap.get(String(it.productId)) || 0) + Number(it.quantity || 0));
    }

    // Validate each return item and enrich with seller and name
    const enrichedItems = [];
    for (const it of items) {
      const pid = String(it.productId || it.product_id || "");
      const qty = Number(it.quantity || 0);
      if (!pid || qty <= 0) {
        return errorResponse(400, "FAILED", "Each item must have productId and positive quantity", res);
      }
      const allowed = qtyMap.get(pid) || 0;
      if (qty > allowed) {
        return errorResponse(400, "FAILED", "Return quantity exceeds ordered quantity", res);
      }
      const prod = await Product.findById(pid).select("name seller").lean();
      if (!prod) return errorResponse(404, "FAILED", "Product not found", res);
      enrichedItems.push({
        productId: prod._id,
        name: prod.name,
        quantity: qty,
        reason: it.reason || "",
        seller: prod.seller || null,
      });
    }

    const doc = await ReturnRequest.create({
      orderId,
      customerEmail: email,
      items: enrichedItems,
      status: "Requested",
      notes,
      history: [{ byRole: "customer", by: req.user?._id, action: "Requested", note: notes }],
    });
    // Audit: customer created return request
    await logAudit({
      req,
      action: "returns.create",
      resourceType: "ReturnRequest",
      resourceId: doc._id,
      before: null,
      after: { status: "Requested", orderId, items: enrichedItems.length },
      metadata: { orderId },
    });
    try {
      const sellerIds = Array.from(new Set(enrichedItems.map((it) => String(it.seller || "")).filter(Boolean)));
      if (sellerIds.length) {
        const vendors = await User.find({ _id: { $in: sellerIds } }).select("_id email f_name l_name").lean();
        for (const v of vendors) {
          await createNotification({
            user: v._id,
            title: "New return request",
            message: `Return requested for order ${orderId}`,
            type: "return",
            metadata: { returnId: doc._id, orderId },
          });
          if (v.email) {
            await sendEmailSimple(
              v.email,
              "New return request",
              `A customer requested a return for order ${orderId}.`
            );
          }
        }
      }
    } catch (_e) {}
    return successResponse(201, "SUCCESS", { request: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to create return request", res);
  }
};

export const customerListReturns = async (req, res) => {
  try {
    const email = req.user?.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      ReturnRequest.find({ customerEmail: email }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReturnRequest.countDocuments({ customerEmail: email }),
    ]);
    return successResponse(200, "SUCCESS", { data: rows, pagination: { page, limit, total } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch returns", res);
  }
};

export const adminListReturns = async (req, res) => {
  try {
    const { status, q } = req.query || {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize || req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status && validStatuses.includes(String(status))) filter.status = status;
    if (q) filter.customerEmail = { $regex: String(q), $options: "i" };
    const [rows, total] = await Promise.all([
      ReturnRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReturnRequest.countDocuments(filter),
    ]);
    return successResponse(200, "SUCCESS", { data: rows, pagination: { page, limit, total } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch returns", res);
  }
};

export const adminUpdateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = "" } = req.body || {};
    if (!validStatuses.includes(String(status))) {
      return errorResponse(400, "FAILED", "Invalid status", res);
    }
    const doc = await ReturnRequest.findByIdAndUpdate(
      id,
      { $set: { status }, $push: { history: { byRole: "admin", by: req.user?._id, action: status, note } } },
      { new: true }
    );
    if (!doc) return errorResponse(404, "FAILED", "Return not found", res);
    // Audit: attempt to infer previous status from history prior to last entry
    const prevStatus = doc?.history?.length > 1 ? doc.history[doc.history.length - 2]?.action : undefined;
    await logAudit({
      req,
      action: "returns.status_update",
      resourceType: "ReturnRequest",
      resourceId: doc._id,
      before: { status: prevStatus },
      after: { status },
      metadata: { by: "admin" },
    });
    try {
      const customer = await User.findOne({ email: doc.customerEmail }).select("_id email").lean();
      if (customer) {
        await createNotification({
          user: customer._id,
          title: "Return status updated",
          message: `Your return ${doc._id} status is now ${status}`,
          type: "return",
          metadata: { returnId: doc._id, status },
        });
        if (customer.email) {
          await sendEmailSimple(
            customer.email,
            "Return status updated",
            `Your return request (${doc._id}) status is now: ${status}.`
          );
        }
      }
    } catch (_e) {}
    return successResponse(200, "SUCCESS", { request: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to update return", res);
  }
};

export const vendorListReturns = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize || req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { "items.seller": vendorId };
    if (req.query.status && validStatuses.includes(String(req.query.status))) {
      filter.status = req.query.status;
    }
    const [rows, total] = await Promise.all([
      ReturnRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReturnRequest.countDocuments(filter),
    ]);
    return successResponse(200, "SUCCESS", { data: rows, pagination: { page, limit, total } }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to fetch returns", res);
  }
};

export const vendorUpdateReturnStatus = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;
    const { status, note = "" } = req.body || {};
    if (!validStatuses.includes(String(status))) {
      return errorResponse(400, "FAILED", "Invalid status", res);
    }
    const doc = await ReturnRequest.findById(id);
    if (!doc) return errorResponse(404, "FAILED", "Return not found", res);
    const allBelongToVendor = (doc.items || []).every((it) => String(it.seller || "") === String(vendorId));
    if (!allBelongToVendor) {
      return errorResponse(403, "FORBIDDEN", "You can only update returns for your own items", res);
    }
    const prevStatusV = doc.status;
    doc.status = status;
    doc.history.push({ byRole: "vendor", by: vendorId, action: status, note });
    await doc.save();
    await logAudit({
      req,
      action: "returns.status_update",
      resourceType: "ReturnRequest",
      resourceId: doc._id,
      before: { status: prevStatusV },
      after: { status },
      metadata: { by: "vendor" },
    });
    try {
      const customer = await User.findOne({ email: doc.customerEmail }).select("_id email").lean();
      if (customer) {
        await createNotification({
          user: customer._id,
          title: "Return status updated",
          message: `Your return ${doc._id} status is now ${status}`,
          type: "return",
          metadata: { returnId: doc._id, status },
        });
        if (customer.email) {
          await sendEmailSimple(
            customer.email,
            "Return status updated",
            `Your return request (${doc._id}) status is now: ${status}.`
          );
        }
      }
    } catch (_e) {}
    return successResponse(200, "SUCCESS", { request: doc }, res);
  } catch (err) {
    return errorResponse(500, "ERROR", err.message || "Failed to update return", res);
  }
};
