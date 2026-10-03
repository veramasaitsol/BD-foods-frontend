import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setShowLoginModal, setShowRegisterModal, loginAsync, clearError } from '@/store/slices/authSlice';
import { fetchStoreSettings } from '@/services/settingsService';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { startAudio } from '@/hooks/useBackgroundMusic';

const LoginModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showLoginModal, isLoading, error } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchStoreSettings });

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const result = await dispatch(loginAsync({ email, password }));
    
    if (loginAsync.fulfilled.match(result)) {
      toast.success('Welcome back!');
      setEmail('');
      setPassword('');
      dispatch(clearError());
    } else if (result.payload) {
      toast.error(result.payload as string);
    }
  };

  const switchToRegister = () => {
    dispatch(setShowLoginModal(false));
    dispatch(setShowRegisterModal(true));
    dispatch(clearError());
  };

  const handleClose = () => {
    dispatch(setShowLoginModal(false));
    dispatch(clearError());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={() => { startAudio(); handleClose(); }}
      />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-elevated animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 animate-logo-fade-in">
            <img src={logo} alt="Brundhavanam Desi Foods" className="w-14 h-14 rounded-full object-cover" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary-foreground">Welcome Back</h2>
          <p className="text-primary-foreground/80 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <button type="button" className="text-sm text-primary hover:underline">
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={switchToRegister}
              className="text-primary font-medium hover:underline"
            >
              Register
            </button>
          </p>

          {/* Help Section */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-xs text-muted-foreground mb-2">How can we help you?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {settings?.storePhone && (
                <a href={`tel:${settings.storePhone}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Phone className="w-3 h-3" />
                  {settings.storePhone}
                </a>
              )}
              {settings?.storePhone2 && (
                <a href={`tel:${settings.storePhone2}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Phone className="w-3 h-3" />
                  {settings.storePhone2}
                </a>
              )}
              {settings?.storeEmail && (
                <a href={`mailto:${settings.storeEmail}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Mail className="w-3 h-3" />
                  {settings.storeEmail}
                </a>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
