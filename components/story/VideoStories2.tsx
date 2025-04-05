'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface VideoStoriesProps {
  movieId: string;
  movieTitle: string;
}

interface Video {
  id: string;
  name: string;
  url: string;
  movie_id: string;
  movie_title: string;
}

export default function VideoStories({ movieId, movieTitle }: VideoStoriesProps) {
  const [videos, setVideos] = useState<Video[]>([]); // تغییر تایپ به آرایه‌ای از Video
  const [currentIndex, setCurrentIndex] = useState(0); // شاخص ویدیوی فعلی
  const [progress, setProgress] = useState(0); // پیشرفت نوار
  const [isMuted, setIsMuted] = useState(true); // وضعیت صدا (پیش‌فرض بی‌صدا)
  const videoRef = useRef<HTMLVideoElement>(null); // رفرنس ویدیو
  const supabase = createClientComponentClient(); // کلاینت Supabase
  const MAX_DURATION = 60; // حداکثر 1 دقیقه (ثانیه)

  // گرفتن لیست ویدیوها از جدول movie_stories در Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('movie_stories')
          .select('*')
          .eq('movie_id', movieId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('خطا در گرفتن ویدیوها:', error);
          return;
        }

        console.log('ویدیوهای دریافت شده:', data);
        setVideos(data || []);
      } catch (error) {
        console.error('خطا در فچ کردن ویدیوها:', error);
      }
    };

    fetchVideos();
  }, [supabase, movieId]);

  // مدیریت پخش ویدیو
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0) return;

    // تنظیم وضعیت صدا
    video.muted = isMuted;

    const handleLoadedMetadata = () => {
      const duration = video.duration; // مدت زمان ویدیو (ثانیه)
      if (duration > MAX_DURATION) {
        goToNextStory(); // اگر بیشتر از 1 دقیقه بود، برو بعدی
      } else {
        video.play().catch((err) => console.error('Error playing video:', err));
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      setProgress((currentTime / duration) * 100); // پیشرفت بر اساس زمان واقعی
    };

    const handleEnded = () => {
      goToNextStory(); // وقتی ویدیو تموم شد، برو بعدی
    };

    const checkVolume = () => {
      if (video.volume > 0 && isMuted) {
        setIsMuted(false); // اگه ولوم دستگاه بیشتر از 0 باشه، unmute کن
        video.muted = false;
      }
    };


    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, videos, isMuted]);

  // رفتن به ویدیوی بعدی
  const goToNextStory = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      setCurrentIndex(0); // برگشت به اول
      setProgress(0);
    }
  };

  // رفتن به ویدیوی قبلی
  const goToPrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  // کلیک روی صفحه برای جابجایی
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = e.currentTarget.offsetWidth;
    const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left;

    if (clickX < screenWidth / 2) {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };


  // تغییر وضعیت صدا
 const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      video.muted = newMutedState;
      // تنظیم ولوم به یه مقدار پیش‌فرض اگه unmute شد
      if (!newMutedState && video.volume === 0) {
        video.volume = 0.5; // یه مقدار پیش‌فرض برای صدا
      }
    }
  };
  
  if (videos.length === 0) {
    return <div className="text-center p-4"><LoadingSpinner/></div>;
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[80vh] bg-black">
      {/* نوار پیشرفت */}
      <div className="absolute top-0 left-0 w-full flex gap-1 p-2 ">
        {videos.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-400 rounded">
            <div
              className="h-full bg-white transition-all rounded"
              style={{
                width: `${
                  index < currentIndex
                    ? 100
                    : index === currentIndex
                    ? progress
                    : 0
                }%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* پخش‌کننده ویدیو */}
      <div
        className="w-full h-full cursor-pointer"
        onClick={handleScreenClick}
      >
        <video
          ref={videoRef}
          src={videos[currentIndex]?.url} 
          className="w-full h-full object-cover"
          playsInline
        />
      </div>

      {/* نمایش نام ویدیو */}
      <div className="absolute top-6 left-0 right-0 text-center text-white p-2">
        <span className="bg-black bg-opacity-50 px-2 py-1 rounded">
          {videos[currentIndex]?.name}
        </span>
      </div>

      {/* دکمه‌های ناوبری */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            className="text-white"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevStory();
            }}
          >
            ←
          </Button>
        )}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        {currentIndex < videos.length - 1 && (
          <Button
            variant="ghost"
            className="text-white"
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
          >
            →
          </Button>
        )}
      </div>

      {/* دکمه صدا */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="ghost"
          className="text-white"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </Button>
      </div>
    </div>
  );
}