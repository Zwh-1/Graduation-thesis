'use client';

import { useI18n } from '@/shared/utils/I18nProvider';

export default function Verify() {
  const { t } = useI18n();
  
  return (
    <div>
      <span>{t('verify.title')}</span>
    </div>
  );
}
