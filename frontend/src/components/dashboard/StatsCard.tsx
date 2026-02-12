import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export default function StatsCard({ title, value, icon, trend, trendDirection }: StatsCardProps) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>
            {title}
          </h3>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {value}
          </div>
        </div>
        <div style={{ padding: "8px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px", color: "var(--accent)" }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div style={{ 
          fontSize: "0.875rem", 
          display: "flex", 
          alignItems: "center", 
          gap: "0.25rem",
          color: trendDirection === "up" ? "var(--success)" : trendDirection === "down" ? "var(--error)" : "var(--text-secondary)" 
        }}>
          {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→"} {trend}
        </div>
      )}
    </div>
  );
}
