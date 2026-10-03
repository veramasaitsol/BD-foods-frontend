import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { Product } from '@/data/products';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const isInWishlist = useAppSelector(selectIsInWishlist(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultVariant = product.variants?.[0];
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: defaultVariant ? defaultVariant.price : product.price,
      image: product.image,
      weight: product.weight,
      variantLabel: defaultVariant?.label,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      const result = await dispatch(removeFromWishlist(product.id));
      if (removeFromWishlist.fulfilled.match(result)) {
        toast.success(`${product.name} removed from wishlist`);
      } else {
        toast.error((result.payload as string) || 'Failed to remove from wishlist');
      }
    } else {
      const result = await dispatch(addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
        originalPrice: product.originalPrice,
      }));
      if (addToWishlist.fulfilled.match(result)) {
        toast.success(`${product.name} added to wishlist!`);
      } else {
        toast.error((result.payload as string) || 'Failed to add to wishlist');
      }
    }
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isBestSeller && (
            <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              Best Seller
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            isInWishlist 
              ? 'bg-primary/10 text-primary' 
              : 'bg-card/90 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 hover:bg-card'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-primary' : ''}`} />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <Button 
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 md:p-4">
        <div className="flex items-center gap-1 mb-1 sm:mb-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-spice-gold text-spice-gold" />
          <span className="text-xs sm:text-sm font-medium text-foreground">{product.rating}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews})</span>
        </div>

        <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1.5 sm:mb-3">{product.weight}</p>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base md:text-lg font-bold text-primary">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
