import React from "react";
import { motion } from "motion/react";

export default function VibrantBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-slate-50 dark:bg-slate-950 transition-colors duration-500 print:hidden">
      {/* Dynamic light glows for light mode / richer neon glows for dark mode */}
      
      {/* Orb 1: Indigo/Purple */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -50, 60, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] -left-16 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/15 blur-[80px] sm:blur-[120px]"
      />

      {/* Orb 2: Teal/Emerald */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[15%] -right-16 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-emerald-300/15 dark:bg-emerald-500/10 blur-[80px] sm:blur-[120px]"
      />

      {/* Orb 3: Violet/Rose */}
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, 70, -30, 0],
          scale: [1, 1.1, 0.8, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] right-[10%] w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] rounded-full bg-violet-400/15 dark:bg-violet-600/10 blur-[90px] sm:blur-[130px]"
      />

      {/* Orb 4: Amber/Orange warmth */}
      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, -40, 50, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-10 left-[20%] w-72 h-72 rounded-full bg-amber-300/10 dark:bg-amber-500/5 blur-[80px] sm:blur-[110px]"
      />

      {/* Subtlest background texture overlay (lines mesh) */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #80808012 1px, transparent 0)`,
          backgroundSize: "20px 20px"
        }}
      />
    </div>
  );
}
