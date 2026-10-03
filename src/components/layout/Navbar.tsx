import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, Heart, Package, HelpCircle, LogOut, Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setShowLoginModal, logout } from '@/store/slices/authSlice';
import { selectTotalItems } from '@/store/slices/cartSlice';
import { selectWishlistCount, resetWishlistToLocal } from '@/store/slices/wishlistSlice';
import { clearAddresses } from '@/store/slices/addressSlice';
import {
  selectNotifications,
  selectUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/store/slices/notificationsSlice';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import logo from '@/assets/logo.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const totalItems = useAppSelector(selectTotalItems);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const notifications = useAppSelector(selectNotifications);
  const unreadNotificationCount = useAppSelector(selectUnreadNotificationCount);
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showLiveResults = isSearchFocused && debouncedQuery.length >= 2;

  const { data: liveResults = [], isFetching: isSearchingLive } = useQuery({
    queryKey: ['products', 'live-search', debouncedQuery],
    queryFn: () => fetchProducts({ search: debouncedQuery, limit: 5 }),
    enabled: showLiveResults,
  });

  const closeLiveResults = () => setIsSearchFocused(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetWishlistToLocal());
    dispatch(clearAddresses());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/categories?search=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
    closeLiveResults();
  };

  const renderLiveResults = () => (
    <div className="absolute top-full left-0 w-full pt-2 z-50 text-left">
      <div className="bg-card rounded-md border border-border shadow-elevated overflow-hidden">
        {isSearchingLive ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
        ) : liveResults.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No products found for "{debouncedQuery}"</p>
        ) : (
          <>
            {liveResults.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={closeLiveResults}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors"
              >
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0 bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">₹{product.price}</p>
                </div>
              </Link>
            ))}
            <Link
              to={`/categories?search=${encodeURIComponent(debouncedQuery)}`}
              onClick={closeLiveResults}
              className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-secondary transition-colors border-t border-border"
            >
              View all results for "{debouncedQuery}"
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Brundhavanam Desi Foods" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg md:text-xl text-foreground leading-tight">
                Brundhavanam
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Desi Foods</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium">
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              {showCategories && (
                <div className="absolute top-full left-0 w-56 pt-2">
                  <div className="bg-card rounded-xl shadow-elevated border border-border p-2 animate-fade-in">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/categories/${category.id}`}
                        onClick={() => setShowCategories(false)}
                        className="block px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors text-foreground hover:text-primary"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="/categories" className="text-foreground hover:text-primary transition-colors font-medium">
              Shop All
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-lg mx-8 relative">
            <div className="flex w-full items-stretch rounded-md border border-border bg-card shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(closeLiveResults, 150)}
                onKeyDown={(e) => e.key === 'Escape' && closeLiveResults()}
                placeholder="Search for pickles, spices and more"
                className="w-full bg-transparent px-4 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center justify-center px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            {showLiveResults && renderLiveResults()}
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={() => dispatch(markAllNotificationsRead())}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-muted-foreground text-center">No notifications yet</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 8).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          onClick={() => {
                            if (!notification.isRead) dispatch(markNotificationRead(notification.id));
                          }}
                          className={`flex flex-col items-start gap-0.5 whitespace-normal py-2 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                        >
                          <span className="text-sm font-medium">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">{notification.message}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/notifications')} className="justify-center text-sm text-primary">
                    View all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* User */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <User className="w-4 h-4 mr-1" />
                    {user?.NAME?.split(' ')[0]}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/help')}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowLogoutConfirm(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => dispatch(setShowLoginModal(true))}
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4 md:hidden">
              <div className="flex items-stretch rounded-md border border-border bg-card shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(closeLiveResults, 150)}
                  onKeyDown={(e) => e.key === 'Escape' && closeLiveResults()}
                  placeholder="Search for pickles, spices and more"
                  className="w-full bg-transparent px-4 py-2.5 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex items-center justify-center px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {showLiveResults && renderLiveResults()}
            </form>

            <nav className="flex flex-col gap-2">
              <Link
                to="/categories"
                className="px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              
              <div className="sm:hidden pt-4 border-t border-border mt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/notifications"
                      className="block px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifications
                      {unreadNotificationCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/help"
                      className="block px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Help Center
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors text-destructive"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      dispatch(setShowLoginModal(true));
                      setIsMenuOpen(false);
                    }}
                  >
                    Login / Register
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your orders, wishlist and saved addresses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Navbar;
