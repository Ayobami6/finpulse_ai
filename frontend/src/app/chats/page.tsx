"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import axios from "axios";

interface Chat {
    id: number;
    source: string;
    sender_id: string;
    message: string;
    sentiment_score: number;
    timestamp: string;
}

const MOCK_CHATS: Chat[] = [
    { id: 1, source: "whatsapp", sender_id: "+123456789", message: "My transfer failed again! Fix this now.", sentiment_score: -0.9, timestamp: "2023-10-27T10:00:00Z" },
    { id: 2, source: "freshchat", sender_id: "user@example.com", message: "How do I reset my password?", sentiment_score: 0.1, timestamp: "2023-10-27T10:05:00Z" },
    { id: 3, source: "whatsapp", sender_id: "+987654321", message: "Great service, thanks!", sentiment_score: 0.8, timestamp: "2023-10-27T10:10:00Z" },
    { id: 4, source: "whatsapp", sender_id: "+1122334455", message: "Why is my account blocked?", sentiment_score: -0.7, timestamp: "2023-10-27T10:15:00Z" },
];

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await axios.get(`${apiUrl}/chats/`);
                // Ensure we map the API response to the interface if field names match, 
                // otherwise we might need an adapter. 
                // Assuming Django DRF returns snake_case and interface keys match or we're okay with it.
                // Actually the interface `Chat` uses `sender_id` which matches Django model `sender_id`.
                // `sentiment_score` matches. `timestamp` matches.
                setChats(response.data.results || response.data);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
                setChats(MOCK_CHATS);
            }
        };

        fetchChats();
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <h1 className="heading-xl" style={{ marginBottom: "2rem" }}>Live Customer Chats</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {chats.map((chat) => (
                    <div key={chat.id} className="card" style={{ display: "flex", gap: "1rem" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                        }}>
                            <MessageSquare size={20} color="var(--text-secondary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{chat.sender_id}</span>
                                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                    {new Date(chat.timestamp).toLocaleTimeString()} • {chat.source}
                                </span>
                            </div>
                            <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{chat.message}</p>
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "60px",
                            borderLeft: "1px solid var(--border)",
                            paddingLeft: "1rem"
                        }}>
                            {chat.sentiment_score > 0 ? (
                                <ThumbsUp size={20} color="var(--success)" />
                            ) : (
                                <ThumbsDown size={20} color="var(--error)" />
                            )}
                            <span style={{
                                fontSize: "0.75rem",
                                marginTop: "4px",
                                color: chat.sentiment_score > 0 ? "var(--success)" : "var(--error)"
                            }}>
                                {chat.sentiment_score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
