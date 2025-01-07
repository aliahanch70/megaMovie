'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/products/ProductForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function AdminProductsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          category: formData.get('category'),
          status: formData.get('status'),
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Handle external links
      const links = JSON.parse(formData.get('links') as string);
      if (links.length > 0) {
        await supabase.from('product_links').insert(
          links.map((link: any) => ({
            product_id: data.id,
            title: link.title,
            url: link.url
          }))
        );
      }

      // Handle images
      const images = JSON.parse(formData.get('images') as string);
      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((image: any, index: number) => ({
            product_id: data.id,
            url: image.url.startsWith('/') ? image.url.substring(1) : image.url,
            label: image.label,
            order: index
          }))
        );
      }

      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Product</CardTitle>
          </CardHeader>
          <ProductForm onSubmit={handleSubmit} loading={loading} />
        </Card>
      </div>
    </div>
  );
}