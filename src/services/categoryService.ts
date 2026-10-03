import { apiFetch } from '@/lib/api';
import { Category } from '@/data/products';

interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

function mapCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    description: c.description || '',
    image: c.image || '',
    productCount: c.productCount,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiFetch<ApiCategory[]>('/categories', { auth: false });
  return (response.data || []).map(mapCategory);
}

export async function fetchCategory(id: string): Promise<Category> {
  const response = await apiFetch<ApiCategory>(`/categories/${id}`, { auth: false });
  return mapCategory(response.data as ApiCategory);
}
