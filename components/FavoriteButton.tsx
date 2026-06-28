'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  movieId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
}

export default function FavoriteButton({ 
  movieId, 
  size = 'default', 
  variant = 'outline',
  showText = false 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      setUserId(user.id);

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .maybeSingle();

      setIsFavorite(!!data);
    };

    checkFavoriteStatus();
  }, [movieId, supabase]);

  const toggleFavorite = async () => {
    if (!isLoggedIn || !userId) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movieId);

        if (error) {
          console.error('Error removing favorite:', error);
          toast.error('Failed to remove from favorites');
        } else {
          setIsFavorite(false);
          toast.success('Removed from favorites');
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, movie_id: movieId } as any);

        if (error) {
          if ((error as any).code === '23505') {
            toast.info('Already in favorites');
          } else {
            console.error('Error adding favorite:', error);
            toast.error('Failed to add to favorites');
          }
        } else {
          setIsFavorite(true);
          toast.success('Added to favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleFavorite}
      disabled={loading}
      size={size}
      variant={variant}
      className={`${isFavorite ? 'text-red-500 hover:text-red-600' : ''}`}
    >
      <Heart 
        className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${isFavorite ? 'fill-current' : ''}`} 
      />
      {showText && (
        <span className="ml-2">
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  );
}
