import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  UserPlus,
  LogIn,
  ArrowLeft,
  RefreshCw,
  Key
} from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { validatePassword, validateEmail } from '@/lib/supabase';

// Premium Input Component with enhanced validation
const PremiumInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  icon,
  showToggle = false,
  onToggle,
  error,
  disabled = false,
  onBlur,
  showStrength = false
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
  onBlur?: () => void;
  showStrength?: boolean;
}) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (showStrength && type === 'password') {
      const validation = validatePassword(value);
      const strengthScore = Math.max(0, 5 - validation.errors.length);
      setStrength(strengthScore);
    }
  }, [value, showStrength, type]);

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

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
          onBlur={onBlur}
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
      
      {/* Password strength indicator */}
      {showStrength && type === 'password' && value && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              strength <= 2 ? 'text-red-400' : 
              strength <= 3 ? 'text-yellow-400' : 
              strength <= 4 ? 'text-blue-400' : 'text-green-400'
            }`}>
              {getStrengthText()}
            </span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 mt-2 text-red-400 text-xs"
        >
          <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
};

// Premium Button Component with loading states
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
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const baseStyles = "relative group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 disabled:hover:scale-100",
    secondary: "border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm hover:border-white/30",
    ghost: "text-white hover:bg-white/10",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Animated background gradient */}
      {(variant === "primary" || variant === "danger") && (
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

// Error Message Component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 text-red-400 flex-shrink-0" />
        <p className="text-red-300 text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-300 hover:text-red-200 transition-colors"
        >
          <RefreshCw className="size-4" />
        </button>
      )}
    </motion.div>
  );
};

// Auth Mode Selection Component
const AuthModeSelection = ({ 
  onSelectMode 
}: { 
  onSelectMode: (mode: 'signin' | 'signup') => void 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
            Welcome to the Future
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Choose how you'd like to access your AI experience
          </p>
        </div>
      </div>

      {/* Auth Options */}
      <div className="space-y-4">
        {/* Sign In Option */}
        <PremiumButton
          onClick={() => onSelectMode('signin')}
          variant="primary"
          className="w-full h-14 text-base"
        >
          <LogIn className="size-5" />
          Sign In to Existing Account
          <ArrowRight className="size-4" />
        </PremiumButton>

        {/* Sign Up Option */}
        <PremiumButton
          onClick={() => onSelectMode('signup')}
          variant="secondary"
          className="w-full h-14 text-base"
        >
          <UserPlus className="size-5" />
          Create New Account
          <ArrowRight className="size-4" />
        </PremiumButton>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-2">
        <FeatureBadge
          icon={<Shield className="size-3" />}
          text="Enterprise-Grade Security & Encryption"
        />
        <FeatureBadge
          icon={<Zap className="size-3" />}
          text="Instant Access to AI Conversations"
        />
        <FeatureBadge
          icon={<Sparkles className="size-3" />}
          text="Premium AI Experience with Advanced Features"
        />
      </div>
    </motion.div>
  );
};

// Sign In Form Component with enhanced validation
const SignInForm = ({ 
  onBack, 
  onSuccess 
}: { 
  onBack: () => void; 
  onSuccess: () => void; 
}) => {
  const { signIn, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSignIn = async () => {
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

    try {
      setIsSubmitting(true);
      setAttemptCount(prev => prev + 1);
      
      const result = await signIn(email, password);

      if (result.error) {
        setErrors({ general: result.error.message });
        return;
      }

      setSuccess('Welcome back! Signing you in...');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      setErrors({ general: error.message || 'Sign in failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setErrors({});
    setAttemptCount(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Sign In</h2>
          <p className="text-slate-400 text-sm">Welcome back to NyxtGen AI</p>
        </div>
      </div>

      {/* Success Message */}
      {success && <SuccessMessage message={success} />}

      {/* General Error */}
      {errors.general && (
        <ErrorMessage 
          message={errors.general} 
          onRetry={attemptCount > 1 ? handleRetry : undefined}
        />
      )}

      {/* Form */}
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
            onBlur={() => {
              if (email && !validateEmail(email)) {
                setErrors({ ...errors, email: 'Please enter a valid email address' });
              } else {
                setErrors({ ...errors, email: '' });
              }
            }}
          />
        </div>

        {/* Password Input */}
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

        {/* Submit Button */}
        <PremiumButton
          onClick={handleSignIn}
          disabled={isSubmitting || isLoading || !email || !password}
          loading={isSubmitting}
          className="w-full h-12 text-sm"
        >
          <LogIn className="size-4" />
          Sign In
          <ArrowRight className="size-3" />
        </PremiumButton>
      </div>

      {/* Additional Options */}
      <div className="text-center">
        <button className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
          Forgot your password?
        </button>
      </div>
    </motion.div>
  );
};

// Sign Up Form Component with enhanced validation
const SignUpForm = ({ 
  onBack, 
  onSuccess 
}: { 
  onBack: () => void; 
  onSuccess: () => void; 
}) => {
  const { signUp, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setErrors({});
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setErrors({ 
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : '',
        confirmPassword: !confirmPassword ? 'Please confirm your password' : ''
      });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.errors[0] });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signUp(email, password, fullName);

      if (result.error) {
        setErrors({ general: result.error.message });
        return;
      }

      setSuccess('Account created successfully! You can now access NyxtGen AI.');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      setErrors({ general: error.message || 'Sign up failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm">Join the future of AI conversations</p>
        </div>
      </div>

      {/* Success Message */}
      {success && <SuccessMessage message={success} />}

      {/* General Error */}
      {errors.general && <ErrorMessage message={errors.general} />}

      {/* Form */}
      <div className="space-y-4">
        {/* Full Name Input */}
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
            onBlur={() => {
              if (email && !validateEmail(email)) {
                setErrors({ ...errors, email: 'Please enter a valid email address' });
              } else {
                setErrors({ ...errors, email: '' });
              }
            }}
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Lock className="size-3 text-cyan-400" />
            Password
          </label>
          <PremiumInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a secure password"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="size-4" />}
            showToggle={true}
            onToggle={() => setShowPassword(!showPassword)}
            error={errors.password}
            disabled={isSubmitting}
            showStrength={true}
          />
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Lock className="size-3 text-cyan-400" />
            Confirm Password
          </label>
          <PremiumInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            type={showConfirmPassword ? "text" : "password"}
            icon={<Lock className="size-4" />}
            showToggle={true}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            disabled={isSubmitting}
            onBlur={() => {
              if (confirmPassword && password !== confirmPassword) {
                setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
              } else {
                setErrors({ ...errors, confirmPassword: '' });
              }
            }}
          />
        </div>

        {/* Submit Button */}
        <PremiumButton
          onClick={handleSignUp}
          disabled={isSubmitting || isLoading || !email || !password || !confirmPassword}
          loading={isSubmitting}
          className="w-full h-12 text-sm"
        >
          <UserPlus className="size-4" />
          Create Account
          <ArrowRight className="size-3" />
        </PremiumButton>
      </div>

      {/* Info Message */}
      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="size-4 text-cyan-400 flex-shrink-0" />
          <p className="text-cyan-300 text-sm font-medium">
            No email verification required - instant access to your account!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface AuthScreenProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [, setScreenState] = useAtom(screenAtom);
  const [currentView, setCurrentView] = useState<'selection' | 'signin' | 'signup'>('selection');

  // Handle close modal
  const handleClose = () => {
    setScreenState({ currentScreen: "home" });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 z-20"
          >
            <X className="size-5" />
          </button>

          {/* Animated background gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
          
          {/* Premium border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 blur-xl opacity-50" />
          
          {/* Content */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {currentView === 'selection' && (
                <AuthModeSelection 
                  key="selection"
                  onSelectMode={setCurrentView} 
                />
              )}
              {currentView === 'signin' && (
                <SignInForm 
                  key="signin"
                  onBack={() => setCurrentView('selection')}
                  onSuccess={onSuccess}
                />
              )}
              {currentView === 'signup' && (
                <SignUpForm 
                  key="signup"
                  onBack={() => setCurrentView('selection')}
                  onSuccess={onSuccess}
                />
              )}
            </AnimatePresence>

            {/* Legal Notice */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6"
            >
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
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};