'use client';

import { useState } from 'react';
import { Layout, Menu, Button, Drawer, Dropdown, Avatar, Tooltip } from 'antd';
import { AppstoreOutlined, MenuOutlined, CloseOutlined, SunOutlined, MoonOutlined, LoginOutlined, LogoutOutlined, UserOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/shared/utils/ThemeProvider';
import { useI18n } from '@/shared/utils/I18nProvider';
import { useWallet, formatAddress, copyAddress } from '@/shared/hooks/useWallet';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import './index.css';

const { Header } = Layout;

export default function Navbar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme, toggleTheme, isNight } = useTheme();
  const { t } = useI18n();
  const { isConnected, address, disconnect } = useWallet();

  const menuItems = [
    {
      label: <Link href="/">{t('nav.home')}</Link>,
      key: 'home',
    },
    {
      label: <Link href="/verify">{t('nav.verify')}</Link>,
      key: 'verify',
    },
    {
      label: <Link href="/contact">{t('nav.contact')}</Link>,
      key: 'contact',
    },
  ];

  // 处理登录按钮点击
  const handleLoginClick = () => {
    router.push('/connect');
  };

  // 处理登出
  const handleLogout = () => {
    disconnect();
    router.push('/');
  };

  // 复制地址
  const handleCopyAddress = async () => {
    const success = await copyAddress(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 已登录用户的下拉菜单
  const userMenuItems = [
    {
      key: 'address',
      label: (
        <div className="px-4 py-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {t('connect.title').split(' ')[0]}
          </div>
          <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
            {formatAddress(address)}
          </div>
        </div>
      ),
      disabled: true,
    } as const,
    {
      type: 'divider' as const,
    },
    {
      key: 'copy',
      icon: copied ? <CheckOutlined className="text-green-500" /> : <CopyOutlined />,
      label: copied ? t('nav.copied') : t('nav.copyAddress'),
      onClick: handleCopyAddress,
    } as const,
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: handleLogout,
      danger: true,
    } as const,
  ];

  return (
    <>
      <Header
        className={`navbar-container ${isNight ? 'navbar-night' : 'navbar-day'}`}
        style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      >
        {/* Logo */}
        <Link
          href="/"
          className={`navbar-logo ${isNight ? 'navbar-logo-night' : 'navbar-logo-day'}`}
        >
          <AppstoreOutlined className={`navbar-logo-icon ${isNight ? 'navbar-logo-icon-night' : 'navbar-logo-icon-day'}`} />
          <span className="text-lg font-bold">{t('nav.logo')}</span>
        </Link>

        {/* 桌面菜单 */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menu
            mode="horizontal"
            items={menuItems}
            className={`navbar-menu ${isNight ? 'navbar-menu-night' : ''}`}
            style={{ border: 'none', background: 'transparent' }}
            selectable={false}
          />
        </div>

        {/* 右侧操作区 */}
        <div className="navbar-right-section">
          {/* 语言切换 */}
          <LanguageSwitcher isNight={isNight} />

          {/* 日夜切换按钮 */}
          <Button
            type="text"
            size="large"
            icon={isNight ? <SunOutlined className="text-lg" /> : <MoonOutlined className="text-lg" />}
            onClick={toggleTheme}
            className={`navbar-theme-button ${isNight ? 'navbar-theme-button-night' : 'navbar-theme-button-day'}`}
            title={isNight ? t('nav.switchDay') : t('nav.switchNight')}
          />

          {/* 登录/用户状态 */}
          {isConnected ? (
            // 已登录：显示用户头像下拉菜单
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
              className="ml-2"
            >
              <Button
                type="primary"
                size="large"
                icon={<UserOutlined />}
                className="navbar-user-button"
              >
                {formatAddress(address)}
              </Button>
            </Dropdown>
          ) : (
            // 未登录：显示登录按钮
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={handleLoginClick}
              className="ml-2 navbar-login-button"
            >
              {t('nav.login')}
            </Button>
          )}

          {/* 移动端菜单按钮 */}
          <div className="md:hidden ml-2">
            <Button
              type="text"
              size="large"
              icon={isMobileOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`navbar-mobile-menu-button ${isNight ? 'navbar-mobile-menu-button-night' : 'navbar-mobile-menu-button-day'}`}
            />
          </div>
        </div>
      </Header>

      {/* 手机端抽屉菜单 */}
      <Drawer
        title={t('nav.home')}
        placement="right"
        onClose={() => setIsMobileOpen(false)}
        open={isMobileOpen}
        className="md:hidden"
        styles={{
          body: { padding: 0 },
          header: {
            background: isNight ? '#0f172a' : '#ffffff',
            color: isNight ? '#ffffff' : '#000000'
          }
        }}
      >
        <div className="drawer-content">
          {/* 语言切换 */}
          <div className="px-4 py-3">
            <LanguageSwitcher isNight={isNight} />
          </div>

          {/* 移动端登录状态 */}
          {isConnected ? (
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-lg" />
                  <span className="font-medium">
                    {formatAddress(address)}
                  </span>
                </div>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    handleLogout();
                    setIsMobileOpen(false);
                  }}
                />
              </div>
              <Button
                size="small"
                block
                icon={copied ? <CheckOutlined className="text-green-500" /> : <CopyOutlined />}
                onClick={() => {
                  handleCopyAddress();
                }}
              >
                {copied ? t('nav.copied') : t('nav.copyAddress')}
              </Button>
            </div>
          ) : (
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <Button
                type="primary"
                block
                icon={<LoginOutlined />}
                onClick={() => {
                  handleLoginClick();
                  setIsMobileOpen(false);
                }}
              >
                {t('nav.login')}
              </Button>
            </div>
          )}

          {/* 移动端日夜切换 */}
          <button
            onClick={() => {
              toggleTheme();
              setIsMobileOpen(false);
            }}
            className={`drawer-theme-button ${isNight ? 'drawer-theme-button-night' : 'drawer-theme-button-day'}`}
          >
            {isNight ? (
              <>
                <SunOutlined className="text-xl" />
                {t('nav.switchDay')}
              </>
            ) : (
              <>
                <MoonOutlined className="text-xl" />
                {t('nav.switchNight')}
              </>
            )}
          </button>

          <Menu
            mode="vertical"
            items={menuItems.map((item) => ({
              ...item,
              onClick: () => setIsMobileOpen(false),
            }))}
          />
        </div>
      </Drawer>
    </>
  );
}