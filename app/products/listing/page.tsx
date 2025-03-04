"use client"
import { useState, useEffect, Suspense } from 'react';
import ProductGrid from '@/components/products/listing/ProductGrid';
import ProductFilters from '@/components/products/listing/ProductFilters';
import SearchBar from '@/components/products/listing/SearchBar';
import { createClient } from '@/lib/supabase/client';
import Loading from '@/components/Loading';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  created_at: string;
  product_images: { url: string; label: string }[];
};

 function ProductListingContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    rating: 'all',
    sort: 'newest',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select(`
        *,
        product_images (url, label)
      `);

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice));
      }
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply sorting
      switch (filters.sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) console.error('Error fetching products:', error);
      else setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, [filters, searchQuery, supabase]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Our Products</h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64">
            <ProductFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="flex-1">
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductListingPage() {
  return(
    <Suspense fallback={<><Loading/></>}>
      <ProductListingContent />
    </Suspense>
  )
}
