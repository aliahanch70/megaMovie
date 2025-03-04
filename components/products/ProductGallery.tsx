'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function ProductGallery({ images, selected, onSelect }: ProductGalleryProps) {
  return (
    <Card className="p-4 space-y-4  ">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={images[selected]}
          alt="Product"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`relative aspect-square overflow-hidden rounded-md ${
              selected === index ? 'ring-2 ring-accent' : ''
            }`}
          >
            <Image
              src={image}
              alt={`Product view ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </Card>
  );
}