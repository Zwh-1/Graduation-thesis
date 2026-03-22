'use client';

import React from 'react';
import ImageNext from 'next/image';

// ==========================================
// 1. 组件类型定义
// ==========================================

/**
 * 图片组件属性类型
 * 继承原生图片所有属性，并扩展自定义配置
 */
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 图片地址（必填） */
  src: string;
  /** 图片替代文本（必填，用于无障碍和SEO） */
  alt: string;
  /** 自定义样式类名 */
  className?: string;
  /** 图片加载策略：lazy=懒加载 | eager=立即加载 */
  loading?: 'lazy' | 'eager'; // 加载策略
}

// ==========================================
// 2. 组件实现
// ==========================================

/**
 * 通用优化图片组件
 * 功能：基于 Next.js Image 封装，支持加载淡入动画、加载失败占位、懒加载
 */
export default function Image({
  src,
  alt,
  className = '',
  loading = 'lazy',
  ...props
}: ImageProps) {
  // 加载状态：true=加载完成，false=未加载
  const [isLoaded, setIsLoaded] = React.useState(false);
  // 错误状态：true=加载失败，false=加载正常
  const [hasError, setHasError] = React.useState(false);

  /**
   * 图片加载完成回调
   * 触发淡入动画
   */
  const handleLoad = () => {
    setIsLoaded(true);
  };

  /**
   * 图片加载失败回调
   * 显示错误占位符
   */
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  // ========================================
  // 加载失败时：显示错误占位容器
  // ========================================
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}
        {...props}
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          图片加载失败
        </span>
      </div>
    );
  }

  // ========================================
  // 正常情况：使用 Next.js 优化图片组件
  // 自动优化格式、尺寸、提升LCP性能
  // ========================================
  return (
    // 父容器必须设置 relative，用于 Next.js Image 填充布局
    <div className="relative w-full h-full">
      <ImageNext
        // 核心图片资源
        src={src}
        alt={alt}
        // 加载动画：未加载透明，加载完成显示
        className={`
          ${className}
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        // 加载策略
        loading={loading}
        // 加载回调
        onLoad={handleLoad}
        onError={handleError}
        // 填充父容器（替代原生img的自适应布局）
        fill
        // 保持图片比例，自动裁剪
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
