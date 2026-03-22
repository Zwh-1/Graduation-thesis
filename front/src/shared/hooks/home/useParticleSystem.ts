'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface ParticleConfig {
  particleCount?: number;
  baseSpeed?: number;
  attractionStrength?: number;
  isNight?: boolean;
}

export function useParticleSystem(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  config: ParticleConfig = {
    particleCount: 120,
    baseSpeed: 0.8,
    attractionStrength: 0.1,
    isNight: true,
  },
  scrollProgress: number = 0
) {
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = [];
    const count = config.particleCount || 120;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (config.baseSpeed || 0.8),
        vy: (Math.random() - 0.5) * (config.baseSpeed || 0.8),
        size: Math.random() * 2 + 1,
      });
    }
  }, [config.particleCount, config.baseSpeed]);

  const updateParticles = useCallback((width: number, height: number, scrollPos: number) => {
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // scroll parallax effect
      if (scrollPos > 0) {
        p.y -= scrollPos * 0.2 * Math.sign(p.vy || 1);
      }

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse repel logic
      const dx = mouseRef.current.x - p.x;
      const dy = mouseRef.current.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x -= dx * 0.05;
        p.y -= dy * 0.05;
      }
    });
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const isNight = config.isNight !== false;

    // clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw dots
    ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(79, 70, 229, 0.4)';
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connections (Batched for O(1) Context Draw Calls - Performance Essential)
    ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(79, 70, 229, 0.15)';
    ctx.lineWidth = 1;

    ctx.beginPath(); // Batch tracking paths in memory
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const dx = particlesRef.current[i].x - particlesRef.current[j].x;
        const dy = particlesRef.current[i].y - particlesRef.current[j].y;
        const dist = dx * dx + dy * dy;

        if (dist < 12000) { // approx 110px threshold
          ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
          ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
        }
      }
    }
    ctx.stroke(); // Push all geometry to GPU in ONE single shot!
  }, [config.isNight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      updateParticles(canvas.width, canvas.height, scrollProgress);
      drawParticles(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, scrollProgress, initParticles, updateParticles, drawParticles]);

  const refreshParticles = useCallback(() => {
    if (canvasRef.current) {
      initParticles(canvasRef.current.width, canvasRef.current.height);
    }
  }, [canvasRef, initParticles]);

  return { refreshParticles };
}
