'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '@/shared/utils/ThemeProvider';

/**
 * 滚动优化组件
 * 
 * 功能：
 * 1. 滚动进度指示器 - 显示当前页面滚动进度
 * 2. 回到顶部按钮 - 快速返回页面顶部
 * 3. 滚动到底部按钮 - 快速跳转到页面底部
 * 
 * 优化：
 * - 使用 requestAnimationFrame 提升性能
 * - 防抖处理避免频繁更新
 * - 平滑滚动动画
 */
export default function ScrollOptimization() {
  const { isNight } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let ticking = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // 防抖：检测滚动是否停止
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // 使用 requestAnimationFrame 优化性能
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          
          setScrollProgress(progress);
          setShowButtons(scrollTop > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    // 被动监听器，提升滚动性能
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  /**
   * 平滑滚动到顶部
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /**
   * 平滑滚动到底部
   */
  const scrollToBottom = () => {
    const docHeight = document.documentElement.scrollHeight;
    window.scrollTo({
      top: docHeight,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* 滚动进度指示器 */}
      <div
        className="scroll-progress-bar"
        style={{
          width: `${scrollProgress}%`,
        }}
        aria-label={`滚动进度：${Math.round(scrollProgress)}%`}
      />

      {/* 回到顶部和底部按钮 */}
      <div
        className={`scroll-to-top-btn ${showButtons ? 'visible' : ''}`}
        aria-label="滚动控制"
      >
        <button
          onClick={scrollToBottom}
          title="滚动到底部"
          aria-label="滚动到底部"
          type="button"
        >
          <ArrowDown size={18} strokeWidth={2.5} />
        </button>
        
        <button
          onClick={scrollToTop}
          title="回到顶部"
          aria-label="回到顶部"
          type="button"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}
