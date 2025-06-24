import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/DialogWrapper";
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Save, 
  X, 
  Edit3, 
  Shield,
  Clock,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { cn } from '@/utils';

// Enhanced Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "ghost" | "outline" | "primary" | "secondary";
    size?: "icon" | "sm" | "default";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    ghost: "hover:bg-white/10 text-white/80 hover:text-white",
    outline: "border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm",
    primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25",
    secondary: "bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20",
    default: "bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
  };
  
  const sizes = {
    icon: "h-12 w-12 p-0",
    sm: "h-10 px-4 text-sm",
    default: "h-12 px-6 text-sm"
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
  }
>(({ className, icon, ...props }, ref) => {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10">
          {icon}
        </div>
      )}
      
      <input
        className={cn(
          "flex h-14 w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-4 py-4 text-base text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 font-mono shadow-lg",
          icon && "pl-12",
          "hover:border-cyan-500/70 hover:bg-slate-800",
          className
        )}
        style={{ 
          fontFamily: "'Source Code Pro', monospace",
          fontSize: '14px',
          lineHeight: '1.4'
        }}
        ref={ref}
        {...props}
      />
      
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Input.displayName = "Input";

// Enhanced Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-base font-bold text-white leading-none flex items-center gap-2 mb-3",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});
Label.displayName = "Label";

