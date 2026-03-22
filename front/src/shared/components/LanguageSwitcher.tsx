'use client';

import { useI18n } from '@/shared/utils/I18nProvider';

/**
 * Language toggle button: 中文 ⟷ English
 * Drop it anywhere in the Navbar next to the theme switcher.
 */
export default function LanguageSwitcher({ isNight }: { isNight: boolean }) {
    const { locale, toggleLocale } = useI18n();

    return (
        <button
            onClick={toggleLocale}
            title={locale === 'zh' ? 'Switch to English' : '切换为中文'}
            className={[
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold',
                'border transition-all duration-200 select-none cursor-pointer',
                isNight
                    ? 'border-teal-500/40 text-teal-300 hover:bg-teal-500/15 hover:border-teal-400'
                    : 'border-teal-600/30 text-teal-700 hover:bg-teal-50 hover:border-teal-500',
            ].join(' ')}
        >
            {/* active indicator dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-teal-400' : 'bg-teal-600'}`} />
            {locale === 'zh' ? '中文' : 'English'}
        </button>
    );
}
