'use client';

import { useRef, useState, MouseEvent , useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
    updateArrowVisibility();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
      setDragDistance(Math.abs(x - startX));
      updateArrowVisibility();
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    updateArrowVisibility();
  };

  const handleClick = (e: MouseEvent, productId: string) => {
    if (isDragging && dragDistance > 5) {
      e.preventDefault();
    } else {
      router.push(`/products/${productId}`);
    }
  };

  const scrollLeftHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
      setTimeout(updateArrowVisibility, 300); // Wait for scroll animation
    }
  };

  const scrollRightHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
      setTimeout(updateArrowVisibility, 300); // Wait for scroll animation
    }
  };

  const updateArrowVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Show left arrow if not at start
      setShowLeftArrow(scrollLeft > 0);
      // Show right arrow if not at end (with small buffer)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Initial check on mount
  useEffect(() => {
    updateArrowVisibility();
    // Add scroll listener
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateArrowVisibility);
      return () => container.removeEventListener('scroll', updateArrowVisibility);
    }
  }, []);

  return (
    <div className="relative overflow-hidden px-4">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeftHandler}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

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
              <Card className="group">
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

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRightHandler}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}