'use client';

import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from "@/components/ui/button";

interface Movie {
  id: string;
  title: string; // تغییر از name به title
  release: number; // تغییر از price به release
  genres: string[]; // اضافه کردن ژانرها
  movie_images: Array<{ url: string; label: string }>;
  imdb: number | null; // اضافه کردن imdb
}

const getRatingColor = (imdb: number | null): string => {
  if (imdb === null) return 'text-gray-500'; // اگه imdb null باشه، خاکستری
  if (imdb >= 7.5) return 'text-green-500';
  if (imdb >= 5) return 'text-yellow-500';
  return 'text-red-500';
};



interface MovieGridProps {
  movies: Movie[]; // تغییر از products به movies
  loading: boolean;
  loadingMore: boolean;
  lastMovieRef?: (node: HTMLDivElement) => void;
  hasMore: boolean;
  loadError: boolean;
  onLoadMore: () => void;
}

export default function MovieGrid({ 
  movies, 
  loading, 
  loadingMore, 
  lastMovieRef,
  hasMore,
  loadError,
  onLoadMore 
}: MovieGridProps) {
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
        {movies.map((movie, index) => (
          <div key={movie.id} ref={index === movies.length - 1 ? lastMovieRef : undefined}>
            <Link href={`/movie/${movie.id}`}> {/* تغییر مسیر به /movies */}
              <Card className="group hover:bg-neutral-900 duration-300">
                <div className="aspect-[0.8] relative overflow-hidden rounded-t-lg">
                  <Image
                    src={movie.movie_images[0]?.url || '/placeholder.png'}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-3d
"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{movie.title} {` (${movie.release})`}</h3>
                  <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className={getRatingColor(movie.imdb)}>
                        {movie.imdb !== null ? movie.imdb.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </span>
                    
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {movie.genres.join(', ')} {/* نمایش ژانرها */}
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-4 flex justify-center">
          {loadingMore ? (
            <LoadingSpinner />
          ) : loadError ? (
            <Button 
              onClick={onLoadMore}
              variant="outline"
              className="px-8"
            >
              Load More
            </Button>
          ) : (
            <Button 
              onClick={onLoadMore}
              variant="outline"
              className="px-8"
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
}