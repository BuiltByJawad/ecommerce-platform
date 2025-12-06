import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialStateTypes, Product, User } from '@/types/types';

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  currentUser: null,
  cartItems: {}, // { [key: string]: { product: Product; quantity: number } }
  loading: false,
  notificationsMuted: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const productId = product._id as string;
      if (!productId) {
        return; // no-op if product id missing
      }

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
    setNotificationsMuted: (state, action: PayloadAction<boolean>) => {
      state.notificationsMuted = action.payload;
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
  setNotificationsMuted,
} = globalSlice.actions;
export default globalSlice.reducer;
