import { apiFetch } from '@/lib/api';
import { Product, ProductVariant } from '@/data/products';

interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  weight: string | null;
  category: { id: string; name: string } | null;
  categoryId: string | null;
  stock: number;
  inStock: boolean;
  status: string;
  image: string | null;
  images: string[];
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  tags: string[];
  variants: ProductVariant[];
}

export interface ProductListParams {
  category?: string;
  search?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'priceLow' | 'priceHigh' | 'rating';
}

function mapProduct(p: ApiProduct): Product {
  const hasDiscount = p.discountedPrice !== null && Number(p.discountedPrice) < Number(p.price);
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: hasDiscount ? Number(p.discountedPrice) : Number(p.price),
    originalPrice: hasDiscount ? Number(p.price) : undefined,
    image: p.image || '',
    images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    category: p.categoryId !== null ? p.categoryId : '',
    categoryName: p.category?.name,
    weight: p.weight || '',
    rating: Number(p.rating) || 0,
    reviews: p.reviewCount || 0,
    inStock: p.inStock,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
    tags: p.tags || [],
    variants: p.variants || [],
  };
}

function buildQuery(params: ProductListParams): string {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.isFeatured !== undefined) query.set('isFeatured', String(params.isFeatured));
  if (params.isBestSeller !== undefined) query.set('isBestSeller', String(params.isBestSeller));
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchProducts(params: ProductListParams = {}): Promise<Product[]> {
  const response = await apiFetch<ApiProduct[]>(`/products${buildQuery(params)}`, { auth: false });
  return (response.data || []).map(mapProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await apiFetch<ApiProduct>(`/products/${id}`, { auth: false });
  return mapProduct(response.data as ApiProduct);
}
