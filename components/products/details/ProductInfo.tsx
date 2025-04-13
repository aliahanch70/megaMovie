'use client';

import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';

interface ProductInfoProps {
  description: string;
  category: string;
  
  createdAt: string;
}

export default function ProductInfo({ 
  description, 
  category,
}: ProductInfoProps) {
  
  return (
    <Card className="p-6 space-y-6  ">
      <div>
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">{description}</p>
      </div>
      
      
    </Card>
  );
}