import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWishlist } from "@/store/slices/wishlistSlice";

import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import SplashScreen from "@/components/SplashScreen";
import BackgroundMusicToggle from "@/components/BackgroundMusicToggle";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import AddressSelect from "./pages/AddressSelect";
import OrderReview from "./pages/OrderReview";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import HelpCenter from "./pages/HelpCenter";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import GalleryPage from "./pages/Gallery";

const queryClient = new QueryClient();

// Keeps the wishlist slice in sync with the server whenever a customer is
// logged in, so heart icons on public pages (home, product cards) reflect
// server state without every page having to fetch it individually.
const WishlistSync = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  return null;
};

const LiveUpdates = () => {
  useLiveUpdates();
  return null;
};

const SplashWithLogin: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (!showSplash) return null;

  return (
    <SplashScreen
      onFinish={() => setShowSplash(false)}
    />
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LoginModal />
            <RegisterModal />
            <WishlistSync />
            <LiveUpdates />
            <BackgroundMusicToggle />
            <SplashWithLogin />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:categoryId" element={<Categories />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/checkout/address" element={<ProtectedRoute><AddressSelect /></ProtectedRoute>} />
                <Route path="/checkout/review" element={<ProtectedRoute><OrderReview /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </Provider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
