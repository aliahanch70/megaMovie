'use client';

import { useEffect, useState } from 'react';
import { getProduct, type Movie } from '@/lib/api/products';
import ProductDetails from './ProductDetails';
import ProductNotFound from './ProductNotFound';
import ProductLoading from './ProductLoading';
import RelatedProducts from '@/components/products/RelatedProducts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoStories from '@/components/story/VideoStories2';
import VideoUpload from '@/components/VideoUpload';

interface ProductPageClientProps {
  id: string;
  initialData: Movie | null;
  relatedProducts: Movie[];
  isAdmin: boolean;
}

export default function ProductPageClient({
  id,
  initialData,
  relatedProducts,
  isAdmin,
}: ProductPageClientProps) {
  const [product, setProduct] = useState<Movie | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!initialData) {
      const loadProduct = async () => {
        const data = await getProduct(id);
        setProduct(data);
        setLoading(false);
      };

      loadProduct();
    }
  }, [initialData, id]);

  if (loading) {
    return <ProductLoading />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="p-4">
      {isAdmin && (
        <>
          <Link href={`/admin/products/edit/${id}`}>
            <Button variant="outline" size="icon" className="mb-4">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setUploadOpen(true)}
            className="mb-4 ml-2"
          >
            آپلود ویدیو
          </Button>
        </>
      )}

      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="mb-4 ml-2"
      >
        نمایش ویدیوهای کوتاه
      </Button>

      <ProductDetails id={id} initialData={product} />
      <RelatedProducts products={relatedProducts} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>ویدیوهای کوتاه</DialogTitle>
          </DialogHeader>
          <VideoStories movieId={id} movieTitle={product.title} />
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>آپلود ویدیو جدید</DialogTitle>
          </DialogHeader>
          <VideoUpload 
            movieId={id} 
            movieTitle={product.title}
            onSuccess={() => {
              setUploadOpen(false);
              // Optionally refresh the video list
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}