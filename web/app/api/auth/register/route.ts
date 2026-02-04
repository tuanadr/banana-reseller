import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { login } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password, // Plaintext for MVP
                creditBalance: 10, // Bonus 10 credits for trial
                role: 'USER'
            }
        });

        return await login(user.id);
    } catch (e) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
