'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import UserProfile from '@/components/dashboard/UserProfile';
import KPICard from '@/components/dashboard/KPICard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SearchBar from '@/components/dashboard/SearchBar';
import Navigation from '@/components/dashboard/Navigation';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data - Replace with real data from your Supabase database
const mockActivityData = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  value: Math.floor(Math.random() * 100),
}));

function DashboardContent() {
  const { isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUser(profile);
      }
    };

    getUser();
  }, [supabase]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header at the top */}
      <Header />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:bottom-0 lg:top-16 bg-black border-${isRTL ? 'l' : 'r'}`}>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className={`flex items-center flex-shrink-0 px-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <div className="mt-8 flex-1 px-4">
              <Navigation />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex flex-col flex-1 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`}>
          <div className="flex-1 pb-8">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Search */}
              <div className="mb-6 z-0">
                <SearchBar onSearch={setSearchQuery} />
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <KPICard
                  title="Total Users"
                  value="1,234"
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  trend={{ value: 12, isPositive: true }}
                />
                <KPICard
                  title="Active Now"
                  value="123"
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                  description="Users online"
                />
                <KPICard
                  title="Growth Rate"
                  value="23%"
                  icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                  trend={{ value: 8, isPositive: true }}
                />
                <KPICard
                  title="Avg. Session"
                  value="24m"
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  description="Per user"
                />
              </div>

              {/* Charts and other content */}
              <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 mb-8 ${isRTL ? 'md:gap-x-6' : ''}`}>
                <ActivityChart data={mockActivityData} />
                <UserProfile user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}