import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'collaboration';
  isPrivate: boolean;
  participantCount: number;
  latestMessage?: {
    content: string;
    createdAt: string;
    senderName: string;
  };
  unreadCount: number;
  lastReadAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'code' | 'ai_response';
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  replyTo?: string;
  replyContent?: string;
  metadata?: any;
  createdAt: string;
  editedAt?: string;
}

export interface UserForCollaboration {
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  profilePhoto?: string;
  location?: string;
  interests: string[];
  connectionStatus: 'none' | 'pending' | 'accepted' | 'blocked' | 'declined';
  lastSeen: string;
  presenceStatus: 'online' | 'away' | 'busy' | 'offline';
}

export interface UserConnection {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
  connectionType: 'friend' | 'follow' | 'collaborate';
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationSession {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  sessionType: 'general' | 'coding' | 'design' | 'brainstorm' | 'meeting';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  hostId: string;
  maxParticipants: number;
  sessionData?: any;
  startedAt: string;
  endedAt?: string;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentRoomId?: string;
}

class ChatService {
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  // Get user's chat rooms
  async getUserChatRooms(): Promise<ChatRoom[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_chat_rooms');

      if (error) {
        console.error('Error fetching chat rooms:', error);
        throw new Error(`Failed to fetch chat rooms: ${error.message}`);
      }

      return data?.map((room: any) => ({
        id: room.room_id,
        name: room.room_name,
        type: room.room_type,
        isPrivate: room.is_private,
        participantCount: room.participant_count,
        latestMessage: room.latest_message_content ? {
          content: room.latest_message_content,
          createdAt: room.latest_message_created_at,
          senderName: room.latest_message_sender_name,
        } : undefined,
        unreadCount: room.unread_count,
        lastReadAt: room.last_read_at,
      })) || [];
    } catch (error) {
      console.error('Get chat rooms failed:', error);
      throw error;
    }
  }

