import { AnimatedWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { ArrowRight, Sparkles } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import { LogoText } from "@/components/LogoText";
import gloriaVideo from "@/assets/video/gloria.mp4";
import { motion } from "framer-motion";

export const Home: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);

  const handleGetStarted = () => {
    setScreenState({ currentScreen: "intro" });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      {/* Video background */}
      <video
        src={gloriaVideo}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-cyan-900/40 z-10" />
      {/* Animated glowing border - now full width/height */}
      <motion.div
        initial={{ boxShadow: "0 0 0px #22d3ee" }}
        animate={{ boxShadow: [
          "0 0 0px #22d3ee",
          "0 0 80px 16px #22d3ee99",
          "0 0 0px #22d3ee"
        ] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full rounded-none border-t-2 border-b-2 border-cyan-400/60 z-20 pointer-events-none"
        style={{ filter: 'blur(1px)' }}
      />
      {/* Main content - full width, centered */}
      <main className="relative z-30 flex flex-col items-center justify-center gap-10 px-4 py-24 w-full min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <img src="/images/vector.svg" alt="Logo" className="w-24 h-24 mb-2 mx-auto" />
          <LogoText size="lg" className="mb-1 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl w-full" />
          <div className="flex items-center justify-center gap-2 text-cyan-300 text-lg font-medium mb-2 w-full">
            <Sparkles className="size-6 animate-pulse" />
            Powered by Advanced AI
            <Sparkles className="size-6 animate-pulse" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 mb-2 w-full"
        >
          Experience the future of human–AI conversation.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 w-full max-w-3xl mx-auto"
        >
          NextGen AI Platform brings you immersive, real-time video dialog with intelligent, lifelike AI personas. Step into a new era of digital interaction.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full"
        >
          <AudioButton
            onClick={handleGetStarted}
            className="relative flex items-center justify-center gap-2 rounded-3xl border border-cyan-400/70 px-12 py-5 text-2xl font-semibold text-white bg-cyan-400/10 hover:bg-cyan-400/20 transition-all duration-300 shadow-lg shadow-cyan-400/10"
            style={{
              backdropFilter: 'blur(8px)',
            }}
          >
            Get Started <ArrowRight className="size-7" />
          </AudioButton>
          <a
            href="https://docs.tavus.io/sections/conversational-video-interface/cvi-overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:underline text-lg font-medium px-6 py-3 rounded-2xl transition-colors duration-200"
          >
            How it works
          </a>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base text-gray-400 mt-12 w-full"
        >
          "Conversational AI, reimagined for the next generation."
        </motion.p>
      </main>
    </div>
  );
}; 