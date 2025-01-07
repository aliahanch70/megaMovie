import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen  bg-black ">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
          <p className="text-xl text-gray-600">
            A secure and modern authentication system built with Next.js and Supabase
          </p>
        </div>

        <div className="max-w-md mx-auto ">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Link href="/auth/login">
                <Button className="w-full" size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}