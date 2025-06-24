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
    try {
      return JSON.parse(savedProfile);
    } catch (error) {
      console.error('Error parsing saved profile:', error);
    }
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
      console.log('Loading profile for user:', userId);
      const profileData = await profileService.getUserProfile(userId);
      
      console.log('Received profile data:', profileData);
      
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
        
        console.log('Setting profile:', userProfile);
        set(userProfileAtom, userProfile);
        
        // Also save to localStorage as backup
        localStorage.setItem('user-profile', JSON.stringify(userProfile));
      } else {
        console.log('No profile data found, keeping current profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fall back to localStorage if Supabase fails
      const savedProfile = localStorage.getItem('user-profile');
      if (savedProfile) {
        try {
          set(userProfileAtom, JSON.parse(savedProfile));
        } catch (parseError) {
          console.error('Error parsing localStorage profile:', parseError);
        }
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
      
      console.log('Saving profile to Supabase:', profile);
      
      // Prepare profile data for Supabase
      const profileData = {
        email: profile.email || "",
        profilePhoto: profile.profilePhoto || null,
        coverPhoto: profile.coverPhoto || null,
        fullName: profile.fullName || "",
        birthday: profile.birthday || null,
        bio: profile.bio || "",
        job: profile.job || "",
        fashion: profile.fashion || "",
        age: profile.age || null,
        relationshipStatus: profile.relationshipStatus || "prefer-not-to-say",
        location: profile.location || null,
        website: profile.website || null,
        phone: profile.phone || null,
        interests: profile.interests || [],
      };
      
      // Save to Supabase
      await profileService.saveCompleteProfile(userId, profileData);
      
      console.log('Profile saved successfully to Supabase');
      
      // Update the profile with the current timestamp
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      
      set(userProfileAtom, updatedProfile);
      
      // Also save to localStorage as backup
      localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
      
      set(profileSavedAtom, true);
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => {
        set(profileSavedAtom, false);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error saving profile to Supabase:', error);
      
      // Fall back to localStorage only
      const profile = get(userProfileAtom);
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
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