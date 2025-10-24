import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import Coupon from "../../coupons/models/coupon.model.js";
import { stripe } from "../../../lib/stripe.js";
import { createStripeCoupon } from "../../../lib/createStripeCoupon.js";
import { createCoupon } from "../../coupons/controllers/coupon.controller.js";
import SSLCommerzPayment from "sslcommerz-lts";
import { v4 as uuidv4 } from "uuid";

const Payment = db.model.Payment;
const OrderDetails = db.model.OrderDetails;

const store_id = "testbox";
const store_passwd = "qwerty";
const is_live = false;

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products array is required" });
    }
    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //converting to cents
      totalAmount += amount * product.quantity;
      const image = product.image || (Array.isArray(product.imageUrls) ? product.imageUrls[0] : undefined);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(image ? { images: [image] } : {}),
          },
          unit_amount: amount,
        },
        quantity: product.quantity,
      };
    });
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        user_id: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discount_percentage) / 100
        );
      }
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_APP_FRONTEND}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_APP_FRONTEND}/payment/cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discount_percentage),
            },
          ]
        : [],
      metadata: {
        user_id: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((product) => ({
            id: product._id,
            quantity: product.quantity,
            price: product.price,
          }))
        ),
      },
    });
    if (totalAmount >= 20000) {
      await createCoupon(req.user._id);
    }
    successResponse(
      200,
      "SUCCESS",
      {
        id: session.id,
        totalAmount: totalAmount / 100,
      },
      res
    );
  } catch (error) {
    errorResponse(500, "ERROR", "Error processing checkout", res);
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            user_id: session.metadata.user_id,
          },
          {
            isActive: false,
          }
        );
      }
      const products = JSON.parse(session.metadata.products);
      const payment = new Payment({
        user: session.metadata.user_id,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100, //convert from cents to dollars
        stripeSessionId: sessionId,
      });
      await payment.save();
      successResponse(
        200,
        "SUCCESS",
        {
          message: "Payment successful, order created.",
          order_id: payment._id,
        },
        res
      );
    }
  } catch (error) {
    errorResponse(500, "ERROR", "Error processing successful checkout", res);
  }
};

export const paymentCancel = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) {
      return errorResponse(400, "ERROR", "Transaction ID not found", res);
    }
    await OrderDetails.findOneAndUpdate(
      { transactionId },
      { status: "Cancelled" },
      { new: true }
    );
    res.redirect(`${process.env.NEXT_APP_FRONTEND}/`);
  } catch (error) {
    errorResponse(500, "ERROR", "Error processing checkout cancellation", res);
  }
};

export const sslCommerzIpn = async (req, res) => {
  try {
    const data = req.body;
    if (!data.tran_id) {
      return errorResponse(400, "ERROR", "Transaction ID not found", res);
    }
    const updatedOrder = await OrderDetails.findOneAndUpdate(
      { transactionId: data.tran_id },
      { status: "Complete", paymentMethod: "sslcommerz" },
      { new: true }
    );
    successResponse(
      200,
      "SUCCESS",
      {
        message: "Payment successful, order created.",
        order_id: updatedOrder._id,
      },
      res
    );
  } catch (error) {
    errorResponse(500, "ERROR", "Error processing successful checkout", res);
  }
};

export const initiateSslCommerzPayment = async (req, res) => {
  try {
    const { orderData, customerData, orderItems } = req.body;
    const tran_id = uuidv4();
    const data = {
      total_amount: orderData.total,
      currency: "BDT",
      tran_id: tran_id, // use unique tran_id for each api call
      success_url: `${process.env.NEXT_APP_FRONTEND}/payment/success?transactionId=${tran_id}`,
      fail_url: `${process.env.NEXT_APP_FRONTEND}/payment/fail?transactionId=${tran_id}`,
      cancel_url: `${process.env.NEXT_APP_FRONTEND}/payment/cancel?transactionId=${tran_id}`,
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic",
      product_profile: "general",
      cus_name: `${customerData.firstName} ${customerData.lastName}`,
      cus_email: customerData.email,
      cus_add1: customerData.address,
      cus_add2: customerData.address,
      cus_city: customerData.city,
      cus_state: customerData.city,
      cus_postcode: "1000",
      cus_country: customerData.country,
      cus_phone: customerData.phone,
      cus_fax: customerData.phone,
      ship_name: `${customerData.firstName} ${customerData.lastName}`,
      ship_add1: customerData.address,
      ship_add2: customerData.address,
      ship_city: customerData.city,
      ship_state: customerData.city,
      ship_postcode: 1000,
      ship_country: customerData.country,
    };

    const newOrderDetailsData = {
      ...customerData,
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        subtotal: item.subtotal,
        quantity: item.quantity,
      })),
      orderSummary: {
        itemsSubtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
      },
      paymentMethod: "sslcommerz",
      status: "Pending",
      transactionId: tran_id,
    };

    await OrderDetails.create(newOrderDetailsData);

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse) => {
      // Redirect the user to payment gateway
      console.log("apiResponse", apiResponse);
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.send({ url: GatewayPageURL });
    });
  } catch (error) {
    errorResponse(500, "ERROR", "Error processing successful checkout", res);
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) {
      return errorResponse(400, "ERROR", "Transaction ID not found", res);
    }
    const updatedOrder = await OrderDetails.findOneAndUpdate(
      { transactionId },
      { status: "Complete", paymentMethod: "sslcommerz" },
      { new: true }
    );
    if (!updatedOrder) {
      return errorResponse(404, "ERROR", "Order not found", res);
    }
    res.redirect(`${process.env.NEXT_APP_FRONTEND}/`);
  } catch (error) {
    console.error("Payment success error:", error);
    errorResponse(500, "ERROR", "Error processing successful checkout", res);
  }
};
