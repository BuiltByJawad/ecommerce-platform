import express from "express";
import { protectedRoute, adminRoute } from "../../../middlewares/authJwt.js";
import { getAll, getByRole, upsertByRole } from "../controllers/permission.controller.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAll);
router.get("/:role", protectedRoute, getByRole); // allow authenticated to read own role
router.put("/:role", protectedRoute, adminRoute, upsertByRole);

export default (app) => {
  app.use("/api/permissions", router);
};