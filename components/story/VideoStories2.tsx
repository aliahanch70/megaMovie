'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import  useSWR  from 'swr'; // ایمپورت SWR

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

// تابع واکشی داده برای SWR
const fetchVideos = async (supabase: any, movieId: string): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('movie_stories')
    .select('*')
    .eq('movie_id', movieId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('خطا در گرفتن ویدیوها:', error);
    throw error; // برای اینکه SWR خطا را مدیریت کند، باید آن را throw کنیم
  }

  console.log('ویدیوهای دریافت شده:', data);
  return data || [];
};

export default function VideoStories({ movieId, movieTitle }: VideoStoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClientComponentClient();
  const MAX_DURATION = 60;
  const [isAdmin, setIsAdmin] = useState(false); // وضعیت برای نشان دادن ادمین بودن کاربر

  // بررسی نقش کاربر برای نمایش دکمه‌های ویرایش و حذف
  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.log('کاربری وارد نشده یا خطا در گرفتن کاربر:', userError.message);
        return;
      }
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('خطا در گرفتن نقش کاربر:', profileError.message);
        } else {
          setIsAdmin(profile?.role === 'admin');
        }
      } else {
        setIsAdmin(false); // اگر کاربری وارد نشده باشد، ادمین نیست
      }
    };

    checkAdminRole();
  }, [supabase]);

  // استفاده از useSWR برای واکشی ویدیوها
  const { data: videos, error, isLoading, mutate } = useSWR<Video[], Error>(
    movieId ? ['movie_stories', movieId] : null, // کلید SWR، اگر movieId وجود داشته باشد
    () => fetchVideos(supabase, movieId),
    {
      revalidateOnFocus: false, // عدم واکشی مجدد هنگام فوکوس شدن
      // می‌توانید تنظیمات کش و revalidation دیگری را در اینجا اضافه کنید
    }
  );

  // مدیریت پخش ویدیو (بدون تغییرات عمده)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videos || videos.length === 0) return;

    video.muted = isMuted;

    const handleLoadedMetadata = () => {
      const duration = video.duration;
      if (duration > MAX_DURATION) {
        goToNextStory();
      } else {
        video.play().catch((err) => console.error('Error playing video:', err));
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      setProgress((currentTime / duration) * 100);
    };

    const handleEnded = () => {
      goToNextStory();
    };

    const checkVolume = () => {
      if (video.volume > 0 && isMuted) {
        setIsMuted(false);
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

  const goToNextStory = () => {
    if (videos && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else if (videos) {
      setCurrentIndex(0);
      setProgress(0);
    }
  };

  const goToPrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
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
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      video.muted = newMutedState;
      if (!newMutedState && video.volume === 0) {
        video.volume = 0.5;
      }
    }
  };

  const handleEditStory = (storyId: string) => {
    console.log(`ویرایش استوری با ID: ${storyId}`);
    // در اینجا می‌توانید منطق ویرایش استوری را پیاده‌سازی کنید
    // احتمالاً باز کردن یک مودال یا رفتن به یک صفحه ویرایش
  };

  const handleDeleteStory = async (storyId: string) => {
    const confirmDelete = window.confirm('آیا مطمئن هستید که می‌خواهید این استوری را حذف کنید؟');
    if (confirmDelete) {
      try {
        const { error: deleteError } = await supabase
          .from('movie_stories')
          .delete()
          .eq('id', storyId);

        if (deleteError) {
          console.error('خطا در حذف استوری:', deleteError);
          // نمایش پیام خطا به کاربر
        } else {
          console.log('استوری با موفقیت حذف شد.');
          // واکشی مجدد لیست ویدیوها برای به‌روزرسانی UI
          mutate();
          // اگر استوری حذف شده، ممکن است نیاز به تنظیم currentIndex باشد
          if (videos && videos.length > 1 && currentIndex >= videos.length - 1) {
            setCurrentIndex(videos.length - 2);
          } else if (videos && videos.length === 1) {
            // اگر آخرین استوری حذف شد، ممکن است نیاز به هندل کردن این وضعیت باشد
          }
        }
      } catch (error) {
        console.error('خطا در حذف استوری:', error);
        // نمایش پیام خطای کلی به کاربر
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-4"><LoadingSpinner /></div>;
  }

  if (error) {
    console.error('خطا در بارگیری ویدیوها:', error);
    return <div className="text-center p-4">خطا در بارگیری ویدیوها.</div>;
  }

  if (!videos || videos.length === 0) {
    return <div className="text-center p-4">ویدیویی برای این فیلم وجود ندارد.</div>;
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

      {/* نمایش نام ویدیو و دکمه‌های مدیریت */}
      <div className="absolute top-6 left-0 right-0 text-center text-white p-2 flex flex-col items-center">
        <span className="bg-black bg-opacity-50 px-2 py-1 rounded">
          {videos[currentIndex]?.name}
        </span>
        {isAdmin && videos[currentIndex]?.id && (
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => handleEditStory(videos[currentIndex].id)}>
              ویرایش
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteStory(videos[currentIndex].id)}>
              حذف
            </Button>
          </div>
        )}
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
        {videos && currentIndex < videos.length - 1 && (
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