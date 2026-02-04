import { NextResponse } from 'next/server';
import { dispatcher } from '@/lib/dispatcher';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;
        const task = await dispatcher.checkTaskStatus(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
