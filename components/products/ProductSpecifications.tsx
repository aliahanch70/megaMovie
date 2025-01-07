'use client';

import { Card } from '@/components/ui/card';

interface Specifications {
  dimensions: string;
  weight: string;
  materials: string[];
  variations: string[];
  technical: {
    [key: string]: string;
  };
  origin: string;
}

interface ProductSpecificationsProps {
  specs: Specifications;
}

export default function ProductSpecifications({ specs }: ProductSpecificationsProps) {
  return (
    <Card className="p-6 hover-card-effect">
      <h2 className="text-xl font-semibold mb-6">Technical Specifications</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-muted-foreground">Dimensions</div>
          <div>{specs.dimensions}</div>
          
          <div className="text-muted-foreground">Weight</div>
          <div>{specs.weight}</div>
          
          <div className="text-muted-foreground">Materials</div>
          <div>{specs.materials.join(', ')}</div>
          
          <div className="text-muted-foreground">Available Colors</div>
          <div>{specs.variations.join(', ')}</div>
          
          <div className="text-muted-foreground">Country of Origin</div>
          <div>{specs.origin}</div>
        </div>
        
        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-medium mb-4">Technical Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(specs.technical).map(([key, value]) => (
              <div key={key} className="contents">
                <div className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}