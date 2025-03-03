import { NextResponse } from 'next/server';
import { trackProductView } from '@/lib/utils/viewTracker';

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    
    await trackProductView({
      productId: productData.productId,
      productName: productData.productName,
      price: productData.price,
      category: productData.category,
      viewedAt: new Date().toISOString(),
      imageUrl: productData.imageUrl
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track-view API:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
