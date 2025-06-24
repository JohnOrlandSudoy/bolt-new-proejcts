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
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ConversationRecord = Database['public']['Tables']['conversations']['Row'];

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

// Enhanced client-side rate limiting (primary method when database is unavailable)
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number; resetTime: number }>();

// Check if auth_attempts table exists
let authAttemptsTableExists: boolean | null = null;

const checkAuthAttemptsTable = async (): Promise<boolean> => {
  if (authAttemptsTableExists !== null) {
    return authAttemptsTableExists;
  }

  try {
    // Try a simple query to check if table exists
    const { error } = await supabase
      .from('auth_attempts')
      .select('id')
      .limit(1);

    authAttemptsTableExists = !error;
    return authAttemptsTableExists;
  } catch (error) {
    console.warn('auth_attempts table check failed:', error);
    authAttemptsTableExists = false;
    return false;
  }
};

export const checkRateLimit = async (email: string): Promise<{ allowed: boolean; remainingAttempts: number }> => {
  const maxAttempts = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5');
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();
  
  // Check if auth_attempts table exists
  const tableExists = await checkAuthAttemptsTable();
  
  if (tableExists) {
    try {
      const cutoffTime = new Date(now - timeWindow).toISOString();

      const { data, error } = await supabase
        .from('auth_attempts')
        .select('*')
        .eq('email', email)
        .eq('success', false)
        .gte('created_at', cutoffTime)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database rate limit check failed, using client-side fallback:', error.message);
        return checkClientSideRateLimit(email, maxAttempts, timeWindow, now);
      }

      const failedAttempts = data?.length || 0;
      const remainingAttempts = Math.max(0, maxAttempts - failedAttempts);

      return {
        allowed: failedAttempts < maxAttempts,
        remainingAttempts
      };
    } catch (error) {
      console.warn('Rate limit check error, using client-side fallback:', error);
      return checkClientSideRateLimit(email, maxAttempts, timeWindow, now);
    }
  } else {
    // Use client-side rate limiting when table doesn't exist
    return checkClientSideRateLimit(email, maxAttempts, timeWindow, now);
  }
};

// Enhanced client-side rate limiting fallback
const checkClientSideRateLimit = (email: string, maxAttempts: number, timeWindow: number, now: number) => {
  const userAttempts = rateLimitStore.get(email);
  
  if (!userAttempts) {
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Reset if time window has passed
  if (now > userAttempts.resetTime) {
    rateLimitStore.delete(email);
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  const remainingAttempts = Math.max(0, maxAttempts - userAttempts.attempts);
  return {
    allowed: userAttempts.attempts < maxAttempts,
    remainingAttempts
  };
};

// Log auth attempt (with graceful fallback)
export const logAuthAttempt = async (
  email: string, 
  attemptType: 'signin' | 'signup', 
  success: boolean
): Promise<void> => {
  const now = Date.now();
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  
  // Always update client-side tracking for rate limiting
  if (!success) {
    const userAttempts = rateLimitStore.get(email) || { attempts: 0, lastAttempt: 0, resetTime: now + timeWindow };
    rateLimitStore.set(email, {
      attempts: userAttempts.attempts + 1,
      lastAttempt: now,
      resetTime: userAttempts.resetTime || now + timeWindow
    });
  } else {
    // Clear failed attempts on success
    rateLimitStore.delete(email);
  }

  // Try to log to database if table exists
  const tableExists = await checkAuthAttemptsTable();
  
  if (tableExists) {
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
      console.warn('Failed to log auth attempt to database:', error);
      // Client-side tracking is already handled above
    }
  }
  // If table doesn't exist, we rely on client-side tracking only
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