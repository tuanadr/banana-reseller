import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { login } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) { // Plaintext password check for MVP as requested implicitly by "Login/Register" task speed
            // Note: In prod, use bcrypt!
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return await login(user.id);
    } catch (e) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
