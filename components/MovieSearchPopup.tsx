'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Movie {
  "#TITLE": string;
  "#YEAR": number;
  "#IMDB_ID": string;
  "#IMG_POSTER": string;
}

interface MovieSearchPopupProps {
  onSelectMovie: (movieData: any) => void;
}

export default function MovieSearchPopup({ onSelectMovie }: MovieSearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false); // لودینگ برای جزئیات
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.description || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (movie: Movie) => {
  setLoadingDetails(true);
  try {
    const response = await fetch(`https://www.omdbapi.com/?i=${movie["#IMDB_ID"]}&apikey=33c5c8ee`);
    const details = await response.json();

    onSelectMovie({
      title: details.Title,
      release: details.Year?.split('–')[0], // فقط سال شروع
      director: details.Director !== 'N/A' ? details.Director : '',
      description: details.Plot,
      genres: details.Genre ? details.Genre.split(', ') : [],
      duration: details.Runtime !== 'N/A' ? parseInt(details.Runtime) : '',
      language: details.Language,
      imdb: details.imdbRating,
      imdbId: details.imdbID,
      type: details.Type === 'series' ? 'Series' : 'Movie',
      actors: details.Actors, // جدید
      awards: details.Awards, // جدید
      country: details.Country, // جدید
      image: details.Poster !== 'N/A' ? details.Poster : movie["#IMG_POSTER"]
    });
    setIsOpen(false);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    setLoadingDetails(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">جستجوی فیلم</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>جستجوی فیلم</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="نام فیلم..." />
          <Button onClick={handleSearch} disabled={loading}>جستجو</Button>
        </div>
        
        {loadingDetails && <p>در حال دریافت جزئیات...</p>}
        
        <div className="max-h-64 overflow-y-auto">
          {results.map((movie) => (
            <Card key={movie["#IMDB_ID"]} className="mb-2 cursor-pointer" onClick={() => handleSelect(movie)}>
              <CardContent className="p-2 flex gap-2">
                <p>{movie["#TITLE"]} ({movie["#YEAR"]})</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}