  // Create direct message room
  async createDirectMessageRoom(otherUserId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('create_direct_message_room', { other_user_id: otherUserId });

      if (error) {
        console.error('Error creating DM room:', error);
        throw new Error(`Failed to create direct message room: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create DM room failed:', error);
      throw error;
    }
  }

  // Create group chat room
  async createGroupChatRoom(name: string, description?: string, isPrivate: boolean = true): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          type: 'group',
          is_private: isPrivate,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating group room:', error);
        throw new Error(`Failed to create group room: ${error.message}`);
      }

      // Add creator as owner
      await supabase
        .from('chat_participants')
        .insert({
          room_id: data.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: 'owner',
        });

      return data.id;
    } catch (error) {
      console.error('Create group room failed:', error);
      throw error;
    }
  }

  // Get room messages
  async getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_room_messages', {
          room_id_param: roomId,
          limit_count: limit,
          offset_count: offset,
        });

      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      return data?.map((msg: any) => ({
        id: msg.message_id,
        content: msg.content,
        messageType: msg.message_type,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderPhoto: msg.sender_photo,
        replyTo: msg.reply_to,
        replyContent: msg.reply_content,
        metadata: msg.metadata,
        createdAt: msg.created_at,
        editedAt: msg.edited_at,
      })).reverse() || []; // Reverse to show oldest first
    } catch (error) {
      console.error('Get messages failed:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(
    roomId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'code' = 'text',
    replyTo?: string,
    metadata?: any
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          content,
          message_type: messageType,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          reply_to: replyTo,
          metadata: metadata || {},
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  // Search users for collaboration
  async searchUsersForCollaboration(searchTerm: string = '', limit: number = 20): Promise<UserForCollaboration[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_users_for_collaboration', {
          search_term: searchTerm,
          limit_count: limit,
        });

      if (error) {
        console.error('Error searching users:', error);
        throw new Error(`Failed to search users: ${error.message}`);
      }

      return data?.map((user: any) => ({
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        bio: user.bio,
        profilePhoto: user.profile_photo,
        location: user.location,
        interests: user.interests || [],
        connectionStatus: user.connection_status,
        lastSeen: user.last_seen,
        presenceStatus: user.presence_status,
      })) || [];
    } catch (error) {
      console.error('Search users failed:', error);
      throw error;
    }
  }

  // Send connection request
  async sendConnectionRequest(userId: string, type: 'friend' | 'follow' | 'collaborate' = 'friend'): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('send_connection_request', {
          addressee_id_param: userId,
          connection_type_param: type,
        });

      if (error) {
        console.error('Error sending connection request:', error);
        throw new Error(`Failed to send connection request: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Send connection request failed:', error);
      throw error;
    }
  }

  // Respond to connection request
  async respondToConnectionRequest(connectionId: string, response: 'accepted' | 'declined' | 'blocked'): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('respond_to_connection_request', {
          connection_id_param: connectionId,
          response_param: response,
        });

      if (error) {
        console.error('Error responding to connection request:', error);
        throw new Error(`Failed to respond to connection request: ${error.message}`);
      }
    } catch (error) {
      console.error('Respond to connection request failed:', error);
      throw error;
    }
  }

  // Get user connections
  async getUserConnections(): Promise<UserConnection[]> {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          connection_type,
          created_at,
          updated_at
        `)
        .or(`requester_id.eq.${(await supabase.auth.getUser()).data.user?.id},addressee_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connections:', error);
        throw new Error(`Failed to fetch connections: ${error.message}`);
      }

      return data?.map((conn: any) => ({
        id: conn.id,
        requesterId: conn.requester_id,
        addresseeId: conn.addressee_id,
        status: conn.status,
        connectionType: conn.connection_type,
        createdAt: conn.created_at,
        updatedAt: conn.updated_at,
      })) || [];
    } catch (error) {
      console.error('Get connections failed:', error);
      throw error;
    }
  }

  // Update user presence
  async updateUserPresence(status: 'online' | 'away' | 'busy' | 'offline', roomId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_user_presence', {
          status_param: status,
          room_id_param: roomId,
        });

      if (error) {
        console.error('Error updating presence:', error);
        throw new Error(`Failed to update presence: ${error.message}`);
      }
    } catch (error) {
      console.error('Update presence failed:', error);
      throw error;
    }
  }

  // Create collaboration session
  async createCollaborationSession(
    roomId: string,
    title: string,
    description?: string,
    sessionType: 'general' | 'coding' | 'design' | 'brainstorm' | 'meeting' = 'general'
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('create_collaboration_session', {
          room_id_param: roomId,
          title_param: title,
          description_param: description || '',
          session_type_param: sessionType,
        });

      if (error) {
        console.error('Error creating collaboration session:', error);
        throw new Error(`Failed to create collaboration session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create collaboration session failed:', error);
      throw error;
    }
  }

  // Join room
  async joinRoom(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .insert({
          room_id: roomId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: 'member',
        });

      if (error) {
        console.error('Error joining room:', error);
        throw new Error(`Failed to join room: ${error.message}`);
      }
    } catch (error) {
      console.error('Join room failed:', error);
      throw error;
    }
  }

  // Leave room
  async leaveRoom(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error leaving room:', error);
        throw new Error(`Failed to leave room: ${error.message}`);
      }
    } catch (error) {
      console.error('Leave room failed:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw new Error(`Failed to mark messages as read: ${error.message}`);
      }
    } catch (error) {
      console.error('Mark messages as read failed:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates for a room
  subscribeToRoom(roomId: string, callbacks: {
    onMessage?: (message: ChatMessage) => void;
    onPresenceUpdate?: (presence: UserPresence) => void;
    onTyping?: (userId: string, isTyping: boolean) => void;
  }): () => void {
    const channelName = `room:${roomId}`;
    
    // Remove existing channel if it exists
    if (this.realtimeChannels.has(channelName)) {
      this.realtimeChannels.get(channelName)?.unsubscribe();
      this.realtimeChannels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (callbacks.onMessage) {
            // Fetch the complete message with sender info
            const { data } = await supabase
              .rpc('get_room_messages', {
                room_id_param: roomId,
                limit_count: 1,
                offset_count: 0,
              });

            if (data && data.length > 0) {
              const msg = data[0];
              callbacks.onMessage({
                id: msg.message_id,
                content: msg.content,
                messageType: msg.message_type,
                senderId: msg.sender_id,
                senderName: msg.sender_name,
                senderPhoto: msg.sender_photo,
                replyTo: msg.reply_to,
                replyContent: msg.reply_content,
                metadata: msg.metadata,
                createdAt: msg.created_at,
                editedAt: msg.edited_at,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          if (callbacks.onPresenceUpdate && payload.new) {
            callbacks.onPresenceUpdate({
              userId: payload.new.user_id,
              status: payload.new.status,
              lastSeen: payload.new.last_seen,
              currentRoomId: payload.new.current_room_id,
            });
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (callbacks.onTyping) {
          callbacks.onTyping(payload.payload.userId, payload.payload.isTyping);
        }
      })
      .subscribe();

    this.realtimeChannels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.realtimeChannels.delete(channelName);
    };
  }

  // Send typing indicator
  async sendTypingIndicator(roomId: string, isTyping: boolean): Promise<void> {
    const channelName = `room:${roomId}`;
    const channel = this.realtimeChannels.get(channelName);
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: (await supabase.auth.getUser()).data.user?.id,
          isTyping,
        },
      });
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.realtimeChannels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.realtimeChannels.clear();
  }
}

export const chatService = new ChatService();