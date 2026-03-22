// 核心 UI 提供者模块
'use client';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff', // 科技蓝
            borderRadius: 6,
            fontFamily: 'var(--font-inter), sans-serif',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}