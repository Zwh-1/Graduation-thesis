'use client';

import { useI18n } from '@/shared/utils/I18nProvider';

export default function VerifyStepResult() {
  const { t } = useI18n();
  
  return (
    <div>
      <span>{t('verifyStepResult.title')}</span>
    </div>
  );
}
