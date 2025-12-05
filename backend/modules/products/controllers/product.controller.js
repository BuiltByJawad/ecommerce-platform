import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";
import { redis } from "../../../lib/redis.js";
import cloudinary from "../../../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Category from "../../categories/models/category.model.js";

export const createProduct = async (req, res) => {
  try {
    const {
      category,
      name,
      description,
      price,
      discountedPrice,
      brand,
      attributes,
      features,
      imageFiles,
      isInStock,
    } = req.body;

    // Validation
    if (!name || !description || !price || !brand || !category || !features) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Please provide all required fields: name, description, price, brand, category, and features.",
        res
      );
    }

    // Validate category exists and derive category_name
    const categoryDoc = await Category.findById(category).lean();
    if (!categoryDoc) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid category id", res);
    }

    // Check if user is allowed to list in this category (for company users)
    if (req.user && req.user.role === "company") {
      if (categoryDoc.allowedUsers && categoryDoc.allowedUsers.length > 0) {
        const userEmail = req.user.email;
        if (!categoryDoc.allowedUsers.includes(userEmail)) {
          return errorResponse(
            403,
            "FORBIDDEN",
            `You are not authorized to list products in the "${categoryDoc.name}" category. This category is restricted to specific users.`,
            res
          );
        }
      }
    }

    if (!imageFiles || imageFiles.length === 0) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "At least one product image is required.",
        res
      );
    }

    // Validate image data structure
    const isValidImageData = imageFiles.every(
      (img) => img.url && img.publicId && typeof img.url === "string"
    );

    if (!isValidImageData) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid image data format.",
        res
      );
    }

    // Validate attributes
    if (
      !attributes ||
      typeof attributes !== "object" ||
      Object.keys(attributes).length === 0
    ) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Attributes must be a non-empty object.",
        res
      );
    }

    // Validate attribute values
    const isValidAttributes = Object.values(attributes).every((value) =>
      Array.isArray(value)
        ? value.every((item) => typeof item === "string")
        : typeof value === "string"
    );

    if (!isValidAttributes) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Attribute values must be strings or arrays of strings.",
        res
      );
    }

    // Extract image URLs for database storage
    const imageUrls = imageFiles.map((img) => img.url);

    const newProductData = {
      category, // category id as string
      category_name: categoryDoc.name,
      name,
      description,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
      brand,
      attributes, // stored as a Map by Mongoose
      features: Array.isArray(features) ? features : [],
      isInStock: Boolean(isInStock),
      imageUrls,
      cloudinaryPublicIds: imageFiles.map((img) => img.publicId),
    };

    // Marketplace: set seller and moderation status for company users
    if (req.user && req.user.role === "company") {
      newProductData.seller = req.user._id;
      // Check if category requires approval
      if (categoryDoc.requiresApproval) {
        newProductData.status = "pending"; // Requires admin approval
      } else {
        newProductData.status = "approved"; // Auto-approved
      }
    }

    const product = await Product.create(newProductData);

    const message = 
      req.user && req.user.role === "company"
        ? categoryDoc.requiresApproval
          ? "Product submitted for review"
          : "Product created and approved successfully"
        : "Product created successfully";

    successResponse(
      201,
      "SUCCESS",
      {
        product,
        message,
      },
      res
    );
  } catch (err) {
    console.error("Error creating product:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while creating the product.",
      res
    );
  }
};

