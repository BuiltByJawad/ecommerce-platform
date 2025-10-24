import express from "express";
import * as categoryController from "../controllers/category.controller.js";

import {
  adminRoute,
  companyRoute,
  protectedRoute,
  verifyToken,
} from "../../../middlewares/authJwt.js";

const categoryRouter = express.Router();

categoryRouter.post(
  "/create",
  protectedRoute,
  adminRoute,
  categoryController.createCategory
);
categoryRouter.get(
  "/all-categories",
  protectedRoute,
  categoryController.findAllCategories
);
categoryRouter.get(
  "/:category",
  categoryController.findProductsByCategory
);
export default (app) => {
  app.use("/api/categories", categoryRouter);
};
