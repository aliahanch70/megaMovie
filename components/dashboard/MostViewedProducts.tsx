'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

interface ViewData {
  productId: string;
  productName: string;
  imageUrl?: string;
  viewedAt: string;
  ipAddress?: string;
}

interface MovieWithViews {
  id: string;
  title: string;
  type: string;
  image?: string;
  views: number;
}

type TimeFilter = 'day' | 'month' | 'year';

const MostViewedMovies = () => {
  const [topMovies, setTopMovies] = useState<MovieWithViews[]>([]);
  const [allMovies, setAllMovies] = useState<MovieWithViews[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');
  const [modalTimeFilter, setModalTimeFilter] = useState<TimeFilter>('day');
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  const getTimeRange = (filter: TimeFilter) => {
    const now = new Date();
    let startDate: Date;
    
    switch (filter) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return startDate.toISOString();
  };

  const fetchData = async (filter: TimeFilter, limit?: number) => {
    try {
      const startDate = getTimeRange(filter);
      const res = await fetch('/api/views');
      if (!res.ok) throw new Error('Failed to fetch views');
      const viewData: ViewData[] = await res.json();

      const filteredViews = viewData.filter(v => new Date(v.viewedAt) >= new Date(startDate));

      const viewCounts = filteredViews.reduce((acc, cur) => {
        if (!acc[cur.productId]) {
          acc[cur.productId] = {
            productId: cur.productId,
            productName: cur.productName,
            imageUrl: cur.imageUrl,
            ips: new Set([cur.ipAddress]),
          };
        } else {
          acc[cur.productId].ips.add(cur.ipAddress);
        }
        return acc;
      }, {} as Record<string, any>);

      const movieIds = Object.keys(viewCounts);
      let moviesData: any[] = [];

      if (movieIds.length > 0) {
        const { data } = await supabase
          .from('movies')
          .select('id, title, type, movie_images(url, label)')
          .in('id', movieIds);
        
        moviesData = data || [];
      }

      const sortedMovies: MovieWithViews[] = Object.values(viewCounts)
        .map((item: any) => {
          const movie = moviesData.find(m => m.id === item.productId);
          return {
            id: item.productId,
            title: movie?.title || item.productName,
            type: movie?.type || 'Movie',
            image: movie?.movie_images?.[0]?.url || item.imageUrl,
            views: item.ips.size,
          };
        })
        .sort((a, b) => b.views - a.views);

      return limit ? sortedMovies.slice(0, limit) : sortedMovies;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const movies = await fetchData(timeFilter, 6);
      setTopMovies(movies);
      setLoading(false);
    };
    loadData();
  }, [timeFilter]);

  const loadAllMovies = async () => {
    const movies = await fetchData(modalTimeFilter);
    setAllMovies(movies);
  };

  useEffect(() => {
    if (showModal) {
      loadAllMovies();
    }
  }, [showModal, modalTimeFilter]);

  if (loading) return <Card><CardContent className="p-6"><div className="text-white">Loading...</div></CardContent></Card>;

  return (
    <>
      <Card className="bg-black border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-white">Most Viewed Movies</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">More</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>All Movies by Views</span>
                    <Select value={modalTimeFilter} onValueChange={(v) => setModalTimeFilter(v as TimeFilter)}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                  {allMovies.map((movie, index) => (
                    <Link
                      key={movie.id}
                      href={`/products/${movie.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-gray-400 font-bold w-8">{index + 1}</span>
                      {movie.image && (
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded border border-gray-700"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{movie.title}</p>
                        <p className="text-xs text-gray-400">{movie.type}</p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">{movie.views}</span>
                      </div>
                    </Link>
                  ))}
                  {allMovies.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No data available</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {topMovies.map((movie) => (
              <Link
                href={`/products/${movie.id}`}
                key={movie.id}
                className="flex-shrink-0 w-36 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              >
                <div className="relative">
                  {movie.image ? (
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                      <span className="text-gray-600">No Image</span>
                    </div>
                  )}
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {movie.views}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-white truncate">{movie.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{movie.type}</p>
                </div>
              </Link>
            ))}
            {topMovies.length === 0 && (
              <p className="text-gray-400 py-8">No movies viewed in this period</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MostViewedMovies;
