'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ProductLink {
  title: string;
  url: string;
}

interface ProductLinksProps {
  links: ProductLink[];
}

export default function ProductLinks({ links }: ProductLinksProps) {
  return (
    <Card className="p-6 hover-card-effect">
      <h2 className="text-xl font-semibold mb-4">External Links</h2>
      <div className="space-y-2">
        {links.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-between"
            asChild
          >
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span>{link.title}</span>
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        ))}
      </div>
    </Card>
  );
}