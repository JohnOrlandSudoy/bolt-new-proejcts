import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { useAuthContext } from '@/components/AuthProvider';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import gloriaVideo from '@/assets/video/gloria.mp4';

// Premium Input Component with better visibility
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
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 group-focus-within:text-cyan-200 transition-colors z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-16 px-4 pl-12 pr-12 rounded-2xl bg-slate-800/90 border-2 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base ${
            error 
              ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/70' 
              : 'border-slate-600/70 hover:border-slate-500/90'
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-200 transition-colors z-10 disabled:opacity-50 p-2 rounded-lg hover:bg-white/10"
          >
            {type === "password" ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3 text-red-300 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/30"
        >
          <AlertCircle className="size-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}
      
      {/* Focus glow effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 blur-sm -z-10 ${
        error 
          ? 'bg-gradient-to-r from-red-500/30 to-red-500/30 opacity-0 group-focus-within:opacity-100'
          : 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-focus-within:opacity-100'
      }`} />
    </div>
  );
};

// Premium Button Component with better visibility
const PremiumButton = ({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  variant = "primary",
  className = "",
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  [key: string]: any;
}) => {
  const baseStyles = "relative group overflow-hidden w-full h-16 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02] disabled:hover:scale-100 border-2 border-cyan-400/50",
    secondary: "border-2 border-white/50 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm hover:border-white/70 shadow-lg",
    ghost: "text-cyan-300 hover:text-cyan-200 hover:bg-white/15 font-semibold"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Animated background for primary variant */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          children
        )}
      </span>
      
      {/* Shine effect for primary variant */}
      {variant === "primary" && (
        <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </button>
  );
};

// Success Message Component with better visibility
const SuccessMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-400/50 backdrop-blur-sm shadow-lg"
  >
    <CheckCircle className="size-6 text-emerald-300 flex-shrink-0" />
    <p className="text-emerald-200 text-base font-semibold">{message}</p>
  </motion.div>
);

// Error Message Component with better visibility
const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border-2 border-red-400/50 backdrop-blur-sm shadow-lg"
  >
    <AlertCircle className="size-6 text-red-300 flex-shrink-0" />
    <p className="text-red-200 text-base font-semibold">{message}</p>
  </motion.div>
);

export const Auth: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const { signIn, signUp, loading } = useAuthContext();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Sign up specific validations
    if (isSignUp) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (isSignUp) {
        const { user, error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          setErrors({ submit: error.message });
        } else if (user) {
          setSuccessMessage('Account created successfully! Welcome to NyxtGen!');
          // Redirect to intro screen after successful signup
          setTimeout(() => {
            setScreenState({ currentScreen: "intro" });
          }, 1500);
        }
      } else {
        const { user, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          setErrors({ submit: error.message });
        } else if (user) {
          setSuccessMessage('Welcome back! Redirecting...');
          // Redirect to intro screen after successful login
          setTimeout(() => {
            setScreenState({ currentScreen: "intro" });
          }, 1500);
        }
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setScreenState({ currentScreen: "home" });
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Video Background with stronger overlay */}
      <div className="absolute inset-0 z-0">
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/98 via-black/95 to-slate-900/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_70%)]" />
      </div>

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Main Card with better contrast */}
        <div className="relative p-10 rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-xl border-2 border-slate-600/70 shadow-2xl">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/20 transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
          >
            <X className="size-6" />
          </button>

          {/* Animated background gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse" />
          
          {/* Premium border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-transparent to-purple-500/30 blur-xl opacity-60" />
          
          {/* Content */}
          <div className="relative z-10 space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-6">
              {/* Logo */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/40 to-purple-500/40 blur-xl animate-pulse" />
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-slate-600/70 shadow-2xl">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-transparent to-purple-500/30" />
                  <Shield className="size-10 text-cyan-300 relative z-10 drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-2xl border border-white/20" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-white">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed font-medium">
                  {isSignUp 
                    ? 'Join NyxtGen and start experiencing AI conversations instantly'
                    : 'Sign in to continue your AI journey'
                  }
                </p>
              </div>
            </div>

            {/* Success/Error Messages */}
            <AnimatePresence mode="wait">
              {successMessage && (
                <SuccessMessage message={successMessage} />
              )}
              {errors.submit && (
                <ErrorMessage message={errors.submit} />
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name (Sign Up Only) */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-white font-semibold text-base mb-3">
                      Full Name
                    </label>
                    <PremiumInput
                      value={formData.fullName}
                      onChange={handleInputChange('fullName')}
                      placeholder="Enter your full name"
                      icon={<User className="size-5" />}
                      error={errors.fullName}
                      disabled={isSubmitting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold text-base mb-3">
                  Email Address
                </label>
                <PremiumInput
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email address"
                  type="email"
                  icon={<Mail className="size-5" />}
                  error={errors.email}
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white font-semibold text-base mb-3">
                  Password
                </label>
                <PremiumInput
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  icon={<Lock className="size-5" />}
                  showToggle={true}
                  onToggle={() => setShowPassword(!showPassword)}
                  error={errors.password}
                  disabled={isSubmitting}
                />
              </div>

              {/* Confirm Password (Sign Up Only) */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-white font-semibold text-base mb-3">
                      Confirm Password
                    </label>
                    <PremiumInput
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      placeholder="Confirm your password"
                      type={showPassword ? "text" : "password"}
                      icon={<Lock className="size-5" />}
                      error={errors.confirmPassword}
                      disabled={isSubmitting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-4">
                <PremiumButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    isSignUp ? 'Creating Account...' : 'Signing In...'
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="size-6" />
                      <Sparkles className="size-5" />
                    </>
                  )}
                </PremiumButton>
              </div>
            </form>

            {/* Switch Mode */}
            <div className="text-center pt-6 border-t-2 border-slate-600/50">
              <p className="text-slate-300 text-base mb-4 font-medium">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <PremiumButton
                variant="ghost"
                onClick={switchMode}
                disabled={isSubmitting}
              >
                {isSignUp ? 'Sign In Instead' : 'Create Account'}
              </PremiumButton>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 shadow-lg">
                <Shield className="size-4 text-emerald-300" />
                <span className="text-sm text-emerald-200 font-bold">Instant Access - No Email Verification</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-6 left-6 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-80" />
          <div className="absolute bottom-6 right-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" />
        </div>

        {/* Floating particles around modal */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${15 + (i * 8)}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.4, 0.8, 0.4],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + (i * 0.3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};