'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/products/ProductForm'; // تغییر مسیر به MovieForm
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

function AdminMoviesContent() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // درج اطلاعات اصلی فیلم
      const { data, error } = await supabase
        .from('movies') // تغییر به جدول movies
        .insert([
          {
            title: formData.get('title'),
            description: formData.get('description'),
            release: parseInt(formData.get('release') as string),
            genres: JSON.parse(formData.get('genres') as string), // آرایه ژانرها
            director: formData.get('director'),
            duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : null,
            language: formData.get('language'),
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const movieId = data.id;

      // درج بازیگران (cast)
      const cast = JSON.parse(formData.get('cast') as string);
      if (cast.length > 0) {
        await supabase.from('movie_cast').insert(
          cast.map((member: any) => ({
            movie_id: movieId,
            name: member.name,
            role: member.role,
          }))
        );
      }

      // درج لینک‌های دانلود
      const links = JSON.parse(formData.get('links') as string);
      if (links.length > 0) {
        await supabase.from('movie_links').insert(
          links.map((link: any) => ({
            movie_id: movieId,
            title: link.title,
            url: link.url,
            quality: link.quality,
            size: link.size,
            encode: link.encode,
            option_values: link.optionValues || {}, // گزینه‌های مرتبط با لینک
          }))
        );
      }

      // درج گزینه‌ها (options)
      const options = JSON.parse(formData.get('options') as string);
      if (options.length > 0) {
        await supabase.from('movie_options').insert(
          options.map((option: any) => ({
            movie_id: movieId,
            name: option.name,
            values: option.values,
          }))
        );
      }

      // درج متاتگ‌ها
      const metaTags = JSON.parse(formData.get('meta_tags') as string);
      if (metaTags.length > 0) {
        await supabase.from('movie_meta_tags').insert(
          metaTags.map((tag: any) => ({
            movie_id: movieId,
            key: tag.key,
            value: tag.value,
          }))
        );
      }

      // درج تصاویر
      const images = JSON.parse(formData.get('images') as string);
      if (images.length > 0) {
        await supabase.from('movie_images').insert(
          images.map((image: any, index: number) => ({
            movie_id: movieId,
            url: image.url.startsWith('/') ? image.url.substring(1) : image.url,
            label: image.label,
            order: index,
          }))
        );
      }

    } catch (error) {
      console.error('Error creating movie:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Movie</CardTitle>
          </CardHeader>
          <ProductForm onSubmit={handleSubmit} loading={loading} />
        </Card>
      </div>
    </div>
  );
}

export default function AdminMoviesPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <AdminMoviesContent />
    </Suspense>
  );
}