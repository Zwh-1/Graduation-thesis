'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/shared/utils/I18nProvider';

export default function Contact() {
    const { t } = useI18n();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('contact.title')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {t('contact.subtitle')}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Sidebar */}
                        <div className="p-8 md:p-10 bg-teal-600 dark:bg-teal-900 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">{t('contact.sidebarTitle')}</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center pl-0.5">
                                            <Mail size={20} className="text-teal-200" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-teal-200">Email</p>
                                            <p className="font-medium">{t('contact.email')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                            <MessageSquare size={20} className="text-teal-200" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-teal-200">GitHub</p>
                                            <p className="font-medium">@ZK-Health-Core</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12">
                                <Link href="/" className="text-sm text-teal-200 hover:text-white flex items-center gap-2 transition-colors">
                                    &larr; {t('contact.title')}
                                </Link>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-8 md:p-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('contact.submit')}</h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact.labelName')}</label>
                                    <input
                                        type="text" id="name" required
                                        placeholder={t('contact.namePlaceholder')}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact.labelEmail')}</label>
                                    <input
                                        type="email" id="email" required
                                        placeholder={t('contact.emailPlaceholder')}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact.labelMessage')}</label>
                                    <textarea
                                        id="message" required rows={4}
                                        placeholder={t('contact.messagePlaceholder')}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all ${isSubmitted ? 'bg-green-500 hover:bg-green-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                                >
                                    {isSubmitted ? (
                                        '✓'
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            {t('contact.submit')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