// Update product with image handling (company updates revert to pending)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      brand,
      color,
      material,
      compatibleDevices,
      screenSize,
      dimensions,
      features,
      imageFiles,
      isInStock,
      discountedPrice,
      batteryLife,
      sensorType,
      batteryDescription,
    } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return errorResponse(404, "NOT_FOUND", "Product not found.", res);
    }

    // Ownership check for company users
    if (req.user?.role === "company") {
      if (!existingProduct.seller || String(existingProduct.seller) !== String(req.user._id)) {
        return errorResponse(403, "FORBIDDEN", "You do not have permission to update this product.", res);
      }
    }

    const updateData = {
      name,
      description,
      price: price ? parseFloat(price) : existingProduct.price,
      brand,
      color,
      material,
      compatibleDevices,
      screenSize,
      dimensions,
      features: Array.isArray(features) ? features : existingProduct.features,
      isInStock:
        isInStock !== undefined
          ? Boolean(isInStock)
          : existingProduct.isInStock,
      discountedPrice:
        discountedPrice ? parseFloat(discountedPrice) : existingProduct.discountedPrice,
      batteryLife,
      sensorType,
      batteryDescription,
    };

    // Company updates should re-trigger moderation based on category settings
    if (req.user?.role === "company") {
      // Check the product's category approval requirement
      const categoryDoc = await Category.findById(existingProduct.category).lean();
      if (categoryDoc) {
        if (categoryDoc.requiresApproval) {
          updateData.status = "pending";
          updateData.approvedBy = undefined;
          updateData.approvedAt = undefined;
          updateData.rejectionReason = undefined;
        }
        // If category doesn't require approval, keep status as approved (unless it was rejected)
        else if (existingProduct.status !== "rejected") {
          updateData.status = "approved";
        }
      }
    }

    // Handle image updates if provided
    if (imageFiles && Array.isArray(imageFiles)) {
      const isValidImageData = imageFiles.every(
        (img) => img.url && img.publicId && typeof img.url === "string"
      );

      if (!isValidImageData) {
        return errorResponse(
          400,
          "VALIDATION_ERROR",
          "Invalid image data format.",
          res
        );
      }

      updateData.imageUrls = imageFiles.map((img) => img.url);
      updateData.cloudinaryPublicIds = imageFiles.map((img) => img.publicId);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    successResponse(
      200,
      "SUCCESS",
      {
        product: updatedProduct,
        message: "Product updated successfully",
      },
      res
    );
  } catch (err) {
    console.error("Error updating product:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while updating the product.",
      res
    );
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Public ID is required.",
        res
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      successResponse(
        200,
        "SUCCESS",
        {
          message: "Image deleted successfully",
          publicId,
        },
        res
      );
    } else {
      errorResponse(
        400,
        "DELETE_FAILED",
        "Failed to delete image from Cloudinary.",
        res
      );
    }
  } catch (err) {
    console.error("Error deleting image:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while deleting the image.",
      res
    );
  }
};

// Delete product with cleanup
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(404, "NOT_FOUND", "Product not found.", res);
    }

    // Delete associated images from Cloudinary
    if (product.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
      try {
        await Promise.all(
          product.cloudinaryPublicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId)
          )
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError
        );
        // Continue with product deletion even if image cleanup fails
      }
    }

    await Product.findByIdAndDelete(id);

    successResponse(
      200,
      "SUCCESS",
      {
        message: "Product and associated images deleted successfully",
      },
      res
    );
  } catch (err) {
    console.error("Error deleting product:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while deleting the product.",
      res
    );
  }
};

// Get all products with pagination and filtering
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      color,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Build filter query
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (color) query.color = { $regex: color, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (inStock !== undefined) query.isInStock = inStock === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    successResponse(
      200,
      "SUCCESS",
      {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      res
    );
  } catch (err) {
    console.error("Error fetching products:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while fetching products.",
      res
    );
  }
};

// Get single product (public: only approved)
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();
    if (!product || product.status !== "approved") {
      return errorResponse(404, "NOT_FOUND", "Product not found.", res);
    }

    successResponse(200, "SUCCESS", { product }, res);
  } catch (err) {
    console.error("Error fetching product:", err);
    errorResponse(
      500,
      "SERVER_ERROR",
      err.message || "An unexpected error occurred while fetching the product.",
      res
    );
  }
};

export const findAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
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
      err.message || "Some error occurred while finding products",
      res
    );
  }
};

export const findAllFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products"); //find featured products in redis
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    //if featured products not in redis
    featuredProducts = await Product.find({ isFeatured: true, status: "approved" }).lean(); //find all featured products from database
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    //after finding store in redis
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    successResponse(
      200,
      "SUCCESS",
      {
        featuredProducts,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while finding featured products",
      res
    );
  }
};

export const findAllRecommendedProducts = async (req, res) => {
  try {
    const recommendedProducts = await Product.aggregate([
      { $match: { status: "approved" } },
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          imageUrls: 1,
          price: 1,
        },
      },
    ]);
    successResponse(
      200,
      "SUCCESS",
      {
        recommendedProducts,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while finding recommended products",
      res
    );
  }
};

