import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test database connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth State Change:', event);
  if (session) {
    console.log('👤 User authenticated:', session.user.id);
    console.log('📧 User email:', session.user.email);
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          profile_photo: string | null
          cover_photo: string | null
          full_name: string
          birthday: string | null
          bio: string
          job: string
          fashion: string
          age: number | null
          relationship_status: string
          location: string | null
          website: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          profile_photo?: string | null
          cover_photo?: string | null
          full_name: string
          birthday?: string | null
          bio?: string
          job?: string
          fashion?: string
          age?: number | null
          relationship_status?: string
          location?: string | null
          website?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          profile_photo?: string | null
          cover_photo?: string | null
          full_name?: string
          birthday?: string | null
          bio?: string
          job?: string
          fashion?: string
          age?: number | null
          relationship_status?: string
          location?: string | null
          website?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper function to test database connection
export const testDatabaseConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

// Helper function to check user authentication
export const checkUserAuth = async () => {
  try {
    console.log('🔍 Checking user authentication...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth check failed:', error);
      return null;
    }
    
    if (user) {
      console.log('✅ User is authenticated:', user.id);
      console.log('📧 User email:', user.email);
    } else {
      console.log('❌ No authenticated user found');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Auth check error:', error);
    return null;
  }
};