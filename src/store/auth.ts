import { atom } from 'jotai';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase';

// Auth state atoms
export const userAtom = atom<User | null>(null);
export const sessionAtom = atom<Session | null>(null);
export const profileAtom = atom<Profile | null>(null);
export const isLoadingAtom = atom<boolean>(true);
export const isAuthenticatedAtom = atom<boolean>(false);

// Auth status derived atom
export const authStatusAtom = atom((get) => {
  const user = get(userAtom);
  const isLoading = get(isLoadingAtom);
  const isAuthenticated = get(isAuthenticatedAtom);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    isGuest: !isAuthenticated && !isLoading
  };
});

// User preferences atom (derived from profile)
export const userPreferencesAtom = atom(
  (get) => get(profileAtom)?.preferences || {},
  (get, set, preferences: any) => {
    const profile = get(profileAtom);
    if (profile) {
      set(profileAtom, { ...profile, preferences });
    }
  }
);