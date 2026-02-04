import { NextResponse } from 'next/server';
import { dispatcher } from '@/lib/dispatcher';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, model, userId } = body;

        // TODO: Authenticate user properly
        // For now, assume a userId is passed or use a test user
        // We create a dummy user if not exists for testing MVP
        let user = await prisma.user.findFirst({ where: { email: 'demo@banana.com' } });
        if (!user) {
            user = await prisma.user.create({
                data: { email: 'demo@banana.com', password: 'hash', creditBalance: 10000 }
            });
        }

        // Check Balance
        if (user.creditBalance < 500) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        // Submit Task
        const task = await dispatcher.submitTask(user.id, {
            prompt,
            model: model || 'banana-default'
        });

        // Deduct Credit (Optimistic)
        await prisma.user.update({
            where: { id: user.id },
            data: { creditBalance: { decrement: 500 } }
        });

        return NextResponse.json(task);

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
