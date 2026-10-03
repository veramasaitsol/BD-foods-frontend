import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts } from '@/services/productService';

const FeaturedProducts: React.FC = () => {
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['products', { isFeatured: true }],
    queryFn: () => fetchProducts({ isFeatured: true }),
  });

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Hand-picked for you
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">
              Featured Products
            </h2>
          </div>
          <Link 
            to="/categories" 
            className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link 
            to="/categories" 
            className="inline-flex items-center gap-2 text-primary font-medium"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
