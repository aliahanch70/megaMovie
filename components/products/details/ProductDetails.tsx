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
  initialData: any;
}

export default function ProductDetails({ id, initialData }: ProductDetailsProps) {
  const [product, setProduct] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const supabase = createClient();
  useEffect(() => {
      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (url, label, order),
            product_links (title, url , price , city , warranty, option_values),
            product_specifications (label, value),
            product_options (name, values),
            profiles (full_name)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
        } else {
          setProduct(data);
          console.log(data)
        }
        setLoading(false);
      };

      fetchProduct();
    
  }, [id, supabase, initialData]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground">The requested product does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductHeader 
          name={product.name} 
          price={product.price}
          status={product.status}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ProductGallery images={product.product_images} />
          
          <div className="space-y-8">
            <ProductInfo 
              description={product.description}
              category={product.category}
              
              createdAt={product.created_at}
            />
            
            <ProductSpecs 
              category={product.category}
              status={product.status}
              specifications={product.product_specifications}
            />
            
            
            {product.product_links?.length > 0 && (
              <ProductLinks 
                links={product.product_links} 
                options={product.product_options}
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