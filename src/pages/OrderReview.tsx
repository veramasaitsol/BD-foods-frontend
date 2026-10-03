import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Smartphone, Check, ChevronLeft, Package, Loader2, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSelectedAddress } from '@/store/slices/addressSlice';
import { selectCartItems, selectTotalPrice, clearCart } from '@/store/slices/cartSlice';
import { setPaymentMethod, placeOrderAsync, selectCurrentPaymentMethod, selectIsPlacingOrder, PaymentMethod } from '@/store/slices/orderSlice';
import { clearServerCart, addServerCartItem } from '@/services/cartService';
import { useToast } from '@/hooks/use-toast';

const OrderReview: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const selectedAddress = useAppSelector(selectSelectedAddress);
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectTotalPrice);
  const paymentMethod = useAppSelector(selectCurrentPaymentMethod);
  const isPlacingOrder = useAppSelector(selectIsPlacingOrder);

  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when your order arrives' },
    { id: 'upi', label: 'UPI Payment', icon: Smartphone, description: 'Pay using Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Pay securely with your card' },
  ];

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "No address selected",
        description: "Please go back and select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Sync the local cart into the server cart before placing the order,
      // since the cart itself stays localStorage-first (see cartSlice.ts).
      await clearServerCart();
      for (const item of cartItems) {
        await addServerCartItem(item.id, item.quantity);
      }

      const result = await dispatch(placeOrderAsync({
        addressId: selectedAddress.id,
        paymentMethod,
      }));

      if (placeOrderAsync.fulfilled.match(result)) {
        dispatch(clearCart());
        toast({
          title: "Order Placed Successfully! 🎉",
          description: "Thank you for your order. You will receive a confirmation shortly.",
        });
        navigate(`/orders/${result.payload.id}`);
      } else {
        toast({
          title: "Could not place order",
          description: (result.payload as string) || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Could not place order",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (!selectedAddress) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-muted/30 py-8">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Address Selected</h1>
            <p className="text-muted-foreground mb-6">Please select a delivery address first</p>
            <Button onClick={() => navigate('/checkout/address')}>
              Select Address
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Review Order - Brundhavanam Desi Foods</title>
        <meta name="description" content="Review your order and select payment method" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Address</span>
            </div>
            <div className="w-12 h-0.5 bg-primary" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm font-medium">Review & Pay</span>
            </div>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/checkout/address')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Change Address
          </Button>

          <div className="grid gap-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold">{selectedAddress.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  <p className="text-sm mt-1">Phone: {selectedAddress.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Order Items ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        {item.weight && (
                          <p className="text-sm text-muted-foreground">{item.weight}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => dispatch(setPaymentMethod(value as PaymentMethod))}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => dispatch(setPaymentMethod(method.id as PaymentMethod))}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <method.icon className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {deliveryCharge === 0 && (
                    <p className="text-xs text-green-600">Free delivery on orders above ₹500</p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              className="w-full h-14 text-lg"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Placing Order…
                </>
              ) : (
                `Place Order - ₹${total}`
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              By placing this order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderReview;
