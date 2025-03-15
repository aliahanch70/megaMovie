'use client';

import dynamic from 'next/dynamic';
import { Movie } from '@/lib/api/products';

// لود داینامیک ProductPageClient
const ProductPageClient = dynamic(
  () => import('@/components/products/details/ProductPageClient'),
  { ssr: false }
);

interface ProductPageWrapperProps {
  id: string;
  initialData: Movie | null;
  relatedProducts: Movie[];
  isAdmin: boolean;
}

export default function ProductPageWrapper({
  id,
  initialData,
  relatedProducts,
  isAdmin,
}: ProductPageWrapperProps) {
  return (
    <ProductPageClient
      id={id}
      initialData={initialData}
      relatedProducts={relatedProducts}
      isAdmin={isAdmin}
    />
  );
}