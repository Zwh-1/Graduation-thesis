import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 animate-fade-in">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-600 dark:text-red-500" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            页面未找到
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            您请求的页面不存在或已被移动。请检查 URL 或返回首页。
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-teal-500/20"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
