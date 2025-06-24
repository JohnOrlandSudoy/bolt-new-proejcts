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
  // Get the correct public URL for an image
  getImageUrl(path: string): string {
    if (!path) return '';
    
    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // If it's a base64 data URL, return as is
    if (path.startsWith('data:')) {
      return path;
    }
    
    // Get public URL from Supabase storage
    const { data } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Upload photo to Supabase Storage with proper folder structure
  async uploadPhoto(file: File, bucket: 'profile-photos' | 'cover-photos', userId: string): Promise<string> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${bucket}/${userId}/${fileName}`;

      console.log('Uploading file to path:', filePath);

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

      console.log('Upload successful:', data);

      // Return the file path (not the full URL) to store in database
      return filePath;
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw error;
    }
  }

  // Convert base64 to file and upload
  async uploadBase64Photo(base64Data: string, bucket: 'profile-photos' | 'cover-photos', userId: string): Promise<string> {
    try {
      console.log('Converting base64 to file for upload...');
      
      // Extract the actual base64 data (remove data:image/...;base64, prefix)
      const base64Parts = base64Data.split(',');
      if (base64Parts.length !== 2) {
        throw new Error('Invalid base64 data format');
      }

      const mimeType = base64Parts[0].match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const base64String = base64Parts[1];
      
      // Convert base64 to blob
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Create file from blob
      const file = new File([blob], `photo.${mimeType.split('/')[1]}`, { type: mimeType });
      
      console.log('File created:', { name: file.name, size: file.size, type: file.type });
      
      return await this.uploadPhoto(file, bucket, userId);
    } catch (error) {
      console.error('Base64 upload failed:', error);
      throw error;
    }
  }

  // Get user profile with interests
  async getUserProfile(userId: string): Promise<ProfileWithInterests | null> {
    try {
      console.log('Getting profile for user:', userId);
      
      const { data, error } = await supabase
        .rpc('get_user_profile_with_interests', { profile_user_id: userId });

      if (error) {
        console.error('Get profile error:', error);
        throw new Error(`Failed to get profile: ${error.message}`);
      }

      console.log('Profile data received:', data);
      return data;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  // Create or update user profile
  async upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<string> {
    try {
      console.log('Upserting profile for user:', userId, profileData);
      
      let profilePhotoPath = profileData.profilePhoto;
      let coverPhotoPath = profileData.coverPhoto;

      // Handle photo uploads if they are base64 data
      if (profileData.profilePhoto && profileData.profilePhoto.startsWith('data:')) {
        console.log('Uploading profile photo...');
        profilePhotoPath = await this.uploadBase64Photo(
          profileData.profilePhoto, 
          'profile-photos', 
          userId
        );
        console.log('Profile photo uploaded to path:', profilePhotoPath);
      }

      if (profileData.coverPhoto && profileData.coverPhoto.startsWith('data:')) {
        console.log('Uploading cover photo...');
        coverPhotoPath = await this.uploadBase64Photo(
          profileData.coverPhoto, 
          'cover-photos', 
          userId
        );
        console.log('Cover photo uploaded to path:', coverPhotoPath);
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
          profile_photo: profilePhotoPath || null,
          cover_photo: coverPhotoPath || null,
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

      console.log('Profile upserted successfully:', data);
      return data;
    } catch (error) {
      console.error('Upsert profile failed:', error);
      throw error;
    }
  }

  // Update user interests
  async updateUserInterests(userId: string, interests: string[]): Promise<void> {
    try {
      console.log('Updating interests for user:', userId, interests);
      
      const { error } = await supabase
        .rpc('upsert_user_interests', {
          profile_user_id: userId,
          interests_array: interests
        });

      if (error) {
        console.error('Update interests error:', error);
        throw new Error(`Failed to update interests: ${error.message}`);
      }

      console.log('Interests updated successfully');
    } catch (error) {
      console.error('Update interests failed:', error);
      throw error;
    }
  }

  // Save complete profile (profile + interests)
  async saveCompleteProfile(userId: string, profileData: UserProfile): Promise<void> {
    try {
      console.log('Saving complete profile for user:', userId);
      
      // Save profile data
      await this.upsertUserProfile(userId, profileData);

      // Save interests
      if (profileData.interests && profileData.interests.length > 0) {
        await this.updateUserInterests(userId, profileData.interests);
      } else {
        // Clear interests if none provided
        await this.updateUserInterests(userId, []);
      }

      console.log('Complete profile saved successfully');
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
      profilePhoto: this.getImageUrl(dbProfile.profile.profile_photo || ''),
      coverPhoto: this.getImageUrl(dbProfile.profile.cover_photo || ''),
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

  // Delete user profile and associated photos
  async deleteUserProfile(userId: string): Promise<void> {
    try {
      console.log('Deleting profile for user:', userId);
      
      // Delete photos from storage first
      try {
        const { data: profilePhotos } = await supabase.storage
          .from('user-uploads')
          .list(`profile-photos/${userId}`);
        
        const { data: coverPhotos } = await supabase.storage
          .from('user-uploads')
          .list(`cover-photos/${userId}`);

        // Delete profile photos
        if (profilePhotos && profilePhotos.length > 0) {
          const profilePaths = profilePhotos.map(photo => `profile-photos/${userId}/${photo.name}`);
          await supabase.storage.from('user-uploads').remove(profilePaths);
        }

        // Delete cover photos
        if (coverPhotos && coverPhotos.length > 0) {
          const coverPaths = coverPhotos.map(photo => `cover-photos/${userId}/${photo.name}`);
          await supabase.storage.from('user-uploads').remove(coverPaths);
        }
      } catch (storageError) {
        console.warn('Error deleting photos from storage:', storageError);
        // Continue with profile deletion even if photo deletion fails
      }

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

      console.log('Profile deleted successfully');
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

  // Delete a specific photo
  async deletePhoto(photoUrl: string, userId: string): Promise<void> {
    try {
      // Extract the file path from the URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const userIdFromUrl = urlParts[urlParts.length - 3];
      
      // Verify the user owns this photo
      if (userIdFromUrl !== userId) {
        throw new Error('Unauthorized: Cannot delete photo that does not belong to you');
      }

      const filePath = `${folder}/${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (error) {
        console.error('Delete photo error:', error);
        throw new Error(`Failed to delete photo: ${error.message}`);
      }

      console.log('Photo deleted successfully:', filePath);
    } catch (error) {
      console.error('Delete photo failed:', error);
      throw error;
    }
  }

  // Test image URL accessibility
  async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Image URL test failed:', error);
      return false;
    }
  }

  // Get signed URL for private images (if needed)
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('user-uploads')
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get signed URL failed:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();