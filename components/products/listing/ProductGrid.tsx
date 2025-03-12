'use client';

import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  product_images: Array<{ url: string; label: string }>;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  lastProductRef?: (node: HTMLDivElement) => void;
  hasMore: boolean;
  loadError: boolean;
  onLoadMore: () => void;
}

export default function ProductGrid({ 
  products, 
  loading, 
  loadingMore, 
  lastProductRef,
  hasMore,
  loadError,
  onLoadMore 
}: ProductGridProps) {
  if (loading && !loadingMore) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div key={product.id} ref={index === products.length - 1 ? lastProductRef : undefined}>
            <Link href={`/products/${product.id}`}>
              <Card className="group">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.product_images[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">
                      ${product.price.toLocaleString()}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-accent text-accent"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-4">
          {loadingMore ? (
            <LoadingSpinner />
          ) : loadError ? (
            <div className="flex justify-center">
              <Button 
                onClick={onLoadMore}
                variant="outline"
                className="px-8"
              >
                Load More
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}