import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { getDefaultStore } from "jotai";
import { 
  userProfileAtom, 
  profileSavedAtom, 
  UserProfile, 
  loadProfileAtom, 
  saveProfileAtom,
  profileLoadingAtom,
  updateProfileAtom
} from "@/store/profile";
import { screenAtom } from "@/store/screens";
import { useAuthContext } from "@/components/AuthProvider";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  X,
  Save,
  User,
  Camera,
  Calendar,
  Briefcase,
  Heart,
  MapPin,
  Globe,
  Phone,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/utils";
import { testDatabaseConnection, checkUserAuth } from "@/lib/supabase";

// Enhanced Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "ghost" | "outline" | "primary" | "secondary" | "danger";
    size?: "icon" | "sm" | "default";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    ghost: "hover:bg-white/10 text-white/80 hover:text-white",
    outline: "border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm",
    primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25",
    secondary: "bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25",
    default: "bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
  };
  
  const sizes = {
    icon: "h-10 w-10 p-0",
    sm: "h-9 px-3 text-sm",
    default: "h-11 px-5 text-sm"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Enhanced Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
    error?: string;
  }
>(({ className, icon, error, type, ...props }, ref) => {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 z-10">
          {icon}
        </div>
      )}
      
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 shadow-lg",
          icon && "pl-10",
          "hover:border-cyan-500/70 hover:bg-slate-800",
          error && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/50",
          className
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
        ref={ref}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1 px-1"
        >
          {error}
        </motion.p>
      )}
      
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Input.displayName = "Input";

// Enhanced Textarea Component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: string;
  }
>(({ className, error, ...props }, ref) => {
  return (
    <div className="relative group">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 resize-none shadow-lg hover:border-cyan-500/70 hover:bg-slate-800",
          error && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/50",
          className
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
        ref={ref}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1 px-1"
        >
          {error}
        </motion.p>
      )}
      
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Textarea.displayName = "Textarea";

// Enhanced Select Component
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    icon?: React.ReactNode;
    error?: string;
  }
>(({ className, icon, error, children, ...props }, ref) => {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 z-10">
          {icon}
        </div>
      )}
      
      <select
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 appearance-none cursor-pointer shadow-lg hover:border-cyan-500/70 hover:bg-slate-800",
          icon && "pl-10",
          error && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/50",
          className
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1 px-1"
        >
          {error}
        </motion.p>
      )}
      
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Select.displayName = "Select";

// Enhanced Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean;
  }
>(({ className, required, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-white leading-none flex items-center gap-2 mb-2",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 text-sm">*</span>}
    </label>
  );
});
Label.displayName = "Label";

