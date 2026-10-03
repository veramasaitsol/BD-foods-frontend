import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders, selectOrders, selectOrdersLoading, Order } from '@/store/slices/orderSlice';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const isLoading = useAppSelector(selectOrdersLoading);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusLabel = (status: string) =>
    status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Helmet>
        <title>My Orders - Brundhavanam Desi Foods</title>
        <meta name="description" content="View your order history" />
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
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>

          {isLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading orders…</p>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button onClick={() => navigate('/')}>
                Browse Products
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="bg-muted/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatusLabel(order.status)}
                      </Badge>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <img
                              key={item.id}
                              src={item.image || ''}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg border-2 border-background object-cover"
                              style={{ zIndex: 3 - index }}
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {order.items.map(i => i.name).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                          </p>
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-bold text-lg">₹{order.total}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground capitalize">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Orders;
