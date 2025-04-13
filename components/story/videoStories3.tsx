'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import useSWR from 'swr';
import Link from 'next/link';

interface Video {
  id: string;
  name: string;
  url: string;
  movie_id: string;
  description?: string;
  likes?: number;
  liked_by?: string[];
  movie_title?: string;
  image_url?: string | null; // اضافه کردن image_url به اینترفیس
}

interface MovieImage {
  movie_id: string;
  url: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const fetchVideosAndImages = async (supabase: any): Promise<Video[]> => {
  // گرفتن همه ویدیوها از movie_stories
  const { data: videos, error: videoError } = await supabase
    .from('movie_stories')
    .select('id, name, url, movie_id, movie_title, description, likes, liked_by');

  if (videoError) {
    console.error('خطا در گرفتن ویدیوها:', videoError);
    throw videoError;
  }

  if (!videos || videos.length === 0) return [];

  // گرفتن عکس‌ها از movie_images
  const movieIds = videos.map((video: Video) => video.movie_id);
  const { data: images, error: imageError } = await supabase
    .from('movie_images')
    .select('movie_id, url')
    .in('movie_id', movieIds);

  if (imageError) {
    console.error('خطا در گرفتن عکس‌ها:', imageError);
    throw imageError;
  }

  // ایجاد یک مپ از عکس‌ها برای هر movie_id
  const imageMap = new Map<string, string>();
  images?.forEach((image: MovieImage) => {
    // فقط اولین عکس برای هر movie_id را نگه دارید
    if (!imageMap.has(image.movie_id)) {
      imageMap.set(image.movie_id, image.url);
    }
  });

  // ادغام داده‌ها و اضافه کردن image_url به همه ویدیوها
  return videos.map((video: Video) => ({
    ...video,
    image_url: imageMap.get(video.movie_id) || null, // اگر عکسی نبود null قرار دهید
  }));
};

export default function VideoStories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClientComponentClient();

  const { data: videos, error, isLoading } = useSWR<Video[], Error>(
    'movie_stories',
    () => fetchVideosAndImages(supabase),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const checkUserLikeStatus = async () => {
      if (videos && videos[currentIndex]) {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const currentVideo = videos[currentIndex];
        setLikeCount(currentVideo.likes || 0);
        setLiked(userId && currentVideo.liked_by?.includes(userId) || false);
      }
    };
    checkUserLikeStatus();
  }, [currentIndex, videos, supabase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videos || videos.length === 0) return;

    video.muted = isMuted;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      setProgress((currentTime / duration) * 100);
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(err => console.error('خطا در پخش ویدیو:', err));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    if (video.paused) {
      video.play().catch(err => console.error('خطا در پخش ویدیو:', err));
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, videos, isMuted]);

  const goToNextStory = () => {
    if (videos && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (videos) {
      setCurrentIndex(0);
    }
  };

  const goToPrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = e.currentTarget.offsetWidth;
    const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left;

    if (clickX < screenWidth / 2) {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      setIsMuted(!isMuted);
      video.muted = !isMuted;
    }
  };

  const handleLike = async () => {
    if (!videos || !videos[currentIndex]) return;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      alert('لطفاً ابتدا وارد شوید!');
      return;
    }

    const currentVideo = videos[currentIndex];
    const likedBy = currentVideo.liked_by || [];
    const hasLiked = likedBy.includes(userId);

    let newLikedBy: string[];
    let newLikeCount: number;

    if (hasLiked) {
      newLikedBy = likedBy.filter(id => id !== userId);
      newLikeCount = (currentVideo.likes || 0) - 1;
      setLiked(false);
    } else {
      newLikedBy = [...likedBy, userId];
      newLikeCount = (currentVideo.likes || 0) + 1;
      setLiked(true);
    }

    setLikeCount(newLikeCount);

    const { error } = await supabase
      .from('movie_stories')
      .update({ likes: newLikeCount, liked_by: newLikedBy })
      .eq('id', currentVideo.id);

    if (error) console.error('خطا در آپدیت لایک:', error);
  };

  if (isLoading) return <div className="text-center p-4"><LoadingSpinner /></div>;
  if (error) return <div className="text-center p-4 text-red-500">خطا در بارگیری ویدیوها</div>;
  if (!videos || videos.length === 0) return <div className="text-center p-4 text-white">ویدیویی وجود ندارد</div>;

  return (
    <div className="relative w-full max-w-md mx-auto h-[80vh] bg-black rounded-lg overflow-hidden">
      {/* ویدیو */}
      <div className="w-full h-full" onClick={handleScreenClick}>
        <video
          ref={videoRef}
          src={videos[currentIndex].url}
          className="w-full h-full object-cover"
          playsInline
        />
      </div>

      {/* نوار پیشرفت در پایین */}
      <div className="absolute top-8 left-2 right-2 h-1 bg-gray-600 rounded">
        <div
          className="h-full bg-white rounded transition-all transform duration-300"
          style={{ width: `${progress}%` }}
        />
        
      </div>

      {/* دکمه لایک در پایین */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <button onClick={e => { e.stopPropagation(); handleLike(); }} className="flex items-center gap-1">
          <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          <span className="text-white text-sm">{likeCount}</span>
        </button>
      </div>

      {/* دکمه صدا */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="ghost"
          onClick={e => { e.stopPropagation(); toggleMute(); }}
          className="text-white"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </Button>
      </div>

      {/* عکس و نام فیلم با لینک */}
      <div className="absolute bottom-24 left-4 right-14 flex items-center gap-2 text-white">
        <Link href={`/movie/${videos[currentIndex].movie_id}`} className="flex items-center gap-2">
          {videos[currentIndex].image_url ? (
            <img
              src={videos[currentIndex].image_url}
              alt={videos[currentIndex].name}
              className="w-10 h-10 rounded-full object-cover "
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-white text-sm">N/A</span>
            </div>
          )}
          <span className="text-lg font-semibold truncate">{videos[currentIndex].movie_title}</span>
        </Link>
      </div>

      {/* توضیحات */}
      <div className="absolute bottom-14 left-4 right-14 text-white">
        <p className="text-sm">{videos[currentIndex].name || 'بدون توضیحات'}</p>
      </div>
    </div>
  );
}