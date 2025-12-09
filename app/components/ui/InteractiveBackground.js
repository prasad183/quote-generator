"use client";

import { useEffect, useRef } from "react";

/**
 * Reusable InteractiveBackground component with mouse-following particles
 * 
 * @param {Object} props
 * @param {number} props.particleCount - Number of base particles (default: 50)
 * @param {string} props.intensity - Animation intensity: 'low' | 'normal' | 'high' (default: 'normal')
 * @param {Array<string>} props.colors - Array of color values in HSL format or hex (default: purple theme)
 * @param {number} props.zIndex - CSS z-index (default: 0)
 * @param {boolean} props.enabled - Enable/disable animation (default: true)
 * @param {boolean} props.showConnections - Show particle connections (default: true)
 * @param {number} props.connectionDistance - Maximum distance for connections (default: 120)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export default function InteractiveBackground({
  particleCount = 50,
  intensity = "normal",
  colors = null, // Will use default purple theme
  zIndex = 0,
  enabled = true,
  showConnections = true,
  connectionDistance = 120,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Intensity configurations
  const intensityConfig = {
    low: {
      baseParticles: 30,
      mouseParticles: 1,
      maxParticles: 100,
      attractionForce: 0.015,
      friction: 0.99,
    },
    normal: {
      baseParticles: 50,
      mouseParticles: 3,
      maxParticles: 200,
      attractionForce: 0.02,
      friction: 0.98,
    },
    high: {
      baseParticles: 80,
      mouseParticles: 5,
      maxParticles: 300,
      attractionForce: 0.03,
      friction: 0.97,
    },
  };

  const config = intensityConfig[intensity] || intensityConfig.normal;

  // Default color theme (purple/blue)
  const defaultColors = {
    base: { h: 240, s: 70, l: { min: 60, max: 90 } },
    mouse: { h: 240, s: 80, l: { min: 65, max: 95 } },
    connection: "rgba(99, 102, 241, 0.2)",
  };

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const actualParticleCount = particleCount || config.baseParticles;
    particlesRef.current = [];

    // Generate color function
    const getParticleColor = (isMouseParticle = false) => {
      if (colors && Array.isArray(colors) && colors.length > 0) {
        // Use custom colors
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return randomColor;
      }

      // Use default purple theme
      const colorScheme = isMouseParticle ? defaultColors.mouse : defaultColors.base;
      const h = colorScheme.h + Math.random() * 60;
      const s = colorScheme.s;
      const l = colorScheme.l.min + Math.random() * (colorScheme.l.max - colorScheme.l.min);
      return `hsl(${h}, ${s}%, ${l}%)`;
    };

    // Initialize base particles
    for (let i = 0; i < actualParticleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: getParticleColor(false),
      });
    }

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      // Add new particles at mouse position
      for (let i = 0; i < config.mouseParticles; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          opacity: Math.random() * 0.8 + 0.4,
          color: getParticleColor(true),
          life: 60, // Particle lifetime
        });
      }

      // Keep particle count manageable
      if (particlesRef.current.length > config.maxParticles) {
        particlesRef.current = particlesRef.current.slice(-Math.floor(config.maxParticles * 0.75));
      }
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      mouseRef.current = { x: -100, y: -100 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Attract to mouse
        if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.speedX += (dx / distance) * force * config.attractionForce;
            particle.speedY += (dy / distance) * force * config.attractionForce;
          }
        }

        // Apply friction
        particle.speedX *= config.friction;
        particle.speedY *= config.friction;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Decrease life if it has one
        if (particle.life !== undefined) {
          particle.life--;
          particle.opacity = (particle.life / 60) * 0.8;
          if (particle.life <= 0) return false;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        const colorStr = particle.color.startsWith("hsl")
          ? particle.color.replace(")", `, ${particle.opacity})`).replace("hsl", "hsla")
          : particle.color;
        ctx.fillStyle = colorStr;
        ctx.fill();

        // Draw connections to nearby particles
        if (showConnections) {
          particlesRef.current.forEach((other) => {
            if (particle === other) return;

            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              const connectionColor = colors && colors.length > 0
                ? colors[0].replace(/\)$/, `, ${(1 - distance / connectionDistance) * 0.2})`).replace(/^[^a-z]+/i, "rgba")
                : `rgba(99, 102, 241, ${(1 - distance / connectionDistance) * 0.2})`;
              ctx.strokeStyle = connectionColor;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        }

        return true;
      });

      if (enabled) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (enabled) {
      animate();
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, particleCount, intensity, colors, showConnections, connectionDistance, config]);

  if (!enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`interactive-background ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

