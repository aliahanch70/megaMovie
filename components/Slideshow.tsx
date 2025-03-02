'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Slide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
}

export default function Slideshow({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; // Stop the timer when hovered

    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const handleSlideClick = (link?: string) => {
    if (link) {
      router.push(link);
    }
  };

  if (!slides.length) return null;

  return (
    <div 
      className="relative h-[500px] w-full overflow-hidden rounded-lg mb-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          } ${slide.button_link ? 'cursor-pointer' : ''}`}
          style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
          onClick={() => handleSlideClick(slide.button_link)}
        >
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={slide.image_url}
              alt={slide.title}
              className={`object-cover w-full h-full transition-transform duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white p-8 relative z-20">
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl mb-6">{slide.description}</p>
                {slide.button_text && slide.button_link && (
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="relative z-30 hover:scale-105 transition-transform pointer-events-none"
                  >
                    {slide.button_text}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
