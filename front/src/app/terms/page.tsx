'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, BookOpen, Scroll } from 'lucide-react';
import { useI18n } from '@/shared/utils/I18nProvider';

export default function Terms() {
    const { t } = useI18n();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('terms.title')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {t('terms.subtitle')}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in">
                    {/* 顶部免责声明横幅 */}
                    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 p-6 flex items-start gap-4">
                        <AlertTriangle className="text-amber-600 dark:text-amber-500 mt-1 shrink-0" />
                        <div>
                            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">{t('terms.disclaimerTitle')}</h3>
                            <p className="text-amber-700 dark:text-amber-300/80 text-sm leading-relaxed">
                                {t('terms.disclaimerDesc')}
                            </p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen size={20} className="text-teal-500" />
                                {t('terms.section1Title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {t('terms.section1Desc')}
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Scroll size={20} className="text-teal-500" />
                                {t('terms.section2Title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {t('terms.section2Desc')}
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle size={20} className="text-teal-500" />
                                {t('terms.section3Title')}
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                                <li>{t('terms.section3Desc1')}</li>
                                <li>{t('terms.section3Desc2')}</li>
                                <li>{t('terms.section3Desc3')}</li>
                            </ul>
                        </section>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8 flex justify-end">
                            <Link href="/" className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-lg transition-colors">
                                {t('terms.acceptAndBack')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
