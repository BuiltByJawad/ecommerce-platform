import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";

const Product = db.model.Product;

export const getCartProducts = async (req, res) => {
  try {
    const productIds = req.user.cartItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    // add quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (ci) => ci.product.toString() === product._id.toString()
      );
      return { ...product.toJSON(), quantity: item?.quantity || 1 };
    });
    successResponse(
      200,
      "SUCCESS",
      {
        cartItems,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while getting the cart item product",
      res
    );
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
    }
    await user.save();
    successResponse(200, "SUCCESS", { cartItems: user.cartItems }, res);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while adding the item to cart",
      res
    );
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    }
    await user.save();
    successResponse(200, "SUCCESS", { cartItems: user.cartItems }, res);
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while removing the item from cart",
      res
    );
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId
        );
      } else {
        existingItem.quantity = quantity;
      }
      await user.save();
      successResponse(200, "SUCCESS", { cartItems: user.cartItems }, res);
    } else {
      errorResponse(404, "ERROR", "Product not found in cart.", res);
    }
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while updating the quantity.",
      res
    );
  }
};
