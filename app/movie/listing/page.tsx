"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import ProductGrid from '@/components/products/listing/ProductGrid';
import ProductFilters from '@/components/products/listing/ProductFilters';
import SearchBar from '@/components/products/listing/SearchBar';
import { createClient } from '@/lib/supabase/client';
import Loading from '@/components/Loading';
import LoadingSpinner from '@/components/LoadingSpinner';

type Movie = {
  id: string;
  title: string; // تغییر از name به title
  release: number; // تغییر از price به release
  genres: string[]; // آرایه‌ای از ژانرها
  created_at: string;
  movie_images: { url: string; label: string }[];
};

function MovieListingContent() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 16;
  const [filters, setFilters] = useState({
    genres: 'all',
    minYear: '',
    maxYear: '',
    rating: 'all', // می‌توانید این را بعداً با امتیاز فیلم جایگزین کنید
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
  const lastMovieRef = useCallback((node: HTMLDivElement) => {
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
    const fetchMovies = async () => {
      if (offset === 0) {
        setLoading(true);
      }
      let query = supabase.from('movies').select(`
        id,
        title,
        release,
        genres,
        created_at,
        movie_images (url, label)
      `);

      // اعمال فیلترها
      if (filters.genres && filters.genres !== 'all') {
        query = query.contains('genres', [filters.genres]); // برای آرایه ژانرها
      }
      if (filters.minYear) {
        query = query.gte('release', parseInt(filters.minYear));
      }
      if (filters.maxYear) {
        query = query.lte('release', parseInt(filters.maxYear));
      }
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`); // تغییر name به title
      }

      // اعمال مرتب‌سازی
      switch (filters.sort) {
        case 'year-asc': // تغییر از price-asc به year-asc
          query = query.order('release', { ascending: true });
          break;
        case 'year-desc': // تغییر از price-desc به year-desc
          query = query.order('release', { ascending: false });
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
          setMovies(data || []);
        } else {
          setMovies(prev => [...prev, ...(data || [])]);
        }
        setHasMore((data || []).length === LIMIT);
        setLoadError(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchMovies();
  }, [filters, searchQuery, offset, supabase]);

  // ریست offset هنگام تغییر فیلترها یا جستجو
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
  }, [filters, searchQuery]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Our Movies</h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64">
            <ProductFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="flex-1">
            <ProductGrid 
              movies={movies} // تغییر از products به movies
              loading={loading}
              loadingMore={loadingMore}
              lastMovieRef={lastMovieRef}
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

export default function MovieListingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MovieListingContent />
    </Suspense>
  );
}