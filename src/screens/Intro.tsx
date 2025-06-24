import { AnimatedWrapper } from "@/components/DialogWrapper";
import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Unlock, Key, Shield, Sparkles, ArrowRight, Eye, EyeOff, User, LogOut } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import { Input } from "@/components/ui/input";
import gloriaVideo from "@/assets/video/gloria.mp4";
import { motion } from "framer-motion";
import { useAuthContext } from "@/components/AuthProvider";
import { useAuthGuard } from "@/hooks/useAuthGuard";

// Premium NyxtGen Logo Component
const PremiumLogo = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Premium Logo Icon */}
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/40 to-purple-500/40 blur-lg animate-pulse" />
        
        {/* Main logo container */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
          {/* Inner gradient overlay */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20" />
          
          {/* Logo symbol */}
          <div className="relative z-10">
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="drop-shadow-lg"
            >
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="100%" stopColor="#e0e7ff" />
                </linearGradient>
              </defs>
              
              <path 
                d="M4 20V4h3l8 12V4h3v16h-3L7 8v12H4z" 
                fill="url(#logoGradient)"
                className="drop-shadow-sm"
              />
              
              <circle 
                cx="19" 
                cy="5" 
                r="2" 
                fill="url(#logoGradient2)"
                className="animate-pulse"
              />
            </svg>
          </div>
          
          <div className="absolute inset-0 rounded-xl border border-white/10" />
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <h1 
          className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent tracking-tight leading-none"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          NyxtGen
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-10 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-70" />
          <span 
            className="text-xs text-slate-300 font-medium tracking-wide uppercase"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px' }}
          >
            AI Platform
          </span>
        </div>
      </div>
    </div>
  );
};

// Premium Input Component with better visibility
const PremiumInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  icon,
  showToggle = false,
  onToggle
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
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
          className="w-full h-16 px-4 pl-12 pr-12 rounded-2xl bg-slate-800/90 border-2 border-slate-600/70 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 backdrop-blur-sm transition-all duration-200 font-mono text-base font-medium hover:border-slate-500/90"
          style={{ fontFamily: "'Source Code Pro', monospace" }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-200 transition-colors z-10 p-2 rounded-lg hover:bg-white/10"
          >
            {type === "password" ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        )}
      </div>
      
      {/* Enhanced focus glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
};

// User Info Component with better visibility
const UserInfo = ({ user, onSignOut }: { user: any; onSignOut: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-5 rounded-xl bg-emerald-500/20 border-2 border-emerald-400/50 backdrop-blur-sm mb-6 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg">
          <User className="size-6 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg">{user.email}</p>
          <p className="text-emerald-200 text-sm font-semibold">✓ Authenticated</p>
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/30 hover:bg-red-500/40 text-red-200 hover:text-red-100 transition-all duration-200 text-sm font-semibold border border-red-400/50 hover:border-red-400/70"
      >
        <LogOut className="size-4" />
        Sign Out
      </button>
    </motion.div>
  );
};

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [showPassword, setShowPassword] = useState(false);
  const { user, signOut } = useAuthContext();
  
  // Enforce authentication for this screen
  const { isAuthenticated, isLoading } = useAuthGuard({
    showAuthModal: true,
    redirectTo: "auth"
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      setScreenState({ currentScreen: "auth" });
      return;
    }
    
    if (!token) {
      // Show error message or focus on token input
      return;
    }
    
    setScreenState({ currentScreen: "instructions" });
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setToken(newToken);
    localStorage.setItem('tavus-token', newToken);
  };

  const handleSignOut = async () => {
    await signOut();
    setScreenState({ currentScreen: "home" });
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by useAuthGuard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AnimatedWrapper>
      <div className="flex size-full flex-col items-center justify-center relative">
        {/* Enhanced Video Background with stronger overlay */}
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        {/* Multi-layered overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/98 via-black/95 to-slate-900/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_70%)]" />

        {/* Premium Card Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg mx-4"
        >
          {/* Main Card with better contrast */}
          <div className="relative p-10 rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-xl border-2 border-slate-600/70 shadow-2xl">
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse" />
            
            {/* Premium border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-transparent to-purple-500/30 blur-xl opacity-60" />
            
            {/* Content */}
            <div className="relative z-10 space-y-8">
              
              {/* Logo and Title */}
              <div className="text-center">
                <PremiumLogo />
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-white">
                    Welcome Back!
                  </h2>
                  <p className="text-slate-300 text-lg leading-relaxed font-medium">
                    You're authenticated and ready to experience AI conversations
                  </p>
                </div>
              </div>

              {/* User Info */}
              {user && <UserInfo user={user} onSignOut={handleSignOut} />}

              {/* API Key Input Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-lg font-bold text-white">
                    <Key className="size-5 text-cyan-400" />
                    Tavus API Key
                    <span className="text-red-400 text-xl">*</span>
                  </label>
                  
                  <PremiumInput
                    value={token || ""}
                    onChange={handleTokenChange}
                    placeholder="Enter your API key (required)"
                    type={showPassword ? "text" : "password"}
                    icon={<Shield className="size-5" />}
                    showToggle={true}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>

                {/* Help Text */}
                <div className="flex items-center justify-center gap-2 text-base">
                  <span className="text-slate-300 font-medium">Don't have a key?</span>
                  <a
                    href="https://platform.tavus.io/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:text-cyan-200 font-bold hover:underline transition-colors flex items-center gap-1"
                  >
                    Create account
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>

              {/* Premium CTA Button */}
              <div className="pt-4">
                <AudioButton 
                  onClick={handleClick}
                  disabled={!token}
                  className="group relative w-full h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold text-lg shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 disabled:shadow-none transition-all duration-300 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed border-2 border-cyan-400/50 disabled:border-slate-600/50 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Unlock className="size-6" />
                    {token ? "Start AI Experience" : "Enter API Key Required"}
                    <Sparkles className="size-5 group-hover:animate-spin" />
                  </span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </AudioButton>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 shadow-lg">
                  <Shield className="size-4 text-emerald-300" />
                  <span className="text-sm text-emerald-200 font-bold">Authenticated & Secure</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-80" />
            <div className="absolute bottom-6 left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" />
          </div>

          {/* Floating particles around card */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
                style={{
                  left: `${10 + (i * 15)}%`,
                  top: `${20 + (i * 10)}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + (i * 0.5),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatedWrapper>
  );
};