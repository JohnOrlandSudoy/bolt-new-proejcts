import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useChat } from '@/hooks/useChat';
import { useUserSearch } from '@/hooks/useUserSearch';
import {
  MessageCircle,
  Send,
  Search,
  Users,
  Plus,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
  ArrowLeft,
  Hash,
  Lock,
  Globe,
  Crown,
  Shield,
  Star,
  Heart,
  Code,
  Image as ImageIcon,
  File,
  Zap,
  Coffee,
  Briefcase,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  AlertCircle,
  Check
} from 'lucide-react';
import { cn } from '@/utils';
import { ChatMessage, ChatRoom, UserForCollaboration, UserConnection } from '@/services/chatService';
import { chatService } from '@/services/chatService';

// Enhanced Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "ghost" | "outline" | "primary" | "secondary" | "danger" | "success";
    size?: "icon" | "sm" | "default" | "lg";
    loading?: boolean;
  }
>(({ className, variant = "default", size = "default", loading = false, children, disabled, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    ghost: "hover:bg-white/10 text-white/80 hover:text-white",
    outline: "border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm",
    primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25",
    secondary: "bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg shadow-green-500/25",
    default: "bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
  };
  
  const sizes = {
    icon: "h-10 w-10 p-0",
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
});
Button.displayName = "Button";

// Enhanced Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
    error?: string;
  }
>(({ className, icon, error, type, ...props }, ref) => {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 z-10">
          {icon}
        </div>
      )}
      
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border-2 border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 transition-all duration-200 shadow-lg",
          icon && "pl-10",
          "hover:border-cyan-500/70 hover:bg-slate-800",
          error && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/50",
          className
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
        ref={ref}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1 px-1"
        >
          {error}
        </motion.p>
      )}
      
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
});
Input.displayName = "Input";

