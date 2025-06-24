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

// REMOVED localStorage dependency - only use empty initial state
const getInitialProfile = (): UserProfile => {
  console.log('🆕 Creating empty profile - NO localStorage dependency');
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
export const dbConnectionStatusAtom = atom<'checking' | 'connected' | 'disconnected'>('checking');

// Derived atom to check if profile is complete
export const isProfileCompleteAtom = atom((get) => {
  const profile = get(userProfileAtom);
  return !!(profile.fullName && profile.bio);
});

// Action atom to test database connection
export const testDbConnectionAtom = atom(
  null,
  async (get, set) => {
    console.log('🔍 Testing database connection...');
    set(dbConnectionStatusAtom, 'checking');
    
    try {
      const isConnected = await testDatabaseConnection();
      const status = isConnected ? 'connected' : 'disconnected';
      set(dbConnectionStatusAtom, status);
      console.log(`📊 Database status: ${status}`);
      return isConnected;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      set(dbConnectionStatusAtom, 'disconnected');
      return false;
    }
  }
);

// Action atom to load profile from Supabase ONLY
export const loadProfileAtom = atom(
  null,
  async (get, set, userId: string) => {
    console.log('🔄 Loading profile from Supabase database ONLY...');
    console.log('👤 User ID:', userId);
    
    set(profileLoadingAtom, true);
    
    try {
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      set(dbConnectionStatusAtom, dbConnected ? 'connected' : 'disconnected');
      
      if (!dbConnected) {
        throw new Error('❌ Database connection failed - cannot load profile');
      }
      
      // Verify user authentication
      const user = await checkUserAuth();
      if (!user || user.id !== userId) {
        throw new Error('❌ User authentication failed');
      }
      
      console.log('🔍 Querying user_profiles table...');
      
      // Load profile data from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Profile query result:');
      console.log('✅ Data:', profileData);
      console.log('❌ Error:', profileError);
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error loading profile from database:', profileError);
        throw profileError;
      }
      
      // Load interests from Supabase
      console.log('🎯 Querying user_interests table...');
      const { data: interestsData, error: interestsError } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', userId);
      
      console.log('📊 Interests query result:');
      console.log('✅ Data:', interestsData);
      console.log('❌ Error:', interestsError);
      
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
        
        console.log('✅ Successfully loaded profile from Supabase database:', userProfile);
        set(userProfileAtom, userProfile);
        set(profileLoadedFromDbAtom, true);
      } else {
        console.log('📭 No profile data found in database - using empty profile');
        set(userProfileAtom, getInitialProfile());
        set(profileLoadedFromDbAtom, true);
      }
    } catch (error) {
      console.error('❌ Error loading profile from Supabase:', error);
      // Don't fall back to localStorage - keep empty profile
      set(userProfileAtom, getInitialProfile());
      throw error;
    } finally {
      set(profileLoadingAtom, false);
      console.log('🏁 Profile load process completed');
    }
  }
);

// Action atom to save profile to Supabase ONLY
export const saveProfileAtom = atom(
  null,
  async (get, set, userId: string) => {
    console.log('💾 Saving profile to Supabase database ONLY...');
    console.log('👤 User ID:', userId);
    
    set(profileLoadingAtom, true);
    
    try {
      const profile = get(userProfileAtom);
      
      console.log('📝 Profile data to save:', profile);
      
      // Test database connection first
      const dbConnected = await testDatabaseConnection();
      set(dbConnectionStatusAtom, dbConnected ? 'connected' : 'disconnected');
      
      if (!dbConnected) {
        throw new Error('❌ Database connection failed - cannot save profile');
      }
      
      // Verify user authentication
      const user = await checkUserAuth();
      if (!user || user.id !== userId) {
        throw new Error('❌ User authentication failed');
      }
      
      // Validate required fields
      if (!profile.fullName || profile.fullName.trim() === '') {
        throw new Error('❌ Full name is required');
      }
      
      // Prepare profile data for Supabase
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
      
      console.log('🔄 Upserting profile to Supabase database:', profileData);
      
      // Upsert profile data to Supabase
      const { data: upsertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      console.log('📊 Profile upsert result:');
      console.log('✅ Data:', upsertedProfile);
      console.log('❌ Error:', profileError);
      
      if (profileError) {
        console.error('❌ Error saving profile to database:', profileError);
        console.error('Error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw profileError;
      }
      
      if (!upsertedProfile) {
        throw new Error('❌ Profile upsert returned no data');
      }
      
      console.log('✅ Profile saved successfully to Supabase database!');
      
      // Handle interests separately
      if (profile.interests && profile.interests.length > 0) {
        console.log('🎯 Saving interests to database:', profile.interests);
        
        // Delete existing interests
        const { error: deleteError } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('⚠️ Error deleting existing interests:', deleteError);
        }
        
        // Insert new interests
        const interestsToInsert = profile.interests.map(interest => ({
          user_id: userId,
          interest: interest.trim()
        }));
        
        const { data: insertedInterests, error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestsToInsert)
          .select();
        
        console.log('📊 Interests insert result:');
        console.log('✅ Data:', insertedInterests);
        console.log('❌ Error:', interestsError);
        
        if (interestsError) {
          console.error('❌ Error saving interests:', interestsError);
          throw interestsError;
        }
        
        console.log('✅ Interests saved successfully to database!');
      } else {
        console.log('🧹 Clearing all interests from database');
        
        const { error: deleteError } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('⚠️ Error clearing interests:', deleteError);
        }
      }
      
      console.log('🎉 Complete profile saved successfully to Supabase database!');
      
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
      set(profileSavedAtom, true);
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => {
        set(profileSavedAtom, false);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('❌ CRITICAL ERROR: Failed to save profile to Supabase database:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // DO NOT fall back to localStorage - throw the error
      throw error;
    } finally {
      set(profileLoadingAtom, false);
      console.log('🏁 Profile save process completed');
    }
  }
);

// Action atom to update profile (NO localStorage backup)
export const updateProfileAtom = atom(
  null,
  (get, set, updates: Partial<UserProfile>) => {
    const currentProfile = get(userProfileAtom);
    const updatedProfile = { ...currentProfile, ...updates };
    
    console.log('🔄 Updating profile with:', updates);
    console.log('📝 New profile state:', updatedProfile);
    
    // Update the atom ONLY - NO localStorage
    set(userProfileAtom, updatedProfile);
    console.log('✅ Profile updated in memory only');
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
    set(dbConnectionStatusAtom, 'checking');
    
    // Reset to initial empty state - NO localStorage clearing needed
    set(userProfileAtom, getInitialProfile());
    console.log('✅ Profile state reset to empty - ready for database load');
  }
);