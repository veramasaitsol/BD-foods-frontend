import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import CategoryCard from '@/components/categories/CategoryCard';
import { Button } from '@/components/ui/button';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';

type SortOption = 'popular' | 'price-low' | 'price-high';

const sortToApiSort: Record<SortOption, 'rating' | 'priceLow' | 'priceHigh'> = {
  popular: 'rating',
  'price-low': 'priceLow',
  'price-high': 'priceHigh',
};

const Categories: React.FC = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', { category: categoryId, sort: sortBy, search }],
    queryFn: () => fetchProducts({ category: categoryId, sort: sortToApiSort[sortBy], search: search || undefined, limit: 100 }),
  });

  const currentCategory = categoryId
    ? categories.find(c => c.id === categoryId)
    : null;

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <>
      <Helmet>
        <title>
          {search
            ? `Search: ${search} - Brundhavanam Desi Foods`
            : currentCategory
            ? `${currentCategory.name} - Brundhavanam Desi Foods`
            : 'Shop All Products - Brundhavanam Desi Foods'}
        </title>
        <meta
          name="description"
          content={currentCategory?.description || 'Browse our complete collection of authentic Indian pickles, spices, sweets, and snacks.'}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              {search ? (
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Search results for "{search}"
                </h1>
              ) : currentCategory ? (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {currentCategory.name}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {currentCategory.description}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Shop All Products
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Explore our complete collection of authentic Indian foods
                  </p>
                </>
              )}
            </div>

            {/* Show category cards if browsing without a category or search */}
            {!categoryId && !search && (
              <div className="mb-12">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Browse Categories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredProducts.length}</span> products
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-secondary rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={categoryId === cat.id ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => window.location.href = `/categories/${cat.id}`}
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground">Loading products…</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {search ? `No products found for "${search}".` : 'No products found in this category.'}
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Categories;
