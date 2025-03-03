import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const viewsFile = path.join(process.cwd(), 'view.json');
    const viewsData = await fs.readFile(viewsFile, 'utf8');
    const views = JSON.parse(viewsData);
    
    return NextResponse.json(views);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 });
  }
}
