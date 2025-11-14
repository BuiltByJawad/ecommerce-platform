import RolePermission from "../models/rolePermission.model.js";

const defaultPermissions = {
  admin: [
    { id: "dashboard", name: "Admin Dashboard", activities: { view: true } },
    { id: "categories", name: "Categories", activities: { view: true, edit: true, delete: true, add: true } },
    { id: "moderation", name: "Product Moderation", activities: { view: true, edit: true } },
    { id: "users", name: "Users", activities: { view: true, edit: true, delete: true, add: true } },
    { id: "companies", name: "Companies", activities: { view: true, edit: true, delete: true, add: true } },
    { id: "payments", name: "Payments", activities: { view: true } },
    { id: "transactions", name: "Transactions", activities: { view: true } },
    { id: "permissions", name: "Role Permissions", activities: { view: true, edit: true } },
    { id: "settings", name: "Settings", activities: { view: true, edit: true } },
  ],
  company: [
    { id: "dashboard", name: "Business Dashboard", activities: { view: true } },
    { id: "products", name: "Products", activities: { view: true, edit: true, delete: true, add: true } },
    { id: "orders", name: "Orders", activities: { view: true, edit: true } },
  ],
  customer: [
    { id: "dashboard", name: "Home", activities: { view: true } },
  ],
};

export const ensureDefaults = async () => {
  const roles = Object.keys(defaultPermissions);
  for (const role of roles) {
    const exists = await RolePermission.findOne({ role });
    if (!exists) {
      await RolePermission.create({ role, modules: defaultPermissions[role] });
    }
  }
};

export const getAll = async (req, res) => {
  await ensureDefaults();
  const docs = await RolePermission.find();
  res.json(docs);
};

export const getByRole = async (req, res) => {
  await ensureDefaults();
  const role = req.params.role;
  const doc = await RolePermission.findOne({ role });
  if (!doc) return res.status(404).json({ message: "Role not found" });
  res.json(doc);
};

export const upsertByRole = async (req, res) => {
  const role = req.params.role;
  const { modules } = req.body || {};
  if (!Array.isArray(modules)) {
    return res.status(400).json({ message: "modules array is required" });
  }
  const updated = await RolePermission.findOneAndUpdate(
    { role },
    { $set: { modules } },
    { upsert: true, new: true }
  );
  res.json(updated);
};