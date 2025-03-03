export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// تنظیمات Cloudinary با متغیرهای محیطی
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // تبدیل فایل به Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // آپلود به Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products/uploads', // ذخیره توی پوشه مشخص توی Cloudinary
          public_id: `${Date.now()}-${Math.random().toString(36).substring(2)}`, // نام منحصربه‌فرد
          resource_type: 'auto', // نوع فایل رو خودکار تشخیص بده
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as { secure_url: string });
          else reject(new Error('Upload failed with no result'));
        }
      );
      uploadStream.end(buffer);
    });

    // بازگرداندن URL فایل آپلود شده
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}