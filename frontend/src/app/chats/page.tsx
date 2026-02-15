"use client";

import { useState, useEffect } from "react";
import ChatCard, { Chat } from "@/components/chats/ChatCard";
import { MessageSquare, RefreshCw } from "lucide-react";
import axios from "axios";

const MOCK_CHATS: Chat[] = [
    { id: 1, source: "whatsapp", sender_id: "+123456789", message: "My transfer failed again! Fix this now.", sentiment_score: -0.9, timestamp: "2023-10-27T10:00:00Z" },
    { id: 2, source: "freshchat", sender_id: "user@example.com", message: "How do I reset my password?", sentiment_score: 0.1, timestamp: "2023-10-27T10:05:00Z" },
    { id: 3, source: "whatsapp", sender_id: "+987654321", message: "Great service, thanks!", sentiment_score: 0.8, timestamp: "2023-10-27T10:10:00Z" },
    { id: 4, source: "whatsapp", sender_id: "+1122334455", message: "Why is my account blocked?", sentiment_score: -0.7, timestamp: "2023-10-27T10:15:00Z" },
    { id: 5, source: "freshchat", sender_id: "vip@business.com", message: "We are unable to process bulk payments. Please assist immediately.", sentiment_score: -0.8, timestamp: "2023-10-27T10:20:00Z" },
    { id: 6, source: "whatsapp", sender_id: "+447700900000", message: "Is the app down? I can't login.", sentiment_score: -0.5, timestamp: "2023-10-27T10:25:00Z" },
];

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                // const response = await axios.get(`${apiUrl}/chats/`);
                // setChats(response.data.results || response.data);
                await new Promise(resolve => setTimeout(resolve, 800));
                setChats(MOCK_CHATS);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
                setChats(MOCK_CHATS);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen text-gray-500">Loading Chats...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Customer Chats</h1>
                    <p className="text-gray-500 mt-1">Real-time feed from WhatsApp and Freshchat.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="space-y-3">
                {chats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} />
                ))}
            </div>
        </div>
    );
}
