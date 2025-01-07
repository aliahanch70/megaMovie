'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package2, Tag } from 'lucide-react';

interface ProductSpecsProps {
  category: string;
  status: 'in_stock' | 'out_of_stock';
}

export default function ProductSpecs({ category, status }: ProductSpecsProps) {
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
          <Badge 
            variant={status === 'in_stock' ? 'default' : 'destructive'}
          >
            {status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}