'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Eye, Sparkles } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  type: string;
  genres: string[];
  imdb?: number;
  release?: number;
  movie_images?: { url: string; label: string }[];
}

interface Favorite {
  movie_id: string;
}

interface ViewHistory {
  productId: string;
  viewedAt: string;
  productName: string;
}

export default function UserRecommendations({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [viewHistory, setViewHistory] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch favorites
        const { data: favData } = await supabase
          .from('favorites')
          .select('movie_id')
          .eq('user_id', userId)
          .returns<Favorite[]>();

        if (favData && favData.length > 0) {
          const { data: favMovies } = await supabase
            .from('movies')
            .select('id, title, type, genres, imdb, release, movie_images(url, label)')
            .in('id', favData.map(f => f.movie_id))
            .limit(6);
          setFavorites(favMovies || []);
        }

        // Fetch view history
        const viewRes = await fetch('/api/views');
        const allViews: ViewHistory[] = await viewRes.json();
        const userViews = allViews
          .filter(v => v.productId)
          .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
          .slice(0, 10);

        const viewedIds = Array.from(new Set(userViews.map(v => v.productId)));
        
        if (viewedIds.length > 0) {
          const { data: viewedMovies } = await supabase
            .from('movies')
            .select('id, title, type, genres, imdb, release, movie_images(url, label)')
            .in('id', viewedIds);
          setViewHistory(viewedMovies || []);

          // Generate smart recommendations
          await generateRecommendations(viewedMovies || [], favData?.map(f => f.movie_id) || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, supabase]);

  const generateRecommendations = async (viewedMovies: Movie[], favoriteIds: string[]) => {
    try {
      // Extract genres from viewed and favorite movies
      const genreCounts: Record<string, number> = {};
      viewedMovies.forEach(movie => {
        movie.genres?.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });

      // Get top 3 genres
      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre);

      if (topGenres.length === 0) return;

      // Fetch movies with similar genres
      const { data: recommendedMovies } = await supabase
        .from('movies')
        .select('id, title, type, genres, imdb, release, movie_images(url, label)')
        .contains('genres', topGenres)
        .not('id', 'in', `(${[...viewedMovies.map(m => m.id), ...favoriteIds].join(',')})`)
        .order('imdb', { ascending: false, nullsFirst: false })
        .limit(12);

      setRecommendations(recommendedMovies || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <Link
      href={`/products/${movie.id}`}
      className="flex-shrink-0 w-40 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
    >
      <div className="relative">
        {movie.movie_images?.[0]?.url ? (
          <img
            src={movie.movie_images[0].url}
            alt={movie.title}
            className="w-full h-56 object-cover rounded-lg border border-gray-700"
          />
        ) : (
          <div className="w-full h-56 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
            <span className="text-gray-600 text-xs">No Image</span>
          </div>
        )}
        {movie.imdb && (
          <span className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded font-bold">
            ⭐ {movie.imdb}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="font-semibold text-white text-sm truncate">{movie.title}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-400 text-xs">{movie.type}</p>
          <p className="text-gray-500 text-xs">{movie.release}</p>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {movie.genres?.slice(0, 2).map(genre => (
            <span key={genre} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <Card className="bg-black border-gray-800">
        <CardContent className="p-6">
          <div className="text-white">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Your Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-800">
              <Sparkles className="w-4 h-4 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">
              <Eye className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-gray-800">
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="mt-4">
            {recommendations.length > 0 ? (
              <div>
                <p className="text-sm text-gray-400 mb-4">Based on your viewing history and favorites</p>
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {recommendations.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Start watching movies to get personalized recommendations</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {viewHistory.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {viewHistory.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No viewing history yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            {favorites.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {favorites.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No favorites yet. Start adding movies to your favorites!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
