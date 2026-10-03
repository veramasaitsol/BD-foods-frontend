// Frontend-facing Product/Category shapes. The hardcoded sample data that used
// to live here has been replaced by real API calls — see
// src/services/productService.ts and src/services/categoryService.ts, which
// fetch from the backend and normalize its response into these shapes.

export interface ProductVariant {
  label: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  categoryName?: string;
  weight: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}
