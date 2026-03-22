"use client";

import { useState } from 'react';
import { Menu } from 'antd';
import {
  HeroSection, TrustSection, WorkflowSection,
  PrivacyDemo
} from '@/features/home/index';
import { useTheme } from '@/shared/utils/ThemeProvider';
import { useMode } from '@/shared/hooks/home/useModeContext';
import { ScrollOptimization } from '@/shared/components/index';

// 定义模块配置数组（用于一次性渲染所有组件）
const modules = [
  { key: 'trust', component: TrustSection },
  { key: 'workflow', component: WorkflowSection },
  { key: 'demo', component: PrivacyDemo }
];

export default function HomePage() {
  const [selectedKey, setSelectedKey] = useState<string>('trust');
  const { isNight } = useTheme();
  const { currentMode, modeConfig } = useMode();

  return (
    <main className="flex flex-col">
      {/* 滚动优化组件：进度条、回到顶部按钮 */}
      <ScrollOptimization />
      
      {/* HeroSection - 顶部，预留导航栏空间 */}
      <HeroSection
        enableParticles={modeConfig.particles}
        performanceMode={modeConfig.performanceMode}
        isNight={isNight}
      />

      {/* 导航栏 - sticky 定位，覆盖在内容之上 */}
      <div className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${isNight ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-100'}`}>
        <Menu
          mode="horizontal"
          theme={isNight ? "dark" : "light"}
          className={`border-none bg-transparent flex justify-center ${isNight ? 'text-slate-300' : ''}`}
          items={modules.map(item => ({
            key: item.key,
            label: item.key === 'trust' ? '信任背书' : item.key === 'workflow' ? '流程解析' : item.key === 'demo' ? '互动演示' : '底部行动',
          }))}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            setSelectedKey(key);
            // 平滑滚动到内容区域顶部
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }, 100);
          }}
          style={{ minWidth: 'auto' }}
        />
      </div>

      {/* 按需渲染选中的模块 */}
      <div className="flex-1 bg-white dark:bg-slate-900 transition-colors duration-300">
        {modules.map((module) => (
          module.key === selectedKey && (
            <div key={module.key} className="py-12 md:py-20 animate-fade-in">
              <module.component />
            </div>
          )
        ))}
      </div>
    </main>
  );
}