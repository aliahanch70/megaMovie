'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Settings, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNav = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const userNav = [
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Navigation({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const navigation = userRole === 'admin' ? adminNav : userNav;

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname === item.href && 'bg-muted'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}