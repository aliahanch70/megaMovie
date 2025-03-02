import { getProduct, getAllProductIds, getRelatedProducts } from '@/lib/api/products';
import ProductPageClient from '@/components/products/details/ProductPageClient';
import RelatedProducts from '@/components/products/RelatedProducts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>; // Updated to reflect Next.js 15+ behavior
}

// Static params for build time generation
export async function generateStaticParams() {
  const ids = await getAllProductIds();
  return ids.map((id) => ({ id }));
}

// Server component that fetches initial data
export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { id } = await params; // Await params to get the id
  const { data: { session } } = await supabase.auth.getSession();

  // Get user role from profiles table
  const { data: userRole } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user?.id)
    .single();

  const isAdmin = userRole?.role === 'admin';

  const [initialData, relatedProducts] = await Promise.all([
    getProduct(id), // Use resolved id
    getRelatedProducts(id), // Use resolved id
  ]);

  console.log('Is Admin:', isAdmin);

  return (
    <div>
      {isAdmin && (
        <Link href={`/admin/products/edit/${id}`}>
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <ProductPageClient id={id} initialData={initialData} />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}