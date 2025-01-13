import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/api/products';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';


interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-12 p-10">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="hover-card-effect group">
            <div className="aspect-square relative overflow-hidden rounded-t-lg">
              <Image
                src={product.product_images[0]?.url || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold">
                  ${product.price.toLocaleString()}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((j, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
        ))}
      </div>
    </section>
  );
}
