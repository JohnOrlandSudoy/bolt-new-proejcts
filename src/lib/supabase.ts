import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
// For demo purposes, we'll use placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable email confirmation URL detection
    flowType: 'pkce'
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
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: any | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: any | null;
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