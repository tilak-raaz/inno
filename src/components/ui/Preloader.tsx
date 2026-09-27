"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";

export function Preloader() {
  const [phase, setPhase] = useState<"initial" | "warping" | "flash" | "done">("initial");
  const [randomStars, setRandomStars] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playOpening, playWarp, playMain } = useAudio();

  // Try to play opening music as soon as component mounts
  useEffect(() => {
    // Generate random values for the UI stars on the client to prevent hydration mismatch
    setRandomStars(
      [...Array(30)].map(() => ({
        width: Math.random() * 6 + 2,
        height: Math.random() * 6 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 1 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );

    playOpening();
    // Also try on first click anywhere in case autoplay was blocked
    const startAudioOnFirstInteraction = () => {
      playOpening();
      window.removeEventListener("click", startAudioOnFirstInteraction);
    };
    window.addEventListener("click", startAudioOnFirstInteraction);
    return () => window.removeEventListener("click", startAudioOnFirstInteraction);
  }, [playOpening]);

  const startWarp = () => {
    playWarp();
    setPhase("warping");
  };

  useEffect(() => {
    if (phase !== "warping" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const numStars = 600;
    const stars: { x: number; y: number; z: number, pz: number }[] = [];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: Math.random() * width,
      });
    }

    let animationFrameId: number;
    let speed = 2;

    const render = () => {
      speed += 0.5; // Accelerate!
      
      ctx.fillStyle = "rgba(6, 3, 14, 0.2)"; // Trailing effect
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (const star of stars) {
        star.z -= speed;

        if (star.z < 1) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.pz = star.z;
        }

        const sx = (star.x / star.z) * cx + cx;
        const sy = (star.y / star.z) * cy + cy;

        const px = (star.x / star.pz) * cx + cx;
        const py = (star.y / star.pz) * cy + cy;

        star.pz = star.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(167, 139, 250, ${1 - star.z / width})`;
        ctx.lineWidth = Math.max(1, (1 - star.z / width) * 4);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // After 2.5 seconds of warp, trigger flash
    const timer = setTimeout(() => {
      setPhase("flash");
      // Then finish after flash
      setTimeout(() => {
        setPhase("done");
        playMain();
      }, 100); 
    }, 2500);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [phase]);

  return (
    <AnimatePresence mode="wait">
      {phase !== "done" && (
        <motion.div
          key="preloader"
          className={`fixed inset-0 z-[100] flex items-center justify-center ${phase === 'flash' ? 'bg-white' : 'bg-ink'}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === 'flash' ? 3 : 0.8, ease: "easeOut" }} // Slow fade out after flash
        >
          {phase === "warping" && (
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          )}

          {phase === "initial" && (
            <div className="relative z-10 flex flex-col items-center justify-center">
              
              {/* Title added to Preloader */}
              <motion.div 
                className="mb-12 flex flex-col items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h1 className="font-display text-4xl font-black uppercase tracking-[0.15em] text-white sm:text-6xl text-center">
                  Innovision <span className="text-violet-400">2026</span>
                </h1>
                <div className="mt-4 h-[1px] w-48 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                <p className="mt-4 font-display text-xs font-bold tracking-[0.3em] text-violet-200/60 uppercase">
                  Prepare for Launch
                </p>
              </motion.div>

              {/* Glowing Stars in front of button (More prominent & numerous) */}
              {randomStars.map((s, i) => (
                <motion.div
                  key={i}
                  className="fixed rounded-full bg-white blur-[2px] shadow-[0_0_8px_rgba(255,255,255,1)]"
                  style={{
                    width: s.width + "px",
                    height: s.height + "px",
                    left: s.left + "vw",
                    top: s.top + "vh",
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: s.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: s.delay,
                  }}
                />
              ))}

              <motion.button
                onClick={startWarp}
                className="group relative overflow-hidden rounded-full border border-violet-500/50 bg-ink-raised px-8 py-4 font-display text-sm font-bold tracking-[0.2em] text-violet-100 transition-all hover:border-violet-300 hover:text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.8)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-500/40 to-violet-600/0 opacity-0 transition-opacity group-hover:opacity-100" />
                ENTER DEEP SPACE
              </motion.button>
              
              {/* Subtle ambient rings behind button */}
              <motion.div
                className="pointer-events-none absolute -z-10 h-64 w-64 rounded-full border border-violet-500/20 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="pointer-events-none absolute -z-10 h-48 w-48 rounded-full border border-violet-400/20 shadow-[0_0_15px_rgba(167,139,250,0.2)]"
                animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
