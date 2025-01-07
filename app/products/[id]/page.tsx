import { getProduct, getAllProductIds } from '@/lib/api/products';
import ProductPageClient from '@/components/products/details/ProductPageClient';

interface ProductDetailsPageProps {
  params: {
    id: string;
  };
}

// Static params for build time generation
export async function generateStaticParams() {
  const ids = await getAllProductIds();
  return ids.map((id) => ({ id }));
}

// Server component that fetches initial data
export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const initialData = await getProduct(params.id);
  return <ProductPageClient id={params.id} initialData={initialData} />;
}