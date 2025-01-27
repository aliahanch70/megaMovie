'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package2, Tag, Info } from 'lucide-react';

interface ProductSpecsProps {
  category: string;
  status: 'in_stock' | 'out_of_stock';
  specifications?: { 
    label: string; // fixed typo from 'lable'
    value: string 
  }[];
}

export default function ProductSpecs({ category, status, specifications }: ProductSpecsProps) {
  return (
    <Card className="p-6 hover-card-effect">
      <h2 className="text-xl font-semibold mb-4">Specifications</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Category:</span>
          <Badge variant="secondary" className="capitalize">
            {category}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Package2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={status === 'in_stock' ? 'default' : 'destructive'}>
            {status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
        {specifications && specifications.length > 0 && (
          <div className="border-t pt-4 mt-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{spec.label}:</span>
                <span>{spec.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}