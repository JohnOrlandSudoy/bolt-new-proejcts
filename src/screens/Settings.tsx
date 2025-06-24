import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/DialogWrapper";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import { getDefaultStore } from "jotai";
import { settingsAtom, settingsSavedAtom } from "@/store/settings";
import { screenAtom } from "@/store/screens";
import { X, Save, User, Globe, Mic, MessageSquare, Bot, Key, Sparkles } from "lucide-react";
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

// Enhanced Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
  }
>(({ className, icon, ...props }, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200",
          icon && "pl-10",
          "font-mono",
          className
        )}
        style={{ fontFamily: "'Source Code Pro', monospace" }}
        ref={ref}
        {...props}
      />
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
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200 resize-none font-mono",
        className
      )}
      style={{ fontFamily: "'Source Code Pro', monospace" }}
      ref={ref}
      {...props}
    />
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
        "text-sm font-semibold text-white/90 leading-none flex items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-400">*</span>}
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
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 z-10">
          {icon}
        </div>
      )}
      <select
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200 appearance-none cursor-pointer font-mono",
          icon && "pl-10",
          className
        )}
        style={{ fontFamily: "'Source Code Pro', monospace" }}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
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
    <div className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-white/60 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [, setSettingsSaved] = useAtom(settingsSavedAtom);

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
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 pt-8 pb-6 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <Sparkles className="size-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-white/60 mt-1">Customize your AI conversation experience</p>
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
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-6">
            
            {/* Personal Information */}
            <SettingsSection
              title="Personal Information"
              description="Tell the AI about yourself for a more personalized experience"
              icon={<User className="size-5" />}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  icon={<User className="size-4" />}
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
            </SettingsSection>

            {/* Language & Communication */}
            <SettingsSection
              title="Language & Communication"
              description="Configure how the AI communicates with you"
              icon={<Globe className="size-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
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
                        className="bg-gray-900 text-white"
                      >
                        {lang.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
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
                        className="bg-gray-900 text-white"
                      >
                        {sensitivity.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </SettingsSection>

            {/* Conversation Customization */}
            <SettingsSection
              title="Conversation Customization"
              description="Personalize how conversations start and flow"
              icon={<MessageSquare className="size-5" />}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="greeting">Custom Greeting</Label>
                  <Input
                    id="greeting"
                    icon={<MessageSquare className="size-4" />}
                    value={settings.greeting}
                    onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                    placeholder="How should the AI greet you?"
                  />
                  <p className="text-xs text-white/50">Leave empty to use the default greeting</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Custom Context</Label>
                  <Textarea
                    id="context"
                    value={settings.context}
                    onChange={(e) => setSettings({ ...settings, context: e.target.value })}
                    placeholder="Provide additional context about yourself, your preferences, or what you'd like to discuss..."
                  />
                  <p className="text-xs text-white/50">This helps the AI understand your background and interests</p>
                </div>
              </div>
            </SettingsSection>

            {/* AI Configuration */}
            <SettingsSection
              title="AI Configuration"
              description="Advanced settings for AI persona and behavior"
              icon={<Bot className="size-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="persona">Persona ID</Label>
                  <Input
                    id="persona"
                    icon={<Bot className="size-4" />}
                    value={settings.persona}
                    onChange={(e) => setSettings({ ...settings, persona: e.target.value })}
                    placeholder="p2fbd605"
                  />
                  <p className="text-xs text-white/50">Custom AI persona identifier</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replica">Replica ID</Label>
                  <Input
                    id="replica"
                    icon={<Bot className="size-4" />}
                    value={settings.replica}
                    onChange={(e) => setSettings({ ...settings, replica: e.target.value })}
                    placeholder="rfb51183fe"
                  />
                  <p className="text-xs text-white/50">Custom replica identifier</p>
                </div>
              </div>
            </SettingsSection>

            {/* API Configuration */}
            <SettingsSection
              title="API Configuration"
              description="Manage your Tavus API credentials"
              icon={<Key className="size-5" />}
            >
              <div className="space-y-2">
                <Label htmlFor="apiToken" required>API Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  icon={<Key className="size-4" />}
                  value={token || ""}
                  onChange={(e) => {
                    const newToken = e.target.value;
                    setToken(newToken);
                    localStorage.setItem('tavus-token', newToken);
                  }}
                  placeholder="Enter your Tavus API key"
                />
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>Don't have an API key?</span>
                  <a
                    href="https://platform.tavus.io/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Get one here →
                  </a>
                </div>
              </div>
            </SettingsSection>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 mt-8 pt-6 pb-8 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white/60">
                Changes are saved automatically and will apply to your next conversation.
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="min-w-[120px]"
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