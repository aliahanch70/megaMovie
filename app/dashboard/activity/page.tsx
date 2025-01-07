'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/dashboard/Header';
import ActivityFeed from '@/components/dashboard/activity/ActivityFeed';
import ActivityStats from '@/components/dashboard/activity/ActivityStats';
import { createClient } from '@/lib/supabase/client';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const getActivities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user's activities (you'll need to create this table)
        const { data } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data) setActivities(data);
      }
    };

    getActivities();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="grid gap-6">
          <ActivityStats activities={activities} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}