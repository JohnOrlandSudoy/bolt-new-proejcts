import { memo } from "react";
import { Button } from "./ui/button";
import { Settings, Check, User, LogOut, UserCircle, MessageCircle } from "lucide-react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import { settingsSavedAtom } from "@/store/settings";
import { profileSavedAtom } from "@/store/profile";
import { useAuthContext } from "./AuthProvider";
import { motion } from "framer-motion";

// Elegant NyxtGen Logo Component
const NyxtGenLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Premium Logo Icon */}
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/30 to-purple-500/30 blur-lg animate-pulse" />
        
        {/* Main logo container */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
          {/* Inner gradient overlay */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20" />
          
          {/* Logo symbol - stylized "N" */}
          <div className="relative z-10">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="drop-shadow-lg"
            >
              {/* Gradient definitions */}
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
              
              {/* Stylized "N" with modern geometric design */}
              <path 
                d="M4 20V4h3l8 12V4h3v16h-3L7 8v12H4z" 
                fill="url(#logoGradient)"
                className="drop-shadow-sm"
              />
              
              {/* Accent dot for premium feel */}
              <circle 
                cx="19" 
                cy="5" 
                r="2" 
                fill="url(#logoGradient2)"
                className="animate-pulse"
              />
            </svg>
          </div>
          
          {/* Subtle inner border */}
          <div className="absolute inset-0 rounded-xl border border-white/10" />
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <h1 
          className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent tracking-tight leading-none"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          NyxtGen
        </h1>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-60" />
          <span 
            className="text-xs text-slate-400 font-medium tracking-wide uppercase"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px' }}
          >
            AI Platform
          </span>
        </div>
      </div>
    </div>
  );
};

// Premium User Info Component for Header
const HeaderUserInfo = ({ user, onSignOut }: { user: any; onSignOut: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3"
    >
      {/* User Avatar and Info */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
          <User className="size-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-white font-medium text-sm leading-none">{user.email}</p>
          <p className="text-emerald-300 text-xs mt-0.5">Authenticated</p>
        </div>
      </div>

      {/* Sign Out Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onSignOut}
        className="relative size-12 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm transition-all duration-200 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
      >
        <LogOut className="size-5 text-red-300 hover:text-red-200 transition-colors" />
      </Button>
    </motion.div>
  );
};

export const Header = memo(() => {
  const [, setScreenState] = useAtom(screenAtom);
  const [conversation] = useAtom(conversationAtom);
  const [settingsSaved] = useAtom(settingsSavedAtom);
  const [profileSaved] = useAtom(profileSavedAtom);
  const { user, signOut } = useAuthContext();

  const handleSettings = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "settings" });
    }
  };

  const handleProfile = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "profile" });
    }
  };

  const handleChat = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "chat" });
    }
  };

  const handleSignOut = async () => {
    try {
      // Immediately redirect to home for instant feedback
      setScreenState({ currentScreen: "home" });
      
      // Then perform the actual sign out in the background
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if sign out fails, we've already redirected to home
    }
  };

  return (
    <header className="flex w-full items-center justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
      <NyxtGenLogo />
      
      <div className="flex items-center gap-4">
        {/* User Info (if authenticated) */}
        {user && <HeaderUserInfo user={user} onSignOut={handleSignOut} />}
        
        {/* Chat Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleChat}
          className="relative size-12 border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <MessageCircle className="size-5 text-slate-300 hover:text-cyan-400 transition-colors" />
        </Button>
        
        {/* Profile Button */}
        <div className="relative">
          {profileSaved && (
            <div className="absolute -top-2 -right-2 z-20 rounded-full bg-emerald-500 p-1 animate-fade-in shadow-lg shadow-emerald-500/50">
              <Check className="size-3 text-white" />
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleProfile}
            className="relative size-12 border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <UserCircle className="size-5 text-slate-300 hover:text-purple-400 transition-colors" />
          </Button>
        </div>
        
        {/* Settings Button */}
        <div className="relative">
          {settingsSaved && (
            <div className="absolute -top-2 -right-2 z-20 rounded-full bg-emerald-500 p-1 animate-fade-in shadow-lg shadow-emerald-500/50">
              <Check className="size-3 text-white" />
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSettings}
            className="relative size-12 border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Settings className="size-5 text-slate-300 hover:text-cyan-400 transition-colors" />
          </Button>
        </div>
      </div>
    </header>
  );
});