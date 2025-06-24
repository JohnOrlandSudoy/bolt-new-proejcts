import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';

// Premium Input Component
const PremiumInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  icon,
  showToggle = false,
  onToggle,
  error,
  disabled = false
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  error?: string;
  disabled?: boolean;
}) => {
  return (
    <div className="relative group">
      {/* Input field */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-12 px-3 pl-10 pr-10 rounded-xl bg-slate-900/70 border text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            error 
              ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/50' 
              : 'border-slate-600/50 hover:border-cyan-500/30'
          }`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors z-10 disabled:opacity-50"
          >
            {type === "password" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-400 text-xs"
        >
          <AlertCircle className="size-3" />
          {error}
        </motion.div>
      )}
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
};

// Premium Button Component
const PremiumButton = ({ 
  children, 
  onClick, 
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const baseStyles = "relative group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 disabled:hover:scale-100",
    secondary: "border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm hover:border-white/30",
    ghost: "text-white hover:bg-white/10"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Animated background gradient */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </span>
      
      {/* Shine effect */}
      {variant === "primary" && (
        <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </button>
  );
};

// Feature Badge Component
const FeatureBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="text-cyan-400">
        {icon}
      </div>
      <span className="text-xs font-medium text-white/80">{text}</span>
    </div>
  );
};

// Success Message Component
const SuccessMessage = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm"
    >
      <CheckCircle className="size-4 text-emerald-400 flex-shrink-0" />
      <p className="text-emerald-300 text-sm font-medium">{message}</p>
    </motion.div>
  );
};

interface AuthScreenProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { autoSignUpOrIn, isLoading } = useAuthContext();
  const [, setScreenState] = useAtom(screenAtom);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle close modal
  const handleClose = () => {
    setScreenState({ currentScreen: "home" });
  };

  // Handle auto authentication
  const handleAutoAuth = async () => {
    setErrors({});
    setSuccess('');

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await autoSignUpOrIn(email);

      if (result.error) {
        setErrors({ general: result.error.message });
        return;
      }

      if (result.action === 'signup') {
        setSuccess('Account created successfully! Welcome to NyxtGen AI.');
      } else {
        setSuccess('Welcome back! Signing you in...');
      }

      // Delay to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      setErrors({ general: error.message || 'Authentication failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual authentication
  const handleManualAuth = async () => {
    setErrors({});
    setSuccess('');

    if (!email || !password) {
      setErrors({ 
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : ''
      });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await autoSignUpOrIn(email, password);

      if (result.error) {
        setErrors({ general: result.error.message });
        return;
      }

      if (result.action === 'signup') {
        setSuccess('Account created successfully! Welcome to NyxtGen AI.');
      } else {
        setSuccess('Welcome back! Signing you in...');
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      setErrors({ general: error.message || 'Authentication failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Modal Card */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="size-5" />
          </button>

          {/* Animated background gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
          
          {/* Premium border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 blur-xl opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/40 to-purple-500/40 blur-lg animate-pulse" />
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20" />
                    <Sparkles className="size-6 text-cyan-400 relative z-10 drop-shadow-lg" />
                    <div className="absolute inset-0 rounded-lg border border-white/10" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent tracking-tight">
                    NyxtGen AI
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">Next-Generation Platform</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">
                  {mode === 'auto' ? 'Quick Access' : 'Secure Access'}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {mode === 'auto' 
                    ? 'Enter your email for instant access'
                    : 'Sign in or create an account'
                  }
                </p>
              </div>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-slate-800/50 border border-slate-600/30">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  mode === 'auto'
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Zap className="size-3 inline mr-1" />
                Quick
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  mode === 'manual'
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Shield className="size-3 inline mr-1" />
                Manual
              </button>
            </div>

            {/* Success Message */}
            {success && <SuccessMessage message={success} />}

            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm"
              >
                <AlertCircle className="size-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm font-medium">{errors.general}</p>
              </motion.div>
            )}

            {/* Auth Form */}
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Mail className="size-3 text-cyan-400" />
                  Email Address
                </label>
                <PremiumInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                  icon={<Mail className="size-4" />}
                  error={errors.email}
                  disabled={isSubmitting}
                />
              </div>

              {/* Manual Mode Fields */}
              {mode === 'manual' && (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Lock className="size-3 text-cyan-400" />
                      Password
                    </label>
                    <PremiumInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      icon={<Lock className="size-4" />}
                      showToggle={true}
                      onToggle={() => setShowPassword(!showPassword)}
                      error={errors.password}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <User className="size-3 text-cyan-400" />
                      Full Name (Optional)
                    </label>
                    <PremiumInput
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      type="text"
                      icon={<User className="size-4" />}
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <PremiumButton
                onClick={mode === 'auto' ? handleAutoAuth : handleManualAuth}
                disabled={isSubmitting || isLoading}
                loading={isSubmitting}
                className="w-full h-12 text-sm"
              >
                {mode === 'auto' ? (
                  <>
                    <Zap className="size-4" />
                    Get Instant Access
                    <ArrowRight className="size-3" />
                  </>
                ) : (
                  <>
                    <Shield className="size-4" />
                    Sign In / Sign Up
                    <ArrowRight className="size-3" />
                  </>
                )}
              </PremiumButton>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-2">
              <FeatureBadge
                icon={<Shield className="size-3" />}
                text="Secure & Encrypted"
              />
              <FeatureBadge
                icon={<Zap className="size-3" />}
                text="Instant AI Conversations"
              />
              <FeatureBadge
                icon={<Sparkles className="size-3" />}
                text="Premium Experience"
              />
            </div>

            {/* Legal */}
            <div className="text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};