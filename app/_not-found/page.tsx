// app/_not-found/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Page not found';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Not Found</h1>
        <p className="mt-4 text-lg">{error}</p>
        <Link href="/" className="mt-6 inline-block text-blue-500 hover:underline">
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}