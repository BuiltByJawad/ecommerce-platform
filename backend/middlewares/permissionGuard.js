import RolePermission from "../modules/permissions/models/rolePermission.model.js";

const cache = new Map(); // role -> { modules }
const CACHE_TTL_MS = 60 * 1000;

const getFromCache = (role) => {
  const entry = cache.get(role);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL_MS) {
    cache.delete(role);
    return null;
  }
  return entry.value;
};

const setCache = (role, value) => {
  cache.set(role, { value, time: Date.now() });
};

export const invalidatePermissionCache = (role) => {
  if (role) cache.delete(role);
  else cache.clear();
};

const fetchRolePermissions = async (role) => {
  const cached = getFromCache(role);
  if (cached) return cached;
  const doc = await RolePermission.findOne({ role });
  const value = doc ? doc.modules : [];
  setCache(role, value);
  return value;
};

export const requirePermission = (moduleId, activityKey = "view") => {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return res.status(401).json({ message: "Unauthorized" });
      const modules = await fetchRolePermissions(role);
      const mod = modules.find((m) => m.id === moduleId);
      if (mod && mod.activities && mod.activities[activityKey]) {
        return next();
      }
      return res.status(403).json({ message: "Forbidden - insufficient permission" });
    } catch (e) {
      return res.status(500).json({ message: "Internal error" });
    }
  };
};