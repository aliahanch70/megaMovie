"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import ProductGrid from '@/components/products/listing/ProductGrid';
import ProductFilters from '@/components/products/listing/ProductFilters';
import SearchBar from '@/components/products/listing/SearchBar';
import { createClient } from '@/lib/supabase/client';
import Loading from '@/components/Loading';

// تعریف نوع Movie مثل قبل
type Movie = {
  id: string;
  title: string;
  release: number;
  genres: string[];
  created_at: string;
  movie_images: { url: string; label: string }[];
  imdb: number | null;
  type: string | null;
};

// --- تعریف نوع برای فیلترها ---
type FilterState = {
  genres: string;
  minYear: string;
  maxYear: string;
  rating: string;
  sort: string;
  imdb: string;
  type: string;
};

const LIMIT = 16;
const supabase = createClient();

// --- Fetcher function با نوع FilterState ---
const fetcher = async ([_key, pageIndex, filters, searchQuery]: [string, number, FilterState, string]): Promise<Movie[]> => {
  let query = supabase.from('movies').select(`
    id,
    title,
    release,
    genres,
    created_at,
    movie_images (url, label),
    imdb,
    type
  `);

  // اعمال فیلترها
  if (filters.genres && filters.genres !== 'all') {
    query = query.contains('genres', [filters.genres]);
  }
  if (filters.imdb) {
    query = query.gte('imdb', parseFloat(filters.imdb));
  }

  
  if (filters.minYear) {
    query = query.gte('release', parseInt(filters.minYear));
  }
  if (filters.maxYear) {
    query = query.lte('release', parseInt(filters.maxYear));
  }
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }

  // اعمال مرتب‌سازی
  switch (filters.sort) {
    case 'year-asc':
      query = query.order('release', { ascending: true });
      break;
    case 'imdb-desc':
        query = query.order('imdb', { ascending: false });
        break;
    case 'year-desc':
      query = query.order('release', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const offset = pageIndex * LIMIT;
  query = query.range(offset, offset + LIMIT - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }

  return (data as Movie[]) || [];
};


function MovieListingContent() {
  // --- استفاده از نوع FilterState در useState ---
  const [filters, setFilters] = useState<FilterState>({
    genres: 'all',
    minYear: '',
    maxYear: '',
    rating: 'all',
    sort: 'newest',
    imdb: '0',
    type: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // --- استفاده از نوع FilterState در getKey ---
  const getKey = (pageIndex: number, previousPageData: Movie[] | null): [string, number, FilterState, string] | null => {
    if (previousPageData && previousPageData.length < LIMIT) return null;
    // کلید شامل نوع صریح FilterState می‌شود
    return ['movies', pageIndex, filters, searchQuery];
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<Movie[]>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      // revalidateOnFocus: false,
    }
  );

  const movies: Movie[] = data ? data.flat() : [];
  const isLoadingInitialData = isLoading;
  const isLoadingMore = isValidating && !!data && data.length > 0 && size > 1;
  const hasMore = !!data && data[data.length - 1]?.length === LIMIT;
  const loadError = !!error;

  const loadMore = useCallback(() => {
    if (!isLoadingMore) {
        setSize(size + 1);
    }
  }, [isLoadingMore, setSize, size]);

  const observer = useRef<IntersectionObserver>();
  const lastMovieRef = useCallback((node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore && !isValidating) {
              loadMore();
          }
      });
      if (node) observer.current.observe(node);
  }, [hasMore, isValidating, loadMore]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Our Movies</h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64">
            {/* Pass filters and onChange to ProductFilters */}
            <ProductFilters filters={filters} onChange={setFilters} />
          </div>
          <div className="flex-1">
            <ProductGrid
              movies={movies}
              loading={isLoadingInitialData}
              loadingMore={isLoadingMore}
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