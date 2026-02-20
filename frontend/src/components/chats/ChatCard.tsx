"use client";

import { MessageSquare, Phone, ThumbsUp, ThumbsDown } from "lucide-react";
import { Box, Flex, Text, Icon, Badge } from "@chakra-ui/react";

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
    const sentimentColor = isPositive ? "green.500" : "red.500";
    const sentimentBg = isPositive ? "green.50" : "red.50";

    return (
        <Box
            bg="white"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            _hover={{ shadow: "md" }}
            transition="box-shadow 0.2s"
        >
            <Flex gap={4} align="flex-start">
                <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg="brand.50"
                    align="center"
                    justify="center"
                    flexShrink={0}
                    color="brand.500"
                >
                    <Icon as={chat.source === "whatsapp" ? Phone : MessageSquare} boxSize={5} />
                </Flex>

                <Box flex={1}>
                    <Flex justify="space-between" align="center" mb={1}>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                            {chat.sender_id}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <Text as="span" textTransform="capitalize">{chat.source}</Text>
                        </Text>
                    </Flex>
                    <Text color="gray.600" fontSize="sm" lineHeight="relaxed">
                        {chat.message}
                    </Text>
                </Box>

                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    minW="60px"
                    p={2}
                    borderRadius="md"
                    bg={sentimentBg}
                >
                    <Icon as={isPositive ? ThumbsUp : ThumbsDown} color={sentimentColor} boxSize={4} />
                    <Text fontSize="xs" fontWeight="bold" mt={1} color={sentimentColor}>
                        {chat.sentiment_score}
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
}
