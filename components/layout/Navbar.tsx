'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store, Home, Users, Activity, Shield } from 'lucide-react';
import NavLink from './NavLink';
import UserMenu from './UserMenu';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

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

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex items-center px-2 text-accent">
              <Store className="h-6 w-6" />
              <span className="ml-2 font-bold">Store</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink href="/" icon={Home}>
                Home
              </NavLink>
              <NavLink href="/products/listing" icon={Store}>
                Shop
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink href="/dashboard" icon={Activity}>
                    Dashboard
                  </NavLink>
                  <NavLink href="/admin" icon={Shield}>
                    Admin
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}