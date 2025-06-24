import { atom } from "jotai";
import { supabase } from "@/lib/supabase";

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
      
      // First try to get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        throw profileError;
      }
      
      // Get interests separately
      const { data: interestsData, error: interestsError } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', userId);
      
      if (interestsError) {
        console.error('Error loading interests:', interestsError);
      }
      
      console.log('Profile data from Supabase:', profileData);
      console.log('Interests data from Supabase:', interestsData);
      
      if (profileData) {
        const interests = interestsData?.map(item => item.interest) || [];
        
        const userProfile: UserProfile = {
          id: profileData.id,
          user_id: profileData.user_id,
          email: profileData.email,
          profilePhoto: profileData.profile_photo,
          coverPhoto: profileData.cover_photo,
          fullName: profileData.full_name || "",
          birthday: profileData.birthday,
          bio: profileData.bio || "",
          job: profileData.job || "",
          fashion: profileData.fashion || "",
          age: profileData.age,
          relationshipStatus: profileData.relationship_status || "prefer-not-to-say",
          location: profileData.location,
          interests: interests,
          website: profileData.website,
          phone: profileData.phone,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
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
      console.log('User ID:', userId);
      
      // Prepare profile data for Supabase
      const profileData = {
        user_id: userId,
        email: profile.email || "",
        profile_photo: profile.profilePhoto || null,
        cover_photo: profile.coverPhoto || null,
        full_name: profile.fullName || "",
        birthday: profile.birthday || null,
        bio: profile.bio || "",
        job: profile.job || "",
        fashion: profile.fashion || "",
        age: profile.age || null,
        relationship_status: profile.relationshipStatus || "prefer-not-to-say",
        location: profile.location || null,
        website: profile.website || null,
        phone: profile.phone || null,
      };
      
      console.log('Profile data to upsert:', profileData);
      
      // Upsert profile data
      const { data: upsertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (profileError) {
        console.error('Error upserting profile:', profileError);
        throw profileError;
      }
      
      console.log('Profile upserted successfully:', upsertedProfile);
      
      // Handle interests separately
      if (profile.interests && profile.interests.length > 0) {
        console.log('Saving interests:', profile.interests);
        
        // First delete existing interests
        const { error: deleteError } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('Error deleting existing interests:', deleteError);
        }
        
        // Then insert new interests
        const interestsToInsert = profile.interests.map(interest => ({
          user_id: userId,
          interest: interest
        }));
        
        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestsToInsert);
        
        if (interestsError) {
          console.error('Error inserting interests:', interestsError);
          throw interestsError;
        }
        
        console.log('Interests saved successfully');
      } else {
        // Clear all interests if none provided
        const { error: deleteError } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('Error clearing interests:', deleteError);
        }
      }
      
      console.log('Complete profile saved successfully to Supabase');
      
      // Update the profile with the current timestamp
      const updatedProfile = {
        ...profile,
        id: upsertedProfile.id,
        user_id: upsertedProfile.user_id,
        updatedAt: upsertedProfile.updated_at,
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