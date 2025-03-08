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
  params: Promise<{ id: string }>;
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: ProductDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: 'Product not found',
      description: 'The product you are looking for does not exist.',
    };
  }

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
    openGraph: {
      title: titleTag?.value || product.name,
      description: descriptionTag?.value || product.description,
    },
  };
}

// Server component that fetches initial data
export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies }); // cookies به صورت تابع ارسال می‌شه

  try {
    // گرفتن کاربر با getUser به جای getSession
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // گرفتن همه داده‌ها توی یه Promise.all
    const productPromise = getProduct(id);
    const relatedPromise = getRelatedProducts(id);
    const userRolePromise = user
      ? supabase.from('profiles').select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }); // اگه کاربری نبود، null برگردون

    const [
      productData,
      relatedProducts,
      { data: userRole },
    ] = await Promise.all([productPromise, relatedPromise, userRolePromise]);

    // ثبت بازدید محصول
    if (productData) {
      await trackProductView({
        userRole: userRole?.role,
        userId: user?.id,
        productId: productData.id,
        productName: productData.name,
        price: productData.price,
        category: productData.category,
        viewedAt: new Date().toISOString(),
        imageUrl: productData.product_images?.[0]?.url || undefined, // پیشوند /products/ حذف شد
      });
    }

    const isAdmin = userRole?.role === 'admin';

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
        <ProductPageClient id={id} initialData={productData} />
        <RelatedProducts products={relatedProducts} />
      </div>
    );
  } catch (error) {
    
    console.error('Error fetching product data:', error);
    return <div>Error loading product</div>;
  }
}