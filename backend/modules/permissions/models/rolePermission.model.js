import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    add: { type: Boolean, default: false },
  },
  { _id: false }
);

const ModuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String },
    activities: { type: ActivitySchema, default: () => ({}) },
  },
  { _id: false }
);

const RolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "company", "customer"],
      unique: true,
      required: true,
    },
    modules: { type: [ModuleSchema], default: [] },
  },
  { collection: "rolePermissions", timestamps: true }
);

const RolePermission = mongoose.model("RolePermission", RolePermissionSchema);
export default RolePermission;