import Cart from "../modules/carts/models/cart.model.js";
import Coupon from "../modules/coupons/models/coupon.model.js";
import Product from "../modules/products/models/product.model.js";
import User from "../modules/users/models/user.model.js";
import Payment from "../modules/payments/models/payment.model.js";
import Analytics from "../modules/analytics/models/analytics.model.js";
import Category from "../modules/categories/models/category.model.js";
import Country from "../modules/countries/models/country.model.js";
import OrderDetails from "../modules/orderDetails/models/orderDetail.model.js";
import ShippingSetting from "../modules/shipping/models/shippingSetting.model.js";
import TaxSetting from "../modules/taxes/models/taxSetting.model.js";
import ReturnRequest from "../modules/returns/models/return.model.js";
import Notification from "../modules/notifications/models/notification.model.js";
import AuditLog from "../modules/audit/models/auditLog.model.js";
import SystemSettings from "../modules/systemSettings/models/systemSettings.model.js";
import Review from "../modules/reviews/models/review.model.js";

const models = {
  User,
  Product,
  Cart,
  Coupon,
  Payment,
  Analytics,
  Category,
  Country,
  OrderDetails,
  ShippingSetting,
  TaxSetting,
  ReturnRequest,
  Notification,
  AuditLog,
  SystemSettings,
  Review,
};

export default models;
