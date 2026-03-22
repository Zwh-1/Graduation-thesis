'use client';

import React from 'react';
import { Shield, Lock, Activity } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/shared/utils/I18nProvider';

export default function About() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('about.title')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        {t('about.subtitle')}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in transition-colors duration-300">
                    <div className="p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-6">{t('about.visionTitle')}</h2>
                        <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-8">
                            {t('about.visionDesc')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="text-teal-600 dark:text-teal-400" size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('about.card1Title')}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('about.card1Desc')}</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                                    <Lock className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('about.card2Title')}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('about.card2Desc')}</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mb-4">
                                    <Activity className="text-teal-600 dark:text-teal-400" size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('about.card3Title')}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('about.card3Desc')}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('about.projectTitle')}</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('about.projectDesc')}
                            </p>
                        </div>

                        <div className="mt-10 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5"
                            >
                                {t('about.backHome')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
