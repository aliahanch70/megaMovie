// app/api/videos/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const videosDir = path.join(process.cwd(), 'public', 'short');
  try {
    const files = fs.readdirSync(videosDir).filter((file) =>
      ['.mp4', '.webm', '.ogg'].includes(path.extname(file).toLowerCase())
    );
    const videoPaths = files.map((file) => `/short/${file}`);
    return NextResponse.json(videoPaths, { status: 200 });
  } catch (error) {
    console.error('Error reading videos directory:', error);
    return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 });
  }
}