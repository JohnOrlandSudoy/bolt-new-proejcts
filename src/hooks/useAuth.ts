import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { supabase, Profile } from '@/lib/supabase';
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
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
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) throw error;

      // Create profile record
      if (data.user) {
        await createUserProfile(data.user.id, email, fullName);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
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

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Create user profile
  const createUserProfile = async (userId: string, email: string, fullName?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName || '',
          preferences: {
            language: 'en',
            interruptSensitivity: 'medium',
            greeting: '',
            context: '',
            persona: '',
            replica: ''
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
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  // Generate secure password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
    fetchUserProfile
  };
};