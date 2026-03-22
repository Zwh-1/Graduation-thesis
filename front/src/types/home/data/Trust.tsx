
import React from 'react';
import { ShieldCheck, Zap, Globe, Lock } from 'lucide-react';

// ==========================================
// 1. 模拟数据层 (Mock Data Layer)
// ==========================================
// 在实际项目中，这些数据应来自后端 API (例如：/api/partners)
// 这里使用常量模拟，方便毕设演示。

// 合作伙伴数据类型
interface Partner {
  id: number;
  name: string;
  logo: string;
}

// 特性数据类型
interface Feature {
  id: string;
  icon: React.JSX.Element;
  titleKey: string; // 改为 i18n key 引用
  descKey: string;  // 改为 i18n key 引用
  color: string;
}

const MOCK_PARTNERS: Partner[] = [
  { id: 1, name: 'University Tech', logo: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0" /%3E%3Ctext x="50%25" y="50%25" fill="%23475569" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle"%3EUniTech%3C/text%3E%3C/svg%3E' },
  { id: 2, name: 'Open Source', logo: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0" /%3E%3Ctext x="50%25" y="50%25" fill="%23475569" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle"%3EOpenSrc%3C/text%3E%3C/svg%3E' },
  { id: 3, name: 'Future Corp', logo: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0" /%3E%3Ctext x="50%25" y="50%25" fill="%23475569" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle"%3EFuture%3C/text%3E%3C/svg%3E' },
  { id: 4, name: 'Design Studio', logo: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0" /%3E%3Ctext x="50%25" y="50%25" fill="%23475569" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle"%3EDesign%3C/text%3E%3C/svg%3E' },
  { id: 5, name: 'Cloud Sys', logo: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0" /%3E%3Ctext x="50%25" y="50%25" fill="%23475569" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle"%3ECloud%3C/text%3E%3C/svg%3E' },
  { id: 6, name: 'Data Flow', logo: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0" /%3E%3Ctext x="50%25" y="50%25" fill="%23475569" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle"%3EDataFlow%3C/text%3E%3C/svg%3E' },
];

const MOCK_FEATURES: Feature[] = [
  {
    id: 'f1',
    icon: <Lock className="w-8 h-8 text-teal-600" />,
    titleKey: 'trust.feature1Title', // 改为 i18n key 引用
    descKey: 'trust.feature1Desc',   // 改为 i18n key 引用
    color: 'bg-teal-50'
  },
  {
    id: 'f2',
    icon: <Zap className="w-8 h-8 text-yellow-600" />,
    titleKey: 'trust.feature2Title', // 改为 i18n key 引用
    descKey: 'trust.feature2Desc',   // 改为 i18n key 引用
    color: 'bg-yellow-50'
  },
  {
    id: 'f3',
    icon: <Globe className="w-8 h-8 text-green-600" />,
    titleKey: 'trust.feature3Title', // 改为 i18n key 引用
    descKey: 'trust.feature3Desc',   // 改为 i18n key 引用
    color: 'bg-green-50'
  },
  {
    id: 'f4',
    icon: <ShieldCheck className="w-8 h-8 text-purple-600" />,
    titleKey: 'trust.feature4Title', // 改为 i18n key 引用
    descKey: 'trust.feature4Desc',   // 改为 i18n key 引用
    color: 'bg-purple-50'
  }
];

export { MOCK_PARTNERS, MOCK_FEATURES };
export type { Partner, Feature };
