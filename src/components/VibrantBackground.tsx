import React from "react";
import { motion } from "motion/react";

export default function VibrantBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-[#030712] transition-colors duration-500 print:hidden">
      {/* Rich glowing ambient orbs */}
      
      {/* Orb 1: Deep Indigo / Royal Blue */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 70, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[5%] -left-20 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full bg-indigo-600/25 blur-[100px] sm:blur-[150px]"
      />

      {/* Orb 2: Vibrant Violet / Magenta */}
      <motion.div
        animate={{
          x: [0, -90, 60, 0],
          y: [0, 80, -50, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] -right-20 w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] rounded-full bg-purple-600/20 blur-[110px] sm:blur-[160px]"
      />

      {/* Orb 3: Cyan / Electric Blue */}
      <motion.div
        animate={{
          x: [0, 60, -70, 0],
          y: [0, 90, -40, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10%] left-[15%] w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] rounded-full bg-blue-600/20 blur-[100px] sm:blur-[140px]"
      />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      />
    </div>
  );
}
