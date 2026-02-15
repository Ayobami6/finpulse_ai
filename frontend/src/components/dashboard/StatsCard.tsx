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
    <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="p-2 bg-gray-50 rounded-full text-gray-400">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`text-xs font-semibold flex items-center gap-1 ${trendDirection === "up" ? "text-emerald-600" : trendDirection === "down" ? "text-red-500" : "text-gray-500"
          }`}>
          {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→"}
          <span className="font-medium ml-1">{trend}</span>
        </div>
      )}
    </div>
  );
}
