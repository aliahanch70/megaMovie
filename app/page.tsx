import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import ProductScroll from '@/components/products/ProductScroll';
import Slideshow from '@/components/Slideshow';
import Carousel from '@/components/Carousel';
import Slideshow2 from '@/components/SlideShow2';
import VideoStories from '@/components/story/videoStories3';
import ColorExtractor from '@/components/ColorExtractor';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const { data: slides } = await supabase
    .from('slides')
    .select('*')
    .order('order_number');

  // Fetch products for each category
// 1. دریافت سال جاری
const currentYear = new Date().getFullYear(); // مقدار این متغیر در حال حاضر 2025 خواهد بود


  // 2. ساخت کوئری Supabase با فیلتر سال جاری
  const {  data: offers, error } = await supabase
    .from('movies') // نام جدول شما
    .select('id, title, release, genres, movie_images (url),imdb') // فیلدهایی که نیاز دارید
    .eq('release', currentYear) // فیلتر کردن: فقط فیلم‌هایی که فیلد release برابر با currentYear است
    .order('created_at', { ascending: false }) // اختیاری: مرتب‌سازی فیلم‌های امسال بر اساس تاریخ ایجاد رکورد
    .limit(20) // اختیاری: محدود کردن تعداد نتایج



  const { data: series } = await supabase
    .from('movies')
    .select('id, title, release, genres, movie_images (url),imdb , type')  // Add category here
    .eq('type', 'Series')
    .order('created_at', { ascending: false })
    .limit(10);

    const { data: movies } = await supabase
    .from('movies')
    .select('id, title, release, genres, movie_images (url),imdb , type')  // Add category here
    .eq('type', 'Movie')
    .order('created_at', { ascending: false })
    .limit(10);

  // const { data: clothing } = await supabase
  //   .from('products')
  //   .select('id, name, price, category, product_images(url)')
  //   .eq('category', 'clothing')
  //   .limit(10);

  // const { data: books } = await supabase
  //   .from('products')
  //   .select('id, name, price, category, product_images(url)')
  //   .eq('category', 'books')
  //   .limit(10);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-8">
        <Slideshow2 slides={slides || []} />
       

        {/* New movies */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 px-4">New Release</h2>
          <ProductScroll products={offers || []} />
        </section>

        {/* Electronics Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 px-4">Series</h2>
          <ProductScroll products={series || []} />
        </section>

        {/* Clothing Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 px-4">Movies</h2>
          <ProductScroll products={movies || []} />
        </section>

        {/* Books Section */}
        <section className="mb-12 ">
          {/* <h2 className="text-2xl font-semibold mb-4">Books</h2> */}
          {/* <ProductScroll products={books || []} /> */}
        </section>
        
        {/* <VideoStories /> */}

        


        
      </div>
    </div>
  );
}