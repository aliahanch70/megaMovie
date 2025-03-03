import fs from 'fs';
import path from 'path';

interface ProductView {
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

export async function trackProductView(viewData: Omit<ProductView, 'ipAddress'>) {
  try {
    // Get IP address from external service
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();
    
    const view = {
      ...viewData,
      ipAddress: ip,
      viewedAt: new Date().toISOString()
    };

    const filePath = path.join(process.cwd(), 'view.json');
    let views: ProductView[] = [];

    // Read existing views if file exists
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      views = JSON.parse(fileContent);
    }

    // Add new view
    views.push(view);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(views, null, 2));

    return true;
  } catch (error) {
    console.error('Error tracking product view:', error);
    return false;
  }
}
