'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/format';
import { Star } from 'lucide-react';
import ColorExtractor from '@/components/ColorExtractor';

import { useState } from 'react';


interface ProductHeaderProps {
  name: string;
  release: string;
  imdb: number ;
  images?: string;
}

const getRatingColor = (imdb: number | null): string => {
  if (imdb === null) return 'text-gray-500'; // اگه imdb null باشه، خاکستری
  if (imdb >= 7.5) return 'text-green-500';
  if (imdb >= 5) return 'text-orange-500';
  return 'text-red-500';
};



export default function ProductHeader({ name, imdb ,images,  release }: ProductHeaderProps) {
  const [selectedColor, setSelectedColor] = useState('#ffffff'); // رنگ پیش‌فرض سفید
  return (
    <Card className="p-6  ">
    <div style={{ '--from-color': selectedColor } as React.CSSProperties}>
    <ColorExtractor
        imageUrl={images || '/placeholder.png'}
        onColors={(colors) => {
          if (colors.length > 0) {
            const firstColor = colors[0];
            console.log('رنگ انتخاب‌شده به صورت خودکار:', firstColor);
            setSelectedColor(firstColor);
            // ذخیره رنگ‌ها توی localStorage
            localStorage.setItem(images || '/placeholder.png', JSON.stringify(colors));
          }
        }}
      />
    
      
       
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <h1 
  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--from-color)] to-primary transition-all duration-1000 ease-out" 
  style={{ backgroundImage: 'linear-gradient(to right, var(--from-color), hsl(var(--primary)))' }}
>
        {name} ({release})      
    </h1>

    {/* <div style={{ '--test-color': '#ff0000' }}>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--test-color)] to-primary">
        تست گرادیانت
      </h1>
    </div> */}

    <div className="flex items-center gap-4">
      <span className="text-lg font-bold">
        <div className="flex items-center gap-1 text-2xl">
          <Star className="w-4 h-5 fill-yellow-400 text-yellow-400 " />
          <span className={getRatingColor(imdb)}>
            {imdb !== null ? imdb: 'N/A'}
          </span>
        </div>
      </span>
      {/* <Badge variant={status === 'in_stock' ? 'default' : 'destructive'}>
        {status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
      </Badge> */}
    </div>
  </div>
  </div>
</Card>
  );
}