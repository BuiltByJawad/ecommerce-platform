import Analytics from "../modules/analytics/routes/analytics.route.js";
import authRoute from "../modules/auth/routes/auth.route.js";
import cartRoute from "../modules/carts/routes/cart.route.js";
import categoryRoute from "../modules/categories/routes/category.route.js";
import countryRoute from "../modules/countries/routes/country.route.js";
import couponsRoute from "../modules/coupons/routes/coupon.route.js";
import orderDetailRoute from "../modules/orderDetails/routes/orderDetail.route.js";
import shippingRoute from "../modules/shipping/routes/shipping.route.js";
import taxRoute from "../modules/taxes/routes/tax.route.js";
import returnRoute from "../modules/returns/routes/return.route.js";
import notificationRoute from "../modules/notifications/routes/notification.route.js";
import auditRoute from "../modules/audit/routes/audit.route.js";
import paymentRoute from "../modules/payments/routes/payment.route.js";
import productRoute from "../modules/products/routes/product.route.js";
import userRoutes from "../modules/users/routes/user.route.js";

const configureRoutes = (app) => {
  userRoutes(app);
  authRoute(app);
  productRoute(app);
  cartRoute(app);
  couponsRoute(app);
  paymentRoute(app);
  Analytics(app);
  categoryRoute(app);
  countryRoute(app);
  orderDetailRoute(app);
  shippingRoute(app);
  taxRoute(app);
  returnRoute(app);
  notificationRoute(app);
  auditRoute(app);
};

export default configureRoutes;
