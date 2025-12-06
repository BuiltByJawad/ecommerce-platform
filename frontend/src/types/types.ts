import { NextRouter } from 'next/router';

export interface ThemeState {
  theme: string;
}

export interface AxiosContextReturn {
  post: (url: string, data?: object) => Promise<any>;
  loading: boolean;
}

export interface ProductImageUploaderProps {
  isEditingForm: boolean;
}

export interface DecodedToken {
  userRole: string;
  userVerified: boolean;
}

export interface RoleRoutes {
  [key: string]: string[];
}

export interface User {
  cartItems: [];
  email: string;
  f_name: string;
  id: string;
  isVerified: boolean;
  l_name: string;
  role: string;
  company_name?: string;
  tax_id?: string;
  phone?: string;
  address?: string;
  business_type?: string;
  vendorStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  permissions?: string[];
}

export interface UserState {
  currentUser: User | null;
}

export interface Vendor {
  _id: string;
  f_name?: string;
  l_name?: string;
  email: string;
  company_name?: string;
  tax_id?: string;
  phone?: string;
  address?: string;
  business_type?: string;
  isVerified?: boolean;
  vendorStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt?: string;
}

export interface Attribute {
  name: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface Category {
  _id: string;
  name: string;
  attributes: Attribute[];
}

export interface AddProductFormProps {
  theme: string;
  router: NextRouter;
}

export interface Product {
  _id?: string;
  category: Category | string;
  category_name: string;
  name: string;
  price: number | string;
  imageUrls?: string[];
  imageFiles?: { file: File }[];
  description: string;
  brand: string;
  features: string[];
  attributes?: {
    [key: string]: string | string[];
  };
  isInStock?: boolean;
  discountedPrice?: number | string;
  cloudinaryPublicIds?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  seller?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchInfo: {
    query: string;
    category: string;
    resultsCount: number;
  };
}

export interface ProductDetailsSectionProps {
  product: Product;
  totalRatings: number;
  ratingDistribution: number[];
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  currentUser: User | null;
  cartItems: {
    [key: string]: CartItem;
  };
  loading: boolean;
  notificationsMuted: boolean;
}

export interface Attribute {
  name: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface CategoryFormData {
  name: string;
  description: string;
  requiresApproval: boolean;
  allowedUsers: string[];
  attributes: Attribute[];
}

export interface CategoryFormProps {
  theme: string;
}

export interface CustomInputFieldProps {
  name: string;
  label: string;
  type?: string;
  as?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}
