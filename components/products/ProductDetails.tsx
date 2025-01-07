'use client';

import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ProductDetailsProps {
  description: string;
  features: string[];
  warranty: string;
}

export default function ProductDetails({ description, features, warranty }: ProductDetailsProps) {
  return (
    <Card className="p-6 space-y-6 hover-card-effect">
      <div>
        <h2 className="text-xl font-semibold mb-3">Product Description</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Key Features</h2>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-muted-foreground">
              <Check className="h-5 w-5 text-accent mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Warranty</h2>
        <p className="text-muted-foreground">{warranty}</p>
      </div>
    </Card>
  );
}