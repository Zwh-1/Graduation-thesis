import { Navbar, Footer } from '@/shared/components/index';
import { ThemeProvider } from '@/shared/utils/ThemeProvider';
import { I18nProvider } from '@/shared/utils/I18nProvider';
import { ModeProvider } from '@/shared/hooks/home/useModeContext';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Next.js 13+ 的 metadata API 支持静态和动态两种方式
// 由于当前项目使用客户端 i18n，metadata 只能使用静态对象
// 异步函数会导致预渲染错误（如 /_not-found 页面）
const metadata = {
  title: '隐私保护系统',
  description: '为高敏感数据验证设计的隐私保护系统，解决数据验证与泄露矛盾。',
  icon: '/favicon.ico',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <ModeProvider>
              <Navbar />
              {children}
              <Footer />
            </ModeProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
