export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getProduct, getAllProductIds, getRelatedProducts } from '@/lib/api/products';
import ProductPageClient from '@/components/products/details/ProductPageClient';
import RelatedProducts from '@/components/products/RelatedProducts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { trackProductView } from '@/lib/utils/viewTracker';
import { Metadata, ResolvingMetadata } from 'next';


interface ProductDetailsPageProps {
  params: Promise<{ id: string }>; // Updated to reflect Next.js 15+ behavior
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: ProductDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  
  const { id } = await params; // Await params to get the id
  const product = await getProduct(id);
  if (!product) {
    return {
      title: 'Product not found',
      description: 'The product you are looking for does not exist.',
    };
  }
  
  // Find title and description from meta_tags
  const metaTags = (product as any)?.meta_tags || [];
  interface MetaTag {
    key: string;
    value: string;
  }

  const titleTag: MetaTag | undefined = metaTags.find((tag: MetaTag) => tag.key === 'title');
  const descriptionTag: MetaTag | undefined = metaTags.find((tag: MetaTag) => tag.key === 'description');

  return {
    title: titleTag?.value || product.name,
    description: descriptionTag?.value || product.description,
    // You can add more metadata here
    openGraph: {
      title: titleTag?.value || product.name,
      description: descriptionTag?.value || product.description,
    },
  };
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

  try {
    const sessionPromise = supabase.auth.getSession();
    const productPromise = getProduct(id);
    const relatedPromise = getRelatedProducts(id);

    const [
      { data: { session } },
      productData,
    ] = await Promise.all([
      sessionPromise,
      productPromise,
      relatedPromise
    ]);

    // Get user role from profiles table
    const { data: userRole } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user?.id)
    .single();


    if (productData) {
      await trackProductView({
        userRole: userRole?.role,
        userId: session?.user?.id,
        productId: productData.id,
        productName: productData.name,
        price: productData.price,
        category: productData.category,
        viewedAt: new Date().toISOString(),
        imageUrl: productData.product_images?.[0]?.url ? 
          `/products/${productData.product_images[0].url}` : 
          undefined
      });
    }
  

  

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
} catch (error) {
  console.error('Error fetching product data:', error);
  return <div>Error loading product</div>;
}
}