'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  return (
    <Button 
      onClick={toggleLanguage}
      variant="ghost"
      className="w-full justify-start"
    >
      {t('nav.languageSwitch')}
    </Button>
  );
}
