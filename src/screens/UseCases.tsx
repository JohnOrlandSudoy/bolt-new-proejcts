import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { 
  Brain, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  Play, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Users,
  MessageCircle,
  Video,
  Star
} from "lucide-react";
import { DialogWrapper, AnimatedTextBlockWrapper } from "@/components/DialogWrapper";
import { Button } from "@/components/ui/button";
import { fetchPersonas, createPersonaConversation, Persona, ConversationData } from "@/api/fetchPersonas";
import { apiTokenAtom } from "@/store/tokens";
import { conversationAtom } from "@/store/conversation";
import { screenAtom } from "@/store/screens";
import { cn } from "@/utils";
import gloriaVideo from "@/assets/video/gloria.mp4";

// Persona icon mapping
const personaIcons = {
  "tavus-researcher": Brain,
  "ai-interviewer": Briefcase,
  "history-teacher": GraduationCap,
  "sales-coach": TrendingUp,
};

// Persona descriptions
const personaDescriptions = {
  "tavus-researcher": "Meet Charlie, your friendly AI researcher from Tavus. Dive into technical discussions about AI, machine learning, and the future of human-AI interaction.",
  "ai-interviewer": "Practice with Jane Smith, a seasoned consulting principal. Perfect your case interview skills in a realistic, supportive environment.",
  "history-teacher": "Learn with Emma Wilson, an engaging US history teacher. Explore American history through interactive, personalized conversations.",
  "sales-coach": "Train with Bruce, an experienced sales coach. Develop your sales skills, practice pitches, and master objection handling techniques.",
};

// Premium Use Case Card Component
const UseCaseCard = ({ 
  persona, 
  conversationData, 
  onStartConversation, 
  isLoading 
}: { 
  persona: Persona; 
  conversationData?: ConversationData;
  onStartConversation: (persona: Persona) => void;
  isLoading: boolean;
}) => {
  const IconComponent = personaIcons[persona.persona_id as keyof typeof personaIcons] || Brain;
  const description = personaDescriptions[persona.persona_id as keyof typeof personaDescriptions] || "Engage in meaningful conversation with this AI persona.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Premium border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10 space-y-6">
        
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-cyan-500/30">
              <IconComponent className="size-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-100 transition-colors">
              {persona.persona_name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-slate-400 font-medium">Premium AI</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
          {description}
        </p>

        {/* Conversation Data Display */}
        {conversationData && (
          <div className="space-y-4 p-6 rounded-2xl bg-slate-800/50 border border-slate-600/30">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageCircle className="size-5 text-cyan-400" />
              Conversation Ready
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <span className="text-white font-mono">{conversationData.conversation_id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    conversationData.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                  )}>
                    {conversationData.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Replica:</span>
                  <span className="text-white font-mono">{conversationData.replica_id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">{new Date(conversationData.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Video className="size-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">Real-time Video</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Brain className="size-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Advanced AI</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Users className="size-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">Interactive</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onStartConversation(persona)}
          disabled={isLoading}
          className="group/btn relative w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 disabled:shadow-none transition-all duration-300 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed border-0 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          
          {/* Content */}
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Creating Conversation...
              </>
            ) : (
              <>
                <Play className="size-5 fill-current" />
                Start Conversation
                <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40" />
    </motion.div>
  );
};

export const UseCases: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [conversationData, setConversationData] = useState<Record<string, ConversationData>>({});
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setConversation] = useAtom(conversationAtom);
  const token = useAtomValue(apiTokenAtom);

  // Load personas on component mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const fetchedPersonas = await fetchPersonas();
        setPersonas(fetchedPersonas);
      } catch (error) {
        console.error("Failed to load personas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, []);

  const handleStartConversation = async (persona: Persona) => {
    if (!token) {
      setScreenState({ currentScreen: "intro" });
      return;
    }

    setLoadingPersona(persona.persona_id);
    
    try {
      const conversation = await createPersonaConversation(
        token,
        persona.persona_id,
        persona.persona_name
      );
      
      setConversationData(prev => ({
        ...prev,
        [persona.persona_id]: conversation
      }));
      
      setConversation(conversation);
      setScreenState({ currentScreen: "conversation" });
    } catch (error) {
      console.error("Failed to create conversation:", error);
      // Handle error - maybe show a toast or error message
    } finally {
      setLoadingPersona(null);
    }
  };

  const handleBackToHome = () => {
    setScreenState({ currentScreen: "home" });
  };

  if (isLoading) {
    return (
      <DialogWrapper>
        <AnimatedTextBlockWrapper>
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-xl animate-pulse" />
              <Loader2 className="size-16 text-cyan-400 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-white">Loading Use Cases</h3>
              <p className="text-cyan-300 text-sm font-medium">Preparing AI personas...</p>
            </div>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  return (
    <DialogWrapper>
      {/* Enhanced Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/85 to-slate-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
      </div>

      <AnimatedTextBlockWrapper>
        <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/40 to-purple-500/40 blur-lg animate-pulse" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20" />
                  <Sparkles className="size-8 text-cyan-400 relative z-10 drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-xl border border-white/10" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <span className="text-white">Explore</span>{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Conversational
                </span>{" "}
                <span className="text-white">Use Cases</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto font-light">
                Discover the power of AI conversations across different scenarios. 
                Each persona is designed for specific use cases and interactions.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {personas.length}
                </div>
                <div className="text-sm text-gray-400 font-medium">AI Personas</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ∞
                </div>
                <div className="text-sm text-gray-400 font-medium">Possibilities</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-400 font-medium">Available</div>
              </div>
            </div>
          </motion.div>

          {/* Use Cases Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {personas.map((persona, index) => (
              <motion.div
                key={persona.persona_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <UseCaseCard
                  persona={persona}
                  conversationData={conversationData[persona.persona_id]}
                  onStartConversation={handleStartConversation}
                  isLoading={loadingPersona === persona.persona_id}
                />
              </motion.div>
            ))}
          </div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center pt-8"
          >
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300"
            >
              ← Back to Home
            </Button>
          </motion.div>
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};