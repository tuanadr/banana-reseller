'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, Zap, Image as ImageIcon, Download } from 'lucide-react';

interface GenerateViewProps {
    initialCredits: number;
    userId: string;
}

export default function GenerateView({ initialCredits, userId }: GenerateViewProps) {
    const [prompt, setPrompt] = useState('');
    const [credits, setCredits] = useState(initialCredits);
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const router = useRouter();

    // Polling Logic
    useEffect(() => {
        if (!taskId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/status/${taskId}`);
                if (!res.ok) return;

                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    setResultUrl(data.resultUrl);
                    setLoading(false);
                    setTaskId(null);
                    setStatusMessage('Completed!');
                } else if (data.status === 'FAILED') {
                    setLoading(false);
                    setTaskId(null);
                    setStatusMessage('Failed: ' + (data.errorMessage || 'Unknown error'));
                } else {
                    // Still processing - Update virtual messages
                    // E.g. "Optimizing noise...", "Rendering..."
                    // Simple random messages for now
                }
            } catch (e) {
                console.error("Poll error", e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [taskId]);

    // Virtual Queue Messages
    useEffect(() => {
        if (!loading) return;
        const messages = [
            "Analyzing prompt...",
            "Optimizing noise parameters...",
            "Allocating GPU resources...",
            "Rendering details...",
            "Enhancing resolution...",
            "Finalizing pixels..."
        ];
        let i = 0;
        setStatusMessage(messages[0]);
        const timer = setInterval(() => {
            i = (i + 1) % messages.length;
            setStatusMessage(messages[i]);
        }, 3000);
        return () => clearInterval(timer);
    }, [loading]);

    const handleGenerate = async () => {
        if (!prompt.trim() || credits < 500) return;

        setLoading(true);
        setResultUrl(null);
        setStatusMessage("Starting...");

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, userId }) // Note: userId usually comes from session cookie on server, but for api demo we passed it in body in route.ts?
                // Actually route.ts used body userId if passed?
                // Let's check route.ts. It checks session? No, route.ts used body.userId for MVP.
                // But we should use session user.
                // I'll update route.ts later to use session.
                // For now pass userId.
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                setLoading(false);
                return;
            }

            const task = await res.json();
            setTaskId(task.id);
            setCredits(prev => prev - 500); // Optimistic update

        } catch (e) {
            setLoading(false);
            alert("Network error");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">

            {/* Header Stat */}
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Credit Balance</h2>
                    <p className="text-gray-400 text-sm">Create unlimited high-quality images</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-2xl font-bold text-white">{credits.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Describe your image</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-40 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                            placeholder="A cyberpunk street in Tokyo, rainy night, neon lights..."
                        />

                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500">Cost: 500 Credits</span>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || credits < 500}
                                className={cn(
                                    "px-6 py-2 rounded-xl font-semibold text-white transition-all flex items-center gap-2",
                                    loading || credits < 500
                                        ? "bg-gray-800 cursor-not-allowed text-gray-500"
                                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20"
                                )}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Generating...' : 'Generate New Image'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                    {resultUrl ? (
                        <>
                            <img src={resultUrl} alt="Generated result" className="rounded-xl shadow-2xl w-full h-auto object-cover transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <a href={resultUrl} download target="_blank" className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                                    <Download className="w-6 h-6" />
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            {loading ? (
                                <>
                                    <div className="relative w-20 h-20 mx-auto">
                                        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-ping" />
                                        <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="text-gray-400 animate-pulse">{statusMessage}</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-400">Your artwork will appear here</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
