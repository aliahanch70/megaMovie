'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProductForm from '@/components/admin/products/ProductForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { forEach, forIn } from 'lodash';
import { ifError } from 'node:assert';

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProduct = async () => {
      // First fetch the product with all related data
      const { data: productData } = await supabase
        .from('products')
        .select(`
          *,
          product_images (url, label, order),
          product_specifications (category, label, value),
          product_options (name, values)
        `)
        .eq('id', params.id)
        .single();

      // Then fetch links with their option values
      const { data: linksData } = await supabase
        .from('product_links')
        .select(`
          *,
          option_values
        `)
        .eq('product_id', params.id);

      if (productData && linksData) {
        // Combine the data
        setInitialData({
          ...productData,
          product_links: linksData.map(link => ({
            ...link,
            optionValues: link.option_values // Map option_values to optionValues for consistency
          }))
        });
        console.log('Fetched data:', {
          product: productData,
          links: linksData
        });
      }
    };

    fetchProduct();
  }, [params.id, supabase]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          category: formData.get('category'),
          status: formData.get('status'),
        })
        .eq('id', params.id);

      if (error) throw error;

      // Handle options update
      const options = JSON.parse(formData.get('options') as string);
      await supabase
        .from('product_options')
        .delete()
        .eq('product_id', params.id);

      if (options.length > 0) {
        await supabase.from('product_options').insert(
          options.map((option: any) => ({
            product_id: params.id,
            name: option.name,
            values: option.values
          }))
        );
      }

      // Handle links with options
      const links = JSON.parse(formData.get('links') as string);
      await supabase
        .from('product_links')
        .delete()
        .eq('product_id', params.id);

      if (links.length > 0) {
        await supabase.from('product_links').insert(
          links.map((link: any) => ({
            product_id: params.id,
            title: link.title,
            url: link.url,
            price: Number(link.price) || 0,
            city: link.city || '',
            warranty: link.warranty || '',
            option_values: link.optionValues || null
          }))
        );
      }

      // Handle images update
      const images = JSON.parse(formData.get('images') as string);
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', params.id);

      await supabase.from('product_images').insert(
        images.map((image: any, index: number) => ({
          product_id: params.id,
          url: image.url.startsWith('/') ? image.url.substring(1) : image.url,
          label: image.label,
          order: index
        }))
      );

      // Handle specifications update
      const specifications = JSON.parse(formData.get('specifications') as string);
      await supabase
        .from('product_specifications')
        .delete()
        .eq('product_id', params.id);

      if (specifications.length > 0) {
        await supabase.from('product_specifications').insert(
          specifications.map((spec: any) => ({
            product_id: params.id,
            category: spec.category,
            label: spec.label,
            value: spec.value
          }))
        );
      }

      toast.success('Successfully saved!');
      router.refresh;

    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to save changes');
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
              <CardTitle>Loading...</CardTitle>
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
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <ProductForm 
            onSubmit={handleSubmit} 
            loading={loading}
            initialData={initialData}
          />
        </Card>
      </div>
    </div>
  );
}