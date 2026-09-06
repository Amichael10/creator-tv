import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'tv', 'index.html');
    const html = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[TV Route] Failed to load TV index.html:', err);
    return new NextResponse('CreatorTV Client Not Found', { status: 404 });
  }
}
