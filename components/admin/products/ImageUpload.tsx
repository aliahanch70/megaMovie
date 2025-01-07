'use client';

import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  images: Array<{ file: File | string; label: string }>;
  onUpload: (file: File, label: string) => void;
  onRemove: (index: number) => void;
}

const IMAGE_LABELS = [
  'Main View',
  'Side View',
  'Back View',
  'Detail View'
];

export default function ImageUpload({ images, onUpload, onRemove }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const nextLabel = IMAGE_LABELS[images.length];
      if (nextLabel) {
        onUpload(file, nextLabel);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Label>Product Images ({images.length}/4)</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {IMAGE_LABELS.map((label, index) => {
            const image = images[index];
            return (
              <div key={label} className="relative">
                {image ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={typeof image.file === 'string' ? (image.file.startsWith('/') ? image.file : `/${image.file}`) : URL.createObjectURL(image.file)}
                      alt={label}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                      {label}
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full aspect-square"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length !== index}
                  >
                    {label}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}