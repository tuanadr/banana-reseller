import { NextRequest, NextResponse } from 'next/server';

export async function login(userId: string) {
    // In a real app, use a JWT library like 'jose' or 'jsonwebtoken'
    // For MVP, we set a simple cookie with User ID (NOT SECURE FOR PROD without signature)
    // We will assume "secure enough" for MVP or use a basic signature.
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = userId; // In prod, encrypt this!

    // Let's at least base64 encode it
    const encoded = Buffer.from(session).toString('base64');

    const res = NextResponse.json({ success: true });
    res.cookies.set('session', encoded, { expires, httpOnly: true });
    return res;
}

export async function logout() {
    const res = NextResponse.json({ success: true });
    res.cookies.delete('session');
    return res;
}

export async function getSession(req: NextRequest) {
    const session = req.cookies.get('session')?.value;
    if (!session) return null;
    try {
        return Buffer.from(session, 'base64').toString('utf-8');
    } catch (e) { return null; }
}
