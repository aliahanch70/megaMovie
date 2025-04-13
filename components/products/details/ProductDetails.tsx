'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductHeader from './ProductHeader';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductSpecs from './ProductSpecs';
import ProductLinks from './ProductLinks';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductDetailsProps {
  id: string;
  initialData: any; // داده‌های اولیه که ممکنه از SSR بیاد
}

export default function ProductDetails({ id, initialData }: ProductDetailsProps) {
  const [product, setProduct] = useState(initialData);
  const [loading, setLoading] = useState(!initialData); // اگر initialData نباشه، لودینگ شروع می‌شه
  const supabase = createClient();

  useEffect(() => {
    // فقط اگر initialData نباشه یا نیاز به رفرش دیتا باشه، فچ می‌کنیم
    if (!initialData || !product) {
      const fetchProduct = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('movies')
          .select(`
            id,
            title,
            description,
            genres,
            release,
            duration,
            language,
            created_at,
            movie_images (url, label, order),
            movie_links (title, url, quality, size, encode,website, option_values),
            movie_specifications (label, value),
            movie_options (name, values),
            profiles (full_name),
            imdb,
            type
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('خطا در دریافت اطلاعات فیلم:', error);
        } else {
          setProduct(data);
          console.log('داده‌های دریافت‌شده:', data);
        }
        setLoading(false);
      };

      fetchProduct();
    }
  }, [id, supabase, initialData]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">فیلم یافت نشد</h1>
          <p className="text-muted-foreground">فیلم درخواست‌شده وجود ندارد.</p>
        </div>
      </div>
    );
  }
  console.log('Product:', product);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductHeader
          name={product.title} 
          imdb={product.imdb } 
          release={product.release}
          images={product.movie_images[0]?.url || []}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ProductGallery images={product.movie_images || []} />

          <div className="space-y-8">
            <ProductInfo
              description={product.description}
              category={product.genres?.join(', ') || 'نامشخص'} 
              createdAt={product.created_at}
            />

            <ProductSpecs
              category={product.genres?.join(', ') || 'نامشخص'}
              duration={product.duration || 'n/a'}
              specifications={product.movie_specifications || []}
            />

            {product.movie_links?.length > 0 && (
              <ProductLinks
                links={product.movie_links}
                options={product.movie_options || []}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-20 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square" />
          <div className="space-y-8">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </div>
    </div>
  );
}