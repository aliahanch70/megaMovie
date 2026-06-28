export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { createServerClient } from '@supabase/ssr'; // ۱. استفاده از SSR جدید

import { getProduct, getRelatedProducts } from '@/lib/api/products';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { trackProductView } from '@/lib/utils/viewTracker';
import { Metadata, ResolvingMetadata } from 'next';
import ProductPageWrapper from '@/components/products/details/ProductPageWrapper'; // کامپوننت جدید

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: ProductDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: 'محصول پیدا نشد',
      description: 'محصولی که دنبالش هستید وجود ندارد.',
    };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
    },
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
const cookieStore = await cookies();

  // ۳. ایجاد کلاینت SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // در کامپوننت‌های سرور، نوشتن کوکی مجاز نیست. این تابع را خالی بگذارید.
        },
      },
    }
  );  const productPromise = getProduct(id);
  const relatedPromise = getRelatedProducts(id);

  let user = null;
  let userRole = null;
  let isAdmin = false;

  try {
    const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('کاربری وارد نشده یا خطا در گرفتن کاربر:', userError.message);
    } else {
      user = fetchedUser;
      if (user) {
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (roleError) {
          console.error('خطا در گرفتن نقش کاربر:', roleError.message);
        } else {
          userRole = roleData;
          isAdmin = userRole?.role === 'admin';
        }
      }
    }
  } catch (error) {
    console.log('احراز هویت کاربر ناموفق بود، ادامه بدون داده کاربر:', error);
  }

  try {
    const [productData, relatedProducts] = await Promise.all([productPromise, relatedPromise]);

    if (productData) {
      await trackProductView({
        userRole: userRole?.role || undefined,
        userId: user?.id || undefined,
        productId: productData.id,
        productName: productData.title,
        price: (productData as any).price,
        category: (productData as any).genres?.join(', ') || undefined,
        viewedAt: new Date().toISOString(),
        imageUrl: productData.movie_images?.[0]?.url || undefined,
      });
    }

    return (
      <ProductPageWrapper
        id={id}
        initialData={productData}
        relatedProducts={relatedProducts}
        isAdmin={isAdmin}
      />
    );
  } catch (error) {
    console.error('خطا در گرفتن داده‌های محصول:', error);
    return <div>خطا در بارگذاری محصول</div>;
  }
}