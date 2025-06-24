import { useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { 
  supabase, 
  Profile, 
  validatePassword, 
  validateEmail, 
  checkRateLimit, 
  logAuthAttempt,
  getSessionTimeout,
  generateSecurePassword,
  AuthError
} from '@/lib/supabase';
import { 
  userAtom, 
  sessionAtom, 
  profileAtom, 
  isLoadingAtom, 
  isAuthenticatedAtom 
} from '@/store/auth';

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);
  const [session, setSession] = useAtom(sessionAtom);
  const [profile, setProfile] = useAtom(profileAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  // Session timeout management
  const setupSessionTimeout = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const timeout = getSessionTimeout();
    const timer = setTimeout(async () => {
      console.log('Session timeout reached, signing out...');
      await signOut();
    }, timeout);

    setSessionTimer(timer);
  }, [sessionTimer]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          setIsAuthenticated(!!initialSession?.user);

          // Get user profile if authenticated
          if (initialSession?.user) {
            await fetchUserProfile(initialSession.user.id);
            setupSessionTimeout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user || null);
        setIsAuthenticated(!!session?.user);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
          setupSessionTimeout();
          
          // Update last login
          await updateLastLogin(session.user.id);
        } else {
          setProfile(null);
          if (sessionTimer) {
            clearTimeout(sessionTimer);
            setSessionTimer(null);
          }
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      const profileData = data || null;
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Update last login
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ 
          last_login: new Date().toISOString(),
          login_count: supabase.sql`login_count + 1`
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Enhanced sign up with validation and rate limiting
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      // Check rate limiting
      const rateLimit = await checkRateLimit(email);
      if (!rateLimit.allowed) {
        throw new Error(`Too many failed attempts. Please try again later. Remaining attempts: ${rateLimit.remainingAttempts}`);
      }

      // Attempt sign up with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            full_name: fullName || '',
          }
        }
      });

      // Log attempt
      await logAuthAttempt(email, 'signup', !error);

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw error;
      }

      // Create profile record immediately since no email confirmation is needed
      if (data.user && !data.session) {
        // If user was created but no session (shouldn't happen with email confirmation disabled)
        throw new Error('Account created but sign-in failed. Please try signing in.');
      }

      if (data.user) {
        await createUserProfile(data.user.id, email, fullName);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Sign up failed';
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('Password')) {
        errorMessage = error.message;
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        errorMessage = error.message;
      } else if (error.message.includes('email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Authentication service is temporarily unavailable. Please try again later.';
      }

      return { data: null, error: { message: errorMessage, code: error.code } };
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced sign in with retry mechanism and rate limiting
  const signIn = async (email: string, password: string, retryCount = 0) => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password) {
        throw new Error('Password is required');
      }

      // Check rate limiting
      const rateLimit = await checkRateLimit(email);
      if (!rateLimit.allowed) {
        throw new Error(`Too many failed attempts. Please try again later. Remaining attempts: ${rateLimit.remainingAttempts}`);
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Log attempt
      await logAuthAttempt(email, 'signin', !error);

      if (error) {
        // Retry mechanism for network issues
        if (retryCount < 2 && (error.message.includes('network') || error.message.includes('timeout'))) {
          console.log(`Retrying sign in attempt ${retryCount + 1}/3`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return signIn(email, password, retryCount + 1);
        }
        
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Sign in failed';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Your account is not yet activated. Please check your email for a confirmation link.';
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        errorMessage = error.message;
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Authentication service is temporarily unavailable. Please try again later.';
      }

      return { data: null, error: { message: errorMessage, code: error.code } };
    } finally {
      setIsLoading(false);
    }
  };

  // Auto sign up/in (for seamless experience)
  const autoSignUpOrIn = async (email: string, password?: string) => {
    try {
      setIsLoading(true);

      // Generate a secure password if none provided
      const userPassword = password || generateSecurePassword();

      // Try to sign in first
      const signInResult = await signIn(email, userPassword);
      
      if (signInResult.data?.user) {
        return { data: signInResult.data, error: null, action: 'signin' };
      }

      // If sign in fails, try to sign up
      const signUpResult = await signUp(email, userPassword);
      
      if (signUpResult.data?.user) {
        return { data: signUpResult.data, error: null, action: 'signup' };
      }

      throw signUpResult.error || new Error('Authentication failed');
    } catch (error: any) {
      console.error('Auto auth error:', error);
      return { data: null, error, action: 'failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear session timeout
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      // Clear any cached data
      localStorage.removeItem('nyxtgen-auth-token');
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: { message: 'Failed to sign out. Please try again.' } };
    } finally {
      setIsLoading(false);
    }
  };

  // Create user profile with enhanced data
  const createUserProfile = async (userId: string, email: string, fullName?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName || '',
          last_login: new Date().toISOString(),
          login_count: 1,
          is_active: true,
          preferences: {
            language: 'en',
            interruptSensitivity: 'medium',
            greeting: '',
            context: '',
            persona: '',
            replica: '',
            theme: 'dark',
            notifications: true
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { data: null, error: { message: 'Failed to update profile. Please try again.' } };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error: { message: 'Failed to send password reset email. Please try again.' } };
    }
  };

  // Change password
  const changePassword = async (newPassword: string) => {
    try {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password change error:', error);
      return { error: { message: 'Failed to change password. Please try again.' } };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setupSessionTimeout();
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Session refresh error:', error);
      return { error: { message: 'Failed to refresh session' } };
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    autoSignUpOrIn,
    updateProfile,
    fetchUserProfile,
    resetPassword,
    changePassword,
    refreshSession
  };
};