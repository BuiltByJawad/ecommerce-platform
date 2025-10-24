import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import Product from "../../products/models/product.model.js";

const Category = db.model.Category;

export const createCategory = async (req, res) => {
  try {
    const { name, description, requiresApproval, allowedUsers, attributes } =
      req.body;

    // Validation for required fields
    if (!name || !description || !attributes) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Please provide required fields: category name, description and at least one attribute.",
        res
      );
    }

    // Validate attributes if provided
    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        const { name, type, options } = attr;
        if (!name || !type) {
          return errorResponse(
            400,
            "VALIDATION_ERROR",
            "All attributes must have a name and type.",
            res
          );
        }
        if (
          type === "select" &&
          (!options || !Array.isArray(options) || options.length === 0)
        ) {
          return errorResponse(
            400,
            "VALIDATION_ERROR",
            `Options array cannot be empty for select type attribute: ${name}.`,
            res
          );
        }
      }
    }

    // Filter out empty strings, null, and undefined values from allowedUsers
    const filteredAllowedUsers = allowedUsers
      ? allowedUsers.filter(
          (email) =>
            email !== null &&
            email !== undefined &&
            typeof email === "string" &&
            email.trim() !== ""
        )
      : [];

    // Validate only the non-empty emails
    if (filteredAllowedUsers.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = filteredAllowedUsers.filter(
        (email) => !emailRegex.test(email.trim())
      );

      if (invalidEmails.length > 0) {
        return errorResponse(
          400,
          "VALIDATION_ERROR",
          `Invalid email addresses: ${invalidEmails.join(", ")}.`,
          res
        );
      }
    }

    // Prepare category data
    const newCategoryData = {
      name,
      description,
      requiresApproval: requiresApproval ?? true,
      allowedUsers: filteredAllowedUsers,
      attributes: attributes || [],
    };

    const category = await Category.create(newCategoryData);

    successResponse(
      201,
      "SUCCESS",
      {
        category,
        message: "Category created successfully",
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message ||
        "An unexpected error occurred while creating the category.",
      res
    );
  }
};

export const findAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    successResponse(
      200,
      "SUCCESS",
      {
        categories,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while finding categories",
      res
    );
  }
};

export const findProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    successResponse(
      200,
      "SUCCESS",
      {
        products,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message ||
        "Some error occurred while finding the category of products",
      res
    );
  }
};

export const toggleFeaturedProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();

      successResponse(
        200,
        "SUCCESS",
        {
          updatedProduct,
        },
        res
      );
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message ||
        "Some error occurred while updating the product to featured",
      res
    );
  }
};

export const deleteOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the product by ID
    const product = await Product.findById(id);
    if (product) {
      // Only delete the product
      if (product.image) {
        const publicId = product.image.split("/").pop().split(".")[0]; // this will get the id of the image
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (error) {}
      }
      await Product.findByIdAndDelete(id);

      return res.json({
        data: product,
        message: "Product deleted successfully!",
      });
    } else {
      res.status(404).json({
        message: `Cannot delete Product with id=${id}. Product not found!`,
      });
    }
  } catch (err) {
    errorHandler(
      500,
      "ERROR",
      err.message || "Some error occurred while deleting the product.",
      res
    );
  }
};

export const uploadImage = async (req, res) => {
  try {
    let imageFiles = req.file;

    res.send(imageFiles);
  } catch (err) {
    errorHandler(
      500,
      "ERROR",
      err.message ||
        "Some error occurred while Finding Users By Date_of_Birth.",
      res
    );
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred in featured product update cache",
      res
    );
  }
}
