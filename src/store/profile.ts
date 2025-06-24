import { atom } from "jotai";
import { supabase, testDatabaseConnection, checkUserAuth } from "@/lib/supabase";

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
      const parsed = JSON.parse(savedProfile);
      console.log('📱 Loaded profile from localStorage:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error parsing saved profile:', error);
      localStorage.removeItem('user-profile'); // Clear corrupted data
    }
  }
  
  console.log('🆕 Creating new empty profile');
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
export const profileLoadingAtom = atom<boolean>(false);
export const profileLoadedFromDbAtom = atom<boolean>(false);

// Derived atom to check if profile is complete
export const isProfileCompleteAtom = atom((get) => {
  const profile = get(userProfileAtom);
  return !!(profile.fullName && profile.bio);
});

// Action atom to load profile from Supabase with comprehensive debugging
export const loadProfileAtom = atom(
  null,
  async (get, set, userId: string) => {
    console.log('🔄 Starting profile load process...');
    console.log('👤 User ID:', userId);
    
    // Don't reload if already loaded from DB
    const alreadyLoaded = get(profileLoadedFromDbAtom);
    if (alreadyLoaded) {
      console.log('✅ Profile already loaded from database, skipping...');
      return;
    }

    set(profileLoadingAtom, true);
    
    try {
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }
      
      // Verify user authentication
      const user = await checkUserAuth();
      if (!user || user.id !== userId) {
        throw new Error('User authentication mismatch');
      }
      
      console.log('🔍 Loading profile data from Supabase...');
      
      // Load profile data with detailed logging
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Profile query result:');
      console.log('Data:', profileData);
      console.log('Error:', profileError);
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error loading profile:', profileError);
        throw profileError;
      }
      
      // Load interests with detailed logging
      const { data: interestsData, error: interestsError } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', userId);
      
      console.log('🎯 Interests query result:');
      console.log('Data:', interestsData);
      console.log('Error:', interestsError);
      
      if (interestsError) {
        console.error('⚠️ Error loading interests (non-fatal):', interestsError);
      }
      
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
        
        console.log('✅ Successfully loaded profile from database:', userProfile);
        set(userProfileAtom, userProfile);
        set(profileLoadedFromDbAtom, true);
        
        // Save to localStorage as backup
        localStorage.setItem('user-profile', JSON.stringify(userProfile));
        console.log('💾 Profile backed up to localStorage');
      } else {
        console.log('📭 No profile data found in database');
        // Mark as loaded even if no data found to prevent repeated attempts
        set(profileLoadedFromDbAtom, true);
      }
    } catch (error) {
      console.error('❌ Error loading profile from Supabase:', error);
      console.log('📱 Keeping localStorage profile due to database error');
      // Don't mark as loaded if there was an error, so we can retry
    } finally {
      set(profileLoadingAtom, false);
      console.log('🏁 Profile load process completed');
    }
  }
);

