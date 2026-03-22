'use client';

import { Layout, Typography, Divider } from 'antd';
import Link from 'next/link';
import { useTheme } from '@/shared/utils/ThemeProvider';
import { useI18n } from '@/shared/utils/I18nProvider';
import './index.css';

const { Footer: AntFooter } = Layout;
const { Text, Paragraph } = Typography;

export default function Footer() {
  const { isNight } = useTheme();
  const { t } = useI18n();
  
  // 动态获取年份
  const currentYear = new Date().getFullYear();
  
  // 国际化菜单项
  const menuItems = [
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.contact'), href: '/contact' },
    { label: t('nav.privacy'), href: '/privacy' },
    { label: t('nav.terms'), href: '/terms' },
  ];

  return (
    <AntFooter className={`footer-container ${isNight ? 'footer-night' : 'footer-day'}`}>

      {/* 内容容器：限制最大宽度并居中 */}
      <div className="footer-content">

        {/* 上半部分：响应式布局 */}
        {/* 手机端：flex-col (垂直) | 电脑端：md:flex-row (水平) */}
        <div className="footer-main-section">

          {/* 左侧：Logo + 简介 */}
          <div className="footer-logo-section">
            <div className="footer-logo">
              <img src="/logo.png" alt={t('footer.logoText')} className={`footer-logo-icon ${isNight ? 'footer-logo-icon-night' : 'footer-logo-icon-day'}`} />
              <span className={`footer-logo-text ${isNight ? 'footer-logo-text-night' : 'footer-logo-text-day'}`}>{t('footer.logoText')}</span>
            </div>
            <Paragraph className="footer-description">
              {t('footer.description').split(t('footer.descriptionHighlight')).map((part, index) => (
                index === 1 ? (
                  <span key={index} className="footer-description-highlight">{part}</span>
                ) : (
                  part
                )
              ))}
            </Paragraph>
          </div>

          {/* 右侧：导航链接 */}
          {/* 手机端：flex-wrap (允许换行) | 电脑端：flex-nowrap */}
          <div className="footer-links-section">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`footer-link ${isNight ? 'footer-link-night' : 'footer-link-day'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 分割线 */}
        <Divider className={`footer-divider ${isNight ? 'footer-divider-night' : 'footer-divider-day'}`} />

        {/* 下半部分：版权信息 */}
        <div className="footer-bottom-section">
          <Text className={`footer-copyright ${isNight ? 'footer-copyright-night' : 'footer-copyright-day'}`}>
            {t('footer.copyright').replace('{year}', currentYear.toString())}
          </Text>

          <Text className={`footer-info ${isNight ? 'footer-info-night' : 'footer-info-day'}`}>
            {t('footer.致力于构建可信的数字未来')}
          </Text>
        </div>

      </div>
    </AntFooter>
  );
}