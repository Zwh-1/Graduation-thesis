'use client';

import { useI18n } from '@/shared/utils/I18nProvider';

export default function VerifyStepSigning() {
  const { t } = useI18n();
  
  return (
    <div>
      <span>{t('verifyStepSigning.title')}</span>
    </div>
  );
}
