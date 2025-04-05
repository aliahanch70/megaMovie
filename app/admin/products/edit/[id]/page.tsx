'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProductForm from '@/components/admin/products/ProductForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface ProductEditPageProps {
  params: Promise<{ id: string }>; // سازگار با Next.js 15+
}

interface MovieData {
  id: string;
  title: string; // به جای name
  description: string;
  director: string;
  genres: string[]; // به جای category
  release: string; // جایگزین price
  duration: number | null;
  language: string;
  movie_images: { url: string; label: string; order: number }[];
  movie_options: { name: string; values: string[] }[];
  movie_links: {
    title: string;
    url: string;
    quality: string;
    size: string;
    encode: string;
    optionValues: { [key: string]: string }; // تغییر نام از option_values
  }[];
  imdb?: number | null; // اضافه کردن imdb
  type?: string; // اضافه کردن type
  imdb_id?: string; // اضافه کردن imdb_id
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<MovieData | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { id } = await params;
        console.log('شناسه فیلم:', id);

        // گرفتن اطلاعات فیلم
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .select(`
            id,
            title,
            description,
            director,
            genres,
            release,
            duration,
            language,
            movie_images (url, label, order),
            movie_options (name, values),
            imdb,
            type,
            imdb_id
          `)
          .eq('id', id)
          .single();

        if (movieError) throw movieError;

        // گرفتن لینک‌ها
        const { data: linksData, error: linksError } = await supabase
          .from('movie_links')
          .select(`
            title,
            url,
            quality,
            size,
            encode,
            option_values
          `)
          .eq('movie_id', id);

        if (linksError) throw linksError;

        if (movieData && linksData) {
          const combinedData: MovieData = {
            ...movieData,
            movie_links: linksData.map((link) => ({
              ...link,
              optionValues: link.option_values || {}, // تطبیق نام
            })),
          };
          setInitialData(combinedData);
          console.log('داده‌های دریافت‌شده:', {
            movie: movieData,
            links: linksData,
          });
        }
      } catch (error) {
        console.error('خطا در دریافت اطلاعات فیلم:', error);
        toast.error('خطا در بارگذاری اطلاعات فیلم');
      }
    };

    fetchMovie();
  }, [params, supabase]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { id } = await params;

      // آپدیت اطلاعات اصلی فیلم
      const { error: updateError } = await supabase
        .from('movies')
        .update({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          genres: JSON.parse(formData.get('genres') as string),
          release: formData.get('release') as string,
          director: formData.get('director') as string,
          duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : null,
          language: formData.get('language') as string,
          imdb: formData.get('imdb') ? parseFloat(formData.get('imdb') as string) : null,
          type: formData.get('type') as string,
          imdb_id: formData.get('imdbId') as string,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // آپدیت گزینه‌ها
      const options = JSON.parse(formData.get('options') as string);
      await supabase.from('movie_options').delete().eq('movie_id', id);
      if (options.length > 0) {
        await supabase.from('movie_options').insert(
          options.map((option: any) => ({
            movie_id: id,
            name: option.name,
            values: option.values,
          }))
        );
      }

      // آپدیت لینک‌ها
      const links = JSON.parse(formData.get('links') as string);
      await supabase.from('movie_links').delete().eq('movie_id', id);
      if (links.length > 0) {
        await supabase.from('movie_links').insert(
          links.map((link: any) => ({
            movie_id: id,
            title: link.title,
            url: link.url,
            quality: link.quality || '',
            size: link.size || '',
            encode: link.encode || '',
            option_values: link.optionValues || {},
          }))
        );
      }

      // آپدیت تصاویر
      const images = JSON.parse(formData.get('images') as string);
      await supabase.from('movie_images').delete().eq('movie_id', id);
      if (images.length > 0) {
        await supabase.from('movie_images').insert(
          images.map((image: any, index: number) => ({
            movie_id: id,
            url: image.url.startsWith('/') ? image.url.substring(1) : image.url,
            label: image.label,
            order: index,
          }))
        );
      }

      // آپدیت مشخصات
      // const specifications = JSON.parse(formData.get('specifications') as string);
      // await supabase.from('movie_specifications').delete().eq('movie_id', id);
      // if (specifications.length > 0) {
      //   await supabase.from('movie_specifications').insert(
      //     specifications.map((spec: any) => ({
      //       movie_id: id,
      //       label: spec.label,
      //       value: spec.value,
      //     }))
      //   );
      // }

      toast.success('با موفقیت ذخیره شد!');
      router.refresh();
    } catch (error) {
      console.error('خطا در آپدیت فیلم:', error);
      toast.error('خطا در ذخیره تغییرات');
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>در حال بارگذاری...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ویرایش فیلم</CardTitle>
          </CardHeader>
          <ProductForm onSubmit={handleSubmit} loading={loading} initialData={initialData} />
        </Card>
      </div>
    </div>
  );
}