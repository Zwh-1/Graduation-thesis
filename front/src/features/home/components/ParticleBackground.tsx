'use client';

import { useRef, useEffect } from 'react';
import { useParticleSystem } from '@/shared/hooks/index';

/**
 * 粒子系统配置
 */
interface ParticleSystemConfig {
  particleCount: number;
  baseSpeed: number;
  attractionStrength: number;
  isNight: boolean;
}

/**
 * 粒子背景组件 Props
 */
interface ParticleBackgroundProps {
  /** 滚动进度 (0-1) */
  scrollProgress?: number;
  /** 粒子数量（可选，默认 200） */
  particleCount?: number;
  /** 是否启用连接线效果 */
  enableConnections?: boolean;
  /** 性能模式（减少粒子数量） */
  performanceMode?: boolean;
  /** 是否为夜间模式 */
  isNight?: boolean;
}

/**
 * 粒子背景组件
 * 使用 Canvas 渲染动态粒子系统，象征健康数据的流动与加密
 */
export default function ParticleBackground({
  scrollProgress = 0,
  particleCount = 200,
  enableConnections = true,
  performanceMode = false,
  isNight = true,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 根据性能模式调整粒子数量
  const actualParticleCount = performanceMode ? 50 : particleCount;

  // 根据滚动进度调整粒子速度
  const baseSpeed = performanceMode ? 0.3 : 0.5 + scrollProgress * 0.5;

  // 粒子系统配置
  const config: ParticleSystemConfig = {
    particleCount: actualParticleCount,
    baseSpeed,
    attractionStrength: 0.1,
    isNight,
  };

  // Canvas 渲染配置
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 性能优化：使用 will-change 提示浏览器
    canvas.style.willChange = 'contents';

    // 禁用指针事件，避免干扰用户交互
    canvas.style.pointerEvents = 'none';

    // 设置 aria-hidden，提升可访问性
    canvas.setAttribute('aria-hidden', 'true');
  }, []);

  // 使用粒子系统 Hook
  // 类型断言：确保 canvasRef.current 不为 null
  useParticleSystem(canvasRef as React.RefObject<HTMLCanvasElement>, config, scrollProgress);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