// Chat Room Item Component
const ChatRoomItem = ({ 
  room, 
  isActive, 
  onClick 
}: { 
  room: ChatRoom; 
  isActive: boolean; 
  onClick: () => void; 
}) => {
  const getTypeIcon = () => {
    switch (room.type) {
      case 'direct':
        return <MessageCircle className="size-4" />;
      case 'group':
        return <Users className="size-4" />;
      case 'collaboration':
        return <Code className="size-4" />;
      default:
        return <MessageCircle className="size-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
        isActive 
          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" 
          : "hover:bg-white/10 border border-transparent"
      )}
    >
      {/* Room Icon */}
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-xl",
        isActive ? "bg-cyan-500/30" : "bg-white/10"
      )}>
        {getTypeIcon()}
      </div>

      {/* Room Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white truncate">
            {room.name || 'Direct Message'}
          </h3>
          {room.latestMessage && (
            <span className="text-xs text-slate-400">
              {formatTime(room.latestMessage.createdAt)}
            </span>
          )}
        </div>
        
        {room.latestMessage && (
          <p className="text-sm text-slate-400 truncate">
            {room.latestMessage.senderName}: {room.latestMessage.content}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {!room.isPrivate && <Globe className="size-3 text-slate-500" />}
            {room.isPrivate && <Lock className="size-3 text-slate-500" />}
            <span className="text-xs text-slate-500">
              {room.participantCount} member{room.participantCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          {room.unreadCount > 0 && (
            <div className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Message Component
const MessageItem = ({ 
  message, 
  isOwn, 
  showSender = true 
}: { 
  message: ChatMessage; 
  isOwn: boolean; 
  showSender?: boolean; 
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageTypeIcon = () => {
    switch (message.messageType) {
      case 'image':
        return <ImageIcon className="size-3" />;
      case 'file':
        return <File className="size-3" />;
      case 'code':
        return <Code className="size-3" />;
      case 'system':
        return <Settings className="size-3" />;
      default:
        return null;
    }
  };

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-white/10 text-slate-300 text-sm px-4 py-2 rounded-full flex items-center gap-2">
          <Settings className="size-3" />
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 mb-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {showSender && !isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
          {message.senderName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[70%] space-y-1",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender Name */}
        {showSender && !isOwn && (
          <div className="text-xs text-slate-400 font-medium">
            {message.senderName}
          </div>
        )}

        {/* Reply Context */}
        {message.replyTo && message.replyContent && (
          <div className="bg-white/5 border-l-2 border-cyan-500 pl-3 py-2 rounded-r-lg">
            <p className="text-xs text-slate-400 truncate">
              {message.replyContent}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "px-4 py-2 rounded-2xl",
          isOwn 
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
            : "bg-white/10 text-white"
        )}>
          <div className="flex items-center gap-2 mb-1">
            {getMessageTypeIcon()}
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>
        </div>

        {/* Message Time */}
        <div className={cn(
          "text-xs text-slate-500 flex items-center gap-1",
          isOwn ? "justify-end" : "justify-start"
        )}>
          <span>{formatTime(message.createdAt)}</span>
          {message.editedAt && (
            <span className="text-slate-600">(edited)</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// User Search Item Component with Connection Management
const UserSearchItem = ({ 
  user, 
  onConnect, 
  onMessage,
  onConnectionResponse
}: { 
  user: UserForCollaboration; 
  onConnect: () => void; 
  onMessage: () => void;
  onConnectionResponse?: (response: 'accepted' | 'declined') => void;
}) => {
  const getStatusColor = () => {
    switch (user.presenceStatus) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getConnectionButton = () => {
    switch (user.connectionStatus) {
      case 'none':
        return (
          <Button size="sm" variant="primary" onClick={onConnect}>
            <UserPlus className="size-4 mr-1" />
            Connect
          </Button>
        );
      case 'pending':
        return (
          <div className="flex gap-1">
            {onConnectionResponse && (
              <>
                <Button size="sm" variant="success" onClick={() => onConnectionResponse('accepted')}>
                  <Check className="size-4" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => onConnectionResponse('declined')}>
                  <X className="size-4" />
                </Button>
              </>
            )}
            <Button size="sm" variant="secondary" disabled>
              <Clock className="size-4 mr-1" />
              Pending
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button size="sm" variant="success" disabled>
            <UserCheck className="size-4 mr-1" />
            Connected
          </Button>
        );
      case 'declined':
        return (
          <Button size="sm" variant="outline" onClick={onConnect}>
            <UserPlus className="size-4 mr-1" />
            Retry
          </Button>
        );
      case 'blocked':
        return (
          <Button size="sm" variant="danger" disabled>
            <UserX className="size-4 mr-1" />
            Blocked
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900",
          getStatusColor()
        )} />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{user.fullName}</h3>
        <p className="text-sm text-slate-400 truncate">{user.bio}</p>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              {user.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            {user.presenceStatus}
          </div>
        </div>

        {/* Interests */}
        {user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full"
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full">
                +{user.interests.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {user.connectionStatus === 'accepted' && (
          <Button size="sm" variant="outline" onClick={onMessage}>
            <MessageSquare className="size-4" />
          </Button>
        )}
        {getConnectionButton()}
      </div>
    </motion.div>
  );
};

// Connection Item Component
const ConnectionItem = ({ 
  connection, 
  onMessage, 
  onRespond 
}: { 
  connection: UserConnection; 
  onMessage: () => void; 
  onRespond?: (response: 'accepted' | 'declined') => void; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
        {connection.otherUserName.charAt(0).toUpperCase()}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{connection.otherUserName}</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="capitalize">{connection.connectionType}</span>
          <span>•</span>
          <span className="capitalize">{connection.status}</span>
          {!connection.isRequester && connection.status === 'pending' && (
            <>
              <span>•</span>
              <span className="text-cyan-400">Wants to connect</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {connection.status === 'accepted' && (
          <Button size="sm" variant="outline" onClick={onMessage}>
            <MessageSquare className="size-4" />
          </Button>
        )}
        
        {!connection.isRequester && connection.status === 'pending' && onRespond && (
          <>
            <Button size="sm" variant="success" onClick={() => onRespond('accepted')}>
              <Check className="size-4" />
            </Button>
            <Button size="sm" variant="danger" onClick={() => onRespond('declined')}>
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Main Chat Component
export const Chat: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [activeTab, setActiveTab] = useState<'chats' | 'users' | 'connections'>('chats');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Hooks
  const { isAuthenticated, isLoading } = useAuthGuard({
    showAuthModal: true,
    redirectTo: "auth"
  });

  const {
    chatRooms,
    loadingRooms,
    errorRooms,
    currentRoomId,
    currentRoomMessages,
    loadingMessages,
    errorMessages,
    setCurrentRoom,
    sendMessage,
    createDirectMessage,
    createGroupChat,
    markAsRead,
    isConnected,
    typingUsers,
    sendTyping,
    loadChatRooms,
  } = useChat();

  const {
    users,
    loading: loadingUsers,
    error: errorUsers,
    searchTerm,
    setSearchTerm,
    sendConnectionRequest,
    createDirectMessage: createDMFromSearch,
  } = useUserSearch();

  // Load connections
  const loadConnections = async () => {
    setLoadingConnections(true);
    try {
      const userConnections = await chatService.getUserConnections();
      setConnections(userConnections);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoomMessages]);

  // Load connections when tab changes
  useEffect(() => {
    if (activeTab === 'connections') {
      loadConnections();
    }
  }, [activeTab]);

  // Handle typing indicators
  useEffect(() => {
    if (isTyping) {
      sendTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(false);
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, sendTyping]);

  // Handle message input change
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      sendTyping(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !currentRoomId) return;

    try {
      await sendMessage(messageInput.trim());
      setMessageInput('');
      setIsTyping(false);
      sendTyping(false);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      alert(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  // Handle user connection
  const handleConnectUser = async (user: UserForCollaboration) => {
    try {
      await sendConnectionRequest(user.userId, 'collaborate');
      // Refresh user list to update connection status
      // The useUserSearch hook should handle this automatically
    } catch (error) {
      console.error('Failed to send connection request:', error);
      alert(error instanceof Error ? error.message : 'Failed to send connection request');
    }
  };

  // Handle create DM from user search
  const handleMessageUser = async (user: UserForCollaboration) => {
    try {
      const roomId = await chatService.getOrCreateDMRoom(user.userId);
      setCurrentRoom(roomId);
      setActiveTab('chats');
      await loadChatRooms(); // Refresh chat rooms list
    } catch (error) {
      console.error('Failed to create DM:', error);
      alert(error instanceof Error ? error.message : 'Failed to create chat');
    }
  };

  // Handle connection response
  const handleConnectionResponse = async (connectionId: string, response: 'accepted' | 'declined') => {
    try {
      await chatService.respondToConnectionRequest(connectionId, response);
      await loadConnections(); // Refresh connections
      await loadChatRooms(); // Refresh chat rooms if accepted
    } catch (error) {
      console.error('Failed to respond to connection:', error);
      alert(error instanceof Error ? error.message : 'Failed to respond to connection');
    }
  };

  // Handle message connection
  const handleMessageConnection = async (connection: UserConnection) => {
    try {
      const roomId = await chatService.getOrCreateDMRoom(connection.otherUserId);
      setCurrentRoom(roomId);
      setActiveTab('chats');
      await loadChatRooms(); // Refresh chat rooms list
    } catch (error) {
      console.error('Failed to create DM:', error);
      alert(error instanceof Error ? error.message : 'Failed to create chat');
    }
  };

  // Handle close chat
  const handleClose = () => {
    setScreenState({ currentScreen: "intro" });
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by useAuthGuard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex h-full max-w-7xl mx-auto">
        
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white">Collaboration Hub</h1>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="size-5" />
              </Button>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200",
                  activeTab === 'chats'
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <MessageCircle className="size-4 inline mr-1" />
                Chats
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200",
                  activeTab === 'users'
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Users className="size-4 inline mr-1" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200",
                  activeTab === 'connections'
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <UserCheck className="size-4 inline mr-1" />
                Connections
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'chats' ? (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* Search */}
                  <div className="p-4">
                    <Input
                      placeholder="Search chats..."
                      icon={<Search className="size-4" />}
                    />
                  </div>

                  {/* Chat Rooms List */}
                  <div className="flex-1 overflow-y-auto px-4 space-y-2">
                    {loadingRooms ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-cyan-400" />
                      </div>
                    ) : errorRooms ? (
                      <div className="text-center py-8 text-red-400">
                        {errorRooms}
                      </div>
                    ) : chatRooms.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <MessageCircle className="size-12 mx-auto mb-4 opacity-50" />
                        <p>No chats yet</p>
                        <p className="text-sm">Start by connecting with users!</p>
                      </div>
                    ) : (
                      chatRooms.map((room) => (
                        <ChatRoomItem
                          key={room.id}
                          room={room}
                          isActive={currentRoomId === room.id}
                          onClick={() => setCurrentRoom(room.id)}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              ) : activeTab === 'users' ? (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full flex flex-col"
                >
                  {/* Search */}
                  <div className="p-4">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search className="size-4" />}
                    />
                  </div>

                  {/* Users List */}
                  <div className="flex-1 overflow-y-auto px-4 space-y-3">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-cyan-400" />
                      </div>
                    ) : errorUsers ? (
                      <div className="text-center py-8 text-red-400">
                        {errorUsers}
                      </div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Users className="size-12 mx-auto mb-4 opacity-50" />
                        <p>No users found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    ) : (
                      users.map((user) => (
                        <UserSearchItem
                          key={user.userId}
                          user={user}
                          onConnect={() => handleConnectUser(user)}
                          onMessage={() => handleMessageUser(user)}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="connections"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full flex flex-col"
                >
                  {/* Header */}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Your Connections</h2>
                    <p className="text-sm text-slate-400">Manage your connections and requests</p>
                  </div>

                  {/* Connections List */}
                  <div className="flex-1 overflow-y-auto px-4 space-y-3">
                    {loadingConnections ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-cyan-400" />
                      </div>
                    ) : connections.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <UserCheck className="size-12 mx-auto mb-4 opacity-50" />
                        <p>No connections yet</p>
                        <p className="text-sm">Start connecting with users!</p>
                      </div>
                    ) : (
                      connections.map((connection) => (
                        <ConnectionItem
                          key={connection.id}
                          connection={connection}
                          onMessage={() => handleMessageConnection(connection)}
                          onRespond={(response) => handleConnectionResponse(connection.id, response)}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl">
          
          {currentRoomId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <MessageCircle className="size-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">
                      {chatRooms.find(r => r.id === currentRoomId)?.name || 'Chat Room'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500" : "bg-red-500"
                      )} />
                      {isConnected ? 'Connected' : 'Connecting...'}
                      {typingUsers.length > 0 && (
                        <span className="text-cyan-400">
                          • {typingUsers.length} typing...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="size-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="size-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-5" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-cyan-400" />
                  </div>
                ) : errorMessages ? (
                  <div className="text-center py-8 text-red-400">
                    <AlertCircle className="size-6 mx-auto mb-2" />
                    {errorMessages}
                  </div>
                ) : currentRoomMessages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageCircle className="size-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  currentRoomMessages.map((message, index) => {
                    const isOwn = message.senderId === 'current-user'; // Replace with actual user ID
                    const showSender = index === 0 || 
                      currentRoomMessages[index - 1].senderId !== message.senderId;
                    
                    return (
                      <MessageItem
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showSender={showSender}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700/50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" type="button">
                    <Paperclip className="size-5" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={handleMessageInputChange}
                      placeholder="Type a message..."
                      className="pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <Smile className="size-4" />
                    </Button>
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="icon"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="size-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
                  <MessageCircle className="size-12 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome to Collaboration Hub
                  </h2>
                  <p className="text-slate-400 max-w-md">
                    Select a chat to start messaging, or discover new users to collaborate with.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="size-4 mr-2" />
                    Find Users
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('connections')}
                  >
                    <UserCheck className="size-4 mr-2" />
                    View Connections
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};