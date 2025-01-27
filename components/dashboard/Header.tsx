'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Button variant="outline" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
      
    </div>
  );
}