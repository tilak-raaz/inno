"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

type AudioContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  playOpening: () => void;
  playWarp: () => void;
  playMain: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const openingRef = useRef<HTMLAudioElement | null>(null);
  const warpRef = useRef<HTMLAudioElement | null>(null);
  const mainRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio objects with beautiful soft local .mp3 tracks
    openingRef.current = new Audio("/assets/sounds/opening.mp3");
    openingRef.current.loop = true;
    openingRef.current.volume = 0.8; // Adjusted volume

    warpRef.current = new Audio("/assets/sounds/warp.mp3");
    warpRef.current.loop = false;
    warpRef.current.volume = 0.6; // Soft chime/magical sound

    mainRef.current = new Audio("/assets/sounds/main.mp3");
    mainRef.current.loop = true;
    mainRef.current.volume = 0.6; // Low pitched beautiful ambient

    return () => {
      openingRef.current?.pause();
      warpRef.current?.pause();
      mainRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (openingRef.current) openingRef.current.muted = isMuted;
    if (warpRef.current) warpRef.current.muted = isMuted;
    if (mainRef.current) mainRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  const playOpening = () => {
    if (openingRef.current) {
      openingRef.current.play().catch(() => {
        // Autoplay policy might block this until user interaction
        console.warn("Autoplay blocked. Waiting for interaction to play opening music.");
      });
    }
  };

  const playWarp = () => {
    if (openingRef.current) {
      openingRef.current.pause();
      openingRef.current.currentTime = 0;
    }
    if (warpRef.current) {
      warpRef.current.play().catch(console.error);
    }
  };

  const playMain = () => {
    if (warpRef.current) {
      warpRef.current.pause();
    }
    if (mainRef.current) {
      mainRef.current.play().catch(console.error);
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playOpening, playWarp, playMain }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
