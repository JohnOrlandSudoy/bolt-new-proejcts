import { AnimatedWrapper } from "@/components/DialogWrapper";
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { ArrowRight, Sparkles, Play, Zap, Brain, Video, MessageCircle, Star } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import { LogoText } from "@/components/LogoText";
import gloriaVideo from "@/assets/video/gloria.mp4";
import { motion, useScroll, useTransform } from "framer-motion";

// Premium Feature Card Component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  delay?: number; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon container */}
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="size-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-100 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
    </motion.div>
  );
};

// Premium Stats Component
const StatItem = ({ 
  value, 
  label, 
  delay = 0 
}: { 
  value: string; 
  label: string; 
  delay?: number; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </motion.div>
  );
};

// Floating Particles Component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export const Home: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleGetStarted = () => {
    setScreenState({ currentScreen: "intro" });
  };

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black overflow-hidden">
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
        {/* Multi-layered overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-cyan-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(6,182,212,0.15),transparent_50%)]" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Premium Border Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-10 pointer-events-none"
      >
        <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 rounded-none" 
             style={{ 
               backgroundClip: 'padding-box',
               mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               maskComposite: 'xor'
             }} 
        />
      </motion.div>

      {/* Interactive cursor glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl pointer-events-none z-5"
        style={{
          left: `${(mousePosition.x + 1) * 50}%`,
          top: `${(mousePosition.y + 1) * 50}%`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content Container */}
      <main className="relative z-20 flex flex-col min-h-screen">
        
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 mb-12"
          >
            {/* Premium Logo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-purple-500/30 blur-2xl animate-pulse" />
              <img 
                src="/images/vector.svg" 
                alt="NyxtGen Logo" 
                className="relative w-20 h-20 drop-shadow-2xl" 
              />
            </div>
            
            {/* Brand Name with Premium Typography */}
            <div className="space-y-2">
              <h1 
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent tracking-tight leading-none"
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '-0.04em'
                }}
              >
                NyxtGen
              </h1>
              
              {/* Premium Tagline */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex items-center justify-center gap-3 text-cyan-300 text-xl font-semibold"
              >
                <Sparkles className="size-6 animate-pulse" />
                <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  Next-Generation AI Platform
                </span>
                <Sparkles className="size-6 animate-pulse" />
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Headlines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6 mb-12 max-w-5xl"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white/95 leading-tight">
              Experience the{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Future
              </span>{" "}
              of Human–AI Conversation
            </h2>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 leading-relaxed font-light max-w-4xl mx-auto">
              Immersive, real-time video conversations with intelligent, lifelike AI personas. 
              Step into a new era of digital interaction powered by cutting-edge technology.
            </p>
          </motion.div>

          {/* Premium CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            {/* Primary CTA */}
            <AudioButton
              onClick={handleGetStarted}
              className="group relative overflow-hidden px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-3xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border border-cyan-400/20"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <Play className="size-6 fill-current" />
                Start Experience
                <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
              </span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </AudioButton>

            {/* Secondary CTA */}
            <a
              href="https://docs.tavus.io/sections/conversational-video-interface/cvi-overview"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 text-lg font-semibold text-cyan-300 hover:text-white border border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <Brain className="size-5" />
              How it Works
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Premium Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-12 mb-16 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <StatItem value="99.9%" label="Uptime" delay={0.9} />
            <div className="w-px h-12 bg-white/20" />
            <StatItem value="<50ms" label="Latency" delay={1.0} />
            <div className="w-px h-12 bg-white/20" />
            <StatItem value="24/7" label="Available" delay={1.1} />
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="px-6 py-16 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="text-center mb-16"
            >
              <h3 className="text-4xl font-bold text-white mb-4">
                Powered by{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Advanced AI
                </span>
              </h3>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Experience cutting-edge conversational AI technology that feels remarkably human
              </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={Video}
                title="Real-time Video"
                description="High-quality video conversations with lifelike AI personas"
                delay={1.1}
              />
              <FeatureCard
                icon={MessageCircle}
                title="Natural Dialog"
                description="Fluid, contextual conversations that feel genuinely human"
                delay={1.2}
              />
              <FeatureCard
                icon={Brain}
                title="Advanced AI"
                description="Powered by state-of-the-art language models and neural networks"
                delay={1.3}
              />
              <FeatureCard
                icon={Zap}
                title="Lightning Fast"
                description="Ultra-low latency responses for seamless interactions"
                delay={1.4}
              />
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center py-12 px-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl font-light text-gray-300 italic max-w-4xl mx-auto">
            "Conversational AI, reimagined for the next generation of human-computer interaction."
          </blockquote>
        </motion.div>
      </main>
    </div>
  );
};