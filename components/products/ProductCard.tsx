import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';


export default function ProductCard( { product }: { product: any }) {
    return (
        <Card className="group hover:bg-neutral-900 duration-300 cursor-pointer border border-gray-700 hover:border-gray-500 transition-all">
            <div className="aspect-[0.8] relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.movie_images[0]?.url}
                    alt={product.title}
                    fill
                    className="object-cover "
                    draggable={false}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate text-white text-xs md:text-lg">
                    {product.title} {`(${product.release})`}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 md:w-5 md:h-5" />
                      <span className="text-yellow-400 text-xs md:text-lg ">
                        {product.imdb !== null ? product.imdb.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className=" text-gray-400 mt-1 truncate md:text-sm text-xs">
                    {product.genres.join(', ')}
                  </p>
                </div>
        </Card>
    );
}