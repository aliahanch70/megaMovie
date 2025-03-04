'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package2, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductSpecsProps {
  category: string;
  status: 'in_stock' | 'out_of_stock';
  specifications?: { 
    label: string;
    value: string 
  }[];
}

export default function ProductSpecs({ category, status, specifications }: ProductSpecsProps) {
  return (
    <Card className="p-6  ">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">Specifications</h2>
        {specifications && specifications.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                More Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-4">
                  Full Specifications
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="grid grid-cols-1 gap-4">
                  {specifications.map((spec, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800"
                    >
                      <div className="font-medium text-gray-400">{spec.label}</div>
                      <div className="col-span-2 text-gray-100">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
            {specifications.slice(0, 3).map((spec, index) => (
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