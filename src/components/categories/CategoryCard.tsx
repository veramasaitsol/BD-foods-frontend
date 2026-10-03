import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/data/products';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      to={`/categories/${category.id}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block"
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-3 sm:p-4 md:p-5 flex flex-col justify-end">
        <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
          <h3 className="font-display text-sm sm:text-lg md:text-xl font-bold text-primary-foreground mb-0.5 sm:mb-1 line-clamp-1">
            {category.name}
          </h3>
          <p className="text-primary-foreground/70 text-[10px] sm:text-xs md:text-sm line-clamp-1 sm:line-clamp-2 mb-1.5 sm:mb-3">
            {category.description}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 text-primary text-[10px] sm:text-xs md:text-sm font-medium">
            <span>{category.productCount} Products</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
