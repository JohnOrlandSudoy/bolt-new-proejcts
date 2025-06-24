import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getDefaultStore } from 'jotai';
import { loadProfileAtom, resetProfileAtom } from '@/store/profile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider initializing...');
    
    // Get initial session with faster timeout
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting session:', error);
        } else {
          console.log('📋 Initial session:', session?.user?.id ? 'Found' : 'None');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Load profile data from Supabase if user is authenticated
          if (session?.user?.id) {
            console.log('👤 User authenticated, loading profile from Supabase database...');
            const store = getDefaultStore();
            store.set(loadProfileAtom, session.user.id);
          }
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        // Set loading to false immediately after initial check
        setLoading(false);
        console.log('✅ Initial auth check completed');
      }
    };

    getInitialSession();

    // Listen for auth changes with optimized handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        // Immediately update state for faster UI response
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle profile operations for authenticated users
        if (event === 'SIGNED_IN' && session?.user) {
          // Don't await this - let it happen in background
          createOrUpdateProfile(session.user).catch(console.error);
          
          // Load profile data from Supabase database
          console.log('👤 User signed in, loading profile from Supabase database...');
          const store = getDefaultStore();
          store.set(loadProfileAtom, session.user.id);
        }
        
        // Clear profile data on sign out
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing profile data...');
          const store = getDefaultStore();
          store.set(resetProfileAtom);
        }
        
        // Ensure loading is false after any auth state change
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log('👤 Creating/updating basic profile for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('❌ Error creating/updating basic profile:', error);
      } else {
        console.log('✅ Basic profile created/updated successfully');
      }
    } catch (error) {
      console.error('❌ Error in createOrUpdateProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('📝 Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { user: null, error };
      }

      // Immediately update local state for instant UI feedback
      if (data.user) {
        console.log('✅ User signed up successfully:', data.user.id);
        setUser(data.user);
        setSession(data.session);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign up exception:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { user: null, error };
      }

      // Immediately update local state for instant UI feedback
      if (data.user && data.session) {
        console.log('✅ User signed in successfully:', data.user.id);
        setUser(data.user);
        setSession(data.session);
        setLoading(false);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out user...');
      
      // Immediately clear local state for instant UI feedback
      setUser(null);
      setSession(null);
      
      // Clear profile data - NO localStorage clearing needed
      const store = getDefaultStore();
      store.set(resetProfileAtom);
      
      // Then perform the actual sign out in background
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return { error };
      }

      console.log('✅ User signed out successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out exception:', error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Resetting password for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        return { error };
      }

      console.log('✅ Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('❌ Reset password exception:', error);
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};