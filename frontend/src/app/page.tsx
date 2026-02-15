"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import IssueTrendChart from "@/components/dashboard/IssueTrendChart";
import ComponentImpactChart from "@/components/dashboard/ComponentImpactChart";
import IssueClusterList from "@/components/dashboard/IssueClusterList";
import CustomerSegmentList from "@/components/dashboard/CustomerSegmentList";
import { AlertTriangle, TrendingUp, Users, Activity, Zap, Meh } from "lucide-react";
import axios from "axios";

// Mock data for initial render
const MOCK_DATA = {
    stats: {
        active_issues: { value: 23, trend: "5 from last week", direction: "up" },
        avg_sentiment: { value: "2.8/5", trend: "Below target (3.5)", direction: "down" },
        system_errors: { value: 147, trend: "23% vs yesterday", direction: "up" },
        auto_actions: { value: 12, trend: "Tickets created today", direction: "neutral" }
    },
    top_issues: [
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
    ],
    chart_data: [
        { name: 'Day 1', value: 45 },
        { name: 'Day 5', value: 52 },
        { name: 'Day 10', value: 48 },
        { name: 'Day 15', value: 65 },
        { name: 'Day 20', value: 78 },
        { name: 'Day 25', value: 95 },
        { name: 'Day 30', value: 120 },
    ],
    component_impact: [
        { name: '/api/transfer', value: 145 },
        { name: '/api/loan', value: 89 },
        { name: '/api/auth', value: 56 },
        { name: '/api/account', value: 42 },
        { name: 'Database', value: 35 },
    ],
    customer_segments: [
        { id: 1, name: "High-Value Business Accounts", description: "Avg transaction: $50K+", sentiment_score: 1.9, complaints_count: 127 },
        { id: 2, name: "First-Time Loan Applicants", description: "New to platform", sentiment_score: 2.4, complaints_count: 94 },
        { id: 3, name: "International Transfer Users", description: "Cross-border transactions", sentiment_score: 2.7, complaints_count: 68 },
    ]
};

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In production, we would use real API
                // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                // const response = await axios.get(`${apiUrl}/dashboard/executive_summary/`);
                // setData(response.data);

                // For UI dev, use Mock Data
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
                setData(MOCK_DATA);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setData(MOCK_DATA);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-gray-500">Loading Dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
                <p className="text-gray-500 mt-1">Real-time insights across support, product, and engineering</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Issues"
                    value={data.stats.active_issues.value}
                    icon={<AlertTriangle className="text-red-500" />}
                    trend={data.stats.active_issues.trend}
                    trendDirection={data.stats.active_issues.direction as any}
                />
                <StatsCard
                    title="Avg Sentiment"
                    value={data.stats.avg_sentiment.value}
                    icon={<Meh className="text-orange-500" />}
                    trend={data.stats.avg_sentiment.trend}
                    trendDirection={data.stats.avg_sentiment.direction as any}
                />
                <StatsCard
                    title="System Errors"
                    value={data.stats.system_errors.value}
                    icon={<Activity className="text-blue-500" />}
                    trend={data.stats.system_errors.trend}
                    trendDirection={data.stats.system_errors.direction as any}
                />
                <StatsCard
                    title="Auto Actions"
                    value={data.stats.auto_actions.value}
                    icon={<Zap className="text-yellow-500" />}
                    trend={data.stats.auto_actions.trend}
                    trendDirection={data.stats.auto_actions.direction as any}
                />
            </div>

            {/* Top 5 Issues */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} /> Top 5 Issues This Week
                    </h2>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        View All Issues
                    </button>
                </div>
                <IssueClusterList clusters={data.top_issues} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-gray-400" /> Issue Trends (Last 30 Days)
                    </h2>
                    <IssueTrendChart data={data.chart_data} />
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-gray-400" /> Most Affected Components
                    </h2>
                    <ComponentImpactChart data={data.component_impact} />
                </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users size={20} className="text-orange-500" /> Most Affected Customer Segments
                </h2>
                <CustomerSegmentList segments={data.customer_segments} />
            </div>
        </div>
    );
}
