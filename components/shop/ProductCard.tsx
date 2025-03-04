'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <Link href={`/shop/${id}`}>
      <Card className="overflow-hidden   group">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{name}</h3>
          <p className="text-lg font-bold text-accent mt-2">
            ${price.toLocaleString()}
          </p>
        </div>
      </Card>
    </Link>
  );
}

ProductCard.Skeleton = function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    </Card>
  );
};