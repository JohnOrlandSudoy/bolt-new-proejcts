import { atom } from "jotai";
import { supabase, profileService } from "@/lib/supabase";

export interface UserProfile {
  id?: string;
  user_id?: string;
  email?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  fullName: string;
  birthday?: string;
  bio: string;
  job: string;
  fashion: string;
  age?: number;
  relationshipStatus: string;
  location?: string;
  interests?: string[];
  website?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getInitialProfile = (): UserProfile => {
  const savedProfile = localStorage.getItem('user-profile');
  if (savedProfile) {
    return JSON.parse(savedProfile);
  }
  return {
    fullName: "",
    bio: "",
    job: "",
    fashion: "",
    relationshipStatus: "prefer-not-to-say",
    interests: [],
  };
};

export const userProfileAtom = atom<UserProfile>(getInitialProfile());

export const profileSavedAtom = atom<boolean>(false);

// Derived atom to check if profile is complete
export const isProfileCompleteAtom = atom((get) => {
  const profile = get(userProfileAtom);
  return !!(profile.fullName && profile.bio);
});

// Atom for loading state
export const profileLoadingAtom = atom<boolean>(false);

// Action atom to load profile from Supabase
export const loadProfileAtom = atom(
  null,
  async (get, set, userId: string) => {
    set(profileLoadingAtom, true);
    try {
      const profileData = await profileService.getUserProfile(userId);
      
      if (profileData && profileData.profile) {
        const profile = profileData.profile;
        const interests = profileData.interests || [];
        
        const userProfile: UserProfile = {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          profilePhoto: profile.profile_photo,
          coverPhoto: profile.cover_photo,
          fullName: profile.full_name || "",
          birthday: profile.birthday,
          bio: profile.bio || "",
          job: profile.job || "",
          fashion: profile.fashion || "",
          age: profile.age,
          relationshipStatus: profile.relationship_status || "prefer-not-to-say",
          location: profile.location,
          interests: interests,
          website: profile.website,
          phone: profile.phone,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
        
        set(userProfileAtom, userProfile);
        
        // Also save to localStorage as backup
        localStorage.setItem('user-profile', JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fall back to localStorage if Supabase fails
      const savedProfile = localStorage.getItem('user-profile');
      if (savedProfile) {
        set(userProfileAtom, JSON.parse(savedProfile));
      }
    } finally {
      set(profileLoadingAtom, false);
    }
  }
);

// Action atom to save profile to Supabase
export const saveProfileAtom = atom(
  null,
  async (get, set, userId: string) => {
    set(profileLoadingAtom, true);
    try {
      const profile = get(userProfileAtom);
      
      // Save to Supabase
      await profileService.saveCompleteProfile(userId, {
        ...profile,
        email: profile.email || "", // Ensure email is provided
      });
      
      // Also save to localStorage as backup
      localStorage.setItem('user-profile', JSON.stringify(profile));
      
      set(profileSavedAtom, true);
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => {
        set(profileSavedAtom, false);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Fall back to localStorage only
      localStorage.setItem('user-profile', JSON.stringify(get(userProfileAtom)));
      set(profileSavedAtom, true);
      
      setTimeout(() => {
        set(profileSavedAtom, false);
      }, 3000);
      
      throw error;
    } finally {
      set(profileLoadingAtom, false);
    }
  }
);