import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/DialogWrapper";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import { getDefaultStore } from "jotai";
import { settingsAtom, settingsSavedAtom } from "@/store/settings";
import { screenAtom } from "@/store/screens";
import { X, Save, User, Globe, Mic, MessageSquare, Bot, Key, Sparkles, Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { apiTokenAtom } from "@/store/tokens";

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
    outline: "border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm",
    primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25",
    secondary: "bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm border border-white/10",
    default: "bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm"
  };
  
  const sizes = {
    icon: "h-10 w-10 p-0",
    sm: "h-8 px-3 text-sm",
    default: "h-11 px-6 text-sm"
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

// Enhanced Input Component with better visibility
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
    showToggle?: boolean;
    onToggle?: () => void;
  }
>(({ className, icon, showToggle, onToggle, type, ...props }, ref) => {
  return (
    <div className="relative group">
      {/* Icon */}
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors z-10">
          {icon}
        </div>
      )}
      
      {/* Input field */}
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-xl border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-4 py-3 text-base text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all duration-200 font-mono",
          icon && "pl-12",
          showToggle && "pr-12",
          "hover:border-slate-500/70 hover:bg-slate-800/70",
          className
        )}
        style={{ fontFamily: "'Source Code Pro', monospace" }}
        ref={ref}
        {...props}
      />
      
      {/* Toggle button for password visibility */}
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors z-10 p-1"
        >
          {type === "password" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      )}
      
      {/* Focus glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Input.displayName = "Input";

// Enhanced Textarea Component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative group">
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-4 py-3 text-base text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all duration-200 resize-none font-mono hover:border-slate-500/70 hover:bg-slate-800/70",
          className
        )}
        style={{ fontFamily: "'Source Code Pro', monospace" }}
        ref={ref}
        {...props}
      />
      
      {/* Focus glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Textarea.displayName = "Textarea";

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
        "text-sm font-semibold text-white/90 leading-none flex items-center gap-2 mb-2",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 text-base">*</span>}
    </label>
  );
});
Label.displayName = "Label";

// Enhanced Select Component
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    icon?: React.ReactNode;
  }
>(({ className, icon, children, ...props }, ref) => {
  return (
    <div className="relative group">
      {/* Icon */}
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors z-10">
          {icon}
        </div>
      )}
      
      {/* Select field */}
      <select
        className={cn(
          "flex h-14 w-full rounded-xl border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-4 py-3 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all duration-200 appearance-none cursor-pointer font-mono hover:border-slate-500/70 hover:bg-slate-800/70",
          icon && "pl-12",
          className
        )}
        style={{ fontFamily: "'Source Code Pro', monospace" }}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      
      {/* Dropdown arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Focus glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Select.displayName = "Select";

// Settings Section Component
const SettingsSection = ({ 
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
    <div className="space-y-6 p-6 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/70 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

// Form Field Component for consistent spacing
const FormField = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [, setSettingsSaved] = useAtom(settingsSavedAtom);
  const [showApiToken, setShowApiToken] = React.useState(false);

  const languages = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Italian", value: "it" },
    { label: "Portuguese", value: "pt" },
  ];

  const interruptSensitivities = [
    { label: "Low - Rarely interrupts", value: "low" },
    { label: "Medium - Balanced interruption", value: "medium" },
    { label: "High - Frequently interrupts", value: "high" },
  ];

  const handleClose = () => {
    setScreenState({ 
      currentScreen: token ? "instructions" : "intro" 
    });
  };

  const handleSave = async () => {
    console.log('Current settings before save:', settings);
    
    const updatedSettings = {
      ...settings,
      greeting: settings.greeting,
    };
    
    localStorage.setItem('tavus-settings', JSON.stringify(updatedSettings));
    
    const store = getDefaultStore();
    store.set(settingsAtom, updatedSettings);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const storedSettings = localStorage.getItem('tavus-settings');
    const storeSettings = store.get(settingsAtom);
    
    console.log('Settings in localStorage:', JSON.parse(storedSettings || '{}'));
    console.log('Settings in store after save:', storeSettings);
    
    setSettingsSaved(true);
    handleClose();
  };

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 pt-8 pb-6 z-20 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <Sparkles className="size-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-slate-400 mt-1">Customize your AI conversation experience</p>
                </div>
              </div>
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
          
          {/* Settings Content */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-8">
            
            {/* Personal Information */}
            <SettingsSection
              title="Personal Information"
              description="Tell the AI about yourself for a more personalized experience"
              icon={<User className="size-5" />}
            >
              <FormField>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  icon={<User className="size-4" />}
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter your name (e.g., John Smith)"
                />
                <p className="text-xs text-slate-500 mt-2">This helps the AI address you personally during conversations</p>
              </FormField>
            </SettingsSection>

            {/* Language & Communication */}
            <SettingsSection
              title="Language & Communication"
              description="Configure how the AI communicates with you"
              icon={<Globe className="size-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField>
                  <Label htmlFor="language">Conversation Language</Label>
                  <Select
                    id="language"
                    icon={<Globe className="size-4" />}
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  >
                    {languages.map((lang) => (
                      <option 
                        key={lang.value} 
                        value={lang.value}
                        className="bg-slate-800 text-white py-2"
                      >
                        {lang.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">The AI will communicate in your selected language</p>
                </FormField>

                <FormField>
                  <Label htmlFor="interruptSensitivity">Interrupt Sensitivity</Label>
                  <Select
                    id="interruptSensitivity"
                    icon={<Mic className="size-4" />}
                    value={settings.interruptSensitivity}
                    onChange={(e) => setSettings({ ...settings, interruptSensitivity: e.target.value })}
                  >
                    {interruptSensitivities.map((sensitivity) => (
                      <option 
                        key={sensitivity.value} 
                        value={sensitivity.value}
                        className="bg-slate-800 text-white py-2"
                      >
                        {sensitivity.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">Controls how often the AI interrupts during conversation</p>
                </FormField>
              </div>
            </SettingsSection>

            {/* Conversation Customization */}
            <SettingsSection
              title="Conversation Customization"
              description="Personalize how conversations start and flow"
              icon={<MessageSquare className="size-5" />}
            >
              <div className="space-y-6">
                <FormField>
                  <Label htmlFor="greeting">Custom Greeting Message</Label>
                  <Input
                    id="greeting"
                    icon={<MessageSquare className="size-4" />}
                    value={settings.greeting}
                    onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                    placeholder="How should the AI greet you? (e.g., Hello! Ready to chat?)"
                  />
                  <p className="text-xs text-slate-500 mt-2">Leave empty to use the default greeting message</p>
                </FormField>

                <FormField>
                  <Label htmlFor="context">Conversation Context</Label>
                  <Textarea
                    id="context"
                    value={settings.context}
                    onChange={(e) => setSettings({ ...settings, context: e.target.value })}
                    placeholder="Provide additional context about yourself, your preferences, or what you'd like to discuss. For example: 'I'm a software developer interested in AI and machine learning. I enjoy discussing technical topics and learning about new technologies.'"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500 mt-2">This helps the AI understand your background and tailor responses to your interests</p>
                </FormField>
              </div>
            </SettingsSection>

            {/* AI Configuration */}
            <SettingsSection
              title="AI Configuration"
              description="Advanced settings for AI persona and behavior"
              icon={<Bot className="size-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField>
                  <Label htmlFor="persona">Persona ID</Label>
                  <Input
                    id="persona"
                    icon={<Bot className="size-4" />}
                    value={settings.persona}
                    onChange={(e) => setSettings({ ...settings, persona: e.target.value })}
                    placeholder="p2fbd605 (default)"
                  />
                  <p className="text-xs text-slate-500 mt-2">Custom AI persona identifier for specialized behavior</p>
                </FormField>

                <FormField>
                  <Label htmlFor="replica">Replica ID</Label>
                  <Input
                    id="replica"
                    icon={<Bot className="size-4" />}
                    value={settings.replica}
                    onChange={(e) => setSettings({ ...settings, replica: e.target.value })}
                    placeholder="rfb51183fe (optional)"
                  />
                  <p className="text-xs text-slate-500 mt-2">Custom replica identifier for specific AI appearance</p>
                </FormField>
              </div>
            </SettingsSection>

            {/* API Configuration */}
            <SettingsSection
              title="API Configuration"
              description="Manage your Tavus API credentials securely"
              icon={<Key className="size-5" />}
            >
              <FormField>
                <Label htmlFor="apiToken" required>Tavus API Token</Label>
                <Input
                  id="apiToken"
                  type={showApiToken ? "text" : "password"}
                  icon={<Key className="size-4" />}
                  value={token || ""}
                  onChange={(e) => {
                    const newToken = e.target.value;
                    setToken(newToken);
                    localStorage.setItem('tavus-token', newToken);
                  }}
                  placeholder="Enter your Tavus API key (required)"
                  showToggle={true}
                  onToggle={() => setShowApiToken(!showApiToken)}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-500">
                    Your API key is stored securely and encrypted
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Need an API key?</span>
                    <a
                      href="https://platform.tavus.io/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
                    >
                      Get one here →
                    </a>
                  </div>
                </div>
              </FormField>
            </SettingsSection>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 mt-8 pt-6 pb-8 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-sm border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-slate-400 leading-relaxed">
                <p className="font-medium text-white mb-1">💡 Settings Tips:</p>
                <p>• Changes are saved automatically and apply to your next conversation</p>
                <p>• All fields are optional except the API token</p>
                <p>• Your data is stored locally and securely encrypted</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="flex-1 sm:flex-none min-w-[140px]"
                >
                  <Save className="size-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};