import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { createNotification } from "../../notifications/controllers/notification.controller.js";
import { sendEmailSimple } from "../../../utils/sendEmail.js";

const OrderDetails = db.model.OrderDetails;
const Product = db.model.Product;
const User = db.model.User;

export const createOrderDetails = async (req, res) => {
  //   console.log("this", req.body);
  //   return;
  try {
    const {
      firstName,
      lastName,
      address,
      city,
      country,
      phone,
      email,
      orderNotes,
      orderItems,
      orderSummary,
      paymentMethod,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !country ||
      !phone ||
      !email ||
      !paymentMethod ||
      !orderItems ||
      !orderSummary
    ) {
      return errorResponse(400, "BAD_REQUEST", "Missing required fields", res);
    }

    const newOrderDetailsData = {
      firstName,
      lastName,
      address,
      city,
      country,
      phone,
      email,
      orderNotes: orderNotes || "",
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        subtotal: item.subtotal,
        quantity: item.quantity,
      })),
      orderSummary: {
        itemsSubtotal: orderSummary.itemsSubtotal,
        shipping: orderSummary.shipping,
        discount: orderSummary.discount || 0,
        tax: orderSummary.tax || 0,
        total: orderSummary.total,
      },
      paymentMethod,
      status: "Pending",
      couponCode: req.body?.couponCode,
    };

    const orderDetails = await OrderDetails.create(newOrderDetailsData);

    successResponse(
      201,
      "SUCCESS",
      {
        orderDetails,
        message: "Order created successfully",
      },
      res
    );
  } catch (err) {
    console.log("this", err);
    // console.error("Error creating order:", err);
    // errorResponse(
    //   500,
    //   "SERVER_ERROR",
    //   err.message || "An unexpected error occurred while creating the order.",
    //   res
    // );
  }
};

const toCsv = (rows) => {
  const headers = [
    'id',
    'createdAt',
    'firstName',
    'lastName',
    'email',
    'address',
    'city',
    'country',
    'itemsSubtotal',
    'shipping',
    'discount',
    'tax',
    'total',
    'status',
    'paymentMethod',
    'transactionId',
  ];
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r._id,
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
      r.firstName || '',
      r.lastName || '',
      r.email || '',
      r.address || '',
      r.city || '',
      r.country || '',
      r.orderSummary?.itemsSubtotal ?? '',
      r.orderSummary?.shipping ?? '',
      r.orderSummary?.discount ?? '',
      r.orderSummary?.tax ?? '',
      r.orderSummary?.total ?? '',
      r.status || '',
      r.paymentMethod || '',
      r.transactionId || '',
    ].map(escape).join(','));
  }
  return lines.join('\n');
};

