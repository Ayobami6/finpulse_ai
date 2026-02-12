"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

interface Action {
    id: number;
    summary: string;
}

interface IssueCluster {
    id: number;
    theme: string;
    frequency: number;
    trend: "UP" | "DOWN" | "STABLE";
    sentiment_score: number;
    actions: Action[];
}

interface IssueClusterListProps {
    clusters: IssueCluster[];
}

export default function IssueClusterList({ clusters }: IssueClusterListProps) {
    if (!clusters || clusters.length === 0) {
        return <div className="text-secondary">No issues detected.</div>
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {clusters.map((cluster) => (
                <div key={cluster.id} style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <AlertTriangle size={18} className="text-warning" />
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cluster.theme}</span>
                        </div>
                        <span style={{
                            fontSize: "0.75rem",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: cluster.trend === 'UP' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: cluster.trend === 'UP' ? 'var(--error)' : 'var(--success)'
                        }}>
                            {cluster.frequency} occurrences
                        </span>
                    </div>

                    {cluster.actions && cluster.actions.length > 0 && (
                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                            <strong>Recommended Action:</strong> {cluster.actions[0].summary}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                        <button style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}>
                            View Details <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
