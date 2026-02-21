"use client";

import { useState, useEffect } from "react";
import ChatCard, { Chat } from "@/components/chats/ChatCard";
import { RefreshCw, MessageSquare } from "lucide-react";
import { Container, Flex, Box, Heading, Text, Button, Icon, Spinner, Center, Stack } from "@chakra-ui/react";
// import axios from "axios";

const MOCK_CHATS: Chat[] = [
    { id: 1, source: "whatsapp", sender_id: "+123456789", message: "My transfer failed again! Fix this now.", sentiment_score: -0.9, timestamp: "2023-10-27T10:00:00Z" },
    { id: 2, source: "freshchat", sender_id: "user@example.com", message: "How do I reset my password?", sentiment_score: 0.1, timestamp: "2023-10-27T10:05:00Z" },
    { id: 3, source: "whatsapp", sender_id: "+987654321", message: "Great service, thanks!", sentiment_score: 0.8, timestamp: "2023-10-27T10:10:00Z" },
    { id: 4, source: "whatsapp", sender_id: "+1122334455", message: "Why is my account blocked?", sentiment_score: -0.7, timestamp: "2023-10-27T10:15:00Z" },
    { id: 5, source: "freshchat", sender_id: "vip@business.com", message: "We are unable to process bulk payments. Please assist immediately.", sentiment_score: -0.8, timestamp: "2023-10-27T10:20:00Z" },
    { id: 6, source: "whatsapp", sender_id: "+447700900000", message: "Is the app down? I can't login.", sentiment_score: -0.5, timestamp: "2023-10-27T10:25:00Z" },
];

import api from "@/services/api";

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await api.get("/chats/");
                setChats(response.data.results || response.data);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
                setChats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    if (loading) {
        return (
            <Center h="100vh">
                <Flex align="center" gap={2} color="gray.500">
                    <Spinner size="md" />
                    <Text>Loading Chats...</Text>
                </Flex>
            </Center>
        );
    }

    return (
        <Container maxW="container.md" py={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" mb={1}>Live Customer Chats</Heading>
                    <Text color="gray.500">Real-time feed from WhatsApp and Freshchat.</Text>
                </Box>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    colorScheme="gray"
                >
                    <Icon as={RefreshCw} mr={2} boxSize={4} /> Refresh
                </Button>
            </Flex>

            <Stack spacing={3}>
                {chats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} />
                ))}
            </Stack>
        </Container>
    );
}
