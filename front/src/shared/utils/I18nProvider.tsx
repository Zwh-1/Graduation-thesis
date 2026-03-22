'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';

// ==================== Types ====================

type Locale = 'zh' | 'en';
type TranslationDict = typeof zh;

// Dot-notation key path resolver (up to 2 levels)
type DotPath = {
    [K in keyof TranslationDict]: {
        [SK in keyof TranslationDict[K]]: `${K & string}.${SK & string}`;
    }[keyof TranslationDict[K]];
}[keyof TranslationDict];

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: DotPath | string) => string;
    toggleLocale: () => void;
}

// ==================== Context ====================

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Locale, TranslationDict> = { zh, en };

// ==================== Provider ====================

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('zh');

    // Restore saved language preference on client mount
    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale | null;
        if (saved === 'zh' || saved === 'en') {
            // 使用 requestAnimationFrame 延迟 setState 调用，避免在 effect 中同步调用 setState 导致的级联渲染问题
            requestAnimationFrame(() => {
                setLocaleState(saved);
            });
        }
    }, []);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        localStorage.setItem('locale', next);
    }, []);

    const toggleLocale = useCallback(() => {
        setLocale(locale === 'zh' ? 'en' : 'zh');
    }, [locale, setLocale]);

    /**
     * Translate a dot-notation key, e.g. t('hero.title') or t('connect.stepConnecting.title')
     * Falls back to the key itself if not found.
     */
    const t = useCallback((key: string): string => {
        const parts = key.split('.');
        let result: unknown = translations[locale];
        
        // 逐级查找嵌套对象
        for (const part of parts) {
            if (result && typeof result === 'object' && part in result) {
                result = (result as Record<string, unknown>)[part];
            } else {
                return key; // 找不到则返回原始 key
            }
        }
        
        return typeof result === 'string' ? result : key;
    }, [locale]);

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, toggleLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

// ==================== Hook ====================

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
