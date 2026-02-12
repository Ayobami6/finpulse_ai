"use client";

import { useState, useEffect } from "react";
import IssueClusterList from "@/components/dashboard/IssueClusterList";
import { AlertOctagon } from "lucide-react";
import axios from "axios";

const MOCK_ISSUES = [
    { id: 1, theme: "Transfer Failed", frequency: 120, trend: "UP", sentiment_score: -0.8, actions: [{ id: 1, summary: "Fix API timeout" }] },
    { id: 2, theme: "Loan Rejected", frequency: 85, trend: "DOWN", sentiment_score: -0.6, actions: [{ id: 2, summary: "Clarify rejection reasons" }] },
    { id: 3, theme: "Account Blocked", frequency: 45, trend: "STABLE", sentiment_score: -0.9, actions: [{ id: 3, summary: "Review fraud rules" }] },
    { id: 4, theme: "OTP Not Received", frequency: 32, trend: "UP", sentiment_score: -0.7, actions: [{ id: 4, summary: "Check SMS gateway logs" }] },
] as any[];

export default function IssuesPage() {
    const [issues, setIssues] = useState<any[]>([]);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await axios.get(`${apiUrl}/clusters/`);
                setIssues(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching issues:", error);
                setIssues(MOCK_ISSUES);
            }
        };

        fetchIssues();
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="heading-xl">Detected Issues</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        AI-clustered problems from customer chats and system logs.
                    </p>
                </div>
                <div style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "var(--accent)",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 600
                }}>
                    <AlertOctagon size={20} />
                    {issues.length} Active Clusters
                </div>
            </div>

            <div className="card">
                <IssueClusterList clusters={issues} />
            </div>
        </div>
    );
}