// Action atom to save profile to Supabase with comprehensive debugging
export const saveProfileAtom = atom(
  null,
  async (get, set, userId: string) => {
    console.log('💾 Starting profile save process...');
    console.log('👤 User ID:', userId);
    
    set(profileLoadingAtom, true);
    
    try {
      const profile = get(userProfileAtom);
      
      console.log('📝 Current profile data to save:', profile);
      
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }
      
      // Verify user authentication
      const user = await checkUserAuth();
      if (!user || user.id !== userId) {
        throw new Error('User authentication mismatch');
      }
      
      // Validate required fields
      if (!profile.fullName || profile.fullName.trim() === '') {
        throw new Error('Full name is required');
      }
      
      // Prepare profile data for Supabase with proper field mapping
      const profileData = {
        user_id: userId,
        email: profile.email || user.email || "",
        profile_photo: profile.profilePhoto || null,
        cover_photo: profile.coverPhoto || null,
        full_name: profile.fullName.trim(),
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
      
      console.log('🔄 Upserting profile data:', profileData);
      
      // Upsert profile data with detailed error handling
      const { data: upsertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      console.log('📊 Profile upsert result:');
      console.log('Data:', upsertedProfile);
      console.log('Error:', profileError);
      
      if (profileError) {
        console.error('❌ Error upserting profile:', profileError);
        console.error('Error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw profileError;
      }
      
      if (!upsertedProfile) {
        throw new Error('Profile upsert returned no data');
      }
      
      console.log('✅ Profile upserted successfully:', upsertedProfile);
      
      // Handle interests separately with detailed logging
      if (profile.interests && profile.interests.length > 0) {
        console.log('🎯 Saving interests:', profile.interests);
        
        // First delete existing interests
        const { error: deleteError } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);
        
        console.log('🗑️ Delete existing interests result:', deleteError);
        
        if (deleteError) {
          console.error('⚠️ Error deleting existing interests (non-fatal):', deleteError);
        }
        
        // Then insert new interests
        const interestsToInsert = profile.interests.map(interest => ({
          user_id: userId,
          interest: interest.trim()
        }));
        
        console.log('➕ Inserting interests:', interestsToInsert);
        
        const { data: insertedInterests, error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestsToInsert)
          .select();
        
        console.log('📊 Interests insert result:');
        console.log('Data:', insertedInterests);
        console.log('Error:', interestsError);
        
        if (interestsError) {
          console.error('❌ Error inserting interests:', interestsError);
          throw interestsError;
        }
        
        console.log('✅ Interests saved successfully');
      } else {
        console.log('🧹 Clearing all interests (none provided)');
        
        // Clear all interests if none provided
        const { error: deleteError } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('⚠️ Error clearing interests (non-fatal):', deleteError);
        }
      }
      
      console.log('🎉 Complete profile saved successfully to Supabase');
      
      // Update the profile atom with the saved data
      const updatedProfile = {
        ...profile,
        id: upsertedProfile.id,
        user_id: upsertedProfile.user_id,
        email: upsertedProfile.email,
        updatedAt: upsertedProfile.updated_at,
      };
      
      set(userProfileAtom, updatedProfile);
      set(profileLoadedFromDbAtom, true);
      
      // Also save to localStorage as backup
      localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
      console.log('💾 Profile updated in localStorage');
      
      set(profileSavedAtom, true);
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => {
        set(profileSavedAtom, false);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('❌ Error saving profile to Supabase:', error);
      
      // Provide detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Fall back to localStorage only
      const profile = get(userProfileAtom);
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
      console.log('💾 Profile saved to localStorage as fallback');
      set(profileSavedAtom, true);
      
      setTimeout(() => {
        set(profileSavedAtom, false);
      }, 3000);
      
      throw error;
    } finally {
      set(profileLoadingAtom, false);
      console.log('🏁 Profile save process completed');
    }
  }
);

// Action atom to update profile and persist immediately
export const updateProfileAtom = atom(
  null,
  (get, set, updates: Partial<UserProfile>) => {
    const currentProfile = get(userProfileAtom);
    const updatedProfile = { ...currentProfile, ...updates };
    
    console.log('🔄 Updating profile with:', updates);
    console.log('📝 New profile state:', updatedProfile);
    
    // Update the atom
    set(userProfileAtom, updatedProfile);
    
    // Immediately save to localStorage for persistence
    localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
    console.log('💾 Profile changes saved to localStorage');
  }
);

// Action atom to reset profile state
export const resetProfileAtom = atom(
  null,
  (get, set) => {
    console.log('🔄 Resetting profile state...');
    
    set(profileLoadedFromDbAtom, false);
    set(profileSavedAtom, false);
    set(profileLoadingAtom, false);
    
    // Clear localStorage
    localStorage.removeItem('user-profile');
    
    // Reset to initial state
    const initialProfile = {
      fullName: "",
      bio: "",
      job: "",
      fashion: "",
      relationshipStatus: "prefer-not-to-say",
      interests: [],
    };
    
    set(userProfileAtom, initialProfile);
    console.log('✅ Profile state reset completed');
  }
);