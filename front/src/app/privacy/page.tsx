'use client';

import React from 'react';
import { ShieldCheck, EyeOff, ServerOff, Database } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/shared/utils/I18nProvider';

export default function PrivacyPolicy() {
    const { t } = useI18n();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('privacyPage.title')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {t('privacyPage.subtitle')}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium">
                        <ShieldCheck size={18} />
                        <span>{t('privacyPage.lastUpdated')}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in">
                    <div className="p-8 md:p-12 space-y-12">

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    1
                                </div>
                                {t('privacyPage.section1Title')}
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                                {t('privacyPage.section1Desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    2
                                </div>
                                {t('privacyPage.section2Title')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <EyeOff className="text-teal-500 mb-4" size={28} />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('privacyPage.section2Desc1')}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('privacyPage.section2Desc2')}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <ServerOff className="text-teal-500 mb-4" size={28} />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('privacyPage.section2Desc3')}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('privacyPage.section2Desc4')}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <Database className="text-green-500 mb-4" size={28} />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('privacyPage.section2Desc5')}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('privacyPage.section2Desc6')}</p>
                                </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                                {t('privacyPage.section2Analogy')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    3
                                </div>
                                {t('privacyPage.section3Title')}
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                                {t('privacyPage.section3Desc')}
                            </p>
                        </section>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-12 flex justify-center">
                            <Link href="/" className="px-8 py-3 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-teal-500/20">
                                {t('privacyPage.understandAndBack')}
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
