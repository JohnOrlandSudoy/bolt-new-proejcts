import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    // Get initial session with faster timeout
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        // Set loading to false immediately after initial check
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with optimized handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Immediately update state for faster UI response
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only handle profile creation for successful sign-ins
        if (event === 'SIGNED_IN' && session?.user) {
          // Don't await this - let it happen in background
          createOrUpdateProfile(session.user).catch(error => {
            console.error('Background profile creation failed:', error);
            // Don't throw error here as user is already signed in
          });
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
      console.log('Creating/updating profile for user:', user.id);
      
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected for new users
        console.error('Error checking existing profile:', checkError);
        return;
      }

      if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
        return;
      }

      // Create new profile using the upsert function
      const { error: upsertError } = await supabase
        .rpc('upsert_user_profile', {
          profile_user_id: user.id,
          profile_email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          profile_photo: null,
          cover_photo: null,
          birthday: null,
          bio: '',
          job: '',
          fashion: '',
          age: null,
          relationship_status: 'prefer-not-to-say',
          location: null,
          website: null,
          phone: null
        });

      if (upsertError) {
        console.error('Error creating profile with upsert function:', upsertError);
        
        // Fallback: try direct insert
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            bio: '',
            job: '',
            fashion: '',
            relationship_status: 'prefer-not-to-say'
          });

        if (insertError) {
          console.error('Error creating profile with direct insert:', insertError);
          // Don't throw error - user is still authenticated
        } else {
          console.log('Profile created successfully with direct insert');
        }
      } else {
        console.log('Profile created successfully with upsert function');
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      // Don't throw error - user is still authenticated
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Starting sign up process for:', email);
      
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
        console.error('Sign up error:', error);
        return { user: null, error };
      }

      console.log('Sign up successful:', data.user?.email);

      // Immediately update local state for instant UI feedback
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        
        // Try to create profile in background, but don't block the sign up process
        if (data.session) {
          createOrUpdateProfile(data.user).catch(error => {
            console.error('Profile creation failed during sign up, but user is authenticated:', error);
            // User is still successfully signed up even if profile creation fails
          });
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error };
      }

      console.log('Sign in successful:', data.user?.email);

      // Immediately update local state for instant UI feedback
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        setLoading(false);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Immediately clear local state for instant UI feedback
      setUser(null);
      setSession(null);
      
      // Then perform the actual sign out in background
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password exception:', error);
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