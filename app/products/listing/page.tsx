"use client"
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import ProductGrid from '@/components/products/listing/ProductGrid';
import ProductFilters from '@/components/products/listing/ProductFilters';
import SearchBar from '@/components/products/listing/SearchBar';
import { createClient } from '@/lib/supabase/client';
import Loading from '@/components/Loading';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 16;
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    rating: 'all',
    sort: 'newest',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const supabase = createClient();

  const loadMore = useCallback(() => {
    setLoadError(false);
    setLoadingMore(true);
    setTimeout(() => {
      setOffset(prev => prev + LIMIT);
    }, 1000);
  }, []);

  const observer = useRef<IntersectionObserver>();
  const lastProductRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore || loadError) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadError, loadMore]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (offset === 0) {
        setLoading(true);
      }
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

      query = query.range(offset, offset + LIMIT - 1);
      
      try {
        const { data, error } = await query;
        if (error) throw error;
        
        if (offset === 0) {
          setProducts(data || []);
        } else {
          setProducts(prev => [...prev, ...(data || [])]);
        }
        setHasMore((data || []).length === LIMIT);
        setLoadError(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [filters, searchQuery, offset, supabase]);

  // Reset offset when filters or search change
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
  }, [filters, searchQuery]);

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
            <ProductGrid 
              products={products} 
              loading={loading}
              loadingMore={loadingMore}
              lastProductRef={lastProductRef}
              hasMore={hasMore}
              loadError={loadError}
              onLoadMore={loadMore}
            />
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
