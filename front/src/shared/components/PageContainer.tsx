import { useI18n } from '@/shared/utils/I18nProvider';

export default function PageContainer() {
  const { t } = useI18n();
  
  return (
    <div>
      <span>{t('shared.privacyProtectionSystem')}</span>
    </div>
  );
}
