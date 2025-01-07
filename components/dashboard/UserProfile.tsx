'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface UserProfileProps {
  user: {
    full_name: string | null;
    email: string;
    role: string;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <User className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500 capitalize">Role: {user.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}