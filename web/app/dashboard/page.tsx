import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import GenerateView from '@/components/dashboard/generate-view';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
        redirect('/login');
    }

    // Decode session (base64)
    const userId = Buffer.from(session.value, 'base64').toString('utf-8');

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        // Invalid session
        redirect('/login');
    }

    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {user.email}</p>
            </header>

            <GenerateView initialCredits={user.creditBalance} userId={user.id} />
        </div>
    );
}
