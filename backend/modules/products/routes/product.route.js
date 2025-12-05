import express from "express";
import * as productController from "../controllers/product.controller.js";
import userPhotoUploadMulter from "../../../middlewares/uploadUserPhoto.js";
import {
  adminRoute,
  companyRoute,
  protectedRoute,
  requirePermission,
  verifyToken,
} from "../../../middlewares/authJwt.js";

const productRouter = express.Router();

productRouter.post(
  "/create",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_PRODUCTS"),
  productController.createProduct
);

// Seller endpoints
productRouter.get(
  "/mine",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_PRODUCTS"),
  productController.getMyProducts
);

// Admin moderation endpoints
productRouter.get(
  "/moderation/pending",
  protectedRoute,
  adminRoute,
  productController.listPendingProducts
);
productRouter.put(
  "/moderation/approve/:id",
  protectedRoute,
  adminRoute,
  productController.approveProduct
);
productRouter.put(
  "/moderation/reject/:id",
  protectedRoute,
  adminRoute,
  productController.rejectProduct
);

productRouter.get(
  "/all-products",
  // protectedRoute,
  // companyRoute,
  productController.findAllProducts
);
productRouter.get(
  "/featured-products",
  productController.findAllFeaturedProducts
);
productRouter.get(
  "/recommendations",
  productController.findAllRecommendedProducts
);
productRouter.get("/search", productController.searchProducts);
productRouter.get(
  "/:category",
  productController.findProductsByCategory
);

// Company: get own product by id
productRouter.get(
  "/mine/:id",
  protectedRoute,
  companyRoute,
  productController.getMyProductById
);
productRouter.put(
  "/:id",
  protectedRoute,
  adminRoute,
  productController.toggleFeaturedProducts
);

// Company: update own product
productRouter.put(
  "/company/:id",
  protectedRoute,
  companyRoute,
  requirePermission("MANAGE_PRODUCTS"),
  productController.updateProduct
);
productRouter.delete(
  "/:id",
  protectedRoute,
  adminRoute,
  productController.deleteProduct
);
productRouter.post(
  "/product/upload-image",
  userPhotoUploadMulter,
  productController.uploadImage
);
export default (app) => {
  app.use("/api/products", productRouter);
};
