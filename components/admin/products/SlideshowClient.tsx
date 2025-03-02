'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Slide {
  id: string;
  imageUrl: string;
  title: string;
}

export default function SlideshowClient({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[500px]">
      <div className="relative w-full h-full">
        {slides.length > 0 && (
          <Image
            src={slides[currentIndex].imageUrl}
            alt={slides[currentIndex].title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={previousSlide}
          className="px-4 py-2 bg-black/50 text-white rounded"
        >
          Previous
        </button>
        <button
          onClick={nextSlide}
          className="px-4 py-2 bg-black/50 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
