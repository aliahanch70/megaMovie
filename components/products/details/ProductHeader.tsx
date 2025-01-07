'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/format';

interface ProductHeaderProps {
  name: string;
  price: number;
  status: 'in_stock' | 'out_of_stock';
}

export default function ProductHeader({ name, price, status }: ProductHeaderProps) {
  return (
    <Card className="p-6 hover-card-effect">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold gradient-text">{name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-accent">
            {formatPrice(price)}
          </span>
          <Badge variant={status === 'in_stock' ? 'default' : 'destructive'}>
            {status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}