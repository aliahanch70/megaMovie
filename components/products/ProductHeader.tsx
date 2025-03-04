'use client';

import { Card } from '@/components/ui/card';

interface ProductHeaderProps {
  name: string;
  price: number;
}

export default function ProductHeader({ name, price }: ProductHeaderProps) {
  return (
    <Card className="p-6  ">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold gradient-text">{name}</h1>
        <div className="text-2xl font-bold text-accent">
          ${price.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}