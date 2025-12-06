import express from "express";
import { getSystemSettings, upsertSystemSettings } from "../controllers/systemSettings.controller.js";
import { protectedRoute, adminRoute } from "../../../middlewares/authJwt.js";

const systemSettingsRouter = express.Router();

systemSettingsRouter.get("/admin", protectedRoute, adminRoute, getSystemSettings);
systemSettingsRouter.put("/admin", protectedRoute, adminRoute, upsertSystemSettings);

export default (app) => {
  app.use("/api/system-settings", systemSettingsRouter);
};
