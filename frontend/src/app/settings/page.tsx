"use client";

import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <h1 className="heading-xl" style={{ marginBottom: "2rem" }}>Settings</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                {/* Team Management */}
                <div className="card">
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>Team Management</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                        Manage access for Product, Engineering, and Ops team members.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {["alice@finpulse.com (Product)", "bob@finpulse.com (Engineering)", "charlie@finpulse.com (Ops)"].map((member, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem",
                                backgroundColor: "rgba(255,255,255,0.02)",
                                borderRadius: "8px"
                            }}>
                                <span>{member}</span>
                                <button style={{ color: "var(--error)", background: "none", border: "none", cursor: "pointer" }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button style={{
                        marginTop: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--accent)",
                        background: "none",
                        border: "1px dashed var(--accent)",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        width: "100%",
                        justifyContent: "center",
                        cursor: "pointer"
                    }}>
                        <Plus size={18} /> Add Team Member
                    </button>
                </div>

                {/* Integrations */}
                <div className="card">
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>Data Integrations</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>WhatsApp Business API</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Active • Last synced 2m ago</div>
                            </div>
                            <div style={{ color: "var(--success)", fontWeight: 600 }}>Connected</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Freshchat</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Active • Last synced 5m ago</div>
                            </div>
                            <div style={{ color: "var(--success)", fontWeight: 600 }}>Connected</div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="card">
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>Notification Preferences</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <input type="checkbox" defaultChecked id="email-alerts" style={{ accentColor: "var(--accent)" }} />
                        <label htmlFor="email-alerts">Email alerts for High Severity issues</label>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" defaultChecked id="slack-alerts" style={{ accentColor: "var(--accent)" }} />
                        <label htmlFor="slack-alerts">Slack notifications for new clusters</label>
                    </div>

                    <button style={{
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        fontWeight: 600,
                        marginTop: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        alignSelf: "flex-start"
                    }}>
                        <Save size={18} /> Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
