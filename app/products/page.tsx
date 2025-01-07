'use client';

import { useState } from 'react';
import ProductHeader from '@/components/products/ProductHeader';
import ProductGallery from '@/components/products/ProductGallery';
import ProductDetails from '@/components/products/ProductDetails';
import ProductSpecifications from '@/components/products/ProductSpecifications';

const product = {
  name: "Professional 4K Ultra HD Camera",
  images: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1000",
    "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=1000"
  ],
  url: "/products/4k-ultra-hd-camera",
  specs: {
    dimensions: "5.9 x 4.4 x 3.1 inches",
    weight: "1.5 lbs",
    materials: ["Magnesium alloy", "Polycarbonate"],
    variations: ["Black", "Silver"],
    technical: {
      resolution: "4K Ultra HD",
      sensor: "35mm Full-frame",
      iso: "100-51200",
      battery: "2000mAh Li-ion"
    },
    origin: "Japan"
  },
  description: "Experience professional-grade photography with our latest 4K Ultra HD Camera. Designed for both professional photographers and enthusiasts, this camera combines cutting-edge technology with intuitive controls to deliver exceptional image quality in any shooting condition.",
  features: [
    "Advanced 35mm full-frame sensor",
    "Real-time Eye AF tracking",
    "5-axis image stabilization",
    "Weather-sealed construction"
  ],
  warranty: "2 years limited warranty",
  price: 2499.99
};

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ProductHeader name={product.name} price={product.price} />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductGallery 
            images={product.images} 
            selected={selectedImage}
            onSelect={setSelectedImage}
          />
          <div className="space-y-8">
            <ProductDetails 
              description={product.description}
              features={product.features}
              warranty={product.warranty}
            />
            <ProductSpecifications specs={product.specs} />
          </div>
        </div>
      </div>
    </div>
  );
}