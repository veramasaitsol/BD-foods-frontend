import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectWishlistItems, removeFromWishlist, clearWishlist, fetchWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { toast } from 'sonner';

const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const wishlistItems = useAppSelector(selectWishlistItems);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const handleRemoveFromWishlist = async (id: string, name: string) => {
    const result = await dispatch(removeFromWishlist(id));
    if (removeFromWishlist.fulfilled.match(result)) {
      toast.success(`${name} removed from wishlist`);
    } else {
      toast.error((result.payload as string) || 'Failed to remove from wishlist');
    }
  };

  const handleMoveToCart = async (item: typeof wishlistItems[0]) => {
    dispatch(addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      weight: item.weight,
    }));
    await dispatch(removeFromWishlist(item.id));
    toast.success(`${item.name} moved to cart!`);
  };

  const handleClearWishlist = async () => {
    const result = await dispatch(clearWishlist());
    if (clearWishlist.fulfilled.match(result)) {
      toast.success('Wishlist cleared');
    } else {
      toast.error((result.payload as string) || 'Failed to clear wishlist');
    }
  };

  return (
    <>
      <Helmet>
        <title>Wishlist - Brundhavanam Desi Foods</title>
        <meta name="description" content="Your saved products - Brundhavanam Desi Foods" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                    <Heart className="w-7 h-7 text-primary fill-primary" />
                    My Wishlist
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
              </div>
              {wishlistItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)}>
                  Clear All
                </Button>
              )}
            </div>

            {wishlistItems.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <Heart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Your wishlist is empty
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Save items you love by clicking the heart icon on any product
                </p>
                <Button onClick={() => navigate('/categories')}>
                  Browse Products
                </Button>
              </div>
            ) : (
              /* Wishlist Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
                  >
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="aspect-square overflow-hidden bg-secondary">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3">{item.weight}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-primary">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleMoveToCart(item)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear entire wishlist?</AlertDialogTitle>
              <AlertDialogDescription>
                All {wishlistItems.length} items will be removed from your wishlist. You can add them back later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearWishlist} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Footer />
      </div>
    </>
  );
};

export default Wishlist;
