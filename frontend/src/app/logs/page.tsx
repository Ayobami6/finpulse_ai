export default function LogsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                <p className="text-gray-500 mt-1">Real-time log aggregation and analysis.</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-gray-500 mb-4">Log aggregation and analysis will appear here.</p>
                <div className="h-96 w-full rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-300 overflow-y-auto">
                    <div className="flex gap-2"><span className="text-gray-500">[2026-02-13 10:00:01]</span> <span className="text-blue-400">INFO:</span> Service started...</div>
                    <div className="flex gap-2"><span className="text-gray-500">[2026-02-13 10:05:23]</span> <span className="text-red-400">ERROR:</span> Connection timeout</div>
                </div>
            </div>
        </div>
    );
}