export const exportOrdersCsv = async (req, res) => {
  try {
    const { status, email, from, to } = req.query || {};
    const limit = Math.min(parseInt(req.query.limit) || 5000, 20000);
    const filter = {};
    if (status) filter.status = status;
    if (email) filter.email = { $regex: String(email), $options: 'i' };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const rows = await OrderDetails.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const csv = toCsv(rows || []);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    return errorResponse(500, 'ERROR', err.message || 'Failed to export orders', res);
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "company") {
      return errorResponse(403, "FORBIDDEN", "Only company users can view vendor orders", res);
    }

    const vendorId = user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [results] = await Promise.all([
      OrderDetails.aggregate([
        { $unwind: "$orderItems" },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $match: { "product.seller": vendorId } },
        {
          $group: {
            _id: "$_id",
            createdAt: { $first: "$createdAt" },
            status: { $first: "$status" },
            paymentMethod: { $first: "$paymentMethod" },
            customerEmail: { $first: "$email" },
            items: {
              $push: {
                productId: "$orderItems.productId",
                name: "$orderItems.name",
                quantity: "$orderItems.quantity",
                subtotal: "$orderItems.subtotal",
              },
            },
            totalForVendor: { $sum: "$orderItems.subtotal" },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
    ]);

    const countAgg = await OrderDetails.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.seller": vendorId } },
      { $group: { _id: "$_id" } },
      { $count: "total" },
    ]);

    const total = countAgg?.[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return successResponse(
      200,
      "SUCCESS",
      {
        orders: results,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      res
    );
  } catch (err) {
    console.error("Error fetching vendor orders:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while fetching vendor orders.",
      res
    );
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = req.user;
    const email = user?.email || req.query.email;

    if (!email) {
      return errorResponse(400, "BAD_REQUEST", "Email is required to fetch orders", res);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderDetails.find({ email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderDetails.countDocuments({ email }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return successResponse(
      200,
      "SUCCESS",
      {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      res
    );
  } catch (err) {
    console.error("Error fetching user orders:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while fetching orders.",
      res
    );
  }
};

export const findAllOrderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, email, from, to } = req.query || {};
    const filter = {};
    if (status) filter.status = status;
    if (email) filter.email = { $regex: String(email), $options: "i" };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [rows, total] = await Promise.all([
      OrderDetails.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OrderDetails.countDocuments(filter),
    ]);

    return successResponse(200, "SUCCESS", { data: rows, pagination: { page, limit, total } }, res);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while fetching orders.",
      res
    );
  }
};

export const findOneOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(400, "BAD_REQUEST", "Order ID is required", res);
    }
    const order = await OrderDetails.findById(id);
    if (!order) {
      return errorResponse(404, "NOT_FOUND", "Order not found", res);
    }
    return successResponse(200, "SUCCESS", { order }, res);
  } catch (err) {
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while fetching the order.",
      res
    );
  }
};

export const updateOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log("this", orderId, status);
    // Validate input
    if (!orderId) {
      return errorResponse(400, "BAD_REQUEST", "Order ID is required", res);
    }
    if (!status) {
      return errorResponse(400, "BAD_REQUEST", "Status is required", res);
    }

    // Check if the status is a valid enum value
    const validStatuses = [
      "Pending",
      "Complete",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return errorResponse(400, "BAD_REQUEST", "Invalid status value", res);
    }

    // Find and update the order
    const updatedOrder = await OrderDetails.findOneAndUpdate(
      { _id: orderId }, // Match the order by _id
      { status }, // Update the status field
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!updatedOrder) {
      return errorResponse(404, "NOT_FOUND", "Order not found", res);
    }

    // Notifications (best-effort): inform customer and vendors of status change
    try {
      const customer = await User.findOne({ email: updatedOrder.email }).select("_id email").lean();
      if (customer) {
        await createNotification({
          user: customer._id,
          title: "Order status updated",
          message: `Your order ${updatedOrder._id} status is now ${status}`,
          type: "order",
          metadata: { orderId: updatedOrder._id, status },
        });
        if (customer.email) {
          await sendEmailSimple(
            customer.email,
            "Order status updated",
            `Your order (${updatedOrder._id}) status is now: ${status}.`
          );
        }
      }
      const ids = Array.from(new Set((updatedOrder.orderItems || []).map((it) => String(it.productId))))
        .filter(Boolean);
      if (ids.length) {
        const prods = await Product.find({ _id: { $in: ids } }).select("seller").lean();
        const vendorIds = Array.from(new Set(prods.map((p) => String(p.seller || "")).filter(Boolean)));
        if (vendorIds.length) {
          const vendors = await User.find({ _id: { $in: vendorIds } }).select("_id email").lean();
          for (const v of vendors) {
            await createNotification({
              user: v._id,
              title: "Order status changed",
              message: `Order ${updatedOrder._id} status is now ${status}`,
              type: "order",
              metadata: { orderId: updatedOrder._id, status },
            });
            if (v.email) {
              await sendEmailSimple(
                v.email,
                "Order status changed",
                `Order ${updatedOrder._id} status is now: ${status}.`
              );
            }
          }
        }
      }
    } catch (_e) {}

    // Return success response with the updated order
    return successResponse(
      200,
      "Order status updated successfully",
      updatedOrder,
      res
    );
  } catch (err) {
    console.error("Error updating order:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while updating the order.",
      res
    );
  }
};
