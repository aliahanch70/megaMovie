'use client';

import { useRef, useState, MouseEvent } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  product_images: Array<{ url: string }>;
}

interface ProductScrollProps {
  products: Product[];
}

export default function ProductScroll({ products }: ProductScrollProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.png';
    return url.startsWith('https') ? url : `/products/${url}`;
  };

  const handleProductClick = async (product: Product) => {
    try {
      const response = await fetch('/api/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          category: product.category,
          imageUrl: getImageUrl(product.product_images[0]?.url)
        }),
      });
      if (!response.ok) {
        console.error('Failed to track product view');
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragDistance(0);
    setDragStartTime(Date.now());
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Adjust scrolling speed
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
      setDragDistance(Math.abs(x - startX)); // Track drag distance
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleClick = (e: MouseEvent, productId: string) => {
    // Only prevent navigation if there was significant dragging
    if (isDragging && dragDistance > 5) {
      e.preventDefault();
    } else {
      // If it was a clean click or tiny movement, allow navigation
      router.push(`/products/${productId}`)
    }
  };

  return (
    <div className="relative overflow-hidden px-4">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide select-none -mx-4"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex gap-4 px-4">
          {products.map((product) => (
            <div 
              key={product.id}
              className="flex-none w-[38vw] sm:w-[200px] md:w-[250px]"
              onClick={(e: any) => handleClick(e, product.id)}
            >
              <Card className="hover-card-effect group">
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-white">
                  <Image
                    src={getImageUrl(product.product_images[0]?.url)}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    draggable={false}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}