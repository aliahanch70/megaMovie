import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ViewData {
  productId: string;
  productName: string;
  price: number;
  category: string;
  imageUrl?: string;
  viewedAt: string;
  ipAddress?: string;
  userId?: string;
  userRole?: string;
}

const MostViewedProducts = () => {
  const [topProducts, setTopProducts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/views'); // Adjust the endpoint if needed
        if (!res.ok) throw new Error('Failed to fetch views');
        const viewData = await res.json();

        const viewCounts = (viewData as ViewData[]).reduce((acc, cur) => {
          if (!acc[cur.productId]) {
            acc[cur.productId] = {
              ...cur,
              views: new Set([cur.ipAddress]),
            };
          } else {
            acc[cur.productId].views.add(cur.ipAddress);
          }
          return acc;
        }, {} as Record<string, any>);

        const sortedProducts = Object.values(viewCounts)
          .map(product => ({
            ...product,
            views: product.views.size,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 6);

        setTopProducts(sortedProducts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-black p-4 rounded-lg shadow-lg border border-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-white">Most Viewed Products</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {topProducts.map((product: any) => (
          <Link 
            href={`/products/${product.productId}`}
            key={product.productId}
            className="flex-shrink-0 w-36 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.productName} 
                className="w-full h-40 object-cover rounded-lg border border-gray-700"
              />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {product.views}
              </span>
            </div>
            <div className="mt-3">
              <p className="font-semibold text-white truncate">{product.productName}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-gray-400 text-sm">${product.price}</p>
                <span className="text-gray-500 text-xs">{product.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MostViewedProducts;