import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/store/profile';

export interface DatabaseProfile {
  id: string;
  user_id: string;
  email: string;
  profile_photo?: string;
  cover_photo?: string;
  full_name: string;
  birthday?: string;
  bio: string;
  job: string;
  fashion: string;
  age?: number;
  relationship_status: string;
  location?: string;
  website?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithInterests {
  profile: DatabaseProfile;
  interests: string[];
}

class ProfileService {
  // Upload photo to Supabase Storage
  async uploadPhoto(file: File, bucket: 'profile-photos' | 'cover-photos', userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload photo: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw error;
    }
  }

  // Convert base64 to file and upload
  async uploadBase64Photo(base64Data: string, bucket: 'profile-photos' | 'cover-photos', userId: string): Promise<string> {
    try {
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], `photo.jpg`, { type: 'image/jpeg' });
      
      return await this.uploadPhoto(file, bucket, userId);
    } catch (error) {
      console.error('Base64 upload failed:', error);
      throw error;
    }
  }

  // Get user profile with interests
  async getUserProfile(userId: string): Promise<ProfileWithInterests | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile_with_interests', { profile_user_id: userId });

      if (error) {
        console.error('Get profile error:', error);
        throw new Error(`Failed to get profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  // Create or update user profile
  async upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<string> {
    try {
      let profilePhotoUrl = profileData.profilePhoto;
      let coverPhotoUrl = profileData.coverPhoto;

      // Handle photo uploads if they are base64 data
      if (profileData.profilePhoto && profileData.profilePhoto.startsWith('data:')) {
        profilePhotoUrl = await this.uploadBase64Photo(
          profileData.profilePhoto, 
          'profile-photos', 
          userId
        );
      }

      if (profileData.coverPhoto && profileData.coverPhoto.startsWith('data:')) {
        coverPhotoUrl = await this.uploadBase64Photo(
          profileData.coverPhoto, 
          'cover-photos', 
          userId
        );
      }

      // Convert birthday to date format
      let birthdayDate = null;
      if (profileData.birthday) {
        birthdayDate = profileData.birthday;
      }

      const { data, error } = await supabase
        .rpc('upsert_user_profile', {
          profile_user_id: userId,
          profile_email: profileData.email || '',
          profile_photo: profilePhotoUrl || null,
          cover_photo: coverPhotoUrl || null,
          full_name: profileData.fullName || '',
          birthday: birthdayDate,
          bio: profileData.bio || '',
          job: profileData.job || '',
          fashion: profileData.fashion || '',
          age: profileData.age || null,
          relationship_status: profileData.relationshipStatus || 'prefer-not-to-say',
          location: profileData.location || null,
          website: profileData.website || null,
          phone: profileData.phone || null
        });

      if (error) {
        console.error('Upsert profile error:', error);
        throw new Error(`Failed to save profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Upsert profile failed:', error);
      throw error;
    }
  }

  // Update user interests
  async updateUserInterests(userId: string, interests: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('upsert_user_interests', {
          profile_user_id: userId,
          interests_array: interests
        });

      if (error) {
        console.error('Update interests error:', error);
        throw new Error(`Failed to update interests: ${error.message}`);
      }
    } catch (error) {
      console.error('Update interests failed:', error);
      throw error;
    }
  }

  // Save complete profile (profile + interests)
  async saveCompleteProfile(userId: string, profileData: UserProfile): Promise<void> {
    try {
      // Save profile data
      await this.upsertUserProfile(userId, profileData);

      // Save interests
      if (profileData.interests && profileData.interests.length > 0) {
        await this.updateUserInterests(userId, profileData.interests);
      }
    } catch (error) {
      console.error('Save complete profile failed:', error);
      throw error;
    }
  }

  // Convert database profile to UserProfile format
  convertToUserProfile(dbProfile: ProfileWithInterests): UserProfile {
    return {
      id: dbProfile.profile.id,
      email: dbProfile.profile.email,
      profilePhoto: dbProfile.profile.profile_photo || '',
      coverPhoto: dbProfile.profile.cover_photo || '',
      fullName: dbProfile.profile.full_name,
      birthday: dbProfile.profile.birthday || '',
      bio: dbProfile.profile.bio,
      job: dbProfile.profile.job,
      fashion: dbProfile.profile.fashion,
      age: dbProfile.profile.age,
      relationshipStatus: dbProfile.profile.relationship_status,
      location: dbProfile.profile.location || '',
      interests: dbProfile.interests || [],
      website: dbProfile.profile.website || '',
      phone: dbProfile.profile.phone || '',
      createdAt: dbProfile.profile.created_at,
      updatedAt: dbProfile.profile.updated_at,
    };
  }

  // Delete user profile
  async deleteUserProfile(userId: string): Promise<void> {
    try {
      // Delete interests first (due to foreign key)
      const { error: interestsError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId);

      if (interestsError) {
        console.error('Delete interests error:', interestsError);
        throw new Error(`Failed to delete interests: ${interestsError.message}`);
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('Delete profile error:', profileError);
        throw new Error(`Failed to delete profile: ${profileError.message}`);
      }
    } catch (error) {
      console.error('Delete profile failed:', error);
      throw error;
    }
  }

  // Check if user has a profile
  async hasProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Check profile error:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Check profile failed:', error);
      return false;
    }
  }
}

export const profileService = new ProfileService();