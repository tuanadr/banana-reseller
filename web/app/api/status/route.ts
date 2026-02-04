import { NextResponse } from 'next/server';
import { dispatcher } from '@/lib/dispatcher';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    // Note: In App Router, searching by ID usually requires dynamic route structure /api/status/[id]
    // But since this file is likely at /api/status/route.ts, it handles /api/status?id=...
    // Let's assume usage of query param for simplicity or create [id] folder.
    // The user might prefer /api/status/[id]. I will implement [id] folder structure.
    return NextResponse.json({ error: "Use /api/status/[id]" });
}
