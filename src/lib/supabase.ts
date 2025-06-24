import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          profile_photo: string | null
          cover_photo: string | null
          full_name: string
          birthday: string | null
          bio: string
          job: string
          fashion: string
          age: number | null
          relationship_status: string
          location: string | null
          website: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          profile_photo?: string | null
          cover_photo?: string | null
          full_name: string
          birthday?: string | null
          bio?: string
          job?: string
          fashion?: string
          age?: number | null
          relationship_status?: string
          location?: string | null
          website?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          profile_photo?: string | null
          cover_photo?: string | null
          full_name?: string
          birthday?: string | null
          bio?: string
          job?: string
          fashion?: string
          age?: number | null
          relationship_status?: string
          location?: string | null
          website?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest?: string
          created_at?: string
        }
      }
    }
    Functions: {
      get_user_profile_with_interests: {
        Args: {
          profile_user_id: string
        }
        Returns: any
      }
      upsert_user_profile: {
        Args: {
          profile_user_id: string
          profile_email: string
          profile_photo?: string
          cover_photo?: string
          full_name?: string
          birthday?: string
          bio?: string
          job?: string
          fashion?: string
          age?: number
          relationship_status?: string
          location?: string
          website?: string
          phone?: string
        }
        Returns: string
      }
      upsert_user_interests: {
        Args: {
          profile_user_id: string
          interests_array: string[]
        }
        Returns: void
      }
    }
  }
}

// Profile service functions
export const profileService = {
  // Get user profile with interests
  async getUserProfile(userId: string) {
    const { data, error } = await supabase.rpc('get_user_profile_with_interests', {
      profile_user_id: userId
    });
    
    if (error) throw error;
    return data;
  },

  // Create or update user profile
  async upsertProfile(userId: string, profileData: any) {
    const { data, error } = await supabase.rpc('upsert_user_profile', {
      profile_user_id: userId,
      profile_email: profileData.email,
      profile_photo: profileData.profilePhoto,
      cover_photo: profileData.coverPhoto,
      full_name: profileData.fullName,
      birthday: profileData.birthday,
      bio: profileData.bio,
      job: profileData.job,
      fashion: profileData.fashion,
      age: profileData.age,
      relationship_status: profileData.relationshipStatus,
      location: profileData.location,
      website: profileData.website,
      phone: profileData.phone
    });
    
    if (error) throw error;
    return data;
  },

  // Update user interests
  async updateInterests(userId: string, interests: string[]) {
    const { error } = await supabase.rpc('upsert_user_interests', {
      profile_user_id: userId,
      interests_array: interests
    });
    
    if (error) throw error;
  },

  // Save complete profile (profile + interests)
  async saveCompleteProfile(userId: string, profileData: any) {
    try {
      // Save profile data
      await this.upsertProfile(userId, profileData);
      
      // Save interests
      if (profileData.interests && profileData.interests.length > 0) {
        await this.updateInterests(userId, profileData.interests);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }
};