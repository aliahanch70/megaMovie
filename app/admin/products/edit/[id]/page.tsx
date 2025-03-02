'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProductForm from '@/components/admin/products/ProductForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface ProductEditPageProps {
  params: Promise<{ id: string }>; // Updated to reflect Next.js 15+ behavior
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: string;
  product_images: { url: string; label: string; order: number }[];
  product_specifications: { category: string; label: string; value: string }[];
  product_options: { name: string; values: string[] }[];
  product_links: {
    title: string;
    url: string;
    price: number;
    city: string;
    warranty: string;
    optionValues: any; // Consider defining a more specific type if possible
  }[];
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ProductData | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Resolve the params Promise
        const { id } = await params;
        console.log('Product ID:', id);

        // Fetch the product with all related data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            product_images (url, label, order),
            product_specifications (category, label, value),
            product_options (name, values)
          `)
          .eq('id', id)
          .single();

        if (productError) throw productError;

        // Fetch links with their option values
        const { data: linksData, error: linksError } = await supabase
          .from('product_links')
          .select(`
            *,
            option_values
          `)
          .eq('product_id', id);

        if (linksError) throw linksError;

        if (productData && linksData) {
          // Combine the data
          const combinedData: ProductData = {
            ...productData,
            product_links: linksData.map(link => ({
              ...link,
              optionValues: link.option_values, // Map option_values to optionValues
            })),
          };
          setInitialData(combinedData);
          console.log('Fetched data:', {
            product: productData,
            links: linksData,
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product data');
      }
    };

    fetchProduct();
  }, [params, supabase]); // Dependencies updated to include params and supabase

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { id } = await params; // Resolve params here too for consistency

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          price: parseFloat(formData.get('price') as string),
          category: formData.get('category') as string,
          status: formData.get('status') as string,
        })
        .eq('id', id);

      if (error) throw error;

      // Handle options update
      const options = JSON.parse(formData.get('options') as string);
      await supabase.from('product_options').delete().eq('product_id', id);

      if (options.length > 0) {
        await supabase.from('product_options').insert(
          options.map((option: any) => ({
            product_id: id,
            name: option.name,
            values: option.values,
          }))
        );
      }

      // Handle links with options
      const links = JSON.parse(formData.get('links') as string);
      await supabase.from('product_links').delete().eq('product_id', id);

      if (links.length > 0) {
        await supabase.from('product_links').insert(
          links.map((link: any) => ({
            product_id: id,
            title: link.title,
            url: link.url,
            price: Number(link.price) || 0,
            city: link.city || '',
            warranty: link.warranty || '',
            option_values: link.optionValues || null,
          }))
        );
      }

      // Handle images update
      const images = JSON.parse(formData.get('images') as string);
      await supabase.from('product_images').delete().eq('product_id', id);

      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((image: any, index: number) => ({
            product_id: id,
            url: image.url.startsWith('/') ? image.url.substring(1) : image.url,
            label: image.label,
            order: index,
          }))
        );
      }

      // Handle specifications update
      const specifications = JSON.parse(formData.get('specifications') as string);
      await supabase.from('product_specifications').delete().eq('product_id', id);

      if (specifications.length > 0) {
        await supabase.from('product_specifications').insert(
          specifications.map((spec: any) => ({
            product_id: id,
            category: spec.category,
            label: spec.label,
            value: spec.value,
          }))
        );
      }

      toast.success('Successfully saved!');
      router.refresh();
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
          <ProductForm onSubmit={handleSubmit} loading={loading} initialData={initialData} />
        </Card>
      </div>
    </div>
  );
}