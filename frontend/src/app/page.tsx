"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import IssueTrendChart from "@/components/dashboard/IssueTrendChart";
import IssueClusterList from "@/components/dashboard/IssueClusterList";
import { AlertTriangle, TrendingUp, Users, Activity } from "lucide-react";
import axios from "axios";

// Mock data for initial render
const MOCK_DATA = {
    top_issues: [
        { id: 1, theme: "Transfer Failed", frequency: 120, trend: "UP", sentiment_score: -0.8, actions: [{id: 1, summary: "Fix API timeout"}] },
        { id: 2, theme: "Loan Rejected", frequency: 85, trend: "DOWN", sentiment_score: -0.6, actions: [{id: 2, summary: "Clarify rejection reasons"}] },
        { id: 3, theme: "Account Blocked", frequency: 45, trend: "STABLE", sentiment_score: -0.9, actions: [{id: 3, summary: "Review fraud rules"}] },
    ],
    chart_data: [
        { name: 'Mon', value: 40 },
        { name: 'Tue', value: 30 },
        { name: 'Wed', value: 20 },
        { name: 'Thu', value: 27 },
        { name: 'Fri', value: 18 },
        { name: 'Sat', value: 23 },
        { name: 'Sun', value: 34 },
    ]
};

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await axios.get(`${apiUrl}/dashboard/executive_summary/`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Fallback to mock data on error for demo purposes, or handle error UI
                setData(MOCK_DATA); 
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 className="heading-xl" style={{ marginBottom: "2rem" }}>Executive Dashboard</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                <StatsCard 
                    title="Active Issues" 
                    value="250" 
                    icon={<AlertTriangle />} 
                    trend="12%" 
                    trendDirection="up" 
                />
                <StatsCard 
                    title="Avg Resolution Time" 
                    value="42m" 
                    icon={<Activity />} 
                    trend="5%" 
                    trendDirection="down" 
                />
                 <StatsCard 
                    title="Customer Sentiment" 
                    value="-0.4" 
                    icon={<Users />} 
                    trend="2%" 
                    trendDirection="down" 
                />
                <StatsCard 
                    title="System Health" 
                    value="98%" 
                    icon={<TrendingUp />} 
                    trend="Stable" 
                    trendDirection="neutral" 
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                <div className="card">
                     <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 600 }}>Issue Trends</h2>
                     <IssueTrendChart data={data?.chart_data} />
                </div>
                <div className="card">
                    <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 600 }}>Top Issues to Fix</h2>
                    <IssueClusterList clusters={data?.top_issues} />
                </div>
            </div>
        </div>
    );
}
