"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-based ambient starfield with parallax and dramatic shooting stars.
 */
export function Starfield({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2,
      opacity: Math.random(),
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
      layer: Math.floor(Math.random() * 3) + 1, // 1 to 3 for parallax depth
    }));

    const shootingStars: { x: number; y: number; length: number; speed: number; opacity: number; angle: number }[] = [];

    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width,
        y: 0, // start at top
        length: 100 + Math.random() * 100,
        speed: 15 + Math.random() * 10,
        opacity: 1,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2, // ~45 deg
      });
    };

    const ripples: { x: number; y: number; radius: number; opacity: number }[] = [];

    let frameId: number;

    const render = () => {
      // Lerp mouse for smooth parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const parallaxX = (mouseX - width / 2) * 0.05;
      const parallaxY = (mouseY - height / 2) * 0.05;

      // Clear background instead of solid fill so it acts as an overlay
      ctx.clearRect(0, 0, width, height);

      // Deep field wash (simulated via gradients on canvas or keep it subtle)
      const gradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, width * 0.8);
      gradient.addColorStop(0, "rgba(45, 22, 96, 0.15)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw standard stars
      for (const star of stars) {
        // Drift
        star.x += star.speedX;
        star.y += star.speedY;

        // Wrap around
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Apply parallax offset (add instead of subtract so it follows cursor)
        const drawX = star.x + (parallaxX * star.layer);
        const drawY = star.y + (parallaxY * star.layer);

        // Twinkle
        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity < 0.1) star.opacity = 0.1;
        if (star.opacity > 1) star.opacity = 1;

        // Draw a smooth, beautiful glowing star using radial gradient
        const glowSize = star.size * (star.layer === 3 ? 8 : star.layer === 2 ? 4 : 2);
        
        // Only draw the complex glow for larger/foreground stars for performance
        if (star.layer >= 2) {
          const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowSize);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(0.2, `rgba(196, 181, 253, ${star.opacity * 0.8})`); // Inner violet glow
          gradient.addColorStop(1, "rgba(196, 181, 253, 0)"); // Fades out smoothly

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(drawX, drawY, glowSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw a 4-point lens flare for the biggest stars
          if (star.layer === 3 && star.size > 1.2) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.6})`;
            ctx.beginPath();
            ctx.ellipse(drawX, drawY, star.size * 10, star.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(drawX, drawY, star.size * 0.5, star.size * 10, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Tiny distant stars just get a simple point
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.015;

        if (s.opacity <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5; // Slightly thicker
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length
        );
        ctx.stroke();
      }

      // Draw click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 5;
        r.opacity -= 0.02;

        if (r.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(167, 139, 250, ${r.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Random chance for new shooting star (restored high frequency)
      if (Math.random() < 0.15) {
        createShootingStar();
      }

      // Keep CSS variables updated for global pointer FX (like panel glows)
      document.documentElement.style.setProperty("--pointer-x", `${(mouseX / width) * 100}%`);
      document.documentElement.style.setProperty("--pointer-y", `${(mouseY / height) * 100}%`);

      frameId = requestAnimationFrame(render);
    };

    render();

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    const handlePointerDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 1,
      });
    };
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="starfield-scanline pointer-events-none" />
    </div>
  );
}
