'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import UserProfile from '@/components/dashboard/UserProfile';
import KPICard from '@/components/dashboard/KPICard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SearchBar from '@/components/dashboard/SearchBar';
import Navigation from '@/components/dashboard/Navigation';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';

// Mock data - Replace with real data from your Supabase database
const mockActivityData = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  value: Math.floor(Math.random() * 100),
}));

export default function DashboardPage() {
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-black border-r">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <div className="mt-8 flex-1 px-4">
              <Navigation />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <div className="flex-1 pb-8">
            <div className="px-4 sm:px-6 lg:px-8">
              <Header />
              
              {/* Search */}
              <div className="mb-6">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
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