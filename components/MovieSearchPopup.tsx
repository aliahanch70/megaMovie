'use client';

import Image from 'next/image';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Movie {
  id: string;
  primaryTitle: string; // عنوان اصلی
  startYear: string; // سال شروع
  primaryImage: string; // تصویر اصلی
  genres: string[]; // ژانرها
  description: string; // توضیحات
  runtimeMinutes: number | null; // مدت زمان
  spokenLanguages: string[]; // زبان‌ها
  averageRating: number; // امتیاز میانگین
  type: string; // نوع فیلم
  
  // می‌توانید فیلدهای دیگر را هم اضافه کنید
}

interface MovieSearchPopupProps {
  onSelectMovie: (movieData: any) => void;
}

export default function MovieSearchPopup({ onSelectMovie }: MovieSearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Fetched data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch movie data');
      }

      const movies = Array.isArray(data) ? data : [];
      console.log('Processed movies:', movies);
      setResults(movies);
    } catch (err: any) {
      setError(err.message || 'Error fetching movie data. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (movie: Movie) => {
    console.log('Selected movie:', movie);
    onSelectMovie({
      title: movie.primaryTitle,
      release: movie.startYear,
      description: movie.description,
      genres: movie.genres || [],
      duration: movie.runtimeMinutes || '',
      language: movie.spokenLanguages?.[0] || '', // اولین زبان
      image: movie.primaryImage,
      imdbId: movie.id,
      imdb:movie.averageRating,
      type: movie.type

    });
    setIsOpen(false);
    setSearchQuery('');
    setResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Search Movie</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search for a Movie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter movie title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {results.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {results.map((movie) => (
                <Card key={movie.id} className="mb-2 cursor-pointer" onClick={() => handleSelect(movie)}>
                  <CardContent className="p-2">
                    <p className="font-semibold">{movie.primaryTitle || 'No title'}</p>
                    <p className="text-sm text-muted-foreground">{movie.startYear || 'N/A'}</p>
                    <Image
                      src={movie.primaryImage || '/placeholder.png'}
                      alt={movie.primaryTitle}
                      
                      height={100}
                        width={100}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !loading && !error && searchQuery && <p>No results found.</p>
          )}

          {loading && <p>Loading...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}