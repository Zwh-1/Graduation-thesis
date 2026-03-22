import { useState, useEffect } from 'react';
import Image from '@/shared/components/constants/Image';
import { MOCK_PARTNERS, MOCK_FEATURES } from '@/types/home/data/Trust';
import '@/types/home/css/Trust.css';
import { useI18n } from '@/shared/utils/I18nProvider';

// ==========================================
//  主组件定义
// ==========================================

export default function TrustSection() {
  const { t } = useI18n();
  // 静态渲染企业徽标列表，无需模拟异步延迟
  // 在真实项目中，这可以通过 SSG 或 SSR 提前渲染。

  return (
    <section
      className="trust-section"
      aria-label="信任与合作伙伴"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- 头部区域 --- */}
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-teal-600 tracking-wide uppercase">
            {t('trust.sectionLabel')}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('trust.title')}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            {t('trust.description')}
          </p>
        </div>

        {/* --- 第一部分：无限滚动合作伙伴轮播 (Infinite Carousel) --- */}
        <div className="carousel-container">
          {/* 
             渐变遮罩 (Gradient Masks) 
             作用：让左右两侧的 Logo 淡入淡出，避免生硬切断，提升视觉质感 
          */}
          <div className="carousel-gradient-left"></div>
          <div className="carousel-gradient-right"></div>

          {/* 
             滚动轨道容器 
             overflow-hidden: 隐藏超出视口的内容
             mask-image (可选): 也可以用 CSS mask 实现更柔和的边缘，这里用 gradient div 兼容性更好
          */}
          <div className="carousel-track">
            {/* 
               动画轨道 
               flex: 横向排列
               gap-16: 元素间距
               animate-scroll: 自定义关键帧动画 (需在 CSS 中定义或内联样式)
               hover:pause: 鼠标悬停时暂停动画，方便用户查看
            */}
            <div className="carousel-animation-track">
              {/* 
                 渲染两份列表以实现"无缝循环"
                 原理：当第一份列表完全移出屏幕左侧时，第二份列表刚好接上，
                 此时动画瞬间重置到 0%，肉眼无法察觉。
              */}
              {[...MOCK_PARTNERS, ...MOCK_PARTNERS].map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="partner-card"
                >
                  <div className="partner-logo-wrapper">
                    {/* 图片加载优化：使用 loading="lazy" (首屏外) 或 eager (首屏) */}
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} Logo`}
                      className="partner-logo"
                      loading="lazy"
                    />
                  </div>
                  {/* 悬停显示名称 (可选增强体验) */}
                  <span className="partner-name-hint">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 提示文字：系统状态 */}
          <div className="text-center mt-4">
            <span className="demo-mode-badge">
              <span className="demo-pulse-dot"></span>
              {t('trust.operationalStatus')}
            </span>
          </div>
        </div>

        {/* --- 第二部分：技术特性网格 (替代安全徽章) --- */}
        {/* 
           设计思路：既然没有真实的 SOC2/ISO 认证，就展示系统的"技术信任点"。
           这能向老师展示你对系统架构的理解。
        */}
        <div className="features-grid">
          {MOCK_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
            >
              {/* 背景装饰色块 */}
              <div className={`feature-bg-accent ${feature.color}`}></div>

              <div className="relative z-10">
                <div className="feature-icon-container">
                  {feature.icon}
                </div>
                <h3 className="feature-title">
                  {t(feature.titleKey as Parameters<typeof t>[0])}
                </h3>
                <p className="feature-desc">
                  {t(feature.descKey as Parameters<typeof t>[0])}
                </p>

                {/* 系统状态标记 */}
                <div className="feature-bottom-divider">
                  <span className="status-badge">
                    {t('trust.operationalStatus')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