// Profile Stats Component
const ProfileStats = ({ profile }: { profile: any }) => {
  const joinDate = new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <CheckCircle className="size-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Verified</p>
            <p className="text-emerald-300 text-sm">Account Status</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Calendar className="size-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-white font-semibold">{joinDate}</p>
            <p className="text-cyan-300 text-sm">Member Since</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <MessageSquare className="size-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Premium</p>
            <p className="text-purple-300 text-sm">Experience Level</p>
          </div>
        </div>
      </div>
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
    <div className="space-y-6 p-6 rounded-2xl bg-slate-800/60 backdrop-blur-sm border-2 border-slate-600/50 hover:border-slate-500/70 transition-all duration-200 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-500/40 flex-shrink-0 shadow-lg">
          <div className="text-cyan-300">
            {React.cloneElement(icon as React.ReactElement, { className: "size-6" })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          {description && (
            <p className="text-base text-slate-300 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export const Profile: React.FC = () => {
  const { user, profile, updateProfile, isLoading } = useAuthContext();
  const [, setScreenState] = useAtom(screenAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    preferences: {
      language: 'en',
      interruptSensitivity: 'medium',
      greeting: '',
      context: '',
      persona: '',
      replica: ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        preferences: {
          language: profile.preferences?.language || 'en',
          interruptSensitivity: profile.preferences?.interruptSensitivity || 'medium',
          greeting: profile.preferences?.greeting || '',
          context: profile.preferences?.context || '',
          persona: profile.preferences?.persona || '',
          replica: profile.preferences?.replica || ''
        }
      });
    }
  }, [profile]);

  const handleClose = () => {
    setScreenState({ currentScreen: "home" });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const result = await updateProfile(formData);

      if (result.error) {
        setSaveMessage('Error saving profile');
        return;
      }

      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      setSaveMessage('Error saving profile');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        preferences: {
          language: profile.preferences?.language || 'en',
          interruptSensitivity: profile.preferences?.interruptSensitivity || 'medium',
          greeting: profile.preferences?.greeting || '',
          context: profile.preferences?.context || '',
          persona: profile.preferences?.persona || '',
          replica: profile.preferences?.replica || ''
        }
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <DialogWrapper>
        <AnimatedTextBlockWrapper>
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white text-lg">Loading profile...</p>
            </div>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  if (!user) {
    return (
      <DialogWrapper>
        <AnimatedTextBlockWrapper>
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <AlertCircle className="size-16 text-red-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Access Denied</h2>
              <p className="text-slate-400">Please sign in to view your profile.</p>
              <Button onClick={handleClose} variant="primary">
                Go Back
              </Button>
            </div>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 pt-6 pb-6 z-20 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-lg border-b border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Profile Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center shadow-lg">
                    <User className="size-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                    <CheckCircle className="size-3 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {profile?.full_name || 'User Profile'}
                  </h1>
                  <p className="text-lg text-slate-300">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="size-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="hover:bg-red-500/20 hover:text-red-400"
                >
                  <X className="size-6" />
                </Button>
              </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  saveMessage.includes('Error') 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300' 
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {saveMessage.includes('Error') ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                {saveMessage}
              </motion.div>
            )}
          </div>

          {/* Profile Content */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-8 py-6">
            
            {/* Profile Stats */}
            <ProfileStats profile={profile} />

            {/* Personal Information */}
            <ProfileSection
              title="Personal Information"
              description="Manage your basic profile information"
              icon={<User />}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      icon={<User className="size-4" />}
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-600/30">
                      <p className="text-white font-mono">
                        {profile?.full_name || 'Not set'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-600/30">
                    <p className="text-white font-mono">{user.email}</p>
                    <p className="text-slate-400 text-sm mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>
            </ProfileSection>

            {/* AI Preferences */}
            <ProfileSection
              title="AI Conversation Preferences"
              description="Customize how the AI interacts with you"
              icon={<Sparkles />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="greeting">Custom Greeting</Label>
                  {isEditing ? (
                    <Input
                      id="greeting"
                      icon={<MessageSquare className="size-4" />}
                      value={formData.preferences.greeting}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, greeting: e.target.value }
                      })}
                      placeholder="How should the AI greet you?"
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-600/30">
                      <p className="text-white font-mono">
                        {formData.preferences.greeting || 'Default greeting'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  {isEditing ? (
                    <select
                      id="language"
                      value={formData.preferences.language}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, language: e.target.value }
                      })}
                      className="flex h-14 w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-4 py-4 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 appearance-none cursor-pointer font-mono shadow-lg"
                    >
                      <option value="en" className="bg-slate-800">English</option>
                      <option value="es" className="bg-slate-800">Spanish</option>
                      <option value="fr" className="bg-slate-800">French</option>
                      <option value="de" className="bg-slate-800">German</option>
                      <option value="it" className="bg-slate-800">Italian</option>
                      <option value="pt" className="bg-slate-800">Portuguese</option>
                    </select>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-600/30">
                      <p className="text-white font-mono">
                        {formData.preferences.language === 'en' ? 'English' :
                         formData.preferences.language === 'es' ? 'Spanish' :
                         formData.preferences.language === 'fr' ? 'French' :
                         formData.preferences.language === 'de' ? 'German' :
                         formData.preferences.language === 'it' ? 'Italian' :
                         formData.preferences.language === 'pt' ? 'Portuguese' : 'English'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="context">Conversation Context</Label>
                {isEditing ? (
                  <textarea
                    id="context"
                    value={formData.preferences.context}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, context: e.target.value }
                    })}
                    placeholder="Tell the AI about your interests, background, or preferences..."
                    rows={4}
                    className="flex min-h-[120px] w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-4 py-4 text-base text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 resize-none font-mono shadow-lg"
                    style={{ fontFamily: "'Source Code Pro', monospace" }}
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-600/30 min-h-[120px]">
                    <p className="text-white font-mono whitespace-pre-wrap">
                      {formData.preferences.context || 'No context provided'}
                    </p>
                  </div>
                )}
              </div>
            </ProfileSection>

            {/* Account Security */}
            <ProfileSection
              title="Account Security"
              description="Your account security and privacy settings"
              icon={<Shield />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="size-5 text-emerald-400" />
                    <div>
                      <p className="text-emerald-300 font-semibold">Email Verified</p>
                      <p className="text-emerald-400 text-sm">Your email is confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center gap-3">
                    <Shield className="size-5 text-cyan-400" />
                    <div>
                      <p className="text-cyan-300 font-semibold">Secure Connection</p>
                      <p className="text-cyan-400 text-sm">End-to-end encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};