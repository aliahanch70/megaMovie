'use client';

import { useEffect } from 'react';

export default function ColorExtractor({
  imageUrl,
  onColors,
}: {
  imageUrl: string;
  onColors?: (colors: string[]) => void;
}) {
  useEffect(() => {
    const fetchColors = async () => {
      // چک کردن localStorage
      const cachedColors = localStorage.getItem(imageUrl);
      if (cachedColors) {
        const colors = JSON.parse(cachedColors);
        console.log('رنگ‌ها از حافظه لود شدن:', colors);
        if (onColors) {
          onColors(colors);
        }
        return; // اگه توی حافظه بود، دیگه درخواست نمی‌فرستیم
      }

      // اگه توی حافظه نبود، از سرور می‌گیریم
      const res = await fetch('/api/get-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await res.json();

      if (Array.isArray(data.colors) && data.colors.length > 0) {
        const hexColors = data.colors.map(([r, g, b]: [number, number, number]) =>
          rgbToHex(r, g, b)
        );
        if (onColors) {
          onColors(hexColors);
        }
      }
    };

    fetchColors();
  }, [imageUrl, onColors]);

  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}