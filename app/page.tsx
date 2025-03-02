import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import ProductScroll from '@/components/products/ProductScroll';
import Slideshow from '@/components/Slideshow';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const { data: slides } = await supabase
    .from('slides')
    .select('*')
    .order('order_number');

  // Fetch products for each category
  const { data: offers } = await supabase
    .from('products')
    .select('id, name, price, category, product_images (url, label)')  // Add category here
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: electronics } = await supabase
    .from('products')
    .select('id, name, price, category, product_images(url)')  // Add category here
    .eq('category', 'electronics')
    .limit(10);

  const { data: clothing } = await supabase
    .from('products')
    .select('id, name, price, category, product_images(url)')
    .eq('category', 'clothing')
    .limit(10);

  const { data: books } = await supabase
    .from('products')
    .select('id, name, price, category, product_images(url)')
    .eq('category', 'books')
    .limit(10);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <Slideshow slides={slides || []} />
       

        {/* Special Offers Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Special Offers</h2>
          <ProductScroll products={offers || []} />
        </section>

        {/* Electronics Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Electronics</h2>
          <ProductScroll products={electronics || []} />
        </section>

        {/* Clothing Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Clothing</h2>
          <ProductScroll products={clothing || []} />
        </section>

        {/* Books Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          <ProductScroll products={books || []} />
        </section>

        
      </div>
    </div>
  );
}