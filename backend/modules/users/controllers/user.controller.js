import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { updateProfile, updatePassword } from "./userSettings.controller.js";

const User = db.model.User;

export const findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;

    const [data, count] = await Promise.all([
      User.find({}).select("-password").skip((page - 1) * pageSize).limit(pageSize),
      User.countDocuments({}),
    ]);

    successResponse(200, "SUCCESS", { data, totalRows: count }, res);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while Finding User",
      res
    );
  }
};

export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).send({ message: `Cannot find User with id=${id}.` });
    }
    successResponse(200, "SUCCESS", { user }, res);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while Finding User",
      res
    );
  }
};

export const deleteOne = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.send({ message: `Cannot delete User with id=${id}. Maybe User was not found!` });
    }
    return res.send({ data: result, message: "User deleted Successfully!" });
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while Deleting the User.",
      res
    );
  }
};

export const uploadImage = async (req, res) => {
  try {
    let imageFiles = req.file;
    res.send(imageFiles);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while uploading the image.",
      res
    );
  }
};

// Export the settings controller methods
export { updateProfile, updatePassword };
