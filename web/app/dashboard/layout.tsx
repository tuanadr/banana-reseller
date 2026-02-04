import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-900/50 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        BananaAI
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-3 rounded-lg bg-gray-800/50 text-white hover:bg-gray-800 transition-colors">
                        Generate
                    </Link>
                    <Link href="/dashboard/history" className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                        History
                    </Link>
                    <Link href="/dashboard/billing" className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                        Buy Credits
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 mb-2">Logged in</div>
                    {/* Logout logic would go here */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
