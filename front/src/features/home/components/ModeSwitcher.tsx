'use client';

import { enhancementModes, EnhancementMode } from '@/shared/hooks/index';

/**
 * 模式切换器 Props
 */
interface ModeSwitcherProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

/**
 * 模式切换器组件
 * 用于在粒子模式和极简模式之间切换
 */
export default function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  const modes = Object.entries(enhancementModes) as [string, EnhancementMode][];

  return (
    <div className="fixed top-20 right-4 z-[100]">
      <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-gray-200">
        {modes.map(([key, mode]) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentMode === key
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
            title={mode.name}
          >
            {mode.name}
          </button>
        ))}
      </div>
    </div>
  );
}
