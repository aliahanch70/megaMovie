'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';

interface Product {
  name: string;
  price: number;
  description: string;
  category: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-3xl font-bold gradient-text mb-4">{product.name}</h1>
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold text-accent">
            ${product.price.toLocaleString()}
          </span>
          <Badge variant={product.status === 'in_stock' ? 'default' : 'destructive'}>
            {product.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-6">{product.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Category</span>
            <p className="font-medium capitalize">{product.category}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Listed By</span>
            <p className="font-medium">{product.profiles.full_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Listed On</span>
            <p className="font-medium">{formatDate(product.created_at)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}