'use client';

import { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  release: string;
  genres: string[];
  movie_images: Array<{ url: string }>;
  imdb: number | null;
}

interface ProductScrollProps {
  products: Product[];
}

export default function ProductScroll({ products }: ProductScrollProps) {
  const router = useRouter();
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.png';
    return url.startsWith('https') ? url : `/products/${url}`;
  };

  const handleProductClick = async (product: Product, productId: string) => {
    try {
      await fetch('/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.title,
          price: product.release,
          category: product.genres,
          imageUrl: getImageUrl(product.movie_images[0]?.url),
        }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
    router.push(`/movie/${productId}`);
  };

  const updateArrowVisibility = (swiper: any) => {
    setShowLeftArrow(!swiper.isBeginning);
    setShowRightArrow(!swiper.isEnd);
  };

  // اتصال navigation فقط زمانی که همه چی حاضره
  useEffect(() => {
    if (swiperInstance && prevRef.current && nextRef.current) {
      setTimeout(() => {
        swiperInstance.params.navigation.prevEl = prevRef.current;
        swiperInstance.params.navigation.nextEl = nextRef.current;
        swiperInstance.navigation.destroy();
        swiperInstance.navigation.init();
        swiperInstance.navigation.update();
      }, 0);
    }
  }, [swiperInstance]);

  return (
    <div className="relative overflow-hidden ">
      {/* Left Arrow */}
      

      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={16}
        slidesPerView="auto"
        freeMode
        navigation={true} // اینجا true می‌ذاریم و بعد تو useEffect مقدار دقیق دکمه‌ها رو ست می‌کنیم
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
          updateArrowVisibility(swiper);
        }}
        onSlideChange={(swiper) => updateArrowVisibility(swiper)}
        className="-mx-4"
        style={{ paddingLeft: '16px', paddingRight: '16px' }}
      >
        {products.map((product) => (
          <SwiperSlide
            key={product.id}
            style={{ width: '38vw', maxWidth: '250px', minWidth: '150px' }}
          >
            <div onClick={() => handleProductClick(product, product.id)}>
              <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Right Arrow */}
     

    </div>
  );
}
