import { createClient } from '@/lib/supabase/client';

export interface ProductImage {
  url: string;
  label: string;
  order: number;
}

export interface ProductLink {
  title: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'in_stock' | 'out_of_stock';
  created_at: string;
  product_images: ProductImage[];
  product_links: ProductLink[];
  profiles: {
    full_name: string;
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = createClient();
  
  try {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        product_images (url, label, order),
        product_links (title, url),
        profiles (full_name)
      `)
      .eq('id', id)
      .single();
    
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getAllProductIds(): Promise<string[]> {
  const supabase = createClient();
  
  try {
    const { data } = await supabase
      .from('products')
      .select('id');
    
    return (data || []).map(product => product.id);
  } catch (error) {
    console.error('Error fetching product IDs:', error);
    return [];
  }
}