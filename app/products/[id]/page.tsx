export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getProduct, getRelatedProducts } from '@/lib/api/products';
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
  const supabase = createServerComponentClient({ cookies });
  // گرفتن داده‌های محصول و محصولات مرتبط بدون وابستگی به کاربر
  const productPromise = getProduct(id);
  const relatedPromise = getRelatedProducts(id);

  let user = null;
  let userRole = null;
  let isAdmin = false;

  // گرفتن کاربر و نقشش فقط اگه ممکن باشه
  try {
    const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('No user logged in or error fetching user:', userError.message);
    } else {
      user = fetchedUser;
        if(user) {
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
      if (roleError) {
        console.error('Error fetching user role:', roleError.message);
      } else {
        userRole = roleData;
        isAdmin = userRole?.role === 'admin';
      }
    }
  }
  } catch (error) {
    console.log('User authentication failed, proceeding without user data:', error);
  }

  // گرفتن داده‌های محصول و محصولات مرتبط
  try {
    const [productData, relatedProducts] = await Promise.all([productPromise, relatedPromise]);

    // ثبت بازدید محصول (حتی اگه کاربر نباشه)
    if (productData) {
      await trackProductView({
        userRole: userRole?.role || undefined,
        userId: user?.id || undefined,
        productId: productData.id,
        productName: productData.name,
        price: productData.price,
        category: productData.category,
        viewedAt: new Date().toISOString(),
        imageUrl: productData.product_images?.[0]?.url || undefined,
      });
    }

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