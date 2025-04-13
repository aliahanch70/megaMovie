import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/lib/api/products';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface RelatedProductsProps {
  products: Movie[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="m-2 md:mx-12">
      <h2 className="text-2xl font-bold mb-6">فیلم‌های مرتبط</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex  gap-2 min-w-full md:min-w-0">
          {products.map((product) => (
            <Link key={product.id} href={`/movie/${product.id}`}>
              <Card className="group w-[180px] shrink-0 md:w-[250px] gap-1 ">
                <div className="aspect-[0.8] relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.movie_images[0]?.url || '/placeholder.png'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{product.title} ({product.release || 'نامشخص'})</h3>
                  <div className="flex items-center justify-between mt-2">
                    
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 md:w-5 md:h-5" />
                      <span className="text-yellow-400 text-xs md:text-lg ">
                        {product.imdb !== null ? product.imdb.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {product.genres?.join(', ') || 'بدون ژانر'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}