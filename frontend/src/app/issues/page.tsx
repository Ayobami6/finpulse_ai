"use client";

import { useState, useEffect } from "react";
import IssueClusterList from "@/components/dashboard/IssueClusterList";
import { AlertOctagon, Filter } from "lucide-react";
import axios from "axios";

const MOCK_ISSUES = [
    {
        id: 1,
        theme: "Transfer Failed",
        severity: "Critical",
        frequency: 284,
        trend: "UP",
        trendValue: "45%",
        sentiment_score: 1.8,
        correlation_detail: "72% correlation with /api/transfer 500 errors. Peak failures at 2:30 PM daily.",
        root_cause_analysis: "API timeout issues during peak hours. Database connection pool exhaustion.",
        actions: [{ id: 1, summary: "Fix API timeout" }]
    },
    {
        id: 2,
        theme: "Loan Rejected",
        severity: "High",
        frequency: 156,
        trend: "UP",
        trendValue: "28%",
        sentiment_score: 2.5,
        correlation_detail: "Customers confused about rejection reasons. Poor messaging clarity.",
        root_cause_analysis: "Generic rejection messages. No clear next steps provided to customers.",
        actions: [{ id: 2, summary: "Clarify rejection reasons" }]
    },
    {
        id: 3,
        theme: "Account Blocked",
        severity: "Medium",
        frequency: 89,
        trend: "DOWN",
        trendValue: "12%",
        sentiment_score: 2.1,
        correlation_detail: "Fraud detection system too aggressive. False positives increasing.",
        root_cause_analysis: "Overly strict fraud rules. Manual review queue backlog of 48+ hours.",
        actions: [{ id: 3, summary: "Review fraud rules" }]
    },
    {
        id: 4,
        theme: "OTP Not Received",
        severity: "High",
        frequency: 45,
        trend: "STABLE",
        trendValue: "0%",
        sentiment_score: 1.5,
        correlation_detail: "SMS Gateway latency spikes observed in region ap-south-1.",
        root_cause_analysis: "Vendor outage affecting OTP delivery.",
        actions: [{ id: 4, summary: "Switch SMS Vendor" }]
    },
] as any[];

export default function IssuesPage() {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                // const response = await axios.get(`${apiUrl}/clusters/`);
                // setIssues(response.data.results || response.data);
                await new Promise(resolve => setTimeout(resolve, 600));
                setIssues(MOCK_ISSUES);
            } catch (error) {
                console.error("Error fetching issues:", error);
                setIssues(MOCK_ISSUES);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen text-gray-500">Loading Issues...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Detected Issues</h1>
                    <p className="text-gray-500 mt-1">
                        AI-clustered problems from customer chats and system logs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold text-sm">
                        <AlertOctagon size={18} />
                        {issues.length} Active Clusters
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                <IssueClusterList clusters={issues} />
            </div>
        </div>
    );
}
