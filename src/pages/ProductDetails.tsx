import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductReviews from '@/components/products/ProductReviews';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, selectCartItems, updateQuantity } from '@/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { fetchProduct, fetchProducts } from '@/services/productService';
import { ProductVariant } from '@/data/products';
import { toast } from 'sonner';

const ProductDetails: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId as string),
    enabled: !!productId,
  });

  const { data: relatedCandidates = [] } = useQuery({
    queryKey: ['products', { category: product?.category }],
    queryFn: () => fetchProducts({ category: product?.category }),
    enabled: !!product?.category,
  });

  const isInWishlist = useAppSelector(selectIsInWishlist(product?.id || ''));
  const cartItems = useAppSelector(selectCartItems);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariant(product?.variants?.[0] ?? null);
  }, [product?.id]);

  // Keep the quantity stepper in sync with what's already in the cart for
  // this exact product + variant, instead of always starting back at 1.
  const cartItemForSelection = product
    ? cartItems.find(i => i.id === product.id && i.variantLabel === (selectedVariant?.label))
    : undefined;

  useEffect(() => {
    setQuantity(cartItemForSelection?.quantity ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, selectedVariant?.label]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading product…
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/categories')}>Browse Products</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = relatedCandidates
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const images = product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    const price = selectedVariant ? selectedVariant.price : product.price;
    if (cartItemForSelection) {
      // Already in the cart — set it to the quantity shown here rather than
      // adding this amount on top, since the stepper displays the live total.
      dispatch(updateQuantity({ id: product.id, variantLabel: selectedVariant?.label, quantity }));
      toast.success(`Cart updated — ${quantity} × ${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ''}`);
    } else {
      for (let i = 0; i < quantity; i++) {
        dispatch(addItem({
          id: product.id,
          name: product.name,
          price,
          image: product.image,
          weight: product.weight,
          variantLabel: selectedVariant?.label,
        }));
      }
      toast.success(`${quantity} × ${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ''} added to cart!`);
    }
  };

  const handleToggleWishlist = async () => {
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
    <>
      <Helmet>
        <title>{product.name} - Brundhavanam Desi Foods</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3">
                    {images.map((img, index) => (
                      <button
                        key={img}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-primary'
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  {product.isBestSeller && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      Best Seller
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) 
                            ? 'fill-spice-gold text-spice-gold' 
                            : 'text-border'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">
                    ₹{selectedVariant ? selectedVariant.price : product.price}
                  </span>
                  {!selectedVariant && product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  <span className="text-muted-foreground">/ {selectedVariant ? selectedVariant.label : product.weight}</span>
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <span className="font-medium block mb-2">Pack Size:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.label}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={variant.stock <= 0}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            selectedVariant?.label === variant.label
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {variant.label} · ₹{variant.price}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {product.description}
                </p>

                {/* Tags */}
                {product.tags && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {product.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 bg-secondary text-sm text-muted-foreground rounded-full capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center gap-3 bg-secondary rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-8">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1"
                    size="lg"
                    disabled={!!selectedVariant && selectedVariant.stock <= 0}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemForSelection ? 'Update Cart' : 'Add to Cart'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleToggleWishlist}
                    className={isInWishlist ? 'text-primary border-primary' : ''}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-primary' : ''}`} />
                  </Button>
                </div>


                {/* Features */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <span className="text-sm">Free delivery above ₹500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-sm">100% Authentic</span>
                  </div>
                </div>
              </div>
            </div>

            <ProductReviews productId={product.id} />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="mt-16">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  You May Also Like
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {relatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetails;
