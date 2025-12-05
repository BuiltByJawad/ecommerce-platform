import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";

const OrderDetails = db.model.OrderDetails;
const Product = db.model.Product;

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
        total: orderSummary.total,
      },
      paymentMethod,
      status: "Pending",
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
    const orderDetails = await OrderDetails.find({});

    successResponse(
      201,
      "SUCCESS",
      {
        orderDetails,
        message: "Order Details found successfully",
      },
      res
    );
  } catch (err) {
    console.log("this", err);
    console.error("Error creating order:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while creating the order.",
      res
    );
  }
};

export const findOneOrderDetails = async (req, res) => {
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
        total: orderSummary.total,
      },
      paymentMethod,
      status: "Pending",
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
    console.error("Error creating order:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while creating the order.",
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
