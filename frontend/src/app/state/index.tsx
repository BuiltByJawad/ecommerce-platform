import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialStateTypes, Product } from '@/types/types';

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  currentUser: {},
  cartItems: {}, // { [key: string]: { product: Product; quantity: number } }
  loading: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<object>) => {
      state.currentUser = action.payload;
    },
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const productId = product._id;

      // If cartItems[productId] exists, increment quantity; otherwise, initialize
      if (state.cartItems[productId]) {
        state.cartItems[productId].quantity += 1;
      } else {
        state.cartItems[productId] = { product, quantity: 1 };
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.cartItems[productId]) {
        const newQuantity = state.cartItems[productId].quantity - 1;
        if (newQuantity <= 0) {
          const { [productId]: _, ...rest } = state.cartItems;
          state.cartItems = rest;
        } else {
          state.cartItems[productId].quantity = newQuantity;
        }
      }
    },
    clearCartItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const { [productId]: _, ...rest } = state.cartItems;
      state.cartItems = rest;
    },
    clearCart: (state) => {
      state.cartItems = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setIsSidebarCollapsed,
  setCurrentUser,
  addToCart,
  removeFromCart,
  clearCartItem,
  clearCart,
  setLoading,
} = globalSlice.actions;
export default globalSlice.reducer;
