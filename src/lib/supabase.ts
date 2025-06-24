import { createClient } from '@supabase/supabase-js';

// Get environment variables - no fallbacks to force proper configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable email confirmation URL detection
    flowType: 'pkce',
    // Disable email confirmation requirement
    storage: window.localStorage,
    storageKey: 'nyxtgen-auth-token',
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'X-Client-Info': 'nyxtgen-ai-platform'
    }
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          preferences: any | null;
          last_login: string | null;
          login_count: number;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: any | null;
          last_login?: string | null;
          login_count?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: any | null;
          last_login?: string | null;
          login_count?: number;
          is_active?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          conversation_name: string;
          status: string;
          created_at: string;
          ended_at: string | null;
          duration: number | null;
          metadata: any | null;
        };
        Insert: {
          user_id: string;
          conversation_id: string;
          conversation_name: string;
          status: string;
          metadata?: any | null;
        };
        Update: {
          status?: string;
          ended_at?: string | null;
          duration?: number | null;
          metadata?: any | null;
        };
      };
      auth_attempts: {
        Row: {
          id: string;
          email: string;
          attempt_type: 'signin' | 'signup';
          success: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          attempt_type: 'signin' | 'signup';
          success: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          success?: boolean;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ConversationRecord = Database['public']['Tables']['conversations']['Row'];
export type AuthAttempt = Database['public']['Tables']['auth_attempts']['Row'];

// Auth error types
export interface AuthError {
  message: string;
  code?: string;
  details?: any;
}

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const minLength = parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH || '8');

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting helper
export const checkRateLimit = async (email: string): Promise<{ allowed: boolean; remainingAttempts: number }> => {
  const maxAttempts = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5');
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

  try {
    const { data, error } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('email', email)
      .eq('success', false)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remainingAttempts: maxAttempts };
    }

    const failedAttempts = data?.length || 0;
    const remainingAttempts = Math.max(0, maxAttempts - failedAttempts);

    return {
      allowed: failedAttempts < maxAttempts,
      remainingAttempts
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remainingAttempts: maxAttempts };
  }
};

// Log auth attempt
export const logAuthAttempt = async (
  email: string, 
  attemptType: 'signin' | 'signup', 
  success: boolean
): Promise<void> => {
  try {
    await supabase
      .from('auth_attempts')
      .insert({
        email,
        attempt_type: attemptType,
        success,
        ip_address: null, // Would need server-side implementation for real IP
        user_agent: navigator.userAgent
      });
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
};

// Session management
export const getSessionTimeout = (): number => {
  return parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'); // 1 hour default
};

// Secure password generation
export const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};