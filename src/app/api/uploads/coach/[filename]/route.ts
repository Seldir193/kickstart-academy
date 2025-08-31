// app/api/uploads/coach/[filename]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { promises as fsp } from 'fs';
import path from 'path';

const UP_DIR = path.join(process.cwd(), 'uploads', 'coach');

function mimeByExt(ext: string) {
  switch (ext.toLowerCase()) {
    case '.png':  return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif':  return 'image/gif';
    default:      return 'application/octet-stream';
  }
}

export async function GET(_req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const raw = params.filename || '';
    const name = decodeURIComponent(raw);
    if (name.includes('..') || path.isAbsolute(name)) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    const filePath = path.join(UP_DIR, name);
    const buf = await fsp.readFile(filePath);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    const type = mimeByExt(path.extname(name));

    return new Response(ab, {
      headers: {
        'Content-Type': type,
        'Content-Length': String(buf.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
  }
}

