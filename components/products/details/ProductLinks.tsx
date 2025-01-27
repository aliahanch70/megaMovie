'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ProductLink {
  title: string;
  url: string;
  price: number;
  city: string;
  warranty: string;
}

interface ProductLinksProps {
  links: ProductLink[];
}

export default function ProductLinks({ links }: ProductLinksProps) {
  console.log('Links data:', links); // Add this line to debug

  return (
    <>
    <Card className="p-8 hover-card-effect"> {/* Increased padding from p-6 to p-8 */}
      <h2 className="text-2xl font-semibold mb-6">External Links</h2> {/* Increased text size and margin bottom */}
      <div className="space-y-4"> {/* Increased space between buttons from space-y-2 to space-y-4 */}
        {links.map((link, index) => {
          console.log('Individual link:', link); // Add this line to debug
          return (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between py-6" 
              asChild
            >
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-lg justify-between w-full"
              >
                <div className="flex flex-col">
                  <span>{link.title} - ${Number(link.price).toFixed(2)}</span>
                  <span className="text-sm text-gray-500">
                    {link.city} • {link.warranty}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          );
        })}
      </div>
    </Card>
    </>
  );
}