// Photo Upload Component
const PhotoUpload = ({ 
  label, 
  currentPhoto, 
  onPhotoChange, 
  aspectRatio = "square",
  icon = Camera
}: {
  label: string;
  currentPhoto?: string;
  onPhotoChange: (photo: string) => void;
  aspectRatio?: "square" | "cover";
  icon?: any;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('📸 Image uploaded, size:', result.length);
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    console.log('🗑️ Removing photo');
    onPhotoChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const IconComponent = icon;

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <div className={cn(
        "relative group rounded-xl border-2 border-dashed border-slate-600 hover:border-cyan-500/50 transition-all duration-200 overflow-hidden",
        aspectRatio === "square" ? "aspect-square" : "aspect-[3/1]"
      )}>
        {currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Edit3 className="size-4 mr-1" />
                Change
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="size-4 mr-1" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/30">
              <IconComponent className="size-6 text-cyan-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">Upload {label}</p>
              <p className="text-slate-400 text-xs">Click to browse files (max 5MB)</p>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Interest Tags Component
const InterestTags = ({ 
  interests, 
  onInterestsChange 
}: { 
  interests: string[]; 
  onInterestsChange: (interests: string[]) => void; 
}) => {
  const [newInterest, setNewInterest] = useState("");

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      const updatedInterests = [...interests, newInterest.trim()];
      console.log('➕ Adding interest:', newInterest.trim());
      onInterestsChange(updatedInterests);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = interests.filter(i => i !== interest);
    console.log('➖ Removing interest:', interest);
    onInterestsChange(updatedInterests);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className="space-y-3">
      <Label>Interests & Hobbies</Label>
      
      {/* Add new interest */}
      <div className="flex gap-2">
        <Input
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add an interest (e.g., Photography, Travel, Music)"
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={addInterest}
          disabled={!newInterest.trim()}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      
      {/* Display interests */}
      {interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm"
            >
              <span>{interest}</span>
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="size-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({ 
  title, 
  description, 
  icon, 
  children 
}: { 
  title: string; 
  description?: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
}) => {
  return (
    <div className="space-y-4 p-5 rounded-2xl bg-slate-800/60 backdrop-blur-sm border-2 border-slate-600/50 hover:border-slate-500/70 transition-all duration-200 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-500/40 flex-shrink-0 shadow-lg">
          <div className="text-cyan-300">
            {React.cloneElement(icon as React.ReactElement, { className: "size-5" })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Form Field Component
const FormField = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
};

// Status Message Component
const StatusMessage = ({ 
  type, 
  message 
}: { 
  type: "success" | "error" | "info" | "warning"; 
  message: string; 
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Loader2,
    warning: AlertCircle
  };
  
  const colors = {
    success: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    error: "text-red-400 border-red-500/30 bg-red-500/10",
    info: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    warning: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
  };
  
  const Icon = icons[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm",
        colors[type]
      )}
    >
      <Icon className={cn("size-5 flex-shrink-0", type === "info" && "animate-spin")} />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

// Database Status Component
const DatabaseStatus = () => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [userStatus, setUserStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      console.log('🔍 Checking database and user status...');
      
      // Check database connection
      const dbConnected = await testDatabaseConnection();
      setDbStatus(dbConnected ? 'connected' : 'disconnected');
      
      // Check user authentication
      const user = await checkUserAuth();
      setUserStatus(user ? 'authenticated' : 'unauthenticated');
    };

    checkStatus();
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-2">
        {dbStatus === 'checking' ? (
          <Loader2 className="size-3 animate-spin text-yellow-400" />
        ) : dbStatus === 'connected' ? (
          <Database className="size-3 text-emerald-400" />
        ) : (
          <Database className="size-3 text-red-400" />
        )}
        <span className={cn(
          "font-medium",
          dbStatus === 'connected' ? "text-emerald-400" : 
          dbStatus === 'disconnected' ? "text-red-400" : "text-yellow-400"
        )}>
          DB: {dbStatus === 'checking' ? 'Checking...' : 
               dbStatus === 'connected' ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {userStatus === 'checking' ? (
          <Loader2 className="size-3 animate-spin text-yellow-400" />
        ) : userStatus === 'authenticated' ? (
          <Wifi className="size-3 text-emerald-400" />
        ) : (
          <WifiOff className="size-3 text-red-400" />
        )}
        <span className={cn(
          "font-medium",
          userStatus === 'authenticated' ? "text-emerald-400" : 
          userStatus === 'unauthenticated' ? "text-red-400" : "text-yellow-400"
        )}>
          Auth: {userStatus === 'checking' ? 'Checking...' : 
                userStatus === 'authenticated' ? 'Authenticated' : 'Not Authenticated'}
        </span>
      </div>
    </div>
  );
};

export const Profile: React.FC = () => {
  const [profile, setProfile] = useAtom(userProfileAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setProfileSaved] = useAtom(profileSavedAtom);
  const [profileLoading] = useAtom(profileLoadingAtom);
  const { user } = useAuthContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | "info" | "warning" | null;
    message: string;
  }>({ type: null, message: "" });

  // Enforce authentication for this screen
  const { isAuthenticated, isLoading } = useAuthGuard({
    showAuthModal: true,
    redirectTo: "auth"
  });

  // Load profile data when component mounts
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      console.log('🚀 Component mounted, loading profile for user:', user.id);
      const store = getDefaultStore();
      store.set(loadProfileAtom, user.id);
    }
  }, [user?.id, isAuthenticated]);

  const relationshipOptions = [
    { label: "Prefer not to say", value: "prefer-not-to-say" },
    { label: "Single", value: "single" },
    { label: "In a relationship", value: "relationship" },
    { label: "Married", value: "married" },
    { label: "It's complicated", value: "complicated" },
  ];

  const fashionStyles = [
    "Casual", "Formal", "Streetwear", "Vintage", "Minimalist", 
    "Bohemian", "Sporty", "Elegant", "Edgy", "Classic"
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (profile.age && (profile.age < 13 || profile.age > 120)) {
      newErrors.age = "Please enter a valid age";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setScreenState({ currentScreen: "intro" });
  };

  const handleSave = async () => {
    console.log('💾 Save button clicked');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      setSaveStatus({ 
        type: "error", 
        message: "Please fix the errors above before saving." 
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: "info", message: "Saving your profile to database..." });
    
    try {
      console.log('🔄 Starting profile save process...');
      console.log('📝 Current profile data:', profile);
      console.log('👤 User ID:', user?.id);
      console.log('📧 User email:', user?.email);
      
      if (!user?.id) {
        throw new Error('User ID is required for saving to database');
      }
      
      // Ensure we have the user's email and required data
      const updatedProfile = {
        ...profile,
        email: user?.email || profile.email || "",
        updatedAt: new Date().toISOString(),
      };
      
      console.log('📋 Updated profile data:', updatedProfile);
      
      // Update the profile atom first
      setProfile(updatedProfile);
      
      console.log('💾 Attempting to save to Supabase database...');
      
      // Save to Supabase using the store action
      const store = getDefaultStore();
      await store.set(saveProfileAtom, user.id);
      
      console.log('✅ Profile saved successfully to Supabase database!');
      
      setSaveStatus({ 
        type: "success", 
        message: "✅ Profile saved successfully to database! Data will persist on reload." 
      });
      
      // Close after a brief delay to show success message
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      
      // Provide detailed error information
      let errorMessage = "Failed to save to database. ";
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error occurred.";
      }
      
      // Even if Supabase fails, save to localStorage
      const updatedProfile = {
        ...profile,
        email: user?.email || profile.email || "",
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
      setProfileSaved(true);
      
      setSaveStatus({ 
        type: "warning", 
        message: `⚠️ Saved locally only. Database error: ${errorMessage}` 
      });
      
      // Still close after showing error
      setTimeout(() => {
        handleClose();
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    console.log('🔄 Updating profile with:', updates);
    const store = getDefaultStore();
    store.set(updateProfileAtom, updates);
    
    // Clear related errors
    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: '' }));
      }
    });
  };

  // Show loading while checking authentication or loading profile
  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-lg">
            {isLoading ? "Verifying access..." : "Loading profile from database..."}
          </p>
          <DatabaseStatus />
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by useAuthGuard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[95vh] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
        
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-lg border-b border-slate-600/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-500/40 shadow-lg">
                <User className="size-6 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Create Your Profile</h1>
                <p className="text-sm text-slate-300">Tell us about yourself to personalize your AI experience</p>
                <DatabaseStatus />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-red-500/20 hover:text-red-400 border-2 border-transparent hover:border-red-500/30"
              disabled={isSaving}
            >
              <X className="size-6" />
            </Button>
          </div>
        </div>
        
        {/* Status Message */}
        {saveStatus.type && (
          <div className="flex-shrink-0 p-4 border-b border-slate-600/30">
            <StatusMessage type={saveStatus.type} message={saveStatus.message} />
          </div>
        )}
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Photos Section */}
          <ProfileSection
            title="Photos"
            description="Add photos to personalize your profile"
            icon={<Camera />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PhotoUpload
                label="Profile Photo"
                currentPhoto={profile.profilePhoto}
                onPhotoChange={(photo) => updateProfile({ profilePhoto: photo })}
                aspectRatio="square"
                icon={User}
              />
              <PhotoUpload
                label="Cover Photo"
                currentPhoto={profile.coverPhoto}
                onPhotoChange={(photo) => updateProfile({ coverPhoto: photo })}
                aspectRatio="cover"
                icon={ImageIcon}
              />
            </div>
          </ProfileSection>

          {/* Basic Information */}
          <ProfileSection
            title="Basic Information"
            description="Essential details about yourself"
            icon={<User />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField>
                <Label htmlFor="fullName" required>Full Name</Label>
                <Input
                  id="fullName"
                  icon={<User className="size-4" />}
                  value={profile.fullName}
                  onChange={(e) => updateProfile({ fullName: e.target.value })}
                  placeholder="Enter your full name"
                  error={errors.fullName}
                />
              </FormField>

              <FormField>
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  icon={<Calendar className="size-4" />}
                  value={profile.birthday || ""}
                  onChange={(e) => updateProfile({ birthday: e.target.value })}
                />
              </FormField>

              <FormField>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  icon={<User className="size-4" />}
                  value={profile.age || ""}
                  onChange={(e) => updateProfile({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Enter your age"
                  error={errors.age}
                />
              </FormField>

              <FormField>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  icon={<MapPin className="size-4" />}
                  value={profile.location || ""}
                  onChange={(e) => updateProfile({ location: e.target.value })}
                  placeholder="City, Country"
                />
              </FormField>
            </div>

            <FormField>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                placeholder="Tell us about yourself, your interests, and what makes you unique..."
                rows={4}
              />
            </FormField>
          </ProfileSection>

          {/* Professional & Lifestyle */}
          <ProfileSection
            title="Professional & Lifestyle"
            description="Your work and style preferences"
            icon={<Briefcase />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField>
                <Label htmlFor="job">Job/Profession</Label>
                <Input
                  id="job"
                  icon={<Briefcase className="size-4" />}
                  value={profile.job}
                  onChange={(e) => updateProfile({ job: e.target.value })}
                  placeholder="What do you do for work?"
                />
              </FormField>

              <FormField>
                <Label htmlFor="fashion">Fashion Style</Label>
                <Select
                  id="fashion"
                  icon={<Sparkles className="size-4" />}
                  value={profile.fashion}
                  onChange={(e) => updateProfile({ fashion: e.target.value })}
                >
                  <option value="">Select your style</option>
                  {fashionStyles.map((style) => (
                    <option key={style} value={style.toLowerCase()} className="bg-slate-800 text-white">
                      {style}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField>
                <Label htmlFor="relationshipStatus">Relationship Status</Label>
                <Select
                  id="relationshipStatus"
                  icon={<Heart className="size-4" />}
                  value={profile.relationshipStatus}
                  onChange={(e) => updateProfile({ relationshipStatus: e.target.value })}
                >
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField>
                <Label htmlFor="website">Website/Portfolio</Label>
                <Input
                  id="website"
                  type="url"
                  icon={<Globe className="size-4" />}
                  value={profile.website || ""}
                  onChange={(e) => updateProfile({ website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </FormField>
            </div>
          </ProfileSection>

          {/* Interests & Contact */}
          <ProfileSection
            title="Interests & Contact"
            description="Your hobbies and how to reach you"
            icon={<Sparkles />}
          >
            <div className="space-y-4">
              <InterestTags
                interests={profile.interests || []}
                onInterestsChange={(interests) => updateProfile({ interests })}
              />

              <FormField>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  icon={<Phone className="size-4" />}
                  value={profile.phone || ""}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </FormField>
            </div>
          </ProfileSection>

          {/* Extra padding at bottom */}
          <div className="h-8"></div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="flex-shrink-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-lg border-t border-slate-600/30 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="text-xs text-slate-300 leading-relaxed space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-white text-sm">Profile Tips</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <p>• All fields are optional except your name</p>
                <p>• Your profile helps personalize AI conversations</p>
                <p>• Data is saved to Supabase database and persists on reload</p>
                <p>• Changes are automatically backed up locally as you type</p>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 lg:flex-none min-w-[100px]"
                disabled={isSaving}
              >
                Skip for Now
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex-1 lg:flex-none min-w-[140px]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving to DB...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};