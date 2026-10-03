import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowLeft,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setShowRegisterModal,
  setShowLoginModal,
  sendOtpAsync,
  verifyOtpAsync,
  resetOtpState,
  clearError,
} from "@/store/slices/authSlice";
import { toast } from "sonner";

const RegisterModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showRegisterModal, isLoading, otpSent, registrationData, error } =
    useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Clear error when transitioning to OTP form
  useEffect(() => {
    if (otpSent && error) {
      dispatch(clearError());
    }
  }, [otpSent, dispatch, error]);

  if (!showRegisterModal) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const result = await dispatch(sendOtpAsync({ name, email, phone, password }));

    if (sendOtpAsync.fulfilled.match(result)) {
      toast.success("OTP sent to your email!");
    } else if (result.payload) {
      toast.error(result.payload as string);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationData) return;

    const result = await dispatch(verifyOtpAsync({ otp, registrationData }));

    if (verifyOtpAsync.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      resetForm();
      // Redirect to login modal and close register modal
      dispatch(setShowRegisterModal(false));
      dispatch(clearError());
      dispatch(resetOtpState());
      // Add a small delay to allow modal close animation
      setTimeout(() => {
        dispatch(setShowLoginModal(true));
      }, 300);
    } else if (result.payload) {
      toast.error(result.payload as string);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
  };

  const handleClose = () => {
    dispatch(setShowRegisterModal(false));
    dispatch(resetOtpState());
    dispatch(clearError());
    resetForm();
  };

  const switchToLogin = () => {
    handleClose();
    dispatch(setShowLoginModal(true));
  };

  const goBackToForm = () => {
    dispatch(resetOtpState());
    dispatch(clearError());
    setOtp("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-elevated animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {otpSent && (
            <button
              onClick={goBackToForm}
              className="absolute top-4 left-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary-foreground">
            {otpSent ? "Verify OTP" : "Create Account"}
          </h2>
          <p className="text-primary-foreground/80 text-sm mt-1">
            {otpSent
              ? "Enter the OTP sent to your email"
              : "Join us for authentic desi flavors"}
          </p>
        </div>

        {/* OTP Verification Form */}
        {otpSent ? (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-6">
            {error && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {registrationData?.email}
                </span>
              </p>

              <div className="flex justify-center mb-6">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-xs text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={() => {
                    if (registrationData) {
                      dispatch(sendOtpAsync(registrationData));
                      toast.success("OTP resent!");
                    }
                  }}
                  className="text-primary font-medium hover:underline"
                  disabled={isLoading}
                >
                  Resend
                </button>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Create Account"
              )}
            </Button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSendOtp} className="p-6 space-y-4">
            {error && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-11 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
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
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-11 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-11 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-11 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP & Continue"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterModal;