export const findProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category, status: "approved" });
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
    errorResponse(
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
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while uploading the image.",
      res
    );
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query, category, page = 1, limit = 20 } = req.query;

    // Validate search query
    if (!query || query.trim() === "") {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Search query is required",
        res
      );
    }

    const searchTerm = query.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search criteria
    let searchCriteria = {
      isInStock: true, // Only show in-stock items
      status: "approved",
    };

    // Category filter
    if (category && category !== "all") {
      searchCriteria.category = category;
    }

    // Create text search conditions
    const textSearchConditions = [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { brand: { $regex: searchTerm, $options: "i" } },
      { category: { $regex: searchTerm, $options: "i" } },
      { category_name: { $regex: searchTerm, $options: "i" } },
      { features: { $elemMatch: { $regex: searchTerm, $options: "i" } } },
    ];

    // Add attributes search for common attribute keys
    const commonAttributes = ["color", "size", "material", "type", "style"];
    commonAttributes.forEach((attr) => {
      textSearchConditions.push({
        [`attributes.${attr}`]: { $regex: searchTerm, $options: "i" },
      });
    });

    // Combine search criteria
    searchCriteria.$or = textSearchConditions;

    // Execute search with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(searchCriteria)
        .select("-cloudinaryPublicIds")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(searchCriteria),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    successResponse(
      200,
      "SUCCESS",
      {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
        },
        searchInfo: {
          query: searchTerm,
          category: category || "all",
          resultsCount: products.length,
        },
      },
      res
    );
  } catch (error) {
    console.error("Search error:", error);
    errorResponse(
      500,
      "SERVER_ERROR",
      error.message || "An error occurred while searching products",
      res
    );
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true, status: "approved" }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.error("Error updating featured products cache:", error);
  }
}

// Company: list own products with pagination and totals
export const getMyProducts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { seller: req.user._id };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total, distinctCategories, pendingCount, approvedCount, rejectedCount] =
      await Promise.all([
        Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Product.countDocuments(query),
        Product.distinct("category", query),
        Product.countDocuments({ seller: req.user._id, status: "pending" }),
        Product.countDocuments({ seller: req.user._id, status: "approved" }),
        Product.countDocuments({ seller: req.user._id, status: "rejected" }),
      ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    successResponse(
      200,
      "SUCCESS",
      {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        totals: {
          products: total,
          categories: distinctCategories.length,
        },
        statusTotals: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      },
      res
    );
  } catch (err) {
    errorResponse(500, "ERROR", err.message || "Failed to fetch seller products", res);
  }
};

// Admin: list pending products (with pagination)
export const listPendingProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const criteria = { status: "pending" };
    if (q) {
      criteria.$or = [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category_name: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(criteria).sort({ createdAt: 1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(criteria),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    successResponse(200, "SUCCESS", {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    }, res);
  } catch (err) {
    errorResponse(500, "ERROR", err.message || "Failed to fetch pending products", res);
  }
};

// Admin: approve product
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { status: "approved", approvedBy: req.user._id, approvedAt: new Date(), rejectionReason: undefined },
      { new: true }
    );
    if (!product) return errorResponse(404, "NOT_FOUND", "Product not found", res);
    await updateFeaturedProductsCache();
    successResponse(200, "SUCCESS", { product, message: "Product approved" }, res);
  } catch (err) {
    errorResponse(500, "ERROR", err.message || "Failed to approve product", res);
  }
};

// Admin: reject product
export const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      { status: "rejected", rejectionReason: reason || "" },
      { new: true }
    );
    if (!product) return errorResponse(404, "NOT_FOUND", "Product not found", res);
    successResponse(200, "SUCCESS", { product, message: "Product rejected" }, res);
  } catch (err) {
    errorResponse(500, "ERROR", err.message || "Failed to reject product", res);
  }
};

// Company: get single own product
export const getMyProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) return errorResponse(404, "NOT_FOUND", "Product not found", res);
    if (!product.seller || String(product.seller) !== String(req.user._id)) {
      return errorResponse(403, "FORBIDDEN", "You do not have access to this product", res);
    }
    successResponse(200, "SUCCESS", { product }, res);
  } catch (err) {
    errorResponse(500, "ERROR", err.message || "Failed to fetch product", res);
  }
};
