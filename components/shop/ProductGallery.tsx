'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ProductImage {
  url: string;
  label: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Card className="p-4 space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={images[selectedImage]?.url || '/placeholder.png'}
          alt={images[selectedImage]?.label || 'Product image'}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-square overflow-hidden rounded-md transition-all ${
              selectedImage === index 
                ? 'ring-2 ring-accent' 
                : 'hover:ring-2 hover:ring-accent/50'
            }`}
          >
            <Image
              src={image.url}
              alt={image.label}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </Card>
  );
}