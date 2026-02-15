"use client";

interface CustomerSegment {
    id: number;
    name: string;
    description: string;
    sentiment_score: number; // 0-5 scale for UI mock
    complaints_count: number;
}

interface CustomerSegmentListProps {
    segments: CustomerSegment[];
}

export default function CustomerSegmentList({ segments }: CustomerSegmentListProps) {
    return (
        <div className="flex flex-col gap-3">
            {segments.map((segment) => {
                const sentimentColor = segment.sentiment_score < 2.5 ? "text-red-500" : segment.sentiment_score < 3.5 ? "text-orange-500" : "text-emerald-500";
                const bgClass = segment.sentiment_score < 2.5 ? "bg-red-50" : segment.sentiment_score < 3.5 ? "bg-orange-50" : "bg-emerald-50";

                return (
                    <div key={segment.id} className={`${bgClass} rounded-lg p-4 flex justify-between items-center`}>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{segment.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{segment.description}</p>
                        </div>
                        <div className="text-right">
                            <div className={`font-bold text-lg ${sentimentColor}`}>
                                {segment.sentiment_score.toFixed(1)}/5
                            </div>
                            <div className="text-xs text-gray-500">
                                <span className={sentimentColor}>Sentiment</span> • {segment.complaints_count} Complaints
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
