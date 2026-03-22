'use client';

import { useI18n } from '@/shared/utils/I18nProvider';

export default function VerifyStepInput() {
  const { t } = useI18n();
  
  return (
    <div>
      <span>{t('verifyStepInput.title')}</span>
    </div>
  );
}
