import express from "express";
import * as userController from "../controllers/user.controller.js";
import userPhotoUploadMulter from "../../../middlewares/uploadUserPhoto.js";
import { protectedRoute, verifyToken, adminRoute } from "../../../middlewares/authJwt.js";

const userRouter = express.Router();

userRouter.get("/all-users", protectedRoute, userController.findAll);
userRouter.get("/user/:id", protectedRoute, userController.findOne);
userRouter.put("/user/:id", protectedRoute, userController.updateProfile);
userRouter.put(
  "/user/:id/password",
  protectedRoute,
  userController.updatePassword
);
userRouter.delete("/user/:id", protectedRoute, userController.deleteOne);
userRouter.post(
  "/user/upload-image",
  userPhotoUploadMulter,
  userController.uploadImage
);
userRouter.get("/vendors", userController.listVendors);
userRouter.get("/vendors/:id/store", userController.getVendorStore);
userRouter.get(
  "/admin/vendors",
  protectedRoute,
  adminRoute,
  userController.adminListVendors
);
userRouter.put(
  "/admin/vendors/:id/status",
  protectedRoute,
  adminRoute,
  userController.adminUpdateVendorStatus
);
userRouter.get(
  "/admin/vendors/:id/permissions",
  protectedRoute,
  adminRoute,
  userController.adminGetVendorPermissions
);
userRouter.put(
  "/admin/vendors/:id/permissions",
  protectedRoute,
  adminRoute,
  userController.adminUpdateVendorPermissions
);
userRouter.put("/admin/users/:id/role", protectedRoute, adminRoute, userController.adminUpdateUserRole);
export default (app) => {
  app.use("/api/users", userRouter);
};

