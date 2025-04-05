import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

// تبدیل RGB به HSL برای تشخیص بهتر رنگ‌های زنده
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100]; // Hue (0-360), Saturation (0-100), Lightness (0-100)
}

function isVividColor([r, g, b]: [number, number, number]): boolean {
  const [_, s, l] = rgbToHsl(r, g, b);
  // رنگ زنده: saturation بالا و lightness متعادل
  return s > 50 && l > 30 && l < 80;
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'inside' }) // بهینه‌تر با fit: 'inside'
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = data;
    const step = 3; // RGB
    const sampleStep = 4; // نمونه‌برداری: هر ۴ پیکسل یکبار

    const colorCounts: Record<string, number> = {};
    for (let i = 0; i < pixels.length; i += step * sampleStep) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const rgb: [number, number, number] = [r, g, b];

      if (isVividColor(rgb)) {
        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }
    }

    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key.split(',').map(Number));

    if (sortedColors.length === 0) {
      return NextResponse.json({ message: 'No vivid colors found', colors: [] });
    }

    return NextResponse.json({ colors: sortedColors });
  } catch (err) {
    console.error('Sharp Error:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 });
  }
}