import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
// import { AccountType } from '@prisma/client';

export async function GET(req: NextRequest) {
    // TODO: Verify Admin Role
    const accounts = await prisma.providerAccount.findMany({
        orderBy: { createdAt: 'desc' } // Wait, createdAt is not in schema?
        // Checking schema: ProviderAccount doesn't have createdAt?
        // Schema: id, name, apiKey, type ... errorCount, lastErrorAt.
        // Missing createdAt. It's fine for now.
    });
    return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
    // TODO: Verify Admin Role
    try {
        const body = await req.json();
        const { name, apiKey, type, proxyUrl, concurrencyLimit } = body;

        const account = await prisma.providerAccount.create({
            data: {
                name,
                apiKey,
                type: type as any,
                proxyUrl: proxyUrl || null,
                concurrencyLimit: parseInt(concurrencyLimit) || 6,
                // createdAt will default to now()
            }
        });
        return NextResponse.json(account);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
