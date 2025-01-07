'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import TeamList from '@/components/dashboard/team/TeamList';
import TeamStats from '@/components/dashboard/team/TeamStats';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const getTeamMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setTeamMembers(data);
    };

    getTeamMembers();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="grid gap-6">
          <TeamStats teamSize={teamMembers.length} />
          <TeamList members={teamMembers} />
        </div>
      </div>
    </div>
  );
}