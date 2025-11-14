/**
 * Test utilities for React components
 * Provides common testing setup and helpers
 * @module test-utils
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../state';

/**
 * Custom render function that includes Redux provider
 * @param {ReactElement} ui - React element to render
 * @param {Object} options - Render options
 * @param {Object} options.preloadedState - Initial Redux state
 * @param {Object} options.store - Custom Redux store
 * @param {RenderOptions} options.renderOptions - Additional render options
 * @returns {Object} Rendered component with testing utilities
 */
const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  }: {
    preloadedState?: Partial<RootState>;
    store?: ReturnType<typeof configureStore>;
  } & Omit<RenderOptions, 'wrapper'> = {}
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

/**
 * Creates a mock Redux store for testing
 * @param {Object} initialState - Initial state for the store
 * @returns {Object} Configured Redux store
 */
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
};

/**
 * Mock user data for testing
 * @type {Object}
 */
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'John Doe',
  role: 'customer',
};

/**
 * Mock product data for testing
 * @type {Object}
 */
export const mockProduct = {
  _id: '456',
  name: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  category_name: 'Electronics',
  imageUrls: ['/test-image.jpg'],
  isInStock: true,
  rating: 4.5,
  totalRatings: 100,
};

/**
 * Common test data exports
 */
export { mockUser as user, mockProduct as product };

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
