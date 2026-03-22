'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

/**
 * 主题类型
 */
type Theme = 'day' | 'night';

/**
 * 主题 Context
 */
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isNight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 主题提供者组件
 *
 * SSR 阶段统一使用 'day' 作为默认主题，避免服务端与客户端 hydration 不一致导致的
 * 页面加载时闪烁为黑夜模式的问题。
 * 客户端 mount 后再读取 localStorage / 系统时间并修正主题。
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR 默认 'day'，客户端 mount 后再覆盖
  const [theme, setTheme] = useState<Theme>('day');

  useEffect(() => {
    // 仅在客户端执行
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      return;
    }
    // 根据系统时间自动判断（6:00 - 20:00 为白天）
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;
    setTheme(isNight ? 'night' : 'day');
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'day' ? 'night' : 'day';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isNight: theme === 'night' }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 使用主题 Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
