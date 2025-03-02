'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Plus, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';


export default function AdminPage() {
  const [productCount, setProductCount] = useState(0);
  const supabase = createClientComponentClient();
  const { t } = useLanguage();

  useEffect(() => {
    const getProductCount = async () => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      if (count !== null) setProductCount(count);
    };

    getProductCount();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('admin.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/products">
            <Card className="hover-card-effect cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{t('admin.productManagement')}</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('admin.productManagement')}</p>
                <p className="text-2xl font-bold mt-2">{productCount} {t('admin.productCount')}</p>
                <Button className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('admin.addNewProduct')}
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/products/manage">
            <Card className="hover-card-effect cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{t('admin.productSettings')}</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Modify or delete existing products</p>
                <Button variant="outline" className="w-full mt-4">
                  {t('admin.productManagement')}
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/slideshow">
                        <Card className="p-6 hover:bg-gray-900 transition-colors">
                            <h2 className="text-xl font-semibold mb-2">Slideshow</h2>
                            <p className="text-gray-400">Manage homepage slideshow</p>
                        </Card>
                    </Link>
        </div>
      </div>
    </div>
  );
}