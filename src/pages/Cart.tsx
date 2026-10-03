import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartItems, selectTotalPrice, updateQuantity, removeItem } from '@/store/slices/cartSlice';
import { setShowLoginModal } from '@/store/slices/authSlice';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const deliveryFee = totalPrice >= 500 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      dispatch(setShowLoginModal(true));
      return;
    }
    navigate('/checkout/address');
  };

  return (
    <>
      <Helmet>
        <title>Shopping Cart - Brundhavanam Desi Foods</title>
        <meta name="description" content="Review your cart and proceed to checkout." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Shopping Cart
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button asChild>
                  <Link to="/categories">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.variantLabel ?? ''}`}
                      className="flex gap-4 p-4 bg-card rounded-xl shadow-soft"
                    >
                      <Link to={`/product/${item.id}`} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover"
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {(item.variantLabel || item.weight) && (
                          <p className="text-sm text-muted-foreground mt-0.5">{item.variantLabel || item.weight}</p>
                        )}
                        <p className="text-lg font-bold text-primary mt-2">₹{item.price}</p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, variantLabel: item.variantLabel, quantity: item.quantity - 1 }))}
                              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, variantLabel: item.variantLabel, quantity: item.quantity + 1 }))}
                              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => dispatch(removeItem({ id: item.id, variantLabel: item.variantLabel }))}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 bg-card rounded-xl shadow-soft p-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6">
                      Order Summary
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className={`font-medium ${deliveryFee === 0 ? 'text-primary' : ''}`}>
                          {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                        </span>
                      </div>
                      {deliveryFee > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Add ₹{500 - totalPrice} more for free delivery
                        </p>
                      )}
                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="text-xl font-bold text-primary">₹{finalTotal}</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCheckout} className="w-full" size="lg">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <div className="mt-4 text-center">
                      <Link 
                        to="/categories" 
                        className="text-sm text-primary hover:underline"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Cart;
