import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Package, CheckCircle2, Bike, PackageCheck, XCircle, Phone, MapPin,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders, selectOrders, selectOrdersLoading, Order } from '@/store/slices/orderSlice';
import { cn } from '@/lib/utils';

const STEPS: { key: Order['status']; label: string; icon: React.ElementType }[] = [
  { key: 'placed', label: 'Order Placed', icon: Package },
  { key: 'assigned', label: 'Assigned', icon: CheckCircle2 },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const isLoading = useAppSelector(selectOrdersLoading);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const order = orders.find((o) => String(o.id) === orderId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  if (isLoading && !order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-muted/30 py-12 text-center">
          <p className="text-muted-foreground">Loading order…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-muted/30 py-12">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-xl font-bold mb-2">Order not found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find this order in your account.</p>
            <Button onClick={() => navigate('/orders')}>Back to My Orders</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <>
      <Helmet>
        <title>Track Order {order.orderNumber} - Brundhavanam Desi Foods</title>
        <meta name="description" content="Track your order status" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <button 
            onClick={() => navigate('/orders', { replace: true })}
            // onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
            <p className="text-lg font-bold text-primary">₹{order.total}</p>
          </div>

          {order.status === 'cancelled' ? (
            <Card className="mb-6 border-destructive/30">
              <CardContent className="p-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">This order was cancelled and will not be delivered.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="space-y-0">
                  {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLast = index === STEPS.length - 1;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                              isCompleted || isCurrent
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground',
                              isCurrent && !isLast && 'ring-4 ring-primary/20 animate-pulse'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                'w-0.5 flex-1 min-h-[2.5rem]',
                                isCompleted ? 'bg-primary' : 'bg-muted'
                              )}
                            />
                          )}
                        </div>
                        <div className={cn('pb-10', isLast && 'pb-0')}>
                          <p className={cn('font-medium', (isCompleted || isCurrent) && 'text-foreground', !isCompleted && !isCurrent && 'text-muted-foreground')}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-primary">
                              {isLast ? 'Delivered successfully' : 'In progress…'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {order.deliveryPartner && (
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bike className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.deliveryPartner.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.deliveryPartner.vehicleType || 'Delivery Partner'}
                    </p>
                  </div>
                </div>
                {order.deliveryPartner.phone && (
                  <a href={`tel:${order.deliveryPartner.phone}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Delivery Address
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-sm mt-1">Phone: {order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image || ''}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between ">
                <span className="font-medium">Sub Total</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="mt-4  flex justify-between ">
                <span className="font-medium">Delivery Charges</span>
                <span>₹{order.deliveryCharge}</span>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderTracking;
