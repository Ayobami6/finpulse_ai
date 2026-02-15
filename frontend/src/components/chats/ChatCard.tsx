"use client";

import { MessageSquare, ThumbsUp, ThumbsDown, Phone } from "lucide-react";
import clsx from "clsx";

export interface Chat {
    id: number;
    source: string;
    sender_id: string;
    message: string;
    sentiment_score: number;
    timestamp: string;
}

interface ChatCardProps {
    chat: Chat;
}

export default function ChatCard({ chat }: ChatCardProps) {
    const isPositive = chat.sentiment_score > 0;
    const sentimentColor = isPositive ? "text-emerald-500" : "text-red-500";
    const sentimentBg = isPositive ? "bg-emerald-50" : "bg-red-50";

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-500">
                {chat.source === "whatsapp" ? <Phone size={18} /> : <MessageSquare size={18} />}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{chat.sender_id}</h4>
                    <span className="text-xs text-gray-400">
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className="capitalize">{chat.source}</span>
                    </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{chat.message}</p>
            </div>

            <div className={clsx("flex flex-col items-center justify-center min-w-[60px] p-2 rounded-md", sentimentBg)}>
                {isPositive ? (
                    <ThumbsUp size={16} className={sentimentColor} />
                ) : (
                    <ThumbsDown size={16} className={sentimentColor} />
                )}
                <span className={clsx("text-xs font-bold mt-1", sentimentColor)}>
                    {chat.sentiment_score}
                </span>
            </div>
        </div>
    );
}
