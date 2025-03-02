'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation'; // Added for potential redirect
import Header from '@/components/dashboard/Header';
import ActivityFeed from '@/components/dashboard/activity/ActivityFeed';
import ActivityStats from '@/components/dashboard/activity/ActivityStats';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast'; // Assuming you use this for notifications

interface Activity {
  id: string;
  user_id: string;
  created_at: string;
  type: string;
  description: string;
}

function ActivityContent() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to view activities');
          router.push('/login'); // Redirect to login if unauthenticated
          return;
        }

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast.error('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    getActivities();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        {loading ? (
          <div className="text-center py-4">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4">No activities found</div>
        ) : (
          <div className="grid gap-6">
            <ActivityStats activities={activities} />
            <ActivityFeed activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">Loading activities...</div>}>
      <ActivityContent />
    </Suspense>
  );
}