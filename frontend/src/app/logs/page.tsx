export default function LogsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Logs</h1>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-gray-500">Log aggregation and analysis will appear here.</p>
                <div className="mt-4 h-64 w-full rounded bg-gray-100 p-4 font-mono text-sm text-gray-600">
                    [2026-02-13 10:00:01] INFO: Service started...<br />
                    [2026-02-13 10:05:23] ERROR: Connection timeout<br />
                    ...
                </div>
            </div>
        </div>
    );
}
