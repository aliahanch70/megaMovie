import { createClient } from '@/lib/supabase/client';

export interface MovieImage {
  url: string;
  label: string;
  order: number;
}

export interface MovieLink {
  title: string;
  url: string;
  quality: string;
  size: string;
  encode: string;
  option_values: { [key: string]: string };
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genres: string[];
  release: string;
  duration: number | null;
  language: string;
  created_at: string;
  movie_images: MovieImage[];
  movie_links: MovieLink[];
  imdb: number | null;
  type: string | null;
  imdb_id: string | null;  
}

export async function getProduct(id: string): Promise<Movie | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('movies')
      .select(`
        id,
        title,
        description,
        genres,
        release,
        duration,
        language,
        created_at,
        movie_images (url, label, order),
        movie_links (title, url, quality, size, encode, option_values),
        imdb,
        type,
        imdb_id
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('خطای Supabase:', error.message, error.details, error.hint);
      return null;
    }

    console.log('داده دریافت‌شده:', data);
    return data as Movie | null;
  } catch (error) {
    console.error('خطا در فچ کردن فیلم:', error);
    return null;
  }
}

export async function getAllProductIds(): Promise<string[]> {
  const supabase = createClient();

  try {
    const { data } = await supabase.from('movies').select('id');
    return (data || []).map((movie) => movie.id);
  } catch (error) {
    console.error('خطا در دریافت IDهای فیلم‌ها:', error);
    return [];
  }
}

export async function getRelatedProducts(
  movieId: string,
  limit: number = 6
): Promise<Movie[]> {
  const supabase = createClient();

  try {
    // گرفتن ژانرهای فیلم فعلی
    const { data: currentMovie, error: currentError } = await supabase
      .from('movies')
      .select('genres')
      .eq('id', movieId)
      .single();

    if (currentError) {
      console.error('خطا در گرفتن ژانرهای فیلم فعلی:', currentError);
      return [];
    }

    if (!currentMovie || !currentMovie.genres?.length) {
      console.log('فیلم فعلی ژانری ندارد یا پیدا نشد:', movieId);
      return [];
    }

    console.log('ژانرهای فیلم فعلی:', currentMovie.genres);

    // پیدا کردن فیلم‌هایی با حداقل یک ژانر مشترک
    const { data: relatedMovies, error: relatedError } = await supabase
      .from('movies')
      .select(`
        id,
        title,
        description,
        genres,
        release,
        duration,
        language,
        created_at,
        movie_images (url, label, order),
        movie_links (title, url, quality, size, encode, option_values)
      `)
      .neq('id', movieId)
      .or(
        currentMovie.genres
          .map((genre : any) => `genres.cs.{${genre}}`) // هر ژانر رو جداگانه چک می‌کنه
          .join(',')
      )
      .limit(limit);

    if (relatedError) {
      console.error('خطا در گرفتن فیلم‌های مرتبط:', relatedError);
      throw relatedError;
    }

    console.log('فیلم‌های مرتبط پیدا‌شده:', relatedMovies);
    return (relatedMovies as Movie[]) || [];
  } catch (error) {
    console.error('خطا در دریافت فیلم‌های مرتبط:', error);
    return [];
  }
}