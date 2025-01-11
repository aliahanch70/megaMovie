'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store, Home, Users, Activity, Shield, Globe } from 'lucide-react';
import NavLink from './NavLink';
import UserMenu from './UserMenu';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import ToggleNav from '@/components/ToggleNav';

export default function Navbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();
  const { t, isRTL, language, setLanguage } = useLanguage();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };

    checkAdminStatus();
  }, [supabase]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  return (
    <nav className={`border-b bg-card ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex items-center px-2 text-accent">
              <Store className="h-6 w-6" />
              <span className={`ml-2 font-bold ${isRTL ? 'mr-2 ml-0' : 'ml-2'}`}>
                {t('nav.store')}
              </span>
            </Link>

            {/* Navigation Links */}
            <div className={`hidden sm:flex sm:space-x-4 ${isRTL ? 'sm:mr-6 sm:space-x-reverse' : 'sm:ml-6'}`}>
              <NavLink href="/" icon={Home}>
                {t('nav.home')}
              </NavLink>
              <NavLink href="/products/listing" icon={Store}>
                {t('nav.shop')}
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink href="/dashboard" icon={Activity}>
                    {t('nav.dashboard')}
                  </NavLink>
                  <NavLink href="/admin" icon={Shield}>
                    {t('nav.admin')}
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleLanguage}
              variant="ghost"
              size="sm"
              className="flex items-center"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'فارسی' : 'English'}
            </Button>
            <UserMenu />
            <ToggleNav/>
          </div>
        </div>
      </div>
    </nav>
  );
}