"use client";

import { AlertTriangle, Clock, ArrowRight, TrendingUp, BarChart2 } from "lucide-react";
import clsx from "clsx";

interface Action {
    id: number;
    summary: string;
}

interface IssueCluster {
    id: number;
    theme: string;
    description: string;
    frequency: number;
    trend: "UP" | "DOWN" | "STABLE";
    trendValue?: string; // e.g. "45%"
    sentiment_score: number;
    correlation_detail: string; // e.g. "72% correlation with /api/transfer 500 errors"
    root_cause_analysis: string;
    actions: Action[];
    severity: "Critical" | "High" | "Medium" | "Low";
}

interface IssueCardProps {
    cluster: IssueCluster;
}

export default function IssueCard({ cluster }: IssueCardProps) {
    const severityColors = {
        Critical: "bg-red-100 text-red-700",
        High: "bg-orange-100 text-orange-700",
        Medium: "bg-yellow-100 text-yellow-700",
        Low: "bg-blue-100 text-blue-700",
    };

    const sentimentColor = cluster.sentiment_score < -0.5 ? "text-red-500" : cluster.sentiment_score < 0 ? "text-yellow-500" : "text-emerald-500";

    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{cluster.theme}</h3>
                    <span className={clsx("px-2 py-0.5 rounded text-xs font-semibold", severityColors[cluster.severity])}>
                        {cluster.severity}
                    </span>
                    {cluster.trend === "UP" && (
                        <div className="flex items-center text-red-500 text-sm font-medium">
                            <TrendingUp size={14} className="mr-1" />
                            <span>↑ {cluster.trendValue || "Rising"}</span>
                        </div>
                    )}
                    {cluster.trend === "DOWN" && (
                        <div className="flex items-center text-emerald-500 text-sm font-medium">
                            <TrendingUp size={14} className="mr-1 rotate-180" />
                            <span>↓ {cluster.trendValue || "Falling"}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

            {/* Correlation Detail */ }
    <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
        <p>{cluster.correlation_detail || "Analyzing correlation data..."}</p>
    </div>


    {/* Stats Row */ }
            <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                    <BarChart2 size={16} className="text-blue-500" />
                    <span>{cluster.frequency} complaints</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={clsx("font-medium", sentimentColor)}>Sentiment: {cluster.sentiment_score.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>Last 7 days</span>
                </div>
            </div>

            <div className="border-t border-gray-100 my-4"></div>

    {/* Root Cause */ }
    <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Root Cause:</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
            {cluster.root_cause_analysis || "No root cause identified yet."}
        </p>
    </div>

    {/* Actions */ }
    <div className="flex gap-3 mt-4">
        <button className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded border border-gray-200 hover:bg-gray-100 transition-colors">
            View Details
        </button>
        <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded border border-emerald-100 hover:bg-emerald-100 transition-colors">
            Create Ticket
        </button>
        <button className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-medium rounded border border-purple-100 hover:bg-purple-100 transition-colors">
            Send Alert
        </button>
    </div>
        </div >
    );
}
