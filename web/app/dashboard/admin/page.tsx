'use client';

import { useState, useEffect } from 'react';

interface Account {
    id: string;
    name: string;
    type: string;
    status: string;
    totalUsage: number;
    errorCount: number;
}

export default function AdminPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [form, setForm] = useState({
        name: '',
        apiKey: '',
        type: 'UNLIMITED',
        proxyUrl: '',
        concurrencyLimit: 6
    });

    const fetchAccounts = async () => {
        const res = await fetch('/api/admin/accounts');
        if (res.ok) setAccounts(await res.json());
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        fetchAccounts();
        setForm({ ...form, name: '', apiKey: '' });
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-8">Provider Accounts</h1>

            {/* Add Form */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Account</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <input
                        placeholder="Account Name"
                        className="bg-gray-800 p-3 rounded"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                        placeholder="API Key (Gommo)"
                        className="bg-gray-800 p-3 rounded"
                        value={form.apiKey}
                        onChange={e => setForm({ ...form, apiKey: e.target.value })}
                    />
                    <select
                        className="bg-gray-800 p-3 rounded"
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                    >
                        <option value="UNLIMITED">UNLIMITED (Monthly)</option>
                        <option value="PAY_AS_YOU_GO">PAY AS YOU GO</option>
                    </select>
                    <input
                        placeholder="Proxy URL (Optional)"
                        className="bg-gray-800 p-3 rounded"
                        value={form.proxyUrl}
                        onChange={e => setForm({ ...form, proxyUrl: e.target.value })}
                    />
                    <button className="col-span-2 bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">
                        Add Account
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Usage</th>
                            <th className="p-4">Errors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id} className="border-t border-gray-800">
                                <td className="p-4">{acc.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${acc.type === 'UNLIMITED' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {acc.type}
                                    </span>
                                </td>
                                <td className="p-4">{acc.status}</td>
                                <td className="p-4">{acc.totalUsage}</td>
                                <td className="p-4 text-red-400">{acc.errorCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
